// toast.js - ultra-compact notifications (top/bottom borders hug content)

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
        <span class="toast-icon"><i class="fas ${icon}"></i></span>
        <span class="toast-message">${escapeHtml(message)}</span>
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
        /* --- Toast --- */
        .custom-toast {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: #fff;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            padding: 0 10px !important;   /* ZERO top/bottom padding */
            gap: 4px;
            border-left: 3px solid;
            font-family: 'Inter', sans-serif;
            line-height: 10px !important;
            min-height: unset !important;
            height: auto !important;
            box-shadow: 0 2px 8px rgba(0,0,0,.08);
            opacity: 0;
            visibility: hidden;
            z-index: 10000;
            transition: all 0.2s ease;
        }
        .custom-toast.show { opacity: 1; visibility: visible; transform: translate(-50%, -50%) scale(1); }
        .custom-toast-success { border-left-color: #10b981; }
        .custom-toast-error { border-left-color: #ef4444; }
        .custom-toast-warning { border-left-color: #f59e0b; }
        .custom-toast-info { border-left-color: #ff7a00; }
        .toast-icon { display: flex; align-items: center; justify-content: center; margin:0; padding:0; height:10px !important; line-height:10px !important; }
        .toast-icon i { font-size:10px !important; line-height:10px !important; margin:0; padding:0; display:block; }
        .toast-message { font-size:11px; line-height:10px !important; margin:0 !important; padding:0 !important; display:block; }

        /* --- Confirm & Prompt --- */
        .custom-confirm, .custom-prompt { position: fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; z-index:10001; visibility:hidden; opacity:0; transition: all 0.2s ease; }
        .custom-confirm.show, .custom-prompt.show { visibility: visible; opacity: 1; }
        .confirm-overlay, .prompt-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
        .confirm-content, .prompt-content { position:relative; background:white; border-radius:20px; padding:0; width:280px; max-width:80%; text-align:center; transform: scale(0.9); transition: transform 0.2s ease; }
        .custom-confirm.show .confirm-content, .custom-prompt.show .prompt-content { transform: scale(1); }
        .confirm-title, .prompt-title { font-size:15px; font-weight:700; color:#1a1a2e; margin:0; padding:0 20px; }
        .confirm-message { font-size:12px; color:#6b7280; margin:0; padding:4px 20px 0; line-height:1.3; }
        .confirm-buttons, .prompt-buttons { display:flex; gap:8px; justify-content:center; padding:6px 20px; }
        .confirm-btn, .prompt-btn { flex:1; padding:5px 12px; border-radius:40px; font-weight:600; cursor:pointer; border:none; font-size:12px; }
        .confirm-cancel, .prompt-cancel { background:#f1f5f9; color:#475569; }
        .confirm-ok, .prompt-ok { background:#ff7a00; color:white; }
        .prompt-input { width: calc(100% - 40px); margin:6px 20px 0; padding:6px 10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; color:#1f2937; font-size:12px; outline:none; font-family:'Inter', sans-serif; }
        .prompt-input:focus { border-color:#ff7a00; box-shadow:0 0 0 2px rgba(255,122,0,0.1); }
    `;
    document.head.appendChild(style);
})();