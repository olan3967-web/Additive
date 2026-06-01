// admin-certificate.js - 证书管理页面（系统级，不绑定用户）

async function loadCertificatePage() {
    const container = document.getElementById('page_certificate');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="search-bar" style="justify-content: space-between;">
                <h3><i class="fas fa-certificate"></i> Certificate 管理</h3>
                <div style="display: flex; gap: 12px;">
                    <button id="uploadCertificateBtn" class="btn-primary"><i class="fas fa-upload"></i> 设置证书图片</button>
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
        // 获取所有证书（系统级，不区分用户）
        const { data: certificates, error } = await sb
            .from('certificates')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!certificates || certificates.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color:#aaa;">暂无证书，点击"设置证书图片"添加</div>';
            return;
        }
        
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr><th>证书图片</th><th>上传时间</th><th>状态</th><th>操作</th></tr>
                </thead>
                <tbody id="certificateTableBody"></tbody>
            </table>
        `;
        
        const tbody = document.getElementById('certificateTableBody');
        for (let cert of certificates) {
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<img src="${cert.image_url}" style="width:60px; height:86px; object-fit:cover; border-radius:8px; cursor:pointer;" onclick="window.open('${cert.image_url}','_blank')">`;
            row.insertCell(1).innerHTML = new Date(cert.created_at).toLocaleString();
            row.insertCell(2).innerHTML = cert.is_active ? '<span class="badge" style="background:#2f6b3a;">✓ 启用</span>' : '<span class="badge" style="background:#7a2f2f;">禁用</span>';
            row.insertCell(3).innerHTML = `
                <button class="toggle-cert-btn" data-id="${cert.id}" data-status="${cert.is_active}" style="background:#2f6b3a; padding:4px 12px; margin-right:4px;">${cert.is_active ? '禁用' : '启用'}</button>
                <button class="delete-cert-btn" data-id="${cert.id}" style="background:#7a2f2f; padding:4px 12px;">删除</button>
            `;
        }
        
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
                <h3><i class="fas fa-upload"></i> 设置证书图片</h3>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label>证书图片 URL</label>
                    <input type="text" id="certImageUrl" placeholder="https://... 证书图片地址 (推荐 900x1288)" style="width:100%; padding:10px; background:#0f172a; border:1px solid #1e2a3a; border-radius:8px; color:#fff;">
                    <div id="certImagePreview" style="margin-top:10px; width:90px; height:129px; background:#0f172a; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#666; overflow:hidden;">预览</div>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <button id="confirmUploadCertBtn" class="success">保存</button>
                    <button id="cancelUploadCertBtn">取消</button>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('uploadCertModal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 实时预览
    document.getElementById('certImageUrl')?.addEventListener('input', (e) => {
        const url = e.target.value;
        const preview = document.getElementById('certImagePreview');
        if (url) {
            preview.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" onerror="this.parentElement.innerHTML='❌ 图片加载失败'">`;
        } else {
            preview.innerHTML = '预览';
        }
    });
    
    document.getElementById('confirmUploadCertBtn')?.addEventListener('click', async () => {
        const imageUrl = document.getElementById('certImageUrl').value.trim();
        
        if (!imageUrl) {
            showToast('请输入证书图片 URL', 'error');
            return;
        }
        
        // 先禁用所有现有证书，再添加新的作为激活
        await sb.from('certificates').update({ is_active: false }).neq('id', 0);
        
        const { error } = await sb.from('certificates').insert({
            uid: 'system',  // 系统级，不绑定特定用户
            image_url: imageUrl,
            is_active: true,
            created_at: new Date().toISOString()
        });
        
        if (error) {
            showToast('保存失败: ' + error.message, 'error');
            return;
        }
        
        showToast('证书设置成功', 'success');
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