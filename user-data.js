// user-data.js - 所有页面共享的用户数据管理

const SUPABASE_URL = 'https://ygeawapbjcfytjoxpttk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3X4gUSBt2i7OXB1IsajBiQ__NM-OIGn';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 获取当前登录用户
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch(e) { return null; }
}

// 从 Supabase 获取用户最新数据
async function fetchUserData(uid) {
    const { data, error } = await sb
        .from('users')
        .select('*')
        .eq('uid', uid)
        .single();
    
    if (error) {
        console.error('获取用户数据失败:', error);
        return null;
    }
    return data;
}

// 获取用户订单历史
async function fetchUserOrders(uid, limit = 50) {
    const { data, error } = await sb
        .from('order_history')
        .select('*')
        .eq('uid', uid)
        .order('date', { ascending: false })
        .limit(limit);
    
    if (error) return [];
    return data;
}

// 获取用户充值/奖励记录
async function fetchUserDeposits(uid) {
    const { data, error } = await sb
        .from('deposits')
        .select('*')
        .eq('uid', uid)
        .order('created_at', { ascending: false });
    
    if (error) return [];
    return data;
}

// 同步用户数据到 localStorage 并返回
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
        user.pin = freshData.pin || '';  // 👈 添加这行：同步 PIN
        user.inviteCode = freshData.invite_code || '';  // 👈 添加这行：同步邀请码
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
    return user;
}

// 更新用户余额
async function updateUserBalance(uid, newBalance, newTrialBonus = null) {
    const updateData = { balance: newBalance };
    if (newTrialBonus !== null) {
        updateData.trial_bonus_amount = newTrialBonus;
    }
    
    const { error } = await sb
        .from('users')
        .update(updateData)
        .eq('uid', uid);
    
    if (error) {
        console.error('更新余额失败:', error);
        return false;
    }
    
    const user = getCurrentUser();
    if (user && user.uid === uid) {
        user.balance = newBalance;
        if (newTrialBonus !== null) {
            user.trialBonusAmount = newTrialBonus;
        }
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
    return true;
}

// 检查登录状态
function checkLogin() {
    const user = getCurrentUser();
    if (!user || !user.isLoggedIn) {
        window.location.href = 'signin.html';
        return null;
    }
    return user;
}

// 获取用户总订单数和总佣金
async function fetchUserStats(uid) {
    const { data: orders } = await sb
        .from('order_history')
        .select('commission')
        .eq('uid', uid);
    
    const totalCommission = orders?.reduce((s, o) => s + (o.commission || 0), 0) || 0;
    const orderCount = orders?.length || 0;
    
    return { totalCommission, orderCount };
}

// ========== 触发订单相关函数 ==========

// 获取用户待完成的触发订单（pending 且 trigger_order_number <= 当前订单数 + 1）
async function getUserPendingTriggerOrder(uid) {
    // 先获取用户当前订单总数
    const { data: orders } = await sb
        .from('order_history')
        .select('id', { count: 'exact' })
        .eq('uid', uid);
    
    const currentOrderCount = orders?.length || 0;
    const nextOrderNumber = currentOrderCount + 1;
    
    // 查找触发订单数 <= 下一个订单数的 pending 订单
    const { data: triggers, error } = await sb
        .from('user_trigger_orders')
        .select('*')
        .eq('uid', uid)
        .eq('status', 'pending')
        .lte('trigger_order_number', nextOrderNumber)
        .order('trigger_order_number', { ascending: true })
        .limit(1);
    
    if (error) {
        console.error('获取触发订单失败:', error);
        return null;
    }
    
    return triggers?.[0] || null;
}

// 检查用户是否有待完成的触发订单（用于判断负数状态）
async function hasPendingTriggerOrder(uid) {
    const trigger = await getUserPendingTriggerOrder(uid);
    return trigger !== null;
}

// 获取触发订单的 Pending 金额（完成后的预期总余额）
async function getTriggerOrderPendingAmount(uid, currentBalance, triggerOrder) {
    if (!triggerOrder) {
        triggerOrder = await getUserPendingTriggerOrder(uid);
    }
    
    if (!triggerOrder) return 0;
    
    const matchedPrice = triggerOrder.matched_price || 0;
    const commission = triggerOrder.commission_amount || 0;
    
    // Pending = 当前余额 + 订单价格 + 佣金
    return currentBalance + matchedPrice + commission;
}

// 完成触发订单（用户提交订单后调用）
async function completeTriggerOrder(uid, triggerOrder) {
    if (!triggerOrder) return false;
    
    const matchedPrice = triggerOrder.matched_price || 0;
    const commission = triggerOrder.commission_amount || 0;
    
    // 获取用户当前余额
    const { data: userData } = await sb
        .from('users')
        .select('balance')
        .eq('uid', uid)
        .single();
    
    const currentBalance = userData?.balance || 0;
    
    // 新余额 = 当前余额 + 订单价格 + 佣金
    const newBalance = currentBalance + matchedPrice + commission;
    
    // 更新余额
    const { error: balanceError } = await sb
        .from('users')
        .update({ balance: newBalance })
        .eq('uid', uid);
    
    if (balanceError) {
        console.error('更新余额失败:', balanceError);
        return false;
    }
    
    // 标记触发订单为已完成
    const { error: updateError } = await sb
        .from('user_trigger_orders')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString()
        })
        .eq('id', triggerOrder.id);
    
    if (updateError) {
        console.error('更新触发订单状态失败:', updateError);
        return false;
    }
    
    // 更新本地用户数据
    const localUser = getCurrentUser();
    if (localUser && localUser.uid === uid) {
        localUser.balance = newBalance;
        localStorage.setItem('currentUser', JSON.stringify(localUser));
    }
    
    return true;
}

// 取消触发订单（后台用）
async function cancelTriggerOrder(triggerId) {
    const { error } = await sb
        .from('user_trigger_orders')
        .update({ status: 'cancelled' })
        .eq('id', triggerId);
    
    return !error;
}

// ========== 彻底移除所有点击闪动/蓝色格子 ==========
(function() {
    // 移除点击高亮
    const style = document.createElement('style');
    style.textContent = `
        * {
            -webkit-tap-highlight-color: transparent !important;
        }
        *:active {
            transform: none !important;
            scale: none !important;
            opacity: 1 !important;
            background: transparent !important;
            background-color: transparent !important;
            box-shadow: none !important;
            outline: none !important;
            transition: none !important;
        }
        button:active, .btn:active, .nav-item:active, .stat-card:active,
        .product-card:active, .overview-card:active, .day-card:active,
        [onclick]:active, a:active, div:active, span:active, i:active {
            transform: none !important;
            opacity: 1 !important;
            background: transparent !important;
            box-shadow: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // 监听动态添加的元素，确保新元素也生效
    const observer = new MutationObserver(() => {
        document.querySelectorAll('*').forEach(el => {
            el.style.setProperty('-webkit-tap-highlight-color', 'transparent', 'important');
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();

// ========== 订单相关函数 ==========

// 获取用户待处理订单
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

// 获取用户处理中订单
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

// 获取用户已完成订单
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

// 确认订单（发货）
async function confirmOrderShipment(orderNo, uid) {
    const { data: order, error: fetchError } = await sb
        .from('user_orders')
        .select('*')
        .eq('order_no', orderNo)
        .eq('uid', uid)
        .single();
    
    if (fetchError || !order) {
        return { success: false, error: '订单不存在' };
    }
    
    if (order.status !== 'pending') {
        return { success: false, error: '订单状态错误' };
    }
    
    // 检查余额
    const { data: user } = await sb.from('users').select('balance').eq('uid', uid).single();
    if ((user?.balance || 0) < order.total_supply_price) {
        return { success: false, error: '余额不足' };
    }
    
    // 扣除供应价
    const newBalance = (user?.balance || 0) - order.total_supply_price;
    await sb.from('users').update({ balance: newBalance }).eq('uid', uid);
    
    // 返还供应价 + 佣金
    const finalBalance = newBalance + order.total_supply_price + order.total_commission;
    await sb.from('users').update({ balance: finalBalance }).eq('uid', uid);
    
    // 生成物流时间线
    const timeline = generateTrackingTimeline();
    
    // 更新订单
    await sb.from('user_orders').update({
        status: 'processing',
        tracking_status: 'processing',
        tracking_timeline: JSON.stringify(timeline),
        completed_at: new Date().toISOString()
    }).eq('order_no', orderNo);
    
    // 记录订单历史
    try {
        const products = JSON.parse(order.products || '[]');
        for (const product of products) {
            for (let i = 0; i < product.quantity; i++) {
                await sb.from('order_history').insert({
                    uid: uid,
                    username: user.username,
                    order_code: orderNo,
                    accommodation_name: product.product_name,
                    price: product.unit_price,
                    commission: product.commission / product.quantity,
                    date: new Date().toISOString()
                });
            }
        }
    } catch(e) {
        console.error('记录订单历史失败:', e);
    }
    
    return { success: true };
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

// ========== 订单实时通知系统 ==========

let orderSubscription = null;
let unreadOrderCount = 0;
let notificationPermissionGranted = false;

// 请求通知权限
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('浏览器不支持通知');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        notificationPermissionGranted = true;
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        notificationPermissionGranted = permission === 'granted';
        return notificationPermissionGranted;
    }
    
    return false;
}

// 播放提示音
function playNotificationSound() {
    try {
        // 使用 Web Audio API 生成简单提示音（不依赖外部文件）
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 880; // 高音
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        audioContext.resume();
    } catch(e) {
        console.log('播放音效失败:', e);
    }
}

// 显示浏览器通知
function showBrowserNotification(order) {
    if (!notificationPermissionGranted) return;
    
    let productsText = '';
    try {
        const products = JSON.parse(order.products || '[]');
        productsText = products.map(p => `${p.product_name} ×${p.quantity}`).join(', ');
    } catch(e) {
        productsText = order.products || '订单';
    }
    
    const notification = new Notification('📦 新订单通知', {
        body: `订单号：${order.order_no}\n产品：${productsText}\n总价：€${(order.total_supply_price || 0).toFixed(2)}`,
        icon: 'https://ygeawapbjcfytjoxpttk.supabase.co/storage/v1/object/public/logos/cj.png',
        tag: order.order_no,
        requireInteraction: true
    });
    
    notification.onclick = () => {
        window.focus();
        window.location.href = 'orders.html';
        notification.close();
    };
    
    setTimeout(() => notification.close(), 10000);
}

// 显示页面内弹窗通知
function showInAppNotification(order) {
    // 移除已有的通知
    const existing = document.querySelector('.order-notification-toast');
    if (existing) existing.remove();
    
    let productsText = '';
    try {
        const products = JSON.parse(order.products || '[]');
        productsText = products.map(p => `${p.product_name} ×${p.quantity}`).join(', ');
    } catch(e) {
        productsText = order.products || '订单';
    }
    
    const toast = document.createElement('div');
    toast.className = 'order-notification-toast';
    toast.innerHTML = `
        <div style="background: linear-gradient(135deg, #ff7a00, #ff9f43); border-radius: 20px; padding: 16px; margin: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); animation: slideInRight 0.4s ease forwards;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 48px; height: 48px; background: white; border-radius: 24px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-gift" style="color: #ff7a00; font-size: 24px;"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: white;">新订单通知</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.9);">${order.order_no}</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.8);">${productsText.substring(0, 30)}</div>
                </div>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">✕</button>
            </div>
            <div style="margin-top: 12px;">
                <button onclick="window.location.href='orders.html'" style="width: 100%; background: white; border: none; padding: 8px; border-radius: 30px; color: #ff7a00; font-weight: 600; cursor: pointer;">查看订单 →</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // 5秒后自动移除
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 8000);
}

// 更新底部导航小红点
function updateOrderBadge() {
    const orderNavItems = document.querySelectorAll('.nav-item[data-page="orders"]');
    orderNavItems.forEach(item => {
        let badge = item.querySelector('.order-badge');
        
        if (unreadOrderCount > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'order-badge';
                item.appendChild(badge);
            }
            badge.textContent = unreadOrderCount > 99 ? '99+' : unreadOrderCount;
            badge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 20px;
                min-width: 18px;
                text-align: center;
            `;
            item.style.position = 'relative';
        } else if (badge) {
            badge.remove();
        }
    });
}

// 清除小红点（进入订单页面时调用）
function clearOrderBadge() {
    unreadOrderCount = 0;
    updateOrderBadge();
    // 存储已读状态
    localStorage.setItem('last_read_order_time', new Date().toISOString());
}

// 加载未读订单数量
async function loadUnreadOrderCount() {
    const user = getCurrentUserFromLocal();
    if (!user) return;
    
    const lastReadTime = localStorage.getItem('last_read_order_time');
    
    let query = sb.from('user_orders').select('id', { count: 'exact' }).eq('uid', user.uid).eq('status', 'pending');
    
    if (lastReadTime) {
        query = query.gt('created_at', lastReadTime);
    }
    
    const { count, error } = await query;
    
    if (!error && count !== null) {
        unreadOrderCount = count;
        updateOrderBadge();
    }
}

// 启动订单实时订阅
async function startOrderSubscription() {
    const user = getCurrentUserFromLocal();
    if (!user) return;
    
    // 请求通知权限
    requestNotificationPermission();
    
    // 加载未读数量
    await loadUnreadOrderCount();
    
    // 取消已有订阅
    if (orderSubscription) {
        sb.removeChannel(orderSubscription);
    }
    
    // 创建新订阅
    orderSubscription = sb
        .channel('orders-realtime')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'user_orders',
                filter: `uid=eq.${user.uid}`
            },
            (payload) => {
                const newOrder = payload.new;
                console.log('📦 收到新订单:', newOrder);
                
                // 只通知 pending 状态的订单
                if (newOrder.status === 'pending') {
                    // 增加未读计数
                    unreadOrderCount++;
                    updateOrderBadge();
                    
                    // 播放音效
                    playNotificationSound();
                    
                    // 显示浏览器通知
                    showBrowserNotification(newOrder);
                    
                    // 显示页面内弹窗
                    showInAppNotification(newOrder);
                    
                    // 如果当前在 orders 页面，刷新列表
                    if (window.location.pathname.includes('orders.html')) {
                        if (window.refreshOrdersList) {
                            window.refreshOrdersList();
                        } else {
                            window.location.reload();
                        }
                    }
                }
            }
        )
        .subscribe((status) => {
            console.log('订单订阅状态:', status);
        });
}

// 停止订单订阅
function stopOrderSubscription() {
    if (orderSubscription) {
        sb.removeChannel(orderSubscription);
        orderSubscription = null;
    }
}

// 获取当前用户的辅助函数
function getCurrentUserFromLocal() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch(e) { return null; }
}

// 添加动画样式
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInRight {
        0% {
            transform: translateX(100%);
            opacity: 0;
        }
        100% {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .order-notification-toast {
        position: fixed;
        top: 60px;
        right: 0;
        left: 0;
        z-index: 10000;
        pointer-events: auto;
    }
`;
document.head.appendChild(notificationStyle);

// 页面加载时启动订阅
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (getCurrentUserFromLocal()) {
            startOrderSubscription();
        }
    });
} else {
    if (getCurrentUserFromLocal()) {
        startOrderSubscription();
    }
}