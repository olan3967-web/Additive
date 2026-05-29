// admin-content.js - 内容管理页面
async function loadContentPage() {
    const container = document.getElementById('page_content');
    if (!container) return;
    container.innerHTML = `
        <div class="card">
            <h3>内容管理页面</h3>
            <p>功能开发中...</p>
        </div>
    `;
}

window.loadContentPage = loadContentPage;