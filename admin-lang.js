// admin-lang.js - 后台统一语言包

const adminLang = {
    current: 'en',  // 默认英文
    
    // 英文翻译
    en: {
        // ========== 通用 ==========
        'search': 'Search',
        'refresh': 'Refresh',
        'add': 'Add',
        'save': 'Save',
        'cancel': 'Cancel',
        'edit': 'Edit',
        'delete': 'Delete',
        'confirm': 'Confirm',
        'create': 'Create',
        'upload': 'Upload',
        'preview': 'Preview',
        'close': 'Close',
        'back': 'Back',
        'loading': 'Loading...',
        'no_data': 'No data',
        'success': 'Success',
        'error': 'Error',
        'warning': 'Warning',
        'info': 'Info',
        
        // ========== 表头 ==========
        'uid': 'UID',
        'username': 'Username',
        'phone': 'Phone',
        'balance': 'Balance',
        'trial_bonus': 'Trial Bonus',
        'vip_level': 'VIP Level',
        'wallet_address': 'Wallet Address',
        'actions': 'Actions',
        'order_no': 'Order No',
        'hotel_name': 'Hotel Name',
        'price': 'Price',
        'image': 'Image',
        'status': 'Status',
        'created_at': 'Created At',
        'commission': 'Commission',
        'buyer': 'Buyer',
        'invite_code': 'Invite Code',
        'referrer': 'Referrer',
        'document_type': 'Document Type',
        'uploaded_at': 'Uploaded At',
        'email': 'Email',
        'request_time': 'Request Time',
        'verification_code': 'Verification Code',
        'amount': 'Amount',
        'request_date': 'Request Date',
        'level': 'Level',
        'rank_name': 'Rank Name',
        'orders_limit': 'Orders Limit',
        'commission_rate': 'Commission Rate (%)',
        'required_deposit': 'Required Deposit (€)',
        'product_name': 'Product Name',
        'total_price': 'Total Price',
        'total_commission': 'Total Commission',
        'order_code': 'Order Code',
        'accommodation_name': 'Accommodation Name',
        'video_url': 'Video / GIF URL',
        'image_url': 'Image URL',
        'certificate_image': 'Certificate Image',
        'title': 'Title',
        'content': 'Content',
        
        // ========== 状态 ==========
        'pending': 'Pending',
        'approved': 'Approved',
        'rejected': 'Rejected',
        'available': 'Available',
        'unavailable': 'Unavailable',
        'active': 'Active',
        'inactive': 'Inactive',
        'verified': 'Verified',
        'unverified': 'Unverified',
        
        // ========== 按钮文字 ==========
        'btn_search': 'Search',
        'btn_refresh': 'Refresh',
        'btn_add': 'Add',
        'btn_save': 'Save',
        'btn_cancel': 'Cancel',
        'btn_edit': 'Edit',
        'btn_delete': 'Delete',
        'btn_create': 'Create',
        'btn_upload': 'Upload',
        'btn_preview': 'Preview',
        'btn_confirm': 'Confirm',
        'btn_topup': 'Top Up',
        'btn_cut': 'Deduct',
        'btn_modify': 'Modify',
        'btn_reset': 'Reset',
        'btn_approve': 'Approve',
        'btn_reject': 'Reject',
        'btn_set_code': 'Set Code',
        'btn_release': 'Release',
        'btn_release_now': 'Release Now',
        'btn_bind': 'Bind Address',
        'btn_withdraw': 'Request Withdrawal',
        'btn_claim': 'Claim Reward',
        
        // ========== 页面标题 ==========
        'page_dashboard': 'Admin Dashboard',
        'page_users': 'User Management',
        'page_kyc': 'KYC Verification',
        'page_emailverify': 'Email Verification',
        'page_trial': 'Trial Bonus',
        'page_withdrawals': 'Withdrawal Review',
        'page_vip': 'VIP Settings',
        'page_setorders': 'Orders Trigger',
        'page_orders': 'Orders History',
        'page_orderpool': 'Orders Pool',
        'page_animated': 'Animated / Video',
        'page_signin': 'Check In Bonus',
        'page_certificate': 'Certificate',
        'page_content': 'Content Management',
        
        // ========== 仪表板 ==========
        'today': 'Today',
        'days7': '7 Days',
        'days30': '30 Days',
        'pending_kyc': 'Pending KYC',
        'pending_withdrawal': 'Pending Withdrawal',
        'pending_email': 'Pending Email',
        'order_pool_total': 'Orders Pool',
        'new_users_today': 'New Users Today',
        'total_users': 'Total Users',
        'total_deposit': 'Total Deposit',
        'total_withdraw': 'Total Withdraw',
        'deposit_withdraw_trend': 'Deposit & Withdrawal Trend',
        'deposit': 'Deposit',
        'withdraw': 'Withdraw',
        'onboarding_progress': 'Onboarding Progress',
        'completed_3_3': 'Completed (3/3)',
        'realtime_activity': 'Realtime Activity',
        'live_update': 'Live Update',
        
        // ========== 用户管理 ==========
        'create_user': 'Create User',
        'edit_user': 'Edit User',
        'enter_phone': 'Enter phone number',
        'enter_username': 'Enter username',
        'enter_password': 'Enter password',
        'password_leave_empty': 'Leave empty to keep current',
        'pin_4_digits': '4-digit PIN',
        'onboarding_status': 'Onboarding Status',
        'not_started': 'Not Started',
        'completed': 'Completed',
        'steps': 'Steps',
        
        // ========== KYC ==========
        'pending_review': 'Pending Review',
        'verified_records': 'Verified Records',
        'national_id_front': 'ID Front',
        'national_id_back': 'ID Back',
        'passport': 'Passport',
        'residence_permit': 'Residence Permit',
        'submit_time': 'Submit Time',
        'verification_time': 'Verification Time',
        
        // ========== Email验证 ==========
        'email_instruction': 'When users submit email during registration, they appear below. Admin manually sends verification code, then enters the 6-digit code here and clicks "Set". Users can then use this code to complete registration.',
        'waiting_for_code': 'Waiting for code',
        'pending_verification': 'Pending verification',
        
        // ========== 体验金 ==========
        'current_trial': 'Current Trial Bonus',
        'adjust_amount': 'Adjust Amount',
        'add': 'Add',
        'deduct': 'Deduct',
        
        // ========== 提现审核 ==========
        'withdrawal_requests': 'Withdrawal Requests',
        'wallet': 'Wallet',
        
        // ========== VIP配置 ==========
        'vip_config': 'VIP Configuration',
        'normal': 'Normal',
        'vip': 'VIP',
        'svip': 'SVIP',
        
        // ========== 设置订单 ==========
        'search_user': 'Search UID or Username',
        'current_user': 'Current User',
        'payment_release_timer': 'Payment Release Timer (minutes)',
        'timer_description': 'Auto trigger after entered minutes. Leave empty for Manual Release.',
        'order_summary': 'Order Summary',
        'total_supply_price': 'Total Supply Price',
        'total_commission': 'Total Commission',
        'final_account_increase': 'Final Account Increase',
        'create_order': 'Create Order',
        'manual_release': 'Manual Release',
        'release_successful': 'Release Successful',
        
        // ========== 订单记录 ==========
        'order_management': 'Order Management',
        'products': 'Products',
        
        // ========== 订单池 ==========
        'order_pool': 'Order Pool',
        'add_order': 'Add Order',
        
        // ========== 动画/视频 ==========
        'dynamic_video_settings': 'Dynamic Video Settings',
        'featured_hotels_carousel': 'Featured Hotels Carousel',
        'dashboard_product_sample': 'Dashboard Product Sample',
        'add_hotel': 'Add Hotel',
        'save_all_hotels': 'Save All Hotels',
        'add_product': 'Add Product',
        'refresh_list': 'Refresh List',
        'save_order': 'Save Order',
        
        // ========== 签到奖励 ==========
        'daily_checkin_rewards': 'Daily Check-in Rewards',
        'add_checkin_day': 'Add Check-in Day',
        'day': 'Day',
        
        // ========== Certificate ==========
        'certificate_management': 'Certificate Management',
        'upload_certificate': 'Upload Certificate',
        
        // ========== 内容管理 ==========
        'legal_content_management': 'Legal Content Management',
        'add_content': 'Add Content',
        
        // ========== 登录页 ==========
        'admin_login': 'Admin Login',
        'enter_admin_password': 'Enter admin password',
        'login': 'Login',
        'invalid_password': 'Invalid password',
        
        // ========== 弹窗提示 ==========
        'confirm_delete': 'Delete permanently? This cannot be undone.',
        'confirm_approve': 'Approve this request?',
        'confirm_reject': 'Reject this request? Amount will be refunded to user.',
        'confirm_topup': 'Confirm Top Up',
        'confirm_cut': 'Confirm Deduction',
        'please_fill_all_fields': 'Please fill in all fields',
        'invalid_amount': 'Please enter a valid amount',
        'insufficient_balance': 'Insufficient balance',
        'user_not_found': 'User not found',
        'operation_successful': 'Operation successful',
        'operation_failed': 'Operation failed',
        
        // ========== 订单状态 ==========
        'order_status_pending': 'Pending',
        'order_status_processing': 'Processing',
        'order_status_delivered': 'Delivered',
        'order_status_cancelled': 'Cancelled',
        
        // ========== 其他 ==========
        'select_all': 'Select All',
        'none': 'None',
        'optional': 'optional',
        'required': 'required',
        'minutes': 'minutes',
        'euro': '€',
        'search_placeholder': 'Search...',
        'filter': 'Filter',
        'export': 'Export',
        'import': 'Import',
    },
    
    // 中文翻译（保留，可切换）
    zh: {
        'search': '搜索',
        'refresh': '刷新',
        'add': '添加',
        'save': '保存',
        'cancel': '取消',
        'edit': '编辑',
        'delete': '删除',
        'confirm': '确认',
        'create': '创建',
        'upload': '上传',
        'preview': '预览',
        'close': '关闭',
        'back': '返回',
        'loading': '加载中...',
        'no_data': '暂无数据',
        'success': '成功',
        'error': '错误',
        'warning': '警告',
        'info': '提示',
        
        'uid': 'UID',
        'username': '用户名',
        'phone': '手机号',
        'balance': '余额',
        'trial_bonus': '体验金',
        'vip_level': 'VIP等级',
        'wallet_address': '钱包地址',
        'actions': '操作',
        'order_no': '订单号',
        'hotel_name': '酒店名称',
        'price': '价格',
        'image': '图片',
        'status': '状态',
        'created_at': '创建时间',
        'commission': '佣金',
        'buyer': '买家',
        'invite_code': '邀请码',
        'referrer': '推荐人',
        'document_type': '证件类型',
        'uploaded_at': '上传时间',
        'email': '邮箱',
        'request_time': '请求时间',
        'verification_code': '验证码',
        'amount': '金额',
        'request_date': '申请时间',
        'level': '等级',
        'rank_name': '等级名称',
        'orders_limit': '订单上限',
        'commission_rate': '佣金比率(%)',
        'required_deposit': '需充值金额(€)',
        'product_name': '产品名称',
        'total_price': '总价',
        'total_commission': '总佣金',
        'order_code': '订单号',
        'accommodation_name': '酒店名称',
        'video_url': '视频地址',
        'image_url': '图片地址',
        'certificate_image': '证书图片',
        'title': '标题',
        'content': '内容',
        
        'pending': '待处理',
        'approved': '已批准',
        'rejected': '已拒绝',
        'available': '可用',
        'unavailable': '不可用',
        'active': '启用',
        'inactive': '禁用',
        'verified': '已验证',
        'unverified': '未验证',
        
        'btn_search': '搜索',
        'btn_refresh': '刷新',
        'btn_add': '添加',
        'btn_save': '保存',
        'btn_cancel': '取消',
        'btn_edit': '编辑',
        'btn_delete': '删除',
        'btn_create': '创建',
        'btn_upload': '上传',
        'btn_preview': '预览',
        'btn_confirm': '确认',
        'btn_topup': '充值',
        'btn_cut': '扣款',
        'btn_modify': '修改',
        'btn_reset': '重置',
        'btn_approve': '批准',
        'btn_reject': '拒绝',
        'btn_set_code': '设置验证码',
        'btn_release': '释放',
        'btn_release_now': '立即释放',
        'btn_bind': '绑定地址',
        'btn_withdraw': '申请提现',
        'btn_claim': '领取奖励',
        
        'page_dashboard': '仪表板',
        'page_users': '用户管理',
        'page_kyc': 'KYC验证',
        'page_emailverify': '邮箱验证',
        'page_trial': '体验金管理',
        'page_withdrawals': '提现审核',
        'page_vip': 'VIP配置',
        'page_setorders': '设置订单',
        'page_orders': '订单记录',
        'page_orderpool': '订单池',
        'page_animated': '动画/视频',
        'page_signin': '签到奖励',
        'page_certificate': '证书管理',
        'page_content': '内容管理',
        
        'today': '今日',
        'days7': '7天',
        'days30': '30天',
        'pending_kyc': '待审核KYC',
        'pending_withdrawal': '待处理提现',
        'pending_email': '待发送邮件',
        'order_pool_total': '订单池总数',
        'new_users_today': '今日新增用户',
        'total_users': '总用户',
        'total_deposit': '总入金',
        'total_withdraw': '总出金',
        'deposit_withdraw_trend': '入金 & 出金趋势',
        'deposit': '入金',
        'withdraw': '出金',
        'onboarding_progress': '新手指南进度',
        'completed_3_3': '已完成 (3/3)',
        'realtime_activity': '实时活动',
        'live_update': '实时更新',
        
        'create_user': '创建用户',
        'edit_user': '修改用户',
        'enter_phone': '请输入手机号',
        'enter_username': '请输入用户名',
        'enter_password': '请输入密码',
        'password_leave_empty': '留空则不修改',
        'pin_4_digits': '4位数字PIN码',
        'onboarding_status': '新手指南状态',
        'not_started': '未开始',
        'completed': '已完成',
        'steps': '步',
        
        'pending_review': '待审核',
        'verified_records': '已验证记录',
        'national_id_front': '身份证正面',
        'national_id_back': '身份证背面',
        'passport': '护照',
        'residence_permit': '居留证',
        'submit_time': '提交时间',
        'verification_time': '验证时间',
        
        'email_instruction': '用户注册时输入邮箱后，会出现在下方列表中。管理员手动发送验证码到用户邮箱后，在此处输入6位数字验证码并点击"设置"，用户即可使用该验证码完成注册。',
        'waiting_for_code': '待设置',
        'pending_verification': '待验证',
        
        'current_trial': '当前体验金',
        'adjust_amount': '调整金额',
        'add': '增加',
        'deduct': '扣除',
        
        'withdrawal_requests': '提现申请',
        'wallet': '钱包',
        
        'vip_config': 'VIP配置',
        'normal': '普通',
        'vip': 'VIP',
        'svip': 'SVIP',
        
        'search_user': '搜索 UID 或用户名',
        'current_user': '当前用户',
        'payment_release_timer': '付款释放计时器(分钟)',
        'timer_description': '输入分钟后自动触发释放。留空则为手动释放。',
        'order_summary': '订单摘要',
        'total_supply_price': '总供货价',
        'total_commission': '总佣金',
        'final_account_increase': '最终账户增加',
        'create_order': '创建订单',
        'manual_release': '手动释放',
        'release_successful': '释放成功',
        
        'order_management': '订单管理',
        'products': '产品',
        
        'order_pool': '订单池',
        'add_order': '添加订单',
        
        'dynamic_video_settings': '动态视频设置',
        'featured_hotels_carousel': '精选酒店轮播图',
        'dashboard_product_sample': '仪表板产品示例',
        'add_hotel': '添加酒店',
        'save_all_hotels': '保存所有酒店',
        'add_product': '添加产品',
        'refresh_list': '刷新列表',
        'save_order': '保存订单',
        
        'daily_checkin_rewards': '每日签到奖励',
        'add_checkin_day': '添加签到日',
        'day': '第',
        
        'certificate_management': '证书管理',
        'upload_certificate': '上传证书',
        
        'legal_content_management': '法律内容管理',
        'add_content': '添加内容',
        
        'admin_login': '管理员登录',
        'enter_admin_password': '请输入管理员密码',
        'login': '登录',
        'invalid_password': '密码错误',
        
        'confirm_delete': '永久删除？此操作不可恢复。',
        'confirm_approve': '批准该申请？',
        'confirm_reject': '拒绝该申请？金额将退回用户账户。',
        'confirm_topup': '确认充值',
        'confirm_cut': '确认扣款',
        'please_fill_all_fields': '请填写完整信息',
        'invalid_amount': '请输入有效金额',
        'insufficient_balance': '余额不足',
        'user_not_found': '用户不存在',
        'operation_successful': '操作成功',
        'operation_failed': '操作失败',
        
        'order_status_pending': '待处理',
        'order_status_processing': '处理中',
        'order_status_delivered': '已送达',
        'order_status_cancelled': '已取消',
        
        'select_all': '全选',
        'none': '无',
        'optional': '可选',
        'required': '必填',
        'minutes': '分钟',
        'euro': '€',
        'search_placeholder': '搜索...',
        'filter': '筛选',
        'export': '导出',
        'import': '导入',
    },
    
    // 获取翻译
    t: function(key) {
        const langData = this[this.current];
        return langData[key] !== undefined ? langData[key] : key;
    },
    
    // 切换语言
    setLanguage: function(lang) {
        if (this[lang]) {
            this.current = lang;
            localStorage.setItem('admin_lang', lang);
            this.updateAllTexts();
            return true;
        }
        return false;
    },
    
    // 更新页面上所有带 data-i18n 属性的元素
    updateAllTexts: function() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.placeholder !== undefined) {
                        el.placeholder = translation;
                    } else {
                        el.value = translation;
                    }
                } else {
                    el.textContent = translation;
                }
            }
        });
        // 触发自定义事件，通知其他组件更新
        window.dispatchEvent(new CustomEvent('adminLanguageChanged', { detail: { lang: this.current } }));
    },
    
    // 初始化
    init: function() {
        const saved = localStorage.getItem('admin_lang');
        if (saved && this[saved]) {
            this.current = saved;
        } else {
            this.current = 'en';  // 默认英文
        }
        this.updateAllTexts();
    }
};

// 自动初始化
if (typeof document !== 'undefined') {
    adminLang.init();
}

window.adminLang = adminLang;