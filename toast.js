// toast.js - 超紧凑弹窗（零多余空白）

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
        <div class="toast-message">${escapeHtml(message)}</div>
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

function showPrompt(title, placeholder, callback) {
    const existingModal = document.querySelector('.custom-prompt');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'custom-prompt';
    modal.innerHTML = `
        <div class="prompt-overlay"></div>
        <div class="prompt-content">
            <div class="prompt-title">${escapeHtml(title)}</div>
            <input type="text" class="prompt-input" placeholder="${escapeHtml(placeholder)}" autocomplete="off">
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
        /* Toast - 零多余空白 */
        .custom-toast {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: white;
            border-radius: 40px;
            padding: 0 18px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-left: 3px solid;
            font-family: 'Inter', sans-serif;
            max-width: 85%;
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
        .toast-icon i { font-size: 13px; }
        .toast-message { font-size: 13px; color: #1f2937; line-height: 1.2; }

        /* 确认弹窗 - 零多余空白 */
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
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
        }
        .confirm-content {
            position: relative;
            background: white;
            border-radius: 20px;
            padding: 0 20px;
            width: 280px;
            max-width: 80%;
            text-align: center;
            transform: scale(0.9);
            transition: transform 0.2s ease;
        }
        .custom-confirm.show .confirm-content {
            transform: scale(1);
        }
        .confirm-title {
            font-size: 15px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 0;
            padding-top: 12px;
        }
        .confirm-message {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 0;
            padding-top: 6px;
            line-height: 1.3;
        }
        .confirm-buttons {
            display: flex;
            gap: 8px;
            justify-content: center;
            padding-top: 12px;
            padding-bottom: 12px;
        }
        .confirm-btn {
            flex: 1;
            padding: 6px 12px;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            font-size: 12px;
        }
        .confirm-cancel {
            background: #f1f5f9;
            color: #475569;
        }
        .confirm-ok {
            background: #ff7a00;
            color: white;
        }

        /* 输入弹窗 - 零多余空白 */
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
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
        }
        .prompt-content {
            position: relative;
            background: white;
            border-radius: 20px;
            padding: 0 20px;
            width: 280px;
            max-width: 80%;
            text-align: center;
            transform: scale(0.9);
            transition: transform 0.2s ease;
        }
        .custom-prompt.show .prompt-content {
            transform: scale(1);
        }
        .prompt-title {
            font-size: 15px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 0;
            padding-top: 12px;
        }
        .prompt-input {
            width: 100%;
            padding: 8px 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            color: #1f2937;
            font-size: 13px;
            outline: none;
            margin-bottom: 0;
            margin-top: 8px;
            font-family: 'Inter', sans-serif;
        }
        .prompt-input:focus {
            border-color: #ff7a00;
            box-shadow: 0 0 0 2px rgba(255, 122, 0, 0.1);
        }
        .prompt-buttons {
            display: flex;
            gap: 8px;
            justify-content: center;
            padding-top: 12px;
            padding-bottom: 12px;
        }
        .prompt-btn {
            flex: 1;
            padding: 6px 12px;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            font-size: 12px;
        }
        .prompt-cancel {
            background: #f1f5f9;
            color: #475569;
        }
        .prompt-ok {
            background: #ff7a00;
            color: white;
        }
    `;
    document.head.appendChild(style);
})();