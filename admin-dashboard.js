// admin-dashboard.js - 完整版（琥珀金通知 + 实时订阅 + Email待发送统计）
let trendChart = null;
let ringChart = null;
let breatheInterval = null;
let pulseInterval = null;
let dashboardRefreshInterval = null;
let dashboardRendered = false;
let cachedData = {
    stats: null,
    chart: null,
    activity: null,
    lastStatsTime: 0,
    lastChartTime: 0,
    lastActivityTime: 0
};
const CACHE_DURATION = 30000;
const DEBOUNCE_DELAY = 300;

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function loadQuickCards() {
    try {
        const [kycRes, withdrawalRes, poolRes, emailRes] = await Promise.all([
            sb.from('kyc_verifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            sb.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            sb.from('orders_pool').select('*', { count: 'exact', head: true }),
            sb.from('email_verification_requests').select('id', { count: 'exact', head: true }).eq('is_verified', false).is('code', null)
        ]);
        
        const kycEl = document.getElementById('kycPendingCount');
        const withdrawalEl = document.getElementById('withdrawalPendingCount');
        const poolEl = document.getElementById('orderPoolCount');
        const emailEl = document.getElementById('emailPendingCount');
        
        if (kycEl) kycEl.innerText = kycRes.count || 0;
        if (withdrawalEl) withdrawalEl.innerText = withdrawalRes.count || 0;
        if (poolEl) poolEl.innerText = poolRes.count || 0;
        if (emailEl) emailEl.innerText = emailRes.count || 0;
        
        console.log(`实时更新: KYC待审核=${kycRes.count || 0}, 提现待处理=${withdrawalRes.count || 0}, 待发送Email=${emailRes.count || 0}`);
    } catch (e) { console.error('加载快捷卡片失败:', e); }
}

async function loadStatsData(days, force = false) {
    const now = Date.now();
    if (!force && cachedData.stats && (now - cachedData.lastStatsTime) < CACHE_DURATION) {
        applyStatsData(cachedData.stats);
        return;
    }
    try {
        const [usersRes, depositsRes, withdrawalsRes] = await Promise.all([
            sb.from('users').select('created_at, balance'),
            sb.from('deposits').select('created_at, amount'),
            sb.from('withdrawals').select('request_date, amount, status')
        ]);
        const users = usersRes.data || [];
        const deposits = depositsRes.data || [];
        const withdrawals = withdrawalsRes.data || [];
        const nowDate = new Date();
        const startDate = new Date(); startDate.setDate(nowDate.getDate() - days);
        const startStr = startDate.toISOString().split('T')[0];
        const lastPeriodStart = new Date(); lastPeriodStart.setDate(nowDate.getDate() - days * 2);
        const lastPeriodStr = lastPeriodStart.toISOString().split('T')[0];
        
        const newUsers = users.filter(u => u.created_at && u.created_at.split('T')[0] >= startStr).length;
        const prevNewUsers = users.filter(u => u.created_at && u.created_at.split('T')[0] >= lastPeriodStr && u.created_at.split('T')[0] < startStr).length;
        const totalDeposit = deposits.reduce((s, d) => s + (d.amount || 0), 0);
        const periodDeposit = deposits.filter(d => d.created_at && d.created_at.split('T')[0] >= startStr).reduce((s, d) => s + (d.amount || 0), 0);
        const prevPeriodDeposit = deposits.filter(d => d.created_at && d.created_at.split('T')[0] >= lastPeriodStr && d.created_at.split('T')[0] < startStr).reduce((s, d) => s + (d.amount || 0), 0);
        const totalWithdraw = withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + (w.amount || 0), 0);
        const periodWithdraw = withdrawals.filter(w => w.status === 'approved' && w.request_date && w.request_date.split('T')[0] >= startStr).reduce((s, w) => s + (w.amount || 0), 0);
        const prevPeriodWithdraw = withdrawals.filter(w => w.status === 'approved' && w.request_date && w.request_date.split('T')[0] >= lastPeriodStr && w.request_date.split('T')[0] < startStr).reduce((s, w) => s + (w.amount || 0), 0);
        
        const statsData = { newUsers, prevNewUsers, totalUsers: users.length, totalDeposit, periodDeposit, prevPeriodDeposit, totalWithdraw, periodWithdraw, prevPeriodWithdraw };
        cachedData.stats = statsData;
        cachedData.lastStatsTime = now;
        applyStatsData(statsData);
    } catch (e) { console.error('加载统计数据失败:', e); }
}

function applyStatsData(data) {
    const newUsersEl = document.getElementById('newUsersCount');
    const totalUsersEl = document.getElementById('totalUsersCount');
    const totalDepositEl = document.getElementById('totalDepositCount');
    const totalWithdrawEl = document.getElementById('totalWithdrawCount');
    const newUsersTrendEl = document.getElementById('newUsersTrend');
    const totalDepositTrendEl = document.getElementById('totalDepositTrend');
    const totalWithdrawTrendEl = document.getElementById('totalWithdrawTrend');
    
    if (newUsersEl) animateNumber(newUsersEl, data.newUsers, '', '');
    if (newUsersTrendEl) newUsersTrendEl.innerHTML = getTrendHtml(data.newUsers, data.prevNewUsers);
    if (totalUsersEl) animateNumber(totalUsersEl, data.totalUsers, '', '');
    if (totalDepositEl) animateNumber(totalDepositEl, data.totalDeposit, '€', '');
    if (totalDepositTrendEl) totalDepositTrendEl.innerHTML = getTrendHtml(data.periodDeposit, data.prevPeriodDeposit);
    if (totalWithdrawEl) animateNumber(totalWithdrawEl, data.totalWithdraw, '€', '');
    if (totalWithdrawTrendEl) totalWithdrawTrendEl.innerHTML = getTrendHtml(data.periodWithdraw, data.prevPeriodWithdraw);
}

async function loadChartData(days, force = false) {
    const now = Date.now();
    if (!force && cachedData.chart && (now - cachedData.lastChartTime) < CACHE_DURATION && trendChart) {
        trendChart.setOption({ xAxis: { data: cachedData.chart.dates }, series: [{ data: cachedData.chart.depositData }, { data: cachedData.chart.withdrawData }] });
        return;
    }
    try {
        const [depositsRes, withdrawalsRes] = await Promise.all([
            sb.from('deposits').select('created_at, amount'),
            sb.from('withdrawals').select('request_date, amount, status')
        ]);
        const deposits = depositsRes.data || [];
        const withdrawals = withdrawalsRes.data || [];
        const dates = [], depositData = [], withdrawData = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(); d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
            const dayDeposit = deposits.filter(dep => dep.created_at && dep.created_at.split('T')[0] === dateStr).reduce((s, d) => s + (d.amount || 0), 0);
            const dayWithdraw = withdrawals.filter(w => w.status === 'approved' && w.request_date && w.request_date.split('T')[0] === dateStr).reduce((s, w) => s + (w.amount || 0), 0);
            depositData.push(dayDeposit);
            withdrawData.push(dayWithdraw);
        }
        cachedData.chart = { dates, depositData, withdrawData };
        cachedData.lastChartTime = now;
        if (trendChart) {
            trendChart.setOption({ 
                xAxis: { data: dates }, 
                series: [
                    { name: '入金', data: depositData },
                    { name: '出金', data: withdrawData }
                ]
            });
            console.log('趋势线图已更新:', { dates, depositData, withdrawData });
        }
    } catch (e) { console.error('加载图表数据失败:', e); }
}

async function loadRingData() {
    try {
        const { data: users } = await sb.from('users').select('uid');
        if (!users || users.length === 0) return;
        
        let completed30Orders = 0;
        const batchSize = 50;
        for (let i = 0; i < users.length; i += batchSize) {
            const batch = users.slice(i, i + batchSize);
            const promises = batch.map(user => sb.from('order_history').select('id', { count: 'exact', head: true }).eq('uid', user.uid));
            const results = await Promise.all(promises);
            completed30Orders += results.filter(r => (r.count || 0) >= 30).length;
        }
        const rate = Math.round((completed30Orders / users.length) * 100);
        const percentEl = document.getElementById('ringPercent');
        if (percentEl) percentEl.innerText = rate + '%';
        
        if (ringChart) {
            ringChart.setOption({ series: [{ data: [{ value: rate }, { value: 100 - rate }] }] });
        }
    } catch (e) { console.error('加载环形图数据失败:', e); }
}

async function loadActivityTimeline(force = false) {
    const now = Date.now();
    if (!force && cachedData.activity && (now - cachedData.lastActivityTime) < CACHE_DURATION) {
        renderActivityList(cachedData.activity);
        return;
    }
    try {
        const [kycRes, withdrawalRes, userRes, emailRes] = await Promise.all([
            sb.from('kyc_verifications').select('*').eq('status', 'pending').order('uploaded_at', { ascending: false }).limit(10),
            sb.from('withdrawals').select('*').order('request_date', { ascending: false }).limit(10),
            sb.from('users').select('*').order('created_at', { ascending: false }).limit(10),
            sb.from('email_verification_requests').select('*').eq('is_verified', false).is('code', null).order('requested_at', { ascending: false }).limit(10)
        ]);
        
        const kycList = kycRes.data || [];
        const withdrawalList = withdrawalRes.data || [];
        const userList = userRes.data || [];
        const emailList = emailRes.data || [];
        
        const kycWithNames = [];
        for (const k of kycList) {
            const { data: user } = await sb.from('users').select('username').eq('uid', k.uid).single();
            kycWithNames.push({
                ...k,
                username: user?.username || k.uid
            });
        }
        
        const activities = [];
        kycWithNames.forEach(k => activities.push({ type: 'kyc', title: 'KYC申请', user: k.username, time: k.uploaded_at, icon: 'fas fa-id-card', color: '#ffb84d' }));
        withdrawalList.forEach(w => activities.push({ type: 'withdrawal', title: '提现申请', user: w.username, amount: `€${w.amount}`, time: w.request_date, icon: 'fas fa-money-bill-wave', color: '#4a7cff' }));
        userList.forEach(u => activities.push({ type: 'user', title: '新用户注册', user: u.username, time: u.created_at, icon: 'fas fa-user-plus', color: '#2ed15a' }));
        emailList.forEach(e => activities.push({ type: 'email', title: '邮箱验证请求', user: e.email, time: e.requested_at, icon: 'fas fa-envelope', color: '#ffb84d' }));
        
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        cachedData.activity = activities;
        cachedData.lastActivityTime = now;
        renderActivityList(activities);
    } catch (e) { console.error('加载活动时间线失败:', e); }
}

function renderActivityList(activities) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    if (activities.length === 0) {
        activityList.innerHTML = '<div style="text-align: center; padding: 20px; color: #6a7a9a;">暂无活动</div>';
        return;
    }
    activityList.innerHTML = activities.slice(0, 15).map(a => `
        <div style="display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(74,124,255,0.1);">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: ${a.color}20; display: flex; align-items: center; justify-content: center;"><i class="${a.icon}" style="color: ${a.color};"></i></div>
            <div style="flex: 1;"><div style="font-size: 14px; font-weight: 500;">${a.title}</div><div style="font-size: 12px; color: #8a9abb;">${a.user} ${a.amount || ''}</div></div>
            <div style="font-size: 11px; color: #6a7a9a;">${formatTime(a.time)}</div>
        </div>
    `).join('');
}

async function refreshDashboard(days = currentDays, force = false) {
    await Promise.all([
        loadQuickCards(),
        loadStatsData(days, force),
        loadChartData(days, force),
        loadRingData(),
        loadActivityTimeline(force)
    ]);
}

function initTrendChart() {
    const dom = document.getElementById('trendChart');
    if (!dom) {
        console.error('trendChart容器不存在');
        return;
    }
    if (trendChart) {
        trendChart.dispose();
        trendChart = null;
    }
    trendChart = echarts.init(dom);
    trendChart.setOption({
        tooltip: { 
            trigger: 'axis', 
            axisPointer: { type: 'shadow' }, 
            backgroundColor: 'rgba(15,25,40,0.95)', 
            borderColor: '#4a7cff', 
            borderWidth: 1, 
            textStyle: { color: '#fff' } 
        },
        legend: { data: ['入金', '出金'], textStyle: { color: '#8a9abb' }, right: 10, top: 0 },
        grid: { top: 50, left: 60, right: 40, bottom: 30, containLabel: true },
        xAxis: { 
            type: 'category', 
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], 
            axisLabel: { color: '#8a9abb' }, 
            axisLine: { lineStyle: { color: '#1a2a3a' } }, 
            axisTick: { show: false } 
        },
        yAxis: { 
            type: 'value', 
            name: '金额 (€)', 
            nameTextStyle: { color: '#8a9abb' }, 
            axisLabel: { color: '#8a9abb' }, 
            splitLine: { lineStyle: { color: '#1a2a3a', type: 'dashed' } } 
        },
        series: [
            { 
                name: '入金', 
                type: 'line', 
                data: [0, 0, 0, 0, 0, 0, 0], 
                smooth: true, 
                symbol: 'circle', 
                symbolSize: 6,
                lineStyle: { color: '#2ed15a', width: 3, shadowBlur: 10, shadowColor: '#2ed15a' }, 
                areaStyle: { opacity: 0.25, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#2ed15a' }, { offset: 1, color: 'transparent' }]) } 
            },
            { 
                name: '出金', 
                type: 'line', 
                data: [0, 0, 0, 0, 0, 0, 0], 
                smooth: true, 
                symbol: 'circle', 
                symbolSize: 6,
                lineStyle: { color: '#ff5a5a', width: 3, shadowBlur: 10, shadowColor: '#ff5a5a' }, 
                areaStyle: { opacity: 0.25, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#ff5a5a' }, { offset: 1, color: 'transparent' }]) } 
            }
        ]
    });
    
    console.log('趋势线图初始化完成');
    
    if (pulseInterval) clearInterval(pulseInterval);
    let pulseOpacity = 0.3, pulseDirection = 0.006;
    pulseInterval = setInterval(() => {
        pulseOpacity += pulseDirection;
        if (pulseOpacity >= 0.5) pulseDirection = -0.006;
        if (pulseOpacity <= 0.2) pulseDirection = 0.006;
        if (trendChart) {
            trendChart.setOption({
                series: [
                    { lineStyle: { shadowBlur: 12 + (1 - pulseOpacity) * 10 }, areaStyle: { opacity: 0.15 + pulseOpacity * 0.15 } },
                    { lineStyle: { shadowBlur: 12 + (1 - pulseOpacity) * 10 }, areaStyle: { opacity: 0.15 + pulseOpacity * 0.15 } }
                ]
            });
        }
    }, 200);
}

function initRingChart() {
    const dom = document.getElementById('ringChart');
    if (!dom) {
        console.error('ringChart容器不存在');
        return;
    }
    
    dom.innerHTML = '';
    dom.style.height = '220px';
    dom.style.width = '100%';
    
    if (ringChart) {
        try {
            ringChart.dispose();
        } catch(e) {}
        ringChart = null;
    }
    
    ringChart = echarts.init(dom);
    ringChart.setOption({
        tooltip: { show: false },
        series: [{
            type: 'pie',
            radius: ['55%', '75%'],
            center: ['50%', '50%'],
            data: [
                { value: 0, name: '完成', itemStyle: { color: '#4a7cff', borderRadius: 8 } },
                { value: 100, name: '剩余', itemStyle: { color: '#1a2a3a', borderRadius: 8 } }
            ],
            label: { show: false },
            startAngle: 90,
            animation: true
        }]
    });
    
    console.log('环形图初始化成功');
}

function bindDateFilters() {
    const handleFilterChange = debounce(async (btn) => {
        document.querySelectorAll('.date-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDays = parseInt(btn.dataset.days);
        await refreshDashboard(currentDays, true);
    }, DEBOUNCE_DELAY);
    document.querySelectorAll('.date-filter-btn').forEach(btn => {
        if (btn._handler) btn.removeEventListener('click', btn._handler);
        btn._handler = () => handleFilterChange(btn);
        btn.addEventListener('click', btn._handler);
    });
}

// ========== 琥珀金风格通知 ==========
function showAmberNotification(title, message, type) {
    const existingNotification = document.querySelector('.notification-amber');
    if (existingNotification) existingNotification.remove();
    
    let icon = 'fa-id-card';
    let iconColor = '#ffb84d';
    
    if (type === 'withdrawal') {
        icon = 'fa-money-bill-wave';
    } else if (type === 'kyc') {
        icon = 'fa-id-card';
    } else if (type === 'email') {
        icon = 'fa-envelope';
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification-amber';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 340px;
        max-width: 420px;
        padding: 14px 18px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        gap: 14px;
        background: rgba(30, 25, 15, 0.95);
        backdrop-filter: blur(12px);
        border-left: 4px solid #ffb84d;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
        cursor: pointer;
        animation: slideIn 0.4s ease forwards;
        font-family: 'Inter', sans-serif;
    `;
    
    notification.innerHTML = `
        <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(255,184,77,0.15); display: flex; align-items: center; justify-content: center;">
            <i class="fas ${icon}" style="color: ${iconColor}; font-size: 22px;"></i>
        </div>
        <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 14px; color: #ffb84d; margin-bottom: 4px;">${title}</div>
            <div style="font-size: 12px; color: #d4c8a0; opacity: 0.9;">${message}</div>
            <div style="font-size: 10px; color: #8a7a5a; margin-top: 4px;">刚刚</div>
        </div>
        <div style="cursor: pointer; opacity: 0.5; padding: 4px;" class="notification-close">
            <i class="fas fa-times" style="color: #d4c8a0;"></i>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    if (!document.querySelector('#notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes slideIn {
                0% { transform: translateX(calc(100% + 20px)); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                0% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(calc(100% + 20px)); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    };
    
    notification.onclick = (e) => {
        if (e.target !== closeBtn && !closeBtn.contains(e.target)) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    };
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ========== 实时订阅 ==========
function subscribeToRealtime() {
    console.log('正在启动实时订阅...');
    
    if (window.realtimeChannel) {
        sb.removeChannel(window.realtimeChannel);
    }
    
    window.realtimeChannel = sb
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'withdrawals' },
            (payload) => {
                console.log('🔔 检测到新提现申请:', payload.new);
                refreshDashboard(currentDays, true);
                window.showAmberNotification(
                    '💰 新提现申请',
                    `用户 ${payload.new.username} 申请提现 €${payload.new.amount}`,
                    'withdrawal'
                );
            }
        )
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'kyc_verifications' },
            (payload) => {
                console.log('🔔 检测到新KYC申请:', payload.new);
                refreshDashboard(currentDays, true);
                window.showAmberNotification(
                    '📋 新KYC申请',
                    `用户 ${payload.new.username || payload.new.uid} 提交了验证申请`,
                    'kyc'
                );
            }
        )
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'email_verification_requests' },
            (payload) => {
                console.log('🔔 检测到新邮箱验证请求:', payload.new);
                refreshDashboard(currentDays, true);
                window.showAmberNotification(
                    '📧 新邮箱验证请求',
                    `用户 ${payload.new.email} 请求邮箱验证，请设置验证码`,
                    'email'
                );
            }
        )
        .subscribe((status) => {
            console.log('实时订阅状态:', status);
            if (status === 'SUBSCRIBED') {
                console.log('✅ 实时订阅已成功连接！');
            }
        });
}

function loadDashboardPage(days = 1) {
    const container = document.getElementById('page_dashboard');
    if (!container) return;
    
    if (dashboardRendered) {
        refreshDashboard(currentDays, true);
        return;
    }
    
    dashboardRendered = true;
    
    container.innerHTML = `
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 24px;">
            <button class="date-filter-btn active" data-days="1">今日</button>
            <button class="date-filter-btn" data-days="7">7天</button>
            <button class="date-filter-btn" data-days="30">30天</button>
        </div>
        <div class="quick-actions-grid">
            <div class="quick-card" onclick="showPage('kyc')">
                <i class="fas fa-id-card"></i>
                <div class="count" id="kycPendingCount">0</div>
                <div class="label">待审核KYC</div>
            </div>
            <div class="quick-card" onclick="showPage('withdrawals')">
                <i class="fas fa-money-bill-wave"></i>
                <div class="count" id="withdrawalPendingCount">0</div>
                <div class="label">待处理提现</div>
            </div>
            <div class="quick-card" onclick="showPage('emailverify')">
                <i class="fas fa-envelope"></i>
                <div class="count" id="emailPendingCount">0</div>
                <div class="label">待发送Email验证</div>
            </div>
            <div class="quick-card" onclick="showPage('orderpool')">
                <i class="fas fa-hotel"></i>
                <div class="count" id="orderPoolCount">0</div>
                <div class="label">订单池总数</div>
            </div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><i class="fas fa-user-plus"></i><div class="stat-number" id="newUsersCount">0</div><div class="stat-label">今日新增用户</div><div class="stat-trend" id="newUsersTrend"></div></div>
            <div class="stat-card"><i class="fas fa-users"></i><div class="stat-number" id="totalUsersCount">0</div><div class="stat-label">总用户</div><div class="stat-trend" id="totalUsersTrend"></div></div>
            <div class="stat-card"><i class="fas fa-arrow-down"></i><div class="stat-number" id="totalDepositCount">€0</div><div class="stat-label">总入金</div><div class="stat-trend" id="totalDepositTrend"></div></div>
            <div class="stat-card"><i class="fas fa-arrow-up"></i><div class="stat-number" id="totalWithdrawCount">€0</div><div class="stat-label">总出金</div><div class="stat-trend" id="totalWithdrawTrend"></div></div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">
            <div class="card" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div style="font-size: 16px; font-weight: 600; color: #4a7cff;">💰 入金 & 出金趋势</div>
                    <div style="display: flex; gap: 16px;"><span><span style="display: inline-block; width: 12px; height: 12px; background: #2ed15a; border-radius: 2px; margin-right: 6px;"></span>入金</span><span><span style="display: inline-block; width: 12px; height: 12px; background: #ff5a5a; border-radius: 2px; margin-right: 6px;"></span>出金</span></div>
                </div>
                <div id="trendChart" style="height: 320px; width: 100%;"></div>
            </div>
            <div class="card" style="padding: 20px; text-align: center;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div style="font-size: 16px; font-weight: 600; color: #4a7cff;">📊 用户行为分析</div>
                    <div style="display: flex; gap: 16px;"><span><span style="display: inline-block; width: 12px; height: 12px; background: #4a7cff; border-radius: 2px; margin-right: 6px;"></span>做单率</span></div>
                </div>
                <div id="ringChart" style="height: 220px; width: 100%;"></div>
                <div id="ringPercent" style="font-size: 24px; font-weight: 700; color: #fff; margin-top: 8px;">0%</div>
                <div style="font-size: 11px; color: #6a7a9a;">完成30单以上用户占比</div>
            </div>
        </div>
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div style="font-size: 16px; font-weight: 600; color: #4a7cff;"><i class="fas fa-history"></i> 实时活动</div>
                <div style="font-size: 11px; color: #2ed15a;"><i class="fas fa-circle" style="font-size: 8px;"></i> 实时更新</div>
            </div>
            <div id="activityList" style="max-height: 300px; overflow-y: auto;"><div style="text-align: center; padding: 20px; color: #6a7a9a;">加载中...</div></div>
        </div>
    `;
    
    setTimeout(() => {
        initTrendChart();
        initRingChart();
        bindDateFilters();
        refreshDashboard(days, true);
        subscribeToRealtime();
    }, 200);
    
    if (dashboardRefreshInterval) clearInterval(dashboardRefreshInterval);
    dashboardRefreshInterval = setInterval(() => refreshDashboard(currentDays, false), 15000);
}

window.loadDashboardPage = loadDashboardPage;
window.refreshDashboardData = function(days) {
    refreshDashboard(days || currentDays, true);
};