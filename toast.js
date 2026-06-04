// toast.js - 深色强模糊背景效果

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `custom-toast custom-toast-${type}`;
    
    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';
    else if (type === 'info') icon = 'fa-info-circle';
    
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icon}"></i></div>
        <div class="toast-message"data-i18n="${escapeHtml(message)}"data-i18n="${escapeHtml(message)}">${escapeHtml(message)}</div>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 200);
    }, 2500);
}

function showConfirm(title, message, onConfirm, onCancel) {
    const existingModal = document.querySelector('.custom-confirm');
    if (existingModal) existingModal.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay-glass';
    
    const modal = document.createElement('div');
    modal.className = 'custom-confirm';
    modal.innerHTML = `
        <div class="confirm-content">
            <div class="confirm-title"data-i18n="${escapeHtml(title)}"data-i18n="${escapeHtml(title)}">${escapeHtml(title)}</div>
            <div class="confirm-message"data-i18n="${escapeHtml(message)}"data-i18n="${escapeHtml(message)}">${escapeHtml(message)}</div>
            <div class="confirm-buttons">
                <button class="confirm-btn confirm-cancel"data-i18n="Cancel"data-i18n="Cancel"data-i18n="Cancel"data-i18n="Cancel">Cancel</button>
                <button class="confirm-btn confirm-ok"data-i18n="Confirm"data-i18n="Confirm"data-i18n="Confirm"data-i18n="Confirm">Confirm</button>
            </div>
        </div>
    `;
    
    modal.appendChild(overlay);
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
}

function showPrompt(title, placeholder, callback) {
    const existingModal = document.querySelector('.custom-prompt');
    if (existingModal) existingModal.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'prompt-overlay-glass';
    
    const modal = document.createElement('div');
    modal.className = 'custom-prompt';
    modal.innerHTML = `
        <div class="prompt-content">
            <div class="prompt-title"data-i18n="${escapeHtml(title)}"data-i18n="${escapeHtml(title)}">${escapeHtml(title)}</div>
            <input type="text" class="prompt-input" placeholder="${escapeHtml(placeholder)}" autocomplete="off">
            <div class="prompt-buttons">
                <button class="prompt-btn prompt-cancel"data-i18n="Cancel"data-i18n="Cancel"data-i18n="Cancel"data-i18n="Cancel">Cancel</button>
                <button class="prompt-btn prompt-ok"data-i18n="Confirm"data-i18n="Confirm"data-i18n="Confirm"data-i18n="Confirm">Confirm</button>
            </div>
        </div>
    `;
    
    modal.appendChild(overlay);
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
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            modal.querySelector('.prompt-ok').click();
        }
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

window.originalAlert = window.alert;
window.alert = function(message) {
    showToast(message, 'info');
};

(function addStyles() {
    if (document.getElementById('additive-toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'additive-toast-styles';
    style.textContent = `
        .confirm-overlay-glass {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            z-index: -1;
            border-radius: 28px;
        }
        
        .prompt-overlay-glass {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            z-index: -1;
            border-radius: 28px;
        }

        .custom-toast {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: white;
            border-radius: 40px;
            padding: 8px 24px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-left: 3px solid;
            font-family: 'Inter', sans-serif;
            max-width: 85%;
        }
        .custom-toast .toast-message {
            white-space: normal;
            word-break: break-word;
        }
        .custom-toast.show {
            opacity: 1;
            visibility: visible;
            transform: translate(-50%, -50%) scale(1);
        }
        .custom-toast-success { border-left-color: #10b981; }
        .custom-toast-success .toast-icon i { color: #10b981; }
        .custom-toast-error { border-left-color: #ef4444; }
        .custom-toast-error .toast-icon i { color: #ef4444; }
        .custom-toast-warning { border-left-color: #f59e0b; }
        .custom-toast-warning .toast-icon i { color: #f59e0b; }
        .custom-toast-info { border-left-color: #ff7a00; }
        .custom-toast-info .toast-icon i { color: #ff7a00; }
        .toast-icon i { font-size: 15px; }
        .toast-message { font-size: 14px; color: #1f2937; line-height: 1.3; }

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
        .confirm-content {
            position: relative;
            background: white;
            border-radius: 20px;
            padding: 6px 20px;
            width: 85%;
            max-width: 360px;
            text-align: center;
            transform: scale(0.9);
            transition: transform 0.2s ease;
            z-index: 2;
        }
        .custom-confirm.show .confirm-content {
            transform: scale(1);
        }
        .confirm-title {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 4px;
        }
        .confirm-message {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
            line-height: 1.4;
        }
        .confirm-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .confirm-btn {
            flex: 1;
            padding: 6px 16px;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            font-size: 13px;
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
        }

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
        .prompt-content {
            position: relative;
            background: white;
            border-radius: 20px;
            padding: 6px 20px;
            width: 85%;
            max-width: 360px;
            text-align: center;
            transform: scale(0.9);
            transition: transform 0.2s ease;
            z-index: 2;
        }
        .custom-prompt.show .prompt-content {
            transform: scale(1);
        }
        .prompt-title {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 8px;
        }
        .prompt-input {
            width: calc(100% - 40px);
            margin: 6px 20px 0 20px;
            padding: 10px 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            color: #1f2937;
            font-size: 14px;
            outline: none;
            font-family: 'Inter', sans-serif;
        }
        .prompt-input:focus {
            border-color: #ff7a00;
            box-shadow: 0 0 0 2px rgba(255, 122, 0, 0.1);
        }
        .prompt-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            padding-top: 8px;
            padding-bottom: 2px;
        }
        .prompt-btn {
            flex: 1;
            padding: 6px 16px;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            font-size: 13px;
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

// ========== 移除所有点击蓝色高亮和按钮点击闪动 ==========
(function() {
    const style = document.createElement('style');
    style.textContent = `
        * {
            -webkit-tap-highlight-color: transparent !important;
        }
        
        button:active,
        button:focus,
        .btn:active,
        .btn:focus,
        .day-card:active,
        .day-card:focus,
        .nav-item:active,
        .nav-item:focus,
        .claim-btn:active,
        .claim-btn:focus,
        .confirm-btn:active,
        .confirm-btn:focus,
        .prompt-btn:active,
        .prompt-btn:focus,
        .control-btn:active,
        .control-btn:focus,
        [onclick]:active,
        [onclick]:focus {
            transform: none !important;
            background-color: inherit !important;
            opacity: 1 !important;
            outline: none !important;
            box-shadow: none !important;
        }
    `;
    document.head.appendChild(style);
})();