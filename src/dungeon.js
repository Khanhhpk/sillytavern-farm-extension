import { ctx } from './store.js';
import * as All from './all.js';
import { petSVG, spriteSVG, sansSpriteFor, sansSpriteForAction, SANS_SPRITES, applySansSprite } from './graphics.js';
import { playNaoyaCutscene } from './hero.js';

export let isDungeonOpen = false;
let phase = 'placement'; // 'placement', 'combat', 'end'
let gameLoopId = null;
let lastTime = 0;

let team = []; // Currently placed pets
let enemies = []; // Spawned enemies
let projectiles = []; // Active projectiles
let arenaEl = null; // Cached arena element - set once per wave
let _hudDirty = false; // Throttle HUD updates

let currentWave = 1;
let totalGold = 0;
let shopGold = 0;

const PET_STATS = {
    // HP Slime Xanh: 130→150 (thêm ngầm +10% giáp)
    slime: { name: 'Slime Xanh', desc: '<b>Bị động:</b> Giảm 10% sát thương nhận vào.<br><b>Chủ động (8s):</b> Lướt nhanh húc văng và làm choáng kẻ địch.', hp: 150, atk: 12, range: 40, speed: 40, cd: 1, armor: 0.10, activeSkill: 'dash_knockup', maxSkillCd: 8 },
    octo: { name: 'Bạch Tuộc', desc: '<b>Bị động:</b> Đánh càng lâu tốc đánh càng cao (tối đa +50%).<br><b>Chủ động (10s):</b> Bão xúc tu gây sát thương và đẩy lùi nhẹ xung quanh trong 3s.', hp: 100, atk: 18, range: 60, speed: 50, cd: 0.8, skill: 'frenzy', activeSkill: 'tentacle_storm', maxSkillCd: 10 },
    slimePink: { name: 'Slime Hồng', desc: '<b>Bị động:</b> Đòn đánh thường hồi máu đơn mục tiêu.<br><b>Chủ động (12s):</b> Hồi 30% máu tối đa cho toàn đội.', hp: 150, atk: 18, range: 80, speed: 35, cd: 1.5, skill: 'heal', activeSkill: 'burst_heal', maxSkillCd: 12 },
    peach_soda: { name: 'Soda Đào', desc: '<b>Bị động:</b> Đánh xa xuyên thấu mọi kẻ địch trên đường bay.<br><b>Chủ động (14s):</b> Ném bom sô-đa hất tung và gây 250% ATK diện rộng.', hp: 110, atk: 22, range: 100, speed: 45, cd: 1.2, skill: 'pierce', activeSkill: 'gas_explosion', maxSkillCd: 14 },
    // Bạch Tuộc Kem: stun 20%→25%
    octoCream: { name: 'Bạch Tuộc Kem', desc: '<b>Bị động:</b> 25% tỷ lệ làm choáng kẻ địch 1 giây.<br><b>Chủ động (18s):</b> Đóng băng toàn bộ kẻ địch trên bản đồ trong 4 giây. Quái bị đóng băng nhận thêm 20% sát thương.', hp: 180, atk: 15, range: 60, speed: 45, cd: 1.5, skill: 'stun', activeSkill: 'brain_freeze', maxSkillCd: 18 },
    jellyfish: { name: 'Sứa Xoăn', desc: '<b>Bị động:</b> Xạ thủ tầm xa.<br><b>Chủ động (12s):</b> Bắn ra vũng độc gây sát thương theo thời gian.', hp: 90, atk: 30, range: 150, speed: 60, cd: 1.5, skill: 'sniper', activeSkill: 'poison_puddle', maxSkillCd: 12 },
    // Bé Bí Ẩn: lifesteal 50%→40%
    mystery_blob: { name: 'Bé Bí Ẩn', desc: '<b>Bị động:</b> Hút máu bằng 40% sát thương gây ra.<br><b>Chủ động (16s):</b> Gọi tối đa 8 con dơi tự động cắn quái rồi hi sinh để hồi máu cho đồng minh ngẫu nhiên.', hp: 110, atk: 18, range: 50, speed: 55, cd: 1.1, skill: 'lifesteal', activeSkill: 'bat_swarm', maxSkillCd: 16 },
    // Ma Trắng: hp 80→110, atk 45→40, dodge gốc 15%→25%
    ghostBlob: { name: 'Ma Trắng', desc: '<b>Bị động:</b> Sát thủ áp sát.<br><b>Chủ động (10s):</b> Tàng hình trong 4s (không bị nhắm mục tiêu).', hp: 110, atk: 40, range: 40, speed: 100, cd: 1.2, skill: 'assassin', activeSkill: 'invisible', maxSkillCd: 10 },
    // Quỷ Nhỏ: hp 70→120, atk 50→45, + giảm 15% DMG nhận
    impBlob: { name: 'Quỷ Nhỏ', desc: '<b>Bị động:</b> Đánh lan AoE.<br><b>Chủ động (14s):</b> Lao tới chém 1 đòn chí mạng 500% sát thương.', hp: 120, atk: 45, range: 40, speed: 60, cd: 1, skill: 'cleave', armor: 0.15, activeSkill: 'nuke_crit', maxSkillCd: 14 },
    angelBlob: { name: 'Thiên Thần', desc: '<b>Bị động:</b> Hồi máu AoE.<br><b>Chủ động (18s):</b> Ban trạng thái Bất tử cho toàn đội trong 3s.', hp: 140, atk: 12, range: 80, speed: 40, cd: 1.2, skill: 'aoe_heal', activeSkill: 'invulnerable', maxSkillCd: 18 },
    starBell: { name: 'Chuông Sao', desc: '<b>Bị động:</b> Tăng 20% sát thương cho đồng minh lân cận.<br><b>Chủ động (20s):</b> Mưa sao băng ngẫu nhiên tạo các vùng lửa tồn tại 5s, thiêu đốt 10% HP tối đa mỗi giây.', hp: 120, atk: 15, range: 90, speed: 40, cd: 1, skill: 'buff_atk', activeSkill: 'shooting_star', maxSkillCd: 20 },
    // Kẹo Dẻo Mây: hp 250→320, cd 2.0→1.5, + 20% giáp khi Taunt
    cloudMallow: { name: 'Kẹo Dẻo Mây', desc: '<b>Bị động:</b> Khiêu khích quái.<br><b>Chủ động (15s):</b> Bật khiên hấp thụ sát thương thành Máu.', hp: 320, atk: 10, range: 40, speed: 30, cd: 1.5, skill: 'taunt', activeSkill: 'shield_wall', maxSkillCd: 15 },
    // Mầm Sương: root 25%→30%
    dewSprout: { name: 'Mầm Sương', desc: '<b>Bị động:</b> 30% tỷ lệ trói chân kẻ địch trong 2 giây.<br><b>Chủ động (15s):</b> Tạo lốc rễ cây gom tất cả quái xung quanh lại một cục trong 3s.', hp: 130, atk: 18, range: 50, speed: 45, cd: 1.2, skill: 'root', activeSkill: 'overgrowth', maxSkillCd: 15 },
    // Lăng Kính: atk 25→20
    prismBlob: { name: 'Lăng Kính', desc: '<b>Bị động:</b> Bắn 3 tia sáng.<br><b>Chủ động (15s):</b> Bắn Laser xuyên thấu toàn màn hình.', hp: 100, atk: 20, range: 140, speed: 40, cd: 1.4, skill: 'multishot', activeSkill: 'laser_beam', maxSkillCd: 15 },
    penguin: { name: 'Cánh Cụt', desc: '<b>Bị động:</b> Đòn đánh làm giảm 30% tốc độ di chuyển và tốc đánh của quái.<br><b>Chủ động (15s):</b> Sút một quả cầu tuyết lăn dội tường 5 lần, gây 200% sát thương và đóng băng 3 giây.', hp: 150, atk: 20, range: 45, speed: 50, cd: 1, skill: 'freeze', activeSkill: 'blizzard', maxSkillCd: 15 },
    // Naoya: maxSkillCd 10s→12s
    naoyaSlime: { name: 'Naoya', desc: '<b>Bị động:</b> Không có.<br><b>Chủ động (12s):</b> Đầu Xạ Chú Pháp - Lướt 24 khung hình công kích toàn map và đóng băng quái 1s.', hp: 100, atk: 35, range: 45, speed: 65, cd: 0.6, skill: 'projection_sorcery', maxSkillCd: 12 },
    sans: { name: 'Sans', desc: '<b>Bị động:</b> Máu cực yếu (1 HP) nhưng có thanh Thể lực để né 100% sát thương. Đòn đánh thường gây hiệu ứng Rút máu Karma.<br><b>Chủ động:</b> Đầy đủ tuyệt kĩ Blue Magic, Gravity Push và Gaster Blaster.', hp: 1, atk: 1, range: 150, speed: 55, cd: 0.2, ai: 'sans_ai' },
    default: { name: 'Pet Vô Danh', desc: '<b>Bị động:</b> Không có.<br><b>Chủ động:</b> Không có.', hp: 130, atk: 12, range: 40, speed: 40, cd: 1 }
};

const ENEMY_TYPES = [
    { id: 'douya', name: 'Mầm Non', desc: 'Lính bầy đàn.', hp: 50, atk: 12, range: 40, speed: 45, cd: 0.8, ai: 'melee', sp: 'sprout', gold: 2 },
    { id: 'tomato', name: 'Cà Chua Tròn', desc: 'Cận chiến cơ bản.', hp: 100, atk: 18, range: 40, speed: 30, cd: 1, ai: 'melee', gold: 4 },
    { id: 'radish', name: 'Củ Cải Tốc Độ', desc: 'Chạy cực nhanh.', hp: 60, atk: 12, range: 30, speed: 70, cd: 0.5, ai: 'melee', gold: 3 },
    { id: 'moonberry', name: 'Dâu Tây Gai', desc: 'Thích khách tập kích.', hp: 70, atk: 30, range: 40, speed: 60, cd: 1, ai: 'assassin', sp: 'moonberry', gold: 5 },
    { id: 'chuncai', name: 'Rau Thuần', desc: 'Đeo bám dai dẳng.', hp: 150, atk: 15, range: 40, speed: 25, cd: 1.2, ai: 'melee', gold: 6 },
    { id: 'lingjiao', name: 'Củ Ấu Giáp', desc: 'Cận chiến có giáp.', hp: 180, atk: 20, range: 40, speed: 20, cd: 1.5, ai: 'melee', gold: 8 },
    { id: 'pumpkin', name: 'Bí Ngô Khổng Lồ', desc: 'Tanker chậm chạp.', hp: 300, atk: 30, range: 50, speed: 15, cd: 3, ai: 'tank', gold: 15 },
    // Hoa Bá Vương: range 100→130, cd 1.8→2.2
    { id: 'fangW', name: 'Hoa Bá Vương', desc: 'Pháp sư bắn từ xa.', hp: 60, atk: 15, range: 130, speed: 20, cd: 2.2, ai: 'ranged', gold: 8 },
    { id: 'starbush', name: 'Bụi Sao', desc: 'Xạ thủ 3 tia.', hp: 70, atk: 8, range: 120, speed: 25, cd: 2.0, ai: 'ranged', skill: 'multishot', gold: 10 },
    { id: 'opalvine', name: 'Dây Leo Opal', desc: 'Trói chân đối thủ.', hp: 130, atk: 15, range: 90, speed: 20, cd: 1.5, ai: 'ranged', skill: 'root', gold: 12 },
    { id: 'lianou', name: 'Củ Sen Khổng Lồ', desc: 'Ném bùn từ xa.', hp: 200, atk: 18, range: 100, speed: 15, cd: 2.5, ai: 'ranged', gold: 20 },
    { id: 'dragoncry', name: 'Long Tinh', desc: 'Boss: Cực khỏe.', hp: 700, atk: 60, range: 60, speed: 20, cd: 2, ai: 'tank', skill: 'cleave', elite: true, gold: 100 },
    { id: 'pumpkin', name: 'Vua Bí Ngô', desc: 'Boss: Tank AoE slam.', hp: 1000, atk: 50, range: 50, speed: 15, cd: 2.5, ai: 'tank', skill: 'cleave', elite: true, sp: 'pumpkin', gold: 150 },
    // Phù Thủy Hoa: range 160→130, cd 1.8→2.2
    { id: 'fangW', name: 'Phù Thủy Hoa', desc: 'Boss: Pháo đài bắn xa.', hp: 500, atk: 70, range: 130, speed: 18, cd: 2.2, ai: 'ranged', skill: 'multishot', elite: true, sp: 'fangW', gold: 120 }
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
    
    if (ctx.S.dungeonSave) {
        All.dungeonView.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:white;">
                <h2 style="color:#d9ba8a; margin-bottom:20px;">Hầm Ngục Đang Dang Dở</h2>
                <div style="margin-bottom:30px; font-size:16px;">Bạn có một lượt chơi đang dang dở ở Ải ${ctx.S.dungeonSave.currentWave}. Bạn muốn tiếp tục hay chơi mới?</div>
                <div style="display:flex; gap:20px;">
                    <div class="buy plain" id="dg-load-new" style="background:#e06578; color:white; width:120px; text-align:center; display:flex; justify-content:center; align-items:center; border-color:#c25566; box-shadow:inset 0 -3px 0 #c25566, 0 3px 0 #a34a52;">Chơi Mới</div>
                    <div class="buy" id="dg-load-continue" style="width:120px; text-align:center; display:flex; justify-content:center; align-items:center;">Tiếp Tục</div>
                </div>
            </div>
        `;
        All.$id('dg-load-new').onclick = () => {
            delete ctx.S.dungeonSave;
            All.save();
            initPlacementPhase();
        };
        All.$id('dg-load-continue').onclick = () => {
            loadDungeonState(ctx.S.dungeonSave);
        };
    } else {
        initPlacementPhase();
    }
}
export function closeDungeonView() {
    if (!isDungeonOpen) return;
    isDungeonOpen = false;
    stopCombatLoop();
    
    const dragEl = document.getElementById('dg-drag-el');
    if (dragEl) dragEl.remove();

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

function loadDungeonState(saveData) {
    currentWave = saveData.currentWave;
    totalGold = saveData.totalGold;
    shopGold = saveData.shopGold;
    
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
            <div class="buy plain" id="dg-leave-btn" style="margin-left: 10px; display:none;">Thoát</div>
            <div class="buy plain" id="dg-surrender-btn" style="margin-left: 10px; background: #e06578; color: white;">Kết Thúc Sớm</div>
        </div>
        ${bestHtml}
    `;

    const leaveBtn = All.$id('dg-leave-btn');
    if (leaveBtn) leaveBtn.addEventListener('click', closeDungeonView);
    const surrBtn = All.$id('dg-surrender-btn');
    if (surrBtn) surrBtn.addEventListener('click', () => endDungeon(false));
    
    All.$id('dg-info-close').onclick = () => All.$id('dg-info-panel').style.display = 'none';
    All.$id('dg-codex-close').onclick = () => All.$id('dg-codex-panel').style.display = 'none';

    const arena = All.$id('dg-arena');
    fullTeam = saveData.fullTeam.map(savedP => {
        const el = document.createElement('div');
        el.className = 'dg-entity pet';
        let barsHtml = `
            <div class="dg-hp-bar"><div class="dg-hp-fill"></div></div>
            <div class="dg-cd-bar"><div class="dg-cd-fill" style="width: 0%"></div></div>
            <div class="dg-skill-cd-bar" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
        `;
        if (savedP.id === 'sans') {
            barsHtml = `
                <div class="dg-hp-bar"><div class="dg-hp-fill"></div></div>
                <div class="dg-cd-bar"><div class="dg-cd-fill" style="width: 0%"></div></div>
                <div class="dg-stamina-bar"><div class="dg-stamina-fill" style="width: 100%"></div></div>
                <div class="dg-skill-cd-bar blue-magic" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
                <div class="dg-skill-cd-bar gravity-push" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
                <div class="dg-skill-cd-bar gaster-blaster" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
            `;
        }
        el.innerHTML = `${barsHtml}\n            ${petSVG(savedP.id, 32)}`;
        el.style.transform = `translate3d(${savedP.x - 16}px, ${savedP.y - 16}px, 0)`;
        arena.appendChild(el);
        const stat = PET_STATS[savedP.id] || PET_STATS.default;
        
        // Recalibrate stats with new balance (dungeon_stats_Kaiz)
        const u = savedP.upgrades || {};
        const oldMax = savedP.maxHp > 0 ? savedP.maxHp : 1;
        const hpPercent = (savedP.hp !== undefined ? savedP.hp : oldMax) / oldMax;
        
        // HP & ATK: +15%/level (1.10→1.15)
        savedP.maxHp = Math.round(stat.hp * Math.pow(1.15, u.hp || 0));
        savedP.hp = Math.round(savedP.maxHp * hpPercent);
        savedP.atk = Math.round(stat.atk * Math.pow(1.15, u.atk || 0));
        savedP.speed = Math.round(stat.speed * Math.pow(1.05, u.spd || 0));
        savedP.range = Math.round(stat.range * Math.pow(1.05, u.range || 0));
        // ATK SPD: 8%/level, sàn 0.15s; dodge ghostBlob 25%
        savedP.maxCd = Math.max(0.15, stat.cd * Math.pow(0.92, u.aspd || 0));
        if (savedP.dodge === undefined) savedP.dodge = savedP.id === 'ghostBlob' ? 0.25 : 0.05;

        const memberObj = { 
            ...savedP, 
            el: el,
            type: 'pet',
            skill: savedP.skill || stat.skill,
            activeSkill: savedP.activeSkill || stat.activeSkill,
            ai: savedP.ai || stat.ai,
            armor: savedP.armor !== undefined ? savedP.armor : stat.armor,
            cd: savedP.cd || 0,
            skillCd: savedP.skillCd || 0,
            maxSkillCd: savedP.maxSkillCd || stat.maxSkillCd || 0
        };
        if (savedP.id === 'sans') {
            memberObj.stamina = savedP.stamina !== undefined ? savedP.stamina : 100;
            memberObj.maxStamina = 100;
            memberObj.gravityCd = savedP.gravityCd || 0;
            memberObj.gasterCd = savedP.gasterCd || 0;
            memberObj.blueMagicCd = savedP.blueMagicCd || 0;
            memberObj.tpCd = savedP.tpCd || 0;
            memberObj.isResting = false;
            memberObj.restTimer = 0;
            memberObj.actionState = 'idle';
        }
        return memberObj;
    });
    team = [...fullTeam];
    
    const isBoss = currentWave % 10 === 0;
    const hud = All.$id('dg-hud');
    hud.style.display = 'block';
    hud.innerHTML = `<span style="color:#ffd94d; font-weight:bold;">Wave ${currentWave}</span>${isBoss ? ' 👑' : ''} <span style="color:#a4dc8c; margin-left:10px;" title="Vàng mang về">${spriteSVG('coin', 12).replace('display:block','display:inline-block;vertical-align:middle')} ${totalGold}</span> <span style="color:#e06578; margin-left:10px;" title="Vàng nâng cấp">🛠 ${shopGold}</span>`;

    showWaveRewards(true);
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
            dragEl.id = 'dg-drag-el';
            dragEl.className = 'dg-entity pet';
            dragEl.style.pointerEvents = 'none';
            dragEl.style.position = 'fixed';
            dragEl.style.left = '0';
            dragEl.style.top = '0';
            dragEl.style.zIndex = '100000';
            dragEl.innerHTML = petSVG(petId, 32);
            document.body.appendChild(dragEl); // append to body to avoid transform/overflow issues
            
            dragEl.style.transform = `translate3d(${e.clientX - 32}px, ${e.clientY - 32}px, 0)`;
            
            slot.setPointerCapture(e.pointerId);
        });
        
        slot.addEventListener('pointermove', (e) => {
            if (!draggingPet || !dragEl) return;
            dragEl.style.transform = `translate3d(${e.clientX - 32}px, ${e.clientY - 32}px, 0)`;
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
                let barsHtml = `
                    <div class="dg-hp-bar"><div class="dg-hp-fill"></div></div>
                    <div class="dg-cd-bar"><div class="dg-cd-fill" style="width: 0%"></div></div>
                    <div class="dg-skill-cd-bar" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
                `;
                if (pId === 'sans') {
                    barsHtml = `
                        <div class="dg-hp-bar"><div class="dg-hp-fill"></div></div>
                        <div class="dg-cd-bar"><div class="dg-cd-fill" style="width: 0%"></div></div>
                        <div class="dg-stamina-bar"><div class="dg-stamina-fill" style="width: 100%"></div></div>
                        <div class="dg-skill-cd-bar blue-magic" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
                        <div class="dg-skill-cd-bar gravity-push" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
                        <div class="dg-skill-cd-bar gaster-blaster" style="display:none;"><div class="dg-skill-cd-fill" style="width: 0%"></div></div>
                    `;
                }
                el.innerHTML = `${barsHtml}\n                    ${petSVG(pId, 32)}`;
                
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
                    range: stat.range, speed: stat.speed, cd: 0, maxCd: stat.cd,
                    skillCd: stat.maxSkillCd || 0, maxSkillCd: stat.maxSkillCd || 0, el, type: 'pet',
                    skill: stat.skill, activeSkill: stat.activeSkill, ai: stat.ai, armor: stat.armor, dockSlot: currentSlot
                };
                if (pId === 'sans') {
                    memberObj.stamina = 100;
                    memberObj.maxStamina = 100;
                    memberObj.gravityCd = 0;
                    memberObj.gasterCd = 0;
                    memberObj.blueMagicCd = 0;
                    memberObj.tpCd = 0;
                    memberObj.isResting = false;
                    memberObj.restTimer = 0;
                    memberObj.actionState = 'idle';
                }
                team.push(memberObj);
                
                // Allow moving/removing placed pets
                let isPlacedDragging = false;
                el.addEventListener('pointerdown', (ev) => {
                    ev.preventDefault();
                    if (phase !== 'placement') return;
                    isPlacedDragging = true;
                    el.style.zIndex = '100000';
                    const arect = arena.getBoundingClientRect();
                    el.style.transform = `translate3d(${ev.clientX - arect.left - 16}px, ${ev.clientY - arect.top - 16}px, 0)`;
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
    fullTeam.forEach(p => { p.waveDmgDealt = 0; p.waveDmgTaken = 0; p.waveHealDone = 0; });
    if (All.getActiveCookingBuffs) {
        const buffs = All.getActiveCookingBuffs();
        if (buffs.length > 0) {
            fullTeam.forEach(p => {
                if (!p._cookBuffApplied) {
                    let hpM = 1, atkM = 1, spdM = 1, addCrit = 0, addDodge = 0;
                    buffs.forEach(b => {
                        if (b.type === 'hero_hp') hpM += b.val;
                        if (b.type === 'hero_atk') atkM += b.val;
                        if (b.type === 'hero_speed') spdM += b.val;
                        if (b.type === 'hero_crit') addCrit += b.val;
                        if (b.type === 'hero_dodge') addDodge += b.val;
                        if (b.type === 'hero_stats_boost') { atkM += (b.atkVal - 1); hpM += (b.hpVal - 1); }
                    });

                    p.maxHp = Math.floor(p.maxHp * hpM);
                    p.hp = p.maxHp; 
                    p.atk = Math.floor(p.atk * atkM);
                    p.maxCd = p.maxCd / spdM;
                    p.critRate = (p.critRate !== undefined ? p.critRate : 0.05) + addCrit;
                    p.dodge = (p.dodge !== undefined ? p.dodge : (p.id === 'ghostBlob' ? 0.25 : 0.05)) + addDodge;
                    
                    p._cookBuffApplied = true;
                }

                setTimeout(() => {
                    if (p.el) {
                        const fl = document.createElement('div');
                        fl.className = 'dg-dmg heal';
                        fl.style.color = '#ff88dd';
                        fl.style.textShadow = '0 1px 2px #000, 0 0 5px #000';
                        fl.textContent = 'YUMMY BUFF!';
                        fl.style.left = p.x + 'px';
                        fl.style.top = (p.y - 20) + 'px';
                        fl.style.zIndex = '999';
                        All.$id('dg-arena').appendChild(fl);
                        setTimeout(() => fl.remove(), 1200);
                        
                        if (!p.el.dataset.cookAura) {
                            p.el.dataset.cookAura = '1';
                            p.el.style.filter = 'drop-shadow(0 0 5px #ff88dd)';
                        }
                    }
                }, 400);
            });
        }
    }
    arenaEl = All.$id('dg-arena');
    const arena = arenaEl;
    const w = arena.clientWidth;
    const h = arena.clientHeight;
    
    updateHUD();
    
    // Calculate enemies based on wave
    let count = Math.min(40, 4 + Math.floor(currentWave * 1.2)); // Giảm từ 1.5 xuống 1.2
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
        
        // Spawn anywhere in the arena, avoiding pets
        let x, y, validSpawn;
        let attempts = 0;
        do {
            x = 20 + Math.random() * (w - 60);
            y = 40 + Math.random() * (h - 80);
            validSpawn = true;
            for (let p of fullTeam) {
                // Tăng khoảng cách an toàn lên đáng kể
                let safeDist = Math.max(100, (p.range || 50) + 60);
                if (Math.hypot(x - p.x, y - p.y) < safeDist) {
                    validSpawn = false;
                    break;
                }
            }
            attempts++;
        } while (!validSpawn && attempts < 50);
        
        el.style.transform = `translate3d(${x - 16}px, ${y - 16}px, 0)`;
        
        arena.appendChild(el);
        
        // Scale hp: 1.12x/wave, atk: 1.10x/wave + 0.2% base mỗi 5 wave (Stressed)
        let hpMultiplier = 1;
        let atkMultiplier = 1;
        for (let w = 2; w <= currentWave; w++) {
            let stressed = Math.floor(w / 5);
            hpMultiplier *= (1.12 + stressed * 0.002);
            atkMultiplier *= (1.10 + stressed * 0.002);
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
            range: type.range, speed: type.speed, cd: 0, maxCd: type.cd,
            skillCd: type.maxSkillCd || 0, maxSkillCd: type.maxSkillCd || 0, el, type: 'enemy',
            skill: type.skill, ai: type.ai, gold: Math.round((type.gold || 5) * 2 * Math.pow(1.12, currentWave - 1))
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
    const arena = arenaEl || All.$id('dg-arena');
    const arenaRect = arena ? arena.getBoundingClientRect() : { width: 960, height: 450 };
    while (dt > 0 && steps < 60) {
        let stepDt = Math.min(dt, 0.016);
        
        updateEntities(team, enemies, stepDt, arenaRect);
        updateEntities(enemies, team, stepDt, arenaRect);
    
    // Update projectiles
    let newProjs = [];
    projectiles = projectiles.filter(p => {
        if (p.isBone) {
            p.lifetime -= stepDt;
            if (p.lifetime <= 0) {
                p.el.remove();
                return false;
            }
            p.x += p.vx * stepDt;
            p.y += p.vy * stepDt;
            p.el.style.left = p.x + 'px';
            p.el.style.top = p.y + 'px';
            
            let hit = false;
            p.groupB.forEach(e => {
                if (e.hp > 0 && Math.hypot(e.x - p.x, e.y - p.y) < 40) {
                    if (p.onHit) p.onHit(e);
                    hit = true;
                }
            });
            if (hit) {
                p.el.remove();
                return false;
            }
            return true;
        }

        if (p.isPuddle) {
            p.lifetime -= stepDt;
            if (p.lifetime <= 0) {
                p.el.remove();
                return false;
            }
            // Throttled bubble particles - max 1 every 0.4s to prevent DOM spam
            if (!p.lastBubble || p.lifetime < p.lastBubble - 0.4) {
                p.lastBubble = p.lifetime;
                const bubble = document.createElement('div');
                bubble.className = 'dg-poison-bubble-particle';
                bubble.style.left = (p.x + Math.random() * 80 - 40) + 'px';
                bubble.style.top = (p.y + Math.random() * 40 - 20) + 'px';
                arena.appendChild(bubble);
                setTimeout(() => bubble.remove(), 1000);
            }
            if (!p.lastTick || p.lifetime < p.lastTick - 1) {
                p.lastTick = p.lifetime;
                p.groupB.forEach(e => {
                    if (e.hp > 0 && Math.hypot(e.x - p.x, e.y - p.y) < 60) {
                        if (!e.status) e.status = {};
                        e.status.poison = 3;
                        const dmg = Math.floor(p.a.atk * 0.5);
                        e.hp -= dmg;
                        spawnDmg(e, -dmg, 'poison');
                    }
                });
            }
            return true;
        }

        if (p.isLaserSweep) {
            p.lifetime -= stepDt;
            if (p.lifetime <= 0) {
                p.el.remove();
                return false;
            }
            
            if (!p.lastTick || p.lifetime < p.lastTick - 0.05) {
                p.lastTick = p.lifetime;
                const progress = (p.maxLifetime - p.lifetime) / p.maxLifetime;
                const currentAngle = progress * Math.PI * 6;
                const dmg = Math.max(1, Math.floor(p.a.atk * 0.5));
                
                p.groupB.forEach(e => {
                    if (e.hp > 0) {
                        const dx = e.x - p.x;
                        const dy = e.y - p.y;
                        const dist = Math.hypot(dx, dy);
                        if (dist > 0) {
                            let a2 = Math.atan2(dy, dx);
                            let normalizedAngle = currentAngle % (Math.PI * 2);
                            if (normalizedAngle > Math.PI) normalizedAngle -= Math.PI * 2;
                            
                            let diff = Math.abs(a2 - normalizedAngle);
                            if (diff > Math.PI) diff = 2 * Math.PI - diff;
                            if (diff < 0.3) {
                                if (!e._lastLaserHit || p.lifetime < e._lastLaserHit - 0.3) {
                                    e._lastLaserHit = p.lifetime;
                                    e.hp -= dmg;
                                    spawnDmg(e, -dmg, 'crit');
                                }
                            }
                        }
                    }
                });
            }
            return true;
        }

        if (p.isTentacleStorm) {
            p.lifetime -= stepDt;
            if (p.lifetime <= 0) {
                p.el.remove();
                return false;
            }
            p.x = p.a.x; p.y = p.a.y;
            p.el.style.left = (p.x - 80) + 'px';
            p.el.style.top = (p.y - 80) + 'px';
            if (!p.nextTick || p.lifetime < p.nextTick) {
                p.nextTick = p.lifetime - 0.2;
                p.groupB.forEach(e => {
                    if (e.hp > 0 && Math.hypot(e.x - p.x, e.y - p.y) < 100) {
                        const dmg = Math.max(1, Math.floor(p.a.atk * 0.3));
                        e.hp -= dmg;
                        spawnDmg(e, -dmg);
                        e.x += (e.x - p.x) > 0 ? 5 : -5;
                        e.y += (e.y - p.y) > 0 ? 5 : -5;
                    }
                });
            }
            return true;
        }
        
        if (p.isGasExplosion || p.isMeteor) {
            p.lifetime -= stepDt;
            if (p.lifetime <= 0) {
                p.el.remove();
                if (p.isGasExplosion && p.targetEnemy && p.targetEnemy.hp > 0) {
                    p.targetX = p.targetEnemy.x;
                    p.targetY = p.targetEnemy.y;
                }
                
                const boom = document.createElement('div');
                boom.className = 'dg-boom-effect';
                boom.style.width = p.isMeteor ? '160px' : '240px';
                boom.style.height = p.isMeteor ? '160px' : '240px';
                boom.style.left = p.targetX + 'px';
                boom.style.top = p.targetY + 'px';
                boom.style.background = p.isMeteor ? 'radial-gradient(circle, rgba(255,200,0,1) 0%, rgba(255,100,0,0) 70%)' : 'radial-gradient(circle, rgba(255,100,100,1) 0%, rgba(255,50,50,0) 70%)';
                arena.appendChild(boom);
                setTimeout(() => boom.remove(), 400);
                
                if (p.isMeteor) {
                    const fire = document.createElement('div');
                    fire.style.position = 'absolute';
                    fire.style.width = '200px';
                    fire.style.height = '200px';
                    fire.style.left = (p.targetX - 100) + 'px';
                    fire.style.top = (p.targetY - 100) + 'px';
                    fire.style.background = 'rgba(255, 0, 0, 0.3)';
                    fire.style.borderRadius = '50%';
                    fire.style.pointerEvents = 'none';
                    arena.appendChild(fire);
                    newProjs.push({
                        isFireZone: true,
                        lifetime: 5,
                        el: fire, a: p.a, groupB: p.groupB,
                        x: p.targetX, y: p.targetY
                    });
                }
                
                const radius = p.isMeteor ? 80 : 120;
                p.groupB.forEach(e => {
                    if (e.hp > 0 && Math.hypot(e.x - p.targetX, e.y - p.targetY) < radius) {
                        if (p.isGasExplosion) {
                            const dmg = p.a.atk * 3.0;
                            e.hp -= dmg;
                            spawnDmg(e, -dmg, 'crit');
                        } else {
                            const dmg = p.a.atk * 2;
                            e.hp -= dmg;
                            spawnDmg(e, -dmg);
                            if(!e.status) e.status = {};
                            e.status.stun = 1;
                        }
                    }
                });
                return false;
            }
            return true;
        }
        
        if (p.isFireZone) {
            p.lifetime -= stepDt;
            if (p.lifetime <= 0) {
                p.el.remove();
                return false;
            }
            if (!p.nextTick || p.lifetime < p.nextTick) {
                p.nextTick = p.lifetime - 1;
                p.groupB.forEach(e => {
                    if (e.hp > 0 && Math.hypot(e.x - p.x, e.y - p.y) < 100) {
                        const dmg = Math.max(1, Math.floor(e.maxHp * 0.1));
                        e.hp -= dmg;
                        spawnDmg(e, -dmg, 'poison');
                    }
                });
            }
            return true;
        }


        if (p.isOvergrowth) {
            p.lifetime -= stepDt;
            if (p.lifetime <= 0) {
                p.el.remove();
                return false;
            }
            p.groupB.forEach(e => {
                if (e.hp > 0) {
                    const dx = p.x - e.x;
                    const dy = p.y - e.y;
                    const d = Math.hypot(dx, dy);
                    if (d < 250 && d > 10) {
                        e.x += (dx / d) * 200 * stepDt;
                        e.y += (dy / d) * 200 * stepDt;
                    }
                }
            });
            return true;
        }
        
        if (p.isSnowball) {
            p.lifetime -= stepDt;
            if (p.lifetime <= 0 || p.bounces >= 5) {
                p.el.remove();
                return false;
            }

            p.x += p.vx * stepDt;
            p.y += p.vy * stepDt;
            
            p.el.style.left = (p.x - 30) + 'px';
            p.el.style.top = (p.y - 30) + 'px';
            
            const rot = (p.lifetime * 500) % 360;
            p.el.style.transform = `rotate(${rot}deg)`;

            const rightBound = p.rightBound || 930;
            const bottomBound = p.bottomBound || 420;

            let bounced = false;
            if (p.x < 30) { p.x = 30; p.vx *= -1; bounced = true; }
            else if (p.x > rightBound) { p.x = rightBound; p.vx *= -1; bounced = true; }
            
            if (p.y < 30) { p.y = 30; p.vy *= -1; bounced = true; }
            else if (p.y > bottomBound) { p.y = bottomBound; p.vy *= -1; bounced = true; }
            
            if (bounced) {
                p.bounces++;
                p.hitTargets.clear();
            }

            p.groupB.forEach(e => {
                if (e.hp > 0 && !p.hitTargets.has(e)) {
                    if (Math.hypot(e.x - p.x, e.y - p.y) < 50) {
                        p.hitTargets.add(e);
                        if (!e.status) e.status = {};
                        e.status.freeze = 3;
                        const dmg = Math.max(1, Math.floor(p.a.atk * 2.0));
                        e.hp -= dmg;
                        spawnDmg(e, -dmg, 'crit');
                    }
                }
            });

            return true;
        }

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
            const move = p.speed * stepDt;
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
                // Tiền mang về ngoài Farm tăng tuyến tính
                const homeG = 1 + Math.floor(currentWave / 10);
                totalGold += homeG;
                shopGold += e.gold;
                spawnDmg({x: e.x, y: e.y - 10}, `+${e.gold} 🛠`, 'gold');
                _hudDirty = true;
            }
            return false;
        }
        return true;
    });
    if (_hudDirty) { _hudDirty = false; updateHUD(); }
    projectiles.push(...newProjs);
    
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
    if (target && target.isBatMinion) return;
    const isStr = typeof amount === 'string';
    if (!isStr) amount = Math.round(amount);
    const arena = arenaEl || All.$id('dg-arena');
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
        const amount = Math.min(target.maxHp - target.hp, atk);
        target.hp += amount;
        if (attacker && attacker.type === 'pet') attacker.waveHealDone = (attacker.waveHealDone || 0) + amount;
        spawnDmg(target, amount, 'heal');
        return;
    }
    if (skill === 'aoe_heal') {
        myGroup.forEach(ally => {
            if (ally.hp > 0 && Math.hypot(ally.x - attacker.x, ally.y - attacker.y) <= attacker.range) {
                const amount = Math.min(ally.maxHp - ally.hp, atk);
                ally.hp += amount;
                if (attacker && attacker.type === 'pet') attacker.waveHealDone = (attacker.waveHealDone || 0) + amount;
                spawnDmg(ally, amount, 'heal');
            }
        });
        return;
    }
    
    // Dodge check (pets only)
    if (target.id === 'sans') {
        if (target.stamina >= 10) {
            target.stamina -= 10;
            spawnDmg(target, 0, 'miss');
            target.incomingDmg = Math.max(0, (target.incomingDmg || 0) - atk);
            target.el.style.filter = 'drop-shadow(0 0 5px cyan)';
            setTimeout(() => { if (target.el) target.el.style.filter = ''; }, 150);
            return;
        }
    } else if (target.type === 'pet') {
        // Ma Trắng: dodge gốc 15%→25%
        const dodgeChance = target.dodge !== undefined ? target.dodge : (target.id === 'ghostBlob' ? 0.25 : 0.05);
        if (Math.random() < dodgeChance) {
            spawnDmg(target, 0, 'miss');
            target.incomingDmg = Math.max(0, (target.incomingDmg || 0) - atk);
            return;
        }
    }
    
    // Base damage
    let finalDmg = atk;
    
    if (target.status) {
        if (target.status.invuln > 0) {
            target.incomingDmg = Math.max(0, (target.incomingDmg || 0) - atk);
            return;
        }
        if (target.status.shield > 0) {
            target.incomingDmg = Math.max(0, (target.incomingDmg || 0) - atk);
            target.hp = Math.min(target.maxHp, target.hp + atk);
            spawnDmg(target, atk, 'heal');
            return;
        }
    }
    
    let isCrit = false;
    
    if (attacker) {
        if (attacker.status && attacker.status.buff_atk > 0) {
            finalDmg = Math.round(finalDmg * 1.2);
        }
        const critChance = attacker.critRate || (attacker.type === 'pet' ? 0.05 : 0);
        if (Math.random() < critChance) {
            finalDmg = Math.round(finalDmg * (attacker.critDmg || 1.5));
            isCrit = true;
            if (attacker.type === 'pet') {
                if (!ctx.S.stats) ctx.S.stats = { totalHarvests: 0, totalCrits: 0 };
                ctx.S.stats.totalCrits = (ctx.S.stats.totalCrits || 0) + 1;
            }
        }
    }
    
    // Armor reduction (base armor từ stat + taunt bonus)
    let effectiveArmor = target.armor || 0;
    // Kẹo Dẻo Mây nhận thêm 20% giáp khi đang Taunt
    if (target.skill === 'taunt' && target.status && target.status.taunt > 0) {
        effectiveArmor = Math.min(0.75, effectiveArmor + 0.20);
    }
    if (effectiveArmor > 0) {
        finalDmg = Math.round(finalDmg * (1 - effectiveArmor));
    }
    
    if (target.status && target.status.brainFreeze > 0) {
        finalDmg = Math.round(finalDmg * 1.2);
    }
    
    if (skill === 'sniper' && attacker) {
        const dist = Math.hypot(target.x - attacker.x, target.y - attacker.y);
        finalDmg += Math.floor(dist * 0.2); // extra damage based on distance
    }
    
    target.hp -= finalDmg;
    target.incomingDmg = Math.max(0, (target.incomingDmg || 0) - finalDmg);
    spawnDmg(target, -finalDmg, isCrit ? 'crit' : '');
    
    if (attacker && attacker.type === 'pet') attacker.waveDmgDealt = (attacker.waveDmgDealt || 0) + finalDmg;
    if (target.type === 'pet') target.waveDmgTaken = (target.waveDmgTaken || 0) + finalDmg;
    
    // Lifesteal: 50%→40%
    if (skill === 'lifesteal' && attacker) {
        const ls = Math.floor(finalDmg * 0.4);
        const amount = Math.min(attacker.maxHp - attacker.hp, ls);
        attacker.hp += amount;
        if (attacker.type === 'pet') attacker.waveHealDone = (attacker.waveHealDone || 0) + amount;
        spawnDmg(attacker, amount, 'heal');
    }
    
    if (!target.status) target.status = {};
    // Bạch Tuộc Kem stun: 20%→25%
    if (skill === 'stun' && Math.random() < 0.25) target.status.stun = 1;
    if (skill === 'poison') target.status.poison = 3;
    if (skill === 'freeze') target.status.freeze = 3;
    // Mầm Sương root: 25%→30%
    if (skill === 'root' && Math.random() < 0.30) target.status.root = 2;
    if (attacker && attacker.id === 'sans' && target.type === 'enemy') {
        target.status.karmaDuration = 3; // 3 seconds of DOT
        target.karmaStacks = (target.karmaStacks || 0) + 1;
    }
    
    if (skill === 'cleave' && attacker) {
        enemyGroup.forEach(e => {
            if (e !== target && e.hp > 0 && Math.hypot(e.x - target.x, e.y - target.y) <= 40) {
                const splash = Math.floor(finalDmg * 0.5);
                e.hp -= splash;
                spawnDmg(e, -splash);
                if (attacker.type === 'pet') attacker.waveDmgDealt = (attacker.waveDmgDealt || 0) + splash;
                if (e.type === 'pet') e.waveDmgTaken = (e.waveDmgTaken || 0) + splash;
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
                    if (attacker.type === 'pet') attacker.waveDmgDealt = (attacker.waveDmgDealt || 0) + finalDmg;
                    if (e.type === 'pet') e.waveDmgTaken = (e.waveDmgTaken || 0) + finalDmg;
                }
            }
        });
    }
}

function updateSansAI(a, enemyGroup, dt, arenaRect, arena, projectiles) {
    const staminaPct = Math.max(0, Math.min(100, (a.stamina / a.maxStamina) * 100));
    const staminaFill = a.el.querySelector('.dg-stamina-fill');
    if (staminaFill) staminaFill.style.width = staminaPct + '%';
    
    ['blueMagicCd', 'gravityCd', 'gasterCd'].forEach(cdName => {
        if (a[cdName] > 0) a[cdName] -= dt;
    });
    const maxCds = { blueMagicCd: 7, gravityCd: 9, gasterCd: 10 };
    const classes = { blueMagicCd: '.blue-magic', gravityCd: '.gravity-push', gasterCd: '.gaster-blaster' };
    for (let cdName in maxCds) {
        const bar = a.el.querySelector(classes[cdName]);
        if (bar) {
            bar.style.display = 'block';
            const fill = bar.querySelector('.dg-skill-cd-fill');
            if (fill) fill.style.width = Math.max(0, Math.min(100, (1 - Math.max(0, a[cdName]) / maxCds[cdName]) * 100)) + '%';
        }
    }

    if (a.restPending > 0) {
        a.restPending -= dt;
        if (a.restPending <= 0) {
            a.isResting = true;
            a.restTimer = 4;
            a._sleepStep = 0;
        }
    } else if (a.isResting) {
        a.restTimer -= dt;
        a.stamina = Math.min(a.maxStamina, a.stamina + (100 / 4) * dt); // Full regen in 4s
        if (!a._sleepStep) a._sleepStep = 0;
        a._sleepStep += dt * 10;
        const sp = sansSpriteForAction('sleep_stand', Math.floor(a._sleepStep));
        applySansSprite(a.el, sp);
        if (a.restTimer <= 0) a.isResting = false;
        return;
    } else {
        a.stamina = Math.min(a.maxStamina, a.stamina + 1 * dt);
    }

    if (a.cd > 0) a.cd -= dt;
    if (a.tpCd > 0) a.tpCd -= dt;
    
    /** @type {any} */
    let closest = null;
    let minDist = Infinity;
    enemyGroup.filter(b => b.hp > 0).forEach(b => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(0.1, Math.hypot(dx, dy));
        if (dist < minDist) { minDist = dist; closest = { b, dx, dy, dist }; }
    });

    if (a.stamina < 20 && a.gravityCd <= 0 && a.tpCd <= 0 && enemyGroup.filter(b=>b.hp>0).length > 0) {
        a.stamina -= 12;
        a.gravityCd = 9;
        
        a.actionState = 'magic';
        a.actionTimer = 1.0;
        a.restPending = 1.0; // Start resting after magic finishes

        if (arena) {
            arena.style.animation = 'dg-shake 0.4s';
            setTimeout(() => { if (arena) arena.style.animation = ''; }, 400);
        }

        a.x = arenaRect.width - 40;
        a.y = arenaRect.height - 40;
        a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;

        enemyGroup.forEach(e => {
            if (e.hp > 0) {
                e.el.style.transition = 'transform 0.3s ease-out';
                e.x = 40 + Math.random()*20;
                e.y = 40 + Math.random()*20;
                e.el.style.transform = `translate3d(${e.x - 16}px, ${e.y - 16}px, 0)`;
                setTimeout(() => { if (e.el) e.el.style.transition = ''; }, 300);
                if (!e.status) e.status = {};
                e.status.stun = 1.5;
                e.hp -= a.atk;
                spawnDmg(e, -a.atk);
            }
        });
        
        return;
    }

    if (closest && closest.dist < 60 && a.tpCd <= 0 && a.stamina >= 10) {
        a.stamina -= 10;
        a.tpCd = 2;
        a.x += (closest.dx > 0 ? -150 : 150);
        a.y += (closest.dy > 0 ? -150 : 150);
        a.x = Math.max(30, Math.min(a.x, arenaRect.width - 30));
        a.y = Math.max(30, Math.min(a.y, arenaRect.height - 30));
        a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
        const sp = sansSpriteForAction('shrug', 0);
        applySansSprite(a.el, sp);
        a.actionState = 'shrug';
        a.actionTimer = 0.3;
        return;
    }

    if (closest && a.actionState === 'idle') {
        if (a.gasterCd <= 0 && a.stamina >= 15) {
            a.gasterCd = 10;
            a.stamina -= 15;
            const sp = sansSpriteForAction('flashing_eye', 1);
            applySansSprite(a.el, sp);
            a.actionState = 'gaster';
            a.actionTimer = 3.6;

            const dx = closest.dx;
            const dy = closest.dy;
            const dist = closest.dist || 1;
            const dirX = dx / dist;
            const dirY = dy / dist;
            const angle = Math.atan2(dy, dx);
            
            const bx = a.x - dirX * 30;
            const by = a.y - dirY * 30 - 20;

            const blaster = document.createElement('img');
            blaster.className = 'dg-gaster-blaster';
            blaster.src = sansSpriteForAction('gaster_charge', 0).src;
            blaster.style.position = 'absolute';
            blaster.style.width = '64px';
            blaster.style.height = '64px';
            blaster.style.left = (bx - 32) + 'px';
            blaster.style.top = (by - 32) + 'px';
            blaster.style.zIndex = '50';
            
            let rotDeg = (angle - Math.PI) * 180 / Math.PI;
            blaster.style.transform = `rotate(${rotDeg}deg)`;
            if (arena) arena.appendChild(blaster);
            
            setTimeout(() => {
                if (!arena || !arena.contains(blaster)) return;
                
                blaster.src = sansSpriteForAction('gaster_fire', 0).src;

                const laser = document.createElement('div');
                laser.style.position = 'absolute';
                laser.style.height = '64px';
                laser.style.width = '1500px';
                laser.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(0,255,255,0.9) 20%, rgba(255,255,255,0.7) 100%)';
                
                laser.style.left = bx + 'px';
                laser.style.top = (by - 32) + 'px';
                laser.style.transformOrigin = '0 50%';
                let laserRot = angle * 180 / Math.PI;
                laser.style.transform = `rotate(${laserRot}deg)`;
                laser.style.zIndex = '40';
                if (arena) arena.appendChild(laser);

                let dotTimer = 3.0;
                let tickTimer = 0;
                const hitInterval = setInterval(() => {
                    dotTimer -= 0.1;
                    tickTimer -= 0.1;
                    if (dotTimer <= 0 || !arena.contains(laser)) {
                        clearInterval(hitInterval);
                        if (laser.parentNode) laser.remove();
                        if (blaster.parentNode) blaster.remove();
                        return;
                    }
                    if (tickTimer <= 0) {
                        tickTimer = 0.2;
                        enemyGroup.forEach(e => {
                            if (e.hp > 0) {
                                const evx = e.x - bx;
                                const evy = (e.y - 16) - by; // Adjust for enemy center
                                const dot = evx * dirX + evy * dirY;
                                const perpDist = Math.abs(evx * dirY - evy * dirX);
                                
                                if (dot > 0 && perpDist < 40) {
                                    e.hp -= 1;
                                    spawnDmg(e, -1);
                                    if (!e.status) e.status = {};
                                    e.status.karmaDuration = 3;
                                    e.karmaStacks = (e.karmaStacks || 0) + 1;
                                }
                            }
                        });
                    }
                }, 100);
            }, 600);
            return;
        }

        if (a.blueMagicCd <= 0 && a.stamina >= 10 && closest.dist < 100) {
            a.blueMagicCd = 7;
            a.stamina -= 10;
            a.actionState = 'attack_updown';
            a.actionTimer = 0.5;

            const target = closest.b;
            if (!target.status) target.status = {};
            target.status.stun = 2;
            
            target.el.style.transition = 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)';
            target.el.style.transform = `translate3d(${target.x - 16}px, ${target.y - 60}px, 0)`;
            setTimeout(() => {
                if (target.el) {
                    target.el.style.transition = 'transform 0.1s cubic-bezier(0.5, 0, 0.75, 0)';
                    target.el.style.transform = `translate3d(${target.x - 16}px, ${target.y - 16}px, 0)`;
                }
                target.hp -= a.atk;
                spawnDmg(target, -a.atk);
                if (!target.status) target.status = {};
                target.status.karmaDuration = 3;
                target.karmaStacks = (target.karmaStacks || 0) + 1;
            }, 300);
            return;
        }
        
        if (a.cd <= 0 && closest.dist <= a.range) {
            a.cd = a.maxCd;
            const bone = document.createElement('div');
            bone.innerHTML = `<img src="${SANS_SPRITES.bone}" width="24" height="24">`;
            bone.style.position = 'absolute';
            bone.style.left = a.x + 'px';
            bone.style.top = a.y + 'px';
            bone.style.zIndex = '50';
            bone.style.animation = 'dg-spin 0.5s linear infinite';
            if (arena) arena.appendChild(bone);
            
            const speed = 250;
            projectiles.push({
                isBone: true, lifetime: 2, maxLifetime: 2,
                vx: (closest.dx / closest.dist) * speed, vy: (closest.dy / closest.dist) * speed,
                x: a.x, y: a.y, el: bone, a, groupB: enemyGroup,
                onHit: (tgt) => {
                    tgt.hp -= a.atk;
                    spawnDmg(tgt, -a.atk);
                    if (!tgt.status) tgt.status = {};
                    tgt.status.karmaDuration = 3;
                    tgt.karmaStacks = (tgt.karmaStacks || 0) + 1;
                }
            });
            a.actionState = 'attack_leftright';
            a.actionTimer = 0.2;
            return;
        }
    }

    if (a.actionState !== 'idle') {
        a.actionTimer -= dt;
        if (a.actionTimer <= 0) {
            a.actionState = 'idle';
        } else {
            if (a.actionState !== 'gaster') {
                if (!a._actionStep) a._actionStep = 0;
                a._actionStep += dt * 10;
                const sp = sansSpriteForAction(a.actionState, Math.floor(a._actionStep));
                if (closest && closest.dx < 0) sp.flip = true;
                else sp.flip = false;
                applySansSprite(a.el, sp);
            }
            return;
        }
    }

    if (closest) {
        let moveX = 0, moveY = 0;
        const speed = a.speed * dt;
        
        if (closest.dist < a.range * 0.5) {
            moveX = -(closest.dx / closest.dist) * speed;
            moveY = -(closest.dy / closest.dist) * speed;
        } else if (closest.dist > a.range * 0.9) {
            moveX = (closest.dx / closest.dist) * speed;
            moveY = (closest.dy / closest.dist) * speed;
        }
        
        if (moveX !== 0 || moveY !== 0) {
            a.x += moveX;
            a.y += moveY;
            a.x = Math.max(20, Math.min(a.x, arenaRect.width - 20));
            a.y = Math.max(20, Math.min(a.y, arenaRect.height - 20));
            a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
            
            if (!a._walkStep) a._walkStep = 0;
            a._walkStep += dt * 10;
            const sp = sansSpriteFor(moveX, moveY, Math.floor(a._walkStep));
            applySansSprite(a.el, sp);
        } else {
            const sp = sansSpriteForAction('idle', 0);
            applySansSprite(a.el, sp);
        }
    }
}

function updateEntities(groupA, groupB, dt, arenaRect) {
    if (!arenaRect) { const a = arenaEl || All.$id('dg-arena'); arenaRect = a ? a.getBoundingClientRect() : { width: 960, height: 450 }; }
    const arena = arenaEl || All.$id('dg-arena');
    
    groupA.forEach(a => {
        if (a.hp <= 0) return;
        
        if (a.ai === 'sans_ai') {
            updateSansAI(a, groupB, dt, arenaRect, arena, projectiles);
            return;
        }
        
        if (a.kb && a.kb.time > 0) {
            a.kb.time -= dt;
            a.x += a.kb.dx * a.kb.speed * dt;
            a.y += a.kb.dy * a.kb.speed * dt;
            a.x = Math.max(20, Math.min(a.x, arenaRect.width - 20));
            a.y = Math.max(20, Math.min(a.y, arenaRect.height - 20));
            a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
            
            let hitOther = false;
            groupA.forEach(other => {
               if (!hitOther && other !== a && other.hp > 0 && Math.hypot(other.x - a.x, other.y - a.y) < 40) {
                   if (!other.status) other.status = {};
                   if (!other.status.stun) {
                       hitOther = true;
                       other.status.stun = 1.5;
                       
                       // ===== SLIME CHAIN: small AoE stun explosion on impact =====
                       const impactX = other.x;
                       const impactY = other.y;
                       const boom = document.createElement('div');
                       boom.className = 'dg-boom-effect';
                       boom.style.width = '80px';
                       boom.style.height = '80px';
                       boom.style.left = (impactX - 8) + 'px';
                       boom.style.top = (impactY - 8) + 'px';
                       boom.style.background = 'radial-gradient(circle, rgba(255,220,80,1) 0%, rgba(255,120,0,0) 70%)';
                       arena.appendChild(boom);
                       setTimeout(() => boom.remove(), 400);
                       
                       // Stun nearby enemies in small radius 55px
                       const CHAIN_RADIUS = 55;
                       groupA.forEach(nearby => {
                           if (nearby !== a && nearby !== other && nearby.hp > 0 &&
                               Math.hypot(nearby.x - impactX, nearby.y - impactY) < CHAIN_RADIUS) {
                               if (!nearby.status) nearby.status = {};
                               nearby.status.stun = 1.0;
                           }
                       });
                   }
               }
            });
            
            if (hitOther) {
                a.kb.time = 0;
            }
            
            return;
        }
        
        let currentlyStunned = a.status && a.status.stun > 0;
        
        // Cooldown tick
        if (a.cd > 0 && !currentlyStunned) {
            a.cd -= dt;
            if (a.status && a.status.rage > 0) a.cd -= dt;
        }
        const cdPct = Math.max(0, Math.min(100, (1 - Math.max(0, a.cd) / a.maxCd) * 100));
        const cdFill = a.el.querySelector('.dg-cd-fill');
        if (cdFill) cdFill.style.width = cdPct + '%';
        
        // --- ACTIVE SKILL TICK ---
        if (a.maxSkillCd > 0 && !currentlyStunned) {
            if (a.skillCd > 0) a.skillCd -= dt;
            const skillCdBar = a.el.querySelector('.dg-skill-cd-bar');
            if (skillCdBar) {
                skillCdBar.style.display = 'block';
                const skillCdFill = skillCdBar.querySelector('.dg-skill-cd-fill');
                if (skillCdFill) {
                    const skillCdPct = Math.max(0, Math.min(100, (1 - Math.max(0, a.skillCd) / a.maxSkillCd) * 100));
                    skillCdFill.style.width = skillCdPct + '%';
                }
            }
        }
        
        // Status Effects
        if (!a.status) a.status = {};
        if (a.skill === 'taunt') a.status.taunt = 3;
        
        // ===== OCTO FRENZY: CD shrinks the longer it stays in combat =====
        if (a.skill === 'frenzy') {
            if (!a._frenzyTimer) a._frenzyTimer = 0;
            a._frenzyTimer += dt;
            // Each 3 seconds in combat, attack 5% faster (cap at -50%)
            const frenzyBonus = Math.min(0.5, Math.floor(a._frenzyTimer / 3) * 0.05);
            a._frenzyMult = 1 - frenzyBonus;
            if (!a._baseCd) a._baseCd = a.maxCd;
            a.maxCd = a._baseCd * a._frenzyMult;
        }
        
        // ===== STAR BELL AURA: grant buff_atk to allies within 90px =====
        if (a.skill === 'buff_atk' && a.type === 'pet') {
            groupA.forEach(ally => {
                if (ally !== a && ally.hp > 0 && Math.hypot(ally.x - a.x, ally.y - a.y) < 90) {
                    if (!ally.status) ally.status = {};
                    ally.status.buff_atk = 0.1; // refresh every frame while in range
                }
            });
        }
        
        let isStunned = false;
        let isRooted = false;
        let speedMult = 1;
        let atkSpdMult = 1;
        let isDashing = a.status && a.status.dashing;
        if (isDashing) speedMult *= 6;
        
        for (let eff in a.status) {
            if (a.status[eff] > 0) {
                a.status[eff] -= dt;
                if (eff === 'stun') isStunned = true;
                if (eff === 'root') isRooted = true;
                if (eff === 'freeze') { speedMult *= 0.8; atkSpdMult *= 0.7; }
                if (eff === 'poison' && Math.random() < dt) {
                    const dmg = Math.floor(a.maxHp * 0.05);
                    a.hp -= dmg;
                    spawnDmg(a, -dmg);
                }
                if (eff === 'karmaDuration') {
                    // Deal DOT based on stacks: 0.5% maxHp per stack, scaled by dt (apply continuously)
                    if (a.karmaStacks > 0) {
                        const dmg = Math.max(1, Math.floor(a.maxHp * 0.005 * a.karmaStacks * dt * 2)); // *2 to adjust tick rate slightly to ensure it deals some dmg
                        a._karmaDmgAcc = (a._karmaDmgAcc || 0) + (a.maxHp * 0.005 * a.karmaStacks * dt);
                        if (a._karmaDmgAcc >= 1) {
                            const tickDmg = Math.floor(a._karmaDmgAcc);
                            a.hp -= tickDmg;
                            a._karmaDmgAcc -= tickDmg;
                            if (Math.random() < 0.1) spawnDmg(a, -tickDmg, 'karma'); // Don't spam text too much
                        }
                    }
                }
            } else if (eff === 'karmaDuration' && a.status[eff] <= 0) {
                a.karmaStacks = 0; // Reset stacks when duration ends
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
        if (a.status.shield > 0) statusHtml += '<div class="dg-status-icon" style="background: pink;"></div>';
        if (a.status.invuln > 0) statusHtml += '<div class="dg-status-icon" style="background: gold;"></div>';
        if (a.status.invis > 0) statusHtml += '<div class="dg-status-icon" style="background: gray; opacity: 0.5;"></div>';
        
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
        
        let taunters = groupB.filter(b => b.hp > 0 && b.status && b.status.taunt > 0 && !(b.status.invis > 0));
        let targetGroup = taunters.length > 0 ? taunters : groupB.filter(b => !(b.status && b.status.invis > 0));
        
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
            // Check active skill first
            if (a.maxSkillCd > 0 && a.skillCd <= 0) {
                if (a.skill === 'projection_sorcery') {
                    a.skillCd = a.maxSkillCd;
                    const momentum = 1 / (a.maxCd || 1);
                    const finalDmg = a.atk;
                    const projectionDmg = Math.max(1, Math.floor(finalDmg * momentum));
                    
                    const validTargets = targetGroup.filter(e => e.hp > 0 && e.el);
                    if (validTargets.length === 0) return;
                    const targetEls = validTargets.map(e => e.el);

                    validTargets.forEach(e => {
                        if (!e.status) e.status = {};
                        e.status.stun = 1.3;
                    });
                    
                    if (!a.status) a.status = {};
                    a.status.stun = 1.3;

                    playNaoyaCutscene(a, a.el, targetEls, () => {
                        validTargets.forEach(e => {
                            if (e.hp > 0) {
                                // All targets receive full projectionDmg equally
                                e.hp -= projectionDmg;
                                spawnDmg(e, -projectionDmg, 'crit');

                                if (arena && a.el) {
                                    const ghost = a.el.cloneNode(true);
                                    ghost.className = 'dg-entity projection-ghost';
                                    ghost.style.position = 'absolute';
                                    ghost.style.left = e.x + 'px';
                                    ghost.style.top = e.y + 'px';
                                    ghost.style.zIndex = '1';
                                    ghost.style.opacity = '0.5';
                                    ghost.style.filter = 'grayscale(1) contrast(1.5)';
                                    ghost.style.pointerEvents = 'none';
                                    arena.appendChild(ghost);
                                    
                                    setTimeout(() => ghost.remove(), 150);
                                }
                            }
                        });
                    });
                }
                else if (a.activeSkill) {
                    a.skillCd = a.maxSkillCd;
                    
                    if (a.activeSkill === 'shield_wall') {
                        if (!a.status) a.status = {};
                        a.status.shield = 3;
                        a.el.classList.add('dg-shield-wall');
                        setTimeout(() => { if(a.el) a.el.classList.remove('dg-shield-wall'); }, 3000);
                    }
                    else if (a.activeSkill === 'burst_heal') {
                        groupA.forEach(ally => {
                            if (ally.hp > 0) {
                                const heal = ally.maxHp * 0.3;
                                ally.hp = Math.min(ally.maxHp, ally.hp + heal);
                                spawnDmg(ally, heal, 'heal');
                                const p = document.createElement('div');
                                p.className = 'dg-heal-particle';
                                p.innerHTML = spriteSVG('heal_cross', 24);
                                p.style.left = ally.x + 'px';
                                p.style.top = ally.y + 'px';
                                arena.appendChild(p);
                                setTimeout(() => p.remove(), 800);
                            }
                        });
                    }
                    else if (a.activeSkill === 'invulnerable') {
                        groupA.forEach(ally => {
                            if (ally.hp > 0) {
                                if (!ally.status) ally.status = {};
                                ally.status.invuln = 3;
                                ally.el.classList.add('dg-invuln-aura');
                                setTimeout(() => { if(ally.el) ally.el.classList.remove('dg-invuln-aura'); }, 3000);
                            }
                        });
                    }
                    else if (a.activeSkill === 'invisible') {
                        if (!a.status) a.status = {};
                        a.status.invis = 4;
                        a.el.classList.add('dg-invis-mode');
                        const smoke = document.createElement('div');
                        smoke.className = 'dg-smoke-particle';
                        smoke.style.left = (a.x - 10) + 'px';
                        smoke.style.top = (a.y - 10) + 'px';
                        arena.appendChild(smoke);
                        setTimeout(() => smoke.remove(), 500);
                        setTimeout(() => { if(a.el) a.el.classList.remove('dg-invis-mode'); }, 4000);
                    }
                    else if (a.activeSkill === 'dash_knockup') {
                        if (!a.status) a.status = {};
                        a.status.dashing = true;
                    }
                    else if (a.activeSkill === 'nuke_crit') {
                        const target = closest.b;
                        a.x = target.x - (closest.dx / closest.dist) * 20;
                        a.y = target.y - (closest.dy / closest.dist) * 20;
                        
                        const boom = document.createElement('div');
                        boom.className = 'dg-boom-effect';
                        boom.style.width = '80px';
                        boom.style.height = '80px';
                        boom.style.left = target.x + 'px';
                        boom.style.top = target.y + 'px';
                        boom.style.background = 'radial-gradient(circle, rgba(255,50,0,1) 0%, rgba(255,0,0,0) 70%)';
                        arena.appendChild(boom);
                        setTimeout(() => boom.remove(), 400);
                        
                        arena.style.animation = 'dg-shake 0.4s';
                        setTimeout(() => { arena.style.animation = ''; }, 400);

                        const dmg = a.atk * 5;
                        target.hp -= dmg;
                        spawnDmg(target, -dmg, 'crit');
                    }
                    else if (a.activeSkill === 'poison_puddle') {
                        const target = closest.b;
                        const puddle = document.createElement('div');
                        puddle.className = 'dg-poison-puddle';
                        puddle.style.position = 'absolute';
                        puddle.style.width = '120px';
                        puddle.style.height = '70px';
                        puddle.style.borderRadius = '50%';
                        puddle.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
                        puddle.style.left = (target.x - 60) + 'px';
                        puddle.style.top = (target.y - 35) + 'px';
                        puddle.style.zIndex = '0';
                        puddle.style.animation = 'dg-puddle-pulse 2s infinite';
                        arena.appendChild(puddle);
                        
                        projectiles.push({
                            x: target.x, y: target.y, 
                            isPuddle: true,
                            lifetime: 5,
                            el: puddle,
                            groupB, a
                        });
                    }
                    else if (a.activeSkill === 'laser_beam') {
                        const laser = document.createElement('div');
                        laser.style.position = 'absolute';
                        laser.style.height = '30px';
                        laser.style.width = '1500px';
                        laser.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(0,255,255,1) 10%, rgba(255,0,255,0.8) 50%, rgba(255,0,0,0) 100%)';
                        laser.style.left = a.x + 'px';
                        laser.style.top = (a.y - 15) + 'px';
                        laser.style.transformOrigin = '0 50%';
                        laser.style.zIndex = '100';
                        laser.style.pointerEvents = 'none';
                        laser.style.animation = 'dg-laser-sweep 1.5s linear forwards';
                        arena.appendChild(laser);
                        
                        projectiles.push({
                            isLaserSweep: true,
                            lifetime: 1.5,
                            maxLifetime: 1.5,
                            el: laser,
                            groupB, a,
                            x: a.x, y: a.y
                        });
                    }
                    else if (a.activeSkill === 'tentacle_storm') {
                        const storm = document.createElement('div');
                        storm.style.position = 'absolute';
                        storm.style.width = '160px';
                        storm.style.height = '160px';
                        storm.style.left = (a.x - 80) + 'px';
                        storm.style.top = (a.y - 80) + 'px';
                        storm.style.pointerEvents = 'none';
                        storm.style.zIndex = '0';
                        for (let i = 0; i < 4; i++) {
                            const t = document.createElement('div');
                            t.style.position = 'absolute';
                            t.style.left = '48px';
                            t.style.top = '0';
                            t.style.transformOrigin = '50% 80px';
                            t.style.transform = `rotate(${i * 90}deg)`;
                            t.innerHTML = spriteSVG('tentacle', 64);
                            storm.appendChild(t);
                        }
                        storm.style.animation = 'dg-spin 0.5s linear infinite';
                        arena.appendChild(storm);
                        
                        projectiles.push({
                            isTentacleStorm: true,
                            lifetime: 3, maxLifetime: 3,
                            el: storm, a, groupB,
                            x: a.x, y: a.y,
                            nextTick: 0.2
                        });
                    }
                    else if (a.activeSkill === 'gas_explosion') {
                        /** @type {any} */
                        let farthest = null;
                        let maxD = -1;
                        groupB.forEach(e => {
                            if (e.hp <= 0) return;
                            const d = Math.hypot(e.x - a.x, e.y - a.y);
                            if (d > maxD) { maxD = d; farthest = e; }
                        });
                        if (farthest) {
                            const bomb = document.createElement('div');
                            bomb.innerHTML = spriteSVG('soda_bomb', 64);
                            bomb.style.position = 'absolute';
                            bomb.style.left = (a.x - 32) + 'px';
                            bomb.style.top = (a.y - 32) + 'px';
                            bomb.style.transition = 'all 0.5s linear';
                            bomb.style.zIndex = '100';
                            arena.appendChild(bomb);
                            
                            setTimeout(() => {
                                bomb.style.left = (farthest.x - 32) + 'px';
                                bomb.style.top = (farthest.y - 32) + 'px';
                                bomb.style.transform = 'rotate(360deg)';
                            }, 50);
                            
                            projectiles.push({
                                isGasExplosion: true,
                                lifetime: 0.55,
                                el: bomb, a, groupB,
                                targetEnemy: farthest,
                                targetX: farthest.x, targetY: farthest.y
                            });
                        } else {
                            a.skillCd = 1; 
                        }
                    }
                    else if (a.activeSkill === 'brain_freeze') {
                        groupB.forEach(e => {
                            if (e.hp <= 0) return;
                            if (!e.status) e.status = {};
                            e.status.stun = 4;
                            e.status.brainFreeze = 4; 
                            const ice = document.createElement('div');
                            ice.innerHTML = spriteSVG('ice_block', 48);
                            ice.style.position = 'absolute';
                            ice.style.left = (e.x - 24) + 'px';
                            ice.style.top = (e.y - 24) + 'px';
                            ice.style.zIndex = '5';
                            ice.style.pointerEvents = 'none';
                            arena.appendChild(ice);
                            setTimeout(() => { if(ice.parentNode) ice.remove(); }, 4000);
                        });
                    }
                    else if (a.activeSkill === 'bat_swarm') {
                        let batCount = 0;
                        groupA.forEach(m => { if (m.isBatMinion && m.hp > 0) batCount++; });
                        const maxSpawn = 8 - batCount;
                        for(let i = 0; i < maxSpawn; i++) {
                            const batEl = document.createElement('div');
                            batEl.className = 'dg-entity dg-pet';
                            batEl.innerHTML = `
                                <div class="dg-sprite">${spriteSVG('bat', 48)}</div>
                            `;
                            const bx = a.x + (Math.random() - 0.5) * 80;
                            const by = a.y + (Math.random() - 0.5) * 80;
                            batEl.style.zIndex = '10';
                            arena.appendChild(batEl);
                            
                            groupA.push({
                                isMinion: true,
                                isBatMinion: true,
                                type: 'pet',
                                id: 'bat_minion',
                                hp: 10, maxHp: 10,
                                atk: Math.floor(a.atk * 0.5),
                                speed: 120,
                                range: 25,
                                x: bx, y: by,
                                el: batEl,
                                cd: 0, maxCd: 1.5,
                                sourcePet: a
                            });
                        }
                    }
                    else if (a.activeSkill === 'shooting_star') {
                        groupA.forEach(ally => {
                            if (ally.hp <= 0) return;
                            if (!ally.status) ally.status = {};
                            ally.status.rage = 5; 
                            ally.el.style.filter = 'drop-shadow(0 0 5px yellow)';
                            setTimeout(() => { if(ally.el) ally.el.style.filter = ''; }, 5000);
                        });
                        
                        const count = 5 + Math.floor(Math.random() * 4);
                        for(let i=0; i<count; i++) {
                            const tx = 50 + Math.random() * 700;
                            const ty = 50 + Math.random() * 300;
                            
                            const m = document.createElement('div');
                            m.innerHTML = spriteSVG('meteor', 64);
                            m.style.position = 'absolute';
                            m.style.left = (tx + 300) + 'px';
                            m.style.top = (ty - 300) + 'px';
                            m.style.transition = 'all 0.5s linear';
                            m.style.zIndex = '100';
                            arena.appendChild(m);
                            
                            setTimeout(() => {
                                m.style.left = (tx - 32) + 'px';
                                m.style.top = (ty - 32) + 'px';
                            }, 50);
                            
                            projectiles.push({
                                isMeteor: true,
                                lifetime: 0.55,
                                el: m, a, groupB,
                                targetX: tx, targetY: ty
                            });
                        }
                    }
                    else if (a.activeSkill === 'overgrowth') {
                        let cx = 0, cy = 0, count = 0;
                        groupB.forEach(e => {
                            if (e.hp > 0) { cx += e.x; cy += e.y; count++; }
                        });
                        if (count > 0) {
                            cx /= count; cy /= count;
                            const vortex = document.createElement('div');
                            vortex.innerHTML = spriteSVG('root_vortex', 96);
                            vortex.style.position = 'absolute';
                            vortex.style.left = (cx - 48) + 'px';
                            vortex.style.top = (cy - 48) + 'px';
                            vortex.style.animation = 'dg-spin 2s linear infinite';
                            vortex.style.zIndex = '0';
                            arena.appendChild(vortex);
                            
                            projectiles.push({
                                isOvergrowth: true,
                                lifetime: 3,
                                el: vortex, a, groupB,
                                x: cx, y: cy
                            });
                        }
                    }
                    else if (a.activeSkill === 'blizzard') {
                        const ball = document.createElement('div');
                        ball.style.position = 'absolute';
                        ball.style.width = '60px';
                        ball.style.height = '60px';
                        ball.style.borderRadius = '50%';
                        ball.style.background = 'radial-gradient(circle at 35% 30%, #eef6ff, #aacfea)';
                        ball.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                        ball.style.zIndex = '40';
                        arena.appendChild(ball);

                        const targets = groupB.filter(e => e.hp > 0);
                        let target = targets[Math.floor(Math.random() * targets.length)];
                        if (!target) target = {x: a.x + 100, y: a.y};
                        
                        const angle = Math.atan2(target.y - a.y, target.x - a.x);
                        const speed = 400;
                        const vx = Math.cos(angle) * speed;
                        const vy = Math.sin(angle) * speed;

                        projectiles.push({
                            isSnowball: true,
                            lifetime: 10,
                            bounces: 0,
                            vx: vx, vy: vy,
                            x: a.x, y: a.y,
                            hitTargets: new Set(),
                            rightBound: arenaRect.width - 30,
                            bottomBound: arenaRect.height - 30,
                            el: ball, a, groupB
                        });
                    }
                }
            }


            // Face target (with deadzone to prevent flip jitter)
            if (closest.dx < -1 && a.type === 'pet') a.el.classList.add('flip');
            else if (closest.dx > 1 && a.type === 'pet') a.el.classList.remove('flip');
            
            if (closest.dx > 1 && a.type === 'enemy') a.el.classList.add('flip');
            else if (closest.dx < -1 && a.type === 'enemy') a.el.classList.remove('flip');
            
            let isRanged = a.range >= 80 || a.ai === 'ranged';
            
            let baseRange = a.range;
            if (a.type === 'pet' && PET_STATS[a.id]) baseRange = PET_STATS[a.id].range;
            if (a.type === 'enemy') {
                const en = ENEMY_TYPES.find(e => e.id === a.id);
                if (en) baseRange = en.range;
            }
            if (isDashing) baseRange = 25;

            let inRange = closest.dist <= baseRange || (a.skill === 'heal' && closest.dist <= 10);
            let tooClose = isRanged && closest.dist < baseRange * 0.4 && closest.b.type !== a.type;
            
            if (a.panic > 0) a.panic -= dt;
            
            if (a.panic > 0 && !isRooted) {
                a.el.classList.add('walk');
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
                
                a.x = Math.max(20, Math.min(a.x, arenaRect.width - 20));
                a.y = Math.max(20, Math.min(a.y, arenaRect.height - 20));
                
                a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
            } 
            
            if (inRange) {
                if (a.cd <= 0 || isDashing) {
                    if (isDashing) {
                        a.status.dashing = false;
                        const target = closest.b;
                        const dmg = a.atk * 2;
                        target.hp -= dmg;
                        spawnDmg(target, -dmg);
                        
                        let kbDx = closest.dx / closest.dist;
                        let kbDy = closest.dy / closest.dist;
                        
                        if (!target.status) target.status = {};
                        target.status.stun = 2.0;
                        target.kb = { dx: kbDx, dy: kbDy, time: 0.3, speed: 400 };
                        
                        const boom = document.createElement('div');
                        boom.className = 'dg-boom-effect';
                        boom.style.left = target.x + 'px';
                        boom.style.top = target.y + 'px';
                        arena.appendChild(boom);
                        setTimeout(() => boom.remove(), 400);
                        return;
                    }

                    a.cd = a.maxCd / atkSpdMult;
                    
                    a.el.classList.add('attack');
                    setTimeout(() => { if(a.el) a.el.classList.remove('attack'); }, 200);
                    
                    if (a.skill === 'frenzy') {
                        if (!a.frenzyStacks) a.frenzyStacks = 0;
                        // Frenzy tối đa +50% tốc đánh (10 stacks x 5% = 50%)
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
                        
                        if (a.isBatMinion) {
                            const realPets = groupA.filter(p => p.type === 'pet' && !p.isBatMinion && p.hp > 0);
                            const ally = realPets[Math.floor(Math.random() * realPets.length)];
                            if (ally) {
                                ally.hp = Math.min(ally.maxHp, ally.hp + a.atk);
                                spawnDmg(ally, a.atk, 'heal');
                            }
                            a.hp = 0;
                            spawnDmg(a, -999);
                        }
                    }
                }
            }
        }
    });
}

function endDungeon(isWin) {
    phase = 'end';
    stopCombatLoop();
    
    delete ctx.S.dungeonSave;
    All.save();
    
    projectiles.forEach(p => p.el.remove());
    projectiles = [];
    team.forEach(p => {
        if (p.isBatMinion && p.el) p.el.remove();
    });
    
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

function showWaveRewards(isLoaded = false) {
    phase = 'end'; // pause combat
    stopCombatLoop();
    
    let bossDropHtml = '';
    const arena = All.$id('dg-arena');
    
    if (!isLoaded) {
        projectiles.forEach(p => p.el.remove());
        projectiles = [];
        team.forEach(p => {
            if (p.isBatMinion && p.el) p.el.remove();
        });
        
        // Calculate gold for this wave (shop gold scale: 1.10→1.12)
        const isBoss = currentWave % 10 === 0;
        const waveGold = Math.round(500 * Math.pow(1.12, currentWave - 1)) * (isBoss ? 3 : 1);
        // Tiền thưởng ngoài farm scale mạnh cộng dồn 2% mỗi wave
        const baseHomeGold = (200 + currentWave * 50) * (isBoss ? 3 : 1);
        const waveHomeGold = Math.floor(baseHomeGold * Math.pow(1.02, currentWave - 1));
        totalGold += waveHomeGold;
        shopGold += waveGold;
        
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
            if (!p.upgrades) p.upgrades = { hp: 0, atk: 0, aspd: 0, spd: 0, critR: 0, critD: 0, range: 0, dodge: 0, skillCdR: 0 };
            const baseStat = PET_STATS[p.id] || PET_STATS.default;
            // ATK SPD: giảm 10%→8% CD/level, sàn 0.1s→0.15s
            p.maxCd = Math.max(0.15, baseStat.cd * Math.pow(0.92, p.upgrades.aspd || 0));
            if (baseStat.maxSkillCd) {
                p.maxSkillCd = baseStat.maxSkillCd * (1 - (p.upgrades.skillCdR || 0) * 0.05);
            }
            if (All.getActiveCookingBuffs) {
                let spdM = 1;
                All.getActiveCookingBuffs().forEach(b => {
                    if (b.type === 'hero_speed') spdM += b.val;
                });
                p.maxCd = p.maxCd / spdM;
            }
            if (p.critRate === undefined) p.critRate = 0.05;
            if (p.critDmg === undefined) p.critDmg = 1.5;
            // Ma Trắng dodge gốc: 15%→25%
            if (p.dodge === undefined) p.dodge = p.id === 'ghostBlob' ? 0.25 : 0.05;
        });
        team = [...fullTeam];
        
        if (isBoss) {
            if (!ctx.S.tickets) ctx.S.tickets = { norm: 0, spec: 0, super: 0 };
            const r = Math.random();
            let dropText = '';
            if (r < 0.01) { ctx.S.tickets.super = (ctx.S.tickets.super || 0) + 1; dropText = '1 Vé Siêu Cường'; }
            else if (r < 0.40) { ctx.S.tickets.spec = (ctx.S.tickets.spec || 0) + 2; dropText = '2 Vé Đặc Biệt'; }
            else { ctx.S.tickets.norm = (ctx.S.tickets.norm || 0) + 3; dropText = '3 Vé Thường'; }
            bossDropHtml = `<div style="color:#4caf50; margin-bottom:15px; font-weight:bold; font-size:16px;">✨ Rơi ra từ Boss: ${dropText}! ✨</div>`;
        }
        
        ctx.S.dungeonSave = {
            currentWave,
            totalGold,
            shopGold,
            bossDropHtml,
            fullTeam: fullTeam.map(p => ({
                id: p.id, x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp, atk: p.atk,
                speed: p.speed, critRate: p.critRate, critDmg: p.critDmg, dodge: p.dodge, range: p.range,
                maxCd: p.maxCd, upgrades: { ...p.upgrades }, _cookBuffApplied: p._cookBuffApplied,
                type: p.type, skill: p.skill, ai: p.ai, cd: p.cd, skillCd: p.skillCd, maxSkillCd: p.maxSkillCd
            }))
        };
        All.save();
    } else {
        bossDropHtml = ctx.S.dungeonSave.bossDropHtml || '';
        // Cập nhật thanh máu cho fullTeam
        fullTeam.forEach(p => {
            const pct = Math.max(0, p.hp / p.maxHp) * 100;
            p.el.querySelector('.dg-hp-fill').style.width = pct + '%';
        });
    }

    const overlay = document.createElement('div');
    overlay.className = 'dg-overlay';
    overlay.style.alignItems = 'stretch';
    overlay.style.padding = '20px';
    overlay.style.boxSizing = 'border-box';
    overlay.style.background = 'rgba(0,0,0,0.9)';
    
    const getCost = (lv) => Math.floor(50 * Math.pow(1.2, lv));

    const renderShop = (selectedIdx) => {
        const selectedPet = fullTeam[selectedIdx];
        
        let petsHtml = '<div class="dg-shop-left">';
        fullTeam.forEach((p, idx) => {
            const isSel = idx === selectedIdx;
            const totalLv = Object.values(p.upgrades).reduce((a,b)=>a+b,0);
            const formatNum = n => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : Math.round(n);
            petsHtml += `<div class="dg-shop-pet ${isSel?'selected':''}" data-idx="${idx}">
                ${petSVG(p.id, 40)}
                <div class="lv">LV ${totalLv}</div>
                <div class="dmg-stats">
                    <span style="color:#ff6666">⚔️${formatNum(p.waveDmgDealt || 0)}</span>
                    ${p.waveHealDone ? `<span style="color:#66ff66">✚️${formatNum(p.waveHealDone)}</span>` : ''}
                    <span style="color:#66ccff">🛡️${formatNum(p.waveDmgTaken || 0)}</span>
                </div>
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
            const waveBaseGold = Math.round(500 * Math.pow(1.12, currentWave - 1));
            const healPetCost = Math.max(10, Math.floor(waveBaseGold * 0.2 * (hpMissingPet / selectedPet.maxHp)));
            
            const totalMaxHp = fullTeam.reduce((acc, member) => acc + member.maxHp, 0);
            const hpMissingTeam = fullTeam.reduce((acc, member) => acc + (member.maxHp - member.hp), 0);
            const healTeamCost = Math.max(30, totalMaxHp > 0 ? Math.floor(waveBaseGold * 0.5 * (hpMissingTeam / totalMaxHp)) : 30);
            
            // Giá Shop: 1.12→1.18 /level (chống lạm phát giá)
            const calc = (base, lv) => Math.floor(base * Math.pow(1.18, lv));
            
            const stats = [
                // Hiệu quả HP & ATK upgrade: +10%→+15%
                { id: 'hp', name: 'Max HP (+15%)', val: selectedPet.maxHp, lv: u.hp, cost: calc(80, u.hp) },
                { id: 'atk', name: 'ATK (+15%)', val: selectedPet.atk, lv: u.atk, cost: calc(80, u.atk) },
                // ATK SPD: giảm 8%/level, sàn 0.15s
                { id: 'aspd', name: 'ATK SPD (+8%)', val: selectedPet.maxCd.toFixed(2)+'s', lv: u.aspd, cost: calc(100, u.aspd), forceCanBuy: selectedPet.maxCd > 0.16 },
                { id: 'spd', name: 'Move Speed (+5%)', val: selectedPet.speed, lv: u.spd, cost: calc(50, u.spd), forceCanBuy: selectedPet.speed < 150 },
                { id: 'critR', name: 'Crit Rate (+5%)', val: (selectedPet.critRate*100).toFixed(0)+'%', lv: u.critR, cost: calc(90, u.critR), forceCanBuy: selectedPet.critRate < 0.59 },
                { id: 'critD', name: 'Crit Dmg (+20%)', val: (selectedPet.critDmg*100).toFixed(0)+'%', lv: u.critD, cost: calc(90, u.critD) },
                { id: 'dodge', name: 'Né Tránh (+5%)', val: (selectedPet.dodge*100).toFixed(0)+'%', lv: u.dodge || 0, cost: calc(100, u.dodge || 0), forceCanBuy: selectedPet.dodge < 0.39 }
            ];

            if (PET_STATS[selectedPet.id] && PET_STATS[selectedPet.id].range > 60) {
                stats.push({ id: 'range', name: 'Tầm Đánh (+5%)', val: Math.round(selectedPet.range), lv: u.range || 0, cost: calc(70, u.range || 0), forceCanBuy: selectedPet.range < 400 });
            }
            if (selectedPet.maxSkillCd > 0) {
                stats.push({ id: 'skillCdR', name: 'Giảm Hồi Chiêu (+5%)', val: selectedPet.maxSkillCd.toFixed(1)+'s', lv: u.skillCdR || 0, cost: Math.floor(1000 * Math.pow(1.5, u.skillCdR || 0)), forceCanBuy: (u.skillCdR || 0) < 10 });
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
                    if (statId === 'hp') { p.upgrades.hp++; }
                    if (statId === 'atk') { p.upgrades.atk++; }
                    if (statId === 'aspd') { p.upgrades.aspd++; }
                    if (statId === 'spd') { p.upgrades.spd++; }
                    if (statId === 'critR') { p.critRate = Math.min(0.6, p.critRate + 0.05); p.upgrades.critR++; }
                    if (statId === 'critD') { p.critDmg = Math.round((p.critDmg + 0.2)*10)/10; p.upgrades.critD++; }
                    if (statId === 'dodge') { p.dodge = Math.min(0.4, p.dodge + 0.05); p.upgrades.dodge = (p.upgrades.dodge || 0) + 1; }
                    if (statId === 'range') { p.upgrades.range = (p.upgrades.range || 0) + 1; }
                    if (statId === 'skillCdR') { p.upgrades.skillCdR = (p.upgrades.skillCdR || 0) + 1; }
                    
                    // Recalibrate base stats based on upgrades
                    const stat = PET_STATS[p.id] || PET_STATS.default;
                    const oldMax = p.maxHp > 0 ? p.maxHp : 1;
                    const hpPercent = p.hp / oldMax;
                    // HP & ATK upgrade: 1.10→1.15 (+15%/level)
                    p.maxHp = Math.round(stat.hp * Math.pow(1.15, p.upgrades.hp || 0));
                    p.hp = Math.round(p.maxHp * hpPercent);
                    p.atk = Math.round(stat.atk * Math.pow(1.15, p.upgrades.atk || 0));
                    p.speed = Math.round(stat.speed * Math.pow(1.05, p.upgrades.spd || 0));
                    p.range = Math.round(stat.range * Math.pow(1.05, p.upgrades.range || 0));
                    // ATK SPD: 0.9→0.92 (giảm 8%/level), sàn 0.15s
                    p.maxCd = Math.max(0.15, stat.cd * Math.pow(0.92, p.upgrades.aspd || 0));
                    if (stat.maxSkillCd) {
                        p.maxSkillCd = stat.maxSkillCd * (1 - (p.upgrades.skillCdR || 0) * 0.05);
                    }

                    // Re-apply cooking buff multipliers so they are not lost after shop upgrades
                    if (All.getActiveCookingBuffs && p._cookBuffApplied) {
                        const buffs = All.getActiveCookingBuffs();
                        if (buffs.length > 0) {
                            let hpM = 1, atkM = 1, spdM = 1, addCrit = 0, addDodge = 0;
                            buffs.forEach(b => {
                                if (b.type === 'hero_hp') hpM += b.val;
                                if (b.type === 'hero_atk') atkM += b.val;
                                if (b.type === 'hero_speed') spdM += b.val;
                                if (b.type === 'hero_crit') addCrit += b.val;
                                if (b.type === 'hero_dodge') addDodge += b.val;
                                if (b.type === 'hero_stats_boost') { atkM += (b.atkVal - 1); hpM += (b.hpVal - 1); }
                            });
                            p.maxHp = Math.floor(p.maxHp * hpM);
                            p.hp = Math.round(p.maxHp * hpPercent);
                            p.atk = Math.floor(p.atk * atkM);
                            p.maxCd = p.maxCd / spdM;
                            p.critRate = (p.critRate !== undefined ? p.critRate : 0.05) + addCrit;
                            p.dodge = (p.dodge !== undefined ? p.dodge : (p.id === 'ghostBlob' ? 0.25 : 0.05)) + addDodge;
                        }
                    }

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
