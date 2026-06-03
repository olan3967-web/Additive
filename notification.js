// notification.js - 独立订单通知系统（金属质感 + 流光溢彩 + 声音修复）

let lastCheckTime = localStorage.getItem('last_order_check_time') || new Date().toISOString();
let unreadCount = 0;

// ========== 音频预加载 ==========
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// 用户首次点击激活音频
document.addEventListener('click', function initAudioOnClick() {
    initAudio();
    document.removeEventListener('click', initAudioOnClick);
    console.log('🔊 音频已激活');
}, { once: true });

function playSound() {
    try {
        initAudio();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.frequency.value = 880;
        gain.gain.value = 0.25;
        oscillator.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
        oscillator.stop(audioContext.currentTime + 0.3);
        console.log('🔊 声音播放成功');
    } catch(e) {
        console.log('🔊 声音播放失败:', e);
    }
}

// ========== 弹窗函数 ==========
function showPopup(order) {
    const existingStack = document.querySelector('.toast-stack');
    let stack = existingStack;
    
    if (!stack) {
        stack = document.createElement('div');
        stack.className = 'toast-stack';
        document.body.appendChild(stack);
    }
    
    const toast = document.createElement('div');
    toast.className = 'order-toast-metal';
    
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
    
    toast.innerHTML = `
        <div class="toast-metal-content">
            <div class="toast-metal-icon">
                <i class="fas fa-gift"></i>
            </div>
            <div class="toast-metal-info">
                <div class="toast-metal-title">📦 新订单通知</div>
                <div class="toast-metal-order">${order.order_no}</div>
                <div class="toast-metal-product">${productsText.substring(0, 35)}</div>
            </div>
            <div class="toast-metal-amount">€${(order.total_supply_price || 0).toFixed(2)}</div>
            <div class="toast-metal-close">
                <i class="fas fa-times"></i>
            </div>
        </div>
        <div class="toast-metal-progress"></div>
        <div class="toast-metal-shimmer"></div>
    `;
    
    stack.insertBefore(toast, stack.firstChild);
    
    let timeoutId = setTimeout(() => removeToast(toast), 5000);
    
    const closeBtn = toast.querySelector('.toast-metal-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(timeoutId);
        removeToast(toast);
    });
    
    toast.addEventListener('click', (e) => {
        if (e.target.closest('.toast-metal-close')) return;
        clearTimeout(timeoutId);
        removeToast(toast);
        window.location.href = 'orders.html';
    });
    
    toast._timeoutId = timeoutId;
}

function removeToast(toast) {
    toast.classList.add('exit');
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 300);
}

function updateBadge() {
    const ordersBtn = document.querySelector('.nav-item[data-page="orders"]');
    if (!ordersBtn) return;
    let badge = ordersBtn.querySelector('.order-badge');
    if (unreadCount > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'order-badge';
            ordersBtn.style.position = 'relative';
            ordersBtn.appendChild(badge);
        }
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.cssText = 'position:absolute;top:-5px;right:-5px;background:#ef4444;color:white;font-size:10px;padding:2px 6px;border-radius:20px;';
    } else if (badge) {
        badge.remove();
    }
}

function clearOrderBadge() {
    unreadCount = 0;
    const ordersBtn = document.querySelector('.nav-item[data-page="orders"]');
    if (ordersBtn) {
        const badge = ordersBtn.querySelector('.order-badge');
        if (badge) badge.remove();
    }
    localStorage.setItem('last_order_check_time', new Date().toISOString());
    console.log('🧹 小红点已清除');
}

async function checkOrders() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    if (typeof sb === 'undefined') {
        console.log('等待 sb 初始化...');
        return;
    }
    
    try {
        const { data, error } = await sb
            .from('user_orders')
            .select('*')
            .eq('uid', user.uid)
            .eq('status', 'pending')
            .gt('created_at', lastCheckTime);
        
        if (error) {
            console.error('检查订单失败:', error);
            return;
        }
        
        if (data && data.length > 0) {
            console.log(`发现 ${data.length} 个新订单`);
            
            for (const order of data) {
                playSound();
                showPopup(order);
                unreadCount++;
                updateBadge();
                
                if (Notification.permission === 'granted') {
                    new Notification('📦 新订单', {
                        body: `${order.order_no} - €${(order.total_supply_price || 0).toFixed(2)}`,
                        icon: 'https://ygeawapbjcfytjoxpttk.supabase.co/storage/v1/object/public/logos/cj.png'
                    });
                }
            }
            
            lastCheckTime = new Date().toISOString();
            localStorage.setItem('last_order_check_time', lastCheckTime);
        }
    } catch(e) {
        console.error('检查订单出错:', e);
    }
}

// ========== 样式 ==========
const style = document.createElement('style');
style.textContent = `
    .toast-stack {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100000;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 12px;
        pointer-events: none;
    }
    
    .order-toast-metal {
        pointer-events: auto;
        width: 100%;
        max-width: 380px;
        margin: 0 auto;
        position: relative;
        background: linear-gradient(145deg, #2a2a3e, #1a1a2e);
        border-radius: 20px;
        border-bottom: 3px solid #ff7a00;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
        animation: metalSlideIn 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
        overflow: hidden;
        cursor: pointer;
    }
    
    .order-toast-metal.exit {
        animation: metalSlideOut 0.3s ease forwards;
    }
    
    @keyframes metalSlideIn {
        0% { opacity: 0; transform: translateY(-80px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes metalSlideOut {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-80px); }
    }
    
    .toast-metal-content {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        position: relative;
        z-index: 2;
    }
    
    .toast-metal-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(145deg, #3a3a50, #2a2a3e);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .toast-metal-icon i {
        font-size: 22px;
        color: #ff7a00;
    }
    
    .toast-metal-info {
        flex: 1;
    }
    
    .toast-metal-title {
        font-size: 13px;
        font-weight: 700;
        color: #e0e0f0;
        letter-spacing: 0.5px;
    }
    
    .toast-metal-order {
        font-size: 11px;
        color: #ff9f43;
        font-family: monospace;
        margin-top: 3px;
    }
    
    .toast-metal-product {
        font-size: 10px;
        color: #a0a0c0;
        margin-top: 2px;
    }
    
    .toast-metal-amount {
        font-size: 16px;
        font-weight: 800;
        background: linear-gradient(135deg, #ff9f43, #ffcc00);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }
    
    .toast-metal-close {
        width: 28px;
        height: 28px;
        background: rgba(255,255,255,0.05);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .toast-metal-close:hover {
        background: rgba(255,255,255,0.15);
    }
    
    .toast-metal-close i {
        font-size: 12px;
        color: rgba(255,255,255,0.5);
    }
    
    .toast-metal-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        width: 100%;
        background: linear-gradient(90deg, #ff7a00, #ffcc00);
        animation: progressShrink 5s linear forwards;
        border-radius: 0 0 20px 20px;
    }
    
    @keyframes progressShrink {
        0% { width: 100%; }
        100% { width: 0%; }
    }
    
    .toast-metal-shimmer {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, 
            transparent,
            rgba(255, 255, 255, 0.6),
            rgba(255, 200, 100, 0.8),
            rgba(255, 255, 255, 0.6),
            transparent
        );
        animation: shimmerFlow 2.5s ease-in-out infinite;
        z-index: 3;
        pointer-events: none;
        border-radius: 3px;
    }
    
    @keyframes shimmerFlow {
        0% { left: -100%; }
        50% { left: 100%; }
        100% { left: 100%; }
    }
`;
document.head.appendChild(style);

// ========== 启动轮询 ==========
let interval = setInterval(checkOrders, 10000);
checkOrders();

if (Notification && Notification.permission !== 'denied') {
    Notification.requestPermission();
}

window.clearOrderBadge = clearOrderBadge;
window.updateOrderBadge = updateBadge;

console.log('✅ 通知系统已启动（金属质感 + 流光溢彩 + 声音）');