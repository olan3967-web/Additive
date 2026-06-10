// admin-orders.js - Backend Order Management + 自动状态推进器
let adminOrderSearchKeyword = '';
let adminOrdersList = [];
let adminOrdersCurrentPage = 1;
const adminOrdersPageSize = 50;

// ========== 状态流程配置 ==========
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
    MIN_HOURS: 72,   // 3天
    MAX_HOURS: 96    // 4天
};

// 物流计划缓存
const logisticsPlanCache = new Map();

/**
 * 为订单生成物流进度计划
 */
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
    
    // 随机分配每个状态的时间点
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
    
    // 累积计算实际时间点
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

/**
 * 手动释放 Payment released（后台点击 Release Now）
 */
async function manualReleasePayment(orderNo) {
    console.log(`🔓 手动释放订单 ${orderNo} 的 Payment released`);
    
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
    
    console.log(`✅ 订单 ${orderNo} Payment released 已手动释放`);
    return true;
}

/**
 * 订单完成后记录到 order_history
 */
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
        
        // 更新用户余额（返还佣金）
        const { data: user } = await sb.from('users').select('balance').eq('uid', order.uid).single();
        if (user) {
            const newBalance = (user.balance || 0) + (order.total_commission || 0);
            await sb.from('users').update({ balance: newBalance }).eq('uid', order.uid);
            
            // 记录到 deposits
            await sb.from('deposits').insert({
                uid: order.uid,
                username: order.username,
                amount: order.total_commission || 0,
                type: 'order_commission',
                created_at: new Date().toISOString()
            });
        }
    } catch(e) {
        console.error('写入 order_history 失败:', e);
    }
}

/**
 * 主函数：自动推进所有 processing 订单的状态
 */
async function autoAdvanceOrderStatus() {
    const { data: orders, error } = await sb
        .from('user_orders')
        .select('*')
        .eq('status', 'processing');
    
    if (error || !orders || orders.length === 0) return;
    
    const now = new Date();
    
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
            const statusConfig = STATUS_FLOW[statusName];
            
            if (!statusConfig) continue;
            
            let shouldAdvance = false;
            let nextTime = null;
            
            if (statusName === "Payment released") {
                const releaseMechanism = statusItem.releaseMechanism;
                const timerMinutes = statusItem.timerMinutes;
                const baseTime = new Date(statusItem.time);
                
                if (releaseMechanism === 'timer' && timerMinutes) {
                    if (now >= baseTime) {
                        shouldAdvance = true;
                        nextTime = baseTime;
                    }
                } else if (releaseMechanism === 'manual') {
                    continue;
                }
                
            } else if (statusName === "Preparing parcel for shipment") {
                const prevStatusTime = new Date(newTimeline[i - 1]?.time);
                if (isNaN(prevStatusTime.getTime())) continue;
                
                const delayMs = (statusConfig.delayMinutes ? statusConfig.delayMinutes() : 0) * 60 * 1000;
                const expectedTime = new Date(prevStatusTime.getTime() + delayMs);
                
                if (now >= expectedTime) {
                    shouldAdvance = true;
                    nextTime = expectedTime;
                    
                    if (!logisticsPlanCache.has(order.order_no)) {
                        const plan = generateLogisticsPlan(expectedTime);
                        logisticsPlanCache.set(order.order_no, plan);
                        console.log(`📦 订单 ${order.order_no} 生成物流计划，预计 ${plan[plan.length-1].plannedTime.toLocaleString()} 完成`);
                    }
                }
                
            } else if (statusConfig.isLogistics) {
                let plan = logisticsPlanCache.get(order.order_no);
                
                if (!plan && statusConfig.isStartOfLogistics) {
                    const prevStatusTime = new Date(newTimeline[i - 1]?.time);
                    if (!isNaN(prevStatusTime.getTime())) {
                        plan = generateLogisticsPlan(prevStatusTime);
                        logisticsPlanCache.set(order.order_no, plan);
                    }
                }
                
                if (plan) {
                    const planItem = plan.find(p => p.status === statusName);
                    if (planItem && !planItem.isCompleted && now >= planItem.plannedTime) {
                        shouldAdvance = true;
                        nextTime = planItem.plannedTime;
                        planItem.isCompleted = true;
                        logisticsPlanCache.set(order.order_no, plan);
                    }
                } else {
                    const baseTime = new Date(newTimeline[i - 1]?.time);
                    if (!isNaN(baseTime.getTime())) {
                        const delayHours = 24 + Math.random() * 48;
                        const expectedTime = new Date(baseTime.getTime() + delayHours * 60 * 60 * 1000);
                        if (now >= expectedTime) {
                            shouldAdvance = true;
                            nextTime = expectedTime;
                        }
                    }
                }
            } else {
                const prevStatusTime = new Date(newTimeline[i - 1]?.time);
                if (isNaN(prevStatusTime.getTime())) continue;
                
                const delayMs = (typeof statusConfig.delayMinutes === 'function' ? statusConfig.delayMinutes() : statusConfig.delayMinutes) * 60 * 1000;
                const expectedTime = new Date(prevStatusTime.getTime() + delayMs);
                
                if (now >= expectedTime) {
                    shouldAdvance = true;
                    nextTime = expectedTime;
                }
            }
            
            if (shouldAdvance) {
                newTimeline[i] = {
                    status: statusName,
                    time: nextTime.toISOString(),
                    isCompleted: true
                };
                
                if (statusConfig.isFinal) {
                    await sb.from('user_orders').update({
                        tracking_timeline: JSON.stringify(newTimeline),
                        status: 'delivered',
                        completed_at: now.toISOString()
                    }).eq('order_no', order.order_no);
                    
                    await recordOrderToHistory(order);
                    console.log(`✅ 订单 ${order.order_no} 已完成，移入历史记录`);
                    logisticsPlanCache.delete(order.order_no);
                    updated = false;
                    break;
                }
                
                updated = true;
                console.log(`📌 订单 ${order.order_no} 状态推进: ${statusName} → ${statusConfig.nextStatus}`);
            }
        }
        
        if (updated) {
            await sb.from('user_orders').update({
                tracking_timeline: JSON.stringify(newTimeline)
            }).eq('order_no', order.order_no);
        }
    }
}

// 启动自动推进器（每 30 秒执行一次）
let autoAdvanceInterval = setInterval(autoAdvanceOrderStatus, 30000);
console.log('🚀 订单状态自动推进器已启动，每 30 秒检查一次');

// ========== 以下为原有的订单管理页面代码 ==========

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
                    <tbody id="adminOrdersTableBody"><tr><td colspan="9" class="loading">Loading...</td></tr></tbody>
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

// 导出全局函数
window.loadAdminOrdersPage = loadAdminOrdersPage;
window.manualReleasePayment = manualReleasePayment;
window.autoAdvanceOrderStatus = autoAdvanceOrderStatus;