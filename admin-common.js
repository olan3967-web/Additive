// admin-common.js - Supabase初始化 + 共用函数
const SUPABASE_URL = 'https://ygeawapbjcfytjoxpttk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3X4gUSBt2i7OXB1IsajBiQ__NM-OIGn';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentDays = 1;

function toggleSidebar() { document.getElementById('sidebar')?.classList.toggle('open'); }
window.toggleSidebar = toggleSidebar;

function toggleNotification() { document.getElementById('notificationCenter')?.classList.toggle('open'); }
window.toggleNotification = toggleNotification;

function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : m === '>' ? '&gt;' : m); }

function formatTime(dateStr) {
    if (!dateStr) return '刚刚';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 1) return '刚刚';
    if (diff < 60) return `${diff}分钟前`;
    if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
    return `${Math.floor(diff / 1440)}天前`;
}

function animateNumber(element, target, prefix = '', suffix = '') {
    if (!element) return;
    let current = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.innerText = prefix + target.toLocaleString() + suffix;
            clearInterval(timer);
        } else {
            element.innerText = prefix + Math.floor(current).toLocaleString() + suffix;
        }
    }, 16);
}

function getTrendHtml(current, previous) {
    if (previous === 0) return current > 0 ? '<span class="trend-up">↑ +100%</span>' : '<span class="trend-up">→ 0%</span>';
    const percent = ((current - previous) / previous * 100).toFixed(1);
    if (percent > 0) return `<span class="trend-up">↑ +${percent}%</span>`;
    if (percent < 0) return `<span class="trend-down">↓ ${percent}%</span>`;
    return '<span>→ 0%</span>';
}

// admin-common.js - 替换 showPage 函数
const loadedPages = {};

function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById('page_' + pageId);
    if (targetPage) targetPage.classList.add('active');
    
    // 更新导航高亮
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    // 如果已经加载过，不再重新加载（避免图表重复初始化）
    if (loadedPages[pageId]) return;
    
    loadedPages[pageId] = true;
    
    // 加载页面内容
    if (pageId === 'dashboard' && window.loadDashboardPage) {
        window.loadDashboardPage(currentDays);
    } else if (pageId === 'users' && window.loadUsersPage) {
        window.loadUsersPage();
    } else if (pageId === 'kyc' && window.loadKycPage) {
        window.loadKycPage();
    } else if (pageId === 'trial' && window.loadTrialPage) {
        window.loadTrialPage();
    } else if (pageId === 'withdrawals' && window.loadWithdrawalsPage) {
        window.loadWithdrawalsPage();
    } else if (pageId === 'vip' && window.loadVipPage) {
        window.loadVipPage();
    } else if (pageId === 'setorders' && window.loadSetordersPage) {
        window.loadSetordersPage();
    } else if (pageId === 'orders' && window.loadOrdersPage) {
        window.loadOrdersPage();
    } else if (pageId === 'orderpool' && window.loadOrderPoolPage) {
        window.loadOrderPoolPage();
    } else if (pageId === 'animated' && window.loadAnimatedPage) {
        window.loadAnimatedPage();
    } else if (pageId === 'signin' && window.loadSigninPage) {
        window.loadSigninPage();
    } else if (pageId === 'content' && window.loadContentPage) {
        window.loadContentPage();
    }
}

// 登录检查
if (localStorage.getItem('admin_logged_in') !== 'true') window.location.href = 'admin-login.html';