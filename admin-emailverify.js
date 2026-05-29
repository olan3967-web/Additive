// admin-emailverify.js - 邮箱验证码管理页面

async function loadEmailVerifyPage() {
    const container = document.getElementById('page_emailverify');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="search-bar" style="justify-content: space-between;">
                <h3><i class="fas fa-envelope"></i> 邮箱验证码管理</h3>
                <button id="refreshEmailRequestsBtn" class="btn-primary"><i class="fas fa-sync-alt"></i> 刷新</button>
            </div>
            <div style="margin-bottom: 16px; padding: 12px; background: rgba(74,124,255,0.1); border-radius: 12px;">
                <i class="fas fa-info-circle" style="color: #4a7cff;"></i> 
                用户注册时输入邮箱后，会出现在下方列表中。管理员手动发送验证码到用户邮箱后，在此处输入6位数字验证码并点击"设置"，用户即可使用该验证码完成注册。
            </div>
            <div id="emailRequestsList"></div>
        </div>
    `;
    
    await loadEmailRequests();
    
    document.getElementById('refreshEmailRequestsBtn')?.addEventListener('click', () => {
        loadEmailRequests();
    });
}

async function loadEmailRequests() {
    const container = document.getElementById('emailRequestsList');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center; padding:40px;">加载中... <i class="fas fa-spinner fa-spin"></i></div>';
    
    try {
        // 获取所有未验证的邮箱请求（包括已设置验证码但未验证的）
        const { data: requests, error } = await sb
            .from('email_verification_requests')
            .select('*')
            .eq('is_verified', false)
            .order('requested_at', { ascending: false });
        
        if (error) throw error;
        
        if (!requests || requests.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color:#aaa;">暂无待处理的邮箱验证请求</div>';
            return;
        }
        
        container.innerHTML = '';
        
        for (let req of requests) {
            const requestDiv = document.createElement('div');
            requestDiv.className = 'email-request-item';
            
            const requestTime = new Date(req.requested_at).toLocaleString();
            const expiresTime = new Date(req.expires_at).toLocaleString();
            const hasCode = req.code && req.code !== null;
            
            requestDiv.innerHTML = `
                <div class="email-info">
                    <div class="email-address"><i class="fas fa-envelope"></i> ${escapeHtml(req.email)}</div>
                    <div class="request-time">请求时间: ${requestTime} | 过期时间: ${expiresTime}</div>
                    ${hasCode ? `<div class="request-time" style="color: #2ed15a;">已设置验证码: ${req.code}</div>` : '<div class="request-time" style="color: #ffb84d;">等待设置验证码</div>'}
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="code_${req.id}" class="code-input" placeholder="6位数字" maxlength="6" value="${req.code || ''}">
                    <button class="set-code-btn" data-id="${req.id}" data-email="${req.email}">设置验证码</button>
                </div>
                <div>
                    <span class="status-badge ${hasCode ? 'status-pending' : 'status-pending'}">${hasCode ? '⏳ 已设置待验证' : '📧 等待设置'}</span>
                </div>
            `;
            
            container.appendChild(requestDiv);
        }
        
        // 绑定设置按钮事件
        document.querySelectorAll('.set-code-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const email = btn.dataset.email;
                const codeInput = document.getElementById(`code_${id}`);
                const code = codeInput.value.trim();
                
                if (!code) {
                    showToast('请输入6位数字验证码', 'error');
                    return;
                }
                
                if (!/^\d{6}$/.test(code)) {
                    showToast('验证码必须是6位数字', 'error');
                    return;
                }
                
                // 检查该邮箱是否已经有其他未验证的记录使用了相同的验证码（可选，防止重复）
                const { data: existingCode } = await sb
                    .from('email_verification_requests')
                    .select('id')
                    .eq('code', code)
                    .eq('is_verified', false)
                    .neq('id', parseInt(id))
                    .maybeSingle();
                
                if (existingCode) {
                    showToast('该验证码已被其他邮箱使用，请使用不同的验证码', 'error');
                    return;
                }
                
                // 更新验证码
                const { error: updateError } = await sb
                    .from('email_verification_requests')
                    .update({ 
                        code: code,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', parseInt(id));
                
                if (updateError) {
                    showToast('设置失败: ' + updateError.message, 'error');
                    return;
                }
                
                showToast(`已为 ${email} 设置验证码: ${code}，请手动发送给用户`, 'success');
                
                // 刷新列表
                await loadEmailRequests();
            });
        });
        
    } catch (e) {
        console.error('加载邮箱请求失败:', e);
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#ff8888;">加载失败: ' + e.message + '</div>';
    }
}

// 导出函数供全局使用
window.loadEmailVerifyPage = loadEmailVerifyPage;