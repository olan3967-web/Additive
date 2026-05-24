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