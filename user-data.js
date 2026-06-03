// user-data.js - 所有页面共享的用户数据管理

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