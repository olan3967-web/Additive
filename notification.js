// notification.js - 独立订单通知系统
const NOTIFY_SUPABASE_URL = 'https://ygeawapbjcfytjoxpttk.supabase.co';
const NOTIFY_SUPABASE_KEY = 'sb_publishable_3X4gUSBt2i7OXB1IsajBiQ__NM-OIGn';
const notifySb = supabase.createClient(NOTIFY_SUPABASE_URL, NOTIFY_SUPABASE_KEY);

let lastCheckTime = localStorage.getItem('last_order_check_time') || new Date().toISOString();
let unreadCount = 0;

function playSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.frequency.value = 880;
        gain.gain.value = 0.3;
        oscillator.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
        audioContext.resume();
    } catch(e) { console.log('声音失败:', e); }
}

function showPopup(order) {
    const existing = document.querySelector('.order-popup');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.className = 'order-popup';
    div.innerHTML = `
        <div style="position:fixed;top:60px;left:10px;right:10px;background:linear-gradient(135deg,#ff7a00,#ff9f43);color:white;padding:16px;border-radius:20px;z-index:100000;box-shadow:0 4px 12px rgba(0,0,0,0.3);text-align:center;animation:slideDown 0.3s ease;">
            <strong>📦 新订单！</strong><br>
            订单号: ${order.order_no}<br>
            金额: €${order.total_supply_price}
            <button onclick="window.location.href='orders.html'" style="margin-top:10px;background:white;border:none;padding:8px 20px;border-radius:30px;color:#ff7a00;font-weight:bold;">查看</button>
        </div>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 8000);
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

async function checkOrders() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    const { data, error } = await notifySb
        .from('user_orders')
        .select('*')
        .eq('uid', user.uid)
        .eq('status', 'pending')
        .gt('created_at', lastCheckTime);
    
    if (error || !data || data.length === 0) return;
    
    for (const order of data) {
        playSound();
        showPopup(order);
        unreadCount++;
        updateBadge();
        
        if (Notification.permission === 'granted') {
            new Notification('📦 新订单', { body: `${order.order_no} - €${order.total_supply_price}` });
        }
    }
    
    lastCheckTime = new Date().toISOString();
    localStorage.setItem('last_order_check_time', lastCheckTime);
}

let interval = setInterval(checkOrders, 10000);
checkOrders();

if (Notification && Notification.permission !== 'denied') {
    Notification.requestPermission();
}

const style = document.createElement('style');
style.textContent = `@keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}.order-popup{animation:slideDown 0.3s ease;}`;
document.head.appendChild(style);

console.log('✅ 通知系统已启动，每10秒检查一次');