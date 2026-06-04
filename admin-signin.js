// admin-signin.js - 签到奖励页面（使用自定义弹窗）
async function loadSigninPage() {
    const container = document.getElementById('page_signin');
    if (!container) return;
    container.innerHTML = `
        <div class="card">
            <h3><i class="fas fa-calendar-alt"></i> 每日签到奖励</h3>
            <button id="addSigninDayBtn" class="success" style="margin-bottom: 20px;"><i class="fas fa-plus"></i> Add签到日</button>
            <div id="signinRewardsDiv"></div>
        </div>
    `;
    await loadSigninRewards();
    document.getElementById('addSigninDayBtn')?.addEventListener('click', addSigninDay);
}

async function loadSigninRewards() {
    const { data: rewards } = await sb.from('signin_rewards').select('*').order('day');
    const div = document.getElementById('signinRewardsDiv');
    if (div) {
        div.innerHTML = '';
        for (let r of rewards || []) {
            div.innerHTML += `<div style="background:#0f172a; border-radius:16px; padding:15px; margin-bottom:12px; display:flex; align-items:center; gap:15px; flex-wrap:wrap;">
                Day ${r.day}: <input type="number" id="reward_${r.day}" value="${r.amount}" style="width:120px; background:#0f172a; border:1px solid #1e2a3a; border-radius:8px; padding:8px; color:#fff;"> €
                <button class="saveReward" data-day="${r.day}" style="background:#2f6b3a; padding:6px 16px; border-radius:8px;">Save</button>
                <button class="deleteReward" data-day="${r.day}" style="background:#7a2f2f; padding:6px 16px; border-radius:8px;">Delete</button>
            </div>`;
        }
        document.querySelectorAll('.saveReward').forEach(btn => btn.addEventListener('click', () => saveReward(btn.dataset.day)));
        document.querySelectorAll('.deleteReward').forEach(btn => btn.addEventListener('click', () => deleteSigninDay(btn.dataset.day)));
    }
}

async function saveReward(day) {
    const amt = parseFloat(document.getElementById(`reward_${day}`).value);
    await sb.from('signin_rewards').update({ amount: amt }).eq('day', day);
    showToast(`Day ${day} 奖励Amount已更新`, 'success');
    loadSigninRewards();
}

async function deleteSigninDay(day) {
    showConfirm('ConfirmDelete', `确定Delete Day ${day} 的奖励设置吗？`, async () => {
        await sb.from('signin_rewards').delete().eq('day', day);
        showToast('已Delete', 'success');
        loadSigninRewards();
    });
}

async function addSigninDay() {
    showPrompt('Add签到日', '请输入新的签到日数 (例如: 7)', async (newDay) => {
        if (!newDay || isNaN(newDay)) return;
        showPrompt('设置奖励Amount', `请输入 Day ${newDay} 的奖励Amount (€)`, async (amount) => {
            if (!amount || isNaN(amount)) return;
            const { error } = await sb.from('signin_rewards').insert([{ day: parseInt(newDay), amount: parseFloat(amount) }]);
            if (error) {
                showToast('Add失败: ' + error.message, 'error');
            } else {
                showToast('Add成功', 'success');
                loadSigninRewards();
            }
        });
    });
}

window.loadSigninPage = loadSigninPage;