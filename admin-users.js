// admin-users.js - 用户管理页面
let searchKeyword = '';

async function loadUsersPage() {
    const container = document.getElementById('page_users');
    if (!container) return;
    container.innerHTML = `
        <div class="card">
            <div class="search-bar">
                <input type="text" id="searchUserInput" class="search-input" placeholder="🔍 搜索 UID 或用户名...">
                <button id="searchUserBtn" class="btn-primary"><i class="fas fa-search"></i> 搜索</button>
                <button id="refreshUserBtn" class="btn-primary"><i class="fas fa-sync-alt"></i> 刷新</button>
                <button id="addUserBtn" class="success"><i class="fas fa-user-plus"></i> 创建用户</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>UID</th><th>用户名</th><th>邀请码</th><th>推荐人</th><th>余额</th><th>体验金</th><th>订单数</th><th>VIP等级</th><th>钱包地址</th><th>操作</th></tr></thead>
                    <tbody id="usersTableBody"></tbody>
                </table>
            </div>
        </div>
    `;
    await loadUsers();
    document.getElementById('searchUserBtn')?.addEventListener('click', () => { searchKeyword = document.getElementById('searchUserInput').value; loadUsers(); });
    document.getElementById('refreshUserBtn')?.addEventListener('click', () => { document.getElementById('searchUserInput').value = ''; searchKeyword = ''; loadUsers(); });
    document.getElementById('addUserBtn')?.addEventListener('click', () => document.getElementById('addUserModal').classList.add('active'));
}

async function loadUsers() {
    let query = sb.from('users').select('*').order('created_at', { ascending: false });
    if (searchKeyword) query = query.or(`uid.ilike.%${searchKeyword}%,username.ilike.%${searchKeyword}%`);
    const { data: users } = await query;
    const { data: allOrders } = await sb.from('order_history').select('*');
    const tbody = document.getElementById('usersTableBody');
    if (tbody && users) {
        tbody.innerHTML = '';
        for (let u of users) {
            const userOrders = allOrders?.filter(o => o.uid === u.uid).length || 0;
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<span class="badge">${u.uid}</span>`;
            row.insertCell(1).innerText = u.username;
            row.insertCell(2).innerHTML = `<span class="badge">${u.invite_code || '-'}</span>`;
            row.insertCell(3).innerText = u.invited_by_username || '-';
            row.insertCell(4).innerHTML = `<span class="text-green">€${(u.balance || 0).toFixed(2)}</span>`;
            row.insertCell(5).innerHTML = `<span class="text-gold">€${(u.trial_bonus_amount || 0).toFixed(2)}</span>`;
            row.insertCell(6).innerHTML = `${userOrders}`;
            row.insertCell(7).innerHTML = `<select class="vip-select" data-uid="${u.uid}" style="background:#0f172a; border:1px solid #1e2a3a; border-radius:8px; padding:4px 8px;"><option value="1" ${u.vip_level == 1 ? 'selected' : ''}>Normal</option><option value="2" ${u.vip_level == 2 ? 'selected' : ''}>VIP</option><option value="3" ${u.vip_level == 3 ? 'selected' : ''}>SVIP</option></select>`;
            row.insertCell(8).innerHTML = u.withdrawal_address ? u.withdrawal_address.substring(0, 12) + '...' : '-';
            row.insertCell(9).innerHTML = `<button class="deposit-btn" data-uid="${u.uid}" style="background:#2f6b3a; padding:4px 10px; font-size:11px; margin-right:4px;"><i class="fas fa-plus-circle"></i> 充值</button><button class="cut-btn" data-uid="${u.uid}" style="background:#7a2f2f; padding:4px 10px; font-size:11px; margin-right:4px;"><i class="fas fa-minus-circle"></i> 扣款</button><button class="delete-btn" data-uid="${u.uid}" style="background:#7a2f2f; padding:4px 10px; font-size:11px;"><i class="fas fa-trash"></i> 删除</button>`;
        }
        document.querySelectorAll('.vip-select').forEach(sel => sel.addEventListener('change', () => updateVip(sel.dataset.uid, sel.value)));
        document.querySelectorAll('.deposit-btn').forEach(btn => btn.addEventListener('click', () => depositBalance(btn.dataset.uid)));
        document.querySelectorAll('.cut-btn').forEach(btn => btn.addEventListener('click', () => cutBalance(btn.dataset.uid)));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => delUser(btn.dataset.uid)));
    }
}

async function depositBalance(uid) {
    const amount = parseFloat(prompt('充值金额 (€)')) || 0;
    if (amount <= 0) return;
    const { data: user } = await sb.from('users').select('balance, username').eq('uid', uid).single();
    const newBalance = (user.balance || 0) + amount;
    await sb.from('users').update({ balance: newBalance }).eq('uid', uid);
    await sb.from('deposits').insert([{ uid, username: user.username, amount, type: 'manual' }]);
    loadUsers();
    if (window.loadDashboardPage) window.loadDashboardPage(currentDays);
    alert(`充值 €${amount} 成功`);
}

async function cutBalance(uid) {
    const amount = parseFloat(prompt('扣款金额 (€)'));
    if (!amount || amount <= 0) return;
    const { data: user } = await sb.from('users').select('balance').eq('uid', uid).single();
    if ((user.balance || 0) < amount) { alert('余额不足'); return; }
    await sb.from('users').update({ balance: (user.balance || 0) - amount }).eq('uid', uid);
    loadUsers();
    if (window.loadDashboardPage) window.loadDashboardPage(currentDays);
    alert(`-€${amount}`);
}

async function updateVip(uid, level) { await sb.from('users').update({ vip_level: parseInt(level) }).eq('uid', uid); loadUsers(); }
async function delUser(uid) { if (confirm('永久删除用户？')) { await sb.from('users').delete().eq('uid', uid); await sb.from('order_history').delete().eq('uid', uid); loadUsers(); if (window.loadDashboardPage) window.loadDashboardPage(currentDays); alert('已删除'); } }

// 创建用户 Modal 事件
document.getElementById('createUserBtn')?.addEventListener('click', async () => {
    const phone = document.getElementById('newPhone').value.trim();
    const username = document.getElementById('newUsername').value.trim();
    const pwd = document.getElementById('newPassword').value;
    if (!phone || !username || !pwd) { alert('请填写完整'); return; }
    const { data: exist } = await sb.from('users').select('username').eq('username', username).single();
    if (exist) { alert('用户名已存在'); return; }
    const { data: max } = await sb.from('users').select('uid').order('uid', { ascending: false }).limit(1);
    let newUid = '100001';
    if (max && max.length) newUid = (parseInt(max[0].uid) + 1).toString();
    const inviteCode = Array(6).fill().map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
    const { error } = await sb.from('users').insert([{ uid: newUid, phone, username, password: pwd, invite_code: inviteCode, balance: 0, vip_level: 1, trial_bonus_amount: 0 }]);
    if (error) { alert(error.message); return; }
    loadUsers();
    if (window.loadDashboardPage) window.loadDashboardPage(currentDays);
    document.getElementById('addUserModal').classList.remove('active');
    alert(`用户 ${username} 创建成功`);
    document.getElementById('newPhone').value = '';
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
});
document.getElementById('closeUserModalBtn')?.addEventListener('click', () => document.getElementById('addUserModal').classList.remove('active'));

window.loadUsersPage = loadUsersPage;