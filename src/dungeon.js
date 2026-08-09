import { ctx } from './store.js';
import * as All from './all.js';
import { petSVG, spriteSVG } from './graphics.js';

export let isDungeonOpen = false;
let phase = 'placement'; // 'placement', 'combat', 'end'
let gameLoopId = null;
let lastTime = 0;

let team = []; // Currently placed pets
let enemies = []; // Spawned enemies
let projectiles = []; // Active projectiles

let currentWave = 1;
let totalGold = 0;
let shopGold = 0;

const PET_STATS = {
    slime: { name: 'Slime Xanh', desc: 'Chiến binh cân bằng, không có gì nổi bật.', hp: 130, atk: 12, range: 40, speed: 40, cd: 1 },
    octo: { name: 'Bạch Tuộc', desc: 'Đánh nhanh thắng nhanh. Đánh càng lâu tốc đánh càng cao.', hp: 100, atk: 18, range: 60, speed: 50, cd: 0.8, skill: 'frenzy' },
    slimePink: { name: 'Slime Hồng', desc: 'Hồi máu đơn mục tiêu cho đồng minh yếu nhất.', hp: 150, atk: 18, range: 80, speed: 35, cd: 1.5, skill: 'heal' },
    peach_soda: { name: 'Soda Đào', desc: 'Đánh xa xuyên thấu mọi kẻ địch trên đường bay.', hp: 110, atk: 22, range: 100, speed: 45, cd: 1.2, skill: 'pierce' },
    octoCream: { name: 'Bạch Tuộc Kem', desc: '20% tỷ lệ làm choáng kẻ địch 1 giây.', hp: 180, atk: 15, range: 60, speed: 45, cd: 1.5, skill: 'stun' },
    jellyfish: { name: 'Sứa Xoăn', desc: 'Xạ thủ: Bắn càng xa sát thương càng lớn.', hp: 90, atk: 30, range: 150, speed: 60, cd: 1.5, skill: 'sniper' },
    mystery_blob: { name: 'Bé Bí Ẩn', desc: 'Hồi máu cho bản thân bằng 50% sát thương gây ra.', hp: 110, atk: 18, range: 50, speed: 55, cd: 1.1, skill: 'lifesteal' },
    ghostBlob: { name: 'Ma Trắng', desc: 'Sát thủ: Luôn nhắm vào kẻ thù xa nhất.', hp: 80, atk: 45, range: 40, speed: 100, cd: 1.2, skill: 'assassin' },
    impBlob: { name: 'Quỷ Nhỏ', desc: 'Đánh lan: Gây sát thương AoE xung quanh mục tiêu.', hp: 70, atk: 50, range: 40, speed: 60, cd: 1, skill: 'cleave' },
    angelBlob: { name: 'Thiên Thần', desc: 'Hồi máu diện rộng cho các đồng minh lân cận.', hp: 140, atk: 12, range: 80, speed: 40, cd: 1.2, skill: 'aoe_heal' },
    starBell: { name: 'Chuông Sao', desc: 'Tăng 20% sát thương cho đồng minh lân cận.', hp: 120, atk: 15, range: 90, speed: 40, cd: 1, skill: 'buff_atk' },
    cloudMallow: { name: 'Kẹo Dẻo Mây', desc: 'Khiêu khích: Buộc kẻ địch tấn công mình.', hp: 250, atk: 10, range: 40, speed: 30, cd: 2, skill: 'taunt' },
    dewSprout: { name: 'Mầm Sương', desc: '25% tỷ lệ trói chân kẻ địch trong 2 giây.', hp: 130, atk: 18, range: 50, speed: 45, cd: 1.2, skill: 'root' },
    prismBlob: { name: 'Lăng Kính', desc: 'Bắn 3 tia sáng cùng lúc (sát thương chia nửa).', hp: 100, atk: 25, range: 140, speed: 40, cd: 1.4, skill: 'multishot' },
    penguin: { name: 'Cánh Cụt', desc: 'Đòn đánh làm giảm tốc độ di chuyển và tốc đánh.', hp: 150, atk: 20, range: 45, speed: 50, cd: 1, skill: 'freeze' },
    default: { name: 'Pet Vô Danh', desc: 'Không có kỹ năng đặc biệt.', hp: 130, atk: 12, range: 40, speed: 40, cd: 1 }
};

const ENEMY_TYPES = [
    { id: 'douya', name: 'Mầm Non', desc: 'Lính bầy đàn.', hp: 40, atk: 8, range: 40, speed: 45, cd: 0.8, ai: 'melee', sp: 'sprout', gold: 2 },
    { id: 'tomato', name: 'Cà Chua Tròn', desc: 'Cận chiến cơ bản.', hp: 80, atk: 12, range: 40, speed: 30, cd: 1, ai: 'melee', gold: 4 },
    { id: 'radish', name: 'Củ Cải Tốc Độ', desc: 'Chạy cực nhanh.', hp: 50, atk: 8, range: 30, speed: 70, cd: 0.5, ai: 'melee', gold: 3 },
    { id: 'moonberry', name: 'Dâu Tây Gai', desc: 'Thích khách tập kích.', hp: 60, atk: 20, range: 40, speed: 60, cd: 1, ai: 'assassin', sp: 'moonberry', gold: 5 },
    { id: 'chuncai', name: 'Rau Thuần', desc: 'Đeo bám dai dẳng.', hp: 120, atk: 10, range: 40, speed: 25, cd: 1.2, ai: 'melee', gold: 6 },
    { id: 'lingjiao', name: 'Củ Ấu Giáp', desc: 'Cận chiến có giáp.', hp: 150, atk: 14, range: 40, speed: 20, cd: 1.5, ai: 'melee', gold: 8 },
    { id: 'pumpkin', name: 'Bí Ngô Khổng Lồ', desc: 'Tanker chậm chạp.', hp: 250, atk: 20, range: 50, speed: 15, cd: 3, ai: 'tank', gold: 15 },
    { id: 'fangW', name: 'Hoa Bá Vương', desc: 'Pháp sư bắn từ xa.', hp: 70, atk: 18, range: 120, speed: 20, cd: 1.5, ai: 'ranged', gold: 8 },
    { id: 'starbush', name: 'Bụi Sao', desc: 'Xạ thủ 3 tia.', hp: 80, atk: 8, range: 140, speed: 25, cd: 1.5, ai: 'ranged', skill: 'multishot', gold: 10 },
    { id: 'opalvine', name: 'Dây Leo Opal', desc: 'Trói chân đối thủ.', hp: 110, atk: 12, range: 90, speed: 20, cd: 1.2, ai: 'ranged', skill: 'root', gold: 12 },
    { id: 'lianou', name: 'Củ Sen Khổng Lồ', desc: 'Ném bùn từ xa.', hp: 250, atk: 15, range: 100, speed: 15, cd: 2, ai: 'ranged', gold: 20 },
    { id: 'dragoncry', name: 'Long Tinh', desc: 'Boss: Cực khỏe.', hp: 600, atk: 40, range: 60, speed: 20, cd: 2, ai: 'tank', skill: 'cleave', elite: true, gold: 100 },
    { id: 'pumpkin', name: 'Vua Bí Ngô', desc: 'Boss: Tank AoE slam.', hp: 800, atk: 35, range: 50, speed: 15, cd: 2.5, ai: 'tank', skill: 'cleave', elite: true, sp: 'pumpkin', gold: 150 },
    { id: 'fangW', name: 'Phù Thủy Hoa', desc: 'Boss: Pháo đài bắn xa.', hp: 400, atk: 45, range: 160, speed: 18, cd: 1.8, ai: 'ranged', skill: 'multishot', elite: true, sp: 'fangW', gold: 120 }
];

export function openDungeonView() {
    isDungeonOpen = true;
    All.closeWin(); // Đóng bảng Farm chính
    
    // Show Dungeon Modal
    const dungeonWin = All.$id('dungeon-win');
    if (dungeonWin) {
        dungeonWin.style.display = 'flex';
        All.placeDungeonWin();
        // Xóa class animate để tránh nhấp nháy, sau đó thêm lại để tạo hiệu ứng popup
        dungeonWin.classList.remove('open-anim');
        void dungeonWin.offsetWidth; // trigger reflow
        dungeonWin.classList.add('open-anim');
    }
    
    // Show Dungeon View content
    All.dungeonView.style.display = 'flex';
    
    const closeBtn = All.$id('dungeon-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            closeDungeonView();
        };
    }
    
    initPlacementPhase();
}

export function closeDungeonView() {
    if (!isDungeonOpen) return;
    isDungeonOpen = false;
    stopCombatLoop();

    // Hide Dungeon Modal
    const dungeonWin = All.$id('dungeon-win');
    if (dungeonWin) {
        dungeonWin.style.display = 'none';
        dungeonWin.classList.remove('open-anim');
    }

    // Hide Dungeon View content
    All.dungeonView.style.display = 'none';
    All.dungeonView.innerHTML = '';
    
    // Reopen farm window
    All.$id('win').classList.add('open');

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
    shopGold = 0;
    
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
            dragEl.style.left = '0';
            dragEl.style.top = '0';
            dragEl.style.zIndex = '100000';
            dragEl.innerHTML = petSVG(petId, 32);
            document.body.appendChild(dragEl); // append to body to avoid transform/overflow issues
            
            dragEl.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
            
            slot.setPointerCapture(e.pointerId);
        });
        
        slot.addEventListener('pointermove', (e) => {
            if (!draggingPet || !dragEl) return;
            dragEl.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
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
                    <div class="dg-cd-bar"><div class="dg-cd-fill" style="width: 0%"></div></div>
                    <div class="dg-skill-cd-bar" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
                    ${petSVG(pId, 32)}
                `;
                
                let x = e.clientX - rect.left - 16;
                let y = e.clientY - rect.top - 16;
                if (x > rect.width - 16) x = rect.width - 16;
                if (x < 16) x = 16;
                if (y < 16) y = 16;
                if (y > rect.height - 16) y = rect.height - 16;
                
                el.style.position = 'absolute';
                el.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
                
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
                    el.style.transform = `translate3d(${ev.clientX - arect.left - 32}px, ${ev.clientY - arect.top - 32}px, 0)`;
                    el.setPointerCapture(ev.pointerId);
                });
                el.addEventListener('pointermove', (ev) => {
                    if (!isPlacedDragging) return;
                    const arect = arena.getBoundingClientRect();
                    el.style.transform = `translate3d(${ev.clientX - arect.left - 32}px, ${ev.clientY - arect.top - 32}px, 0)`;
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
                        if (nx > arect.width - 16) nx = arect.width - 16;
                        if (nx < 16) nx = 16;
                        if (ny < 16) ny = 16;
                        if (ny > arect.height - 16) ny = arect.height - 16;
                        
                        el.style.transform = `translate3d(${nx - 16}px, ${ny - 16}px, 0)`;
                        
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
    shopGold = 0;
    fullTeam = [...team]; // Snapshot the current team
    
    startWave();
}

function updateHUD() {
    const hud = All.$id('dg-hud');
    if (!hud) return;
    const isBoss = currentWave % 10 === 0;
    hud.style.display = 'block';
    hud.innerHTML = `<span style="color:#ffd94d; font-weight:bold;">Wave ${currentWave}</span>${isBoss ? ' 👑' : ''} <span style="color:#a4dc8c; margin-left:10px;" title="Vàng mang về">${spriteSVG('coin', 12).replace('display:block','display:inline-block;vertical-align:middle')} ${totalGold}</span> <span style="color:#e06578; margin-left:10px;" title="Vàng nâng cấp">🛠 ${shopGold}</span>`;
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
    let count = Math.min(30, 3 + Math.floor(currentWave * 1.5));
    let spawnElite = currentWave % 3 === 0;
    let isBossWave = currentWave % 10 === 0;
    
    if (isBossWave) {
        count = Math.max(3, Math.floor(count / 2));
    }
    
    // Thêm chỉ số stressed
    let stressed = Math.floor(currentWave / 5) * 0.5;
    
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
            <div class="dg-cd-bar"><div class="dg-cd-fill" style="width: 0%"></div></div>
            <div class="dg-skill-cd-bar" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
            ${spriteSVG(type.sp || type.id, 32)}
        `;
        
        // Spawn anywhere in the arena
        const x = 20 + Math.random() * (w - 60);
        const y = 40 + Math.random() * (h - 80);
        
        el.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
        
        arena.appendChild(el);
        
        // Scale hp and atk based on wave and stressed
        let hpMultiplier = 1 + (currentWave - 1) * 0.06 + stressed * 0.12;
        let atkMultiplier = 1 + (currentWave - 1) * 0.03 + stressed * 0.08;
        if (currentWave > 5) {
            const extra = currentWave - 5;
            hpMultiplier *= Math.pow(1.03, extra);
            atkMultiplier *= Math.pow(1.01, extra);
        }
        if (isBossWave) {
            hpMultiplier *= 1.5;
            atkMultiplier *= 1.2;
        }
        
        enemies.push({
            id: type.id, x, y, 
            hp: Math.round(type.hp * hpMultiplier), 
            maxHp: Math.round(type.hp * hpMultiplier), 
            atk: Math.round(type.atk * atkMultiplier),
            range: type.range, speed: type.speed, cd: 0, maxCd: type.cd, el, type: 'enemy',
            skill: type.skill, ai: type.ai, gold: Math.round((type.gold || 5) * (1 + currentWave * 0.15))
        });
    }
    
    lastTime = performance.now();
    if (!gameLoopId) {
        gameLoopId = setTimeout(combatLoop, 16);
    }
}

function stopCombatLoop() {
    if (gameLoopId) clearTimeout(gameLoopId);
    gameLoopId = null;
}

function combatLoop() {
    if (phase !== 'combat') return;
    
    let now = performance.now();
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    
    // Giới hạn dt tối đa để tránh treo khi chuyển tab quá lâu (giới hạn 1 giây)
    if (dt > 1.0) dt = 1.0;
    
    // Chạy ngầm nhiều bước nhỏ nếu dt lớn
    let steps = 0;
    while (dt > 0 && steps < 60) {
        let stepDt = Math.min(dt, 0.016);
        
        updateEntities(team, enemies, stepDt);
        updateEntities(enemies, team, stepDt);
    
    // Update projectiles
    const arena = All.$id('dg-arena');
    projectiles = projectiles.filter(p => {
        if (!p.target || p.target.hp <= 0) {
            p.el.remove();
            return false;
        }
        
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const dist = Math.max(0.1, Math.hypot(dx, dy));
        
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
            
            p.el.style.transform = `translate3d(${p.x - 16}px, ${p.y - 16}px, 0)`;
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
            if (e.gold) {
                const homeG = Math.floor(e.gold * 0.6);
                totalGold += homeG;
                shopGold += e.gold;
                spawnDmg({x: e.x, y: e.y - 10}, `+${e.gold} 🛠`, 'gold');
                updateHUD();
            }
            return false;
        }
        return true;
    });
    
        if (enemies.length === 0 || team.length === 0) {
            break;
        }
        
        dt -= stepDt;
        steps++;
    }
    
    if (enemies.length === 0) {
        showWaveRewards();
        return;
    }
    
    if (team.length === 0) {
        endDungeon(false);
        return;
    }
    
    gameLoopId = setTimeout(combatLoop, 16);
}

function spawnDmg(target, amount, type) {
    const isStr = typeof amount === 'string';
    if (!isStr) amount = Math.round(amount);
    const arena = All.$id('dg-arena');
    const dmg = document.createElement('div');
    dmg.className = 'dg-dmg' + (type ? ' ' + type : '');
    dmg.textContent = type === 'miss' ? 'MISS!' : (isStr ? amount : (amount > 0 ? '+' : '') + amount);
    if (type === 'gold') {
        dmg.style.color = '#ffd94d';
        dmg.style.fontWeight = 'bold';
    }
    dmg.style.left = target.x + 'px';
    dmg.style.top = (target.y - 8) + 'px';
    arena.appendChild(dmg);
    setTimeout(() => dmg.remove(), 800);
    
    if (target.el && target.maxHp) {
        const pct = Math.max(0, target.hp / target.maxHp) * 100;
        const fill = target.el.querySelector('.dg-hp-fill');
        if (fill) fill.style.width = pct + '%';
    }
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
        const dodgeChance = target.dodge !== undefined ? target.dodge : (target.id === 'ghostBlob' ? 0.15 : 0.05);
        if (Math.random() < dodgeChance) {
            spawnDmg(target, 0, 'miss');
            target.incomingDmg = Math.max(0, (target.incomingDmg || 0) - atk);
            return;
        }
    }
    
    // Base damage
    let finalDmg = atk;
    let isCrit = false;
    
    if (attacker) {
        if (attacker.status && attacker.status.buff_atk > 0) {
            finalDmg = Math.round(finalDmg * 1.2);
        }
        const critChance = attacker.critRate || (attacker.type === 'pet' ? 0.05 : 0);
        if (Math.random() < critChance) {
            finalDmg = Math.round(finalDmg * (attacker.critDmg || 1.5));
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
                // line check with cross product for width
                const distToTarget = Math.hypot(target.x - attacker.x, target.y - attacker.y);
                const dot = ((e.x - attacker.x) * (target.x - attacker.x) + (e.y - attacker.y) * (target.y - attacker.y)) / (distToTarget * distToTarget);
                const cross = Math.abs((target.x - attacker.x) * (attacker.y - e.y) - (attacker.x - e.x) * (target.y - attacker.y));
                const distToLine = cross / distToTarget;
                if (dot > 0.1 && dot < 2.0 && distToLine < 30) { 
                    e.hp -= finalDmg;
                    spawnDmg(e, -finalDmg);
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
        if (a.cd > 0) {
            a.cd -= dt;
        }
        const cdPct = Math.max(0, Math.min(100, (1 - Math.max(0, a.cd) / a.maxCd) * 100));
        const cdFill = a.el.querySelector('.dg-cd-fill');
        if (cdFill) cdFill.style.width = cdPct + '%';
        
        // Status Effects
        if (!a.status) a.status = {};
        if (a.skill === 'taunt') a.status.taunt = 3;
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
            a._lastStatusHtml = '';
        }
        if (a._lastStatusHtml !== statusHtml) {
            statusDiv.innerHTML = statusHtml;
            a._lastStatusHtml = statusHtml;
        }
        
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
                const dist = Math.max(0.1, Math.hypot(ally.x - a.x, ally.y - a.y));
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
                    const dist = Math.max(0.1, Math.hypot(dx, dy));
                    if (dist < minDist) {
                        minDist = dist;
                        closest = { b: ally, dx, dy, dist };
                    }
                });
            }
        } else if (a.skill === 'assassin' || a.ai === 'assassin') {
            let validTargets = targetGroup.filter(b => b.hp > 0);
            if (a.lockedTarget && validTargets.includes(a.lockedTarget)) {
                const dx = a.lockedTarget.x - a.x;
                const dy = a.lockedTarget.y - a.y;
                const dist = Math.max(0.1, Math.hypot(dx, dy));
                closest = { b: a.lockedTarget, dx, dy, dist };
            } else {
                let minMaxHp = Infinity;
                validTargets.forEach(b => {
                    if (b.maxHp < minMaxHp) {
                        minMaxHp = b.maxHp;
                        const dx = b.x - a.x;
                        const dy = b.y - a.y;
                        const dist = Math.max(0.1, Math.hypot(dx, dy));
                        closest = { b, dx, dy, dist };
                    }
                });
                if (closest) a.lockedTarget = closest.b;
            }
        } else {
            let validTargets = targetGroup.filter(b => b.hp > 0 && (b.hp - (b.incomingDmg || 0) > 0));
            if (validTargets.length === 0) validTargets = targetGroup.filter(b => b.hp > 0);
            validTargets.forEach(b => {
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.max(0.1, Math.hypot(dx, dy));
                if (dist < minDist) {
                    minDist = dist;
                    closest = { b, dx, dy, dist };
                }
            });
        }
        
        a.el.classList.remove('walk');
        
        if (closest) {
            // Face target (with deadzone to prevent flip jitter)
            if (closest.dx < -1 && a.type === 'pet') a.el.classList.add('flip');
            else if (closest.dx > 1 && a.type === 'pet') a.el.classList.remove('flip');
            
            if (closest.dx > 1 && a.type === 'enemy') a.el.classList.add('flip');
            else if (closest.dx < -1 && a.type === 'enemy') a.el.classList.remove('flip');
            
            let isRanged = a.range >= 80 || a.ai === 'ranged';
            let inRange = closest.dist <= a.range || (a.skill === 'heal' && closest.dist <= 10);
            
            let baseRange = a.range;
            if (a.type === 'pet' && PET_STATS[a.id]) baseRange = PET_STATS[a.id].range;
            if (a.type === 'enemy') {
                const en = ENEMY_TYPES.find(e => e.id === a.id);
                if (en) baseRange = en.range;
            }
            let tooClose = isRanged && closest.dist < baseRange * 0.4 && closest.b.type !== a.type;
            
            if (a.panic > 0) a.panic -= dt;
            
            if (a.panic > 0 && !isRooted) {
                a.el.classList.add('walk');
                const arenaRect = arena.getBoundingClientRect();
                const speed = a.speed * speedMult * dt;
                let cx = arenaRect.width / 2 - a.x;
                let cy = arenaRect.height / 2 - a.y;
                let dist = Math.hypot(cx, cy);
                if (dist > 5) {
                    a.x += (cx / dist) * speed;
                    a.y += (cy / dist) * speed;
                }
                a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
            } else if (tooClose && !isRooted) {
                // Kite
                a.el.classList.add('walk');
                const arenaRect = arena.getBoundingClientRect();
                const speed = a.speed * speedMult * dt;
                
                let kx = -(closest.dx / closest.dist);
                let ky = -(closest.dy / closest.dist);
                
                let moveX = kx * speed;
                let moveY = ky * speed;
                
                let nextX = a.x + moveX;
                let nextY = a.y + moveY;
                
                let hitLeft = nextX < 20;
                let hitRight = nextX > arenaRect.width - 20;
                let hitTop = nextY < 20;
                let hitBottom = nextY > arenaRect.height - 20;
                
                let hitX = hitLeft || hitRight;
                let hitY = hitTop || hitBottom;
                
                if (hitX && hitY) {
                    a.panic = 1.0;
                } else if (hitX) {
                    moveX = 0;
                    moveY = (ky !== 0 ? Math.sign(ky) : (Math.random() < 0.5 ? 1 : -1)) * speed;
                } else if (hitY) {
                    moveY = 0;
                    moveX = (kx !== 0 ? Math.sign(kx) : (Math.random() < 0.5 ? 1 : -1)) * speed;
                }
                
                if (!(hitX && hitY)) {
                    a.x += moveX;
                    a.y += moveY;
                }
                
                a.x = Math.max(20, Math.min(a.x, arenaRect.width - 20));
                a.y = Math.max(20, Math.min(a.y, arenaRect.height - 20));
                
                a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
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
                
                a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
            } 
            
            if (inRange) {
                if (a.cd <= 0) {
                    a.cd = a.maxCd / atkSpdMult;
                    
                    a.el.classList.add('attack');
                    setTimeout(() => { if(a.el) a.el.classList.remove('attack'); }, 200);
                    
                    if (a.skill === 'frenzy') {
                        if (!a.frenzyStacks) a.frenzyStacks = 0;
                        a.frenzyStacks = Math.min(10, a.frenzyStacks + 1);
                        a.cd = a.maxCd / (atkSpdMult * (1 + a.frenzyStacks * 0.05));
                    }
                    // Taunt is now handled continuously at the start of updateEntities
                    if (a.skill === 'taunt') {
                        // a.status.taunt = 3;
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
                        p.el.style.transform = `translate3d(${p.x - 16}px, ${p.y - 16}px, 0)`;
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
        <div style="display:flex; justify-content:center; gap: 10px; margin-top: 15px; margin-bottom: auto;">
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
    const waveGold = (120 + currentWave * 60) * (isBoss ? 3 : 1);
    totalGold += Math.floor(waveGold * 0.6);
    shopGold += waveGold;
    
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
        p.status = {};
        if (!p.upgrades) p.upgrades = { hp: 0, atk: 0, aspd: 0, spd: 0, critR: 0, critD: 0, range: 0, dodge: 0 };
        if (p.critRate === undefined) p.critRate = 0.05;
        if (p.critDmg === undefined) p.critDmg = 1.5;
        if (p.dodge === undefined) p.dodge = p.id === 'ghostBlob' ? 0.15 : 0.05;
    });
    team = [...fullTeam];
    
    let bossDropHtml = '';
    if (isBoss) {
        if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
        const r = Math.random();
        let dropText = '';
        if (r < 0.01) { ctx.S.tickets.super = (ctx.S.tickets.super || 0) + 1; dropText = '1 Vé Siêu Cường'; }
        else if (r < 0.40) { ctx.S.tickets.spec = (ctx.S.tickets.spec || 0) + 2; dropText = '2 Vé Đặc Biệt'; }
        else { ctx.S.tickets.norm = (ctx.S.tickets.norm || 0) + 3; dropText = '3 Vé Thường'; }
        bossDropHtml = `<div style="color:#4caf50; margin-bottom:15px; font-weight:bold; font-size:16px;">✨ Rơi ra từ Boss: ${dropText}! ✨</div>`;
        All.save();
    }

    const overlay = document.createElement('div');
    overlay.className = 'dg-overlay';
    overlay.style.alignItems = 'stretch';
    overlay.style.padding = '20px';
    overlay.style.boxSizing = 'border-box';
    overlay.style.background = 'rgba(0,0,0,0.9)';
    
    const getCost = (lv) => Math.floor(50 * Math.pow(1.5, lv));

    const renderShop = (selectedIdx) => {
        const selectedPet = fullTeam[selectedIdx];
        
        let petsHtml = '<div class="dg-shop-left">';
        fullTeam.forEach((p, idx) => {
            const isSel = idx === selectedIdx;
            const totalLv = Object.values(p.upgrades).reduce((a,b)=>a+b,0);
            petsHtml += `<div class="dg-shop-pet ${isSel?'selected':''}" data-idx="${idx}">
                ${petSVG(p.id, 40)}
                <div class="lv">LV ${totalLv}</div>
            </div>`;
        });
        petsHtml += '</div>';

        let headerHtml = `
            <div class="dg-shop-header">
                <div class="dg-shop-header-left">
                    <div class="dg-shop-title">Chợ Đen - Wave ${currentWave}</div>
                    <div class="dg-shop-gold">🛠 ${shopGold} Điểm Nâng Cấp</div>
                </div>
                <button id="dg-shop-next" class="dg-shop-next-btn">Tiếp Theo ➔</button>
            </div>
        `;

        let shopHtml = `<div class="dg-shop-right">
            ${bossDropHtml}
        `;

        if (selectedPet) {
            const u = selectedPet.upgrades;
            const hpMissingPet = selectedPet.maxHp - selectedPet.hp;
            const healPetCost = Math.max(10, Math.floor(hpMissingPet * 0.5));
            const hpMissingTeam = fullTeam.reduce((acc, member) => acc + (member.maxHp - member.hp), 0);
            const healTeamCost = Math.max(30, Math.floor(hpMissingTeam * 0.4));
            
            const stats = [
                { id: 'hp', name: 'Max HP (+20%)', val: selectedPet.maxHp, lv: u.hp, cost: Math.floor(40 * Math.pow(1.3, u.hp)) },
                { id: 'atk', name: 'ATK (+20%)', val: selectedPet.atk, lv: u.atk, cost: Math.floor(40 * Math.pow(1.3, u.atk)) },
                { id: 'aspd', name: 'ATK SPD (+10%)', val: selectedPet.maxCd.toFixed(2)+'s', lv: u.aspd, cost: Math.floor(60 * Math.pow(1.4, u.aspd)) },
                { id: 'spd', name: 'Move Speed (+10%)', val: selectedPet.speed, lv: u.spd, cost: Math.floor(30 * Math.pow(1.2, u.spd)) },
                { id: 'critR', name: 'Crit Rate (+5%)', val: (selectedPet.critRate*100).toFixed(0)+'%', lv: u.critR, cost: Math.floor(50 * Math.pow(1.5, u.critR)), forceCanBuy: selectedPet.critRate < 0.59 },
                { id: 'critD', name: 'Crit Dmg (+20%)', val: (selectedPet.critDmg*100).toFixed(0)+'%', lv: u.critD, cost: Math.floor(50 * Math.pow(1.4, u.critD)) },
                { id: 'dodge', name: 'Né Tránh (+5%)', val: (selectedPet.dodge*100).toFixed(0)+'%', lv: u.dodge || 0, cost: Math.floor(60 * Math.pow(1.5, u.dodge || 0)), forceCanBuy: selectedPet.dodge < 0.39 }
            ];

            if (PET_STATS[selectedPet.id] && PET_STATS[selectedPet.id].range > 60) {
                stats.push({ id: 'range', name: 'Tầm Đánh (+10%)', val: Math.round(selectedPet.range), lv: u.range || 0, cost: Math.floor(40 * Math.pow(1.2, u.range || 0)) });
            }

            stats.push(
                { id: 'heal_pet', name: 'Hồi Máu (Full)', val: `${Math.round(selectedPet.hp)}/${selectedPet.maxHp}`, lv: '', cost: healPetCost, forceCanBuy: selectedPet.hp < selectedPet.maxHp },
                { id: 'heal_team', name: 'Hồi Máu Team (Full)', val: 'Tất cả', lv: '', cost: healTeamCost, forceCanBuy: hpMissingTeam > 0 }
            );

            shopHtml += `<div class="dg-shop-grid">`;
            stats.forEach(s => {
                const cost = s.cost !== undefined ? s.cost : getCost(s.lv);
                const canAfford = shopGold >= cost && (s.forceCanBuy !== undefined ? s.forceCanBuy : true);
                const lvText = s.lv !== '' ? ` <span style="color:#888;">(Lv ${s.lv})</span>` : '';
                shopHtml += `
                <div class="dg-shop-card">
                    <div>
                        <div class="dg-shop-stat-name">${s.name}${lvText}</div>
                        <div class="dg-shop-stat-val">${s.val}</div>
                    </div>
                    <button class="dg-btn-buy" data-stat="${s.id}" data-cost="${cost}" ${!canAfford?'disabled':''}>
                        ${cost} 🛠
                    </button>
                </div>`;
            });
            shopHtml += `</div>`;
        } else {
            shopHtml += `<div style="color:#aaa; text-align:center; flex:1; display:flex; align-items:center; justify-content:center;">Chọn một Pet bên trái để nâng cấp.</div>`;
        }

        shopHtml += `</div>`;

        overlay.innerHTML = `<div class="dg-shop-box">${headerHtml}<div class="dg-shop-content">${petsHtml}${shopHtml}</div></div>`;

        overlay.querySelectorAll('.dg-shop-pet').forEach(el => {
            el.onclick = () => renderShop(parseInt(el.dataset.idx));
        });

        overlay.querySelectorAll('.dg-btn-buy').forEach(el => {
            el.onclick = () => {
                const statId = el.dataset.stat;
                const cost = parseInt(el.dataset.cost);
                if (shopGold >= cost) {
                    shopGold -= cost;
                    const p = selectedPet;
                    if (statId === 'hp') { p.maxHp = Math.round(p.maxHp * 1.2); p.hp = Math.round(p.hp * 1.2); p.upgrades.hp++; }
                    if (statId === 'atk') { p.atk = Math.round(p.atk * 1.2); p.upgrades.atk++; }
                    if (statId === 'aspd') { p.maxCd = Math.max(0.1, p.maxCd * 0.9); p.upgrades.aspd++; }
                    if (statId === 'spd') { p.speed = Math.round(p.speed * 1.1); p.upgrades.spd++; }
                    if (statId === 'critR') { p.critRate = Math.min(0.6, p.critRate + 0.05); p.upgrades.critR++; }
                    if (statId === 'critD') { p.critDmg = Math.round((p.critDmg + 0.2)*10)/10; p.upgrades.critD++; }
                    if (statId === 'dodge') { p.dodge = Math.min(0.4, p.dodge + 0.05); p.upgrades.dodge = (p.upgrades.dodge || 0) + 1; }
                    if (statId === 'range') { p.range = Math.round(p.range * 1.1); p.upgrades.range = (p.upgrades.range || 0) + 1; }
                    if (statId === 'heal_pet') { p.hp = p.maxHp; }
                    if (statId === 'heal_team') {
                        fullTeam.forEach(member => {
                            member.hp = member.maxHp;
                        });
                    }
                    renderShop(selectedIdx);
                }
            };
        });

        const nextBtn = overlay.querySelector('#dg-shop-next');
        nextBtn.onclick = () => {
            nextWaveSequence(overlay);
        };
    };

    arena.appendChild(overlay);
    renderShop(0); // Select first pet by default
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
