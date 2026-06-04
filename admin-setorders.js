// admin-setorders.js - 设置订单页面（支持从用户 my_products 选择产品，生成真实欧洲/亚洲买家信息）

let setordersSearchKeyword = '';
let selectedUser = null;
let userProductsList = [];
let orderItems = [];

// ========== 买家信息生成器（欧洲+亚洲，地址匹配电话号码） ==========

const countries = [
    { code: '44', name: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Edinburgh', 'Glasgow', 'Bristol'], streetPattern: 'english', postalPattern: 'uk' },
    { code: '49', name: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig'], streetPattern: 'german', postalPattern: 'de' },
    { code: '33', name: 'France', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'], streetPattern: 'french', postalPattern: 'fr' },
    { code: '34', name: 'Spain', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Malaga', 'Murcia', 'Palma'], streetPattern: 'spanish', postalPattern: 'es' },
    { code: '39', name: 'Italy', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence'], streetPattern: 'italian', postalPattern: 'it' },
    { code: '31', name: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere'], streetPattern: 'dutch', postalPattern: 'nl' },
    { code: '43', name: 'Austria', cities: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Wels', 'Sankt Pölten'], streetPattern: 'german', postalPattern: 'at' },
    { code: '32', name: 'Belgium', cities: ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven'], streetPattern: 'french', postalPattern: 'be' },
    { code: '41', name: 'Switzerland', cities: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Winterthur', 'Lucerne', 'St. Gallen'], streetPattern: 'german', postalPattern: 'ch' },
    { code: '46', name: 'Sweden', cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg'], streetPattern: 'nordic', postalPattern: 'se' },
    { code: '47', name: 'Norway', cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Sandnes'], streetPattern: 'nordic', postalPattern: 'no' },
    { code: '45', name: 'Denmark', cities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens'], streetPattern: 'nordic', postalPattern: 'dk' },
    { code: '358', name: 'Finland', cities: ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti'], streetPattern: 'nordic', postalPattern: 'fi' },
    { code: '852', name: 'Hong Kong', cities: ['Central', 'Tsim Sha Tsui', 'Causeway Bay', 'Wan Chai', 'Mong Kok', 'Kwun Tong', 'Tsuen Wan', 'Sha Tin'], streetPattern: 'asian', postalPattern: 'hk' },
    { code: '65', name: 'Singapore', cities: ['Orchard', 'Marina Bay', 'Bugis', 'Chinatown', 'Little India', 'Jurong', 'Woodlands', 'Tampines'], streetPattern: 'asian', postalPattern: 'sg' },
    { code: '60', name: 'Malaysia', cities: ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Ipoh', 'Kuching', 'Kota Kinabalu', 'Petaling Jaya', 'Shah Alam'], streetPattern: 'asian', postalPattern: 'my' },
    { code: '62', name: 'Indonesia', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Denpasar', 'Palembang', 'Makassar'], streetPattern: 'asian', postalPattern: 'id' },
    { code: '66', name: 'Thailand', cities: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Hat Yai', 'Khon Kaen', 'Udon Thani', 'Nakhon Ratchasima'], streetPattern: 'asian', postalPattern: 'th' },
    { code: '84', name: 'Vietnam', cities: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hai Phong', 'Nha Trang', 'Can Tho', 'Bien Hoa', 'Hue'], streetPattern: 'asian', postalPattern: 'vn' },
    { code: '63', name: 'Philippines', cities: ['Manila', 'Quezon City', 'Makati', 'Cebu City', 'Davao City', 'Baguio', 'Iloilo City', 'Angeles'], streetPattern: 'asian', postalPattern: 'ph' },
    { code: '82', name: 'South Korea', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan'], streetPattern: 'korean', postalPattern: 'kr' },
    { code: '81', name: 'Japan', cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Kobe', 'Kyoto', 'Fukuoka'], streetPattern: 'japanese', postalPattern: 'jp' },
    { code: '86', name: 'China', cities: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xi\'an'], streetPattern: 'chinese', postalPattern: 'cn' },
    { code: '886', name: 'Taiwan', cities: ['Taipei', 'Taichung', 'Kaohsiung', 'Tainan', 'Hsinchu', 'Taoyuan', 'Keelung', 'Chiayi'], streetPattern: 'chinese', postalPattern: 'tw' }
];

// 亚洲名字库
const asianFirstNames = ['Wei', 'Ming', 'Jun', 'Li', 'Hao', 'Jia', 'Yi', 'Xin', 'Kai', 'Lin', 'Chen', 'Yang', 'Tao', 'Lei', 'Feng', 'Bin', 'Jie', 'Chao', 'Peng', 'Hui'];
const asianLastNames = ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou', 'Xu', 'Sun', 'Ma', 'Zhu', 'Lin', 'Guo', 'He', 'Song', 'Tang', 'Feng'];

// 欧洲名字库
const euroFirstNames = ['Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn'];
const euroLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'White', 'Harris'];

// 小名库
const asianNicknames = ['Wei', 'Ming', 'Jun', 'Li', 'Hao', 'Jia', 'Yi', 'Kai', 'Lin', 'Chen', 'Yang', 'Tao', 'Lei', 'Feng', 'Bin', 'Jie'];
const euroNicknames = ['Leo', 'Max', 'Alex', 'Sam', 'Tom', 'Ben', 'Jack', 'Anna', 'Mia', 'Lia', 'Zoe', 'Eli', 'Noa', 'Ian', 'Eva', 'Ivy', 'Ray', 'Jay'];

function randomName(isAsian) {
    if (isAsian) {
        const first = asianFirstNames[Math.floor(Math.random() * asianFirstNames.length)];
        const last = asianLastNames[Math.floor(Math.random() * asianLastNames.length)];
        return `${first} ${last}`;
    } else {
        const first = euroFirstNames[Math.floor(Math.random() * euroFirstNames.length)];
        const last = euroLastNames[Math.floor(Math.random() * euroLastNames.length)];
        return `${first} ${last}`;
    }
}

function randomNickname(isAsian) {
    if (isAsian) {
        return asianNicknames[Math.floor(Math.random() * asianNicknames.length)];
    } else {
        return euroNicknames[Math.floor(Math.random() * euroNicknames.length)];
    }
}

function generateStreet(country, number) {
    const pattern = country.streetPattern;
    switch(pattern) {
        case 'english':
            const streetsEN = ['High Street', 'Station Road', 'Church Road', 'London Road', 'Victoria Street', 'Park Avenue', 'King Street', 'Queen Street', 'Oxford Street', 'Baker Street'];
            return `${number} ${streetsEN[Math.floor(Math.random() * streetsEN.length)]}`;
        case 'german':
            const streetsDE = ['Hauptstraße', 'Bahnhofstraße', 'Schlossstraße', 'Gartenstraße', 'Bergstraße', 'Talstraße', 'Marktplatz', 'Rathausplatz', 'Kirchstraße', 'Brückenstraße'];
            return `${streetsDE[Math.floor(Math.random() * streetsDE.length)]} ${number}`;
        case 'french':
            const streetsFR = ['Rue de la Paix', 'Rue du Commerce', 'Avenue des Champs', 'Boulevard Saint-Germain', 'Rue Victor Hugo', 'Place de la République', 'Rue de Rivoli', 'Avenue des Ternes'];
            return `${number} ${streetsFR[Math.floor(Math.random() * streetsFR.length)]}`;
        case 'spanish':
            const streetsES = ['Calle Mayor', 'Gran Vía', 'Paseo de Gracia', 'Avenida de la Constitución', 'Calle de Alcalá', 'Plaza Mayor', 'Calle del Carmen', 'Avenida de América'];
            return `${streetsES[Math.floor(Math.random() * streetsES.length)]} ${number}`;
        case 'italian':
            const streetsIT = ['Via Roma', 'Corso Vittorio Emanuele', 'Via del Corso', 'Piazza Navona', 'Via Garibaldi', 'Via Nazionale', 'Via Veneto', 'Via Manzoni'];
            return `${streetsIT[Math.floor(Math.random() * streetsIT.length)]} ${number}`;
        case 'dutch':
            const streetsNL = ['Hoofdstraat', 'Kerkstraat', 'Dorpsstraat', 'Molenstraat', 'Schoolstraat', 'Parkstraat', 'Wilhelminastraat', 'Julianalaan'];
            return `${streetsNL[Math.floor(Math.random() * streetsNL.length)]} ${number}`;
        case 'nordic':
            const streetsNO = ['Storgatan', 'Kungsgatan', 'Drottninggatan', 'Vasagatan', 'Järnvägsgatan', 'Södra Vägen', 'Nordenskiöldsgatan', 'Hagaesplanaden'];
            return `${streetsNO[Math.floor(Math.random() * streetsNO.length)]} ${number}`;
        case 'korean':
            const streetsKR = ['Sejong-daero', 'Gangnam-daero', 'Teheran-ro', 'Jong-ro', 'Eulji-ro', 'Mapo-daero', 'Apgujeong-ro', 'Samseong-ro'];
            return `${streetsKR[Math.floor(Math.random() * streetsKR.length)]} ${number}`;
        case 'japanese':
            const streetsJP = ['Chuo-dori', 'Omotesando', 'Shinjuku-dori', 'Shibuya-dori', 'Ginza-dori', 'Akihabara-dori', 'Roppongi-dori', 'Aoyama-dori'];
            return `${streetsJP[Math.floor(Math.random() * streetsJP.length)]} ${number}`;
        case 'chinese':
            const streetsCN = ['Nanjing Road', 'Huaihai Road', 'Renmin Road', 'Zhongshan Road', 'Beijing Road', 'West Nanjing Road', 'East Chang\'an Avenue', 'Huaihai Middle Road'];
            return `${number} ${streetsCN[Math.floor(Math.random() * streetsCN.length)]}`;
        default:
            return `${number} Main Street`;
    }
}

function generatePostalCode(country, city) {
    const pattern = country.postalPattern;
    switch(pattern) {
        case 'uk':
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            return `${Math.floor(Math.random() * 90 + 10)}${letters.charAt(Math.floor(Math.random() * 26))}${letters.charAt(Math.floor(Math.random() * 26))} ${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${letters.charAt(Math.floor(Math.random() * 26))}`;
        case 'de':
        case 'at':
        case 'ch':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'fr':
        case 'be':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'es':
        case 'it':
        case 'nl':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'se':
        case 'no':
        case 'dk':
        case 'fi':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)} ${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'hk':
            return '';
        case 'sg':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'my':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'id':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'th':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'vn':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'ph':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'kr':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'jp':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}-${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'cn':
        case 'tw':
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        default:
            return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
    }
}

function generateRandomBuyer() {
    // 随机选择国家
    const country = countries[Math.floor(Math.random() * countries.length)];
    
    // 随机决定是亚洲还是欧洲名字（根据国家判断）
    const isAsianCountry = ['852', '65', '60', '62', '66', '84', '63', '82', '81', '86', '886'].includes(country.code);
    
    // 随机决定用全名还是小名（60%全名，40%小名）
    const useFullName = Math.random() > 0.4;
    let name;
    if (useFullName) {
        name = randomName(isAsianCountry);
    } else {
        name = randomNickname(isAsianCountry);
    }
    
    // 生成电话（只显示后4位）
    const numberPart = Math.floor(Math.random() * 90000000 + 10000000);
    const phoneFull = `+${country.code}${numberPart}`;
    const phoneDisplay = `+${country.code}****${numberPart.toString().slice(-4)}`;
    
    // 随机城市
    const city = country.cities[Math.floor(Math.random() * country.cities.length)];
    
    // 门牌号
    const streetNumber = Math.floor(Math.random() * 500) + 1;
    
    // 街道
    const street = generateStreet(country, streetNumber);
    
    // 邮编
    const postalCode = generatePostalCode(country, city);
    
    // 完整地址
    let address;
    if (postalCode) {
        address = `${street}, ${postalCode} ${city}, ${country.name}`;
    } else {
        address = `${street}, ${city}, ${country.name}`;
    }
    
    return {
        name: name,
        phone: phoneDisplay,
        phoneFull: phoneFull,
        address: address,
        city: city,
        countryCode: country.code,
        countryName: country.name
    };
}

// ========== 页面加载函数 ==========

async function loadSetordersPage() {
    const container = document.getElementById('page_setorders');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="search-bar" style="justify-content: space-between;">
                <h3><i class="fas fa-cog"></idata-i18n=" Set Orders"data-i18n=" Set Orders"data-i18n=" Set Orders"data-i18n=" Set Orders"> Set Orders</h3>
                <button id="backToUserList" class="btn-primary" style="display:none;"><i class="fas fa-arrow-left"></idata-i18n=" Back to Users"data-i18n=" Back to Users"data-i18n=" Back to Users"data-i18n=" Back to Users"> Back to Users</button>
            </div>
            
            <div id="setordersUserSearch">
                <div class="search-bar">
                    <input type="text" id="setordersSearchUid" placeholder="🔍 Search UID or Username" style="flex:1;" class="search-input">
                    <button id="setordersSearchBtn" class="btn-primary"><i class="fas fa-search"></idata-i18n=" Search"data-i18n=" Search"data-i18n=" Search"data-i18n=" Search"> Search</button>
                </div>
                <div id="setordersUserList" class="table-container" style="max-height: 300px;">
                    <table class="data-table">
                        <thead><tr><thdata-i18n="UID"data-i18n="UID"data-i18n="UID"data-i18n="UID">UID</th><thdata-i18n="Username"data-i18n="Username"data-i18n="Username"data-i18n="Username">Username</th><thdata-i18n="Action"data-i18n="Action"data-i18n="Action"data-i18n="Action">Action</th></tr></thead>
                        <tbody id="setordersUserTableBody"></tbody>
                    </table>
                </div>
            </div>
            
            <div id="setordersMain" style="display: none;">
                <div class="uid-header" style="background: rgba(74,124,255,0.1); padding: 10px 16px; border-radius: 12px; margin-bottom: 20px;">
                    Current User: <span id="selectedUidDisplay" style="color:#4a7cff;"></spandata-i18n=" - "data-i18n=" - "> - <span id="selectedUsernameDisplay"></span>
                </div>
                
                <div id="userProductsList" style="max-height: 500px; overflow-y: auto; margin-bottom: 20px;"></div>
                
                <div id="orderSummary" style="background: #0f172a; border-radius: 16px; padding: 16px; margin-top: 20px; border: 1px solid rgba(74,124,255,0.2);">
                    <h4 style="margin-bottom: 12px; color: #ffb84d;"><i class="fas fa-receipt"></idata-i18n=" Order Summary"data-i18n=" Order Summary"data-i18n=" Order Summary"data-i18n=" Order Summary"> Order Summary</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <spandata-i18n="Total Supply Price:"data-i18n="Total Supply Price:">Total Supply Price:</span>
                        <span id="totalSupplyPrice" style="color: #ffb84d; font-weight: 700;"data-i18n="€0"data-i18n="€0">€0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <spandata-i18n="Total Commission:"data-i18n="Total Commission:">Total Commission:</span>
                        <span id="totalCommission" style="color: #2ed15a; font-weight: 700;"data-i18n="€0"data-i18n="€0">€0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                        <spandata-i18n="Final Account Increase:"data-i18n="Final Account Increase:">Final Account Increase:</span>
                        <span id="totalIncrease" style="color: #4a7cff; font-weight: 700;"data-i18n="€0"data-i18n="€0">€0</span>
                    </div>
                    <button id="confirmSetOrderBtn" class="success" style="width: 100%; padding: 12px;">
                        <i class="fas fa-check"></i> Create Order
                    </button>
                </div>
            </div>
        </div>
    `;
    
    await loadSetordersUserList();
    
    document.getElementById('setordersSearchBtn')?.addEventListener('click', () => {
        setordersSearchKeyword = document.getElementById('setordersSearchUid').value.trim();
        loadSetordersUserList();
    });
    
    document.getElementById('backToUserList')?.addEventListener('click', () => {
        document.getElementById('setordersUserSearch').style.display = 'block';
        document.getElementById('setordersMain').style.display = 'none';
        selectedUser = null;
        orderItems = [];
    });
    
    document.getElementById('confirmSetOrderBtn')?.addEventListener('click', confirmSetOrder);
}

async function loadSetordersUserList() {
    let query = sb.from('users').select('uid, username').order('created_at', { ascending: false });
    if (setordersSearchKeyword) {
        query = query.or(`uid.ilike.%${setordersSearchKeyword}%,username.ilike.%${setordersSearchKeyword}%`);
    }
    const { data: users } = await query;
    const tbody = document.getElementById('setordersUserTableBody');
    
    if (tbody && users) {
        tbody.innerHTML = '';
        for (let u of users) {
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<span class="badge"data-i18n="${u.uid}"data-i18n="${u.uid}">${u.uid}</span>`;
            row.insertCell(1).innerText = u.username;
            row.insertCell(2).innerHTML = `<button class="setorder-select-btn" data-uid="${u.uid}" data-name="${u.username}" style="background:#4a7cff; padding:4px 12px; border-radius:8px; border:none; color:white; cursor:pointer;"><i class="fas fa-cog"></idata-i18n=" Set Orders"data-i18n=" Set Orders"data-i18n=" Set Orders"data-i18n=" Set Orders"> Set Orders</button>`;
        }
        document.querySelectorAll('.setorder-select-btn').forEach(btn => {
            btn.addEventListener('click', () => selectUserForSetOrder(btn.dataset.uid, btn.dataset.name));
        });
    }
}

async function selectUserForSetOrder(uid, username) {
    selectedUser = { uid, username };
    document.getElementById('selectedUidDisplay').innerText = uid;
    document.getElementById('selectedUsernameDisplay').innerText = username;
    
    await loadUserProductsForOrder(uid);
    
    document.getElementById('setordersUserSearch').style.display = 'none';
    document.getElementById('setordersMain').style.display = 'block';
}

async function loadUserProductsForOrder(uid) {
    const container = document.getElementById('userProductsList');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center; padding:40px;"data-i18n="Loading..."data-i18n="Loading..."data-i18n="Loading..."data-i18n="Loading...">Loading...</div>';
    
    const { data: products, error } = await sb
        .from('user_products')
        .select('*')
        .eq('uid', uid)
        .order('added_at', { ascending: false });
    
    if (error || !products || products.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#aaa;"data-i18n="No products added by this user"data-i18n="No products added by this user"data-i18n="No products added by this user"data-i18n="No products added by this user">No products added by this user</div>';
        return;
    }
    
    orderItems = products.map(p => ({
        product_id: p.product_id || p.id,
        product_name: p.product_name,
        price: p.price,
        margin_profit: p.margin_profit,
        quantity: 0,
        image_url: p.image_url
    }));
    
    renderProductSelectionList();
}

function renderProductSelectionList() {
    const container = document.getElementById('userProductsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        const div = document.createElement('div');
        div.className = 'product-selection-item';
        div.style.cssText = 'background:#0f172a; border-radius:16px; padding:15px; margin-bottom:12px; display:flex; gap:15px; align-items:center; flex-wrap:wrap; border:1px solid rgba(74,124,255,0.2);';
        
        div.innerHTML = `
            <div style="flex-shrink:0;">
                <img src="${item.image_url || 'https://placehold.co/60x60/1e2a3a/4a7cff?text=No+Image'}" style="width:60px; height:60px; border-radius:12px; object-fit:cover;" onerror="this.src='https://placehold.co/60x60/1e2a3a/4a7cff?text=No+Image'">
            </div>
            <div style="flex:2;">
                <div style="font-weight:600; color:#ffb84d;"data-i18n="${escapeHtml(item.product_name)}"data-i18n="${escapeHtml(item.product_name)}">${escapeHtml(item.product_name)}</div>
                <div style="font-size:12px; color:#8a9abb;"data-i18n="Supply Price: €${item.price.toFixed(2)} | Commission: €${item.margin_profit.toFixed(2)}"data-i18n="Supply Price: €${item.price.toFixed(2)} | Commission: €${item.margin_profit.toFixed(2)}">Supply Price: €${item.price.toFixed(2)} | Commission: €${item.margin_profit.toFixed(2)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <button class="qty-decr" data-index="${i}" style="background:#4a7cff; border:none; width:32px; height:32px; border-radius:8px; color:white; cursor:pointer; font-size:16px;"data-i18n="-"data-i18n="-">-</button>
                <span style="font-size:18px; font-weight:700; min-width:30px; text-align:center;" id="qty_${i}"data-i18n="${item.quantity}"data-i18n="${item.quantity}">${item.quantity}</span>
                <button class="qty-incr" data-index="${i}" style="background:#4a7cff; border:none; width:32px; height:32px; border-radius:8px; color:white; cursor:pointer; font-size:16px;"data-i18n="+"data-i18n="+">+</button>
            </div>
        `;
        container.appendChild(div);
    }
    
    document.querySelectorAll('.qty-decr').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            if (orderItems[idx].quantity > 0) {
                orderItems[idx].quantity--;
                document.getElementById(`qty_${idx}`).innerText = orderItems[idx].quantity;
                updateOrderSummary();
            }
        });
    });
    
    document.querySelectorAll('.qty-incr').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            orderItems[idx].quantity++;
            document.getElementById(`qty_${idx}`).innerText = orderItems[idx].quantity;
            updateOrderSummary();
        });
    });
    
    updateOrderSummary();
}

function updateOrderSummary() {
    let totalSupply = 0;
    let totalCommission = 0;
    
    for (const item of orderItems) {
        totalSupply += item.price * item.quantity;
        totalCommission += item.margin_profit * item.quantity;
    }
    
    document.getElementById('totalSupplyPrice').innerHTML = `€${totalSupply.toFixed(2)}`;
    document.getElementById('totalCommission').innerHTML = `€${totalCommission.toFixed(2)}`;
    document.getElementById('totalIncrease').innerHTML = `€${(totalSupply + totalCommission).toFixed(2)}`;
}

async function confirmSetOrder() {
    const selectedItems = orderItems.filter(item => item.quantity > 0);
    
    if (selectedItems.length === 0) {
        showToast('Please select at least one product', 'error');
        return;
    }
    
    const orderNo = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    const buyer = generateRandomBuyer();
    
    const shippingAddress = "Supplier Warehouse, 100 Century Avenue, Pudong, Shanghai, China";
    
    let totalSupplyPrice = 0;
    let totalCommission = 0;
    let productsList = [];
    
    for (const item of selectedItems) {
        totalSupplyPrice += item.price * item.quantity;
        totalCommission += item.margin_profit * item.quantity;
        productsList.push({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
            commission: item.margin_profit * item.quantity,
            commission_per_item: item.margin_profit,
            image_url: item.image_url
        });
    }
    
    const { error } = await sb.from('user_orders').insert({
        uid: selectedUser.uid,
        order_no: orderNo,
        products: JSON.stringify(productsList),
        total_supply_price: totalSupplyPrice,
        total_commission: totalCommission,
        buyer_name: buyer.name,
        buyer_phone: buyer.phone,
        buyer_address: buyer.address,
        shipping_address: shippingAddress,
        status: 'pending',
        created_at: new Date().toISOString()
    });
    
    if (error) {
        showToast('Failed to create order: ' + error.message, 'error');
        return;
    }
    
    showToast(`Order ${orderNo} created successfully!`, 'success');
    
    orderItems = orderItems.map(item => ({ ...item, quantity: 0 }));
    renderProductSelectionList();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<data-i18n="]/g, m =data-i18n=" m === '&' ? '&amp;' : m === '">]/g, m => m === '&' ? '&amp;' : m === '"> m === '&' ? '&amp;' : m === '">]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

window.loadSetordersPage = loadSetordersPage;