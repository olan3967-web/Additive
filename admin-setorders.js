// admin-setorders.js - 完整修复版

let setordersSearchKeyword = '';
let selectedUser = null;
let orderItems = [];
let manualReleaseOrders = [];
let paymentReleaseTimer = null;

function generateRandomBuyer() {
    const namesByCountry = {
        'UK': { first: ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'], last: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Jackson', 'Clarke'] },
        'Germany': { first: ['Lukas', 'Hanna', 'Finn', 'Mia', 'Jonas', 'Emma', 'Leon', 'Sophie', 'Paul', 'Marie', 'Felix', 'Lena', 'Max', 'Lea', 'Moritz', 'Anna', 'Ben', 'Julia', 'Noah', 'Laura'], last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann'] },
        'France': { first: ['Lucas', 'Emma', 'Louis', 'Jade', 'Gabriel', 'Louise', 'Raphael', 'Alice', 'Jules', 'Chloé', 'Hugo', 'Lina', 'Adam', 'Rose', 'Paul', 'Anna', 'Nathan', 'Léa', 'Arthur', 'Inès'], last: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel'] },
        'Spain': { first: ['Lucas', 'Sofia', 'Mateo', 'Martina', 'Leo', 'Lucia', 'Daniel', 'Paula', 'Alejandro', 'Valentina', 'Pablo', 'Emma', 'Manuel', 'Julia', 'Adrian', 'Carla', 'Hugo', 'Alba', 'David', 'Carmen'], last: ['García', 'Martínez', 'López', 'González', 'Rodríguez', 'Fernández', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez'] },
        'Italy': { first: ['Leonardo', 'Sofia', 'Alessandro', 'Giulia', 'Mattia', 'Aurora', 'Lorenzo', 'Alice', 'Andrea', 'Emma', 'Tommaso', 'Giorgia', 'Gabriele', 'Martina', 'Francesco', 'Anna', 'Riccardo', 'Sara', 'Davide', 'Chiara'], last: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti'] },
        'Austria': { first: ['Lukas', 'Anna', 'David', 'Lea', 'Felix', 'Lena', 'Max', 'Sophie', 'Paul', 'Hanna', 'Moritz', 'Emma', 'Jonas', 'Marie', 'Florian', 'Laura', 'Tobias', 'Julia', 'Simon', 'Nina'], last: ['Gruber', 'Huber', 'Bauer', 'Wagner', 'Müller', 'Pichler', 'Steiner', 'Moser', 'Leitner', 'Weber', 'Schmid', 'Egger', 'Mayr', 'Schneider', 'Fischer', 'Winkler', 'Haas', 'Koller', 'Reiter', 'Berger'] },
        'Netherlands': { first: ['Daan', 'Emma', 'Sem', 'Julia', 'Lucas', 'Sophie', 'Finn', 'Lynn', 'Levi', 'Mila', 'Luuk', 'Eva', 'Milan', 'Lisa', 'Jesse', 'Anna', 'Bram', 'Noa', 'Julian', 'Sanne'], last: ['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'van Dijk', 'Bakker', 'Janssen', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Koster'] },
        'Belgium': { first: ['Noah', 'Emma', 'Liam', 'Louise', 'Arthur', 'Mila', 'Lucas', 'Juliette', 'Louis', 'Lina', 'Adam', 'Alice', 'Jules', 'Chloé', 'Gabriel', 'Jade', 'Raphael', 'Anna', 'Elias', 'Lucie'], last: ['Peeters', 'Janssens', 'Maes', 'Jacobs', 'Mertens', 'Willems', 'Claes', 'Goossens', 'Wouters', 'De Smet', 'Verstraeten', 'Van Damme', 'Van den Bossche', 'Leroy', 'Simon', 'François', 'Dubois', 'Laurent', 'Renard', 'Leclercq'] },
        'Switzerland': { first: ['Liam', 'Emma', 'Noah', 'Mia', 'Luca', 'Sofia', 'Elias', 'Lina', 'Leon', 'Anna', 'David', 'Laura', 'Simon', 'Lea', 'Samuel', 'Julia', 'Fabio', 'Nina', 'Jan', 'Lara'], last: ['Meier', 'Keller', 'Müller', 'Schmid', 'Weber', 'Schneider', 'Fischer', 'Gerber', 'Wyss', 'Steiner', 'Moser', 'Brunner', 'Ammann', 'Zimmermann', 'Burkhard', 'Marty', 'Stucki', 'Hofmann', 'Bachmann', 'Roth'] },
        'Sweden': { first: ['Elias', 'Alice', 'Liam', 'Maja', 'Lucas', 'Ella', 'Oliver', 'Wilma', 'William', 'Alma', 'Hugo', 'Ebba', 'Oscar', 'Julia', 'Axel', 'Klara', 'Alexander', 'Astrid', 'Filip', 'Ellen'], last: ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson', 'Pettersson', 'Jansson', 'Hansson', 'Bengtsson', 'Jonsson', 'Lindberg', 'Magnusson', 'Holm', 'Bergström', 'Åberg'] },
        'Denmark': { first: ['William', 'Emma', 'Noah', 'Ida', 'Oliver', 'Clara', 'Lucas', 'Sofie', 'Emil', 'Alma', 'Magnus', 'Karla', 'Malthe', 'Freja', 'Felix', 'Frida', 'Elliot', 'Lærke', 'Oscar', 'Mathilde'], last: ['Jensen', 'Nielsen', 'Hansen', 'Pedersen', 'Andersen', 'Christensen', 'Larsen', 'Sørensen', 'Rasmussen', 'Jørgensen', 'Petersen', 'Madsen', 'Kristensen', 'Olsen', 'Thomsen', 'Christiansen', 'Poulsen', 'Johansen', 'Kjær', 'Lund'] },
        'Norway': { first: ['Lucas', 'Nora', 'Oliver', 'Emma', 'Emil', 'Sofie', 'Oskar', 'Olivia', 'Jakob', 'Sara', 'Alexander', 'Leah', 'Magnus', 'Sofia', 'Theodor', 'Ingrid', 'Elias', 'Maja', 'Kristian', 'Anna'], last: ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Jensen', 'Eriksen', 'Christensen', 'Martinsen', 'Knudsen', 'Johnsen', 'Solberg', 'Moen', 'Berge', 'Jacobsen', 'Bakken', 'Halvorsen', 'Myhre'] },
        'Finland': { first: ['Eino', 'Helmi', 'Leo', 'Aino', 'Väinö', 'Eevi', 'Oliver', 'Sofia', 'Elias', 'Lilja', 'Onni', 'Mila', 'Toivo', 'Ellen', 'Lauri', 'Linnea', 'Veeti', 'Venla', 'Eetu', 'Iiris'], last: ['Korhonen', 'Virtanen', 'Mäkinen', 'Nieminen', 'Mäkelä', 'Hämäläinen', 'Laine', 'Heikkinen', 'Koskinen', 'Järvinen', 'Lehtonen', 'Leinonen', 'Lahtinen', 'Salminen', 'Heinonen', 'Niskanen', 'Järvinen', 'Kinnunen', 'Rantanen', 'Karjalainen'] },
        'Ireland': { first: ['Jack', 'Emma', 'Noah', 'Grace', 'Conor', 'Anna', 'James', 'Molly', 'Sean', 'Saoirse', 'Oisin', 'Fiona', 'Liam', 'Ava', 'Cillian', 'Ciara', 'Ryan', 'Chloe', 'Eoin', 'Niamh'], last: ['Murphy', 'Kelly', 'O\'Brien', 'Walsh', 'O\'Sullivan', 'Byrne', 'Ryan', 'Connor', 'McCarthy', 'Dunne', 'Doyle', 'Lynch', 'Nolan', 'McGuinness', 'Kennedy', 'Sheridan', 'Gallagher', 'Fitzgerald', 'Flynn', 'O\'Donnell'] },
        'Portugal': { first: ['Francisco', 'Maria', 'Afonso', 'Leonor', 'João', 'Matilde', 'Santiago', 'Carolina', 'Miguel', 'Beatriz', 'Martim', 'Ana', 'Tomás', 'Mariana', 'Guilherme', 'Inês', 'Duarte', 'Sofia', 'Luís', 'Lara'], last: ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Jesus', 'Sousa', 'Fernandes', 'Gonçalves', 'Gomes', 'Lopes', 'Marques', 'Alves', 'Almeida', 'Ribeiro', 'Pinto', 'Carvalho'] }
    };
    
    const countries = Object.keys(namesByCountry);
    const countryCitiesMap = {
        'UK': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Edinburgh', 'Glasgow', 'Leeds', 'Bristol', 'Newcastle', 'Sheffield'],
        'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Dresden', 'Hanover', 'Nuremberg'],
        'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
        'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Malaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
        'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Venice', 'Verona'],
        'Austria': ['Vienna', 'Salzburg', 'Graz', 'Innsbruck', 'Linz', 'Klagenfurt', 'Bregenz', 'Eisenstadt', 'St. Pölten'],
        'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen'],
        'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons', 'Aalst'],
        'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Lucerne', 'St. Gallen', 'Lugano', 'Fribourg', 'Winterthur'],
        'Sweden': ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping'],
        'Denmark': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle', 'Roskilde'],
        'Norway': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Sandnes', 'Tromsø', 'Ålesund'],
        'Finland': ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Turku', 'Oulu', 'Lahti', 'Kuopio', 'Jyväskylä', 'Pori'],
        'Ireland': ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Dundalk', 'Swords', 'Bray', 'Navan'],
        'Portugal': ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Amadora', 'Setúbal', 'Funchal', 'Agualva', 'Queluz']
    };
    
    const selectedCountry = countries[Math.floor(Math.random() * countries.length)];
    const countryData = namesByCountry[selectedCountry];
    const cities = countryCitiesMap[selectedCountry];
    const selectedCity = cities[Math.floor(Math.random() * cities.length)];
    
    const firstName = countryData.first[Math.floor(Math.random() * countryData.first.length)];
    const lastName = countryData.last[Math.floor(Math.random() * countryData.last.length)];
    const fullName = firstName + ' ' + lastName;
    
    const countryCodeMap = {
        'UK': '+44', 'Germany': '+49', 'France': '+33', 'Spain': '+34', 'Italy': '+39',
        'Austria': '+43', 'Netherlands': '+31', 'Belgium': '+32', 'Switzerland': '+41',
        'Sweden': '+46', 'Denmark': '+45', 'Norway': '+47', 'Finland': '+358',
        'Ireland': '+353', 'Portugal': '+351'
    };
    
    const countryCode = countryCodeMap[selectedCountry];
    
    let phone;
    if (selectedCountry === 'Germany') {
        phone = countryCode + '1' + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    } else if (selectedCountry === 'UK') {
        phone = countryCode + '7' + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    } else if (selectedCountry === 'France') {
        phone = countryCode + '6' + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    } else if (selectedCountry === 'Spain') {
        phone = countryCode + '6' + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    } else if (selectedCountry === 'Italy') {
        phone = countryCode + '3' + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    } else if (selectedCountry === 'Austria') {
        phone = countryCode + '6' + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    } else if (selectedCountry === 'Netherlands') {
        phone = countryCode + '6' + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    } else if (selectedCountry === 'Belgium') {
        phone = countryCode + '4' + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    } else if (selectedCountry === 'Switzerland') {
        phone = countryCode + '7' + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    } else if (selectedCountry === 'Sweden') {
        phone = countryCode + '7' + Math.floor(Math.random() * 9) + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    } else {
        phone = countryCode + Math.floor(Math.random() * 900000000) + 100000000;
    }
    
    const streetNames = ['Main Street', 'High Street', 'Park Avenue', 'Church Road', 'Queen Street', 'King Street', 'Station Road', 'London Road', 'Broadway', 'Sunset Boulevard', 'Garden Street', 'Maple Avenue', 'Oak Street', 'Pine Street', 'Cedar Road'];
    const streetNum = Math.floor(Math.random() * 200 + 1);
    const street = streetNames[Math.floor(Math.random() * streetNames.length)];
    const postalCode = Math.floor(Math.random() * 90000 + 10000);
    const address = streetNum + ' ' + street + ', ' + postalCode + ', ' + selectedCity + ', ' + selectedCountry;
    
    return { name: fullName, phone, address, country: selectedCountry, city: selectedCity };
}

// ========== manualReleasePayment 函数（最终修复版） ==========
async function manualReleasePayment(orderNo) {
    console.log(`🔓 手动释放订单 ${orderNo}`);
    
    const { data: order, error } = await sb
        .from('user_orders')
        .select('*')
        .eq('order_no', orderNo)
        .single();
    
    if (error || !order) {
        console.error('订单不存在:', error);
        return false;
    }
    
    let timeline = [];
    try {
        timeline = JSON.parse(order.tracking_timeline || '[]');
    } catch(e) {
        console.error('解析 timeline 失败:', e);
        return false;
    }
    
    const now = new Date();
    let updated = false;
    
    for (let i = 0; i < timeline.length; i++) {
        if (timeline[i].status === "Payment released" && timeline[i].isPending === true) {
            timeline[i] = {
                status: "Payment released",
                time: now.toISOString(),
                isCompleted: true
            };
            updated = true;
            break;
        }
    }
    
    if (!updated) {
        console.log('没有找到等待中的 Payment released');
        return false;
    }
    
    await sb.from('user_orders').update({
        tracking_timeline: JSON.stringify(timeline)
    }).eq('order_no', orderNo);
    
    // ✅✅✅ 关键：记录 Product Payment Release（本金释放）
    const supplyPrice = order.total_supply_price || 0;
    const commissionAmount = order.total_commission || 0;
    
    console.log(`记录本金释放: RM${supplyPrice}`);
    console.log(`记录佣金: RM${commissionAmount}`);
    
    // 插入本金释放记录
    const { error: err1 } = await sb.from('deposits').insert({
        uid: order.uid,
        username: order.username,
        amount: supplyPrice,
        type: 'order_settlement',
        created_at: now.toISOString()
    });
    if (err1) console.error('写入 order_settlement 失败:', err1);
    
    // 插入佣金记录
    const { error: err2 } = await sb.from('deposits').insert({
        uid: order.uid,
        username: order.username,
        amount: commissionAmount,
        type: 'order_commission',
        created_at: now.toISOString()
    });
    if (err2) console.error('写入 order_commission 失败:', err2);
    
    // 更新用户余额
    const { data: user } = await sb.from('users').select('balance').eq('uid', order.uid).single();
    if (user) {
        const refundAmount = supplyPrice + commissionAmount;
        const newBalance = (user.balance || 0) + refundAmount;
        await sb.from('users').update({ balance: newBalance }).eq('uid', order.uid);
        
        // 更新本地 storage
        const localUser = getCurrentUser();
        if (localUser && localUser.uid === order.uid) {
            localUser.balance = newBalance;
            localStorage.setItem('currentUser', JSON.stringify(localUser));
        }
    }
    
    console.log(`✅ 订单 ${orderNo} 释放完成！本金 RM${supplyPrice}，佣金 RM${commissionAmount}`);
    return true;
}

// ========== 加载 Manual Release 订单 ==========
async function loadManualReleaseOrders() {
    try {
        if (!selectedUser || !selectedUser.uid) {
            manualReleaseOrders = [];
            renderManualReleaseCard();
            return;
        }
        
        const { data: orders, error } = await sb
            .from('user_orders')
            .select('*')
            .eq('uid', selectedUser.uid)
            .or('payment_release_timer.is.null,payment_release_timer.eq.0')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        manualReleaseOrders = orders || [];
        renderManualReleaseCard();
    } catch (err) { 
        console.error('加载失败:', err);
        manualReleaseOrders = [];
        renderManualReleaseCard();
    }
}

function renderManualReleaseCard() {
    const container = document.getElementById('manualReleaseContainer');
    if (!container) return;
    
    if (manualReleaseOrders.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    let html = `<div style="background: rgba(15,25,40,0.9); border-radius: 16px; padding: 16px; margin-top: 20px; border: 1px solid rgba(255,122,0,0.3);"><h4 style="color: #ffb84d; margin-bottom: 12px;"><i class="fas fa-hand-pointer"></i> Manual Release</h4><div style="max-height: 300px; overflow-y: auto;">`;
    
    for (const order of manualReleaseOrders) {
        html += `<div style="background: #0f172a; border-radius: 12px; padding: 12px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div><div style="font-weight:700; color:#ffb84d;">${order.order_no}</div><div style="font-size:11px; color:#8a9abb;">User: ${order.uid} | 本金: RM${order.total_supply_price} | 佣金: RM${order.total_commission}</div></div>
                <button class="release-order-btn" data-order="${order.order_no}" style="background:#2f6b3a; border:none; padding:6px 16px; border-radius:20px; color:white; cursor:pointer;"><i class="fas fa-play"></i> Release Now</button>
            </div>
        </div>`;
    }
    
    html += `</div></div>`;
    container.innerHTML = html;
    
    document.querySelectorAll('.release-order-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const orderNo = btn.dataset.order;
            const success = await manualReleasePayment(orderNo);
            if (success) {
                showToast(`订单 ${orderNo} 释放成功！本金和佣金已记录`, 'success');
                await loadManualReleaseOrders();
            } else {
                showToast(`释放失败`, 'error');
            }
        });
    });
}

async function loadSetordersPage() {
    const container = document.getElementById('page_setorders');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <div class="search-bar" style="justify-content: space-between;">
                <h3><i class="fas fa-cog"></i> Set Orders</h3>
                <button id="backToUserList" class="btn-primary" style="display:none;">← Back to Users</button>
            </div>
            <div id="setordersUserSearch">
                <div class="search-bar">
                    <input type="text" id="setordersSearchUid" placeholder="🔍 Search UID or Username" class="search-input">
                    <button id="setordersSearchBtn" class="btn-primary">🔍 Search</button>
                </div>
                <div id="setordersUserList" class="table-container" style="max-height:300px;">
                    <table class="data-table"><thead><tr><th>UID</th><th>Username</th><th>Action</th></tr></thead><tbody id="setordersUserTableBody"></tbody></table>
                </div>
            </div>
            <div id="setordersMain" style="display:none;">
                <div style="background:rgba(74,124,255,0.1); padding:10px 16px; border-radius:12px; margin-bottom:20px;">Current User: <span id="selectedUidDisplay" style="color:#4a7cff;"></span> - <span id="selectedUsernameDisplay"></span></div>
                <div id="userProductsList" style="max-height:500px; overflow-y:auto; margin-bottom:20px; display:flex; flex-wrap:wrap; gap:12px;"></div>
                <div style="background:rgba(74,124,255,0.08); border:1px solid rgba(74,124,255,0.2); border-radius:16px; padding:16px; margin-bottom:20px;">
                    <h4 style="color:#ffb84d;"><i class="fas fa-hourglass-half"></i> Payment Release Timer</h4>
                    <input type="number" id="paymentTimerInput" placeholder="Enter minutes (leave empty for Manual Release)" style="width:100%; background:#0f172a; border:1px solid #1e2a3a; border-radius:8px; padding:12px; color:#fff;">
                    <div style="font-size:12px; color:#6a7a9a; margin-top:12px;">Timer 从 Payment under escrow protection 打勾后开始计时。留空则为 Manual Release。</div>
                </div>
                <div id="orderSummary" style="background:#0f172a; border-radius:16px; padding:16px; border:1px solid rgba(74,124,255,0.2);">
                    <h4 style="margin-bottom:12px; color:#ffb84d;"><i class="fas fa-receipt"></i> Order Summary</h4>
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Total Supply Price:</span><span id="totalSupplyPrice" style="color:#ffb84d; font-weight:700;">RM0</span></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Total Commission:</span><span id="totalCommission" style="color:#2ed15a; font-weight:700;">RM0</span></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:16px;"><span>Final Account Increase:</span><span id="totalIncrease" style="color:#4a7cff; font-weight:700;">RM0</span></div>
                    <button id="confirmSetOrderBtn" class="success" style="width:100%; padding:12px;"><i class="fas fa-check"></i> Create Order</button>
                </div>
                <div id="manualReleaseContainer" style="margin-top:20px;"></div>
            </div>
        </div>
    `;
    
    await loadUserList();
    await loadManualReleaseOrders();
    
    document.getElementById('setordersSearchBtn')?.addEventListener('click', () => {
        setordersSearchKeyword = document.getElementById('setordersSearchUid').value.trim();
        loadUserList();
    });
    
    document.getElementById('backToUserList')?.addEventListener('click', () => {
        document.getElementById('setordersUserSearch').style.display = 'block';
        document.getElementById('setordersMain').style.display = 'none';
        selectedUser = null;
        orderItems = [];
        paymentReleaseTimer = null;
        document.getElementById('paymentTimerInput').value = '';
    });
    
    document.getElementById('confirmSetOrderBtn')?.addEventListener('click', confirmSetOrder);
    document.getElementById('paymentTimerInput')?.addEventListener('input', (e) => {
        paymentReleaseTimer = e.target.value ? parseInt(e.target.value) : null;
    });
}

async function loadUserList() {
    let query = sb.from('users').select('uid, username').order('created_at', { ascending: false });
    if (setordersSearchKeyword) query = query.or(`uid.ilike.%${setordersSearchKeyword}%,username.ilike.%${setordersSearchKeyword}%`);
    const { data: users } = await query;
    const tbody = document.getElementById('setordersUserTableBody');
    if (tbody && users) {
        tbody.innerHTML = '';
        for (let u of users) {
            const row = tbody.insertRow();
            row.insertCell(0).innerHTML = `<span class="badge">${u.uid}</span>`;
            row.insertCell(1).innerText = u.username;
            row.insertCell(2).innerHTML = `<button class="setorder-select-btn" data-uid="${u.uid}" data-name="${u.username}" style="background:#4a7cff; padding:6px 16px; border-radius:20px; border:none; color:white; cursor:pointer;">Set Orders</button>`;
        }
        document.querySelectorAll('.setorder-select-btn').forEach(btn => btn.addEventListener('click', () => selectUser(btn.dataset.uid, btn.dataset.name)));
    }
}

async function selectUser(uid, username) {
    selectedUser = { uid, username };
    document.getElementById('selectedUidDisplay').innerText = uid;
    document.getElementById('selectedUsernameDisplay').innerText = username;
    await loadUserProducts(uid);
    await loadManualReleaseOrders();
    document.getElementById('setordersUserSearch').style.display = 'none';
    document.getElementById('setordersMain').style.display = 'block';
}

async function loadUserProducts(uid) {
    const container = document.getElementById('userProductsList');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center; padding:40px;">Loading...</div>';
    
    const { data: products, error } = await sb.from('user_products').select('*').eq('uid', uid).order('added_at', { ascending: false });
    if (error) { container.innerHTML = '<div style="text-align:center; padding:40px; color:#ff8888;">加载失败</div>'; return; }
    if (!products || products.length === 0) { container.innerHTML = '<div style="text-align:center; padding:40px; color:#aaa;">No products added</div>'; return; }
    
    orderItems = products.map(p => ({
        product_id: p.product_id || p.id,
        product_name: p.product_name,
        price: p.price,
        margin_profit: p.margin_profit,
        quantity: 0,
        image_url: p.image_url
    }));
    renderProducts();
}

function renderProducts() {
    const container = document.getElementById('userProductsList');
    if (!container) return;
    if (orderItems.length === 0) { container.innerHTML = '<div style="text-align:center; padding:40px; color:#aaa;">No products available</div>'; return; }
    
    container.innerHTML = '';
    container.style.cssText = 'display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;';
    
    for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        const div = document.createElement('div');
        div.style.cssText = 'background:#0f172a; border-radius:16px; padding:12px; width:calc(16.666% - 10px); min-width:140px; text-align:center; border:1px solid rgba(74,124,255,0.2);';
        div.innerHTML = `
            <img src="${item.image_url || 'https://placehold.co/80x80/1e2a3a/4a7cff?text=No+Image'}" style="width:80px; height:80px; border-radius:12px; margin-bottom:10px;">
            <div style="font-weight:600; color:#ffb84d;">${escapeHtml(item.product_name)}</div>
            <div style="font-size:11px; color:#8a9abb;">RM${item.price} | +RM${item.margin_profit}</div>
            <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-top:10px;">
                <button class="qty-decr" data-index="${i}" style="background:#4a7cff; width:28px; height:28px; border-radius:6px; color:white;">-</button>
                <span id="qty_${i}" style="min-width:30px;">${item.quantity}</span>
                <button class="qty-incr" data-index="${i}" style="background:#4a7cff; width:28px; height:28px; border-radius:6px; color:white;">+</button>
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
                updateSummary();
            }
        });
    });
    document.querySelectorAll('.qty-incr').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            orderItems[idx].quantity++;
            document.getElementById(`qty_${idx}`).innerText = orderItems[idx].quantity;
            updateSummary();
        });
    });
    updateSummary();
}

function updateSummary() {
    let totalSupply = 0, totalCommission = 0;
    for (const item of orderItems) {
        totalSupply += item.price * item.quantity;
        totalCommission += item.margin_profit * item.quantity;
    }
    document.getElementById('totalSupplyPrice').innerHTML = `RM${totalSupply.toFixed(2)}`;
    document.getElementById('totalCommission').innerHTML = `RM${totalCommission.toFixed(2)}`;
    document.getElementById('totalIncrease').innerHTML = `RM${(totalSupply + totalCommission).toFixed(2)}`;
}

async function confirmSetOrder() {
    const selectedItems = orderItems.filter(item => item.quantity > 0);
    if (selectedItems.length === 0) { showToast('Please select at least one product', 'error'); return; }
    
    const orderNo = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    const buyer = generateRandomBuyer();
    let totalSupplyPrice = 0, totalCommission = 0, productsList = [];
    
    for (const item of selectedItems) {
        totalSupplyPrice += item.price * item.quantity;
        totalCommission += item.margin_profit * item.quantity;
        productsList.push({ product_id: item.product_id, product_name: item.product_name, quantity: item.quantity, unit_price: item.price, commission_per_item: item.margin_profit, image_url: item.image_url });
    }
    
    const startTime = new Date();
    const paymentReceivedDelay = 5 + Math.random() * 2;
    const paymentReceivedTime = new Date(startTime.getTime() + paymentReceivedDelay * 60 * 1000);
    
    const initialTimeline = [
        { status: "Order is placed", time: startTime.toISOString(), isCompleted: true },
        { status: "Payment received from buyer", time: paymentReceivedTime.toISOString(), isCompleted: true },
        { status: "Payment under escrow protection", time: paymentReceivedTime.toISOString(), isCompleted: true }
    ];
    
    let paymentReleasedTime, releaseMechanism;
    if (paymentReleaseTimer && paymentReleaseTimer > 0) {
        paymentReleasedTime = new Date(paymentReceivedTime.getTime() + paymentReleaseTimer * 60 * 1000);
        releaseMechanism = 'timer';
    } else {
        paymentReleasedTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        releaseMechanism = 'manual';
    }
    
    initialTimeline.push({ status: "Payment released", time: paymentReleasedTime.toISOString(), isPending: true, releaseMechanism: releaseMechanism, timerMinutes: paymentReleaseTimer || null });
    
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const subsequentStatuses = ["Order confirmed", "Preparing parcel for shipment", "Courier assigned", "Parcel picked up by logistics partner", "Parcel arrived at sorting facility", "Parcel departed from sorting facility", "Parcel arrived at delivery hub", "Parcel out for delivery", "Parcel delivered"];
    for (let i = 0; i < subsequentStatuses.length; i++) {
        initialTimeline.push({ status: subsequentStatuses[i], time: futureDate.toISOString(), isPending: true });
    }
    
    const { error } = await sb.from('user_orders').insert({
        uid: selectedUser.uid, username: selectedUser.username, order_no: orderNo, products: JSON.stringify(productsList),
        total_supply_price: totalSupplyPrice, total_commission: totalCommission, buyer_name: buyer.name, buyer_phone: buyer.phone,
        buyer_address: buyer.address, shipping_address: "Supplier Warehouse, Shanghai, China", status: 'pending',
        payment_release_timer: paymentReleaseTimer || null, tracking_timeline: JSON.stringify(initialTimeline), created_at: new Date().toISOString()
    });
    
    if (error) { showToast('Failed: ' + error.message, 'error'); return; }
    
    if (paymentReleaseTimer && paymentReleaseTimer > 0) {
        showToast(`Order ${orderNo} created! Auto release after ${paymentReleaseTimer} minutes`, 'success');
    } else {
        showToast(`Order ${orderNo} created! Manual Release`, 'success');
    }
    
    orderItems = orderItems.map(item => ({ ...item, quantity: 0 }));
    renderProducts();
    paymentReleaseTimer = null;
    document.getElementById('paymentTimerInput').value = '';
    await loadManualReleaseOrders();
}

function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); }
function showToast(msg) { const toast = document.createElement('div'); toast.textContent = msg; toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#ffb84d;padding:10px 20px;border-radius:40px;font-size:13px;z-index:10000;'; document.body.appendChild(toast); setTimeout(() => toast.remove(), 2000); }

window.loadSetordersPage = loadSetordersPage;
window.manualReleasePayment = manualReleasePayment;