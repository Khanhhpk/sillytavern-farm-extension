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
    slime: { hp: 100, atk: 10, range: 40, speed: 40, cd: 1 },
    octo: { hp: 80, atk: 15, range: 60, speed: 50, cd: 0.8 },
    slimePink: { hp: 120, atk: 8, range: 40, speed: 35, cd: 1.2 },
    octoCream: { hp: 90, atk: 12, range: 60, speed: 45, cd: 0.9 },
    bunny: { hp: 70, atk: 20, range: 120, speed: 60, cd: 1.5 }, // ranged
    ghostBlob: { hp: 60, atk: 25, range: 80, speed: 70, cd: 1 }, // assassin
    // defaults
    default: { hp: 100, atk: 10, range: 40, speed: 40, cd: 1 }
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
        <div class="dg-arena" id="dg-arena"></div>
        <div style="display:flex; justify-content:center; margin-top: 5px;">
            <div class="buy" id="dg-start-btn">Bắt Đầu Trận Chiến</div>
            <div class="buy plain" id="dg-leave-btn" style="margin-left: 10px;">Thoát</div>
        </div>
        <div class="dg-dock" id="dg-dock"></div>
    `;

    const arena = All.$id('dg-arena');
    const dock = All.$id('dg-dock');

    // Render available pets
    ctx.S.pets.forEach(petId => {
        const slot = document.createElement('div');
        slot.className = 'dg-slot';
        slot.innerHTML = petSVG(petId, 32);
        slot.dataset.pet = petId;
        
        slot.addEventListener('click', () => {
            if (phase !== 'placement') return;
            if (team.length >= 4) { All.toast('Tối đa 4 thành viên!'); return; }
            if (slot.classList.contains('placed')) return;
            
            slot.classList.add('placed');
            
            // Add to arena
            const stat = PET_STATS[petId] || PET_STATS.default;
            const el = document.createElement('div');
            el.className = 'dg-entity pet';
            el.innerHTML = `
                <div class="dg-hp-bar"><div class="dg-hp-fill"></div></div>
                ${petSVG(petId, 32)}
            `;
            // Random placement position on left side
            const x = 40 + Math.random() * 60;
            const y = 40 + Math.random() * (arena.clientHeight - 80);
            
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            
            arena.appendChild(el);
            
            team.push({
                id: petId, x, y, hp: stat.hp, maxHp: stat.hp, atk: stat.atk,
                range: stat.range, speed: stat.speed, cd: 0, maxCd: stat.cd, el, type: 'pet',
                dockSlot: slot
            });
        });
        
        dock.appendChild(slot);
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
        
        // Find closest enemy
        /** @type {any} */
        let closest = null;
        let minDist = Infinity;
        
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
        
        if (closest) {
            // Face target
            if (closest.dx < 0 && a.type === 'pet') a.el.classList.add('flip');
            else if (closest.dx >= 0 && a.type === 'pet') a.el.classList.remove('flip');
            
            if (closest.dx > 0 && a.type === 'enemy') a.el.classList.add('flip');
            else if (closest.dx <= 0 && a.type === 'enemy') a.el.classList.remove('flip');
            
            if (closest.dist <= a.range) {
                // Attack!
                if (a.cd <= 0) {
                    closest.b.hp -= a.atk;
                    a.cd = a.maxCd;
                    
                    // Show dmg text
                    const dmg = document.createElement('div');
                    dmg.className = 'dg-dmg';
                    dmg.textContent = (-a.atk).toString();
                    dmg.style.left = closest.b.x + 'px';
                    dmg.style.top = closest.b.y + 'px';
                    arena.appendChild(dmg);
                    setTimeout(() => dmg.remove(), 800);
                    
                    // Update HP bar
                    const pct = Math.max(0, closest.b.hp / closest.b.maxHp) * 100;
                    closest.b.el.querySelector('.dg-hp-fill').style.width = pct + '%';
                }
            } else {
                // Move towards
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
        rewardText = `<div style="color:white; font-size: 16px;">Phần thưởng: ${spriteSVG('coin', 16)} ${coins} G</div>`;
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
