// admin-orders.js - Backend Order Management
let adminOrderSearchKeyword = '';
let adminOrdersList = [];
let currentPage = 1;
const pageSize = 50;

async function loadAdminOrdersPage() {
    const container = document.getElementById('page_orders');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="search-bar" style="justify-content: space-between;">
                <h3 style="margin:0;"><i class="fas fa-box"></i> Order Management</h3>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="adminOrderSearch" placeholder="🔍 Search Order No or UID" class="search-input" style="width: 200px;">
                    <button id="adminOrderSearchBtn" class="btn-primary"><i class="fas fa-search"></i> Search</button>
                    <button id="adminOrderRefreshBtn" class="btn-primary"><i class="fas fa-sync-alt"></i> Refresh</button>
                </div>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Order No</th>
                            <th>UID</th>
                            <th>Username</th>
                            <th>Products</th>
                            <th>Total Price</th>
                            <th>Commission</th>
                            <th>Buyer</th>
                            <th>Status</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody id="adminOrdersTableBody">
                        <tr><td colspan="9" class="loading">Loading... <i class="fas fa-spinner fa-spin"></i></td></tr>
                    </tbody>
                </table>
            </div>
            <div class="pagination" id="adminOrderPagination"></div>
        </div>
    `;
    
    await loadAdminOrders();
    
    document.getElementById('adminOrderSearchBtn')?.addEventListener('click', () => {
        adminOrderSearchKeyword = document.getElementById('adminOrderSearch').value.trim();
        currentPage = 1;
        loadAdminOrders();
    });
    
    document.getElementById('adminOrderRefreshBtn')?.addEventListener('click', () => {
        document.getElementById('adminOrderSearch').value = '';
        adminOrderSearchKeyword = '';
        currentPage = 1;
        loadAdminOrders();
    });
}

async function loadAdminOrders() {
    let query = sb.from('user_orders').select('*').order('created_at', { ascending: false });
    
    if (adminOrderSearchKeyword) {
        query = query.or(`order_no.ilike.%${adminOrderSearchKeyword}%,uid.ilike.%${adminOrderSearchKeyword}%`);
    }
    
    const { data: orders, error } = await query;
    
    if (error) {
        console.error('Failed to load orders:', error);
        return;
    }
    
    adminOrdersList = orders || [];
    renderAdminOrdersTable();
}

function renderAdminOrdersTable() {
    const tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;
    
    const start = (currentPage - 1) * pageSize;
    const pageOrders = adminOrdersList.slice(start, start + pageSize);
    
    if (pageOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    for (const order of pageOrders) {
        const row = tbody.insertRow();
        let productsText = '';
        try {
            const products = JSON.parse(order.products || '[]');
            productsText = products.map(p => `${p.product_name} ×${p.quantity}`).join(', ');
        } catch(e) {
            productsText = order.products || '-';
        }
        
        const statusMap = {
            'pending': '<span class="badge" style="background:#ffb84d; color:#1a1a2e;">Pending</span>',
            'processing': '<span class="badge" style="background:#4a7cff;">Processing</span>',
            'delivered': '<span class="badge" style="background:#2ed15a;">Delivered</span>'
        };
        
        row.insertCell(0).innerHTML = `<span class="badge" style="font-family:monospace;">${order.order_no}</span>`;
        row.insertCell(1).innerHTML = `<span class="badge">${order.uid}</span>`;
        row.insertCell(2).innerText = order.username || '-';
        row.insertCell(3).innerHTML = productsText.substring(0, 60) + (productsText.length > 60 ? '...' : '');
        row.insertCell(4).innerHTML = `<span class="text-gold">€${(order.total_supply_price || 0).toFixed(2)}</span>`;
        row.insertCell(5).innerHTML = `<span class="text-green">€${(order.total_commission || 0).toFixed(2)}</span>`;
        row.insertCell(6).innerHTML = `${escapeHtml(order.buyer_name || '-')}<br><small style="color:#8a9abb;">${escapeHtml(order.buyer_phone || '')}</small>`;
        row.insertCell(7).innerHTML = statusMap[order.status] || order.status;
        row.insertCell(8).innerText = new Date(order.created_at).toLocaleString();
    }
    
    renderAdminPagination();
}

function renderAdminPagination() {
    const container = document.getElementById('adminOrderPagination');
    if (!container) return;
    
    const totalPages = Math.ceil(adminOrdersList.length / pageSize);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = '';
    
    if (currentPage > 1) {
        const prev = document.createElement('button');
        prev.innerHTML = 'Previous';
        prev.onclick = () => { currentPage--; renderAdminOrdersTable(); };
        container.appendChild(prev);
    }
    
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        if (i === currentPage) btn.classList.add('current-page');
        btn.onclick = () => { currentPage = i; renderAdminOrdersTable(); };
        container.appendChild(btn);
    }
    
    if (currentPage < totalPages) {
        const next = document.createElement('button');
        next.innerHTML = 'Next';
        next.onclick = () => { currentPage++; renderAdminOrdersTable(); };
        container.appendChild(next);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

window.loadAdminOrdersPage = loadAdminOrdersPage;