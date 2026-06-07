// admin-users.js - 完整版（含Top UpAmount + 奖励Amount + Onboarding进度条）

let searchKeyword = '';

async function loadUsersPage() {
    const container = document.getElementById('page_users');
    if (!container) return;
    container.innerHTML = `
        <div class="card">
            <div class="search-bar">
                <input type="text" id="searchUserInput" class="search-input" placeholder="🔍 Search UID 或用户名...">
                <button id="searchUserBtn" class="btn-primary"><i class="fas fa-search"></i> Search</button>
                <button id="refreshUserBtn" class="btn-primary"><i class="fas fa-sync-alt"></i> Refresh</button>
                <button id="addUserBtn" class="success"><i class="fas fa-user-plus"></i> 创建用户</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr><th>UID</th><th>用户名</th><th>邀请码</th><th>推荐人</th><th>余额</th><th>体验金</th><th>Onboarding Status</th><th>VIP等级</th><th>钱包地址</th><th>操作</th>
                    </thead>
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
    
    // 加载 onboarding 数据
    const { data: onboardingData } = await sb.from('user_onboarding').select('*');
    const onboardingMap = {};
    if (onboardingData) {
        onboardingData.forEach(o => { onboardingMap[o.uid] = o; });
    }
    
    // 获取 KYC 状态
    const { data: kycStatuses } = await sb.from('user_kyc_status').select('*');
    const kycMap = {};
    if (kycStatuses) {
        kycStatuses.forEach(k => { kycMap[k.uid] = k.is_verified; });
    }
    
    const tbody = document.getElementById('usersTableBody');
    if (tbody && users) {
        tbody.innerHTML = '';
        for (let u of users) {
            const onboarding = onboardingMap[u.uid] || {};
            const step1Completed = onboarding.step1_completed || false;
            const step2Completed = kycMap[u.uid] || false;
            const step3Completed = onboarding.step3_completed || false;
            
            let completedCount = 0;
            if (step1Completed) completedCount++;
            if (step2Completed) completedCount++;
            if (step3Completed) completedCount++;
            
            const percentage = (completedCount / 3) * 100;
            
            let statusText = '';
            let statusColor = '';
            if (completedCount === 3) {
                statusText = '✓ Completed';
                statusColor = '#2ed15a';
            } else if (completedCount === 0) {
                statusText = 'Not Started';
                statusColor = '#8a9abb';
            } else {
                statusText = `${completedCount}/3 Steps`;
                statusColor = '#ffb84d';
            }
            
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<span class="badge" style="background:#1e2a3a; color:#ffb84d;">${u.uid}</span>`;
            row.insertCell(1).innerText = u.username;
            row.insertCell(2).innerHTML = `<span class="badge" style="background:#1e2a3a; color:#8a9abb;">${u.invite_code || '-'}</span>`;
            row.insertCell(3).innerText = u.invited_by_username || '-';
            row.insertCell(4).innerHTML = `<span style="color:#2ed15a; font-weight:600;">€${(u.balance || 0).toFixed(2)}</span>`;
            row.insertCell(5).innerHTML = `<span style="color:#ffb84d; font-weight:600;">€${(u.trial_bonus_amount || 0).toFixed(2)}</span>`;
            
            // Onboarding Status 进度条（有色背景，非白色）
            row.insertCell(6).innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; min-width: 140px;">
                    <div style="flex: 1; background: #1e2a3a; border-radius: 10px; height: 8px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #ffb84d, #2ed15a); border-radius: 10px;"></div>
                    </div>
                    <span style="font-size: 11px; color: ${statusColor};">${statusText}</span>
                </div>
            `;
            
            row.insertCell(7).innerHTML = `<select class="vip-select" data-uid="${u.uid}" style="background:#0f172a; border:1px solid #1e2a3a; border-radius:8px; padding:4px 8px; color:#fff;"><option value="1" ${u.vip_level == 1 ? 'selected' : ''}>Normal</option><option value="2" ${u.vip_level == 2 ? 'selected' : ''}>VIP</option><option value="3" ${u.vip_level == 3 ? 'selected' : ''}>SVIP</option></select>`;
            row.insertCell(8).innerHTML = u.withdrawal_address ? u.withdrawal_address.substring(0, 12) + '...' : '<span style="color:#6a7a9a;">-</span>';
            row.insertCell(9).innerHTML = `<button class="deposit-btn" data-uid="${u.uid}" style="background:#2f6b3a; border:none; padding:4px 10px; font-size:11px; margin-right:4px; border-radius:6px; color:#fff; cursor:pointer;"><i class="fas fa-plus-circle"></i> Top Up</button><button class="cut-btn" data-uid="${u.uid}" style="background:#7a2f2f; border:none; padding:4px 10px; font-size:11px; margin-right:4px; border-radius:6px; color:#fff; cursor:pointer;"><i class="fas fa-minus-circle"></i> 扣款</button><button class="edit-user-btn" data-uid="${u.uid}" data-phone="${u.phone || ''}" data-username="${u.username}" data-pin="${u.pin || ''}" style="background:#2f6b3a; border:none; padding:4px 10px; font-size:11px; margin-right:4px; border-radius:6px; color:#fff; cursor:pointer;"><i class="fas fa-edit"></i> 修改</button><button class="delete-btn" data-uid="${u.uid}" style="background:#7a2f2f; border:none; padding:4px 10px; font-size:11px; border-radius:6px; color:#fff; cursor:pointer;"><i class="fas fa-trash"></i> Delete</button>`;
        }
        document.querySelectorAll('.vip-select').forEach(sel => sel.addEventListener('change', () => updateVip(sel.dataset.uid, sel.value)));
        document.querySelectorAll('.deposit-btn').forEach(btn => btn.addEventListener('click', () => depositBalance(btn.dataset.uid)));
        document.querySelectorAll('.cut-btn').forEach(btn => btn.addEventListener('click', () => cutBalance(btn.dataset.uid)));
        document.querySelectorAll('.edit-user-btn').forEach(btn => btn.addEventListener('click', () => openEditUserModal(btn.dataset.uid, btn.dataset.phone, btn.dataset.username, btn.dataset.pin)));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => delUser(btn.dataset.uid)));
    }
}

// ========== Top Up：输入Top UpAmount + 奖励Amount ==========
async function depositBalance(uid) {
    showPrompt('Top Up Amount', '请输入Top Up Amount (€)', async (amount) => {
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            showToast('请输入有效的Top Up Amount', 'error');
            return;
        }
        
        showPrompt('Bonus Amount', '请输入奖励Amount (€) - 可不填', async (bonus) => {
            const bonusAmount = parseFloat(bonus) || 0;
            
            const { data: user, error: fetchError } = await sb
                .from('users')
                .select('balance, username')
                .eq('uid', uid)
                .single();
            
            if (fetchError || !user) {
                showToast('获取用户信息失败', 'error');
                return;
            }
            
            const currentBalance = user.balance || 0;
            const newBalance = currentBalance + depositAmount + bonusAmount;
            
            let confirmMessage = `用户：${user.username} Top Up：€${depositAmount.toFixed(2)}`;
            if (bonusAmount > 0) confirmMessage += ` 奖励：€${bonusAmount.toFixed(2)}`;
            confirmMessage += ` 新余额：€${newBalance.toFixed(2)}`;
            
            showConfirm('Confirm Top Up', confirmMessage, async () => {
                const { error: updateError } = await sb
                    .from('users')
                    .update({ balance: newBalance })
                    .eq('uid', uid);
                
                if (updateError) {
                    showToast('Top Up失败: ' + updateError.message, 'error');
                    return;
                }
                
                await sb.from('deposits').insert([{
                    uid: uid,
                    username: user.username,
                    amount: depositAmount,
                    type: 'manual',
                    created_at: new Date().toISOString()
                }]);
                
                if (bonusAmount > 0) {
                    await sb.from('deposits').insert([{
                        uid: uid,
                        username: user.username,
                        amount: bonusAmount,
                        type: 'deposit_bonus',
                        created_at: new Date().toISOString()
                    }]);
                }
                
                showToast(`✅ Top Up成功！`, 'success');
                loadUsers();
                if (window.loadDashboardPage) window.loadDashboardPage(currentDays);
            });
        });
    });
}

// ========== 扣款（无奖励） ==========
async function cutBalance(uid) {
    showPrompt('扣款金额', '请输入扣款金额 (€)', async (amt) => {
        const amount = parseFloat(amt);
        if (!amount || amount <= 0) {
            showToast('请输入有效金额', 'error');
            return;
        }
        
        const { data: user } = await sb.from('users').select('balance, username').eq('uid', uid).single();
        if (!user) {
            showToast('用户不存在', 'error');
            return;
        }
        
        if ((user.balance || 0) < amount) {
            showToast('余额不足', 'error');
            return;
        }
        
        const newBalance = (user.balance || 0) - amount;
        
        showConfirm('Confirm扣款', `用户: ${user.username} 扣款: €${amount.toFixed(2)} 新余额: €${newBalance.toFixed(2)}`, async () => {
            const { error } = await sb.from('users').update({ balance: newBalance }).eq('uid', uid);
            if (error) {
                showToast('扣款失败: ' + error.message, 'error');
                return;
            }
            showToast(`-€${amount.toFixed(2)}`, 'success');
            loadUsers();
            if (window.loadDashboardPage) window.loadDashboardPage(currentDays);
        });
    });
}

// ========== 修改用户信息 ==========
function openEditUserModal(uid, phone, username, pin) {
    const modalHtml = `
        <div id="editUserModal" class="modal-overlay" style="visibility: visible; opacity: 1;">
            <div class="modal-card">
                <h3 style="color:#ffb84d;"><i class="fas fa-edit"></i> 修改用户信息 - ${escapeHtml(username)}</h3>
                <div><label style="color:#8a9abb;">Phone Number</label><input type="tel" id="editPhone" value="${escapeHtml(phone || '')}" style="width:100%; margin:10px 0; padding:10px; background:#0f172a; border:1px solid #1e2a3a; border-radius:8px; color:#fff;"></div>
                <div><label style="color:#8a9abb;">Login Password</label><input type="password" id="editPassword" placeholder="留空则不修改" style="width:100%; margin:10px 0; padding:10px; background:#0f172a; border:1px solid #1e2a3a; border-radius:8px; color:#fff;"><small style="color:#6a7a9a;">留空表示不修改密码</small></div>
                <div><label style="color:#8a9abb;">Withdrawal PIN (4 digits)</label><input type="password" id="editPin" maxlength="4" value="${escapeHtml(pin || '')}" style="width:100%; margin:10px 0; padding:10px; background:#0f172a; border:1px solid #1e2a3a; border-radius:8px; color:#fff;"></div>
                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <button id="confirmEditBtn" class="success" style="background:#2f6b3a; border:none; padding:8px 16px; border-radius:8px; color:#fff; cursor:pointer;">保存修改</button>
                    <button id="cancelEditBtn" style="background:#4a5a6a; border:none; padding:8px 16px; border-radius:8px; color:#fff; cursor:pointer;">取消</button>
                </div>
            </div>
        </div>
    `;
    const existing = document.getElementById('editUserModal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('editUserModal');
    document.getElementById('confirmEditBtn').onclick = async () => {
        const newPhone = document.getElementById('editPhone').value.trim();
        const newPassword = document.getElementById('editPassword').value;
        const newPin = document.getElementById('editPin').value;
        const updateData = {};
        if (newPhone) updateData.phone = newPhone;
        if (newPassword && newPassword.length >= 4) updateData.password = newPassword;
        if (newPin && newPin.length === 4 && !isNaN(newPin)) updateData.pin = newPin;
        if (Object.keys(updateData).length === 0) {
            showToast('没有修改任何信息', 'warning');
            modal.remove();
            return;
        }
        const { error } = await sb.from('users').update(updateData).eq('uid', uid);
        if (error) {
            showToast('修改失败: ' + error.message, 'error');
        } else {
            showToast('用户信息已更新', 'success');
            modal.remove();
            loadUsers();
        }
    };
    document.getElementById('cancelEditBtn').onclick = () => modal.remove();
}

async function updateVip(uid, level) {
    await sb.from('users').update({ vip_level: parseInt(level) }).eq('uid', uid);
    loadUsers();
}

async function delUser(uid) {
    showConfirm('Confirm Delete', '永久删除用户？此操作不可恢复', async () => {
        await sb.from('users').delete().eq('uid', uid);
        await sb.from('order_history').delete().eq('uid', uid);
        await sb.from('deposits').delete().eq('uid', uid);
        await sb.from('withdrawals').delete().eq('uid', uid);
        loadUsers();
        if (window.loadDashboardPage) window.loadDashboardPage(currentDays);
        showToast('已删除', 'success');
    });
}

// 创建用户 Modal 事件
document.getElementById('createUserBtn')?.addEventListener('click', async () => {
    const phone = document.getElementById('newPhone').value.trim();
    const username = document.getElementById('newUsername').value.trim();
    const pwd = document.getElementById('newPassword').value;
    if (!phone || !username || !pwd) {
        showToast('请填写完整', 'error');
        return;
    }
    const { data: exist } = await sb.from('users').select('username').eq('username', username).single();
    if (exist) {
        showToast('用户名已存在', 'error');
        return;
    }
    const { data: max } = await sb.from('users').select('uid').order('uid', { ascending: false }).limit(1);
    let newUid = '100001';
    if (max && max.length) newUid = (parseInt(max[0].uid) + 1).toString();
    const inviteCode = Array(6).fill().map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
    const { error } = await sb.from('users').insert([{ uid: newUid, phone, username, password: pwd, invite_code: inviteCode, balance: 0, vip_level: 1, trial_bonus_amount: 0 }]);
    if (error) {
        showToast(error.message, 'error');
        return;
    }
    loadUsers();
    if (window.loadDashboardPage) window.loadDashboardPage(currentDays);
    document.getElementById('addUserModal').classList.remove('active');
    showToast(`用户 ${username} 创建成功`, 'success');
    document.getElementById('newPhone').value = '';
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
});

document.getElementById('closeUserModalBtn')?.addEventListener('click', () => document.getElementById('addUserModal').classList.remove('active'));

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

window.loadUsersPage = loadUsersPage;