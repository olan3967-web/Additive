// toast.js - ultra-compact, auto-sizing to text

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `custom-toast custom-toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon"><i class="fas ${getIcon(type)}"></i></span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;

    document.body.appendChild(toast);

    // shrink to content
    toast.style.width = 'auto';
    toast.style.height = 'auto';

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 200);
    }, 2500);
}

function getIcon(type) {
    if (type === 'error') return 'fa-exclamation-circle';
    if (type === 'warning') return 'fa-exclamation-triangle';
    if (type === 'info') return 'fa-info-circle';
    return 'fa-check-circle';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => (m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'));
}

(function addStyles() {
    if (document.getElementById('toast-styles')) return;
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        .custom-toast {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: inline-flex;
            align-items: center;
            gap: 4px;

            background: #fff;
            border-radius: 999px;
            border-left: 3px solid;
            padding: 0 8px;
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            line-height: 1;
            min-height: unset;
            height: auto;
            width: auto;

            opacity: 0;
            visibility: hidden;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,.08);
            transition: all 0.2s ease;
        }
        .custom-toast.show {
            opacity: 1;
            visibility: visible;
        }
        .custom-toast-success { border-left-color: #10b981; }
        .custom-toast-error { border-left-color: #ef4444; }
        .custom-toast-warning { border-left-color: #f59e0b; }
        .custom-toast-info { border-left-color: #ff7a00; }

        .toast-icon i {
            font-size: 10px;
            line-height: 1;
            display: block;
        }
        .toast-message {
            display: block;
            margin: 0;
            padding: 0;
        }
    `;
    document.head.appendChild(style);
})();