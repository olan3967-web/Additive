// admin-setorders.js - 后台设置订单（Timer 输入框 + Manual Release）

let setordersSearchKeyword = '';
let selectedUser = null;
let orderItems = [];
let manualReleaseOrders = [];
let paymentReleaseTimer = null;

function generateRandomBuyer() {
    const firstNames = ['Liam', 'Emma', 'Noah', 'Olivia', 'John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Anderson'];
    const cities = ['London', 'Berlin', 'Paris', 'Madrid', 'Rome', 'Amsterdam', 'Vienna', 'Brussels', 'Zurich', 'Stockholm'];
    const name = firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)];
    const phone = '+' + Math.floor(Math.random() * 90 + 10) + '****' + Math.floor(Math.random() * 9000 + 1000);
    const address = Math.floor(Math.random() * 200 + 1) + ' Main Street, ' + cities[Math.floor(Math.random() * cities.length)] + ', Europe';
    return { name, phone, address };
}

// ========== 加载 Manual Release 订单 ==========
async function loadManualReleaseOrders() {
    try {
        // 查询：status = 'processing' 且 payment_release_timer IS NULL 的订单
        const { data: orders, error } = await sb
            .from('user_orders')
            .select('*')
            .eq('status', 'processing')
            .is('payment_release_timer', null)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        manualReleaseOrders = orders || [];
        renderManualReleaseCard();
    } catch (err) { 
        console.error('加载 Manual Release 订单失败:', err);
        manualReleaseOrders = [];
        renderManualReleaseCard();
    }
}

function renderManualReleaseCard() {
    const container = document.getElementById('manualReleaseContainer');
    if (!container) return;
    
    if (manualReleaseOrders.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = `
        <div style="background: rgba(15,25,40,0.9); border-radius: 16px; padding: 16px; margin-top: 20px; border: 1px solid rgba(255,122,0,0.3);">
            <h4 style="color: #ffb84d; margin-bottom: 12px;"><i class="fas fa-hand-pointer"></i> Manual Release</h4>
            <div style="max-height: 300px; overflow-y: auto;">
                ${manualReleaseOrders.map(order => `
                    <div style="background: #0f172a; border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <div style="font-weight:700; color:#ffb84d;">${order.order_no}</div>
                                <div style="font-size:11px; color:#8a9abb;">User: ${order.uid} | €${order.total_supply_price}</div>
                            </div>
                            <button class="release-order-btn" data-order="${order.order_no}" style="background:#2f6b3a; border:none; padding:6px 16px; border-radius:20px; color:white; cursor:pointer;">
                                <i class="fas fa-play"></i> Release Now
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.querySelectorAll('.release-order-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await triggerPaymentRelease(btn.dataset.order);
            await loadManualReleaseOrders();
            showToast(`已释放订单 ${btn.dataset.order}`, 'success');
        });
    });
}

// ========== 触发 Payment Release（修复版） ==========
async function triggerPaymentRelease(orderNo) {
    try {
        const { data: order } = await sb.from('user_orders').select('*').eq('order_no', orderNo).single();
        if (!order) return false;
        
        let timeline = [];
        try {
            timeline = typeof order.tracking_timeline === 'string' 
                ? JSON.parse(order.tracking_timeline) 
                : (order.tracking_timeline || []);
        } catch(e) { timeline = []; }
        
        // 1. 找到并更新 Payment released (pending) 为 Payment released（立即打勾）
        let paymentReleasedTime = new Date();
        let foundPending = false;
        for (let i = 0; i < timeline.length; i++) {
            if (timeline[i].status === "Payment released (pending)") {
                timeline[i] = { status: "Payment released", time: paymentReleasedTime.toISOString() };
                foundPending = true;
                break;
            }
        }
        
        if (!foundPending) return false;
        
        // 2. 计算后续状态的时间
        const orderConfirmedDelay = 5 + Math.random() * 5;      // 5-10分钟
        const preparingDelay = 30 + Math.random() * 30;         // 30-60分钟
        
        let currentTime = new Date(paymentReleasedTime);
        const orderConfirmedTime = new Date(currentTime.getTime() + orderConfirmedDelay * 60 * 1000);
        const preparingTime = new Date(orderConfirmedTime.getTime() + preparingDelay * 60 * 1000);
        
        // 3. 更新 Order confirmed 为橙色等待状态（设置未来时间）
        let orderConfirmedUpdated = false;
        let preparingUpdated = false;
        
        for (let i = 0; i < timeline.length; i++) {
            if (timeline[i].status === "Order confirmed" && timeline[i].isPending) {
                timeline[i] = { status: "Order confirmed", time: orderConfirmedTime.toISOString() };
                orderConfirmedUpdated = true;
            }
            if (timeline[i].status === "Preparing parcel for shipment" && timeline[i].isPending) {
                timeline[i] = { status: "Preparing parcel for shipment", time: preparingTime.toISOString() };
                preparingUpdated = true;
            }
        }
        
        // 4. 剩余7个状态在3-4天内按顺序分配
        const remainingStatuses = [
            "Courier assigned",
            "Parcel picked up by logistics partner",
            "Parcel arrived at sorting facility",
            "Parcel departed from sorting facility",
            "Parcel arrived at delivery hub",
            "Parcel out for delivery",
            "Parcel delivered"
        ];
        
        const totalMs = (3 + Math.random() * 1) * 24 * 60 * 60 * 1000;  // 3-4天
        let intervals = [];
        let remaining = totalMs;
        for (let i = 0; i < remainingStatuses.length; i++) {
            const gap = (remaining / (remainingStatuses.length - i)) * (0.3 + Math.random() * 0.7);
            intervals.push(gap);
            remaining -= gap;
        }
        
        let laterTime = new Date(preparingTime);
        let remainingIndex = 0;
        for (let i = 0; i < timeline.length; i++) {
            if (timeline[i].isPending && remainingStatuses.includes(timeline[i].status)) {
                laterTime = new Date(laterTime.getTime() + intervals[remainingIndex]);
                timeline[i] = { status: remainingStatuses[remainingIndex], time: laterTime.toISOString() };
                remainingIndex++;
            }
        }
        
        // 5. 返还余额（货款 + 佣金）
        const { data: user } = await sb.from('users').select('balance').eq('uid', order.uid).single();
        const refundAmount = (order.total_supply_price || 0) + (order.total_commission || 0);
        const newBalance = (user?.balance || 0) + refundAmount;
        await sb.from('users').update({ balance: newBalance }).eq('uid', order.uid);
        
        await sb.from('deposits').insert([{
            uid: order.uid,
            username: order.username,
            amount: refundAmount,
            type: 'order_settlement',
            created_at: new Date().toISOString()
        }]);
        
        // 6. 更新订单的 tracking_timeline
        await sb.from('user_orders').update({
            tracking_timeline: JSON.stringify(timeline)
        }).eq('order_no', orderNo);
        
        // 7. 更新本地用户余额
        const localUser = getCurrentUser();
        if (localUser && localUser.uid === order.uid) {
            localUser.balance = newBalance;
            localStorage.setItem('currentUser', JSON.stringify(localUser));
        }
        
        console.log(`订单 ${orderNo} Payment Release 已激活，状态已更新`);
        return true;
        
    } catch (err) {
        console.error('触发 Payment Release 失败:', err);
        return false;
    }
}

// ========== 页面加载函数 ==========
async function loadSetordersPage() {
    const container = document.getElementById('page_setorders');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="search-bar" style="justify-content: space-between;">
                <h3><i class="fas fa-cog"></i> Set Orders</h3>
                <button id="backToUserList" class="btn-primary" style="display:none;">← Back to Users</button>
            </div>
            <div id="setordersUserSearch">
                <div class="search-bar">
                    <input type="text" id="setordersSearchUid" placeholder="🔍 Search UID or Username" class="search-input">
                    <button id="setordersSearchBtn" class="btn-primary">🔍 Search</button>
                </div>
                <div id="setordersUserList" class="table-container" style="max-height:300px;">
                    <table class="data-table"><thead><tr><th>UID</th><th>Username</th><th>Action</th></tr></thead><tbody id="setordersUserTableBody"></tbody></table>
                </div>
            </div>
            <div id="setordersMain" style="display:none;">
                <div style="background:rgba(74,124,255,0.1); padding:10px 16px; border-radius:12px; margin-bottom:20px;">
                    Current User: <span id="selectedUidDisplay" style="color:#4a7cff;"></span> - <span id="selectedUsernameDisplay"></span>
                </div>
                <div id="userProductsList" style="max-height:500px; overflow-y:auto; margin-bottom:20px; display:flex; flex-wrap:wrap; gap:12px;"></div>
                
                <!-- Timer 输入框 -->
                <div style="background:rgba(74,124,255,0.08); border:1px solid rgba(74,124,255,0.2); border-radius:16px; padding:16px; margin-bottom:20px;">
                    <h4 style="color:#ffb84d;"><i class="fas fa-hourglass-half"></i> Payment Release Timer</h4>
                    <input type="number" id="paymentTimerInput" placeholder="输入分钟数 (留空则进入 Manual Release)" style="width:100%; background:#0f172a; border:1px solid #1e2a3a; border-radius:8px; padding:12px; color:#fff;">
                    <div style="font-size:12px; color:#6a7a9a; margin-top:12px;">
                        <i class="fas fa-info-circle"></i> 输入分钟后自动触发 Payment Release。留空则进入 Manual Release 列表。
                    </div>
                </div>
                
                <!-- Order Summary -->
                <div id="orderSummary" style="background:#0f172a; border-radius:16px; padding:16px; border:1px solid rgba(74,124,255,0.2);">
                    <h4 style="margin-bottom:12px; color:#ffb84d;"><i class="fas fa-receipt"></i> Order Summary</h4>
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Total Supply Price:</span><span id="totalSupplyPrice" style="color:#ffb84d; font-weight:700;">€0</span></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Total Commission:</span><span id="totalCommission" style="color:#2ed15a; font-weight:700;">€0</span></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:16px;"><span>Final Account Increase:</span><span id="totalIncrease" style="color:#4a7cff; font-weight:700;">€0</span></div>
                    <button id="confirmSetOrderBtn" class="success" style="width:100%; padding:12px;"><i class="fas fa-check"></i> Create Order</button>
                </div>
                
                <!-- Manual Release 卡片 -->
                <div id="manualReleaseContainer" style="margin-top:20px; display:none;"></div>
            </div>
        </div>
    `;
    
    await loadUserList();
    await loadManualReleaseOrders();
    
    document.getElementById('setordersSearchBtn')?.addEventListener('click', () => {
        setordersSearchKeyword = document.getElementById('setordersSearchUid').value.trim();
        loadUserList();
    });
    
    document.getElementById('backToUserList')?.addEventListener('click', () => {
        document.getElementById('setordersUserSearch').style.display = 'block';
        document.getElementById('setordersMain').style.display = 'none';
        selectedUser = null;
        orderItems = [];
        paymentReleaseTimer = null;
        document.getElementById('paymentTimerInput').value = '';
    });
    
    document.getElementById('confirmSetOrderBtn')?.addEventListener('click', confirmSetOrder);
    document.getElementById('paymentTimerInput')?.addEventListener('input', (e) => {
        paymentReleaseTimer = e.target.value ? parseInt(e.target.value) : null;
    });
}

async function loadUserList() {
    let query = sb.from('users').select('uid, username').order('created_at', { ascending: false });
    if (setordersSearchKeyword) query = query.or(`uid.ilike.%${setordersSearchKeyword}%,username.ilike.%${setordersSearchKeyword}%`);
    const { data: users } = await query;
    const tbody = document.getElementById('setordersUserTableBody');
    if (tbody && users) {
        tbody.innerHTML = '';
        for (let u of users) {
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<span class="badge">${u.uid}</span>`;
            row.insertCell(1).innerText = u.username;
            row.insertCell(2).innerHTML = `<button class="setorder-select-btn" data-uid="${u.uid}" data-name="${u.username}" style="background:#4a7cff; padding:6px 16px; border-radius:20px; border:none; color:white; cursor:pointer;">Set Orders</button>`;
        }
        document.querySelectorAll('.setorder-select-btn').forEach(btn => btn.addEventListener('click', () => selectUser(btn.dataset.uid, btn.dataset.name)));
    }
}

async function selectUser(uid, username) {
    selectedUser = { uid, username };
    document.getElementById('selectedUidDisplay').innerText = uid;
    document.getElementById('selectedUsernameDisplay').innerText = username;
    await loadUserProducts(uid);
    document.getElementById('setordersUserSearch').style.display = 'none';
    document.getElementById('setordersMain').style.display = 'block';
}

async function loadUserProducts(uid) {
    const container = document.getElementById('userProductsList');
    container.innerHTML = '<div style="text-align:center; padding:40px;">Loading...</div>';
    const { data: products } = await sb.from('user_products').select('*').eq('uid', uid).order('added_at', { ascending: false });
    if (!products || products.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#aaa;">No products added by this user</div>';
        return;
    }
    orderItems = products.map(p => ({
        product_id: p.product_id || p.id,
        product_name: p.product_name,
        price: p.price,
        margin_profit: p.margin_profit,
        quantity: 0,
        image_url: p.image_url
    }));
    renderProducts();
}

function renderProducts() {
    const container = document.getElementById('userProductsList');
    container.innerHTML = '';
    container.style.cssText = 'display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;';
    for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        const div = document.createElement('div');
        div.style.cssText = 'background:#0f172a; border-radius:16px; padding:12px; width:calc(16.666% - 10px); min-width:140px; text-align:center; border:1px solid rgba(74,124,255,0.2);';
        div.innerHTML = `
            <img src="${item.image_url || 'https://placehold.co/80x80/1e2a3a/4a7cff?text=No+Image'}" style="width:80px; height:80px; border-radius:12px; margin-bottom:10px;">
            <div style="font-weight:600; color:#ffb84d;">${item.product_name}</div>
            <div style="font-size:11px; color:#8a9abb;">€${item.price} | +€${item.margin_profit}</div>
            <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-top:10px;">
                <button class="qty-decr" data-index="${i}" style="background:#4a7cff; width:28px; height:28px; border-radius:6px; color:white;">-</button>
                <span id="qty_${i}" style="min-width:30px;">${item.quantity}</span>
                <button class="qty-incr" data-index="${i}" style="background:#4a7cff; width:28px; height:28px; border-radius:6px; color:white;">+</button>
            </div>
        `;
        container.appendChild(div);
    }
    document.querySelectorAll('.qty-decr').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            if (orderItems[idx].quantity > 0) {
                orderItems[idx].quantity--;
                document.getElementById(`qty_${idx}`).innerText = orderItems[idx].quantity;
                updateSummary();
            }
        });
    });
    document.querySelectorAll('.qty-incr').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            orderItems[idx].quantity++;
            document.getElementById(`qty_${idx}`).innerText = orderItems[idx].quantity;
            updateSummary();
        });
    });
    updateSummary();
}

function updateSummary() {
    let totalSupply = 0, totalCommission = 0;
    for (const item of orderItems) {
        totalSupply += item.price * item.quantity;
        totalCommission += item.margin_profit * item.quantity;
    }
    document.getElementById('totalSupplyPrice').innerHTML = `€${totalSupply.toFixed(2)}`;
    document.getElementById('totalCommission').innerHTML = `€${totalCommission.toFixed(2)}`;
    document.getElementById('totalIncrease').innerHTML = `€${(totalSupply + totalCommission).toFixed(2)}`;
}

async function confirmSetOrder() {
    const selectedItems = orderItems.filter(item => item.quantity > 0);
    if (selectedItems.length === 0) {
        showToast('Please select at least one product', 'error');
        return;
    }
    const orderNo = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    const buyer = generateRandomBuyer();
    let totalSupplyPrice = 0, totalCommission = 0, productsList = [];
    for (const item of selectedItems) {
        totalSupplyPrice += item.price * item.quantity;
        totalCommission += item.margin_profit * item.quantity;
        productsList.push({ product_id: item.product_id, product_name: item.product_name, quantity: item.quantity, unit_price: item.price, commission_per_item: item.margin_profit, image_url: item.image_url });
    }
    
    // 生成初始 timeline
    const startTime = new Date();
    const initialTimeline = [
        { status: "Order is placed", time: startTime.toISOString() }
    ];
    const paymentReceivedDelay = 5 + Math.random() * 2;
    const paymentReceivedTime = new Date(startTime.getTime() + paymentReceivedDelay * 60 * 1000);
    initialTimeline.push({ status: "Payment received from buyer", time: paymentReceivedTime.toISOString() });
    initialTimeline.push({ status: "Payment under escrow protection", time: paymentReceivedTime.toISOString() });
    
    // 根据是否有 Timer 决定 Payment released 状态
    if (paymentReleaseTimer && paymentReleaseTimer > 0) {
        // 有 Timer：设置具体时间
        const paymentReleasedTime = new Date(paymentReceivedTime.getTime() + paymentReleaseTimer * 60 * 1000);
        initialTimeline.push({ status: "Payment released", time: paymentReleasedTime.toISOString() });
    } else {
        // 无 Timer：设置为 pending 状态
        const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        initialTimeline.push({ status: "Payment released (pending)", time: futureDate.toISOString(), isPending: true });
    }
    
    // 添加后续状态（占位）
    const subsequent = ["Order confirmed","Preparing parcel for shipment","Courier assigned","Parcel picked up by logistics partner","Parcel arrived at sorting facility","Parcel departed from sorting facility","Parcel arrived at delivery hub","Parcel out for delivery","Parcel delivered"];
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    for (let i = 0; i < subsequent.length; i++) {
        initialTimeline.push({ status: subsequent[i], time: futureDate.toISOString(), isPending: true });
    }
    
    const { error } = await sb.from('user_orders').insert({
        uid: selectedUser.uid, username: selectedUser.username, order_no: orderNo,
        products: JSON.stringify(productsList),
        total_supply_price: totalSupplyPrice, total_commission: totalCommission,
        buyer_name: buyer.name, buyer_phone: buyer.phone, buyer_address: buyer.address,
        shipping_address: "Supplier Warehouse, Shanghai, China",
        status: 'pending',
        payment_release_timer: paymentReleaseTimer || null,
        tracking_timeline: JSON.stringify(initialTimeline),
        created_at: new Date().toISOString()
    });
    
    if (error) {
        showToast('Failed: ' + error.message, 'error');
        return;
    }
    
    if (paymentReleaseTimer && paymentReleaseTimer > 0) {
        showToast(`订单 ${orderNo} 创建成功！${paymentReleaseTimer}分钟后自动触发 Payment Release`, 'success');
    } else {
        showToast(`订单 ${orderNo} 创建成功！等待用户 Confirm 后进入 Manual Release 列表`, 'success');
    }
    
    orderItems = orderItems.map(item => ({ ...item, quantity: 0 }));
    renderProducts();
    paymentReleaseTimer = null;
    document.getElementById('paymentTimerInput').value = '';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#ffb84d;padding:10px 20px;border-radius:40px;font-size:13px;z-index:10000;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

window.loadSetordersPage = loadSetordersPage;