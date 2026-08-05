import { ctx } from './store.js';
import * as All from './all.js';
import { petSVG, spriteSVG } from './graphics.js';

let isDungeonOpen = false;
let phase = 'placement'; // 'placement', 'combat', 'end'
let gameLoopId = null;
let lastTime = 0;

let team = []; // Currently placed pets
let enemies = []; // Spawned enemies

const PET_STATS = {
    slime: { name: 'Slime Xanh', desc: 'Chiến binh cân bằng, không có gì nổi bật.', hp: 100, atk: 10, range: 40, speed: 40, cd: 1 },
    octo: { name: 'Bạch Tuộc', desc: 'Đánh nhanh thắng nhanh.', hp: 80, atk: 15, range: 60, speed: 50, cd: 0.8 },
    slimePink: { name: 'Slime Hồng', desc: 'Hồi máu: Hồi máu cho đồng minh.', hp: 120, atk: 15, range: 80, speed: 35, cd: 1.5, skill: 'heal' },
    slimeNight: { name: 'Soda Đào', desc: 'Phép thuật: Đánh xa, sát thương ổn định.', hp: 90, atk: 18, range: 100, speed: 45, cd: 1.2 },
    octoCream: { name: 'Bạch Tuộc Kem', desc: 'Máu trâu, đánh chậm.', hp: 150, atk: 12, range: 60, speed: 45, cd: 1.5 },
    bunny: { name: 'Sứa Xoăn', desc: 'Xạ thủ: Tầm đánh cực xa, sát thương cao.', hp: 70, atk: 25, range: 150, speed: 60, cd: 1.5 },
    batBlob: { name: 'Bé Bí Ẩn', desc: 'Chiến binh bóng đêm nhanh nhẹn.', hp: 85, atk: 14, range: 50, speed: 55, cd: 1.1 },
    ghostBlob: { name: 'Ma Trắng', desc: 'Sát thủ: Luôn nhắm vào kẻ thù xa nhất.', hp: 60, atk: 35, range: 40, speed: 100, cd: 1.2, skill: 'assassin' },
    impBlob: { name: 'Quỷ Nhỏ', desc: 'Sát thương cực khủng, máu giấy.', hp: 50, atk: 40, range: 40, speed: 60, cd: 1 },
    angelBlob: { name: 'Thiên Thần', desc: 'Thiên sứ hồi máu liên tục.', hp: 110, atk: 10, range: 80, speed: 40, cd: 1.2, skill: 'heal' },
    witchBlob: { name: 'Phù Thủy', desc: 'Sát thương phép thuật từ xa.', hp: 75, atk: 22, range: 120, speed: 50, cd: 1.3 },
    starBell: { name: 'Chuông Sao', desc: 'Hỗ trợ đồng đội.', hp: 95, atk: 12, range: 90, speed: 40, cd: 1 },
    cloudMallow: { name: 'Kẹo Dẻo Mây', desc: 'Tanker siêu trâu bò.', hp: 200, atk: 8, range: 40, speed: 30, cd: 2 },
    dewSprout: { name: 'Mầm Sương', desc: 'Chiến binh thiên nhiên mạnh mẽ.', hp: 105, atk: 14, range: 50, speed: 45, cd: 1.2 },
    prismBlob: { name: 'Lăng Kính', desc: 'Bắn tỉa từ xa.', hp: 80, atk: 20, range: 140, speed: 40, cd: 1.4 },
    penguin: { name: 'Cánh Cụt', desc: 'Võ sĩ cận chiến băng giá.', hp: 120, atk: 16, range: 45, speed: 50, cd: 1 },
    // defaults
    default: { name: 'Pet Vô Danh', desc: 'Không có kỹ năng đặc biệt.', hp: 100, atk: 10, range: 40, speed: 40, cd: 1 }
};

const ENEMY_TYPES = [
    { id: 'tomato', hp: 80, atk: 12, range: 40, speed: 30, cd: 1 },
    { id: 'pumpkin', hp: 200, atk: 25, range: 50, speed: 20, cd: 1.5 },
    { id: 'radish', hp: 50, atk: 8, range: 30, speed: 60, cd: 0.5 },
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
    
    All.dungeonView.innerHTML = `
        <div class="dg-arena" id="dg-arena">
            <div class="dg-info-panel" id="dg-info-panel" style="display:none;">
                <div class="dg-info-close" id="dg-info-close">×</div>
                <h3>Chỉ Số Thú Cưng</h3>
                <div class="dg-info-list" id="dg-info-list"></div>
            </div>
        </div>
        <div style="display:flex; justify-content:center; margin-top: 5px;">
            <div class="buy" id="dg-start-btn">Bắt Đầu Trận Chiến</div>
            <div class="buy plain" id="dg-leave-btn" style="margin-left: 10px;">Thoát</div>
            <div class="buy plain" id="dg-info-btn" style="margin-left: 10px; width: 32px; padding: 0; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:18px; color:white;" title="Thông tin Thú cưng">?</div>
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
            if (phase !== 'placement') return;
            if (team.length >= 4) { All.toast('Tối đa 4 thành viên!'); return; }
            if (slot.classList.contains('placed')) return;
            
            draggingPet = { id: petId, slot: slot };
            
            dragEl = document.createElement('div');
            dragEl.className = 'dg-entity pet';
            dragEl.style.pointerEvents = 'none';
            dragEl.style.position = 'fixed';
            dragEl.style.zIndex = '1000';
            dragEl.style.transform = 'translate(-50%, -50%)';
            dragEl.innerHTML = petSVG(petId, 32);
            document.body.appendChild(dragEl);
            
            dragEl.style.left = e.clientX + 'px';
            dragEl.style.top = e.clientY + 'px';
            
            slot.setPointerCapture(e.pointerId);
        });
        
        slot.addEventListener('pointermove', (e) => {
            if (!draggingPet || !dragEl) return;
            dragEl.style.left = e.clientX + 'px';
            dragEl.style.top = e.clientY + 'px';
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
                
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;
                if (x > rect.width / 2 - 20) x = rect.width / 2 - 20;
                if (x < 20) x = 20;
                if (y < 20) y = 20;
                if (y > rect.height - 20) y = rect.height - 20;
                
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
                    if (phase !== 'placement') return;
                    isPlacedDragging = true;
                    el.style.position = 'fixed';
                    el.style.zIndex = '1000';
                    el.style.left = ev.clientX + 'px';
                    el.style.top = ev.clientY + 'px';
                    el.setPointerCapture(ev.pointerId);
                });
                el.addEventListener('pointermove', (ev) => {
                    if (!isPlacedDragging) return;
                    el.style.left = ev.clientX + 'px';
                    el.style.top = ev.clientY + 'px';
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
                        let nx = ev.clientX - arect.left;
                        let ny = ev.clientY - arect.top;
                        if (nx > arect.width / 2 - 20) nx = arect.width / 2 - 20;
                        if (nx < 20) nx = 20;
                        if (ny < 20) ny = 20;
                        if (ny > arect.height - 20) ny = arect.height - 20;
                        
                        el.style.left = nx + 'px';
                        el.style.top = ny + 'px';
                        
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
    
    // Info Sidebar logic
    const infoBtn = All.$id('dg-info-btn');
    const infoPanel = All.$id('dg-info-panel');
    const infoList = All.$id('dg-info-list');
    const infoClose = All.$id('dg-info-close');
    
    infoBtn.addEventListener('click', () => {
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
    
    infoClose.addEventListener('click', () => {
        infoPanel.style.display = 'none';
    });

    All.$id('dg-start-btn').addEventListener('click', () => {
        if (team.length === 0) return All.toast('Chưa chọn đội hình!');
        startCombat();
    });

    All.$id('dg-leave-btn').addEventListener('click', () => {
        closeDungeonView();
    });
}

function startCombat() {
    phase = 'combat';
    All.$id('dg-dock').style.display = 'none';
    All.$id('dg-start-btn').style.display = 'none';
    All.$id('dg-leave-btn').style.display = 'none'; // hide leave during combat
    
    // Spawn enemies
    const arena = All.$id('dg-arena');
    const w = arena.clientWidth;
    const h = arena.clientHeight;
    
    // Spawn 3-5 random enemies
    const count = 3 + Math.floor(Math.random() * 3);
    for(let i=0; i<count; i++) {
        const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
        const el = document.createElement('div');
        el.className = 'dg-entity enemy flip'; // flip facing left
        el.innerHTML = `
            <div class="dg-hp-bar"><div class="dg-hp-fill"></div></div>
            ${spriteSVG(type.id, 32)}
        `;
        
        const x = w - 40 - Math.random() * 60;
        const y = 40 + Math.random() * (h - 80);
        
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        
        arena.appendChild(el);
        
        enemies.push({
            id: type.id, x, y, hp: type.hp, maxHp: type.hp, atk: type.atk,
            range: type.range, speed: type.speed, cd: 0, maxCd: type.cd, el, type: 'enemy'
        });
    }
    
    lastTime = performance.now();
    gameLoopId = requestAnimationFrame(combatLoop);
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
        endDungeon(true);
        return;
    }
    
    if (team.length === 0) {
        endDungeon(false);
        return;
    }
    
    gameLoopId = requestAnimationFrame(combatLoop);
}

function updateEntities(groupA, groupB, dt) {
    const arena = All.$id('dg-arena');
    
    groupA.forEach(a => {
        if (a.hp <= 0) return;
        
        // Cooldown tick
        if (a.cd > 0) a.cd -= dt;
        
        // Find target based on skill
        /** @type {any} */
        let closest = null;
        let minDist = Infinity;
        
        if (a.skill === 'heal') {
            let minHpPct = 1.0;
            groupA.forEach(ally => {
                if (ally.hp <= 0) return;
                const dist = Math.sqrt(Math.pow(ally.x - a.x, 2) + Math.pow(ally.y - a.y, 2));
                const hpPct = ally.hp / ally.maxHp;
                if (hpPct < minHpPct && dist < a.range * 4) { // Heal range is generous
                    minHpPct = hpPct;
                    closest = { b: ally, dx: ally.x - a.x, dy: ally.y - a.y, dist };
                }
            });
            if (!closest) { // follow someone
                groupA.forEach(ally => {
                    if (ally === a || ally.hp <= 0) return;
                    const dx = ally.x - a.x;
                    const dy = ally.y - a.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = { b: ally, dx, dy, dist };
                    }
                });
            }
        } else if (a.skill === 'assassin') {
            let maxDist = -1;
            groupB.forEach(b => {
                if (b.hp <= 0) return;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > maxDist) {
                    maxDist = dist;
                    closest = { b, dx, dy, dist };
                }
            });
        } else {
            groupB.forEach(b => {
                if (b.hp <= 0) return;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < minDist) {
                    minDist = dist;
                    closest = { b, dx, dy, dist };
                }
            });
        }
        
        if (closest) {
            // Face target
            if (closest.dx < 0 && a.type === 'pet') a.el.classList.add('flip');
            else if (closest.dx >= 0 && a.type === 'pet') a.el.classList.remove('flip');
            
            if (closest.dx > 0 && a.type === 'enemy') a.el.classList.add('flip');
            else if (closest.dx <= 0 && a.type === 'enemy') a.el.classList.remove('flip');
            
            if (closest.dist <= a.range || (a.skill === 'heal' && closest.dist <= 10)) {
                // Attack or Heal
                if (a.cd <= 0) {
                    a.cd = a.maxCd;
                    if (a.skill === 'heal') {
                        closest.b.hp = Math.min(closest.b.maxHp, closest.b.hp + a.atk);
                        const dmg = document.createElement('div');
                        dmg.className = 'dg-dmg heal';
                        dmg.textContent = '+' + a.atk;
                        dmg.style.left = closest.b.x + 'px';
                        dmg.style.top = closest.b.y + 'px';
                        arena.appendChild(dmg);
                        setTimeout(() => dmg.remove(), 800);
                    } else {
                        closest.b.hp -= a.atk;
                        const dmg = document.createElement('div');
                        dmg.className = 'dg-dmg';
                        dmg.textContent = (-a.atk).toString();
                        dmg.style.left = closest.b.x + 'px';
                        dmg.style.top = closest.b.y + 'px';
                        arena.appendChild(dmg);
                        setTimeout(() => dmg.remove(), 800);
                    }
                    
                    // Update HP bar
                    const pct = Math.max(0, closest.b.hp / closest.b.maxHp) * 100;
                    closest.b.el.querySelector('.dg-hp-fill').style.width = pct + '%';
                }
            } else {
                // Move towards target
                const speed = a.speed * dt;
                a.x += (closest.dx / closest.dist) * speed;
                a.y += (closest.dy / closest.dist) * speed;
                a.el.style.left = a.x + 'px';
                a.el.style.top = a.y + 'px';
            }
        }
    });
}

function endDungeon(isWin) {
    phase = 'end';
    stopCombatLoop();
    
    const arena = All.$id('dg-arena');
    const overlay = document.createElement('div');
    overlay.className = 'dg-overlay';
    
    let rewardText = '';
    if (isWin) {
        const coins = 500 + Math.floor(Math.random() * 500);
        ctx.S.coins += coins;
        All.save();
        All.renderStatus();
        rewardText = `<div style="color:white; font-size: 16px;">Phần thưởng: ${spriteSVG('coin', 16).replace('display:block', 'display:inline-block; vertical-align:middle; margin-top:-2px')} ${coins} G</div>`;
    }
    
    overlay.innerHTML = `
        <div class="dg-title">${isWin ? 'Chiến Thắng!' : 'Thất Bại...'}</div>
        ${rewardText}
        <div class="buy" id="dg-finish-btn" style="margin-top: 10px;">Thoát Hầm Ngục</div>
    `;
    
    arena.appendChild(overlay);
    
    overlay.querySelector('#dg-finish-btn').addEventListener('click', () => {
        closeDungeonView();
    });
}
