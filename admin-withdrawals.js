// admin-withdrawals.js - 完整版（使用自定义弹窗）
async function loadWithdrawalsPage() {
    const container = document.getElementById('page_withdrawals');
    if (!container) return;
    container.innerHTML = `
        <div class="card">
            <div class="search-bar" style="justify-content: space-between;">
                <h3 style="margin:0;"><i class="fas fa-spinner fa-pulse"></idata-i18n=" 待处理Withdraw"> 待处理Withdraw</h3>
                <button id="refreshWithdrawalsBtn" class="btn-primary"><i class="fas fa-sync-alt"></idata-i18n=" Refresh"data-i18n=" Refresh"> Refresh</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><thdata-i18n="UID"data-i18n="UID">UID</th><thdata-i18n="用户名">用户名</th><thdata-i18n="Amount"data-i18n="Amount">Amount</th><thdata-i18n="钱包地址">钱包地址</th><thdata-i18n="申请时间">申请时间</th><thdata-i18n="操作">操作</th></tr></thead>
                    <tbody id="withdrawalsTableBody"></tbody>
                </table>
            </div>
        </div>
    `;
    await loadWithdrawals();
    document.getElementById('refreshWithdrawalsBtn')?.addEventListener('click', () => { loadWithdrawals(); if (window.loadDashboardPage) window.loadDashboardPage(currentDays); });
}

async function loadWithdrawals() {
    const { data: wd } = await sb.from('withdrawals').select('*').eq('status', 'pending');
    const tbody = document.getElementById('withdrawalsTableBody');
    if (tbody) {
        tbody.innerHTML = '';
        for (let w of wd || []) {
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<span class="badge"data-i18n="${w.uid}">${w.uid}</span>`;
            row.insertCell(1).innerText = w.username;
            row.insertCell(2).innerHTML = `<span class="text-gold"data-i18n="€${(w.amount || 0).toFixed(2)}">€${(w.amount || 0).toFixed(2)}</span>`;
            row.insertCell(3).innerText = w.wallet_address || '-';
            row.insertCell(4).innerText = new Date(w.request_date).toLocaleString();
            row.insertCell(5).innerHTML = `<button class="approve-withdraw" data-id="${w.id}" data-uid="${w.uid}" data-amt="${w.amount}" style="background:#2f6b3a; padding:4px 10px; font-size:11px; margin-right:4px;"data-i18n="批准">批准</button><button class="reject-withdraw" data-id="${w.id}" data-uid="${w.uid}" data-amt="${w.amount}" style="background:#7a2f2f; padding:4px 10px; font-size:11px;"data-i18n="拒绝">拒绝</button>`;
        }
        document.querySelectorAll('.approve-withdraw').forEach(btn => btn.addEventListener('click', async () => {
            showConfirm('批准Withdraw', `批准 €${parseFloat(btn.dataset.amt)} Withdraw？`, async () => {
                await sb.from('withdrawals').update({ status: 'approved' }).eq('id', parseInt(btn.dataset.id));
                loadWithdrawals();
                if (window.loadDashboardPage) window.loadDashboardPage(currentDays);
                showToast('已批准', 'success');
            });
        }));
        document.querySelectorAll('.reject-withdraw').forEach(btn => btn.addEventListener('click', async () => {
            showConfirm('拒绝Withdraw', '拒绝该Withdraw？Amount将退回用户账户', async () => {
                const { data: user } = await sb.from('users').select('balance').eq('uid', btn.dataset.uid).single();
                await sb.from('users').update({ balance: (user.balance || 0) + parseFloat(btn.dataset.amt) }).eq('uid', btn.dataset.uid);
                await sb.from('withdrawals').update({ status: 'rejected' }).eq('id', parseInt(btn.dataset.id));
                loadWithdrawals();
                if (window.loadDashboardPage) window.loadDashboardPage(currentDays);
                showToast('已拒绝，Amount已退回', 'success');
            });
        }));
    }
}

window.loadWithdrawalsPage = loadWithdrawalsPage;