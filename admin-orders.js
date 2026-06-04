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
                <h3 style="margin:0;"><i class="fas fa-box"></idata-i18n=" Order Management"data-i18n=" Order Management"data-i18n=" Order Management"data-i18n=" Order Management"> Order Management</h3>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="adminOrderSearch" placeholder="🔍 Search Order No or UID" class="search-input" style="width: 200px;">
                    <button id="adminOrderSearchBtn" class="btn-primary"><i class="fas fa-search"></idata-i18n=" Search"data-i18n=" Search"data-i18n=" Search"data-i18n=" Search"> Search</button>
                    <button id="adminOrderRefreshBtn" class="btn-primary"><i class="fas fa-sync-alt"></idata-i18n=" Refresh"data-i18n=" Refresh"data-i18n=" Refresh"data-i18n=" Refresh"> Refresh</button>
                </div>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <thdata-i18n="Order No"data-i18n="Order No"data-i18n="Order No"data-i18n="Order No">Order No</th>
                            <thdata-i18n="UID"data-i18n="UID"data-i18n="UID"data-i18n="UID">UID</th>
                            <thdata-i18n="Username"data-i18n="Username"data-i18n="Username"data-i18n="Username">Username</th>
                            <thdata-i18n="Products"data-i18n="Products"data-i18n="Products"data-i18n="Products">Products</th>
                            <thdata-i18n="Total Price"data-i18n="Total Price"data-i18n="Total Price"data-i18n="Total Price">Total Price</th>
                            <thdata-i18n="Commission"data-i18n="Commission"data-i18n="Commission"data-i18n="Commission">Commission</th>
                            <thdata-i18n="Buyer"data-i18n="Buyer"data-i18n="Buyer"data-i18n="Buyer">Buyer</th>
                            <thdata-i18n="Status"data-i18n="Status"data-i18n="Status"data-i18n="Status">Status</th>
                            <thdata-i18n="Created"data-i18n="Created"data-i18n="Created"data-i18n="Created">Created</th>
                        </tr>
                    </thead>
                    <tbody id="adminOrdersTableBody">
                        <tr><td colspan="9" class="loading"data-i18n="Loading... "data-i18n="Loading... "data-i18n="Loading... "data-i18n="Loading... ">Loading... <i class="fas fa-spinner fa-spin"></i></td></tr>
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
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;"data-i18n="No orders found"data-i18n="No orders found"data-i18n="No orders found"data-i18n="No orders found">No orders found</td></tr>';
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
            'pending': '<span class="badge" style="background:#ffb84d; color:#1a1a2e;"data-i18n="Pending"data-i18n="Pending"data-i18n="Pending"data-i18n="Pending">Pending</span>',
            'processing': '<span class="badge" style="background:#4a7cff;"data-i18n="Processing"data-i18n="Processing"data-i18n="Processing"data-i18n="Processing">Processing</span>',
            'delivered': '<span class="badge" style="background:#2ed15a;"data-i18n="Delivered"data-i18n="Delivered"data-i18n="Delivered"data-i18n="Delivered">Delivered</span>'
        };
        
        row.insertCell(0).innerHTML = `<span class="badge" style="font-family:monospace;"data-i18n="${order.order_no}"data-i18n="${order.order_no}">${order.order_no}</span>`;
        row.insertCell(1).innerHTML = `<span class="badge"data-i18n="${order.uid}"data-i18n="${order.uid}">${order.uid}</span>`;
        row.insertCell(2).innerText = order.username || '-';
        row.insertCell(3).innerHTML = productsText.substring(0, 60) + (productsText.length > 60 ? '...' : '');
        row.insertCell(4).innerHTML = `<span class="text-gold"data-i18n="€${(order.total_supply_price || 0).toFixed(2)}"data-i18n="€${(order.total_supply_price || 0).toFixed(2)}">€${(order.total_supply_price || 0).toFixed(2)}</span>`;
        row.insertCell(5).innerHTML = `<span class="text-green"data-i18n="€${(order.total_commission || 0).toFixed(2)}"data-i18n="€${(order.total_commission || 0).toFixed(2)}">€${(order.total_commission || 0).toFixed(2)}</span>`;
        row.insertCell(6).innerHTML = `${escapeHtml(order.buyer_name || '-')}<br><small style="color:#8a9abb;"data-i18n="${escapeHtml(order.buyer_phone || '')}"data-i18n="${escapeHtml(order.buyer_phone || '')}">${escapeHtml(order.buyer_phone || '')}</small>`;
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
    return str.replace(/[&<data-i18n="]/g, m =data-i18n=" m === '&' ? '&amp;' : m === '">]/g, m => m === '&' ? '&amp;' : m === '"> m === '&' ? '&amp;' : m === '">]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

window.loadAdminOrdersPage = loadAdminOrdersPage;