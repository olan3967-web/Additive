// admin-setorders.js - 设置订单页面（支持从用户 my_products 选择产品）
let setordersSearchKeyword = '';
let selectedUser = null;
let userProductsList = [];
let orderItems = []; // { product_id, product_name, price, margin_profit, quantity, image_url }

async function loadSetordersPage() {
    const container = document.getElementById('page_setorders');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="search-bar" style="justify-content: space-between;">
                <h3><i class="fas fa-cog"></i> 设置订单</h3>
                <button id="backToUserList" class="btn-primary" style="display:none;"><i class="fas fa-arrow-left"></i> 返回用户列表</button>
            </div>
            
            <!-- 用户选择区域 -->
            <div id="setordersUserSearch">
                <div class="search-bar">
                    <input type="text" id="setordersSearchUid" placeholder="🔍 输入 UID 或用户名" style="flex:1;" class="search-input">
                    <button id="setordersSearchBtn" class="btn-primary"><i class="fas fa-search"></i> 搜索用户</button>
                </div>
                <div id="setordersUserList" class="table-container" style="max-height: 300px;">
                    <table class="data-table">
                        <thead><tr><th>UID</th><th>用户名</th><th>操作</th></tr></thead>
                        <tbody id="setordersUserTableBody"></tbody>
                    </table>
                </div>
            </div>
            
            <!-- 订单设置区域 -->
            <div id="setordersMain" style="display: none;">
                <div class="uid-header" style="background: rgba(74,124,255,0.1); padding: 10px 16px; border-radius: 12px; margin-bottom: 20px;">
                    当前用户：<span id="selectedUidDisplay" style="color:#4a7cff;"></span> - <span id="selectedUsernameDisplay"></span>
                </div>
                
                <!-- 产品列表 -->
                <div id="userProductsList" style="max-height: 500px; overflow-y: auto; margin-bottom: 20px;"></div>
                
                <!-- 订单汇总 -->
                <div id="orderSummary" style="background: #0f172a; border-radius: 16px; padding: 16px; margin-top: 20px; border: 1px solid rgba(74,124,255,0.2);">
                    <h4 style="margin-bottom: 12px; color: #ffb84d;"><i class="fas fa-receipt"></i> 订单汇总</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>总供应价：</span>
                        <span id="totalSupplyPrice" style="color: #ffb84d; font-weight: 700;">€0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>总佣金：</span>
                        <span id="totalCommission" style="color: #2ed15a; font-weight: 700;">€0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                        <span>完成后账户增加：</span>
                        <span id="totalIncrease" style="color: #4a7cff; font-weight: 700;">€0</span>
                    </div>
                    <button id="confirmSetOrderBtn" class="success" style="width: 100%; padding: 12px;">
                        <i class="fas fa-check"></i> 确认设置订单
                    </button>
                </div>
            </div>
        </div>
    `;
    
    await loadSetordersUserList();
    
    document.getElementById('setordersSearchBtn')?.addEventListener('click', () => {
        setordersSearchKeyword = document.getElementById('setordersSearchUid').value.trim();
        loadSetordersUserList();
    });
    
    document.getElementById('backToUserList')?.addEventListener('click', () => {
        document.getElementById('setordersUserSearch').style.display = 'block';
        document.getElementById('setordersMain').style.display = 'none';
        selectedUser = null;
        orderItems = [];
    });
    
    document.getElementById('confirmSetOrderBtn')?.addEventListener('click', confirmSetOrder);
}

async function loadSetordersUserList() {
    let query = sb.from('users').select('uid, username').order('created_at', { ascending: false });
    if (setordersSearchKeyword) {
        query = query.or(`uid.ilike.%${setordersSearchKeyword}%,username.ilike.%${setordersSearchKeyword}%`);
    }
    const { data: users } = await query;
    const tbody = document.getElementById('setordersUserTableBody');
    
    if (tbody && users) {
        tbody.innerHTML = '';
        for (let u of users) {
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<span class="badge">${u.uid}</span>`;
            row.insertCell(1).innerText = u.username;
            row.insertCell(2).innerHTML = `<button class="setorder-select-btn" data-uid="${u.uid}" data-name="${u.username}" class="btn-primary" style="padding:4px 12px; font-size:12px;"><i class="fas fa-cog"></i> 设置订单</button>`;
        }
        document.querySelectorAll('.setorder-select-btn').forEach(btn => {
            btn.addEventListener('click', () => selectUserForSetOrder(btn.dataset.uid, btn.dataset.name));
        });
    }
}

async function selectUserForSetOrder(uid, username) {
    selectedUser = { uid, username };
    document.getElementById('selectedUidDisplay').innerText = uid;
    document.getElementById('selectedUsernameDisplay').innerText = username;
    
    await loadUserProductsForOrder(uid);
    
    document.getElementById('setordersUserSearch').style.display = 'none';
    document.getElementById('setordersMain').style.display = 'block';
}

async function loadUserProductsForOrder(uid) {
    const container = document.getElementById('userProductsList');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center; padding:40px;">加载中...</div>';
    
    const { data: products, error } = await sb
        .from('user_products')
        .select('*')
        .eq('uid', uid)
        .order('added_at', { ascending: false });
    
    if (error || !products || products.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#aaa;">该用户暂无已添加的产品</div>';
        return;
    }
    
    // 初始化 orderItems
    orderItems = products.map(p => ({
        product_id: p.product_id || p.id,
        product_name: p.product_name,
        price: p.price,
        margin_profit: p.margin_profit,
        quantity: 0,
        image_url: p.image_url
    }));
    
    renderProductSelectionList();
}

function renderProductSelectionList() {
    const container = document.getElementById('userProductsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        const div = document.createElement('div');
        div.className = 'product-selection-item';
        div.style.cssText = 'background:#0f172a; border-radius:16px; padding:15px; margin-bottom:12px; display:flex; gap:15px; align-items:center; flex-wrap:wrap; border:1px solid rgba(74,124,255,0.2);';
        
        div.innerHTML = `
            <div style="flex-shrink:0;">
                <img src="${item.image_url || 'https://placehold.co/60x60/1e2a3a/4a7cff?text=No+Image'}" style="width:60px; height:60px; border-radius:12px; object-fit:cover;" onerror="this.src='https://placehold.co/60x60/1e2a3a/4a7cff?text=No+Image'">
            </div>
            <div style="flex:2;">
                <div style="font-weight:600; color:#ffb84d;">${escapeHtml(item.product_name)}</div>
                <div style="font-size:12px; color:#8a9abb;">供应价: €${item.price.toFixed(2)} | 佣金: €${item.margin_profit.toFixed(2)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <button class="qty-decr" data-index="${i}" style="background:#4a7cff; border:none; width:30px; height:30px; border-radius:8px; color:white; cursor:pointer;">-</button>
                <span style="font-size:18px; font-weight:700; min-width:30px; text-align:center;" id="qty_${i}">${item.quantity}</span>
                <button class="qty-incr" data-index="${i}" style="background:#4a7cff; border:none; width:30px; height:30px; border-radius:8px; color:white; cursor:pointer;">+</button>
            </div>
        `;
        container.appendChild(div);
    }
    
    // 绑定增减按钮事件
    document.querySelectorAll('.qty-decr').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            if (orderItems[idx].quantity > 0) {
                orderItems[idx].quantity--;
                document.getElementById(`qty_${idx}`).innerText = orderItems[idx].quantity;
                updateOrderSummary();
            }
        });
    });
    
    document.querySelectorAll('.qty-incr').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            orderItems[idx].quantity++;
            document.getElementById(`qty_${idx}`).innerText = orderItems[idx].quantity;
            updateOrderSummary();
        });
    });
    
    updateOrderSummary();
}

function updateOrderSummary() {
    let totalSupply = 0;
    let totalCommission = 0;
    
    for (const item of orderItems) {
        totalSupply += item.price * item.quantity;
        totalCommission += item.margin_profit * item.quantity;
    }
    
    document.getElementById('totalSupplyPrice').innerHTML = `€${totalSupply.toFixed(2)}`;
    document.getElementById('totalCommission').innerHTML = `€${totalCommission.toFixed(2)}`;
    document.getElementById('totalIncrease').innerHTML = `€${(totalSupply + totalCommission).toFixed(2)}`;
}

async function confirmSetOrder() {
    // 筛选出数量 > 0 的产品
    const selectedItems = orderItems.filter(item => item.quantity > 0);
    
    if (selectedItems.length === 0) {
        showToast('请至少选择一个产品', 'error');
        return;
    }
    
    // 生成订单号
    const orderNo = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    
    // 生成随机买家地址
    const buyer = generateRandomBuyer();
    
    // 批发商发货地址（固定）
    const shippingAddress = "上海市浦东新区世纪大道100号环球金融中心 批发商仓库";
    
    // 计算总供应价和总佣金
    let totalSupplyPrice = 0;
    let totalCommission = 0;
    let productsList = [];
    
    for (const item of selectedItems) {
        totalSupplyPrice += item.price * item.quantity;
        totalCommission += item.margin_profit * item.quantity;
        productsList.push({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
            commission: item.margin_profit * item.quantity,
            image_url: item.image_url
        });
    }
    
    // 插入订单到 user_orders
    const { error } = await sb.from('user_orders').insert({
        uid: selectedUser.uid,
        order_no: orderNo,
        products: JSON.stringify(productsList),
        total_supply_price: totalSupplyPrice,
        total_commission: totalCommission,
        buyer_name: buyer.name,
        buyer_phone: buyer.phone,
        buyer_address: buyer.address,
        shipping_address: shippingAddress,
        status: 'pending',
        created_at: new Date().toISOString()
    });
    
    if (error) {
        showToast('设置订单失败: ' + error.message, 'error');
        return;
    }
    
    showToast(`订单 ${orderNo} 设置成功！`, 'success');
    
    // 重置
    orderItems = orderItems.map(item => ({ ...item, quantity: 0 }));
    renderProductSelectionList();
}

function generateRandomBuyer() {
    const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '周', '吴', '郑'];
    const lastNames = ['明伟', '芳', '强', '静', '涛', '丽', '军', '娟', '伟', '敏'];
    const cities = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市', '武汉市', '西安市'];
    const streets = ['朝阳区建国路', '浦东新区世纪大道', '天河区天河路', '南山区科技园', '西湖区文三路', '武侯区天府大道', '江汉区建设大道', '雁塔区科技路'];
    
    const name = firstNames[Math.floor(Math.random() * firstNames.length)] + lastNames[Math.floor(Math.random() * lastNames.length)];
    const phone = '1' + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 100000000).toString().padStart(9, '0');
    const phoneDisplay = phone.substring(0, 3) + '****' + phone.substring(7);
    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const building = Math.floor(Math.random() * 200) + 1;
    
    return {
        name: name,
        phone: phoneDisplay,
        address: `${city}${street}${building}号`
    };
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

window.loadSetordersPage = loadSetordersPage;