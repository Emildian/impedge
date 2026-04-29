const rarities = {
    Common: { color: 'var(--common)', name: 'Common', hex: '#00ff00' },
    Uncommon: { color: 'var(--uncommon)', name: 'Uncommon', hex: '#ff0000' },
    Rare: { color: 'var(--rare)', name: 'Rare', hex: '#0088ff' },
    VeryRare: { color: 'var(--very-rare)', name: 'Very Rare', hex: '#ff00ff' },
    Epic: { color: 'var(--epic)', name: 'Epic', hex: '#9b59b6' },
    Legendary: { color: 'var(--legendary)', name: 'Legendary', hex: '#ffcc00' }
};

const rarityPrices = {
    Common: 100,
    Uncommon: 300,
    Rare: 800,
    VeryRare: 2000,
    Epic: 5000,
    Legendary: 12000
};

const topsData = [
    { id: 'topc', name: 'Topç', type: 'Light', value: 68, speed: 'Low', stamina: 'Low', energy: 300, maxEnergy: 300, spinTime: 10*60, power: null, parts: 2, rarity: 'Common' },
    { id: 'neword', name: 'Neword', type: 'Defense', value: 72, speed: 'Below Average', stamina: 'Above Average', energy: 450, maxEnergy: 450, spinTime: 30*60, power: null, parts: 2, rarity: 'Uncommon' },
    { id: 'muzik', name: 'Müzik Topacı', type: 'Attack', value: 78, speed: 'High', stamina: 'Above Average', energy: 750, maxEnergy: 750, spinTime: 45*60, power: 'Elektro Gitar', parts: 2, rarity: 'Rare' },
    { id: 'mcge', name: 'MC-GE', type: 'Stamina', value: 93, speed: 'Medium', stamina: 'High', energy: 1000, maxEnergy: 1000, spinTime: 3600, power: 'Bedrock', parts: 4, rarity: 'Rare' },
    { id: 'sliedge', name: 'Sliedge', type: 'Attack', value: 102, speed: 'Very High', stamina: 'Very High', energy: 2000, maxEnergy: 2000, spinTime: 5*3600, power: 'Şenolun Baltası', parts: 2, rarity: 'Rare' },
    { id: 'ataridge', name: 'Ataridge', type: 'Light', value: 89, speed: 'High', stamina: 'Above Average', energy: 1000, maxEnergy: 1000, spinTime: 3600, power: 'Pac-Man', parts: 2, rarity: 'VeryRare' },
    { id: 'glitch', name: 'Glitch', type: 'Stamina', value: 97, speed: 'High', stamina: 'Very High', energy: 1500, maxEnergy: 1500, spinTime: 1.5*3600, power: 'Hata', parts: 4, rarity: 'VeryRare' },
    { id: 'kristal', name: 'Kristal', type: 'Defense', value: 95, speed: 'Medium', stamina: 'High', energy: 1200, maxEnergy: 1200, spinTime: 2*3600, power: 'Ayna', parts: 4, rarity: 'VeryRare' },
    { id: 'golge', name: 'Gölge', type: 'Attack', value: 110, speed: 'High', stamina: 'Average', energy: 1800, maxEnergy: 1800, spinTime: 3*3600, power: 'Karanlık Strike', parts: 4, rarity: 'Epic' },
    { id: 'emiledge', name: 'EmilEdge', type: 'Defense', value: 102, speed: 'Very High', stamina: 'Very High', energy: 2000, maxEnergy: 2000, spinTime: 5*3600, power: 'Akıncı', parts: 4, rarity: 'Legendary' },
    { id: 'dreamaxe', name: 'Dreamaxe', type: 'Attack', value: 256, speed: 'Very Very High', stamina: 'Very Very High', energy: 5000, maxEnergy: 5000, spinTime: 2.5*24*3600, power: 'Donat', parts: 4, rarity: 'Legendary' }
];

const speedEnergyRates = {
    'Very Very High': 1.2, 'Very High': 1.0, 'High': 0.88,
    'Above Average': 0.70, 'Medium': 0.50, 'Below Average': 0.33, 'Low': 0.20
};

// Global State
let playerProfile = { level: 1, xp: 0, gold: 0, boxes: 1, wins: 0, unlockedTops: ['topc'], upgrades: {} };
let playerTop = topsData[0];
let playerScore = 0;
let botScore = 0;
let matchActive = false;
let currentMode = 'IEW';
let selectedUpgradeId = null;

let is2PMode = false;
let p1LobbySetup = null;
let p2LobbySetup = null;

let cooldownEnds = { rush: 0, 'legendary-rush': 0, 'ultimate-rush': 0, combo: 0, special: 0 };
let cooldownEndsBot = { rush: 0, 'legendary-rush': 0, 'ultimate-rush': 0, combo: 0, special: 0 };

let battleData = { player: null, bot: null, interval: null, uiInterval: null, animating: false };

const screens = {
    main: document.getElementById('main-menu'),
    shop: document.getElementById('shop-screen'),
    arena: document.getElementById('arena-screen'),
    lobby2p: document.getElementById('lobby-2p-screen')
};

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// Initialization
function init() {
    loadProfile();
    initShop();
    
    document.getElementById('btn-shop').addEventListener('click', () => switchScreen('shop'));
    document.getElementById('btn-back-shop').addEventListener('click', () => switchScreen('main'));
    document.getElementById('btn-arena').addEventListener('click', () => { is2PMode = false; startMatch(); });
    document.getElementById('btn-back-menu').addEventListener('click', () => {
        document.getElementById('match-end-modal').classList.add('hidden');
        switchScreen('main');
    });
    document.getElementById('btn-next-round').addEventListener('click', () => {
        document.getElementById('round-end-modal').classList.add('hidden');
        startRound();
    });
    
    document.getElementById('btn-open-box').addEventListener('click', openBox);
    document.getElementById('btn-buy-box').addEventListener('click', buyBoxWithGold);

    // 2P Lobby events
    document.getElementById('btn-2p-lobby').addEventListener('click', () => {
        is2PMode = true;
        populate2PSelects();
        switchScreen('lobby2p');
    });
    document.getElementById('btn-back-2p').addEventListener('click', () => {
        is2PMode = false;
        switchScreen('main');
    });
    document.getElementById('btn-start-2p').addEventListener('click', () => {
        currentMode = document.getElementById('lobby-mode').value;
        p1LobbySetup = {
            topId: document.getElementById('p1-top-select').value,
            hyper: document.getElementById('p1-hyper').checked,
            tasarruf: document.getElementById('p1-tasarruf').checked,
            combo: document.getElementById('p1-combo').checked,
            toplayici: parseInt(document.getElementById('p1-toplayici').value)
        };
        p2LobbySetup = {
            topId: document.getElementById('p2-top-select').value,
            hyper: document.getElementById('p2-hyper').checked,
            tasarruf: document.getElementById('p2-tasarruf').checked,
            combo: document.getElementById('p2-combo').checked,
            toplayici: parseInt(document.getElementById('p2-toplayici').value)
        };
        startMatch();
    });

    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            const player = e.currentTarget.dataset.player; // 'player' or 'bot'
            if(player === 'player' || (player === 'bot' && is2PMode)) {
                playerAction(action, player);
            }
        });
    });

    document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentMode = e.target.value;
        });
    });
    
    // Keyboard listeners
    window.addEventListener('keydown', (e) => {
        if(!matchActive) return;
        
        // P1 Controls
        if(e.code === 'Space') playerAction('attack', 'player');
        if(e.code === 'Digit1' || e.code === 'Numpad1') playerAction('rush', 'player');
        if(e.code === 'Digit2' || e.code === 'Numpad2') playerAction('legendary-rush', 'player');
        if(e.code === 'Digit3' || e.code === 'Numpad3') playerAction('ultimate-rush', 'player');
        if(e.code === 'Digit4' || e.code === 'Numpad4') playerAction('special', 'player');
        if(e.code === 'Digit5' || e.code === 'Numpad5') playerAction('combo', 'player');
        
        // P2 Controls
        if(is2PMode) {
            if(e.code === 'Enter' || e.code === 'NumpadEnter') playerAction('attack', 'bot');
            if(e.code === 'ArrowLeft') playerAction('rush', 'bot');
            if(e.code === 'ArrowDown') playerAction('legendary-rush', 'bot');
            if(e.code === 'ArrowRight') playerAction('ultimate-rush', 'bot');
            if(e.code === 'ArrowUp') playerAction('special', 'bot');
            if(e.key === 'Shift') playerAction('combo', 'bot');
        }
    });
}

function populate2PSelects() {
    let html = '';
    topsData.forEach(t => html += `<option value="${t.id}">${t.name}</option>`);
    document.getElementById('p1-top-select').innerHTML = html;
    document.getElementById('p2-top-select').innerHTML = html;
}

function loadProfile() {
    const saved = localStorage.getItem('impedge_profile');
    if(saved) {
        playerProfile = { ...playerProfile, ...JSON.parse(saved) };
        if(playerProfile.gold === undefined) playerProfile.gold = 0;
        if(playerProfile.hyperTops) {
            if(!playerProfile.upgrades) playerProfile.upgrades = {};
            playerProfile.hyperTops.forEach(id => {
                if(!playerProfile.upgrades[id]) playerProfile.upgrades[id] = {};
                playerProfile.upgrades[id].hyper = true;
            });
            delete playerProfile.hyperTops;
        }
        if(!playerProfile.upgrades) playerProfile.upgrades = {};
    }
    updateProfileUI();
}

function saveProfile() {
    localStorage.setItem('impedge_profile', JSON.stringify(playerProfile));
    updateProfileUI();
    initShop(); 
}

function updateProfileUI() {
    document.getElementById('ui-level').innerText = playerProfile.level;
    document.getElementById('ui-xp').innerText = `${playerProfile.xp} / ${playerProfile.level * 200}`;
    document.getElementById('ui-boxes').innerText = playerProfile.boxes;
    document.getElementById('ui-gold').innerText = playerProfile.gold;
    
    const hewRadio = document.getElementById('radio-hew');
    if(playerProfile.level >= 5) {
        hewRadio.disabled = false;
        hewRadio.parentElement.style.opacity = 1;
    } else {
        hewRadio.disabled = true;
        hewRadio.parentElement.style.opacity = 0.5;
        if(currentMode === 'HEW' && !is2PMode) {
            document.querySelector('input[value="IEW"]').checked = true;
            currentMode = 'IEW';
        }
    }
}

function buyBoxWithGold() {
    if(playerProfile.gold < 500) {
        alert("1 Kutu almak için 500 Altın gerekiyor!");
        return;
    }
    playerProfile.gold -= 500;
    playerProfile.boxes++;
    saveProfile();
    alert("500 Altın karşılığında 1 Kutu satın alındı!");
}

function openBox() {
    if(playerProfile.boxes <= 0) {
        alert("Hiç kutun yok! Maç kazanarak elde edebilirsin (3 Maç = 1 Kutu).");
        return;
    }
    playerProfile.boxes--;
    
    const rand = Math.random() * 100;
    let rarityDrop = 'Common';
    if(rand < 0.5) rarityDrop = 'Legendary';
    else if(rand < 2.5) rarityDrop = 'Epic';
    else if(rand < 10) rarityDrop = 'VeryRare';
    else if(rand < 25) rarityDrop = 'Rare';
    else if(rand < 50) rarityDrop = 'Uncommon';
    
    const possibleTops = topsData.filter(t => t.rarity === rarityDrop);
    const drop = possibleTops[Math.floor(Math.random() * possibleTops.length)];
    
    if(!playerProfile.unlockedTops.includes(drop.id)) {
        playerProfile.unlockedTops.push(drop.id);
        alert(`KUTUDAN YENİ EDGE ÇIKTI!\n${drop.name} (${drop.rarity})`);
    } else {
        alert(`Kutudan ${drop.name} çıktı ama zaten sende var.\nTeselli Ödülü: 150 Altın ve 50 XP!`);
        playerProfile.gold += 150;
        addXp(50);
    }
    saveProfile();
}

function addXp(amount) {
    playerProfile.xp += amount;
    let req = playerProfile.level * 200;
    while(playerProfile.xp >= req) {
        playerProfile.xp -= req;
        playerProfile.level++;
        alert(`TEBRİKLER! Seviye Atladın! Yeni Seviye: ${playerProfile.level}`);
        req = playerProfile.level * 200;
    }
    saveProfile();
}

function initShop() {
    const grid = document.getElementById('shop-grid');
    grid.innerHTML = '';
    topsData.forEach(top => {
        const r = rarities[top.rarity];
        const card = document.createElement('div');
        const isUnlocked = playerProfile.unlockedTops.includes(top.id);
        const upg = playerProfile.upgrades[top.id] || {};
        const isHyper = upg.hyper;
        const price = rarityPrices[top.rarity];
        
        card.className = `shop-item ${isUnlocked ? '' : 'locked'}`;
        card.innerHTML = `
            <span class="rarity-badge" style="background: ${r.hex}; color: ${top.rarity === 'Legendary' || top.rarity === 'Common' ? '#000' : '#fff'}">${r.name}</span>
            <div style="width:60px;height:60px;border-radius:50%;margin:0 auto 15px auto;background:conic-gradient(from 0deg, transparent 0%, ${r.hex} 50%, transparent 100%);animation: spin 3s linear infinite; ${isUnlocked ? '' : 'filter: grayscale(1);'}"></div>
            <h3>${top.name} ${isHyper ? '⚡' : ''}</h3>
            <p>Tip: ${top.type} | Parça: ${top.parts}</p>
            <p>Enerji: ${top.energy} | Hız: ${top.speed}</p>
            <p>Özel Güç: ${top.power || 'Yok'}</p>
            <div class="upgrade-btns">
                ${isUnlocked 
                    ? `<button class="btn secondary-btn" style="flex:1;" onclick="selectTop('${top.id}')">SEÇ</button>` 
                    : `<button class="btn icon-btn" style="flex:1; border-color:#ffd700; color:#ffd700;" onclick="buyTopWithGold('${top.id}', ${price})">SATIN AL (${price} A)</button>`
                }
                ${isUnlocked ? `<button class="btn icon-btn" style="flex:1; border-color:#ffcc00; color:#ffcc00;" onclick="openUpgradeModal('${top.id}')">GELİŞTİR</button>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

window.buyTopWithGold = function(id, price) {
    if(playerProfile.gold < price) {
        alert(`Bunun için ${price} Altın gerekiyor! (Sende ${playerProfile.gold} var)`);
        return;
    }
    playerProfile.gold -= price;
    playerProfile.unlockedTops.push(id);
    saveProfile();
    alert(`Tebrikler! ${topsData.find(t=>t.id===id).name} satın alındı!`);
}

window.openUpgradeModal = function(id) {
    selectedUpgradeId = id;
    const top = topsData.find(t => t.id === id);
    document.getElementById('upg-title').innerText = `${top.name} Geliştirmeleri`;
    renderUpgradeOptions();
    document.getElementById('upgrade-modal').classList.remove('hidden');
}
window.closeUpgradeModal = function() {
    document.getElementById('upgrade-modal').classList.add('hidden');
}

function renderUpgradeOptions() {
    const upgDiv = document.getElementById('upg-options');
    const upg = playerProfile.upgrades[selectedUpgradeId] || {};
    
    let html = '';
    
    if(!upg.hyper) {
        html += `<button class="btn icon-btn" onclick="buyUpgrade('hyper', 1)">HyperEdge Yap (1 Kutu)</button>`;
    } else {
        html += `<button class="btn locked-btn" disabled>HyperEdge: Aktif ⚡</button>`;
        
        if(!upg.tasarruf) {
            html += `<button class="btn icon-btn" onclick="buyUpgrade('tasarruf', 1)">Tasarruf Aç (1 Kutu) - %20 Az Enerji Tüketir</button>`;
        } else {
            html += `<button class="btn locked-btn" disabled>Tasarruf: Aktif</button>`;
        }
        
        if(!upg.combo) {
            html += `<button class="btn icon-btn" onclick="buyUpgrade('combo', 2)">Seri Vuruş Aç (2 Kutu) - 5x Peş Peşe Vuruş</button>`;
        } else {
            html += `<button class="btn locked-btn" disabled>Seri Vuruş: Aktif</button>`;
        }
        
        const toplayiciLvl = upg.toplayici || 0;
        if(toplayiciLvl === 0) {
            html += `<button class="btn icon-btn" onclick="buyUpgrade('toplayici', 1, 1)">Toplayıcı Sv1 (1 Kutu) - 5sn'de +300 E</button>`;
        } else if(toplayiciLvl === 1) {
            html += `<button class="btn icon-btn" onclick="buyUpgrade('toplayici', 2, 2)">Toplayıcı Sv2 (2 Kutu) - 5sn'de +650 E</button>`;
        } else if(toplayiciLvl === 2) {
            html += `<button class="btn icon-btn" onclick="buyUpgrade('toplayici', 3, 3)">Toplayıcı Sv3 (3 Kutu) - 3sn'de +1100 E</button>`;
        } else {
            html += `<button class="btn locked-btn" disabled>Toplayıcı: Maksimum (Sv3)</button>`;
        }
    }
    
    upgDiv.innerHTML = html;
}

window.buyUpgrade = function(type, cost, level = null) {
    if(playerProfile.boxes < cost) {
        alert(`Bunun için ${cost} kutu gerekiyor! (Sende ${playerProfile.boxes} var)`);
        return;
    }
    playerProfile.boxes -= cost;
    if(!playerProfile.upgrades[selectedUpgradeId]) playerProfile.upgrades[selectedUpgradeId] = {};
    
    if(type === 'hyper') playerProfile.upgrades[selectedUpgradeId].hyper = true;
    if(type === 'tasarruf') playerProfile.upgrades[selectedUpgradeId].tasarruf = true;
    if(type === 'combo') playerProfile.upgrades[selectedUpgradeId].combo = true;
    if(type === 'toplayici') playerProfile.upgrades[selectedUpgradeId].toplayici = level;
    
    saveProfile();
    renderUpgradeOptions();
}

window.selectTop = function(id) {
    playerTop = topsData.find(t => t.id === id);
    document.getElementById('current-top-name').innerText = playerTop.name;
    document.getElementById('current-top-name').style.color = rarities[playerTop.rarity].hex;
    document.getElementById('current-top-name').style.textShadow = `0 0 10px ${rarities[playerTop.rarity].hex}`;
    switchScreen('main');
}

// Bot matching logic
function getBotTop() {
    const lvl = playerProfile.level;
    let pool = topsData.filter(t => t.rarity === 'Common');
    if(lvl >= 2) pool = topsData.filter(t => t.rarity === 'Common' || t.rarity === 'Uncommon');
    if(lvl >= 5) pool = topsData.filter(t => t.rarity === 'Uncommon' || t.rarity === 'Rare');
    if(lvl >= 8) pool = topsData.filter(t => t.rarity === 'Rare' || t.rarity === 'VeryRare');
    if(lvl >= 11) pool = topsData.filter(t => t.rarity === 'VeryRare' || t.rarity === 'Epic');
    if(lvl >= 15) pool = topsData.filter(t => t.rarity === 'Epic' || t.rarity === 'Legendary');
    
    return pool[Math.floor(Math.random() * pool.length)];
}

function getStatsForMode(topData, side) {
    let data = JSON.parse(JSON.stringify(topData));
    data.modifiers = {};
    
    if(is2PMode) {
        const setup = side === 'player' ? p1LobbySetup : p2LobbySetup;
        if(currentMode === 'HEW') {
            if(setup.hyper) {
                data.energy *= 1.2; data.maxEnergy = data.energy; data.value *= 1.2;
                if(setup.tasarruf) data.modifiers.tasarruf = true;
                if(setup.combo) data.modifiers.combo = true;
                if(setup.toplayici > 0) data.modifiers.toplayici = setup.toplayici;
            } else {
                data.energy *= 0.8; data.maxEnergy = data.energy; data.value *= 0.8;
            }
        } else if(currentMode === 'IEW') {
            if(setup.hyper) {
                data.energy *= 0.8; data.maxEnergy = data.energy; data.value *= 0.8;
            }
        }
    } else {
        const isPlayer = side === 'player';
        let upg = isPlayer ? (playerProfile.upgrades[data.id] || {}) : {};
        
        if(currentMode === 'HEW') {
            let botAdvantage = !isPlayer && playerProfile.level >= 5;
            let isHyper = upg.hyper || (botAdvantage && Math.random() > 0.4);
            let hasTasarruf = upg.tasarruf || (botAdvantage && isHyper && Math.random() > 0.5);
            let hasCombo = upg.combo || (botAdvantage && isHyper && Math.random() > 0.5);
            let toplayiciLvl = upg.toplayici || (botAdvantage && isHyper ? (Math.random() > 0.5 ? (playerProfile.level > 10 ? 2 : 1) : 0) : 0);
            
            if(isHyper) {
                data.energy *= 1.2; data.maxEnergy = data.energy; data.value *= 1.2;
                if(hasTasarruf) data.modifiers.tasarruf = true;
                if(hasCombo) data.modifiers.combo = true;
                if(toplayiciLvl > 0) data.modifiers.toplayici = toplayiciLvl;
            } else {
                data.energy *= 0.8; data.maxEnergy = data.energy; data.value *= 0.8;
            }
        } else if(currentMode === 'IEW') {
            let isHyper = upg.hyper;
            if(isPlayer && isHyper) {
                data.energy *= 0.8; data.maxEnergy = data.energy; data.value *= 0.8;
            } else if(!isPlayer && playerProfile.level >= 5 && Math.random() > 0.4) {
                data.energy *= 0.8; data.maxEnergy = data.energy; data.value *= 0.8;
            }
        }
    }
    
    data.currentEnergy = data.energy;
    data.tickCounter = 0;
    return data;
}

function startMatch() {
    if(!is2PMode) {
        if(currentMode === 'HEW') {
            const isHyper = playerProfile.upgrades[playerTop.id] && playerProfile.upgrades[playerTop.id].hyper;
            if(!isHyper) {
                alert("Normal topaçlar HEW modunda kullanılamaz! Lütfen Mağazadan HyperEdge kilidini aç veya IEW modunu seç.");
                return;
            }
        }
    }
    
    playerScore = 0; botScore = 0;
    updateScores();
    document.getElementById('battle-log').innerHTML = '';
    document.getElementById('arena-mode-text').innerText = currentMode + (is2PMode ? " (2P)" : "");
    
    if(is2PMode) {
        document.querySelector('.player-score').innerHTML = 'P1: <span id="player-score">0</span>P';
        document.querySelector('.bot-score').innerHTML = 'P2: <span id="bot-score">0</span>P';
        document.getElementById('bot-top').querySelector('.top-name').innerText = "Player 2";
        document.getElementById('action-panel-p2').classList.remove('hidden');
    } else {
        document.querySelector('.player-score').innerHTML = 'SEN: <span id="player-score">0</span>P';
        document.querySelector('.bot-score').innerHTML = 'BOT: <span id="bot-score">0</span>P';
        document.getElementById('bot-top').querySelector('.top-name').innerText = "Bot";
        document.getElementById('action-panel-p2').classList.add('hidden');
    }

    const circle = document.querySelector('.arena-circle');
    if(currentMode === 'HEW') {
        circle.classList.add('hew-arena');
        document.body.classList.add('hew-bg');
    } else {
        circle.classList.remove('hew-arena');
        document.body.classList.remove('hew-bg');
    }
    
    switchScreen('arena');
    startRound();
}

function setSpecialDesc(side, power) {
    const specName = document.getElementById(`spec-name-${side==='player'?'p1':'p2'}`);
    const specDesc = document.getElementById(`spec-desc-${side==='player'?'p1':'p2'}`);
    if(power) {
        let pDesc = "";
        if(power === 'Şenolun Baltası') pDesc = "500 Hasar";
        else if(power === 'Akıncı') pDesc = "300 Hasar & Durdurma";
        else if(power === 'Donat') pDesc = "Düşmanı Yavaşlatır";
        else if(power === 'Bedrock') pDesc = "5sn Ölümsüzlük";
        else if(power === 'Pac-Man') pDesc = "200 Hasar";
        else if(power === 'Elektro Gitar') pDesc = "Zayıflatma";
        else if(power === 'Hata') pDesc = "Görünmezlik";
        else if(power === 'Ayna') pDesc = "Hasar Yansıtma";
        else if(power === 'Karanlık Strike') pDesc = "400 Hasar";
        
        specName.innerText = power;
        specDesc.innerText = `(150 E) | ${pDesc}`;
    } else {
        specName.innerText = "Özel Güç Yok";
        specDesc.innerText = "(150 E)";
    }
}

function startRound() {
    let botTopData;
    if(is2PMode) botTopData = topsData.find(t => t.id === p2LobbySetup.topId);
    else botTopData = getBotTop();
    
    const pTopData = is2PMode ? topsData.find(t => t.id === p1LobbySetup.topId) : playerTop;

    battleData.player = getStatsForMode(pTopData, 'player');
    battleData.bot = getStatsForMode(botTopData, 'bot');
    battleData.animating = false;
    
    cooldownEnds = { rush: 0, 'legendary-rush': 0, 'ultimate-rush': 0, combo: 0, special: 0 };
    cooldownEndsBot = { rush: 0, 'legendary-rush': 0, 'ultimate-rush': 0, combo: 0, special: 0 };
    
    // Check combos
    const comboBtn1 = document.getElementById('btn-combo-p1');
    if(battleData.player.modifiers.combo) comboBtn1.classList.remove('hidden');
    else comboBtn1.classList.add('hidden');
    
    if(is2PMode) {
        const comboBtn2 = document.getElementById('btn-combo-p2');
        if(battleData.bot.modifiers.combo) comboBtn2.classList.remove('hidden');
        else comboBtn2.classList.add('hidden');
    }

    setSpecialDesc('player', battleData.player.power);
    if(is2PMode) setSpecialDesc('bot', battleData.bot.power);
    
    setupVisuals('player', battleData.player);
    setupVisuals('bot', battleData.bot);
    
    logMsg(`Raunt başlıyor! ${battleData.player.name} vs ${battleData.bot.name}`);
    matchActive = true;
    updateButtonStates();
    updateCooldownVisuals();
    updatePositions(true);

    if(battleData.interval) clearInterval(battleData.interval);
    battleData.interval = setInterval(gameTick, 1000);
    
    if(battleData.uiInterval) clearInterval(battleData.uiInterval);
    battleData.uiInterval = setInterval(updateCooldownVisuals, 200);
}

function setupVisuals(side, data) {
    const topEl = document.getElementById(`${side}-top`);
    const r = rarities[data.rarity];
    topEl.style.transition = 'top 0.5s ease-out, left 0.5s ease-out, transform 0.5s';
    topEl.style.transform = 'translate(-50%, -50%) scale(1)';
    topEl.querySelector('.top-visual').style.boxShadow = `0 0 20px ${r.hex}`;
    topEl.querySelector('.top-visual').style.background = `conic-gradient(from 0deg, rgba(255,255,255,0.2) 0%, ${r.hex} 50%, rgba(255,255,255,0.2) 100%)`;
    
    let icons = '';
    if(currentMode === 'HEW') {
        let isHyper = is2PMode ? (side==='player' ? p1LobbySetup.hyper : p2LobbySetup.hyper) : ((playerProfile.upgrades[data.id] || {}).hyper || (!data.isPlayer && data.energy > data.maxEnergy/1.2));
        if(isHyper) icons += '⚡';
    }
    
    topEl.querySelector('.top-name').innerText = (is2PMode ? (side==='player'?'P1 ':'P2 ') : '') + data.name + icons;
    topEl.querySelector('.top-name').style.color = r.hex;
    updateEnergyVisual(side);
}

function updateEnergyVisual(side) {
    const data = battleData[side];
    const pct = Math.max(0, (data.currentEnergy / data.maxEnergy) * 100);
    const bar = document.getElementById(`${side}-energy-bar`);
    bar.style.width = pct + '%';
    if(pct < 20) bar.style.background = '#ff0000';
    else if(pct < 50) bar.style.background = '#ffff00';
    else bar.style.background = '#00ff00';
    document.getElementById(`${side}-energy-text`).innerText = Math.floor(data.currentEnergy);
}

function showHealText(side, text) {
    const topEl = document.getElementById(`${side}-top`);
    const span = document.createElement('span');
    span.className = 'heal-text';
    span.innerText = text;
    span.style.left = '50%';
    span.style.top = '-20px';
    topEl.appendChild(span);
    setTimeout(() => span.remove(), 1000);
}

function updatePositions(reset = false) {
    if(battleData.animating) return; 
    const pTop = document.getElementById('player-top');
    const bTop = document.getElementById('bot-top');
    
    if (reset) {
        pTop.style.top = '70%'; pTop.style.left = '30%';
        bTop.style.top = '30%'; bTop.style.left = '70%';
    } else {
        pTop.style.top = (30 + Math.random() * 40) + '%';
        pTop.style.left = (30 + Math.random() * 40) + '%';
        bTop.style.top = (30 + Math.random() * 40) + '%';
        bTop.style.left = (30 + Math.random() * 40) + '%';
    }
}

function logMsg(msg) {
    const log = document.getElementById('battle-log');
    const d = document.createElement('div');
    d.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
}

function triggerToplayici(side) {
    const top = battleData[side];
    if(!top.modifiers.toplayici) return;
    top.tickCounter++;
    const lvl = top.modifiers.toplayici;
    
    let heal = 0;
    if(lvl === 1 && top.tickCounter % 5 === 0) heal = 300;
    else if(lvl === 2 && top.tickCounter % 5 === 0) heal = 650;
    else if(lvl === 3 && top.tickCounter % 3 === 0) heal = 1100;
    
    if(heal > 0) {
        top.currentEnergy += heal;
        if(top.currentEnergy > top.maxEnergy) top.currentEnergy = top.maxEnergy;
        showHealText(side, `+${heal}`);
        updateEnergyVisual(side);
    }
}

function gameTick() {
    if(!matchActive) return;

    if(!battleData.animating) {
        drainEnergy('player');
        drainEnergy('bot');
        triggerToplayici('player');
        triggerToplayici('bot');
    }
    
    if(battleData.player.currentEnergy <= 0 && battleData.bot.currentEnergy <= 0) {
        endRound('Berabere!', 'İki topaç da durdu.', 0, 0); return;
    }
    if(battleData.player.currentEnergy <= 0) {
        endRound('P2 Kazandı', 'P1 enerjisi bitti.', 0, 1); return;
    }
    if(battleData.bot.currentEnergy <= 0) {
        endRound('P1 Kazandı', 'P2 enerjisi bitti.', 1, 0); return;
    }

    if(!battleData.animating && Math.random() < 0.5 && !is2PMode) {
        botAction();
    }
    
    updatePositions();
}

function drainEnergy(side) {
    const top = battleData[side];
    let rate = speedEnergyRates[top.speed] || 0.5;
    if(top.modifiers.tasarruf) rate *= 0.8; 
    if(top.modifiers.donat) rate *= 0.1;
    top.currentEnergy -= rate * 10; 
    if(top.currentEnergy < 0) top.currentEnergy = 0;
    updateEnergyVisual(side);
}

function updateCooldownVisuals() {
    if(!matchActive) return;
    const now = Date.now();
    ['rush', 'legendary-rush', 'ultimate-rush', 'combo', 'special'].forEach(act => {
        // P1
        let btn1 = document.querySelector(`.action-btn[data-action="${act}"][data-player="player"]`);
        if(btn1) {
            const rem = Math.ceil((cooldownEnds[act] - now) / 1000);
            btn1.querySelector('.cd-text').innerText = rem > 0 ? `[${rem}s]` : '';
        }
        // P2
        if(is2PMode) {
            let btn2 = document.querySelector(`.action-btn[data-action="${act}"][data-player="bot"]`);
            if(btn2) {
                const rem = Math.ceil((cooldownEndsBot[act] - now) / 1000);
                btn2.querySelector('.cd-text').innerText = rem > 0 ? `[${rem}s]` : '';
            }
        }
    });
    updateButtonStates();
}

function updateButtonStates() {
    const pEnergy = battleData.player.currentEnergy;
    const bEnergy = battleData.bot.currentEnergy;
    const now = Date.now();
    const anim = battleData.animating;
    
    // P1
    document.querySelector('[data-action="attack"][data-player="player"]').disabled = pEnergy < 10 || anim;
    document.querySelector('[data-action="rush"][data-player="player"]').disabled = pEnergy < 25 || anim || now < cooldownEnds['rush'];
    document.querySelector('[data-action="legendary-rush"][data-player="player"]').disabled = pEnergy < 50 || anim || now < cooldownEnds['legendary-rush'];
    document.querySelector('[data-action="ultimate-rush"][data-player="player"]').disabled = pEnergy < 100 || anim || now < cooldownEnds['ultimate-rush'];
    document.querySelector('[data-action="special"][data-player="player"]').disabled = pEnergy < 150 || !battleData.player.power || anim || now < cooldownEnds['special'];
    const c1 = document.querySelector('[data-action="combo"][data-player="player"]');
    if(c1) c1.disabled = pEnergy < 10 || anim || now < cooldownEnds['combo'];

    // P2
    if(is2PMode) {
        document.querySelector('[data-action="attack"][data-player="bot"]').disabled = bEnergy < 10 || anim;
        document.querySelector('[data-action="rush"][data-player="bot"]').disabled = bEnergy < 25 || anim || now < cooldownEndsBot['rush'];
        document.querySelector('[data-action="legendary-rush"][data-player="bot"]').disabled = bEnergy < 50 || anim || now < cooldownEndsBot['legendary-rush'];
        document.querySelector('[data-action="ultimate-rush"][data-player="bot"]').disabled = bEnergy < 100 || anim || now < cooldownEndsBot['ultimate-rush'];
        document.querySelector('[data-action="special"][data-player="bot"]').disabled = bEnergy < 150 || !battleData.bot.power || anim || now < cooldownEndsBot['special'];
        const c2 = document.querySelector('[data-action="combo"][data-player="bot"]');
        if(c2) c2.disabled = bEnergy < 10 || anim || now < cooldownEndsBot['combo'];
    }
}

function showClash(x, y) {
    const clash = document.getElementById('clash-effect');
    clash.style.left = x + '%';
    clash.style.top = y + '%';
    clash.classList.remove('clash-active');
    void clash.offsetWidth; 
    clash.classList.add('clash-active');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function executeAttackAnimation(attackerSide, defenderSide, type) {
    battleData.animating = true;
    updateButtonStates(); 

    const aTop = document.getElementById(`${attackerSide}-top`);
    const dTop = document.getElementById(`${defenderSide}-top`);
    const dPos = { top: dTop.style.top, left: dTop.style.left };

    if (type === 'Rush') {
        aTop.style.transition = 'top 0.2s, left 0.2s';
        aTop.style.top = dPos.top; aTop.style.left = dPos.left;
        await sleep(200);
    } 
    else if (type === 'Legendary Rush') {
        aTop.style.transition = 'top 0.3s, left 0.3s';
        aTop.style.top = '5%'; aTop.style.left = '50%'; 
        await sleep(300);
        aTop.style.transition = 'top 0.1s, left 0.1s cubic-bezier(0.2, 1, 0.3, 1)';
        aTop.style.top = dPos.top; aTop.style.left = dPos.left;
        await sleep(100);
    }
    else if (type === 'Ultimate Rush') {
        aTop.style.transition = 'top 0.3s, left 0.3s';
        aTop.style.top = '50%'; aTop.style.left = '95%'; 
        await sleep(300);
        aTop.style.transition = 'transform 0.4s ease-out, top 0.4s, left 0.4s';
        aTop.style.transform = 'translate(-50%, -50%) scale(2.5)';
        aTop.style.top = '50%'; aTop.style.left = '50%';
        aTop.style.zIndex = '20';
        await sleep(400);
        aTop.style.transition = 'transform 0.1s ease-in, top 0.1s, left 0.1s';
        aTop.style.transform = 'translate(-50%, -50%) scale(1)';
        aTop.style.top = dPos.top; aTop.style.left = dPos.left;
        await sleep(100);
        aTop.style.zIndex = '5';
    } 
    else {
        aTop.style.transition = 'top 0.3s, left 0.3s';
        aTop.style.top = dPos.top; aTop.style.left = dPos.left;
        await sleep(300);
    }

    showClash(parseFloat(dPos.left), parseFloat(dPos.top));
    
    setTimeout(() => {
        if(aTop) {
            aTop.style.transition = 'top 0.5s ease-out, left 0.5s ease-out, transform 0.5s';
            aTop.style.transform = 'translate(-50%, -50%) scale(1)';
        }
        battleData.animating = false;
        updateButtonStates();
    }, 100);
}

async function executeCombo(attacker, defender) {
    if(battleData[attacker].currentEnergy < 10 || battleData.animating) return;
    
    battleData[attacker].currentEnergy -= 10;
    updateEnergyVisual(attacker);
    logMsg(`${battleData[attacker].name} SERİ VURUŞ kullandı! (5x Peş Peşe)`);
    
    battleData.animating = true;
    updateButtonStates();

    const aTop = document.getElementById(`${attacker}-top`);
    const dTop = document.getElementById(`${defender}-top`);
    
    for(let i=0; i<5; i++) {
        if(!matchActive) break;
        const dPos = { top: dTop.style.top, left: dTop.style.left };
        
        aTop.style.transition = 'top 0.1s, left 0.1s';
        aTop.style.top = dPos.top; aTop.style.left = dPos.left;
        await sleep(100);
        
        showClash(parseFloat(dPos.left), parseFloat(dPos.top));
        
        if(!battleData[defender].modifiers.bedrock) {
            battleData[defender].currentEnergy -= 25; // 25 per hit
        } else {
            if(i===0) logMsg(`${battleData[defender].name} Bedrock ile hasar almadı!`);
        }
        updateEnergyVisual(defender);
        
        aTop.style.top = `calc(${dPos.top} - 15px)`;
        aTop.style.left = `calc(${dPos.left} - 15px)`;
        await sleep(100);
    }

    setTimeout(() => {
        if(aTop) {
            aTop.style.transition = 'top 0.5s ease-out, left 0.5s ease-out, transform 0.5s';
            aTop.style.transform = 'translate(-50%, -50%) scale(1)';
        }
        battleData.animating = false;
        updateButtonStates();
    }, 100);
}

async function executeAttack(attacker, defender, type, cost) {
    if(battleData[attacker].currentEnergy < cost || battleData.animating) return;
    
    let finalCost = cost;
    battleData[attacker].currentEnergy -= finalCost;
    updateEnergyVisual(attacker);
    logMsg(`${battleData[attacker].name} ${type} kullandı!`);

    await executeAttackAnimation(attacker, defender, type);
    
    if(!matchActive) return; 
    
    let damage = cost * 2.5;
    if(battleData[defender].modifiers.bedrock) {
        damage = 0; logMsg(`${battleData[defender].name} Bedrock ile hasar almadı!`);
    } else {
        battleData[defender].currentEnergy -= damage;
    }
    updateEnergyVisual(defender);

    if(!battleData[defender].modifiers.bedrock) {
        const pct = battleData[defender].currentEnergy / battleData[defender].maxEnergy;
        if(pct < 0.5) {
            const rand = Math.random();
            const chanceScale = (0.5 - Math.max(0, pct)) * 2; 
            
            if(cost >= 100 && rand < (0.20 * chanceScale)) {
                endRound(attacker === 'player' ? 'P1 Kazandı' : 'P2 Kazandı', 'Parçalanma (Burst)!', attacker === 'player' ? 3 : 0, attacker === 'bot' ? 3 : 0);
                return;
            } else if(cost >= 50 && rand < (0.25 * chanceScale)) {
                endRound(attacker === 'player' ? 'P1 Kazandı' : 'P2 Kazandı', 'Ring Out!', attacker === 'player' ? 2 : 0, attacker === 'bot' ? 2 : 0);
                return;
            }
        }
    }
}

async function useSpecialPower(attacker, defender) {
    if(battleData[attacker].currentEnergy < 150 || battleData.animating) return;
    
    let finalCost = 150;
    battleData[attacker].currentEnergy -= finalCost;
    updateEnergyVisual(attacker);

    const power = battleData[attacker].power;
    logMsg(`ÖZEL GÜÇ: ${power}!`);
    
    await executeAttackAnimation(attacker, defender, 'Normal'); 
    
    if(!matchActive) return;

    if(power === 'Şenolun Baltası') battleData[defender].currentEnergy -= 500;
    else if(power === 'Akıncı') { logMsg(`${battleData[defender].name} durduruldu!`); battleData[defender].currentEnergy -= 300; }
    else if(power === 'Donat') battleData[defender].modifiers.donat = true;
    else if(power === 'Bedrock') {
        battleData[attacker].modifiers.bedrock = true;
        setTimeout(() => { if(battleData[attacker]) battleData[attacker].modifiers.bedrock = false; }, 5000);
    }
    else if(power === 'Pac-Man') battleData[defender].currentEnergy -= 200;
    else if(power === 'Elektro Gitar') logMsg(`${battleData[defender].name} zayıfladı.`);
    else if(power === 'Hata') {
        logMsg(`${battleData[attacker].name} görünmez oldu!`);
        battleData[attacker].modifiers.bedrock = true;
        setTimeout(() => { if(battleData[attacker]) battleData[attacker].modifiers.bedrock = false; }, 3000);
    }
    else if(power === 'Ayna') logMsg(`${battleData[attacker].name} hasarı yansıtacak!`);
    else if(power === 'Karanlık Strike') battleData[defender].currentEnergy -= 400;
    
    updateEnergyVisual(defender);
}

window.playerAction = function(action, side = 'player') {
    if(!matchActive) return;
    const now = Date.now();
    const cds = side === 'player' ? cooldownEnds : cooldownEndsBot;
    const attacker = side;
    const defender = side === 'player' ? 'bot' : 'player';

    switch(action) {
        case 'attack': executeAttack(attacker, defender, 'Normal Saldırı', 10); break;
        case 'rush': 
            if(now > cds['rush']) {
                cds['rush'] = now + 2500;
                executeAttack(attacker, defender, 'Rush', 25); 
            }
            break;
        case 'legendary-rush': 
            if(now > cds['legendary-rush']) {
                cds['legendary-rush'] = now + 5000;
                executeAttack(attacker, defender, 'Legendary Rush', 50); 
            }
            break;
        case 'ultimate-rush': 
            if(now > cds['ultimate-rush']) {
                cds['ultimate-rush'] = now + 10000;
                executeAttack(attacker, defender, 'Ultimate Rush', 100); 
            }
            break;
        case 'combo':
            if(now > cds['combo']) {
                cds['combo'] = now + 5000;
                executeCombo(attacker, defender);
            }
            break;
        case 'special': 
            if(now > cds['special']) {
                cds['special'] = now + 15000;
                useSpecialPower(attacker, defender); 
            }
            break;
    }
}

function botAction() {
    if(!matchActive || battleData.animating) return;
    const energy = battleData.bot.currentEnergy;
    const now = Date.now();
    const actions = [];
    
    if(energy >= 10) actions.push({type: 'attack', cost: 10, name: 'Normal Saldırı'});
    if(energy >= 25 && now > cooldownEndsBot['rush']) { actions.push({type: 'rush', cost: 25, name: 'Rush'}); actions.push({type: 'rush', cost: 25, name: 'Rush'}); }
    if(energy >= 50 && now > cooldownEndsBot['legendary-rush']) { actions.push({type: 'legendary-rush', cost: 50, name: 'Legendary Rush'}); actions.push({type: 'legendary-rush', cost: 50, name: 'Legendary Rush'}); }
    if(energy >= 100 && now > cooldownEndsBot['ultimate-rush']) { actions.push({type: 'ultimate-rush', cost: 100, name: 'Ultimate Rush'}); actions.push({type: 'ultimate-rush', cost: 100, name: 'Ultimate Rush'}); actions.push({type: 'ultimate-rush', cost: 100, name: 'Ultimate Rush'}); }
    if(energy >= 150 && battleData.bot.power && now > cooldownEndsBot['special']) { actions.push({type: 'special', cost: 150, name: 'special'}); actions.push({type: 'special', cost: 150, name: 'special'}); }
    if(energy >= 10 && battleData.bot.modifiers.combo && now > cooldownEndsBot['combo']) { actions.push({type: 'combo', cost: 10, name: 'combo'}); actions.push({type: 'combo', cost: 10, name: 'combo'}); }
    
    if(actions.length > 0) {
        const act = actions[Math.floor(Math.random() * actions.length)];
        if(act.type === 'special') {
            cooldownEndsBot['special'] = now + 15000;
            useSpecialPower('bot', 'player');
        }
        else if(act.type === 'combo') {
            cooldownEndsBot['combo'] = now + 5000;
            executeCombo('bot', 'player');
        } else {
            if(act.type === 'rush') cooldownEndsBot['rush'] = now + 2500;
            if(act.type === 'legendary-rush') cooldownEndsBot['legendary-rush'] = now + 5000;
            if(act.type === 'ultimate-rush') cooldownEndsBot['ultimate-rush'] = now + 10000;
            executeAttack('bot', 'player', act.name, act.cost);
        }
    }
}

function endRound(title, desc, pPoints, bPoints) {
    if(!matchActive) return;
    matchActive = false;
    clearInterval(battleData.interval);
    if(battleData.uiInterval) clearInterval(battleData.uiInterval);
    
    playerScore += pPoints;
    botScore += bPoints;
    updateScores();
    logMsg(`Raunt Bitti! ${title} - ${desc}`);
    
    if(playerScore >= 5 || botScore >= 5) {
        const pWin = playerScore >= 5;
        document.getElementById('match-result-title').innerText = is2PMode ? (pWin ? 'P1 MAÇI KAZANDI!' : 'P2 MAÇI KAZANDI!') : (pWin ? 'MAÇI KAZANDIN!' : 'MAÇI KAYBETTİN!');
        
        if(!is2PMode) {
            if(pWin) {
                let xpGain = currentMode === 'HEW' ? 200 : 100;
                let goldGain = (currentMode === 'HEW' ? 100 : 50) + playerProfile.level * 10;
                
                document.getElementById('match-result-xp').innerText = `+${xpGain} XP Kazanıldı!\n+${goldGain} Altın Kazanıldı!`;
                addXp(xpGain);
                playerProfile.gold += goldGain;
                
                playerProfile.wins++;
                if(playerProfile.wins >= 3) {
                    playerProfile.wins = 0;
                    playerProfile.boxes++;
                    document.getElementById('match-result-xp').innerText += `\n🎁 1 Kutu Kazandın! (3 Galibiyet)`;
                }
            } else {
                let xpLoss = currentMode === 'HEW' ? 50 : 20;
                playerProfile.xp -= xpLoss;
                if(playerProfile.xp < 0) playerProfile.xp = 0; // Seviye düşürmüyoruz, 0'da kalıyor
                
                let goldGain = 10 + playerProfile.level * 2;
                playerProfile.gold += goldGain;
                
                document.getElementById('match-result-xp').innerText = `-${xpLoss} XP Kaybettin!\n+${goldGain} Teselli Altını Kazanıldı!`;
            }
            saveProfile();
        } else {
            document.getElementById('match-result-xp').innerText = `2P YEREL MAÇ - Eğlence Bitti!\nÖdül/Ceza Sistemi 2P modunda kapalıdır.`;
        }
        
        document.getElementById('match-end-modal').classList.remove('hidden');
    } else {
        document.getElementById('round-result-title').innerText = title;
        document.getElementById('round-result-desc').innerText = desc + ` (+${pPoints ? pPoints : bPoints} Puan)`;
        document.getElementById('round-end-modal').classList.remove('hidden');
    }
    
    document.querySelectorAll('.action-btn').forEach(btn => btn.disabled = true);
}

function updateScores() {
    document.getElementById('player-score').innerText = playerScore;
    document.getElementById('bot-score').innerText = botScore;
}

init();
