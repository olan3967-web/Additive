// admin-trial.js - 体验金管理页面（使用自定义弹窗）
let trialSearchKeyword = '';

async function loadTrialPage() {
    const container = document.getElementById('page_trial');
    if (!container) return;
    container.innerHTML = `
        <div class="card">
            <div class="search-bar">
                <input type="text" id="trialSearchUid" class="search-input" placeholder="🔍 Search UID">
                <button id="trialSearchBtn" class="btn-primary"><i class="fas fa-search"></idata-i18n=" Search"data-i18n=" Search"data-i18n=" Search"data-i18n=" Search"> Search</button>
                <button id="trialRefreshBtn" class="btn-primary"><i class="fas fa-sync-alt"></idata-i18n=" Refresh"data-i18n=" Refresh"data-i18n=" Refresh"data-i18n=" Refresh"> Refresh</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><thdata-i18n="UID"data-i18n="UID"data-i18n="UID"data-i18n="UID">UID</th><thdata-i18n="用户名"data-i18n="用户名">用户名</th><thdata-i18n="当前体验金 (€)"data-i18n="当前体验金 (€)">当前体验金 (€)</th><thdata-i18n="调整Amount (€)"data-i18n="调整Amount (€)">调整Amount (€)</th><thdata-i18n="操作"data-i18n="操作">操作</th></tr></thead>
                    <tbody id="trialTableBody"></tbody>
                <tr>
            </div>
        </div>
    `;
    await loadTrialUsers();
    document.getElementById('trialSearchBtn')?.addEventListener('click', () => { trialSearchKeyword = document.getElementById('trialSearchUid').value; loadTrialUsers(); });
    document.getElementById('trialRefreshBtn')?.addEventListener('click', () => { document.getElementById('trialSearchUid').value = ''; trialSearchKeyword = ''; loadTrialUsers(); });
}

async function loadTrialUsers() {
    let query = sb.from('users').select('uid, username, trial_bonus_amount').order('uid', { ascending: true });
    if (trialSearchKeyword) query = query.ilike('uid', `%${trialSearchKeyword}%`);
    const { data: users } = await query;
    const tbody = document.getElementById('trialTableBody');
    if (tbody && users) {
        tbody.innerHTML = '';
        for (let u of users) {
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<span class="badge"data-i18n="${u.uid}"data-i18n="${u.uid}">${u.uid}</span>`;
            row.insertCell(1).innerText = u.username;
            row.insertCell(2).innerHTML = `<span class="text-gold"data-i18n="€${(u.trial_bonus_amount || 0).toFixed(2)}"data-i18n="€${(u.trial_bonus_amount || 0).toFixed(2)}">€${(u.trial_bonus_amount || 0).toFixed(2)}</span>`;
            const amountInput = document.createElement('input');
            amountInput.type = 'number';
            amountInput.placeholder = 'Amount';
            amountInput.style.width = '100px';
            amountInput.style.background = '#0f172a';
            amountInput.style.border = '1px solid #1e2a3a';
            amountInput.style.borderRadius = '8px';
            amountInput.style.padding = '4px 8px';
            amountInput.style.color = '#fff';
            const addBtn = document.createElement('button');
            addBtn.className = 'success';
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
            addBtn.style.marginRight = '5px';
            addBtn.style.padding = '4px 10px';
            addBtn.style.fontSize = '11px';
            addBtn.onclick = () => adjustTrialBonus(u.uid, parseFloat(amountInput.value), 'add');
            const cutBtn = document.createElement('button');
            cutBtn.className = 'danger';
            cutBtn.innerHTML = '<i class="fas fa-minus"></i> 扣除';
            cutBtn.style.padding = '4px 10px';
            cutBtn.style.fontSize = '11px';
            cutBtn.onclick = () => adjustTrialBonus(u.uid, parseFloat(amountInput.value), 'cut');
            row.insertCell(3).appendChild(amountInput);
            const actionCell = row.insertCell(4);
            actionCell.appendChild(addBtn);
            actionCell.appendChild(cutBtn);
        }
    }
}

async function adjustTrialBonus(uid, amount, action) {
    if (isNaN(amount) || amount <= 0) {
        showToast('请输入有效Amount', 'error');
        return;
    }
    const { data: user } = await sb.from('users').select('trial_bonus_amount, username').eq('uid', uid).single();
    let currentAmount = user.trial_bonus_amount || 0;
    let newAmount;
    if (action === 'add') {
        newAmount = currentAmount + amount;
        await sb.from('deposits').insert([{ uid: uid, username: user.username, amount: amount, type: 'trial_bonus' }]);
        showToast(`成功Add €${amount} 体验金`, 'success');
    } else {
        if (currentAmount < amount) {
            showToast('体验金不足', 'error');
            return;
        }
        newAmount = currentAmount - amount;
        showToast(`成功扣除 €${amount} 体验金`, 'success');
    }
    await sb.from('users').update({ trial_bonus_amount: newAmount }).eq('uid', uid);
    loadTrialUsers();
    if (window.loadUsersPage) window.loadUsersPage();
}

window.loadTrialPage = loadTrialPage;