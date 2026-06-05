// admin-setorders.js - 设置订单页面（支持 Payment Release Timer/Trigger）

let setordersSearchKeyword = '';
let selectedUser = null;
let userProductsList = [];
let orderItems = [];
let manualTriggerOrders = [];
let paymentReleaseTimer = null;
let paymentReleaseTrigger = false;

// ========== 买家信息生成器 ==========

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

const asianFirstNames = ['Wei', 'Ming', 'Jun', 'Li', 'Hao', 'Jia', 'Yi', 'Xin', 'Kai', 'Lin', 'Chen', 'Yang', 'Tao', 'Lei', 'Feng', 'Bin', 'Jie', 'Chao', 'Peng', 'Hui'];
const asianLastNames = ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou', 'Xu', 'Sun', 'Ma', 'Zhu', 'Lin', 'Guo', 'He', 'Song', 'Tang', 'Feng'];
const euroFirstNames = ['Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn'];
const euroLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'White', 'Harris'];
const asianNicknames = ['Wei', 'Ming', 'Jun', 'Li', 'Hao', 'Jia', 'Yi', 'Kai', 'Lin', 'Chen', 'Yang', 'Tao', 'Lei', 'Feng', 'Bin', 'Jie'];
const euroNicknames = ['Leo', 'Max', 'Alex', 'Sam', 'Tom', 'Ben', 'Jack', 'Anna', 'Mia', 'Lia', 'Zoe', 'Eli', 'Noa', 'Ian', 'Eva', 'Ivy', 'Ray', 'Jay'];

function randomName(isAsian) {
    if (isAsian) {
        return `${asianFirstNames[Math.floor(Math.random() * asianFirstNames.length)]} ${asianLastNames[Math.floor(Math.random() * asianLastNames.length)]}`;
    } else {
        return `${euroFirstNames[Math.floor(Math.random() * euroFirstNames.length)]} ${euroLastNames[Math.floor(Math.random() * euroLastNames.length)]}`;
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
    const streets = {
        english: ['High Street', 'Station Road', 'Church Road', 'London Road', 'Victoria Street', 'Park Avenue', 'King Street', 'Queen Street', 'Oxford Street', 'Baker Street'],
        german: ['Hauptstraße', 'Bahnhofstraße', 'Schlossstraße', 'Gartenstraße', 'Bergstraße', 'Talstraße', 'Marktplatz', 'Rathausplatz', 'Kirchstraße', 'Brückenstraße'],
        french: ['Rue de la Paix', 'Rue du Commerce', 'Avenue des Champs', 'Boulevard Saint-Germain', 'Rue Victor Hugo', 'Place de la République', 'Rue de Rivoli', 'Avenue des Ternes'],
        spanish: ['Calle Mayor', 'Gran Vía', 'Paseo de Gracia', 'Avenida de la Constitución', 'Calle de Alcalá', 'Plaza Mayor', 'Calle del Carmen', 'Avenida de América'],
        italian: ['Via Roma', 'Corso Vittorio Emanuele', 'Via del Corso', 'Piazza Navona', 'Via Garibaldi', 'Via Nazionale', 'Via Veneto', 'Via Manzoni'],
        dutch: ['Hoofdstraat', 'Kerkstraat', 'Dorpsstraat', 'Molenstraat', 'Schoolstraat', 'Parkstraat', 'Wilhelminastraat', 'Julianalaan'],
        nordic: ['Storgatan', 'Kungsgatan', 'Drottninggatan', 'Vasagatan', 'Järnvägsgatan', 'Södra Vägen', 'Nordenskiöldsgatan', 'Hagaesplanaden'],
        korean: ['Sejong-daero', 'Gangnam-daero', 'Teheran-ro', 'Jong-ro', 'Eulji-ro', 'Mapo-daero', 'Apgujeong-ro', 'Samseong-ro'],
        japanese: ['Chuo-dori', 'Omotesando', 'Shinjuku-dori', 'Shibuya-dori', 'Ginza-dori', 'Akihabara-dori', 'Roppongi-dori', 'Aoyama-dori'],
        chinese: ['Nanjing Road', 'Huaihai Road', 'Renmin Road', 'Zhongshan Road', 'Beijing Road', 'West Nanjing Road', 'East Chang\'an Avenue', 'Huaihai Middle Road']
    };
    const streetList = streets[pattern] || streets.english;
    return `${number} ${streetList[Math.floor(Math.random() * streetList.length)]}`;
}

function generatePostalCode(country) {
    const pattern = country.postalPattern;
    switch(pattern) {
        case 'uk': return `${Math.floor(Math.random() * 90 + 10)}${String.fromCharCode(65 + Math.random() * 26)}${String.fromCharCode(65 + Math.random() * 26)} ${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${String.fromCharCode(65 + Math.random() * 26)}`;
        case 'de': case 'at': case 'ch': return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'fr': case 'be': case 'es': case 'it': case 'nl': return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'se': case 'no': case 'dk': case 'fi': return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)} ${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        case 'jp': return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}-${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
        default: return `${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`;
    }
}

function generateRandomBuyer() {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const isAsianCountry = ['852', '65', '60', '62', '66', '84', '63', '82', '81', '86', '886'].includes(country.code);
    const useFullName = Math.random() > 0.4;
    const name = useFullName ? randomName(isAsianCountry) : randomNickname(isAsianCountry);
    const numberPart = Math.floor(Math.random() * 90000000 + 10000000);
    const city = country.cities[Math.floor(Math.random() * country.cities.length)];
    const streetNumber = Math.floor(Math.random() * 500) + 1;
    const street = generateStreet(country, streetNumber);
    const postalCode = generatePostalCode(country);
    const address = postalCode ? `${street}, ${postalCode} ${city}, ${country.name}` : `${street}, ${city}, ${country.name}`;
    
    return {
        name: name,
        phone: `+${country.code}****${numberPart.toString().slice(-4)}`,
        phoneFull: `+${country.code}${numberPart}`,
        address: address,
        city: city,
        countryCode: country.code,
        countryName: country.name
    };
}

// ========== 加载 Manual Trigger Orders ==========
async function loadManualTriggerOrders() {
    try {
        const { data: orders, error } = await sb
            .from('user_orders')
            .select('*')
            .eq('status', 'pending_payment')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        manualTriggerOrders = orders || [];
        renderManualTriggerCard();
    } catch (err) {
        console.error('加载 Manual Trigger Orders 失败:', err);
    }
}

function renderManualTriggerCard() {
    const container = document.getElementById('manualTriggerContainer');
    if (!container) return;
    
    if (manualTriggerOrders.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = `
        <div style="background: rgba(15, 25, 40, 0.9); backdrop-filter: blur(12px); border-radius: 16px; padding: 16px; margin-top: 20px; border: 1px solid rgba(255, 122, 0, 0.3);">
            <h4 style="color: #ffb84d; margin-bottom: 12px;"><i class="fas fa-clock"></i> Manual Trigger Orders</h4>
            <div style="max-height: 300px; overflow-y: auto;">
                ${manualTriggerOrders.map(order => `
                    <div style="background: #0f172a; border-radius: 12px; padding: 12px; margin-bottom: 10px; border: 1px solid rgba(255,122,0,0.2);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div>
                                <div style="font-weight: 700; color: #ffb84d;">${order.order_no}</div>
                                <div style="font-size: 11px; color: #8a9abb;">User: ${order.uid} | €${order.total_supply_price}</div>
                            </div>
                            <button class="trigger-release-btn" data-order="${order.order_no}" style="background: #2f6b3a; border: none; padding: 6px 16px; border-radius: 20px; color: white; cursor: pointer;">
                                <i class="fas fa-play"></i> Trigger Payment Release
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.querySelectorAll('.trigger-release-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const orderNo = btn.dataset.order;
            await triggerPaymentRelease(orderNo, 0);
            await loadManualTriggerOrders();
            showToast(`已触发订单 ${orderNo} 的 Payment Release`, 'success');
        });
    });
}

// ========== 触发 Payment Release ==========
async function triggerPaymentRelease(orderNo, delayMinutes = 0) {
    try {
        const { data: order } = await sb
            .from('user_orders')
            .select('tracking_timeline, created_at')
            .eq('order_no', orderNo)
            .single();
        
        if (!order) return false;
        
        let timeline = JSON.parse(order.tracking_timeline || '[]');
        let escrowTime = null;
        for (let i = 0; i < timeline.length; i++) {
            if (timeline[i].status === "Payment under escrow protection") {
                escrowTime = new Date(timeline[i].time);
                break;
            }
        }
        
        if (!escrowTime) return false;
        
        let paymentReleasedTime = new Date();
        if (delayMinutes > 0) {
            const calculatedTime = new Date(escrowTime.getTime() + delayMinutes * 60 * 1000);
            if (calculatedTime > paymentReleasedTime) {
                paymentReleasedTime = calculatedTime;
            }
        }
        
        timeline = timeline.filter(item => item.status !== "Payment released");
        timeline.push({ status: "Payment released", time: paymentReleasedTime.toISOString() });
        
        const subsequentStatuses = [
            "Order confirmed",
            "Preparing parcel for shipment",
            "Courier assigned",
            "Parcel picked up by logistics partner",
            "Parcel arrived at sorting facility",
            "Parcel departed from sorting facility",
            "Parcel arrived at delivery hub",
            "Parcel out for delivery",
            "Parcel delivered"
        ];
        
        const orderConfirmedDelay = 5 + Math.random() * 5;
        const preparingDelay = 30 + Math.random() * 30;
        
        const orderConfirmedTime = new Date(paymentReleasedTime.getTime() + orderConfirmedDelay * 60 * 1000);
        timeline.push({ status: "Order confirmed", time: orderConfirmedTime.toISOString() });
        
        const preparingTime = new Date(orderConfirmedTime.getTime() + preparingDelay * 60 * 1000);
        timeline.push({ status: "Preparing parcel for shipment", time: preparingTime.toISOString() });
        
        const remainingStatuses = subsequentStatuses.length - 2;
        const totalRemainingMs = (3 + Math.random() * 1) * 24 * 60 * 60 * 1000;
        
        let intervals = [];
        let remaining = totalRemainingMs;
        for (let i = 0; i < remainingStatuses; i++) {
            const maxGap = remaining / (remainingStatuses - i);
            const gap = maxGap * (0.3 + Math.random() * 0.7);
            intervals.push(gap);
            remaining -= gap;
        }
        
        let laterTime = new Date(preparingTime);
        for (let i = 0; i < remainingStatuses; i++) {
            laterTime = new Date(laterTime.getTime() + intervals[i]);
            timeline.push({ status: subsequentStatuses[i + 2], time: laterTime.toISOString() });
        }
        
        await sb.from('user_orders').update({
            status: 'processing',
            tracking_status: 'processing',
            tracking_timeline: JSON.stringify(timeline)
        }).eq('order_no', orderNo);
        
        return true;
    } catch (err) {
        console.error('触发 Payment Release 失败:', err);
        return false;
    }
}

// ========== 页面加载函数 ==========
async function loadSetordersPage() {
    const container = document.getElementById('page_setorders');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card" style="background: rgba(15, 25, 40, 0.9); backdrop-filter: blur(12px); border: 1px solid rgba(74,124,255,0.15); border-radius: 24px; padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                <h3 style="margin:0; color: #eef5ff;"><i class="fas fa-cog"></i> Set Orders</h3>
                <button id="backToUserList" class="btn-primary" style="display:none; background: linear-gradient(135deg, #4a7cff, #2a5adc); border: none; border-radius: 30px; padding: 8px 20px; color: white; cursor: pointer;">
                    <i class="fas fa-arrow-left"></i> Back to Users
                </button>
            </div>
            
            <div id="setordersUserSearch">
                <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                    <input type="text" id="setordersSearchUid" placeholder="🔍 Search UID or Username" style="flex:1; background: #0f172a; border: 1px solid #1e2a3a; border-radius: 12px; padding: 10px 18px; color: #eef5ff;">
                    <button id="setordersSearchBtn" class="btn-primary" style="background: linear-gradient(135deg, #4a7cff, #2a5adc); border: none; border-radius: 30px; padding: 8px 20px; color: white; cursor: pointer;">
                        <i class="fas fa-search"></i> Search
                    </button>
                </div>
                <div id="setordersUserList" class="table-container" style="background: rgba(10,18,30,0.7); border-radius: 20px; max-height: 300px; overflow-x: auto;">
                    <table class="data-table" style="width:100%; border-collapse: collapse;">
                        <thead>
                            <tr><th style="padding: 14px 12px; text-align: left; color: #4a7cff;">UID</th><th style="padding: 14px 12px; text-align: left; color: #4a7cff;">Username</th><th style="padding: 14px 12px; text-align: left; color: #4a7cff;">Action</th></tr>
                        </thead>
                        <tbody id="setordersUserTableBody"></tbody>
                    </table>
                </div>
            </div>
            
            <div id="setordersMain" style="display: none;">
                <div style="background: rgba(74,124,255,0.1); padding: 10px 16px; border-radius: 12px; margin-bottom: 20px;">
                    Current User: <span id="selectedUidDisplay" style="color:#4a7cff;"></span> - <span id="selectedUsernameDisplay"></span>
                </div>
                
                <div id="userProductsList" style="max-height: 500px; overflow-y: auto; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 12px;"></div>
                
                <!-- Payment Release Timer / Trigger 卡片 -->
                <div style="background: rgba(74,124,255,0.08); border: 1px solid rgba(74,124,255,0.2); border-radius: 16px; padding: 16px; margin-bottom: 20px;">
                    <h4 style="color: #ffb84d; margin-bottom: 16px;"><i class="fas fa-clock"></i> Payment Release Timer / Trigger</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center;">
                        <div style="flex: 1; min-width: 150px;">
                            <label style="display: block; font-size: 12px; color: #8a9abb; margin-bottom: 6px;">Set Payment Release Timer (Minutes)</label>
                            <input type="number" id="paymentTimerInput" placeholder="e.g., 30" style="width: 100%; background: #0f172a; border: 1px solid #1e2a3a; border-radius: 8px; padding: 10px; color: #fff;">
                        </div>
                        <div>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" id="paymentTriggerCheckbox" style="width: 18px; height: 18px; cursor: pointer;">
                                <span style="color: #ffb84d; font-size: 13px;"><i class="fas fa-bolt"></i> Trigger Payment Release</span>
                            </label>
                        </div>
                    </div>
                    <div style="font-size: 11px; color: #6a7a9a; margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(74,124,255,0.1);">
                        <i class="fas fa-info-circle"></i> Set timer to auto-release after user completes order, or check trigger to release immediately. Leave both empty to add to Manual Trigger Orders.
                    </div>
                </div>
                
                <div id="orderSummary" style="background: #0f172a; border-radius: 16px; padding: 16px; border: 1px solid rgba(74,124,255,0.2);">
                    <h4 style="margin-bottom: 12px; color: #ffb84d;"><i class="fas fa-receipt"></i> Order Summary</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Total Supply Price:</span>
                        <span id="totalSupplyPrice" style="color: #ffb84d; font-weight: 700;">€0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Total Commission:</span>
                        <span id="totalCommission" style="color: #2ed15a; font-weight: 700;">€0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                        <span>Final Account Increase:</span>
                        <span id="totalIncrease" style="color: #4a7cff; font-weight: 700;">€0</span>
                    </div>
                    <button id="confirmSetOrderBtn" class="success" style="width: 100%; padding: 12px; background: linear-gradient(95deg, #2f6b3a, #1f552c); border: none; border-radius: 30px; color: white; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-check"></i> Create Order
                    </button>
                </div>
                
                <div id="manualTriggerContainer" style="margin-top: 20px; display: none;"></div>
            </div>
        </div>
    `;
    
    await loadSetordersUserList();
    await loadManualTriggerOrders();
    
    document.getElementById('setordersSearchBtn')?.addEventListener('click', () => {
        setordersSearchKeyword = document.getElementById('setordersSearchUid').value.trim();
        loadSetordersUserList();
    });
    
    document.getElementById('backToUserList')?.addEventListener('click', () => {
        document.getElementById('setordersUserSearch').style.display = 'block';
        document.getElementById('setordersMain').style.display = 'none';
        selectedUser = null;
        orderItems = [];
        paymentReleaseTimer = null;
        paymentReleaseTrigger = false;
        const timerInput = document.getElementById('paymentTimerInput');
        const triggerCheck = document.getElementById('paymentTriggerCheckbox');
        if (timerInput) timerInput.value = '';
        if (triggerCheck) triggerCheck.checked = false;
    });
    
    document.getElementById('confirmSetOrderBtn')?.addEventListener('click', confirmSetOrder);
    
    const timerInput = document.getElementById('paymentTimerInput');
    const triggerCheck = document.getElementById('paymentTriggerCheckbox');
    
    if (timerInput) {
        timerInput.addEventListener('input', (e) => {
            paymentReleaseTimer = e.target.value ? parseInt(e.target.value) : null;
            if (paymentReleaseTimer && triggerCheck) triggerCheck.checked = false;
        });
    }
    
    if (triggerCheck) {
        triggerCheck.addEventListener('change', (e) => {
            paymentReleaseTrigger = e.target.checked;
            if (paymentReleaseTrigger && timerInput) timerInput.value = '';
        });
    }
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
            row.insertCell(0).innerHTML = `<span class="badge" style="background: rgba(74,124,255,0.2); padding: 4px 10px; border-radius: 20px;">${u.uid}</span>`;
            row.insertCell(1).innerText = u.username;
            row.insertCell(2).innerHTML = `<button class="setorder-select-btn" data-uid="${u.uid}" data-name="${u.username}" style="background:#4a7cff; padding:6px 16px; border-radius:20px; border:none; color:white; cursor:pointer;">
                <i class="fas fa-cog"></i> Set Orders
            </button>`;
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
    
    container.innerHTML = '<div style="text-align:center; padding:40px; color:#aaa;">Loading...</div>';
    
    const { data: products, error } = await sb
        .from('user_products')
        .select('*')
        .eq('uid', uid)
        .order('added_at', { ascending: false });
    
    if (error || !products || products.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#aaa;">No products added by this user</div>';
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
    
    container.style.cssText = 'display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-start; margin-bottom: 20px;';
    container.innerHTML = '';
    
    for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        const div = document.createElement('div');
        div.style.cssText = 'background:#0f172a; border-radius:16px; padding:12px; width:calc(16.666% - 10px); min-width:140px; display:flex; flex-direction:column; align-items:center; text-align:center; border:1px solid rgba(74,124,255,0.2);';
        
        div.innerHTML = `
            <img src="${item.image_url || 'https://placehold.co/80x80/1e2a3a/4a7cff?text=No+Image'}" style="width:80px; height:80px; border-radius:12px; object-fit:cover; margin-bottom:10px;" onerror="this.src='https://placehold.co/80x80/1e2a3a/4a7cff?text=No+Image'">
            <div style="font-weight:600; color:#ffb84d; font-size:13px; margin-bottom:6px;">${escapeHtml(item.product_name)}</div>
            <div style="font-size:11px; color:#8a9abb;">€${item.price.toFixed(2)} | +€${item.margin_profit.toFixed(2)}</div>
            <div style="display:flex; align-items:center; gap:10px; margin-top:10px;">
                <button class="qty-decr" data-index="${i}" style="background:#4a7cff; border:none; width:28px; height:28px; border-radius:6px; color:white; cursor:pointer;">-</button>
                <span style="font-size:16px; font-weight:700; min-width:30px; text-align:center;" id="qty_${i}">${item.quantity}</span>
                <button class="qty-incr" data-index="${i}" style="background:#4a7cff; border:none; width:28px; height:28px; border-radius:6px; color:white; cursor:pointer;">+</button>
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
    
    const supplyEl = document.getElementById('totalSupplyPrice');
    const commissionEl = document.getElementById('totalCommission');
    const increaseEl = document.getElementById('totalIncrease');
    if (supplyEl) supplyEl.innerHTML = `€${totalSupply.toFixed(2)}`;
    if (commissionEl) commissionEl.innerHTML = `€${totalCommission.toFixed(2)}`;
    if (increaseEl) increaseEl.innerHTML = `€${(totalSupply + totalCommission).toFixed(2)}`;
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
    
    // 生成初始 timeline
    const startTime = new Date();
    const initialTimeline = [
        { status: "Order is placed", time: startTime.toISOString() }
    ];
    const paymentReceivedDelay = 5 + Math.random() * 2;
    const paymentReceivedTime = new Date(startTime.getTime() + paymentReceivedDelay * 60 * 1000);
    initialTimeline.push({ status: "Payment received from buyer", time: paymentReceivedTime.toISOString() });
    initialTimeline.push({ status: "Payment under escrow protection", time: paymentReceivedTime.toISOString() });
    
    let orderStatus = 'pending_payment';
    let trackingStatus = 'pending_payment';
    let finalTimeline = initialTimeline;
    
    if (paymentReleaseTrigger) {
        orderStatus = 'processing';
        trackingStatus = 'processing';
        finalTimeline = generateFullTimeline(startTime);
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
        status: orderStatus,
        tracking_status: trackingStatus,
        tracking_timeline: JSON.stringify(finalTimeline),
        payment_release_timer: paymentReleaseTimer || null,
        created_at: new Date().toISOString()
    });
    
    if (error) {
        showToast('Failed to create order: ' + error.message, 'error');
        return;
    }
    
    if (paymentReleaseTrigger) {
        showToast(`订单 ${orderNo} 创建成功！Payment Release 已立即触发`, 'success');
    } else if (paymentReleaseTimer && paymentReleaseTimer > 0) {
        showToast(`订单 ${orderNo} 创建成功！Payment Release 将在用户确认订单后 ${paymentReleaseTimer} 分钟自动触发`, 'success');
    } else {
        showToast(`订单 ${orderNo} 创建成功！已添加到 Manual Trigger Orders`, 'success');
        await loadManualTriggerOrders();
    }
    
    orderItems = orderItems.map(item => ({ ...item, quantity: 0 }));
    renderProductSelectionList();
    paymentReleaseTimer = null;
    paymentReleaseTrigger = false;
    const timerInput = document.getElementById('paymentTimerInput');
    const triggerCheck = document.getElementById('paymentTriggerCheckbox');
    if (timerInput) timerInput.value = '';
    if (triggerCheck) triggerCheck.checked = false;
}

function generateFullTimeline(startTime) {
    const timeline = [
        { status: "Order is placed", time: startTime.toISOString() }
    ];
    
    const paymentReceivedDelay = 5 + Math.random() * 2;
    const paymentReceivedTime = new Date(startTime.getTime() + paymentReceivedDelay * 60 * 1000);
    timeline.push({ status: "Payment received from buyer", time: paymentReceivedTime.toISOString() });
    timeline.push({ status: "Payment under escrow protection", time: paymentReceivedTime.toISOString() });
    
    const paymentReleasedTime = new Date();
    timeline.push({ status: "Payment released", time: paymentReleasedTime.toISOString() });
    
    const orderConfirmedDelay = 5 + Math.random() * 5;
    const orderConfirmedTime = new Date(paymentReleasedTime.getTime() + orderConfirmedDelay * 60 * 1000);
    timeline.push({ status: "Order confirmed", time: orderConfirmedTime.toISOString() });
    
    const preparingDelay = 30 + Math.random() * 30;
    const preparingTime = new Date(orderConfirmedTime.getTime() + preparingDelay * 60 * 1000);
    timeline.push({ status: "Preparing parcel for shipment", time: preparingTime.toISOString() });
    
    const subsequentStatuses = [
        "Courier assigned",
        "Parcel picked up by logistics partner",
        "Parcel arrived at sorting facility",
        "Parcel departed from sorting facility",
        "Parcel arrived at delivery hub",
        "Parcel out for delivery",
        "Parcel delivered"
    ];
    
    const totalRemainingMs = (3 + Math.random() * 1) * 24 * 60 * 60 * 1000;
    let intervals = [];
    let remaining = totalRemainingMs;
    for (let i = 0; i < subsequentStatuses.length; i++) {
        const maxGap = remaining / (subsequentStatuses.length - i);
        const gap = maxGap * (0.3 + Math.random() * 0.7);
        intervals.push(gap);
        remaining -= gap;
    }
    
    let laterTime = new Date(preparingTime);
    for (let i = 0; i < subsequentStatuses.length; i++) {
        laterTime = new Date(laterTime.getTime() + intervals[i]);
        timeline.push({ status: subsequentStatuses[i], time: laterTime.toISOString() });
    }
    
    return timeline;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

window.loadSetordersPage = loadSetordersPage;