// translate.js - 自动翻译所有页面文字（不改 HTML）

const translations = {
    // 导航菜单
    'Dashboard': { en: 'Dashboard', de: 'Dashboard', es: 'Panel', it: 'Dashboard' },
    'Products': { en: 'Products', de: 'Produkte', es: 'Productos', it: 'Prodotti' },
    'Orders': { en: 'Orders', de: 'Bestellungen', es: 'Pedidos', it: 'Ordini' },
    'My Profile': { en: 'My Profile', de: 'Mein Profil', es: 'Mi Perfil', it: 'Il mio Profilo' },
    
    // 页面标题
    'Welcome back': { en: 'Welcome back', de: 'Willkommen zurück', es: 'Bienvenido de nuevo', it: 'Bentornato' },
    'Total Sales': { en: 'Total Sales', de: 'Gesamtumsatz', es: 'Ventas Totales', it: 'Vendite Totali' },
    'ROI': { en: 'ROI', de: 'ROI', es: 'ROI', it: 'ROI' },
    'Orders': { en: 'Orders', de: 'Bestellungen', es: 'Pedidos', it: 'Ordini' },
    'Profit': { en: 'Profit', de: 'Gewinn', es: 'Ganancia', it: 'Profitto' },
    'Revenue Trend': { en: 'Revenue Trend', de: 'Umsatztrend', es: 'Tendencia de Ingresos', it: 'Andamento dei Ricavi' },
    'Last 7 days': { en: 'Last 7 days', de: 'Letzte 7 Tage', es: 'Últimos 7 días', it: 'Ultimi 7 giorni' },
    'TOTAL EARNINGS': { en: 'TOTAL EARNINGS', de: 'GESAMTERTRAG', es: 'GANANCIAS TOTALES', it: 'GUADAGNI TOTALI' },
    'Lifetime earnings': { en: 'Lifetime earnings', de: 'Lebenslange Einnahmen', es: 'Ganancias de por vida', it: 'Guadagni a vita' },
    'CURRENT EVENT': { en: 'CURRENT EVENT', de: 'AKTUELLES EVENT', es: 'EVENTO ACTUAL', it: 'EVENTO CORRENTE' },
    'VIP bonus active': { en: 'VIP bonus active', de: 'VIP Bonus aktiv', es: 'Bono VIP activo', it: 'Bonus VIP attivo' },
    'PREMIUM STATUS': { en: 'PREMIUM STATUS', de: 'PREMIUM-STATUS', es: 'ESTADO PREMIUM', it: 'STATO PREMIUM' },
    'Upgrade Now': { en: 'Upgrade Now', de: 'Jetzt upgraden', es: 'Mejorar ahora', it: 'Aggiorna ora' },
    'CERTIFICATE': { en: 'CERTIFICATE', de: 'ZERTIFIKAT', es: 'CERTIFICADO', it: 'CERTIFICATO' },
    'orders to go': { en: 'orders to go', de: 'verbleibende Bestellungen', es: 'pedidos restantes', it: 'ordini rimanenti' },
    'Completed!': { en: 'Completed!', de: 'Abgeschlossen!', es: '¡Completado!', it: 'Completato!' },
    'Top Products': { en: 'Top Products', de: 'Top-Produkte', es: 'Productos Destacados', it: 'Prodotti Top' },
    "CJ's Partners": { en: "CJ's Partners", de: "CJs Partner", es: "Socios de CJ", it: "Partner di CJ" },
    
    // QUICK ACTIONS
    'Store': { en: 'Store', de: 'Shop', es: 'Tienda', it: 'Negozio' },
    'My Products': { en: 'My Products', de: 'Meine Produkte', es: 'Mis Productos', it: 'I miei Prodotti' },
    'KYC Verification': { en: 'KYC Verification', de: 'KYC-Verifizierung', es: 'Verificación KYC', it: 'Verifica KYC' },
    'Withdrawal': { en: 'Withdrawal', de: 'Auszahlung', es: 'Retiro', it: 'Prelievo' },
    'Premium Status': { en: 'Premium Status', de: 'Premium-Status', es: 'Estado Premium', it: 'Stato Premium' },
    'Event': { en: 'Event', de: 'Veranstaltung', es: 'Evento', it: 'Evento' },
    
    // SUPPORT & HISTORY
    'Contact Support': { en: 'Contact Support', de: 'Support kontaktieren', es: 'Contactar Soporte', it: 'Contatta Supporto' },
    'Balance History': { en: 'Balance History', de: 'Kontoverlauf', es: 'Historial de Saldo', it: 'Storico Saldo' },
    'Orders History': { en: 'Orders History', de: 'Bestellverlauf', es: 'Historial de Pedidos', it: 'Storico Ordini' },
    'Check In': { en: 'Check In', de: 'Einchecken', es: 'Registro', it: 'Registrazione' },
    'Settings': { en: 'Settings', de: 'Einstellungen', es: 'Ajustes', it: 'Impostazioni' },
    
    // 订单页面
    'New': { en: 'New', de: 'Neu', es: 'Nuevo', it: 'Nuovo' },
    'Processing': { en: 'Processing', de: 'Bearbeitung', es: 'Procesando', it: 'In elaborazione' },
    'No new orders': { en: 'No new orders', de: 'Keine neuen Bestellungen', es: 'No hay nuevos pedidos', it: 'Nessun nuovo ordine' },
    'No orders in processing': { en: 'No orders in processing', de: 'Keine Bestellungen in Bearbeitung', es: 'No hay pedidos en proceso', it: 'Nessun ordine in elaborazione' },
    'Pending': { en: 'Pending', de: 'Ausstehend', es: 'Pendiente', it: 'In attesa' },
    'In Transit': { en: 'In Transit', de: 'Unterwegs', es: 'En tránsito', it: 'In transito' },
    'Delivered': { en: 'Delivered', de: 'Geliefert', es: 'Entregado', it: 'Consegnato' },
    
    // 弹窗
    'Order Details': { en: 'Order Details', de: 'Bestelldetails', es: 'Detalles del Pedido', it: 'Dettagli ordine' },
    'Buyer Info': { en: 'Buyer Info', de: 'Käuferinfo', es: 'Info del Comprador', it: 'Info acquirente' },
    'Check Shipping Info': { en: 'Check Shipping Info', de: 'Versandinfo prüfen', es: 'Verificar Envío', it: 'Verifica Spedizione' },
    'Confirm Order': { en: 'Confirm Order', de: 'Bestellung bestätigen', es: 'Confirmar Pedido', it: 'Conferma ordine' },
    'Address Confirmation': { en: 'Address Confirmation', de: 'Adressbestätigung', es: 'Confirmación de Dirección', it: 'Conferma indirizzo' },
    'Supplier Shipping Info': { en: 'Supplier Shipping Info', de: 'Lieferanten-Versandinfo', es: 'Info de Envío del Proveedor', it: 'Info spedizione fornitore' },
    'Buyer Address': { en: 'Buyer Address', de: 'Käuferadresse', es: 'Dirección del Comprador', it: 'Indirizzo acquirente' },
    'Please confirm both addresses match': { en: 'Please confirm both addresses match', de: 'Bitte bestätigen Sie, dass beide Adressen übereinstimmen', es: 'Confirme que ambas direcciones coinciden', it: 'Conferma che entrambi gli indirizzi corrispondano' },
    'I confirm, close': { en: 'I confirm, close', de: 'Ich bestätige, schließen', es: 'Confirmo, cerrar', it: 'Confermo, chiudi' },
    
    // 余额/钱包
    'Account Balance': { en: 'Account Balance', de: 'Kontostand', es: 'Saldo de la Cuenta', it: 'Saldo del conto' },
    'Top Up': { en: 'Top Up', de: 'Aufladen', es: 'Recargar', it: 'Ricarica' },
    'Withdraw': { en: 'Withdraw', de: 'Auszahlen', es: 'Retirar', it: 'Preleva' },
    'Total Commissions Earned': { en: 'Total Commissions Earned', de: 'Verdiente Provisionen insgesamt', es: 'Comisiones Totales Ganadas', it: 'Commissioni totali guadagnate' },
    'My Sales': { en: 'My Sales', de: 'Meine Verkäufe', es: 'Mis Ventas', it: 'Le mie vendite' },
    'Sourcing': { en: 'Sourcing', de: 'Beschaffung', es: 'Abastecimiento', it: 'Approvvigionamento' },
    'Find products': { en: 'Find products', de: 'Produkte finden', es: 'Encontrar productos', it: 'Trova prodotti' },
    'earned': { en: 'earned', de: 'verdient', es: 'ganado', it: 'guadagnato' },
    
    // 设置页面
    'Manage your account preferences': { en: 'Manage your account preferences', de: 'Verwalten Sie Ihre Kontoeinstellungen', es: 'Administre sus preferencias de cuenta', it: 'Gestisci le preferenze del tuo account' },
    'Account': { en: 'Account', de: 'Konto', es: 'Cuenta', it: 'Account' },
    'Security': { en: 'Security', de: 'Sicherheit', es: 'Seguridad', it: 'Sicurezza' },
    'Language': { en: 'Language', de: 'Sprache', es: 'Idioma', it: 'Lingua' },
    'Support': { en: 'Support', de: 'Support', es: 'Soporte', it: 'Supporto' },
    'Invitation Code': { en: 'Invitation Code', de: 'Einladungscode', es: 'Código de invitación', it: 'Codice di invito' },
    'Change Password': { en: 'Change Password', de: 'Passwort ändern', es: 'Cambiar Contraseña', it: 'Cambia Password' },
    'Update your login password': { en: 'Update your login password', de: 'Aktualisieren Sie Ihr Passwort', es: 'Actualice su contraseña', it: 'Aggiorna la tua password' },
    'Set Withdrawal PIN': { en: 'Set Withdrawal PIN', de: 'Auszahlungs-PIN festlegen', es: 'Establecer PIN de Retiro', it: 'Imposta PIN prelievo' },
    'Create a PIN to protect withdrawals': { en: 'Create a PIN to protect withdrawals', de: 'Erstellen Sie eine PIN zum Schutz von Auszahlungen', es: 'Cree un PIN para proteger los retiros', it: 'Crea un PIN per proteggere i prelievi' },
    'Change Withdrawal PIN': { en: 'Change Withdrawal PIN', de: 'Auszahlungs-PIN ändern', es: 'Cambiar PIN de Retiro', it: 'Cambia PIN prelievo' },
    'Update your withdrawal PIN': { en: 'Update your withdrawal PIN', de: 'Aktualisieren Sie Ihre Auszahlungs-PIN', es: 'Actualice su PIN de retiro', it: 'Aggiorna il tuo PIN prelievo' },
    'English': { en: 'English', de: 'Englisch', es: 'Inglés', it: 'Inglese' },
    'Switch to English': { en: 'Switch to English', de: 'Zu Englisch wechseln', es: 'Cambiar a Inglés', it: 'Passa all\'inglese' },
    'Deutsch': { en: 'German', de: 'Deutsch', es: 'Alemán', it: 'Tedesco' },
    'Switch to German': { en: 'Switch to German', de: 'Zu Deutsch wechseln', es: 'Cambiar a Alemán', it: 'Passa al tedesco' },
    'Español': { en: 'Spanish', de: 'Spanisch', es: 'Español', it: 'Spagnolo' },
    'Switch to Spanish': { en: 'Switch to Spanish', de: 'Zu Spanisch wechseln', es: 'Cambiar a Español', it: 'Passa allo spagnolo' },
    'Italiano': { en: 'Italian', de: 'Italienisch', es: 'Italiano', it: 'Italiano' },
    'Switch to Italian': { en: 'Switch to Italian', de: 'Zu Italienisch wechseln', es: 'Cambiar a Italiano', it: 'Passa all\'italiano' },
    'Logout': { en: 'Logout', de: 'Abmelden', es: 'Cerrar sesión', it: 'Esci' },
    
    // Toast/提示
    'Please check shipping info first': { en: 'Please check shipping info first', de: 'Bitte zuerst die Versandinfo prüfen', es: 'Primero verifique la información de envío', it: 'Controlla prima le info di spedizione' },
    'Insufficient balance': { en: 'Insufficient balance', de: 'Unzureichender Kontostand', es: 'Saldo insuficiente', it: 'Saldo insufficiente' },
    'Success': { en: 'Success', de: 'Erfolg', es: 'Éxito', it: 'Successo' },
    'Error': { en: 'Error', de: 'Fehler', es: 'Error', it: 'Errore' },
    'Warning': { en: 'Warning', de: 'Warnung', es: 'Advertencia', it: 'Avviso' },
    'Info': { en: 'Info', de: 'Info', es: 'Información', it: 'Informazioni' },
    
    // KYC
    'KYC Pending': { en: 'KYC Pending', de: 'KYC ausstehend', es: 'KYC Pendiente', it: 'KYC in attesa' },
    'KYC Verified': { en: 'KYC Verified', de: 'KYC verifiziert', es: 'KYC Verificado', it: 'KYC verificato' },
    'Normal': { en: 'Normal', de: 'Normal', es: 'Normal', it: 'Normale' },
    'VIP': { en: 'VIP', de: 'VIP', es: 'VIP', it: 'VIP' },
    'SVIP': { en: 'SVIP', de: 'SVIP', es: 'SVIP', it: 'SVIP' },
    
    // 签到
    'Sign In': { en: 'Sign In', de: 'Einloggen', es: 'Registrarse', it: 'Accedi' },
    'Build your daily reward streak': { en: 'Build your daily reward streak', de: 'Baue deine tägliche Belohnungsserie auf', es: 'Construye tu racha de recompensas diarias', it: 'Costruisci la tua serie di ricompense giornaliere' },
    'TOTAL CLAIMED': { en: 'TOTAL CLAIMED', de: 'INSGESAMT EINGELÖST', es: 'TOTAL RECLAMADO', it: 'TOTALE RISCOSSO' },
    'Current Streak': { en: 'Current Streak', de: 'Aktuelle Serie', es: 'Racha Actual', it: 'Serie Attuale' },
    'Day': { en: 'Day', de: 'Tag', es: 'Día', it: 'Giorno' },
    'days': { en: 'days', de: 'Tage', es: 'días', it: 'giorni' },
    'Claim Reward': { en: 'Claim Reward', de: 'Belohnung einlösen', es: 'Reclamar Recompensa', it: 'Riscuoti Ricompensa' },
    
    // 会员
    'Membership': { en: 'Membership', de: 'Mitgliedschaft', es: 'Membresía', it: 'Abbonamento' },
    'Compare membership tiers': { en: 'Compare membership tiers', de: 'Mitgliedschaftsstufen vergleichen', es: 'Comparar niveles de membresía', it: 'Confronta i livelli di abbonamento' },
    'YOUR MEMBERSHIP': { en: 'YOUR MEMBERSHIP', de: 'IHRE MITGLIEDSCHAFT', es: 'SU MEMBRESÍA', it: 'IL TUO ABBONAMENTO' },
    'COMMISSION RATE': { en: 'COMMISSION RATE', de: 'PROVISIONSSATZ', es: 'TASA DE COMISIÓN', it: 'TASSA DI COMMISSIONE' }
};

// 获取当前语言
let currentLang = localStorage.getItem('preferred_language') || 'en';

// 翻译文本
function translateText(text) {
    if (!text || typeof text !== 'string') return text;
    
    // 直接匹配
    if (translations[text] && translations[text][currentLang]) {
        return translations[text][currentLang];
    }
    
    // 去除首尾空格后匹配
    const trimmed = text.trim();
    if (translations[trimmed] && translations[trimmed][currentLang]) {
        return translations[trimmed][currentLang];
    }
    
    return text;
}

// 翻译整个页面
function translatePage() {
    // 遍历所有元素
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // 跳过 script, style 标签内的文本
                if (node.parentElement && 
                    (node.parentElement.tagName === 'SCRIPT' || 
                     node.parentElement.tagName === 'STYLE' ||
                     node.parentElement.tagName === 'CODE')) {
                    return NodeFilter.FILTER_REJECT;
                }
                // 跳过已经翻译过的标记
                if (node.parentElement && node.parentElement.hasAttribute('data-translated')) {
                    return NodeFilter.FILTER_REJECT;
                }
                // 只处理非空文本
                if (node.textContent && node.textContent.trim().length > 0) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            }
        }
    );
    
    const textNodes = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }
    
    textNodes.forEach(node => {
        const originalText = node.textContent;
        const translatedText = translateText(originalText);
        if (translatedText !== originalText) {
            node.textContent = translatedText;
            if (node.parentElement) {
                node.parentElement.setAttribute('data-translated', 'true');
            }
        }
    });
    
    // 翻译 placeholder 属性
    document.querySelectorAll('[placeholder]').forEach(el => {
        const original = el.getAttribute('placeholder');
        const translated = translateText(original);
        if (translated !== original) {
            el.setAttribute('placeholder', translated);
        }
    });
    
    // 翻译 title 属性
    document.querySelectorAll('[title]').forEach(el => {
        const original = el.getAttribute('title');
        const translated = translateText(original);
        if (translated !== original) {
            el.setAttribute('title', translated);
        }
    });
    
    // 翻译 value 属性（按钮上的文字）
    document.querySelectorAll('input[type="button"], input[type="submit"], button').forEach(el => {
        if (el.value && el.value.trim()) {
            const original = el.value;
            const translated = translateText(original);
            if (translated !== original) {
                el.value = translated;
            }
        }
        if (el.innerHTML && el.innerHTML.trim() && !el.querySelector('*')) {
            const original = el.innerHTML;
            const translated = translateText(original);
            if (translated !== original) {
                el.innerHTML = translated;
            }
        }
    });
}

// 切换语言
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('preferred_language', lang);
    
    // 清除翻译标记，重新翻译
    document.querySelectorAll('[data-translated]').forEach(el => {
        el.removeAttribute('data-translated');
    });
    
    translatePage();
    showToast(`Language changed to ${lang.toUpperCase()}`, 'success');
}

// 暴露到全局
window.switchLanguage = switchLanguage;
window.currentLang = () => currentLang;

// 页面加载时翻译
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', translatePage);
} else {
    translatePage();
}

// 监听动态内容变化
const observer = new MutationObserver(() => {
    translatePage();
});
observer.observe(document.body, { childList: true, subtree: true });