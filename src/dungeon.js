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
    peach_soda: { name: 'Soda Đào', desc: 'Đánh xa xuyên thấu mọi kẻ địch trên đường bay.', hp: 90, atk: 18, range: 100, speed: 45, cd: 1.2, skill: 'pierce' },
    octoCream: { name: 'Bạch Tuộc Kem', desc: '20% tỷ lệ làm choáng kẻ địch 1 giây.', hp: 150, atk: 12, range: 60, speed: 45, cd: 1.5, skill: 'stun' },
    jellyfish: { name: 'Sứa Xoăn', desc: 'Xạ thủ: Bắn càng xa sát thương càng lớn.', hp: 70, atk: 25, range: 150, speed: 60, cd: 1.5, skill: 'sniper' },
    mystery_blob: { name: 'Bé Bí Ẩn', desc: 'Hồi máu cho bản thân bằng 50% sát thương gây ra.', hp: 85, atk: 14, range: 50, speed: 55, cd: 1.1, skill: 'lifesteal' },
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
    { id: 'douya', name: 'Giá Đỗ', desc: 'Lính bầy đàn.', hp: 40, atk: 8, range: 40, speed: 45, cd: 0.8, ai: 'melee', sp: 'sprout' },
    { id: 'tomato', name: 'Cà Chua Tròn', desc: 'Cận chiến cơ bản.', hp: 80, atk: 12, range: 40, speed: 30, cd: 1, ai: 'melee' },
    { id: 'radish', name: 'Củ Cải Tốc Độ', desc: 'Chạy cực nhanh.', hp: 50, atk: 8, range: 30, speed: 70, cd: 0.5, ai: 'melee' },
    { id: 'moonberry', name: 'Dâu Tây Gai', desc: 'Thích khách tập kích.', hp: 60, atk: 20, range: 40, speed: 60, cd: 1, ai: 'assassin', sp: 'moonberry' },
    { id: 'chuncai', name: 'Rau Thuần', desc: 'Đeo bám dai dẳng.', hp: 120, atk: 10, range: 40, speed: 25, cd: 1.2, ai: 'melee' },
    { id: 'lingjiao', name: 'Củ Ấu Giáp', desc: 'Cận chiến có giáp.', hp: 150, atk: 14, range: 40, speed: 20, cd: 1.5, ai: 'melee' },
    { id: 'pumpkin', name: 'Bí Ngô Khổng Lồ', desc: 'Tanker chậm chạp.', hp: 300, atk: 25, range: 50, speed: 15, cd: 2, ai: 'tank' },
    { id: 'fangW', name: 'Hoa Bá Vương', desc: 'Pháp sư bắn từ xa.', hp: 70, atk: 18, range: 120, speed: 20, cd: 1.5, ai: 'ranged' },
    { id: 'starbush', name: 'Bụi Sao', desc: 'Xạ thủ 3 tia.', hp: 80, atk: 15, range: 140, speed: 25, cd: 1.5, ai: 'ranged', skill: 'multishot' },
    { id: 'opalvine', name: 'Dây Leo Opal', desc: 'Trói chân đối thủ.', hp: 110, atk: 12, range: 90, speed: 20, cd: 1.2, ai: 'ranged', skill: 'root' },
    { id: 'lianou', name: 'Củ Sen Khổng Lồ', desc: 'Ném bùn từ xa.', hp: 250, atk: 15, range: 100, speed: 15, cd: 2, ai: 'ranged' },
    { id: 'dragoncry', name: 'Long Tinh', desc: 'Boss: Cực khỏe.', hp: 600, atk: 40, range: 60, speed: 20, cd: 2, ai: 'tank', skill: 'cleave', elite: true },
    { id: 'pumpkin', name: 'Vua Bí Ngô', desc: 'Boss: Tank AoE slam.', hp: 800, atk: 35, range: 50, speed: 15, cd: 2.5, ai: 'tank', skill: 'cleave', elite: true, sp: 'pumpkin' },
    { id: 'fangW', name: 'Phù Thủy Hoa', desc: 'Boss: Pháo đài bắn xa.', hp: 400, atk: 45, range: 160, speed: 18, cd: 1.8, ai: 'ranged', skill: 'multishot', elite: true, sp: 'fangW' }
];

export function openDungeonView() {
    isDungeonOpen = true;
    
    // Change Title
    const titleH1 = All.$id('drag').querySelector('h1');
    titleH1.innerHTML = `${spriteSVG('dungeonGate', 16)}Ai mà thèm đi Dungeon chứ!`;

    // Hide Farm Elements
    All.$id('blocks').style.display = 'none';
    All.$id('explore-blocks').style.display = 'none';
    All.$id('pager').style.display = 'none';
    All.$id('toolbar').style.display = 'none';
    All.$id('mascots').style.display = 'none';
    All.$id('viewToggle').style.display = 'none';
    const ctrlrow = All.sh.querySelector('.ctrlrow');
    if (ctrlrow) ctrlrow.style.display = 'none';
    const banner = All.$id('banner');
    if (banner) banner.style.display = 'none';

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

    // Hide Dungeon View
    All.dungeonView.style.display = 'none';
    All.dungeonView.innerHTML = '';
    
    const fieldEl = All.$id('scroll').querySelector('.field');
    if (fieldEl) fieldEl.style.minHeight = '';

    // Restore view toggle
    All.$id('viewToggle').style.display = '';

    // Restore all visibility based on current view state
    All.applyPageSkin();
    All.applyViewState();
    All.renderPager();
    All.renderPlots();
    All.renderToolbar();
}

function initPlacementPhase() {
    phase = 'placement';
    team = [];
    enemies = [];
    projectiles = [];
    currentWave = 1;
    totalGold = 0;
    
    const best = ctx.S.dungeonBest || { wave: 0, gold: 0 };
    const bestHtml = best.wave > 0 ? `<div style="color:#b08a5c; font-size:12px; text-align:center; margin-top:4px;">🏆 Kỷ lục: Wave ${best.wave} · ${best.gold} G</div>` : '';

    All.dungeonView.innerHTML = `
        <div class="dg-arena" id="dg-arena">
            <div class="dg-hud" id="dg-hud" style="display:none;"></div>
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
        <div style="display:flex; justify-content:center; margin-top: 5px; flex-wrap:wrap;">
            <div class="buy" id="dg-start-btn">Bắt Đầu Trận Chiến</div>
            <div class="buy plain" id="dg-leave-btn" style="margin-left: 10px;">Thoát</div>
            <div class="buy plain" id="dg-surrender-btn" style="margin-left: 10px; display:none; background: #e06578; color: white;">Kết Thúc Sớm</div>
            <div class="buy plain" id="dg-info-btn" style="margin-left: 10px; width: 32px; padding: 0; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:18px; color:black;" title="Thông tin Thú cưng">?</div>
            <div class="buy plain" id="dg-codex-btn" style="margin-left: 10px; padding: 0 10px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:14px; color:#e06578;" title="Từ điển quái">Quái Vật</div>
        </div>
        ${bestHtml}
        <div class="dg-dock" id="dg-dock"></div>
    `;

    const arena = All.$id('dg-arena');
    const dock = All.$id('dg-dock');

    dock.innerHTML = `
        <div id="dg-nav-left" style="font-size: 24px; font-weight: bold; color: #d9ba8a; cursor: pointer; user-select: none; padding: 0 5px; touch-action: manipulation; opacity: 0.3;">◀</div>
        <div style="flex:1; overflow:hidden; height: 100%; display: flex; align-items: center; position: relative;">
            <div id="dg-slots-container" style="display: flex; gap: 10px; transition: transform 0.3s ease; position: absolute; left: 0;"></div>
        </div>
        <div id="dg-nav-right" style="font-size: 24px; font-weight: bold; color: #d9ba8a; cursor: pointer; user-select: none; padding: 0 5px; touch-action: manipulation;">▶</div>
    `;

    const slotsContainer = All.$id('dg-slots-container');
    const navLeft = All.$id('dg-nav-left');
    const navRight = All.$id('dg-nav-right');
    const dockWrapper = navLeft.nextElementSibling;

    let dockPage = 0;

    function updateDockNav() {
        if (!dockWrapper) return;
        const w = dockWrapper.clientWidth || 250;
        const itemsPerPage = Math.max(1, Math.floor(w / 54));
        const maxPage = Math.max(0, Math.ceil(ctx.S.pets.length / itemsPerPage) - 1);
        if (dockPage > maxPage) dockPage = maxPage;
        
        navLeft.style.opacity = dockPage > 0 ? '1' : '0.3';
        navRight.style.opacity = dockPage < maxPage ? '1' : '0.3';
        const offset = dockPage * itemsPerPage * 54; 
        slotsContainer.style.transform = `translateX(-${offset}px)`;
    }

    navLeft.addEventListener('pointerdown', (e) => { e.preventDefault(); if (dockPage > 0) { dockPage--; updateDockNav(); } });
    navRight.addEventListener('pointerdown', (e) => { 
        e.preventDefault(); 
        const w = dockWrapper.clientWidth || 250;
        const itemsPerPage = Math.max(1, Math.floor(w / 54));
        const maxPage = Math.max(0, Math.ceil(ctx.S.pets.length / itemsPerPage) - 1);
        if (dockPage < maxPage) { dockPage++; updateDockNav(); } 
    });
    
    if (window.ResizeObserver) {
        new ResizeObserver(() => updateDockNav()).observe(dockWrapper);
    } else {
        updateDockNav();
    }

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
            dragEl.innerHTML = petSVG(petId, 32);
            document.body.appendChild(dragEl); // append to body to avoid transform/overflow issues
            
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
                    el.style.zIndex = '100000';
                    const arect = arena.getBoundingClientRect();
                    el.style.left = (ev.clientX - arect.left - 16) + 'px';
                    el.style.top = (ev.clientY - arect.top - 16) + 'px';
                    el.setPointerCapture(ev.pointerId);
                });
                el.addEventListener('pointermove', (ev) => {
                    if (!isPlacedDragging) return;
                    const arect = arena.getBoundingClientRect();
                    el.style.left = (ev.clientX - arect.left - 16) + 'px';
                    el.style.top = (ev.clientY - arect.top - 16) + 'px';
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
        
        slotsContainer.appendChild(slot);
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
                    <div class="dg-info-item-icon">${spriteSVG(stat.sp || stat.id, 32)}</div>
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

    All.$id('dg-surrender-btn').addEventListener('click', () => {
        endDungeon(false);
    });
}

let fullTeam = [];

function startCombat() {
    phase = 'combat';
    All.$id('dg-dock').style.display = 'none';
    All.$id('dg-start-btn').style.display = 'none';
    All.$id('dg-leave-btn').style.display = 'none'; // hide leave during combat
    All.$id('dg-surrender-btn').style.display = 'block'; // show surrender
    
    currentWave = 1;
    totalGold = 0;
    fullTeam = [...team]; // Snapshot the current team
    
    startWave();
}

function updateHUD() {
    const hud = All.$id('dg-hud');
    if (!hud) return;
    const isBoss = currentWave % 10 === 0;
    hud.style.display = 'block';
    hud.innerHTML = `<span style="color:#ffd94d; font-weight:bold;">Wave ${currentWave}</span>${isBoss ? ' 👑' : ''} <span style="color:#a4dc8c; margin-left:10px;">${spriteSVG('coin', 12).replace('display:block','display:inline-block;vertical-align:middle')} ${totalGold} G</span>`;
}

function startWave() {
    const isBossWave = currentWave % 10 === 0;
    
    if (isBossWave) {
        // Show boss warning banner
        phase = 'end'; // pause briefly
        const arena = All.$id('dg-arena');
        const banner = document.createElement('div');
        banner.className = 'dg-boss-banner';
        banner.innerHTML = '⚠ BOSS WAVE ⚠';
        arena.appendChild(banner);
        setTimeout(() => {
            banner.remove();
            _doStartWave();
        }, 2000);
    } else {
        _doStartWave();
    }
}

function _doStartWave() {
    phase = 'combat';
    enemies = [];
    projectiles = [];
    const arena = All.$id('dg-arena');
    const w = arena.clientWidth;
    const h = arena.clientHeight;
    
    updateHUD();
    
    // Calculate enemies based on wave
    let count = Math.min(10, 2 + Math.floor(currentWave * 0.6));
    let spawnElite = currentWave % 3 === 0;
    let isBossWave = currentWave % 10 === 0;
    
    if (isBossWave) {
        count = Math.max(3, Math.floor(count / 2));
    }
    
    for(let i=0; i<count; i++) {
        let type;
        if ((spawnElite && i === 0) || (isBossWave && i === 0)) {
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
            ${spriteSVG(type.sp || type.id, 32)}
        `;
        
        // Spawn anywhere in the arena
        const x = 20 + Math.random() * (w - 60);
        const y = 40 + Math.random() * (h - 80);
        
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        
        arena.appendChild(el);
        
        // Scale hp and atk based on wave (exponential after wave 10)
        let hpMultiplier = 1 + (currentWave - 1) * 0.15;
        let atkMultiplier = 1 + (currentWave - 1) * 0.1;
        if (currentWave > 10) {
            const extra = currentWave - 10;
            hpMultiplier *= Math.pow(1.05, extra);
            atkMultiplier *= Math.pow(1.02, extra);
        }
        if (isBossWave) {
            hpMultiplier *= 2;
            atkMultiplier *= 1.5;
        }
        
        enemies.push({
            id: type.id, x, y, 
            hp: Math.round(type.hp * hpMultiplier), 
            maxHp: Math.round(type.hp * hpMultiplier), 
            atk: Math.round(type.atk * atkMultiplier),
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
    amount = Math.round(amount);
    const arena = All.$id('dg-arena');
    const dmg = document.createElement('div');
    dmg.className = 'dg-dmg' + (type ? ' ' + type : '');
    dmg.textContent = type === 'miss' ? 'MISS!' : (amount > 0 ? '+' : '') + amount;
    dmg.style.left = target.x + 'px';
    dmg.style.top = target.y + 'px';
    arena.appendChild(dmg);
    setTimeout(() => dmg.remove(), 800);
    
    const pct = Math.max(0, target.hp / target.maxHp) * 100;
    target.el.querySelector('.dg-hp-fill').style.width = pct + '%';
}

function applyEffect(attacker, target, myGroup, enemyGroup, overrideAtk, skillOverride) {
    const atk = Math.round(overrideAtk || attacker.atk);
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
    
    // Dodge check (pets only)
    if (target.type === 'pet') {
        const dodgeChance = target.id === 'ghostBlob' ? 0.15 : 0.05;
        if (Math.random() < dodgeChance) {
            spawnDmg(target, 0, 'miss');
            target.incomingDmg = Math.max(0, (target.incomingDmg || 0) - atk);
            return;
        }
    }
    
    // Base damage
    let finalDmg = atk;
    let isCrit = false;
    
    if (attacker && attacker.type === 'pet') {
        const critChance = attacker.critRate || 0.15;
        if (Math.random() < critChance) {
            finalDmg = Math.round(finalDmg * 1.5);
            isCrit = true;
        }
    }
    
    // Armor reduction
    if (target.armor && target.armor > 0) {
        finalDmg = Math.round(finalDmg * (1 - target.armor));
    }
    
    if (skill === 'sniper' && attacker) {
        const dist = Math.hypot(target.x - attacker.x, target.y - attacker.y);
        finalDmg += Math.floor(dist * 0.2); // extra damage based on distance
    }
    
    target.hp -= finalDmg;
    target.incomingDmg = Math.max(0, (target.incomingDmg || 0) - finalDmg);
    spawnDmg(target, -finalDmg, isCrit ? 'crit' : '');
    
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
            let validTargets = targetGroup.filter(b => b.hp > 0 && (b.hp - (b.incomingDmg || 0) > 0));
            if (validTargets.length === 0) validTargets = targetGroup.filter(b => b.hp > 0);
            validTargets.forEach(b => {
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.hypot(dx, dy);
                if (dist > maxDist) {
                    maxDist = dist;
                    closest = { b, dx, dy, dist };
                }
            });
        } else {
            let validTargets = targetGroup.filter(b => b.hp > 0 && (b.hp - (b.incomingDmg || 0) > 0));
            if (validTargets.length === 0) validTargets = targetGroup.filter(b => b.hp > 0);
            validTargets.forEach(b => {
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
                        closest.b.incomingDmg = (closest.b.incomingDmg || 0) + a.atk;
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
                                target2.incomingDmg = (target2.incomingDmg || 0) + a.atk * 0.5;
                                let p2 = {...p, tx: target2.x, ty: target2.y-16, target: target2, atk: a.atk*0.5, el: p.el.cloneNode(true)};
                                arena.appendChild(p2.el); projectiles.push(p2);
                            }
                            if (target3 && target3 !== p.target && target3 !== target2) {
                                target3.incomingDmg = (target3.incomingDmg || 0) + a.atk * 0.5;
                                let p3 = {...p, tx: target3.x, ty: target3.y-16, target: target3, atk: a.atk*0.5, el: p.el.cloneNode(true)};
                                arena.appendChild(p3.el); projectiles.push(p3);
                            }
                        } else {
                            projectiles.push(p);
                        }
                    } else {
                        closest.b.incomingDmg = (closest.b.incomingDmg || 0) + a.atk;
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
    
    const surrenderBtn = All.$id('dg-surrender-btn');
    if (surrenderBtn) surrenderBtn.style.display = 'none';
    
    const arena = All.$id('dg-arena');
    const overlay = document.createElement('div');
    overlay.className = 'dg-overlay';
    
    ctx.S.coins += totalGold;
    
    // Highscore check
    if (!ctx.S.dungeonBest) ctx.S.dungeonBest = { wave: 0, gold: 0 };
    let isNewRecord = false;
    if (currentWave > ctx.S.dungeonBest.wave) {
        ctx.S.dungeonBest.wave = currentWave;
        ctx.S.dungeonBest.gold = totalGold;
        isNewRecord = true;
    } else if (currentWave === ctx.S.dungeonBest.wave && totalGold > ctx.S.dungeonBest.gold) {
        ctx.S.dungeonBest.gold = totalGold;
        isNewRecord = true;
    }
    
    All.save();
    All.renderStatus();
    let rewardText = `<div style="color:white; font-size: 16px;">Phần thưởng: ${spriteSVG('coin', 16).replace('display:block', 'display:inline-block; vertical-align:middle; margin-top:-2px')} ${totalGold} G<br/>Sống sót đến Wave ${currentWave}</div>`;
    const recordHtml = isNewRecord ? '<div class="dg-new-record">🏆 KỶ LỤC MỚI! 🏆</div>' : `<div style="color:#b08a5c; font-size:13px;">Kỷ lục: Wave ${ctx.S.dungeonBest.wave} · ${ctx.S.dungeonBest.gold} G</div>`;
    
    overlay.innerHTML = `
        <div class="dg-title">Game Over</div>
        ${rewardText}
        ${recordHtml}
        <div style="display:flex; justify-content:center; gap: 10px; margin-top: 15px;">
            <div class="buy" id="dg-restart-btn">Chơi Lại</div>
            <div class="buy plain" id="dg-finish-btn">Thoát</div>
        </div>
    `;
    
    arena.appendChild(overlay);
    
    overlay.querySelector('#dg-restart-btn').addEventListener('click', () => {
        initPlacementPhase();
    });
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
    const isBoss = currentWave % 10 === 0;
    const waveGold = (100 + currentWave * 50) * (isBoss ? 3 : 1);
    totalGold += waveGold;
    
    const arena = All.$id('dg-arena');
    fullTeam.forEach(p => {
        if (p.hp <= 0) {
            p.hp = p.maxHp * 0.5; // Revive
            arena.appendChild(p.el);
        } else {
            p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.2); // Heal living by 20%
        }
        const pct = Math.max(0, p.hp / p.maxHp) * 100;
        p.el.querySelector('.dg-hp-fill').style.width = pct + '%';
        // clear status
        p.status = {};
    });
    team = [...fullTeam]; // Restore full team active status
    
    const overlay = document.createElement('div');
    overlay.className = 'dg-overlay';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
    
    const allRewards = [
        { id: 'heal', name: 'Hồi Máu', desc: 'Hồi 100% HP cho toàn đội', color: '#4caf50' },
        { id: 'buff', name: 'Cường Hóa', desc: 'Tăng ngẫu nhiên 10-30% HP hoặc ATK cho toàn đội', color: '#2196f3' },
        { id: 'ascend', name: 'Thăng Hoa', desc: 'Chọn 1 Pet để x1.5 Chỉ Số', color: '#9c27b0' },
        { id: 'gold', name: 'Kho Báu', desc: `Nhận thêm ${waveGold * 2} G ngay lập tức`, color: '#ffeb3b' },
        { id: 'blood', name: 'Huyết Chiến', desc: 'Giảm 20% HP tối đa của toàn đội nhưng tăng 50% ATK', color: '#f44336' },
        { id: 'steel', name: 'Bức Tường Thép', desc: 'Tăng 50% HP tối đa nhưng giảm 10% ATK', color: '#607d8b' },
        { id: 'speed', name: 'Tốc Chiến', desc: 'Tăng 30% tốc đánh cho toàn đội', color: '#00bcd4' },
        { id: 'armor', name: 'Hộ Giáp', desc: 'Giảm 20% sát thương nhận vào cho toàn đội', color: '#78909c' },
        { id: 'ambush', name: 'Phục Kích', desc: 'Tăng tỷ lệ chí mạng lên 30% cho toàn đội', color: '#ff5722' }
    ];
    
    // Pick 3 random
    const shuffled = allRewards.sort(() => 0.5 - Math.random());
    const choices = shuffled.slice(0, 3);
    
    let cardsHtml = '';
    choices.forEach(c => {
        cardsHtml += `
            <div class="dg-reward-card" id="rew-${c.id}" style="border-top: 4px solid ${c.color}">
                <h4>${c.name}</h4>
                <p>${c.desc}</p>
            </div>
        `;
    });

    let bossDropHtml = '';
    if (isBoss) {
        if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
        const r = Math.random();
        let dropText = '';
        if (r < 0.01) {
            ctx.S.tickets.super = (ctx.S.tickets.super || 0) + 1;
            dropText = '1 Vé Siêu Cường';
        } else if (r < 0.40) {
            ctx.S.tickets.spec = (ctx.S.tickets.spec || 0) + 2;
            dropText = '2 Vé Đặc Biệt';
        } else {
            ctx.S.tickets.norm = (ctx.S.tickets.norm || 0) + 3;
            dropText = '3 Vé Thường';
        }
        bossDropHtml = `<div style="color:#4caf50; margin-bottom:15px; font-weight:bold; font-size:16px;">✨ Rơi ra từ Boss: ${dropText}! ✨</div>`;
        All.save();
    }

    overlay.innerHTML = `
        <div class="dg-title" style="color: #ffda66;">Wave ${currentWave} Hoàn Thành!</div>
        <div style="color:white; margin-bottom: 10px;">Nhận được ${waveGold} G (Tổng: ${totalGold} G)</div>
        ${bossDropHtml}
        <div style="display:flex; gap: 15px; flex-wrap:wrap; justify-content:center;">
            ${cardsHtml}
        </div>
    `;
    arena.appendChild(overlay);
    choices.forEach(c => {
        overlay.querySelector('#rew-' + c.id).onclick = () => {
            if (c.id === 'heal') {
                fullTeam.forEach(p => p.hp = p.maxHp);
                nextWaveSequence(overlay);
            }
            else if (c.id === 'buff') {
                const isAtk = Math.random() > 0.5;
                const amt = 1.1 + Math.random() * 0.2; // 10-30%
                fullTeam.forEach(p => {
                    if (isAtk) p.atk = Math.round(p.atk * amt);
                    else { p.maxHp = Math.round(p.maxHp * amt); p.hp = Math.round(p.hp * amt); }
                });
                nextWaveSequence(overlay);
            }
            else if (c.id === 'ascend') {
                overlay.innerHTML = '<div class="dg-title">Chọn 1 Pet Thăng Hoa</div><div id="dg-pet-select" style="display:flex; gap: 10px; margin-top:20px; flex-wrap:wrap; justify-content:center;"></div>';
                const selectContainer = overlay.querySelector('#dg-pet-select');
                fullTeam.forEach((p) => {
                    const btn = document.createElement('div');
                    btn.className = 'dg-reward-card';
                    btn.style.width = '80px';
                    btn.innerHTML = petSVG(p.id, 48);
                    btn.onclick = () => {
                        p.maxHp = Math.round(p.maxHp * 1.5); 
                        p.hp = p.maxHp; 
                        p.atk = Math.round(p.atk * 1.5);
                        nextWaveSequence(overlay);
                    };
                    selectContainer.appendChild(btn);
                });
            }
            else if (c.id === 'gold') {
                totalGold += waveGold * 2;
                nextWaveSequence(overlay);
            }
            else if (c.id === 'blood') {
                fullTeam.forEach(p => {
                    p.maxHp = Math.round(p.maxHp * 0.8);
                    p.hp = Math.min(p.hp, p.maxHp);
                    p.atk = Math.round(p.atk * 1.5);
                });
                nextWaveSequence(overlay);
            }
            else if (c.id === 'steel') {
                fullTeam.forEach(p => {
                    p.maxHp = Math.round(p.maxHp * 1.5);
                    p.hp = Math.round(p.hp * 1.5);
                    p.atk = Math.round(p.atk * 0.9);
                });
                nextWaveSequence(overlay);
            }
            else if (c.id === 'speed') {
                fullTeam.forEach(p => {
                    p.maxCd = Math.round(p.maxCd * 70) / 100; // reduce by 30%
                });
                nextWaveSequence(overlay);
            }
            else if (c.id === 'armor') {
                fullTeam.forEach(p => {
                    p.armor = Math.min(0.6, (p.armor || 0) + 0.2); // cap at 60%
                });
                nextWaveSequence(overlay);
            }
            else if (c.id === 'ambush') {
                fullTeam.forEach(p => {
                    p.critRate = Math.min(0.6, (p.critRate || 0.15) + 0.15); // +15%, cap 60%
                });
                nextWaveSequence(overlay);
            }
        };
    });
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
