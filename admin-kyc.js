// admin-kyc.js - KYC审核页面
async function loadKycPage() {
    const container = document.getElementById('page_kyc');
    if (!container) return;
    container.innerHTML = `
        <div class="card">
            <div class="search-bar" style="justify-content: space-between;">
                <h3 style="margin:0;"><i class="fas fa-id-card"></i> KYC Verification Requests</h3>
                <button id="refreshKycBtn" class="btn-primary"><i class="fas fa-sync-alt"></i> 刷新</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>UID</th><th>用户名</th><th>证件类型</th><th>图片</th><th>上传时间</th><th>状态</th><th>操作</th></tr></thead>
                    <tbody id="kycTableBody"><tr><td colspan="7" style="text-align:center;">加载中...<i class="fas fa-spinner fa-spin"></i></td></tr></tbody>
                </table>
            </div>
        </div>
    `;
    await loadKycRequests();
    document.getElementById('refreshKycBtn')?.addEventListener('click', loadKycRequests);
}

async function loadKycRequests() {
    const tbody = document.getElementById('kycTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">加载中...</td></tr>';
    const { data: kycList } = await sb.from('kyc_verifications').select('*').order('uploaded_at', { ascending: false });
    if (!kycList || kycList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">暂无KYC申请记录</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    for (const item of kycList) {
        const row = tbody.insertRow();
        row.insertCell(0).innerHTML = `<span class="badge">${item.uid}</span>`;
        row.insertCell(1).innerText = item.username || item.uid;
        let docType = item.document_type || '-';
        if (docType === 'national_id_front') docType = '身份证(正面)';
        if (docType === 'national_id_back') docType = '身份证(背面)';
        row.insertCell(2).innerHTML = `<span class="badge">${docType}</span>`;
        row.insertCell(3).innerHTML = `<img src="${item.image_url}" style="width:60px;height:45px;object-fit:cover;border-radius:8px;cursor:pointer;" onclick="window.open('${item.image_url}','_blank')">`;
        row.insertCell(4).innerText = new Date(item.uploaded_at).toLocaleString();
        row.insertCell(5).innerHTML = `<span class="badge" style="background:#ffaa33;">${item.status}</span>`;
        row.insertCell(6).innerHTML = `<button class="approve-kyc" data-id="${item.id}" data-uid="${item.uid}" style="background:#2f6b3a; padding:4px 10px; font-size:11px; margin-right:4px;">批准</button><button class="reject-kyc" data-id="${item.id}" style="background:#7a2f2f; padding:4px 10px; font-size:11px;">拒绝</button>`;
    }
    document.querySelectorAll('.approve-kyc').forEach(btn => btn.addEventListener('click', async () => {
        await sb.from('kyc_verifications').update({ status: 'approved' }).eq('id', parseInt(btn.dataset.id));
        await sb.from('user_kyc_status').upsert({ uid: btn.dataset.uid, is_verified: true });
        loadKycRequests();
        if (window.loadDashboardPage) window.loadDashboardPage(currentDays);
        alert('已批准');
    }));
    document.querySelectorAll('.reject-kyc').forEach(btn => btn.addEventListener('click', async () => {
        await sb.from('kyc_verifications').update({ status: 'rejected' }).eq('id', parseInt(btn.dataset.id));
        loadKycRequests();
        alert('已拒绝');
    }));
}

window.loadKycPage = loadKycPage;