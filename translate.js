// translate.js - 自动翻译（移除顶部空白）

(function() {
    // 强制隐藏 Google Translate 横幅
    const style = document.createElement('style');
    style.textContent = `
        .goog-te-banner-frame, .goog-te-banner, .goog-te-balloon-frame,
        .goog-te-balloon, .goog-te-gadget, .goog-te-gadget-simple,
        .goog-te-menu-frame, .goog-te-menu, .skiptranslate {
            display: none !important;
        }
        body {
            top: 0px !important;
            position: static !important;
        }
    `;
    document.head.appendChild(style);
    
    // 创建隐藏容器
    const div = document.createElement('div');
    div.id = 'google_translate_element';
    div.style.display = 'none';
    document.body.appendChild(div);
    
    const preferredLang = localStorage.getItem('preferred_language') || 'en';
    
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'zh-CN',
            includedLanguages: 'en,de,es,it',
            autoDisplay: false
        }, 'google_translate_element');
        
        setTimeout(() => {
            const select = document.querySelector('.goog-te-combo');
            if (select && select.value !== preferredLang) {
                select.value = preferredLang;
                select.dispatchEvent(new Event('change'));
            }
            document.body.style.top = '0px';
            
            // 删除 Google Translate 插入的空白节点
            removeGoogleBlankNode();
        }, 300);
    };
    
    // 删除 Google Translate 插入的空白节点
    function removeGoogleBlankNode() {
        // 删除 body 开头的空白文本节点
        if (document.body.firstChild && document.body.firstChild.nodeType === Node.TEXT_NODE && document.body.firstChild.textContent.trim() === '') {
            document.body.removeChild(document.body.firstChild);
        }
        // 删除 font 标签
        const fonts = document.querySelectorAll('font');
        fonts.forEach(font => {
            if (font.getAttribute('face') === 'arial' || font.getAttribute('size') === '2') {
                if (font.textContent.trim() === '') font.remove();
            }
        });
        // 确保 body 没有额外边距
        document.body.style.margin = '0';
        document.body.style.padding = '0';
    }
    
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
    
    // 持续监控，防止 Google 修改 body 位置和插入空白
    setInterval(() => {
        if (document.body.style.top !== '0px') {
            document.body.style.top = '0px';
        }
        removeGoogleBlankNode();
    }, 500);
})();