// user-data.js - 所有页面共享的用户数据管理

(function() {
    if (document.body) {
        while (document.body.firstChild && 
               document.body.firstChild.nodeType === 3 && 
               document.body.firstChild.textContent.trim() === '') {
            document.body.removeChild(document.body.firstChild);
        }
    }
})();

const SUPABASE_URL = 'https://ygeawapbjcfytjoxpttk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3X4gUSBt2i7OXB1IsajBiQ__NM-OIGn';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ========== 基础用户函数 ==========

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch(e) { return null; }
}

async function fetchUserData(uid) {
    const { data, error } = await sb
        .from('users')
        .select('*')
        .eq('uid', uid)
        .single();
    if (error) return null;
    return data;
}

async function syncUserData() {
    const user = getCurrentUser();
    if (!user) return null;
    const freshData = await fetchUserData(user.uid);
    if (freshData) {
        user.balance = freshData.balance || 0;
        user.trialBonusAmount = freshData.trial_bonus_amount || 0;
        user.vipLevel = freshData.vip_level || 1;
        user.username = freshData.username;
        user.uid = freshData.uid;
        user.pin = freshData.pin || '';
        user.inviteCode = freshData.invite_code || '';
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
    return user;
}

async function updateUserBalance(uid, newBalance, newTrialBonus = null) {
    const updateData = { balance: newBalance };
    if (newTrialBonus !== null) updateData.trial_bonus_amount = newTrialBonus;
    const { error } = await sb.from('users').update(updateData).eq('uid', uid);
    if (error) return false;
    const user = getCurrentUser();
    if (user && user.uid === uid) {
        user.balance = newBalance;
        if (newTrialBonus !== null) user.trialBonusAmount = newTrialBonus;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
    return true;
}

function checkLogin() {
    const user = getCurrentUser();
    if (!user || !user.isLoggedIn) {
        window.location.href = 'signin.html';
        return null;
    }
    return user;
}

// ========== 触发订单相关函数 ==========

async function getUserPendingTriggerOrder(uid) {
    const { data: orders } = await sb
        .from('order_history')
        .select('id', { count: 'exact' })
        .eq('uid', uid);
    
    const currentOrderCount = orders?.length || 0;
    const nextOrderNumber = currentOrderCount + 1;
    
    const { data: triggers, error } = await sb
        .from('user_trigger_orders')
        .select('*')
        .eq('uid', uid)
        .eq('status', 'pending')
        .lte('trigger_order_number', nextOrderNumber)
        .order('trigger_order_number', { ascending: true })
        .limit(1);
    
    if (error) return null;
    return triggers?.[0] || null;
}

async function hasPendingTriggerOrder(uid) {
    const trigger = await getUserPendingTriggerOrder(uid);
    return trigger !== null;
}

async function getTriggerOrderPendingAmount(uid, currentBalance, triggerOrder) {
    if (!triggerOrder) {
        triggerOrder = await getUserPendingTriggerOrder(uid);
    }
    if (!triggerOrder) return 0;
    const matchedPrice = triggerOrder.matched_price || 0;
    const commission = triggerOrder.commission_amount || 0;
    return currentBalance + matchedPrice + commission;
}

async function completeTriggerOrder(uid, triggerOrder) {
    if (!triggerOrder) return false;
    
    const matchedPrice = triggerOrder.matched_price || 0;
    const commission = triggerOrder.commission_amount || 0;
    
    const { data: userData } = await sb
        .from('users')
        .select('balance')
        .eq('uid', uid)
        .single();
    
    const currentBalance = userData?.balance || 0;
    const newBalance = currentBalance + matchedPrice + commission;
    
    const { error: balanceError } = await sb
        .from('users')
        .update({ balance: newBalance })
        .eq('uid', uid);
    
    if (balanceError) return false;
    
    const { error: updateError } = await sb
        .from('user_trigger_orders')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString()
        })
        .eq('id', triggerOrder.id);
    
    if (updateError) return false;
    
    const localUser = getCurrentUser();
    if (localUser && localUser.uid === uid) {
        localUser.balance = newBalance;
        localStorage.setItem('currentUser', JSON.stringify(localUser));
    }
    
    return true;
}

async function cancelTriggerOrder(triggerId) {
    const { error } = await sb
        .from('user_trigger_orders')
        .update({ status: 'cancelled' })
        .eq('id', triggerId);
    return !error;
}

// ========== 订单相关函数 ==========

async function getUserPendingOrders(uid) {
    const { data, error } = await sb
        .from('user_orders')
        .select('*')
        .eq('uid', uid)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

async function getUserProcessingOrders(uid) {
    const { data, error } = await sb
        .from('user_orders')
        .select('*')
        .eq('uid', uid)
        .eq('status', 'processing')
        .order('created_at', { ascending: false });
    if (error) return [];
    return data;
}

async function getUserCompletedOrders(uid) {
    const { data, error } = await sb
        .from('user_orders')
        .select('*')
        .eq('uid', uid)
        .eq('status', 'delivered')
        .order('completed_at', { ascending: false });
    if (error) return [];
    return data;
}

function generateTrackingTimeline() {
    const startTime = new Date();
    const timeline = [];
    const totalDuration = (3 + Math.random() * 2) * 24 * 60 * 60 * 1000;
    
    const statuses = [
        "Order is placed",
        "Sender is preparing to ship your parcel",
        "Courier assigned for your order, kindly wait for pickup",
        "Your parcel has been picked up by our logistics partner",
        "Your parcel has arrived at sorting facility",
        "Your parcel has departed from sorting facility",
        "Your parcel has arrived the delivery hub",
        "Your parcel is out for delivery",
        "Parcel has been delivered"
    ];
    
    const intervals = [];
    let remaining = totalDuration;
    for (let i = 0; i < statuses.length - 1; i++) {
        const maxGap = remaining / (statuses.length - i);
        const gap = maxGap * (0.3 + Math.random() * 0.7);
        intervals.push(gap);
        remaining -= gap;
    }
    intervals.push(remaining);
    
    let currentTime = startTime;
    for (let i = 0; i < statuses.length; i++) {
        timeline.push({
            status: statuses[i],
            time: new Date(currentTime).toISOString()
        });
        if (i < intervals.length) {
            currentTime = new Date(currentTime.getTime() + intervals[i]);
        }
    }
    return timeline;
}

// ========== 激活 Payment Release（修改版 - 分别记录货款和佣金） ==========
async function activatePaymentRelease(orderNo, paymentReleasedTime) {
    const { data: order } = await sb.from('user_orders').select('*').eq('order_no', orderNo).single();
    if (!order) return false;
    
    let timeline = JSON.parse(order.tracking_timeline || '[]');
    
    // 1. 防重复：如果已经处理过，跳过
    const alreadyProcessed = timeline.find(t => t.status === "Payment released" && !t.isPending);
    if (alreadyProcessed) {
        console.log('Order already processed, skipping');
        return false;
    }
    
    // 2. 找到等待中的 Payment released
    const pendingIndex = timeline.findIndex(t => t.status === "Payment released" && t.isPending === true);
    if (pendingIndex === -1) {
        console.log('No pending Payment released found');
        return false;
    }
    
    let timelineUpdated = false;
    
    // 3. 更新 Payment released
    timeline[pendingIndex] = { status: "Payment released", time: paymentReleasedTime.toISOString() };
    timelineUpdated = true;
    
    // 4. 计算并更新 Order confirmed 和 Preparing parcel
    const orderConfirmedDelay = 5 + Math.random() * 5;
    const preparingDelay = 30 + Math.random() * 30;
    
    const orderConfirmedTime = new Date(paymentReleasedTime.getTime() + orderConfirmedDelay * 60 * 1000);
    const preparingTime = new Date(orderConfirmedTime.getTime() + preparingDelay * 60 * 1000);
    
    for (let i = 0; i < timeline.length; i++) {
        if (timeline[i].status === "Order confirmed" && timeline[i].isPending === true) {
            timeline[i] = { status: "Order confirmed", time: orderConfirmedTime.toISOString() };
            timelineUpdated = true;
        }
        if (timeline[i].status === "Preparing parcel for shipment" && timeline[i].isPending === true) {
            timeline[i] = { status: "Preparing parcel for shipment", time: preparingTime.toISOString() };
            timelineUpdated = true;
        }
    }
    
    // 5. 后续物流状态
    const remainingStatuses = [
        "Courier assigned", "Parcel picked up by logistics partner",
        "Parcel arrived at sorting facility", "Parcel departed from sorting facility",
        "Parcel arrived at delivery hub", "Parcel out for delivery", "Parcel delivered"
    ];
    
    const totalMs = (3 + Math.random() * 1) * 24 * 60 * 60 * 1000;
    let intervals = [], remaining = totalMs;
    for (let i = 0; i < remainingStatuses.length; i++) {
        const gap = (remaining / (remainingStatuses.length - i)) * (0.3 + Math.random() * 0.7);
        intervals.push(gap);
        remaining -= gap;
    }
    
    let laterTime = new Date(preparingTime);
    let remainingIndex = 0;
    for (let i = 0; i < timeline.length; i++) {
        if (timeline[i].isPending === true && remainingStatuses.includes(timeline[i].status)) {
            laterTime = new Date(laterTime.getTime() + intervals[remainingIndex]);
            timeline[i] = { status: remainingStatuses[remainingIndex], time: laterTime.toISOString() };
            remainingIndex++;
        }
    }
    
    // 6. 返回余额 - 分别记录货款和佣金到 deposits 表
    const { data: user } = await sb.from('users').select('balance').eq('uid', order.uid).single();
    
    const supplyPrice = order.total_supply_price || 0;
    const commission = order.total_commission || 0;
    const refundAmount = supplyPrice + commission;
    const newBalance = (user?.balance || 0) + refundAmount;
    
    console.log('Payment Release - Supply Price:', supplyPrice, 'Commission:', commission, 'Total Refund:', refundAmount);
    
    await sb.from('users').update({ balance: newBalance }).eq('uid', order.uid);
    
    // 记录货款返还
    if (supplyPrice > 0) {
        await sb.from('deposits').insert([{
            uid: order.uid,
            username: order.username,
            amount: supplyPrice,
            type: 'order_payment_release',
            created_at: new Date().toISOString()
        }]);
    }
    
    // 记录佣金
    if (commission > 0) {
        await sb.from('deposits').insert([{
            uid: order.uid,
            username: order.username,
            amount: commission,
            type: 'order_commission',
            created_at: new Date().toISOString()
        }]);
    }
    
    // 7. 保存更新后的 timeline
    if (timelineUpdated) {
        await sb.from('user_orders').update({ 
            tracking_timeline: JSON.stringify(timeline),
            status: 'processing'
        }).eq('order_no', orderNo);
    }
    
    // 8. 写入 order_history（用于订单记录）
    try {
        let products = typeof order.products === 'string' ? JSON.parse(order.products) : order.products;
        if (Array.isArray(products)) {
            for (let product of products) {
                let qty = parseInt(product.quantity) || 1;
                for (let j = 0; j < qty; j++) {
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
        }
    } catch(e) { console.error('Failed to record order history:', e); }
    
    // 9. 更新本地用户余额
    const localUser = getCurrentUser();
    if (localUser && localUser.uid === order.uid) {
        localUser.balance = newBalance;
        localStorage.setItem('currentUser', JSON.stringify(localUser));
    }
    
    return true;
}

// ========== 暴露全局函数 ==========
window.getCurrentUser = getCurrentUser;
window.syncUserData = syncUserData;
window.updateUserBalance = updateUserBalance;
window.checkLogin = checkLogin;
window.getUserPendingTriggerOrder = getUserPendingTriggerOrder;
window.hasPendingTriggerOrder = hasPendingTriggerOrder;
window.getTriggerOrderPendingAmount = getTriggerOrderPendingAmount;
window.completeTriggerOrder = completeTriggerOrder;
window.cancelTriggerOrder = cancelTriggerOrder;
window.getUserPendingOrders = getUserPendingOrders;
window.getUserProcessingOrders = getUserProcessingOrders;
window.getUserCompletedOrders = getUserCompletedOrders;
window.generateTrackingTimeline = generateTrackingTimeline;
window.activatePaymentRelease = activatePaymentRelease;
window.sb = sb;

// ========== 移除点击蓝色高亮 ==========
(function() {
    const style = document.createElement('style');
    style.textContent = `
        * { -webkit-tap-highlight-color: transparent !important; }
        *:active { transform: none !important; opacity: 1 !important; background: transparent !important; box-shadow: none !important; }
        .nav-item { position: relative; }
    `;
    document.head.appendChild(style);
})();

console.log('✅ user-data.js 加载完成');