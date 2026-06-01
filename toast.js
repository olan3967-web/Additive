// toast.js - 自定义网页内提示弹窗 + 全局拦截 alert（ADDITIVE 主题风格）

// ========== Toast 提示消息 ==========
function showToast(message, type = 'success') {
    // 移除已存在的弹窗
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) existingToast.remove();
    
    // 创建弹窗元素
    const toast = document.createElement('div');
    toast.className = `custom-toast custom-toast-${type}`;
    
    // 根据类型设置图标
    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';
    else if (type === 'info') icon = 'fa-info-circle';
    
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icon}"></i></div>
        <div class="toast-message">${message}</div>
        <div class="toast-progress"></div>
    `;
    
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 3秒后自动消失
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== 确认弹窗 ==========
function showConfirm(title, message, onConfirm, onCancel) {
    const existingModal = document.querySelector('.custom-confirm');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'custom-confirm';
    modal.innerHTML = `
        <div class="confirm-overlay"></div>
        <div class="confirm-content">
            <div class="confirm-title">${escapeHtml(title)}</div>
            <div class="confirm-message">${escapeHtml(message)}</div>
            <div class="confirm-buttons">
                <button class="confirm-btn confirm-cancel">取消</button>
                <button class="confirm-btn confirm-ok">确认</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    modal.querySelector('.confirm-cancel').onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        if (onCancel) onCancel();
    };
    
    modal.querySelector('.confirm-ok').onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        if (onConfirm) onConfirm();
    };
    
    modal.querySelector('.confirm-overlay').onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        if (onCancel) onCancel();
    };
}

// ========== 输入弹窗 ==========
function showPrompt(title, placeholder, callback) {
    const existingModal = document.querySelector('.custom-prompt');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'custom-prompt';
    modal.innerHTML = `
        <div class="prompt-overlay"></div>
        <div class="prompt-content">
            <div class="prompt-title">${escapeHtml(title)}</div>
            <input type="text" class="prompt-input" placeholder="${escapeHtml(placeholder)}">
            <div class="prompt-buttons">
                <button class="prompt-btn prompt-cancel">取消</button>
                <button class="prompt-btn prompt-ok">确认</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    const input = modal.querySelector('.prompt-input');
    input.focus();
    
    modal.querySelector('.prompt-cancel').onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        if (callback) callback(null);
    };
    
    modal.querySelector('.prompt-ok').onclick = () => {
        const value = input.value.trim();
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        if (callback) callback(value);
    };
    
    modal.querySelector('.prompt-overlay').onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        if (callback) callback(null);
    };
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            modal.querySelector('.prompt-ok').click();
        }
    });
}

// ========== 辅助函数 ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== 全局拦截 alert（替换为自定义 Toast） ==========
window.originalAlert = window.alert;
window.alert = function(message) {
    showToast(message, 'info');
};

// ========== 添加样式到页面 ==========
(function addStyles() {
    if (document.getElementById('additive-toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'additive-toast-styles';
    style.textContent = `
        /* Toast 通知样式 */
        .custom-toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: white;
            border-radius: 50px;
            padding: 14px 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border-left: 4px solid;
            font-family: 'Inter', sans-serif;
            max-width: 90%;
        }
        .custom-toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        .custom-toast-success { border-left-color: #10b981; }
        .custom-toast-success .toast-icon i { color: #10b981; }
        .custom-toast-error { border-left-color: #ef4444; }
        .custom-toast-error .toast-icon i { color: #ef4444; }
        .custom-toast-warning { border-left-color: #f59e0b; }
        .custom-toast-warning .toast-icon i { color: #f59e0b; }
        .custom-toast-info { border-left-color: #ff7a00; }
        .custom-toast-info .toast-icon i { color: #ff7a00; }
        .toast-icon i { font-size: 20px; }
        .toast-message { font-size: 14px; color: #1f2937; }
        .toast-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: #ff7a00;
            width: 100%;
            border-radius: 0 0 50px 50px;
            animation: toastProgress 3s linear forwards;
        }
        @keyframes toastProgress {
            0% { width: 100%; }
            100% { width: 0%; }
        }
        
        /* 确认弹窗样式 */
        .custom-confirm {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            visibility: hidden;
            opacity: 0;
            transition: all 0.2s ease;
        }
        .custom-confirm.show {
            visibility: visible;
            opacity: 1;
        }
        .confirm-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }
        .confirm-content {
            position: relative;
            background: white;
            border-radius: 28px;
            padding: 28px 24px;
            width: 320px;
            max-width: 90%;
            text-align: center;
            transform: scale(0.9);
            transition: transform 0.2s ease;
        }
        .custom-confirm.show .confirm-content {
            transform: scale(1);
        }
        .confirm-title {
            font-size: 20px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 12px;
        }
        .confirm-message {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        .confirm-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        .confirm-btn {
            flex: 1;
            padding: 12px;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            font-size: 14px;
        }
        .confirm-cancel {
            background: #f1f5f9;
            color: #475569;
        }
        .confirm-cancel:hover {
            background: #e2e8f0;
        }
        .confirm-ok {
            background: #ff7a00;
            color: white;
        }
        .confirm-ok:hover {
            background: #ea580c;
            transform: scale(1.01);
        }
        
        /* 输入弹窗样式 */
        .custom-prompt {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            visibility: hidden;
            opacity: 0;
            transition: all 0.2s ease;
        }
        .custom-prompt.show {
            visibility: visible;
            opacity: 1;
        }
        .prompt-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }
        .prompt-content {
            position: relative;
            background: white;
            border-radius: 28px;
            padding: 28px 24px;
            width: 320px;
            max-width: 90%;
            text-align: center;
            transform: scale(0.9);
            transition: transform 0.2s ease;
        }
        .custom-prompt.show .prompt-content {
            transform: scale(1);
        }
        .prompt-title {
            font-size: 20px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 20px;
        }
        .prompt-input {
            width: 100%;
            padding: 14px 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            color: #1f2937;
            font-size: 14px;
            outline: none;
            margin-bottom: 20px;
            font-family: 'Inter', sans-serif;
        }
        .prompt-input:focus {
            border-color: #ff7a00;
            box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
        }
        .prompt-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        .prompt-btn {
            flex: 1;
            padding: 12px;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            font-size: 14px;
        }
        .prompt-cancel {
            background: #f1f5f9;
            color: #475569;
        }
        .prompt-cancel:hover {
            background: #e2e8f0;
        }
        .prompt-ok {
            background: #ff7a00;
            color: white;
        }
        .prompt-ok:hover {
            background: #ea580c;
        }
    `;
    document.head.appendChild(style);
})();