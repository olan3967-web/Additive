// admin-certificate.js - 证书管理页面

async function loadCertificatePage() {
    const container = document.getElementById('page_certificate');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="search-bar" style="justify-content: space-between;">
                <h3><i class="fas fa-certificate"></i> Certificate 管理</h3>
                <div style="display: flex; gap: 12px;">
                    <button id="uploadCertificateBtn" class="btn-primary"><i class="fas fa-upload"></i> 上传证书</button>
                    <button id="refreshCertificateBtn" class="btn-primary"><i class="fas fa-sync-alt"></i> 刷新</button>
                </div>
            </div>
            <div id="certificateListContainer" class="table-container">
                <div style="text-align:center; padding:40px; color:#aaa;">加载中...</div>
            </div>
        </div>
    `;
    
    document.getElementById('uploadCertificateBtn')?.addEventListener('click', openUploadModal);
    document.getElementById('refreshCertificateBtn')?.addEventListener('click', loadCertificates);
    
    await loadCertificates();
}

async function loadCertificates() {
    const container = document.getElementById('certificateListContainer');
    if (!container) return;
    
    try {
        // 先获取所有证书
        const { data: certificates, error } = await sb
            .from('certificates')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!certificates || certificates.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color:#aaa;">暂无证书，点击"上传证书"添加</div>';
            return;
        }
        
        // 获取所有用户的 UID 列表
        const uids = [...new Set(certificates.map(c => c.uid))];
        const { data: users } = await sb
            .from('users')
            .select('uid, username')
            .in('uid', uids);
        
        const userMap = {};
        if (users) {
            users.forEach(u => { userMap[u.uid] = u.username; });
        }
        
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr><th>用户</th><th>证书图片</th><th>上传时间</th><th>状态</th><th>操作</th></tr>
                </thead>
                <tbody id="certificateTableBody"></tbody>
            </table>
        `;
        
        const tbody = document.getElementById('certificateTableBody');
        for (let cert of certificates) {
            const username = userMap[cert.uid] || cert.uid;
            
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<span class="badge">${escapeHtml(username)}</span><br><small style="color:#6a7a9a;">UID: ${cert.uid}</small>`;
            row.insertCell(1).innerHTML = `<img src="${cert.image_url}" style="width:60px; height:86px; object-fit:cover; border-radius:8px; cursor:pointer;" onclick="window.open('${cert.image_url}','_blank')">`;
            row.insertCell(2).innerHTML = new Date(cert.created_at).toLocaleString();
            row.insertCell(3).innerHTML = cert.is_active ? '<span class="badge" style="background:#2f6b3a;">✓ 启用</span>' : '<span class="badge" style="background:#7a2f2f;">禁用</span>';
            row.insertCell(4).innerHTML = `
                <button class="toggle-cert-btn" data-id="${cert.id}" data-status="${cert.is_active}" style="background:#2f6b3a; padding:4px 12px; margin-right:4px;">${cert.is_active ? '禁用' : '启用'}</button>
                <button class="delete-cert-btn" data-id="${cert.id}" style="background:#7a2f2f; padding:4px 12px;">删除</button>
            `;
        }
        
        // 绑定事件...
        document.querySelectorAll('.toggle-cert-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const currentStatus = btn.dataset.status === 'true';
                await sb.from('certificates').update({ is_active: !currentStatus }).eq('id', parseInt(id));
                showToast('状态已更新', 'success');
                loadCertificates();
            });
        });
        
        document.querySelectorAll('.delete-cert-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                showConfirm('确认删除', '删除此证书？', async () => {
                    await sb.from('certificates').delete().eq('id', parseInt(btn.dataset.id));
                    showToast('已删除', 'success');
                    loadCertificates();
                });
            });
        });
        
    } catch (e) {
        console.error('加载证书失败:', e);
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#ff8888;">加载失败: ' + e.message + '</div>';
    }
}

function openUploadModal() {
    const modalHtml = `
        <div id="uploadCertModal" class="modal-overlay" style="visibility: visible; opacity: 1;">
            <div class="modal-card" style="max-width: 500px;">
                <h3><i class="fas fa-upload"></i> 上传证书</h3>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label>选择用户</label>
                    <input type="text" id="certUserUid" placeholder="输入用户 UID" style="width:100%; padding:10px; background:#0f172a; border:1px solid #1e2a3a; border-radius:8px; color:#fff;">
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label>证书图片 (推荐 900x1288)</label>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <button id="uploadCertImageBtn" class="btn-primary"><i class="fas fa-image"></i> 选择图片</button>
                        <input type="file" id="certImageFile" accept="image/*" style="display:none;">
                        <div id="certImagePreview" style="width:60px; height:86px; background:#0f172a; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#666;">预览</div>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <button id="confirmUploadCertBtn" class="success">上传</button>
                    <button id="cancelUploadCertBtn">取消</button>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('uploadCertModal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    let selectedImageUrl = null;
    let cropper = null;
    
    document.getElementById('uploadCertImageBtn')?.addEventListener('click', () => {
        document.getElementById('certImageFile').click();
    });
    
    document.getElementById('certImageFile')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // 上传到 Supabase Storage
        const fileName = `certificates/${Date.now()}_${file.name}`;
        const { data, error } = await sb.storage.from('certificates').upload(fileName, file);
        
        if (error) {
            showToast('上传失败: ' + error.message, 'error');
            return;
        }
        
        const { data: urlData } = sb.storage.from('certificates').getPublicUrl(fileName);
        selectedImageUrl = urlData.publicUrl;
        
        const preview = document.getElementById('certImagePreview');
        preview.innerHTML = `<img src="${selectedImageUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
        showToast('图片上传成功', 'success');
    });
    
    document.getElementById('confirmUploadCertBtn')?.addEventListener('click', async () => {
        const uid = document.getElementById('certUserUid').value.trim();
        if (!uid) {
            showToast('请输入用户 UID', 'error');
            return;
        }
        if (!selectedImageUrl) {
            showToast('请先上传证书图片', 'error');
            return;
        }
        
        const { error } = await sb.from('certificates').insert({
            uid: uid,
            image_url: selectedImageUrl,
            is_active: true,
            created_at: new Date().toISOString()
        });
        
        if (error) {
            showToast('上传失败: ' + error.message, 'error');
            return;
        }
        
        showToast('证书上传成功', 'success');
        document.getElementById('uploadCertModal').remove();
        loadCertificates();
    });
    
    document.getElementById('cancelUploadCertBtn')?.addEventListener('click', () => {
        document.getElementById('uploadCertModal').remove();
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

window.loadCertificatePage = loadCertificatePage;