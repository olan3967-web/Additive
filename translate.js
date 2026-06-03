// translate.js - 自动翻译为英文（完全隐藏 Google Translate 横幅）

(function() {
    // 隐藏 Google Translate 横幅的样式（提前添加）
    const hideStyle = document.createElement('style');
    hideStyle.textContent = `
        .goog-te-banner-frame,
        .goog-te-banner,
        .goog-te-balloon-frame,
        .goog-te-balloon,
        .goog-te-gadget,
        .goog-te-gadget-simple,
        .goog-te-menu-frame,
        .goog-te-menu,
        .goog-te-cta-bar,
        .goog-te-tooltip,
        .skiptranslate,
        .goog-te-banner-frame.skiptranslate {
            display: none !important;
        }
        body {
            top: 0px !important;
            position: relative !important;
        }
    `;
    document.head.appendChild(hideStyle);
    
    // 创建 Google Translate 容器（隐藏）
    const div = document.createElement('div');
    div.id = 'google_translate_element';
    div.style.display = 'none';
    document.body.appendChild(div);
    
    // 获取用户保存的语言偏好
    const preferredLang = localStorage.getItem('preferred_language') || 'en';
    
    // 初始化翻译
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'zh-CN',
            includedLanguages: 'en,de,es,it',
            autoDisplay: false,
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
        
        // 切换到用户偏好的语言
        setTimeout(() => {
            const select = document.querySelector('.goog-te-combo');
            if (select && select.value !== preferredLang) {
                select.value = preferredLang;
                select.dispatchEvent(new Event('change'));
            }
            
            // 再次隐藏可能出现的横幅
            const banner = document.querySelector('.goog-te-banner-frame');
            if (banner) banner.style.display = 'none';
            document.body.style.top = '0px';
        }, 300);
        
        // 定时检查并隐藏横幅
        setInterval(() => {
            const banner = document.querySelector('.goog-te-banner-frame');
            if (banner) banner.style.display = 'none';
            document.body.style.top = '0px';
        }, 1000);
    };
    
    // 加载 Google Translate 脚本
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
    
    // 监听 body 变化，防止 Google 修改 top 值
    const observer = new MutationObserver(() => {
        if (document.body.style.top !== '0px') {
            document.body.style.top = '0px';
        }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
})();