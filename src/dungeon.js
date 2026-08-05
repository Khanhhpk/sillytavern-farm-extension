import { ctx } from './store.js';
import * as All from './all.js';
import { petSVG, spriteSVG } from './graphics.js';

let isDungeonOpen = false;
let phase = 'placement'; // 'placement', 'combat', 'end'
let gameLoopId = null;
let lastTime = 0;

let team = []; // Currently placed pets
let enemies = []; // Spawned enemies
let projectiles = []; // Active projectiles

let currentWave = 1;
let totalGold = 0;

const PET_STATS = {
    slime: { name: 'Slime Xanh', desc: 'Chiến binh cân bằng, không có gì nổi bật.', hp: 100, atk: 10, range: 40, speed: 40, cd: 1 },
    octo: { name: 'Bạch Tuộc', desc: 'Đánh nhanh thắng nhanh. Đánh càng lâu tốc đánh càng cao.', hp: 80, atk: 15, range: 60, speed: 50, cd: 0.8, skill: 'frenzy' },
    slimePink: { name: 'Slime Hồng', desc: 'Hồi máu đơn mục tiêu cho đồng minh yếu nhất.', hp: 120, atk: 15, range: 80, speed: 35, cd: 1.5, skill: 'heal' },
    slimeNight: { name: 'Soda Đào', desc: 'Đánh xa xuyên thấu mọi kẻ địch trên đường bay.', hp: 90, atk: 18, range: 100, speed: 45, cd: 1.2, skill: 'pierce' },
    octoCream: { name: 'Bạch Tuộc Kem', desc: '20% tỷ lệ làm choáng kẻ địch 1 giây.', hp: 150, atk: 12, range: 60, speed: 45, cd: 1.5, skill: 'stun' },
    bunny: { name: 'Sứa Xoăn', desc: 'Xạ thủ: Bắn càng xa sát thương càng lớn.', hp: 70, atk: 25, range: 150, speed: 60, cd: 1.5, skill: 'sniper' },
    batBlob: { name: 'Bé Bí Ẩn', desc: 'Hồi máu cho bản thân bằng 50% sát thương gây ra.', hp: 85, atk: 14, range: 50, speed: 55, cd: 1.1, skill: 'lifesteal' },
    ghostBlob: { name: 'Ma Trắng', desc: 'Sát thủ: Luôn nhắm vào kẻ thù xa nhất.', hp: 60, atk: 35, range: 40, speed: 100, cd: 1.2, skill: 'assassin' },
    impBlob: { name: 'Quỷ Nhỏ', desc: 'Đánh lan: Gây sát thương AoE xung quanh mục tiêu.', hp: 50, atk: 40, range: 40, speed: 60, cd: 1, skill: 'cleave' },
    angelBlob: { name: 'Thiên Thần', desc: 'Hồi máu diện rộng cho các đồng minh lân cận.', hp: 110, atk: 10, range: 80, speed: 40, cd: 1.2, skill: 'aoe_heal' },
    starBell: { name: 'Chuông Sao', desc: 'Tăng 20% sát thương cho đồng minh lân cận.', hp: 95, atk: 12, range: 90, speed: 40, cd: 1, skill: 'buff_atk' },
    cloudMallow: { name: 'Kẹo Dẻo Mây', desc: 'Khiêu khích: Buộc kẻ địch tấn công mình.', hp: 200, atk: 8, range: 40, speed: 30, cd: 2, skill: 'taunt' },
    dewSprout: { name: 'Mầm Sương', desc: '25% tỷ lệ trói chân kẻ địch trong 2 giây.', hp: 105, atk: 14, range: 50, speed: 45, cd: 1.2, skill: 'root' },
    prismBlob: { name: 'Lăng Kính', desc: 'Bắn 3 tia sáng cùng lúc (sát thương chia nửa).', hp: 80, atk: 20, range: 140, speed: 40, cd: 1.4, skill: 'multishot' },
    penguin: { name: 'Cánh Cụt', desc: 'Đòn đánh làm giảm tốc độ di chuyển và tốc đánh.', hp: 120, atk: 16, range: 45, speed: 50, cd: 1, skill: 'freeze' },
    default: { name: 'Pet Vô Danh', desc: 'Không có kỹ năng đặc biệt.', hp: 100, atk: 10, range: 40, speed: 40, cd: 1 }
};

const ENEMY_TYPES = [
    { id: 'douya', name: 'Giá Đỗ', desc: 'Lính bầy đàn.', hp: 40, atk: 8, range: 40, speed: 45, cd: 0.8, ai: 'melee' },
    { id: 'tomato', name: 'Cà Chua Tròn', desc: 'Cận chiến cơ bản.', hp: 80, atk: 12, range: 40, speed: 30, cd: 1, ai: 'melee' },
    { id: 'radish', name: 'Củ Cải Tốc Độ', desc: 'Chạy cực nhanh.', hp: 50, atk: 8, range: 30, speed: 70, cd: 0.5, ai: 'melee' },
    { id: 'moonberry', name: 'Dâu Tây Gai', desc: 'Thích khách tập kích.', hp: 60, atk: 20, range: 40, speed: 60, cd: 1, ai: 'assassin' },
    { id: 'chuncai', name: 'Rau Thuần', desc: 'Đeo bám dai dẳng.', hp: 120, atk: 10, range: 40, speed: 25, cd: 1.2, ai: 'melee' },
    { id: 'lingjiao', name: 'Củ Ấu Giáp', desc: 'Cận chiến có giáp.', hp: 150, atk: 14, range: 40, speed: 20, cd: 1.5, ai: 'melee' },
    { id: 'pumpkin', name: 'Bí Ngô Khổng Lồ', desc: 'Tanker chậm chạp.', hp: 300, atk: 25, range: 50, speed: 15, cd: 2, ai: 'tank' },
    { id: 'fangW', name: 'Hoa Bá Vương', desc: 'Pháp sư bắn từ xa.', hp: 70, atk: 18, range: 120, speed: 20, cd: 1.5, ai: 'ranged' },
    { id: 'starbush', name: 'Bụi Sao', desc: 'Xạ thủ 3 tia.', hp: 80, atk: 15, range: 140, speed: 25, cd: 1.5, ai: 'ranged', skill: 'multishot' },
    { id: 'opalvine', name: 'Dây Leo Opal', desc: 'Trói chân đối thủ.', hp: 110, atk: 12, range: 90, speed: 20, cd: 1.2, ai: 'ranged', skill: 'root' },
    { id: 'lianou', name: 'Củ Sen Khổng Lồ', desc: 'Ném bùn từ xa.', hp: 250, atk: 15, range: 100, speed: 15, cd: 2, ai: 'ranged' },
    { id: 'dragoncry', name: 'Long Tinh', desc: 'Boss: Cực khỏe.', hp: 600, atk: 40, range: 60, speed: 20, cd: 2, ai: 'tank', skill: 'cleave', elite: true }
];

export function openDungeonView() {
    isDungeonOpen = true;
    
    // Change Title
    const titleH1 = All.$id('drag').querySelector('h1');
    titleH1.innerHTML = `${spriteSVG('dungeonGate', 16)}Ai mà thèm đi Dungeon chứ!`;

    // Hide Farm Elements
    All.$id('blocks').style.display = 'none';
    All.$id('pager').style.display = 'none';
    All.$id('toolbar').style.display = 'none';
    All.$id('mascots').style.display = 'none';

    // Show Dungeon View
    All.dungeonView.style.display = 'flex';
    const fieldEl = All.$id('scroll').querySelector('.field');
    if (fieldEl) fieldEl.style.minHeight = '420px';
    
    initPlacementPhase();
}

export function closeDungeonView() {
    if (!isDungeonOpen) return;
    isDungeonOpen = false;
    stopCombatLoop();

    // Revert Title
    const titleH1 = All.$id('drag').querySelector('h1');
    titleH1.innerHTML = `${spriteSVG('strawhat', 16)}Ai thèm làm nông dân chứ!`;

    // Show Farm Elements
    All.$id('blocks').style.display = '';
    All.$id('pager').style.display = '';
    All.$id('toolbar').style.display = '';
    All.$id('mascots').style.display = '';

    // Hide Dungeon View
    All.dungeonView.style.display = 'none';
    All.dungeonView.innerHTML = '';
    
    const fieldEl = All.$id('scroll').querySelector('.field');
    if (fieldEl) fieldEl.style.minHeight = '';
}

function initPlacementPhase() {
    phase = 'placement';
    team = [];
    enemies = [];
    projectiles = [];
    
    All.dungeonView.innerHTML = `
        <div class="dg-arena" id="dg-arena">
            <div class="dg-info-panel" id="dg-info-panel" style="display:none;">
                <div class="dg-info-close" id="dg-info-close">×</div>
                <h3>Chỉ Số Thú Cưng</h3>
                <div class="dg-info-list" id="dg-info-list"></div>
            </div>
            <div class="dg-info-panel" id="dg-codex-panel" style="display:none; border-left-color:#e06578;">
                <div class="dg-info-close" id="dg-codex-close">×</div>
                <h3 style="color:#e06578;">Từ Điển Quái</h3>
                <div class="dg-info-list" id="dg-codex-list"></div>
            </div>
        </div>
        <div style="display:flex; justify-content:center; margin-top: 5px;">
            <div class="buy" id="dg-start-btn">Bắt Đầu Trận Chiến</div>
            <div class="buy plain" id="dg-leave-btn" style="margin-left: 10px;">Thoát</div>
            <div class="buy plain" id="dg-info-btn" style="margin-left: 10px; width: 32px; padding: 0; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:18px; color:black;" title="Thông tin Thú cưng">?</div>
            <div class="buy plain" id="dg-codex-btn" style="margin-left: 10px; padding: 0 10px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px; color:#e06578;" title="Từ điển quái">Quái Vật</div>
        </div>
        <div class="dg-dock" id="dg-dock"></div>
    `;

    const arena = All.$id('dg-arena');
    const dock = All.$id('dg-dock');

    let draggingPet = null;
    let dragEl = null;

    // Render available pets
    ctx.S.pets.forEach(petId => {
        const slot = document.createElement('div');
        slot.className = 'dg-slot';
        slot.innerHTML = petSVG(petId, 32);
        slot.dataset.pet = petId;
        
        slot.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (phase !== 'placement') return;
            if (team.length >= 4) { All.toast('Tối đa 4 thành viên!'); return; }
            if (slot.classList.contains('placed')) return;
            
            draggingPet = { id: petId, slot: slot };
            
            dragEl = document.createElement('div');
            dragEl.className = 'dg-entity pet';
            dragEl.style.pointerEvents = 'none';
            dragEl.style.position = 'fixed';
            dragEl.style.zIndex = '100000';
            dragEl.style.transition = 'none'; // Disable transition for instant drag
            dragEl.innerHTML = petSVG(petId, 32);
            arena.appendChild(dragEl); // append to arena to stay on top of UI
            
            dragEl.style.left = (e.clientX - 16) + 'px';
            dragEl.style.top = (e.clientY - 16) + 'px';
            
            slot.setPointerCapture(e.pointerId);
        });
        
        slot.addEventListener('pointermove', (e) => {
            if (!draggingPet || !dragEl) return;
            dragEl.style.left = (e.clientX - 16) + 'px';
            dragEl.style.top = (e.clientY - 16) + 'px';
        });
        
        slot.addEventListener('pointerup', (e) => {
            if (!draggingPet || !dragEl) return;
            
            const pId = draggingPet.id;
            const currentSlot = draggingPet.slot;
            
            dragEl.remove();
            dragEl = null;
            draggingPet = null;
            currentSlot.releasePointerCapture(e.pointerId);
            
            const rect = arena.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                
                currentSlot.classList.add('placed');
                
                const stat = PET_STATS[pId] || PET_STATS.default;
                const el = document.createElement('div');
                el.className = 'dg-entity pet';
                el.innerHTML = `
                    <div class="dg-hp-bar"><div class="dg-hp-fill"></div></div>
                    ${petSVG(pId, 32)}
                `;
                
                let x = e.clientX - rect.left - 16;
                let y = e.clientY - rect.top - 16;
                if (x > rect.width - 32) x = rect.width - 32;
                if (x < 0) x = 0;
                if (y < 0) y = 0;
                if (y > rect.height - 32) y = rect.height - 32;
                
                el.style.position = 'absolute';
                el.style.left = x + 'px';
                el.style.top = y + 'px';
                
                arena.appendChild(el);
                
                const memberObj = {
                    id: pId, x, y, hp: stat.hp, maxHp: stat.hp, atk: stat.atk,
                    range: stat.range, speed: stat.speed, cd: 0, maxCd: stat.cd, el, type: 'pet',
                    skill: stat.skill, dockSlot: currentSlot
                };
                team.push(memberObj);
                
                // Allow moving/removing placed pets
                let isPlacedDragging = false;
                el.addEventListener('pointerdown', (ev) => {
                    ev.preventDefault();
                    if (phase !== 'placement') return;
                    isPlacedDragging = true;
                    el.style.position = 'fixed';
                    el.style.zIndex = '100000';
                    el.style.transition = 'none'; // Disable transition when dragging
                    el.style.left = (ev.clientX - 16) + 'px';
                    el.style.top = (ev.clientY - 16) + 'px';
                    el.setPointerCapture(ev.pointerId);
                });
                el.addEventListener('pointermove', (ev) => {
                    if (!isPlacedDragging) return;
                    el.style.left = (ev.clientX - 16) + 'px';
                    el.style.top = (ev.clientY - 16) + 'px';
                });
                el.addEventListener('pointerup', (ev) => {
                    if (!isPlacedDragging) return;
                    isPlacedDragging = false;
                    el.releasePointerCapture(ev.pointerId);
                    el.style.zIndex = '';
                    
                    const arect = arena.getBoundingClientRect();
                    if (ev.clientX >= arect.left && ev.clientX <= arect.right &&
                        ev.clientY >= arect.top && ev.clientY <= arect.bottom) {
                        
                        el.style.position = 'absolute';
                        let nx = ev.clientX - arect.left - 16;
                        let ny = ev.clientY - arect.top - 16;
                        if (nx > arect.width - 32) nx = arect.width - 32;
                        if (nx < 0) nx = 0;
                        if (ny < 0) ny = 0;
                        if (ny > arect.height - 32) ny = arect.height - 32;
                        
                        el.style.left = nx + 'px';
                        el.style.top = ny + 'px';
                        
                        // Force reflow before restoring transition to prevent fly-in animation
                        el.offsetHeight;
                        el.style.transition = '';
                        
                        memberObj.x = nx;
                        memberObj.y = ny;
                    } else {
                        // Removed from arena
                        el.remove();
                        const idx = team.indexOf(memberObj);
                        if (idx !== -1) team.splice(idx, 1);
                        currentSlot.classList.remove('placed');
                    }
                });
            }
        });
        
        dock.appendChild(slot);
    });
    
    // Info & Codex Sidebar logic
    const infoBtn = All.$id('dg-info-btn');
    const infoPanel = All.$id('dg-info-panel');
    const infoList = All.$id('dg-info-list');
    const infoClose = All.$id('dg-info-close');
    
    const codexBtn = All.$id('dg-codex-btn');
    const codexPanel = All.$id('dg-codex-panel');
    const codexList = All.$id('dg-codex-list');
    const codexClose = All.$id('dg-codex-close');
    
    infoBtn.addEventListener('click', () => {
        if (infoPanel.style.display === 'flex') {
            infoPanel.style.display = 'none';
            return;
        }
        codexPanel.style.display = 'none';
        infoList.innerHTML = '';
        ctx.S.pets.forEach(petId => {
            const stat = PET_STATS[petId] || PET_STATS.default;
            infoList.innerHTML += `
                <div class="dg-info-item">
                    <div class="dg-info-item-icon">${petSVG(petId, 32)}</div>
                    <div class="dg-info-item-desc">
                        <b>${stat.name}</b>
                        HP: ${stat.hp} | ATK: ${stat.atk}<br/>
                        Tầm đánh: ${stat.range} | Tốc đánh: ${stat.cd}s<br/>
                        <span style="color:#b08a5c;">${stat.desc}</span>
                    </div>
                </div>
            `;
        });
        infoPanel.style.display = 'flex';
    });
    
    codexBtn.addEventListener('click', () => {
        if (codexPanel.style.display === 'flex') {
            codexPanel.style.display = 'none';
            return;
        }
        infoPanel.style.display = 'none';
        codexList.innerHTML = '';
        ENEMY_TYPES.forEach(stat => {
            codexList.innerHTML += `
                <div class="dg-info-item" style="border-left: 2px solid #e06578;">
                    <div class="dg-info-item-icon">${spriteSVG(stat.id, 32)}</div>
                    <div class="dg-info-item-desc">
                        <b style="color:#e06578;">${stat.name}</b>
                        HP: ${stat.hp} | ATK: ${stat.atk}<br/>
                        Tầm đánh: ${stat.range} | Tốc đánh: ${stat.cd}s<br/>
                        <span style="color:#b08a5c;">${stat.desc}</span>
                    </div>
                </div>
            `;
        });
        codexPanel.style.display = 'flex';
    });
    
    infoClose.addEventListener('click', () => { infoPanel.style.display = 'none'; });
    codexClose.addEventListener('click', () => { codexPanel.style.display = 'none'; });

    All.$id('dg-start-btn').addEventListener('click', () => {
        if (team.length === 0) return All.toast('Chưa chọn đội hình!');
        startCombat();
    });

    All.$id('dg-leave-btn').addEventListener('click', () => {
        closeDungeonView();
    });
}

let fullTeam = [];

function startCombat() {
    phase = 'combat';
    All.$id('dg-dock').style.display = 'none';
    All.$id('dg-start-btn').style.display = 'none';
    All.$id('dg-leave-btn').style.display = 'none'; // hide leave during combat
    
    currentWave = 1;
    totalGold = 0;
    fullTeam = [...team]; // Snapshot the current team
    
    startWave();
}

function startWave() {
    phase = 'combat';
    enemies = [];
    projectiles = [];
    const arena = All.$id('dg-arena');
    const w = arena.clientWidth;
    const h = arena.clientHeight;
    
    // Calculate enemies based on wave
    const count = Math.min(10, 3 + Math.floor(currentWave * 0.8));
    let spawnElite = currentWave % 3 === 0;
    
    for(let i=0; i<count; i++) {
        let type;
        if (spawnElite && i === 0) {
            const elites = ENEMY_TYPES.filter(e => e.elite);
            type = elites.length > 0 ? elites[Math.floor(Math.random() * elites.length)] : ENEMY_TYPES[ENEMY_TYPES.length-1];
        } else {
            const normals = ENEMY_TYPES.filter(e => !e.elite);
            type = normals[Math.floor(Math.random() * normals.length)];
        }
        
        const el = document.createElement('div');
        el.className = 'dg-entity enemy flip';
        el.innerHTML = `
            <div class="dg-hp-bar"><div class="dg-hp-fill"></div></div>
            ${spriteSVG(type.id, 32)}
        `;
        
        const x = w - 40 - Math.random() * 60;
        const y = 40 + Math.random() * (h - 80);
        
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        
        arena.appendChild(el);
        
        // Scale hp and atk based on wave
        const hpMultiplier = 1 + (currentWave - 1) * 0.3;
        const atkMultiplier = 1 + (currentWave - 1) * 0.2;
        
        enemies.push({
            id: type.id, x, y, hp: type.hp * hpMultiplier, maxHp: type.hp * hpMultiplier, 
            atk: type.atk * atkMultiplier,
            range: type.range, speed: type.speed, cd: 0, maxCd: type.cd, el, type: 'enemy',
            skill: type.skill, ai: type.ai
        });
    }
    
    lastTime = performance.now();
    if (!gameLoopId) {
        gameLoopId = requestAnimationFrame(combatLoop);
    }
}

function stopCombatLoop() {
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoopId = null;
}

function combatLoop(time) {
    if (phase !== 'combat') return;
    
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    
    updateEntities(team, enemies, dt);
    updateEntities(enemies, team, dt);
    
    // Update projectiles
    const arena = All.$id('dg-arena');
    projectiles = projectiles.filter(p => {
        if (!p.target || p.target.hp <= 0) {
            p.el.remove();
            return false;
        }
        
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < 10) {
            // Hit!
            applyEffect(p.from, p.target, p.fromGroup, p.toGroup, p.atk, p.skill);
            p.el.remove();
            return false;
        } else {
            const move = p.speed * dt;
            p.x += (dx / dist) * move;
            p.y += (dy / dist) * move;
            
            // Adjust tx/ty to follow moving target
            p.tx = p.target.x;
            p.ty = p.target.y - 16;
            
            p.el.style.left = p.x + 'px';
            p.el.style.top = p.y + 'px';
            return true;
        }
    });
    
    // Check end conditions
    team = team.filter(e => {
        if (e.hp <= 0) {
            e.el.remove();
            return false;
        }
        return true;
    });
    
    enemies = enemies.filter(e => {
        if (e.hp <= 0) {
            e.el.remove();
            return false;
        }
        return true;
    });
    
    if (enemies.length === 0) {
        showWaveRewards();
        return;
    }
    
    if (team.length === 0) {
        endDungeon(false);
        return;
    }
    
    gameLoopId = requestAnimationFrame(combatLoop);
}

function spawnDmg(target, amount, type) {
    const arena = All.$id('dg-arena');
    const dmg = document.createElement('div');
    dmg.className = 'dg-dmg' + (type ? ' ' + type : '');
    dmg.textContent = (amount > 0 ? '+' : '') + amount;
    dmg.style.left = target.x + 'px';
    dmg.style.top = target.y + 'px';
    arena.appendChild(dmg);
    setTimeout(() => dmg.remove(), 800);
    
    const pct = Math.max(0, target.hp / target.maxHp) * 100;
    target.el.querySelector('.dg-hp-fill').style.width = pct + '%';
}

function applyEffect(attacker, target, myGroup, enemyGroup, overrideAtk, skillOverride) {
    const atk = overrideAtk || attacker.atk;
    const skill = skillOverride || attacker.skill;
    
    if (skill === 'heal') {
        target.hp = Math.min(target.maxHp, target.hp + atk);
        spawnDmg(target, atk, 'heal');
        return;
    }
    if (skill === 'aoe_heal') {
        myGroup.forEach(ally => {
            if (ally.hp > 0 && Math.hypot(ally.x - attacker.x, ally.y - attacker.y) <= attacker.range) {
                ally.hp = Math.min(ally.maxHp, ally.hp + atk);
                spawnDmg(ally, atk, 'heal');
            }
        });
        return;
    }
    
    // Base damage
    let finalDmg = atk;
    if (skill === 'sniper' && attacker) {
        const dist = Math.hypot(target.x - attacker.x, target.y - attacker.y);
        finalDmg += Math.floor(dist * 0.2); // extra damage based on distance
    }
    
    target.hp -= finalDmg;
    spawnDmg(target, -finalDmg);
    
    if (skill === 'lifesteal' && attacker) {
        const ls = Math.floor(finalDmg * 0.5);
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + ls);
        spawnDmg(attacker, ls, 'heal');
    }
    
    if (!target.status) target.status = {};
    if (skill === 'stun' && Math.random() < 0.2) target.status.stun = 1;
    if (skill === 'poison') target.status.poison = 3;
    if (skill === 'freeze') target.status.freeze = 3;
    if (skill === 'root' && Math.random() < 0.25) target.status.root = 2;
    
    if (skill === 'cleave' && attacker) {
        enemyGroup.forEach(e => {
            if (e !== target && e.hp > 0 && Math.hypot(e.x - target.x, e.y - target.y) <= 40) {
                e.hp -= Math.floor(finalDmg * 0.5);
                spawnDmg(e, -Math.floor(finalDmg * 0.5));
            }
        });
    }
    if (skill === 'pierce' && attacker) {
        enemyGroup.forEach(e => {
            if (e !== target && e.hp > 0) {
                // simple line check
                const distToTarget = Math.hypot(target.x - attacker.x, target.y - attacker.y);
                const distToE = Math.hypot(e.x - attacker.x, e.y - attacker.y);
                if (distToE < distToTarget + 50 && distToE > distToTarget - 50) {
                    const dot = ((e.x - attacker.x) * (target.x - attacker.x) + (e.y - attacker.y) * (target.y - attacker.y)) / (distToTarget * distToTarget);
                    if (dot > 0.8 && dot < 1.5) { 
                        e.hp -= finalDmg;
                        spawnDmg(e, -finalDmg);
                    }
                }
            }
        });
    }
}

function updateEntities(groupA, groupB, dt) {
    const arena = All.$id('dg-arena');
    
    groupA.forEach(a => {
        if (a.hp <= 0) return;
        
        // Cooldown tick
        if (a.cd > 0) a.cd -= dt;
        
        // Status Effects
        if (!a.status) a.status = {};
        let isStunned = false;
        let isRooted = false;
        let speedMult = 1;
        let atkSpdMult = 1;
        
        for (let eff in a.status) {
            if (a.status[eff] > 0) {
                a.status[eff] -= dt;
                if (eff === 'stun') isStunned = true;
                if (eff === 'root') isRooted = true;
                if (eff === 'freeze') { speedMult *= 0.5; atkSpdMult *= 0.5; }
                if (eff === 'poison' && Math.random() < dt) {
                    a.hp -= 2;
                    spawnDmg(a, -2);
                }
                if (eff === 'buff_atk') atkSpdMult *= 1.2;
            }
        }
        
        // Update status UI
        let statusHtml = '';
        if (a.status.stun > 0) statusHtml += '<div class="dg-status-icon dg-status-stun"></div>';
        if (a.status.poison > 0) statusHtml += '<div class="dg-status-icon dg-status-poison"></div>';
        if (a.status.freeze > 0) statusHtml += '<div class="dg-status-icon dg-status-freeze"></div>';
        if (a.status.root > 0) statusHtml += '<div class="dg-status-icon dg-status-root"></div>';
        if (a.status.taunt > 0) statusHtml += '<div class="dg-status-icon dg-status-taunt"></div>';
        if (a.status.buff_atk > 0) statusHtml += '<div class="dg-status-icon dg-status-buff"></div>';
        
        let statusDiv = a.el.querySelector('.dg-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.className = 'dg-status';
            a.el.appendChild(statusDiv);
        }
        statusDiv.innerHTML = statusHtml;
        
        if (isStunned) return; // Can't move or attack
        
        // Find target
        /** @type {any} */
        let closest = null;
        let minDist = Infinity;
        
        let taunters = groupB.filter(b => b.hp > 0 && b.status && b.status.taunt > 0);
        let targetGroup = taunters.length > 0 ? taunters : groupB;
        
        if (a.skill === 'heal' || a.skill === 'aoe_heal') {
            targetGroup = groupA; // target allies
            let minHpPct = 1.0;
            targetGroup.forEach(ally => {
                if (ally.hp <= 0) return;
                const dist = Math.hypot(ally.x - a.x, ally.y - a.y);
                const hpPct = ally.hp / ally.maxHp;
                if (hpPct < minHpPct && dist < a.range * 4) { 
                    minHpPct = hpPct;
                    closest = { b: ally, dx: ally.x - a.x, dy: ally.y - a.y, dist };
                }
            });
            if (!closest) {
                targetGroup.forEach(ally => {
                    if (ally === a || ally.hp <= 0) return;
                    const dx = ally.x - a.x;
                    const dy = ally.y - a.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = { b: ally, dx, dy, dist };
                    }
                });
            }
        } else if (a.skill === 'assassin' || a.ai === 'assassin') {
            let maxDist = -1;
            targetGroup.forEach(b => {
                if (b.hp <= 0) return;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.hypot(dx, dy);
                if (dist > maxDist) {
                    maxDist = dist;
                    closest = { b, dx, dy, dist };
                }
            });
        } else {
            targetGroup.forEach(b => {
                if (b.hp <= 0) return;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.hypot(dx, dy);
                if (dist < minDist) {
                    minDist = dist;
                    closest = { b, dx, dy, dist };
                }
            });
        }
        
        a.el.classList.remove('walk');
        
        if (closest) {
            // Face target
            if (closest.dx < 0 && a.type === 'pet') a.el.classList.add('flip');
            else if (closest.dx >= 0 && a.type === 'pet') a.el.classList.remove('flip');
            
            if (closest.dx > 0 && a.type === 'enemy') a.el.classList.add('flip');
            else if (closest.dx <= 0 && a.type === 'enemy') a.el.classList.remove('flip');
            
            let isRanged = a.range >= 80 || a.ai === 'ranged';
            let inRange = closest.dist <= a.range || (a.skill === 'heal' && closest.dist <= 10);
            let tooClose = isRanged && closest.dist < a.range * 0.4 && closest.b.type !== a.type;
            
            if (tooClose && !isRooted) {
                // Kite
                a.el.classList.add('walk');
                const speed = a.speed * speedMult * dt;
                a.x -= (closest.dx / closest.dist) * speed;
                a.y -= (closest.dy / closest.dist) * speed;
                
                const arenaRect = arena.getBoundingClientRect();
                a.x = Math.max(20, Math.min(a.x, arenaRect.width - 20));
                a.y = Math.max(20, Math.min(a.y, arenaRect.height - 20));
                
                a.el.style.left = a.x + 'px';
                a.el.style.top = a.y + 'px';
            } 
            else if (!inRange && !isRooted) {
                // Chase
                a.el.classList.add('walk');
                const speed = a.speed * speedMult * dt;
                if ((a.skill === 'assassin' || a.ai === 'assassin') && closest.dist > 150) {
                    a.x = closest.b.x + (closest.dx > 0 ? -30 : 30);
                    a.y = closest.b.y;
                } else {
                    a.x += (closest.dx / closest.dist) * speed;
                    a.y += (closest.dy / closest.dist) * speed;
                }
                
                const arenaRect = arena.getBoundingClientRect();
                a.x = Math.max(20, Math.min(a.x, arenaRect.width - 20));
                a.y = Math.max(20, Math.min(a.y, arenaRect.height - 20));
                
                a.el.style.left = a.x + 'px';
                a.el.style.top = a.y + 'px';
            } 
            
            if (inRange) {
                if (a.cd <= 0) {
                    a.cd = a.maxCd / atkSpdMult;
                    
                    a.el.classList.add('attack');
                    setTimeout(() => { if(a.el) a.el.classList.remove('attack'); }, 200);
                    
                    if (a.skill === 'frenzy') {
                        if (!a.frenzyStacks) a.frenzyStacks = 0;
                        a.frenzyStacks = Math.min(10, a.frenzyStacks + 1);
                        a.cd = a.maxCd / (1 + a.frenzyStacks * 0.05);
                    }
                    if (a.skill === 'taunt') {
                        a.status.taunt = 3;
                    }
                    if (a.skill === 'buff_atk') {
                        groupA.forEach(ally => {
                            if (ally.hp > 0 && Math.hypot(ally.x - a.x, ally.y - a.y) < 100) {
                                if (!ally.status) ally.status = {};
                                ally.status.buff_atk = 2;
                            }
                        });
                    }

                    if (isRanged && a.skill !== 'heal' && a.skill !== 'aoe_heal') {
                        let p = {
                            x: a.x, y: a.y - 16,
                            tx: closest.b.x, ty: closest.b.y - 16,
                            target: closest.b,
                            atk: a.atk, skill: a.skill,
                            from: a, fromGroup: groupA, toGroup: targetGroup,
                            speed: 300,
                            el: document.createElement('div')
                        };
                        p.el.className = 'dg-projectile';
                        p.el.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#f0d" /></svg>'; 
                        p.el.style.left = p.x + 'px';
                        p.el.style.top = p.y + 'px';
                        arena.appendChild(p.el);
                        
                        if (a.skill === 'multishot') {
                            projectiles.push(p);
                            let target2 = targetGroup[Math.floor(Math.random() * targetGroup.length)];
                            let target3 = targetGroup[Math.floor(Math.random() * targetGroup.length)];
                            if (target2 && target2 !== p.target) {
                                let p2 = {...p, tx: target2.x, ty: target2.y-16, target: target2, atk: a.atk*0.5, el: p.el.cloneNode(true)};
                                arena.appendChild(p2.el); projectiles.push(p2);
                            }
                            if (target3 && target3 !== p.target && target3 !== target2) {
                                let p3 = {...p, tx: target3.x, ty: target3.y-16, target: target3, atk: a.atk*0.5, el: p.el.cloneNode(true)};
                                arena.appendChild(p3.el); projectiles.push(p3);
                            }
                        } else {
                            projectiles.push(p);
                        }
                    } else {
                        applyEffect(a, closest.b, groupA, targetGroup);
                    }
                }
            }
        }
    });
}

function endDungeon(isWin) {
    phase = 'end';
    stopCombatLoop();
    
    projectiles.forEach(p => p.el.remove());
    projectiles = [];
    
    const arena = All.$id('dg-arena');
    const overlay = document.createElement('div');
    overlay.className = 'dg-overlay';
    
    ctx.S.coins += totalGold;
    All.save();
    All.renderStatus();
    let rewardText = `<div style="color:white; font-size: 16px;">Phần thưởng: ${spriteSVG('coin', 16).replace('display:block', 'display:inline-block; vertical-align:middle; margin-top:-2px')} ${totalGold} G<br/>Sống sót đến Wave ${currentWave}</div>`;
    
    overlay.innerHTML = `
        <div class="dg-title">Game Over</div>
        ${rewardText}
        <div class="buy" id="dg-finish-btn" style="margin-top: 10px;">Thoát Hầm Ngục</div>
    `;
    
    arena.appendChild(overlay);
    
    overlay.querySelector('#dg-finish-btn').addEventListener('click', () => {
        closeDungeonView();
    });
}

function showWaveRewards() {
    phase = 'end'; // pause combat
    stopCombatLoop();
    projectiles.forEach(p => p.el.remove());
    projectiles = [];
    
    // Calculate gold for this wave
    const waveGold = 100 + currentWave * 50;
    totalGold += waveGold;
    
    // Revive dead pets (50% HP) and heal living ones? User said "hồi sinh lại đồng đội đã hi sinh với lượng máu 50% sẽ tạm ngưng và hiển thị 3 lựa chọn"
    const arena = All.$id('dg-arena');
    fullTeam.forEach(p => {
        if (p.hp <= 0) {
            p.hp = p.maxHp * 0.5;
            p.el.querySelector('.dg-hp-fill').style.width = '50%';
            arena.appendChild(p.el);
        }
        // clear status
        p.status = {};
    });
    team = [...fullTeam]; // Restore full team active status
    
    const overlay = document.createElement('div');
    overlay.className = 'dg-overlay';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
    
    overlay.innerHTML = `
        <div class="dg-title" style="color: #ffda66;">Wave ${currentWave} Hoàn Thành!</div>
        <div style="color:white; margin-bottom: 20px;">Nhận được ${waveGold} G (Tổng: ${totalGold} G)</div>
        <div style="display:flex; gap: 15px;">
            <div class="dg-reward-card" id="rew-heal">
                <h4>Hồi Máu</h4>
                <p>Hồi 100% HP cho toàn đội</p>
            </div>
            <div class="dg-reward-card" id="rew-buff">
                <h4>Cường Hóa</h4>
                <p>Tăng ngẫu nhiên 10-30% HP hoặc ATK cho toàn đội</p>
            </div>
            <div class="dg-reward-card" id="rew-ascend">
                <h4>Thăng Hoa</h4>
                <p>Chọn 1 Pet để x2 Chỉ Số</p>
            </div>
        </div>
    `;
    arena.appendChild(overlay);
    
    // Add CSS for cards if not exists
    if (!document.getElementById('dg-reward-style')) {
        const style = document.createElement('style');
        style.id = 'dg-reward-style';
        style.innerHTML = `
            .dg-reward-card { background: #3c2a20; border: 2px solid #b08a5c; padding: 10px; border-radius: 8px; width: 120px; text-align: center; cursor: pointer; transition: transform 0.2s; }
            .dg-reward-card:hover { transform: scale(1.05); border-color: #ffda66; }
            .dg-reward-card h4 { margin: 0 0 5px 0; color: #ffda66; }
            .dg-reward-card p { margin: 0; font-size: 12px; color: #fff; }
        `;
        document.head.appendChild(style);
    }
    
    overlay.querySelector('#rew-heal').onclick = () => {
        fullTeam.forEach(p => p.hp = p.maxHp);
        nextWaveSequence(overlay);
    };
    
    overlay.querySelector('#rew-buff').onclick = () => {
        const isAtk = Math.random() > 0.5;
        const amt = 1.1 + Math.random() * 0.2; // 10-30%
        fullTeam.forEach(p => {
            if (isAtk) p.atk *= amt;
            else { p.maxHp *= amt; p.hp *= amt; }
        });
        nextWaveSequence(overlay);
    };
    
    overlay.querySelector('#rew-ascend').onclick = () => {
        overlay.innerHTML = '<div class="dg-title">Chọn 1 Pet Thăng Hoa</div><div id="dg-pet-select" style="display:flex; gap: 10px; margin-top:20px; flex-wrap:wrap; justify-content:center;"></div>';
        const selectContainer = overlay.querySelector('#dg-pet-select');
        fullTeam.forEach((p) => {
            const btn = document.createElement('div');
            btn.className = 'dg-reward-card';
            btn.style.width = '80px';
            btn.innerHTML = petSVG(p.id, 48);
            btn.onclick = () => {
                p.maxHp *= 2; p.hp = p.maxHp; p.atk *= 2;
                nextWaveSequence(overlay);
            };
            selectContainer.appendChild(btn);
        });
    };
}

function nextWaveSequence(overlay) {
    overlay.remove();
    currentWave++;
    
    // Heal visuals update
    fullTeam.forEach(p => {
        const pct = Math.max(0, Math.min(100, p.hp / p.maxHp * 100));
        p.el.querySelector('.dg-hp-fill').style.width = pct + '%';
    });
    
    startWave();
}
