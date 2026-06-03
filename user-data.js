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

// ========== 订单实时通知系统 ==========

let orderSubscription = null;
let unreadOrderCount = 0;
let notificationPermissionGranted = false;

// 请求通知权限
async function requestNotificationPermission() {
    if (!('Notification' in window)) return false;
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
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.3;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
        audioContext.resume();
        console.log('🔊 播放提示音');
    } catch(e) {
        console.log('播放音效失败:', e);
    }
}

// 显示浏览器通知
function showBrowserNotification(order) {
    if (!notificationPermissionGranted) return;
    let productsText = '';
    try {
        let products = order.products;
        if (typeof products === 'string') products = JSON.parse(products);
        if (Array.isArray(products)) {
            productsText = products.map(p => `${p.product_name} ×${p.quantity}`).join(', ');
        }
    } catch(e) {
        productsText = '新订单';
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

// 显示页面内弹窗
function showInAppNotification(order) {
    const existing = document.querySelector('.order-notification-toast');
    if (existing) existing.remove();
    let productsText = '';
    try {
        let products = order.products;
        if (typeof products === 'string') products = JSON.parse(products);
        if (Array.isArray(products)) {
            productsText = products.map(p => `${p.product_name} ×${p.quantity}`).join(', ');
        }
    } catch(e) {
        productsText = '新订单';
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
    setTimeout(() => toast.remove(), 8000);
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
                item.style.position = 'relative';
                item.appendChild(badge);
            }
            badge.textContent = unreadOrderCount > 99 ? '99+' : unreadOrderCount;
            badge.style.cssText = `position:absolute; top:-5px; right:-5px; background:#ef4444; color:white; font-size:10px; font-weight:600; padding:2px 6px; border-radius:20px; min-width:18px; text-align:center;`;
        } else if (badge) {
            badge.remove();
        }
    });
}

// 清除小红点
function clearOrderBadge() {
    unreadOrderCount = 0;
    updateOrderBadge();
    localStorage.setItem('last_read_order_time', new Date().toISOString());
    console.log('🧹 小红点已清除');
}

// 加载未读订单数量
async function loadUnreadOrderCount() {
    const user = getCurrentUser();
    if (!user) return;
    const lastReadTime = localStorage.getItem('last_read_order_time');
    let query = sb.from('user_orders').select('id', { count: 'exact' }).eq('uid', user.uid).eq('status', 'pending');
    if (lastReadTime) query = query.gt('created_at', lastReadTime);
    const { count, error } = await query;
    if (!error && count !== null) {
        unreadOrderCount = count;
        updateOrderBadge();
        console.log('📊 未读订单数:', unreadOrderCount);
    }
}

// 启动订单实时订阅
async function startOrderSubscription() {
    const user = getCurrentUser();
    if (!user) {
        console.log('❌ 用户未登录，无法启动订单订阅');
        return false;
    }
    
    console.log('✅ 启动订单订阅, UID:', user.uid);
    await requestNotificationPermission();
    await loadUnreadOrderCount();
    
    if (orderSubscription) {
        try { sb.removeChannel(orderSubscription); } catch(e) {}
        orderSubscription = null;
    }
    
    console.log('📡 创建 Supabase 订阅...');
    
    orderSubscription = sb
    .channel('realtime:orders-realtime')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'user_orders' }, 
            (payload) => {
                const newOrder = payload.new;
                console.log('🔔 收到新订单事件:', newOrder.order_no);
                console.log('订单UID:', newOrder.uid);
                console.log('当前用户UID:', getCurrentUser()?.uid);
                
                const currentUser = getCurrentUser();
                // 字符串比较，避免类型问题
                if (String(newOrder.uid) === String(currentUser?.uid) && newOrder.status === 'pending') {
                    console.log('✅ 条件满足，触发通知！');
                    unreadOrderCount++;
                    updateOrderBadge();
                    playNotificationSound();
                    showBrowserNotification(newOrder);
                    showInAppNotification(newOrder);
                    
                    // 如果在订单页面，刷新列表
                    if (window.location.pathname.includes('orders.html')) {
                        if (typeof window.refreshOrdersList === 'function') {
                            window.refreshOrdersList();
                        } else {
                            window.location.reload();
                        }
                    }
                } else {
                    console.log('❌ 条件不满足:', {
                        uidMatch: String(newOrder.uid) === String(currentUser?.uid),
                        statusMatch: newOrder.status === 'pending'
                    });
                }
            }
        )
        .subscribe((status) => {
            console.log('📡 订阅状态:', status);
            if (status === 'SUBSCRIBED') {
                console.log('✅ 实时订阅已连接！');
            }
        });
    
    return true;
}

// 停止订阅
function stopOrderSubscription() {
    if (orderSubscription) {
        try { sb.removeChannel(orderSubscription); } catch(e) {}
        orderSubscription = null;
        console.log('订阅已停止');
    }
}

// ========== 暴露全局函数 ==========
window.getCurrentUser = getCurrentUser;
window.startOrderSubscription = startOrderSubscription;
window.stopOrderSubscription = stopOrderSubscription;
window.clearOrderBadge = clearOrderBadge;
window.updateOrderBadge = updateOrderBadge;
window.playNotificationSound = playNotificationSound;
window.showBrowserNotification = showBrowserNotification;
window.showInAppNotification = showInAppNotification;
window.sb = sb;

// ========== 页面加载时自动启动 ==========
(function autoInit() {
    console.log('🚀 user-data.js 初始化...');
    const user = getCurrentUser();
    if (user) {
        console.log('用户已登录，启动订阅');
        startOrderSubscription();
    } else {
        console.log('用户未登录，等待登录');
    }
})();

// ========== 动画样式 ==========
if (!document.getElementById('notification-animation-style')) {
    const style = document.createElement('style');
    style.id = 'notification-animation-style';
    style.textContent = `
        @keyframes slideInRight {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
        }
        .order-notification-toast {
            position: fixed;
            top: 60px;
            right: 0;
            left: 0;
            z-index: 100000;
            pointer-events: auto;
        }
        .nav-item {
            position: relative;
        }
    `;
    document.head.appendChild(style);
}

// ========== 移除点击蓝色高亮 ==========
(function() {
    const style = document.createElement('style');
    style.textContent = `
        * { -webkit-tap-highlight-color: transparent !important; }
        *:active { transform: none !important; opacity: 1 !important; background: transparent !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);
})();

console.log('✅ user-data.js 加载完成');