// admin-orders.js - Backend Order Management + 自动状态推进器（保活版）
let adminOrderSearchKeyword = '';
let adminOrdersList = [];
let adminOrdersCurrentPage = 1;
const adminOrdersPageSize = 50;
let autoAdvanceTimer = null;
let isAdvancing = false;

// =====================================================
// 状态流程配置
// =====================================================
const STATUS_FLOW = {
    "Payment released": { 
        index: 3, 
        nextStatus: "Order confirmed", 
        delayMinutes: 5, 
        isLogistics: false 
    },
    "Order confirmed": { 
        index: 4, 
        nextStatus: "Preparing parcel for shipment", 
        delayMinutes: () => 10 + Math.random() * 5, 
        isLogistics: false 
    },
    "Preparing parcel for shipment": { 
        index: 5, 
        nextStatus: "Courier assigned", 
        isLogistics: true, 
        isStartOfLogistics: true 
    },
    "Courier assigned": { 
        index: 6, 
        nextStatus: "Parcel picked up by logistics partner", 
        isLogistics: true 
    },
    "Parcel picked up by logistics partner": { 
        index: 7, 
        nextStatus: "Parcel arrived at sorting facility", 
        isLogistics: true 
    },
    "Parcel arrived at sorting facility": { 
        index: 8, 
        nextStatus: "Parcel departed from sorting facility", 
        isLogistics: true 
    },
    "Parcel departed from sorting facility": { 
        index: 9, 
        nextStatus: "Parcel arrived at delivery hub", 
        isLogistics: true 
    },
    "Parcel arrived at delivery hub": { 
        index: 10, 
        nextStatus: "Parcel out for delivery", 
        isLogistics: true 
    },
    "Parcel out for delivery": { 
        index: 11, 
        nextStatus: "Parcel delivered", 
        isLogistics: true 
    },
    "Parcel delivered": { 
        index: 12, 
        nextStatus: null, 
        isLogistics: true, 
        isFinal: true 
    }
};

const LOGISTICS_DURATION = {
    MIN_HOURS: 72,
    MAX_HOURS: 96
};

const logisticsPlanCache = new Map();

function generateLogisticsPlan(startTime) {
    const totalDurationHours = LOGISTICS_DURATION.MIN_HOURS + Math.random() * (LOGISTICS_DURATION.MAX_HOURS - LOGISTICS_DURATION.MIN_HOURS);
    const totalDurationMs = totalDurationHours * 60 * 60 * 1000;
    
    const logisticsStatuses = [
        "Courier assigned",
        "Parcel picked up by logistics partner",
        "Parcel arrived at sorting facility",
        "Parcel departed from sorting facility",
        "Parcel arrived at delivery hub",
        "Parcel out for delivery",
        "Parcel delivered"
    ];
    
    const timePoints = [];
    let remaining = totalDurationMs;
    
    for (let i = 0; i < logisticsStatuses.length - 1; i++) {
        const minPortion = 0.05;
        const maxPortion = 0.4;
        const portion = minPortion + Math.random() * (maxPortion - minPortion);
        const duration = remaining * portion;
        timePoints.push(duration);
        remaining -= duration;
    }
    timePoints.push(remaining);
    
    const plan = [];
    let currentTime = new Date(startTime);
    
    for (let i = 0; i < logisticsStatuses.length; i++) {
        if (i > 0) {
            currentTime = new Date(currentTime.getTime() + timePoints[i - 1]);
        }
        plan.push({
            status: logisticsStatuses[i],
            plannedTime: currentTime,
            isCompleted: false
        });
    }
    
    return plan;
}

// =====================================================
// 核心推进函数
// =====================================================
async function autoAdvanceOrderStatus() {
    if (isAdvancing) {
        return;
    }
    
    isAdvancing = true;
    
    try {
        const { data: orders, error } = await sb
            .from('user_orders')
            .select('*')
            .eq('status', 'processing');
        
        if (error || !orders || orders.length === 0) {
            isAdvancing = false;
            return;
        }
        
        const now = new Date();
        let anyUpdated = false;
        
        for (const order of orders) {
            let timeline = [];
            try {
                timeline = JSON.parse(order.tracking_timeline || '[]');
            } catch(e) {
                console.error(`解析订单 ${order.order_no} 失败:`, e);
                continue;
            }
            
            let updated = false;
            let newTimeline = [...timeline];
            
            for (let i = 0; i < newTimeline.length; i++) {
                const statusItem = newTimeline[i];
                
                if (statusItem.isPending !== true) continue;
                
                const statusName = statusItem.status;
                let shouldAdvance = false;
                let nextTime = null;
                
                // ========== 处理 Payment released (Timer) ==========
                if (statusName === "Payment released") {
                    const releaseMechanism = statusItem.releaseMechanism;
                    const timerMinutes = statusItem.timerMinutes;
                    const releaseTime = new Date(statusItem.time);
                    
                    if (releaseMechanism === 'timer' && timerMinutes && timerMinutes > 0) {
                        if (now >= releaseTime) {
                            shouldAdvance = true;
                            nextTime = releaseTime;
                        }
                    }
                    
                // ========== 处理其他状态 ==========
                } else {
                    let prevTime = null;
                    for (let j = i - 1; j >= 0; j--) {
                        if (newTimeline[j].isCompleted !== true) continue;
                        prevTime = new Date(newTimeline[j].time);
                        if (!isNaN(prevTime.getTime())) break;
                    }
                    
                    if (!prevTime || isNaN(prevTime.getTime())) continue;
                    
                    let delayMinutes = 0;
                    
                    if (statusName === "Order confirmed") {
                        delayMinutes = 5;
                    } else if (statusName === "Preparing parcel for shipment") {
                        delayMinutes = 10 + Math.random() * 5;
                    } else if (statusName === "Courier assigned") {
                        delayMinutes = 120;
                    } else if (statusName === "Parcel picked up by logistics partner") {
                        delayMinutes = 120;
                    } else if (statusName === "Parcel arrived at sorting facility") {
                        delayMinutes = 120;
                    } else if (statusName === "Parcel departed from sorting facility") {
                        delayMinutes = 120;
                    } else if (statusName === "Parcel arrived at delivery hub") {
                        delayMinutes = 120;
                    } else if (statusName === "Parcel out for delivery") {
                        delayMinutes = 120;
                    } else if (statusName === "Parcel delivered") {
                        delayMinutes = 120;
                    } else {
                        continue;
                    }
                    
                    const expectedTime = new Date(prevTime.getTime() + delayMinutes * 60 * 1000);
                    
                    if (now >= expectedTime) {
                        shouldAdvance = true;
                        nextTime = expectedTime;
                    }
                }
                
                if (shouldAdvance && nextTime) {
                    newTimeline[i] = {
                        status: statusName,
                        time: nextTime.toISOString(),
                        isCompleted: true
                    };
                    
                    if (statusName === "Parcel delivered") {
                        await sb.from('user_orders').update({
                            tracking_timeline: JSON.stringify(newTimeline),
                            status: 'delivered',
                            completed_at: now.toISOString()
                        }).eq('order_no', order.order_no);
                        
                        await recordOrderToHistory(order);
                        console.log(`✅ 订单 ${order.order_no} 已完成`);
                        anyUpdated = true;
                        updated = true;
                        break;
                    }
                    
                    anyUpdated = true;
                    updated = true;
                    console.log(`📌 订单 ${order.order_no} 状态推进: ${statusName}`);
                    break;
                }
            }
            
            if (updated) {
                await sb.from('user_orders').update({
                    tracking_timeline: JSON.stringify(newTimeline)
                }).eq('order_no', order.order_no);
            }
        }
        
        if (anyUpdated) {
            console.log('✅ 订单状态推进完成');
        }
        
    } catch (err) {
        console.error('推进订单状态失败:', err);
    } finally {
        isAdvancing = false;
    }
}

// =====================================================
// 记录订单到 history
// =====================================================
async function recordOrderToHistory(order) {
    try {
        let products = typeof order.products === 'string' ? JSON.parse(order.products) : order.products;
        if (!Array.isArray(products)) return;
        
        for (const product of products) {
            const qty = parseInt(product.quantity) || 1;
            for (let i = 0; i < qty; i++) {
                await sb.from('order_history').insert({
                    uid: order.uid,
                    username: order.username,
                    order_code: order.order_no,
                    accommodation_name: product.product_name,
                    price: product.unit_price,
                    commission: product.commission_per_item || 0,
                    date: new Date().toISOString()
                });
            }
        }
        console.log(`📝 订单 ${order.order_no} 已写入 order_history`);
    } catch(e) {
        console.error('写入 order_history 失败:', e);
    }
}

// =====================================================
// 启动自动推进器
// =====================================================
function startAutoAdvancer() {
    if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
        clearTimeout(autoAdvanceTimer);
    }
    
    console.log('🚀 启动订单自动推进器（每 15 秒检查一次）');
    
    setTimeout(autoAdvanceOrderStatus, 1000);
    
    autoAdvanceTimer = setInterval(autoAdvanceOrderStatus, 15000);
    
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('📱 页面回到前台，立即检查订单状态');
            autoAdvanceOrderStatus();
        }
    });
    
    window.addEventListener('online', () => {
        console.log('🌐 网络已恢复，立即检查订单状态');
        autoAdvanceOrderStatus();
    });
}

// =====================================================
// 手动释放 Payment
// =====================================================
async function manualReleasePayment(orderNo) {
    console.log(`🔓 手动释放订单 ${orderNo}`);
    
    const { data: order, error } = await sb
        .from('user_orders')
        .select('*')
        .eq('order_no', orderNo)
        .single();
    
    if (error || !order) {
        console.error('订单不存在:', error);
        return false;
    }
    
    let timeline = [];
    try {
        timeline = JSON.parse(order.tracking_timeline || '[]');
    } catch(e) {
        console.error('解析 timeline 失败:', e);
        return false;
    }
    
    const now = new Date();
    let updated = false;
    
    for (let i = 0; i < timeline.length; i++) {
        if (timeline[i].status === "Payment released" && timeline[i].isPending === true) {
            timeline[i] = {
                status: "Payment released",
                time: now.toISOString(),
                isCompleted: true
            };
            updated = true;
            break;
        }
    }
    
    if (!updated) {
        console.log('没有找到等待中的 Payment released');
        return false;
    }
    
    await sb.from('user_orders').update({
        tracking_timeline: JSON.stringify(timeline)
    }).eq('order_no', orderNo);
    
    const supplyPrice = order.total_supply_price || 0;
    const commissionAmount = order.total_commission || 0;
    
    // 获取用户当前余额
    const { data: user, error: userError } = await sb
        .from('users')
        .select('balance')
        .eq('uid', order.uid)
        .single();
    
    if (userError) {
        console.error('获取用户失败:', userError);
        return false;
    }
    
    const refundAmount = supplyPrice + commissionAmount;
    const newBalance = (user.balance || 0) + refundAmount;
    
    console.log(`用户 ${order.uid} 原余额: ${user.balance}, 增加: ${refundAmount}, 新余额: ${newBalance}`);
    
    // 更新用户余额
    const { error: updateError } = await sb
        .from('users')
        .update({ balance: newBalance })
        .eq('uid', order.uid);
    
    if (updateError) {
        console.error('更新余额失败:', updateError);
        return false;
    }
    
    // 记录 deposits
    await sb.from('deposits').insert({
        uid: order.uid,
        username: order.username,
        amount: supplyPrice,
        type: 'order_settlement',
        created_at: now.toISOString()
    });
    
    await sb.from('deposits').insert({
        uid: order.uid,
        username: order.username,
        amount: commissionAmount,
        type: 'order_commission',
        created_at: now.toISOString()
    });
    
    // 更新本地 storage
    const localUser = getCurrentUser();
    if (localUser && localUser.uid === order.uid) {
        localUser.balance = newBalance;
        localStorage.setItem('currentUser', JSON.stringify(localUser));
    }
    
    console.log(`✅ 订单 ${orderNo} 释放完成！本金 RM${supplyPrice}，佣金 RM${commissionAmount}`);
    console.log(`✅ 用户 ${order.uid} 新余额: RM${newBalance}`);
    return true;
}

// =====================================================
// 加载订单列表页面
// =====================================================
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
                        <tr><th>Order No</th><th>UID</th><th>Username</th><th>Products</th><th>Total Price</th><th>Commission</th><th>Buyer</th><th>Status</th><th>Created</th>
                    </thead>
                    <tbody id="adminOrdersTableBody"><tr><td colspan="9" class="loading">Loading...</td></tr>
                </table>
            </div>
            <div class="pagination" id="adminOrderPagination"></div>
        </div>
    `;
    
    await loadAdminOrders();
    
    document.getElementById('adminOrderSearchBtn')?.addEventListener('click', () => {
        adminOrderSearchKeyword = document.getElementById('adminOrderSearch').value.trim();
        adminOrdersCurrentPage = 1;
        loadAdminOrders();
    });
    
    document.getElementById('adminOrderRefreshBtn')?.addEventListener('click', () => {
        document.getElementById('adminOrderSearch').value = '';
        adminOrderSearchKeyword = '';
        adminOrdersCurrentPage = 1;
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
    
    const start = (adminOrdersCurrentPage - 1) * adminOrdersPageSize;
    const pageOrders = adminOrdersList.slice(start, start + adminOrdersPageSize);
    
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
        row.insertCell(4).innerHTML = `<span class="text-gold">RM${(order.total_supply_price || 0).toFixed(2)}</span>`;
        row.insertCell(5).innerHTML = `<span class="text-green">RM${(order.total_commission || 0).toFixed(2)}</span>`;
        row.insertCell(6).innerHTML = `${escapeHtml(order.buyer_name || '-')}<br><small style="color:#8a9abb;">${escapeHtml(order.buyer_phone || '')}</small>`;
        row.insertCell(7).innerHTML = statusMap[order.status] || order.status;
        row.insertCell(8).innerText = new Date(order.created_at).toLocaleString();
    }
    
    renderAdminPagination();
}

function renderAdminPagination() {
    const container = document.getElementById('adminOrderPagination');
    if (!container) return;
    
    const totalPages = Math.ceil(adminOrdersList.length / adminOrdersPageSize);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = '';
    
    if (adminOrdersCurrentPage > 1) {
        const prev = document.createElement('button');
        prev.innerHTML = 'Previous';
        prev.onclick = () => { adminOrdersCurrentPage--; renderAdminOrdersTable(); };
        container.appendChild(prev);
    }
    
    for (let i = Math.max(1, adminOrdersCurrentPage - 2); i <= Math.min(totalPages, adminOrdersCurrentPage + 2); i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        if (i === adminOrdersCurrentPage) btn.classList.add('current-page');
        btn.onclick = () => { adminOrdersCurrentPage = i; renderAdminOrdersTable(); };
        container.appendChild(btn);
    }
    
    if (adminOrdersCurrentPage < totalPages) {
        const next = document.createElement('button');
        next.innerHTML = 'Next';
        next.onclick = () => { adminOrdersCurrentPage++; renderAdminOrdersTable(); };
        container.appendChild(next);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

// =====================================================
// 启动自动推进器（页面加载时自动启动）
// =====================================================
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAutoAdvancer);
    } else {
        startAutoAdvancer();
    }
}

// 暴露全局函数
window.loadAdminOrdersPage = loadAdminOrdersPage;
window.manualReleasePayment = manualReleasePayment;
window.autoAdvanceOrderStatus = autoAdvanceOrderStatus;
window.startAutoAdvancer = startAutoAdvancer;
window.recordOrderToHistory = recordOrderToHistory;

console.log('✅ admin-orders.js 加载完成（自动推进器已启动）');