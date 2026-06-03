// translate.js - 多语言翻译（所有页面共用）

// 支持的语言
const languages = {
    'en': 'English',
    'de': 'Deutsch',
    'es': 'Español',
    'it': 'Italiano'
};

// 当前语言
let currentLang = localStorage.getItem('preferred_language') || 'en';

// 加载 Google Translate
function loadGoogleTranslate() {
    // 移除已有的容器
    const existing = document.getElementById('google_translate_element');
    if (existing) existing.remove();
    
    // 创建容器
    const div = document.createElement('div');
    div.id = 'google_translate_element';
    div.style.display = 'none';
    document.body.appendChild(div);
    
    // 初始化
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'zh-CN',
            includedLanguages: Object.keys(languages).join(','),
            autoDisplay: false
        }, 'google_translate_element');
        
        // 切换到当前语言
        setTimeout(() => {
            const select = document.querySelector('.goog-te-combo');
            if (select && select.value !== currentLang) {
                select.value = currentLang;
                select.dispatchEvent(new Event('change'));
            }
        }, 300);
    };
    
    // 加载脚本
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
}

// 切换语言
function switchLanguage(lang) {
    if (!languages[lang]) return;
    
    currentLang = lang;
    localStorage.setItem('preferred_language', lang);
    
    // 重新加载翻译
    const select = document.querySelector('.goog-te-combo');
    if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
    } else {
        // 如果还没加载，等一会儿再试
        setTimeout(() => {
            const s = document.querySelector('.goog-te-combo');
            if (s) {
                s.value = lang;
                s.dispatchEvent(new Event('change'));
            }
        }, 500);
    }
}

// 创建语言切换按钮
function createLanguageSwitcher() {
    // 避免重复添加
    if (document.getElementById('language-switcher')) return;
    
    const container = document.createElement('div');
    container.id = 'language-switcher';
    container.style.cssText = 'position:fixed; top:10px; right:60px; z-index:10000; background:#1a1a2e; border-radius:30px; padding:4px; display:flex; gap:2px; box-shadow:0 2px 8px rgba(0,0,0,0.2);';
    
    for (const [code, name] of Object.entries(languages)) {
        const btn = document.createElement('button');
        btn.innerText = name;
        btn.style.cssText = `background:${currentLang === code ? '#ff7a00' : 'transparent'}; border:none; padding:6px 12px; border-radius:30px; color:white; cursor:pointer; font-size:12px; transition:all 0.2s;`;
        btn.onclick = () => {
            switchLanguage(code);
            // 更新按钮样式
            document.querySelectorAll('#language-switcher button').forEach(b => {
                b.style.background = 'transparent';
            });
            btn.style.background = '#ff7a00';
        };
        container.appendChild(btn);
    }
    
    document.body.appendChild(container);
}

// 页面加载时自动执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadGoogleTranslate();
        createLanguageSwitcher();
    });
} else {
    loadGoogleTranslate();
    createLanguageSwitcher();
}

// 隐藏 Google 横幅
const style = document.createElement('style');
style.textContent = `
    .goog-te-banner-frame { display: none !important; }
    .goog-te-gadget { display: none !important; }
    body { top: 0 !important; }
    .goog-te-balloon-frame { display: none !important; }
`;
document.head.appendChild(style);