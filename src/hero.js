import { ctx } from './store.js';
import * as All from './all.js';
import { spriteSVG, petSVG, PETS, SANS_HERO_SPRITES, SANS_FARM_SPRITES } from './graphics.js';
import { CROPS } from './data.js';
import { save } from './state.js';
import { openModal, closeModal } from './shop.js';


let heroPanelScrollTop = 0;
let heroRosterScrollTop = 0;

function saveHeroScrolls() {
    const mbody = All.$id('mbody');
    if (mbody) {
        heroPanelScrollTop = mbody.scrollTop;
        const rosterEl = mbody.querySelector('.hero-pet-roster-list');
        if (rosterEl) heroRosterScrollTop = rosterEl.scrollTop;
    }
}

function restoreHeroScrolls() {
    setTimeout(() => {
        const mbody = All.$id('mbody');
        if (mbody) {
            mbody.scrollTop = heroPanelScrollTop;
            const rosterEl = mbody.querySelector('.hero-pet-roster-list');
            if (rosterEl) rosterEl.scrollTop = heroRosterScrollTop;
        }
    }, 0);
}

let heroLoop = null;
let lastTick = 0;
let currentMonster = null;
let monsterX = 100;
let floatingDamageContainer = null;

export const PET_SKILLS = {
  slime: { 
    a1: { name: 'Tự Chữa Lành', type: 'heal_self', val: 0.2, cd: 4, duration: 0, desc: 'Hồi 20% Max HP bản thân' },
    a2: { name: 'Đâm Sầm', type: 'slam_dmg', val: 3.0, cd: 5, duration: 0, desc: 'Gây x3 ATK' },
    p1: { name: 'Thể Chất Slime', type: 'max_hp_party', val: 0.25, desc: 'Tăng 25% Max HP toàn đội' },
    p2: { name: 'Tái Sinh', type: 'hp_regen', val: 0.02, desc: 'Tự hồi 2% Max HP mỗi giây' }
  },
  octo: { 
    a1: { name: 'Đòn Roi Xúc Tu', type: 'multi_strike', val: 3, cd: 6, duration: 1, desc: 'Tung 3 đòn liên tiếp ngay lập tức' },
    a2: { name: 'Bơm Mực', type: 'atk_spd_self', val: 2.0, cd: 8, duration: 3, desc: 'Tự buff x2 Tốc Đánh trong 3s' },
    p1: { name: 'Sức Mạnh Mềm', type: 'atk_up', val: 0.4, desc: 'Tăng 40% ATK bản thân' },
    p2: { name: 'Phủ Đầu', type: 'first_strike', val: 5.0, desc: 'Đòn đánh đầu mỗi quái x5 Sát thương' }
  },
  slimePink: {
    a1: { name: 'Mưa Dâu Tây', type: 'heal_party', val: 0.15, cd: 4, duration: 0, desc: 'Hồi 15% Max HP cho toàn đội' },
    a2: { name: 'Mùi Hương', type: 'charm', val: 0.5, cd: 8, duration: 3, desc: 'Giảm 50% ATK của quái trong 3s' },
    p1: { name: 'Cắn Ngọt', type: 'lifesteal', val: 0.3, desc: 'Hút máu 30% sát thương gây ra' },
    p2: { name: 'Lớp Kẹo Dẻo', type: 'dmg_reduction', val: 0.2, desc: 'Giảm 20% mọi sát thương nhận vào' }
  },
  octoCream: {
    a1: { name: 'Kem Khiên', type: 'shield_self', val: 0.25, cd: 8, duration: 0, desc: 'Tạo Khiên 25% Max HP cho bản thân' },
    a2: { name: 'Hơi Lạnh', type: 'slow', val: 0.5, cd: 7, duration: 3, desc: 'Giảm 50% Tốc đánh của quái' },
    p1: { name: 'Đá Bào', type: 'reflect', val: 0.4, desc: 'Phản lại 40% sát thương' },
    p2: { name: 'Né Tránh', type: 'dodge', val: 0.3, desc: 'Tỉ lệ né 30%' }
  },
  dewSprout: {
    a1: { name: 'Đòn Quất Gai', type: 'thorn_whip', val: 2.0, cd: 5, duration: 0, desc: 'Gây x2 ATK & tự hồi máu' },
    a2: { name: 'Phấn Hoa', type: 'cd_reduce', val: 1.0, cd: 6, duration: 0, desc: 'Giảm 1s CD chủ động cho toàn đội' },
    p1: { name: 'Rễ Bám', type: 'atk_speed', val: 0.5, desc: 'Tốc đánh bản thân x1.5' },
    p2: { name: 'Cơn Gió Mát', type: 'party_speed', val: 0.15, desc: 'Tăng 15% tốc đánh toàn đội' }
  },
  cloudMallow: {
    a1: { name: 'Sét Đánh', type: 'lightning_strike', val: 4.0, cd: 6, duration: 0, desc: 'Gây x4 ATK bỏ qua giáp' },
    a2: { name: 'Đẩy Lùi', type: 'push_back', val: 0, cd: 5, duration: 0, desc: 'Đẩy lùi quái, ngắt nhịp đánh' },
    p1: { name: 'Lớp Bồng Bềnh', type: 'party_dodge', val: 0.15, desc: 'Tăng 15% né tránh cho đội' },
    p2: { name: 'Lơ Lửng', type: 'invincible_start', val: 2, desc: 'Miễn nhiễm sát thương 2s đầu Wave' }
  },
  ghostBlob: {
    a1: { name: 'Rút Hồn', type: 'soul_reap', val: 0.1, cd: 5, duration: 0, desc: 'Gây sát thương 10% HP hiện tại quái' },
    a2: { name: 'Dọa Ma', type: 'fear', val: 2, cd: 7, duration: 2, desc: 'Hoảng sợ (Choáng cứng) quái trong 2s' },
    p1: { name: 'Ám Khí', type: 'armor_pen', val: 0.5, desc: 'Xuyên Giáp: Tăng 50% sát thương' },
    p2: { name: 'Vô Hình', type: 'stealth', val: 1, desc: 'Quái không nhắm đánh bé trước' }
  },
  mystery_blob: {
    a1: { name: 'Sát Thương Ngẫu Nhiên', type: 'random_dmg', val: 5.0, cd: 4, duration: 0, desc: 'Gây ngẫu nhiên từ x1 đến x5 ATK' },
    a2: { name: 'Phép Bổ Trợ Dị Thường', type: 'random_buff', val: 2.0, cd: 6, duration: 4, desc: 'Buff x2 một chỉ số ngẫu nhiên' },
    p1: { name: 'Chí Mạng Bất Ngờ', type: 'crit_rate', val: 0.35, desc: 'Tỉ lệ Bạo kích +35%' },
    p2: { name: 'Aura Lời Nguyền', type: 'curse_aura', val: 0.05, desc: '5% quái tự mất 5% HP mỗi giây' }
  },
  jellyfish: {
    a1: { name: 'Giật Cấp Điện', type: 'stun_bolt', val: 2, cd: 8, duration: 2, desc: 'Gây choáng quái 2s' },
    a2: { name: 'Sóng Âm Xóa Sổ', type: 'dispel', val: 2.0, cd: 10, duration: 0, desc: 'Gây x2 ATK & Xóa mọi buff của quái' },
    p1: { name: 'Đòn Chết Chóc', type: 'crit_dmg', val: 3.0, desc: 'Sát thương Crit x3' },
    p2: { name: 'Biển Cả Chúc Phúc', type: 'party_crit', val: 0.2, desc: 'Tăng 20% Tỉ lệ Crit toàn đội' }
  },
  impBlob: {
    a1: { name: 'Hỏa Ngục', type: 'hellfire', val: 5.0, cd: 8, duration: 0, desc: 'x5 ATK nhưng tự trừ 20% HP hiện tại' },
    a2: { name: 'Hút Máu Đồng Bọn', type: 'vampiric_buff', val: 2.0, cd: 5, duration: 5, desc: 'Rút 10% Max HP đồng minh để tự buff x2 ATK' },
    p1: { name: 'Cuồng Nộ (Berserk)', type: 'berserk', val: 0.5, desc: 'HP < 50% => x2 ATK & Tốc Đánh' },
    p2: { name: 'Đòn Kết Liễu', type: 'execute', val: 0.2, desc: '5% Tỉ lệ kết liễu ngay quái máu <20%' }
  },
  angelBlob: {
    a1: { name: 'Gọi Hồn', type: 'resurrect', val: 0.3, cd: 15, duration: 0, desc: 'Hồi sinh 1 đồng minh đã chết (30% HP)' },
    a2: { name: 'Khiên Thánh', type: 'shield_party', val: 0.15, cd: 10, duration: 0, desc: 'Tạo Khiên 15% Max HP cho toàn đội' },
    p1: { name: 'Hào Quang Bảo Hộ', type: 'party_dmg_resist', val: 0.1, desc: 'Giảm 10% sát thương nhận vào toàn đội' },
    p2: { name: 'Hạt Giống Sinh Mệnh', type: 'cheat_death', val: 1, desc: 'Giữ lại 1 HP khi chết (1 lần/Màn)' }
  },
  prismBlob: {
    a1: { name: 'Cắt Laser', type: 'laser', val: 2.0, cd: 9, duration: 3, desc: 'Laser x2 ATK mỗi giây (kéo dài 3s)' },
    a2: { name: 'Mái Vòm Lăng Kính', type: 'absorb', val: 1, cd: 6, duration: 0, desc: 'Hấp thụ hoàn toàn 1 đòn đánh của quái' },
    p1: { name: 'Thể Chất Pha Lê', type: 'hp_to_atk', val: 0.05, desc: 'Chuyển 5% Max HP thành ATK' },
    p2: { name: 'Kháng Hiệu Ứng', type: 'cc_resist', val: 0.5, desc: 'Giảm 50% thời gian bị choáng' }
  },
  starBell: {
    a1: { name: 'Triệu Hồi Sao Băng', type: 'star_fall', val: 3.0, cd: 7, duration: 1, desc: 'Gây x3 ATK & Làm choáng 1s' },
    a2: { name: 'Giai Điệu Khởi Vận', type: 'party_speed_buff', val: 1.5, cd: 9, duration: 3, desc: 'Tăng 50% Tốc đánh toàn đội' },
    p1: { name: 'Bài Ca Sức Mạnh', type: 'atk_party', val: 0.25, desc: 'Tăng 25% ATK toàn đội' },
    p2: { name: 'Bậc Thầy Combo', type: 'combo_master', val: 3, desc: 'Đòn đánh thứ 4 chắc chắn Chí mạng' }
  },
  peach_soda: {
    a1: { name: 'Bọt Ga Cay Mắt', type: 'blind', val: 1.0, cd: 8, duration: 2, desc: 'Làm mù quái (đánh trượt 100%)' },
    a2: { name: 'Đường Kích Thích', type: 'sugar_rush', val: 3.0, cd: 6, duration: 4, desc: 'x3 Tốc đánh, nhưng giảm 50% ATK' },
    p1: { name: 'Nổ Tỏa Tròn', type: 'splash_dmg', val: 0.3, desc: 'Đánh thường lan 30% sát thương' },
    p2: { name: 'Năng Lượng Đỉnh Cao', type: 'initial_burst', val: 2.0, desc: '3 giây đầu mỗi màn x2 sát thương' }
  },
  penguin: {
    a1: { name: 'Bóng Tuyết Trượt', type: 'snowball_roll', val: 2.0, cd: 5, duration: 0, desc: 'Gây x2 ATK & đẩy lùi quái' },
    a2: { name: 'Ném Tiền', type: 'coin_toss', val: 0, cd: 10, duration: 0, desc: 'Tiêu 20% Vàng đánh bay 50% HP quái' },
    p1: { name: 'Mỏ Vàng', type: 'gold_drop', val: 2.0, desc: 'Nhân đôi Vàng rớt ra từ quái' },
    p2: { name: 'Nhặt Nhạnh', type: 'scavenger', val: 0.05, desc: 'Khi đầy máu, đánh có 5% rơi 1 Vàng' }
  },
  naoyaSlime: {
      a1: { name: '24 Khung Hình', type: 'multi_strike', val: 24, cd: 8, duration: 1, desc: 'Tung 24 đòn chém liên tiếp (Mỗi đòn 50% ATK)' },
      a2: { name: 'Đứng Trên Tất Cả', type: 'atk_spd_self', val: 2.4, cd: 12, duration: 3, desc: 'Buff x2.4 Tốc Đánh trong 3s' },
      p1: { name: 'Khinh Miệt Kẻ Yếu', type: 'execute', val: 0.24, desc: 'Tự động kiết liễu quái có HP < 24%' },
      p2: { name: 'Quy Tắc Khung Hình', type: 'combo_master', val: 4, desc: 'Cứ đòn đánh thứ 4 là Chí Mạng x3 Sát Thương' }
  },
  sans: {
    a1: { name: 'Gaster Blaster', type: 'gaster_blaster', val: 1.0, cd: 8, duration: 2, desc: 'Laser gây 1 sát thương chuẩn và 1 stack Karma mỗi 0.5s' },
    a2: { name: 'Bone Time', type: 'bone_time', val: 5, cd: 12, duration: 2, desc: 'Xương nảy tường 5 lần (Bone Blue Long), sát thương liên tục' },
    p1: { name: 'Much better', type: 'dodge_recover', val: 0.5, desc: 'Hết Dodge: Tạm thời bất tử, lôi ghế uống Ketchup hồi 50% Dodge (1 lần/ải)' },
    p2: { name: 'Get dunked on', type: 'bad_time_mode', val: 0.5, desc: 'Dodge < 50%: Bật Bad Time Mode, giảm 50% thời gian hồi chiêu A1, A2 trong 5s' }
  },
  default: { 
    a1: { name: 'Cố Gắng', type: 'atk_up', val: 0.2, cd: 5, duration: 3, desc: 'Tăng 20% ATK' }, 
    p1: { name: 'Lạc Quan', type: 'crit_rate', val: 0.2, desc: 'Tỉ lệ Bạo kích +20%' } 
  }
};

export const PET_STATS = {
  slime: { baseHp: 150, hpPerLv: 25, baseAtk: 8, atkPerLv: 2, baseSpd: 1.0 },
  octo: { baseHp: 80, hpPerLv: 15, baseAtk: 15, atkPerLv: 4, baseSpd: 1.5 },
  slimePink: { baseHp: 100, hpPerLv: 18, baseAtk: 12, atkPerLv: 3.5, baseSpd: 1.0 },
  octoCream: { baseHp: 110, hpPerLv: 20, baseAtk: 9, atkPerLv: 2.5, baseSpd: 1.2 },
  dewSprout: { baseHp: 120, hpPerLv: 22, baseAtk: 11, atkPerLv: 3, baseSpd: 1.2 },
  cloudMallow: { baseHp: 130, hpPerLv: 20, baseAtk: 8, atkPerLv: 2, baseSpd: 0.8 },
  ghostBlob: { baseHp: 70, hpPerLv: 12, baseAtk: 14, atkPerLv: 4, baseSpd: 1.5 },
  mystery_blob: { baseHp: 90, hpPerLv: 15, baseAtk: 16, atkPerLv: 5, baseSpd: 0.6 },
  jellyfish: { baseHp: 80, hpPerLv: 14, baseAtk: 13, atkPerLv: 4.5, baseSpd: 0.8 },
  impBlob: { baseHp: 150, hpPerLv: 24, baseAtk: 15, atkPerLv: 4, baseSpd: 0.6 },
  angelBlob: { baseHp: 120, hpPerLv: 25, baseAtk: 7, atkPerLv: 1.5, baseSpd: 1.0 },
  prismBlob: { baseHp: 100, hpPerLv: 18, baseAtk: 14, atkPerLv: 4, baseSpd: 0.8 },
  starBell: { baseHp: 100, hpPerLv: 20, baseAtk: 10, atkPerLv: 3, baseSpd: 1.0 },
  peach_soda: { baseHp: 100, hpPerLv: 20, baseAtk: 11, atkPerLv: 3, baseSpd: 1.2 },
  penguin: { baseHp: 110, hpPerLv: 20, baseAtk: 10, atkPerLv: 2.5, baseSpd: 1.0 },
  naoyaSlime: { baseHp: 80, hpPerLv: 10, baseAtk: 24, atkPerLv: 6, baseSpd: 2.4 },
  sans: { baseHp: 100, hpPerLv: 0, baseAtk: 1, atkPerLv: 0, baseSpd: 1.5 },
  default: { baseHp: 100, hpPerLv: 20, baseAtk: 10, atkPerLv: 3, baseSpd: 1.0 }
};

export let runState = null;

// Khởi tạo State cho Hero Mode
export function initHeroState() {
  if (!ctx.S.hero) {
    ctx.S.hero = {};
  }
  if (!ctx.S.hero.party) ctx.S.hero.party = [];
  if (!ctx.S.hero.roster) ctx.S.hero.roster = {};
  if (typeof ctx.S.hero.gold !== 'number') ctx.S.hero.gold = 0;
  if (typeof ctx.S.hero.maxStage !== 'number') ctx.S.hero.maxStage = 1;
  if (!ctx.S.hero.style) ctx.S.hero.style = 'balanced';
  
  if (ctx.S.hero.level !== undefined) {
    delete ctx.S.hero.level;
    delete ctx.S.hero.exp;
  }
  
  // Scan and auto-level up old pets with excess EXP
  if (ctx.S.hero.roster) {
    Object.keys(ctx.S.hero.roster).forEach(pId => {
      let petData = ctx.S.hero.roster[pId];
      if (petData && petData.exp !== undefined && !isNaN(petData.exp)) {
        while (petData.level < 30) {
          const nextExp = Math.floor(500 * Math.pow(1.5, petData.level - 1));
          if (petData.exp >= nextExp) {
            petData.exp -= nextExp;
            petData.level++;
          } else {
            break;
          }
        }
        if (petData.level >= 30) {
          petData.level = 30;
          petData.exp = Math.floor(500 * Math.pow(1.5, 29));
        }
      }
    });
  }
}

export function getPetStats(pId) {
  const data = ctx.S.hero.roster[pId] || { level: 1, exp: 0, enhHp: 0, enhAtk: 0, enhSpd: 0, s5_unlocked: false, s15_unlocked: false };
  const enhHp = data.enhHp || 0;
  const enhAtk = data.enhAtk || 0;
  const enhSpd = data.enhSpd || 0;
  
  const st = PET_STATS[pId] || PET_STATS.default;
  
  return {
    level: pId === 'sans' ? 1 : data.level,
    exp: pId === 'sans' ? 0 : (data.exp || 0),
    maxHp: pId === 'sans' ? Math.floor(st.baseHp * Math.pow(1.20, enhHp)) : Math.floor((st.baseHp + (data.level - 1) * st.hpPerLv) * Math.pow(1.15, enhHp)),
    atk: pId === 'sans' ? st.baseAtk : Math.floor((st.baseAtk + (data.level - 1) * st.atkPerLv) * Math.pow(1.10, enhAtk)),
    spd: pId === 'sans' ? st.baseSpd : Number((st.baseSpd + enhSpd * 0.1).toFixed(2)),
    nextExp: Math.floor(500 * Math.pow(1.5, data.level - 1)),
    enhHpCost: 5000 + enhHp * 2000,
    enhAtkCost: 5000 + enhAtk * 2000,
    enhSpdCost: 5000 + enhSpd * 2000,
    enhHpLevel: enhHp,
    enhAtkLevel: enhAtk,
    enhSpdLevel: enhSpd,
    s5_unlocked: data.s5_unlocked || false,
    s15_unlocked: data.s15_unlocked || false
  };
}

export function openHeroPanel() {
  initHeroState();
  
  // Các lựa chọn lối đánh
  const styles = [
    { id: 'attack', name: 'Tấn công (Dame x1.5, Nhận x1.5)', icon: 'swordIcon' },
    { id: 'defense', name: 'Phòng thủ (Dame x0.6, Nhận x0.6)', icon: 'emStar' },
    { id: 'balanced', name: 'Cân bằng (Mặc định)', icon: 'emLeaf' }
  ];
  
  const partySlots = [0, 1, 2].map(i => {
    const pId = ctx.S.hero.party[i];
    if (pId) {
      const st = getPetStats(pId);
      return `<div class="hero-slot filled" data-rem="${i}">
        ${petSVG(pId, 40)}
        <div class="s-lv">Lv.${st.level}</div>
      </div>`;
    }
    return `<div class="hero-slot empty">Trống</div>`;
  }).join('');
  
  const allPets = ctx.S.pets || [];
  const petRoster = allPets.map(pId => {
    const inParty = ctx.S.hero.party.includes(pId);
    const st = getPetStats(pId);
    return `<div class="hero-roster-item${inParty ? ' used' : ''}">
      <div class="h-r-pet" data-add="${pId}" title="Thêm vào đội hình">${petSVG(pId, 32)}</div>
      <div class="h-r-info" data-info="${pId}" title="Cường hóa & Kỹ năng" style="cursor:pointer;">
        <div>Lv.${st.level} (ATK: ${st.atk} | HP: ${st.maxHp} | SPD: ${st.spd})</div>
        <div class="h-r-bar"><div class="h-r-fill" style="width:${pId === 'sans' || st.level >= 30 ? 100 : Math.min(100, st.exp/st.nextExp*100)}%"></div><span>${pId === 'sans' || st.level >= 30 ? 'MAX' : `${Math.floor(st.exp)}/${st.nextExp}`}</span></div>
      </div>
    </div>`;
  }).join('');
  
  const styleBtns = styles.map(s => 
    `<div class="hero-style-btn${ctx.S.hero.style === s.id ? ' active' : ''}" data-style="${s.id}">
      ${spriteSVG(s.icon, 20)} ${s.name}
    </div>`
  ).join('');

  openModal('Phòng Tập Anh Hùng', `
    <div class="hero-modal-wrapper">
      <div class="hero-panel-stats" style="justify-content: space-between;">
        <div>Max Stage: <b>${ctx.S.hero.maxStage}</b></div>
        <div class="h-gold">${spriteSVG('coin', 16)} <b>${ctx.S.hero.gold}</b></div>
      </div>
      
      <div class="hero-panel-section">Đội hình ra trận (Max 3)</div>
      <div class="hero-party-slots">${partySlots}</div>
      
      <div class="hero-panel-section">Kho Thú Cưng</div>
      <div class="hero-pet-roster-list">${petRoster || '<i>Bạn chưa có Thú cưng nào! Hãy vào Shop để đón các bé.</i>'}</div>
      
      <div class="hero-panel-section">Lối đánh</div>
      <div class="hero-style-list">${styleBtns}</div>
      
      <div style="display: flex; gap: 8px;">
        <div class="hero-deploy-btn" id="hero-deploy" style="flex: 1;">XUẤT PHÁT!</div>
        <div class="hero-deploy-btn" id="hero-jump" style="width: auto; padding: 0 15px; background: #607d8b; border-color: #455a64;">JUMP STAGE</div>
      </div>
    </div>
  `);
  
  const mbody = All.$id('mbody');
}

function spendGold(cost) {
  if (ctx.S.hero.gold + (ctx.S.coins || 0) >= cost) {
    if (ctx.S.hero.gold >= cost) {
      ctx.S.hero.gold -= cost;
    } else {
      const rem = cost - ctx.S.hero.gold;
      ctx.S.hero.gold = 0;
      ctx.S.coins -= rem;
      All.toast(`Đã dùng thêm ${rem} Vàng trại!`);
    }
    return true;
  }
  All.toast('Không đủ vàng (cả Vàng trại và Vàng Anh hùng)!');
  return false;
}

function openPetSkills(pId) {
  const st = getPetStats(pId);
  if (!ctx.S.hero.roster[pId]) ctx.S.hero.roster[pId] = { level: 1, exp: 0, enhHp: 0, enhAtk: 0 };
  const data = ctx.S.hero.roster[pId];
  const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
  
  const renderSkillRow = (typeId, skData, reqLvl, cost, isEquipped, isOtherEquipped) => {
    if (!skData) return '';
    const isUnlocked = pId === 'sans' ? true : data[`${typeId}_unlocked`];
    const levelMet = pId === 'sans' ? true : data.level >= reqLvl;
    let actionBtn = '';
    
    if (isUnlocked) {
      if (isEquipped) {
        actionBtn = `<div class="hero-deploy-btn" data-action="unequip" data-pid="${pId}" data-type="${typeId}" style="margin-top:0; padding:6px 12px; font-size:12px; width:auto; background:#4CAF50; color:#fff; border-color:#2E7D32;">Đang Trang Bị</div>`;
      } else {
        actionBtn = `<div class="hero-deploy-btn sk-equip-btn" data-action="equip" data-pid="${pId}" data-type="${typeId}" style="margin-top:0; padding:6px 12px; font-size:12px; width:auto;">Trang bị</div>`;
      }
    } else if (levelMet) {
      actionBtn = `<div class="hero-deploy-btn sk-unlock-btn" data-pid="${pId}" data-tier="${typeId}" data-cost="${cost}" style="margin-top:0; padding:6px 12px; font-size:12px; width:auto;">Mở khóa<br>${cost}G</div>`;
    } else {
      actionBtn = `<div style="color:#777; font-size:12px; text-align:center;">Cần Lv.${reqLvl}</div>`;
    }
    
    return `<div class="p-skill-tier ${isUnlocked ? 'unlocked' : 'locked'}">
      <div class="p-sk-icon">${isUnlocked ? spriteSVG('emStar', 24) : spriteSVG('emLock', 24)}</div>
      <div class="p-sk-desc">
        <div style="font-size: 13px; font-weight: bold; color: ${isUnlocked ? '#a4dc8c' : '#777'};">${skData.name}</div>
        <div style="font-size: 12px; color:#aaa;">${typeId.startsWith('a') ? `Chủ động - Hồi ${skData.cd}s` : 'Bị động'}</div>
        <div style="font-size: 14px; margin-top: 2px;">${skData.desc}</div>
      </div>
      <div>${actionBtn}</div>
    </div>`;
  };

  const activeHtml = `
    ${renderSkillRow('a1', pSkill.a1, 5, 200000, data.active_eq === 'a1', data.active_eq === 'a2')}
    ${renderSkillRow('a2', pSkill.a2, 15, 500000, data.active_eq === 'a2', data.active_eq === 'a1')}
  `;
  
  const passiveHtml = `
    ${renderSkillRow('p1', pSkill.p1, 10, 350000, data.passive_eq === 'p1', data.passive_eq === 'p2')}
    ${renderSkillRow('p2', pSkill.p2, 20, 800000, data.passive_eq === 'p2', data.passive_eq === 'p1')}
  `;

  openModal('Thông Tin Thú Cưng', `
    <div class="hero-modal-wrapper">
      <div style="display:flex; gap: 16px; margin-bottom: 16px; align-items:center;">
        <div style="background:#2c2538; border-radius:12px; padding:12px; border: 2px solid #5d4a85;">
          ${petSVG(pId, 64)}
        </div>
        <div style="flex:1;">
          <div style="font-size: 18px; font-weight:bold; color: #f2c231; margin-bottom: 4px;">Lv.${st.level}</div>
          <div style="font-size: 14px;">${pId === 'sans' ? 'DODGE' : 'HP'} Cơ bản: <b>${st.maxHp}</b> (+${st.enhHpLevel} Cường hóa)</div>
          <div style="font-size: 14px;">ATK Cơ bản: <b>${st.atk}</b> (+${st.enhAtkLevel} Cường hóa)</div>
          <div style="font-size: 14px;">Tốc đánh: <b>${st.spd}</b> (+${st.enhSpdLevel} Cường hóa)</div>
          <div class="h-r-bar" style="margin-top:8px;"><div class="h-r-fill" style="width:${pId === 'sans' || st.level >= 30 ? 100 : Math.min(100, st.exp/st.nextExp*100)}%"></div><span>${pId === 'sans' ? 'MAX LEVEL' : (st.level >= 30 ? 'MAX LEVEL' : `EXP: ${Math.floor(st.exp)}/${st.nextExp}`)}</span></div>
        </div>
      </div>
      
      <div class="hero-panel-section">Kỹ Năng Chủ Động (Chọn 1)</div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${activeHtml}
      </div>
      
      <div class="hero-panel-section" style="margin-top:16px;">Kỹ Năng Bị Động (Chọn 1)</div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${passiveHtml}
      </div>
      
      <div class="hero-panel-section" style="margin-top:16px;">Cường Hóa (Enhance)</div>
      <div class="betsides">
        <div class="betside hero-deploy-btn" id="pet-enh-hp" data-pid="${pId}" data-cost="${st.enhHpCost}" style="margin-top:0; padding:10px; font-size:14px;">
          ${pId === 'sans' ? '+20% DODGE' : '+15% HP'}<br><span style="font-size:12px; font-weight:normal;">(${st.enhHpCost} Vàng)</span>
        </div>
        ${pId === 'sans' ? '' : `
        <div class="betside hero-deploy-btn" id="pet-enh-atk" data-pid="${pId}" data-cost="${st.enhAtkCost}" style="margin-top:0; padding:10px; font-size:14px;">
          +10% ATK<br><span style="font-size:12px; font-weight:normal;">(${st.enhAtkCost} Vàng)</span>
        </div>
        <div class="betside hero-deploy-btn" id="pet-enh-spd" data-pid="${pId}" data-cost="${st.enhSpdCost}" style="margin-top:0; padding:10px; font-size:14px;">
          +0.1 SPD<br><span style="font-size:12px; font-weight:normal;">(${st.enhSpdCost} Vàng)</span>
        </div>
        `}
      </div>
      
      <div class="hero-deploy-btn" id="pet-back-btn" style="margin-top: 16px; background: #2c2538; border-color: #5d4a85;">
        Quay Lại
      </div>
    </div>
  `);
  
  const mbody = All.$id('mbody');
}

export function openHeroMode() {
  initHeroState();
  All.closeWin(); // Đóng bảng Farm chính thay vì chỉ ẩn display
  
  if (ctx.S.hero.party.length === 0) {
    All.toast('Vui lòng chọn Đội hình trước!');
    openHeroPanel();
    return;
  }
  
  const bar = All.$id('hero-bar');
  if (bar) bar.style.display = 'flex';
  
  // Tính các buff toàn đội (party buffs)
  let partyHpMult = 1;
  let partyAtkMult = 1;
  let partyCritMult = 0;
  let partySpdMult = 0;
  let partyDodge = 0;
  let partyDmgResist = 0;
  
  ctx.S.hero.party.forEach(pId => {
    const data = ctx.S.hero.roster[pId] || {};
    const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
    const pKey = data.passive_eq;
    if (pKey && pSkill[pKey]) {
      const type = pSkill[pKey].type;
      const val = pSkill[pKey].val;
      if (type === 'max_hp_party') partyHpMult += val;
      if (type === 'party_speed') partySpdMult += val;
      if (type === 'party_dodge') partyDodge += val;
      if (type === 'party_crit') partyCritMult += val;
      if (type === 'party_dmg_resist') partyDmgResist += val;
      if (type === 'atk_party') partyAtkMult += val;
    }
  });

  // Khởi tạo Run
  ctx.S.hero.pressure = 0;
  runState = {
    stage: 1,
    pets: ctx.S.hero.party.map(pId => {
      const st = getPetStats(pId);
      const data = ctx.S.hero.roster[pId] || {};
      const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
      
      let atkMult = partyAtkMult;
      let hpMult = partyHpMult;
      let critRate = 0.1 + partyCritMult; // Base crit
      let critDmg = 2.0;  // Base crit dmg
      let dodge = partyDodge;
      let lifesteal = 0;
      let cheatDeath = 0;
      let atkSpeed = st.spd * (1 + partySpdMult);
      let reflect = 0;
      let armorPen = 0;
      let dmgResist = partyDmgResist;
      
      const pKey = data.passive_eq;
      if (pKey && pSkill[pKey]) {
        const type = pSkill[pKey].type;
        const val = pSkill[pKey].val;
        if (type === 'atk_up') atkMult += val;
        if (type === 'crit_rate') critRate += val;
        if (type === 'crit_dmg') critDmg = val;
        if (type === 'dodge') dodge += val;
        if (type === 'lifesteal') lifesteal += val;
        if (type === 'atk_speed') atkSpeed *= val;
        if (type === 'reflect') reflect += val;
        if (type === 'armor_pen') armorPen += val;
        if (type === 'dmg_reduction') dmgResist += val;
        if (type === 'cheat_death') cheatDeath = val;
        if (type === 'berserk') { atkMult *= (1 + val); hpMult *= 0.5; }
      }
      
      atkSpeed = Math.min(5.0, atkSpeed);
      
      let finalHp = Math.floor(st.maxHp * hpMult);
      let finalAtk = Math.floor(st.atk * atkMult);
      if (pKey && pSkill[pKey] && pSkill[pKey].type === 'hp_to_atk') {
        finalAtk += Math.floor(finalHp * pSkill[pKey].val);
      }

      const aKey = data.active_eq;
      let maxCd = 0;
      if (aKey && pSkill[aKey]) maxCd = pSkill[aKey].cd || 0;
      
      return { 
        id: pId, 
        maxHp: finalHp, hp: finalHp, shield: 0,
        hpMult, atkMult,
        atk: finalAtk, 
        cd: 1.0 / atkSpeed, maxCd: 1.0 / atkSpeed,
        crit: critRate, critDmg: critDmg,
        dodge, lifesteal, cheatDeath, reflect, armorPen, dmgResist,
        skillCd: maxCd, 
        skillMaxCd: maxCd,
        skillActiveTime: 0,
        combo: 0 // for starBell
      };
    }),
    monsters: [], focusTarget: null, waveTime: 0
  };
  
  spawnMonster();
  renderHeroUI();
  placeHeroBar();
  
  if (!heroLoop) {
    lastTick = Date.now();
    heroLoop = requestAnimationFrame(heroTick);
  }
  heroToast('Taskbar Hero đã xuất phát!');
}

export function closeHeroMode() {
  const bar = All.$id('hero-bar');
  if (bar) bar.style.display = 'none';
  if (heroLoop) {
    cancelAnimationFrame(heroLoop);
    heroLoop = null;
  }
  if (runState) {
      if (runState.projectiles) {
          runState.projectiles.forEach(p => { if (p.el) p.el.remove(); });
          runState.projectiles = [];
      }
      if (runState.pets) {
          runState.pets.forEach(p => { if (p.gbEl) { p.gbEl.remove(); p.gbEl = null; p.gbClosing = false; } });
      }
  }
  window.removeEventListener('resize', placeHeroBar);
  runState = null;
  const orb = All.$id('orb');
  if (orb) orb.style.display = 'flex';
}

let hToastTimer = null;
export function heroToast(msg) {
  const t = All.$id('hero-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  if (hToastTimer) clearTimeout(hToastTimer);
  hToastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

export function cashOutHero() {
  if (ctx.S.hero.gold > 0) {
    const g = ctx.S.hero.gold;
    ctx.S.coins = (ctx.S.coins || 0) + g;
    heroToast(`Đã rút ${g.toLocaleString()}G về trang trại!`);
    ctx.S.hero.gold = 0;
    save();
    updateHeroStats();
  } else {
    heroToast('Chưa có Vàng để rút!');
  }
}

function spawnMonster() {
  if (!runState) return;
  runState.isTransitioning = false;
  const numPets = runState.pets.filter(p => p.hp > 0).length;
  if (numPets === 0) return;
  
  const numMobs = Math.floor(Math.random() * numPets) + 1;
  const isBoss = runState.stage > 0 && runState.stage % 5 === 0;
  
  runState.monsters = [];
  const cropKeys = Object.keys(CROPS);
  
  for (let i = 0; i < numMobs; i++) {
    const isThisBoss = isBoss && (i === 0);
    const hpMult = isThisBoss ? 5 : 1;
    const pressure = ctx.S.hero.pressure || 0;
    const pressureMult = 1 + (pressure * 0.05);

    const baseMaxHp = Math.floor(100 * Math.pow(1.08, runState.stage - 1) * hpMult * pressureMult);
    const baseAtk = Math.floor(10 * Math.pow(1.06, runState.stage - 1) * (isThisBoss ? 2 : 1) * pressureMult);
    const baseCd = 2.0;

    let hpScale = 0.8 + Math.random() * 0.4;
    let atkScale = 0.8 + Math.random() * 0.4;
    let cdScale = 0.8 + Math.random() * 0.4;

    if (!isThisBoss) {
      cdScale = hpScale * atkScale; 
    } else {
      hpScale = 0.9 + Math.random() * 0.3;
      atkScale = 0.9 + Math.random() * 0.3;
      cdScale = 0.7 + Math.random() * 0.4;
    }

    const maxHp = Math.floor(baseMaxHp * hpScale);
    const atk = Math.floor(baseAtk * atkScale);
    const maxCd = Math.max(0.5, baseCd * cdScale);
    
    const randomCrop = cropKeys[Math.floor(Math.random() * cropKeys.length)];
    
    runState.monsters.push({
      idx: i,
      id: randomCrop,
      hp: maxHp,
      maxHp: maxHp,
      atk: atk,
      cd: maxCd,
      maxCd: maxCd,
      isBoss: isThisBoss,
      isDead: false,
      x: 350 + (i * 45)
    });
  }
  
  runState.focusTarget = null;
  runState.waveTime = 0;
  renderMonstersUI();
}

// @ts-ignore
window.focusMonster = function(idx) {
  if (!runState || !runState.monsters[idx] || runState.monsters[idx].hp <= 0) return;
  runState.focusTarget = idx;
  runState.monsters.forEach((m, i) => {
    const mEl = All.$id('hmob-' + i);
    if (!mEl) return;
    const isFocused = runState.focusTarget === i;
    const bossStyle = m.isBoss ? 'drop-shadow(0 0 5px #ff0000)' : 'none';
    mEl.style.filter = isFocused ? 'drop-shadow(0 0 8px #ffeb3b)' : bossStyle;
  });
};

function renderMonstersUI() {
  const em = All.$id('hero-enemy');
  if (!em || !runState) return;
  
  em.innerHTML = runState.monsters.map((m, i) => {
    const scale = m.isBoss ? 'scale(1.5)' : '';
    const bossStyle = m.isBoss ? 'filter: drop-shadow(0 0 5px #ff0000);' : '';
    const focusStyle = runState.focusTarget === i ? 'filter: drop-shadow(0 0 8px #ffeb3b);' : bossStyle;
    return `
      <div class="hero-mob idle" id="hmob-${i}" onclick="focusMonster(${i})" style="position: absolute; transform: translate3d(${m.x}px, 0, 0); transform-origin: bottom center; transition: transform 0.1s linear; ${focusStyle}">
        <div class="hp-bar-mini" style="${m.isBoss ? 'width: 48px;' : ''}"><div class="hp-fill-mini" id="hp-mob-${i}" style="width: ${(m.hp/m.maxHp)*100}%"></div></div>
        <div class="hp-bar-mini" style="${m.isBoss ? 'width: 48px;' : ''}"><div class="cd-fill-mini" id="cd-mob-${i}" style="width: ${Math.min(100, Math.max(0, ((m.maxCd-m.cd)/m.maxCd)*100))}%"></div></div>
        <div style="transform: ${scale}">${spriteSVG(CROPS[m.id].sp || 'seedLight', 32)}</div>
      </div>
    `;
  }).join('');
}

function heroTick() {
  if (!heroLoop) return;
  heroLoop = requestAnimationFrame(heroTick);

  const now = Date.now();
  const dt = now - lastTick;
  lastTick = now;
  
  if (!runState || !runState.monsters || runState.isTransitioning) return;
  runState.waveTime += dt / 1000;
  
  const partyEl = All.$id('hero-party');
  
  const alivePets = runState.pets.filter(p => p.hp > 0);
  if (alivePets.length === 0) {
    runState.monsters = [];
    runState.isTransitioning = true;
    heroToast('Đội hình đã gục ngã! Về Stage 1...');
    setTimeout(() => {
      if (!runState) return;
      ctx.S.hero.pressure = 0; // Đặt lại áp lực khi chết
      runState.stage = 1;
      runState.pets.forEach(p => p.hp = p.maxHp);
      renderHeroUI();
      spawnMonster();
    }, 3000);
    return;
  }
  
  let allMonstersDead = true;
  let anyMonsterInPosition = false;
  
  runState.monsters.forEach(m => {
    if (m.hp <= 0) {
      if (!m.isDead) {
        m.isDead = true;
        const mEl = All.$id('hmob-' + m.idx);
        if (mEl) {
          mEl.classList.remove('idle', 'hurt', 'attack');
          mEl.style.transition = 'all 0.4s ease-out';
          mEl.style.opacity = '0';
          mEl.style.transform = `translate3d(${m.x}px, 0, 0) scale(0.1)`;
          mEl.style.pointerEvents = 'none';
          setTimeout(() => showFloatDamage('KO', mEl, '#ffaa00'), 0);
        }
      }
      return;
    }
    allMonstersDead = false;
    
    const targetX = 200 + (m.idx * 45);
    const mEl = All.$id('hmob-' + m.idx);
    
    if (m.x > targetX) {
      m.x -= (40 * (dt / 1000));
      m.x = Math.max(targetX, m.x);
      if (mEl) mEl.style.transform = `translate3d(${m.x}px, 0, 0)`;
    } else {
      anyMonsterInPosition = true;
    }
  });
  
  if (allMonstersDead) {
    // 3. Stage Clear
    runState.isTransitioning = true;
    
    setTimeout(() => {
      if (!runState || !runState.monsters) return;
      
      let totalGold = 0;
      runState.monsters.forEach(m => {
         totalGold += Math.floor((runState.stage * 30 + 100) * 0.6 * (m.isBoss ? 5 : 1) * (0.8 + Math.random() * 0.4));
      });
      
      let pGoldMult = 1.0;
      runState.pets.forEach(p => {
         const data = ctx.S.hero.roster[p.id];
         if (data && data.passive_eq) {
           const sk = PET_SKILLS[p.id]?.[data.passive_eq];
           if (sk && sk.type === 'gold_drop') pGoldMult *= sk.val;
         }
      });
      ctx.S.hero.gold += Math.floor(totalGold * pGoldMult);
      
      let totalExp = 0;
      runState.monsters.forEach(m => {
         totalExp += (runState.stage * 10 + 5) * (m.isBoss ? 5 : 1);
      });
      
      runState.pets.forEach(p => {
        if (!ctx.S.hero.roster[p.id]) ctx.S.hero.roster[p.id] = { level: 1, exp: 0, enhHp: 0, enhAtk: 0 };
        const petData = ctx.S.hero.roster[p.id];
        if (petData.exp === undefined || isNaN(petData.exp)) petData.exp = 0;
        
        const pEl = All.$id('hpet-' + runState.pets.indexOf(p));
        if (p.id !== 'sans') petData.exp += Math.floor(totalExp / runState.pets.length);
        
        let leveledUp = false;
        while (petData.level < 30) {
          const nextExp = Math.floor(500 * Math.pow(1.5, petData.level - 1));
          if (petData.exp >= nextExp) {
            petData.exp -= nextExp;
            petData.level++;
            leveledUp = true;
          } else {
            break;
          }
        }
        
        if (petData.level >= 30) {
          petData.level = 30;
          petData.exp = Math.floor(500 * Math.pow(1.5, 29)); // Cap it
        }
        
        if (leveledUp) {
          if (pEl) setTimeout(() => showFloatDamage('LEVEL UP!', pEl, '#f2c231'), 500);
          heroToast((PETS[p.id]?.name || 'Pet') + ' vừa lên cấp ' + petData.level + '!');
          const st = getPetStats(p.id);
          const oldMax = p.maxHp;
          p.maxHp = Math.floor(st.maxHp * (p.hpMult || 1));
          p.hp += (p.maxHp - oldMax);
          p.atk = Math.floor(st.atk * (p.atkMult || 1));
        }
      });
      
      const boss = runState.monsters.find(m => m.isBoss);
      if (boss) {
        ctx.S.hero.pressure = (ctx.S.hero.pressure || 0) + 1;
        const r = Math.random();
        if (r < 0.5) { ctx.S.tickets = ctx.S.tickets || {}; ctx.S.tickets.norm = (ctx.S.tickets.norm || 0) + 1; showFloatDrop('ticketNorm', partyEl); }
        else if (r < 0.8) { ctx.S.ferts['shiny'] = (ctx.S.ferts['shiny'] || 0) + 1; showFloatDrop('toolFert', partyEl); }
      } else {
        const m = runState.monsters[0];
        const r = Math.random();
        if (r < 0.1) { ctx.S.seeds[m.id] = (ctx.S.seeds[m.id] || 0) + 1; showFloatDrop(CROPS[m.id].sp || 'seedLight', partyEl); }
        else if (r < 0.15) { ctx.S.ferts['compost'] = (ctx.S.ferts['compost'] || 0) + 1; showFloatDrop('toolFert', partyEl); }
      }
      
      runState.stage++;
      if (runState.stage > ctx.S.hero.maxStage) ctx.S.hero.maxStage = runState.stage;
      
      if (runState.projectiles) {
          runState.projectiles.forEach(p => { if (p.el) p.el.remove(); });
          runState.projectiles = [];
      }

      runState.pets.forEach(p => { 
        if (p.hp > 0) p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.2); 
        if (p.id === 'sans') { p.muchBetterReady = true; p.badTimeReady = true; }
        if (p.gbEl) { p.gbEl.remove(); p.gbEl = null; p.gbClosing = false; }
      });
      
      save();
      renderHeroUI();
      spawnMonster();
    }, 500);
    return;
  }
  
  // Get active targets (in position)
  const activeMonsters = runState.monsters.filter(m => m.hp > 0 && m.x <= 200 + (m.idx * 45) + 2);
  
  if (activeMonsters.length > 0) {
    // 1. Pets Skills & Attack
    alivePets.forEach((p) => {
      const pIdx = runState.pets.indexOf(p);
      const pEl = All.$id('hpet-' + pIdx);
      const data = ctx.S.hero.roster[p.id] || {};
      const pSkill = PET_SKILLS[p.id];
      const passEq = data.passive_eq;
      
      if (passEq && pSkill && pSkill[passEq]) {
        const ps = pSkill[passEq];
        if (ps.type === 'hp_regen') {
          const heal = p.maxHp * ps.val * (dt / 1000);
          p.hp = Math.min(p.maxHp, p.hp + heal);
          const hpPet = All.$id('hp-pet-' + pIdx);
          if (hpPet) hpPet.style.width = ((p.hp / p.maxHp) * 100) + '%';
        }
        if (ps.type === 'curse_aura') {
           activeMonsters.forEach(m => {
              const cDmg = m.maxHp * ps.val * (dt / 1000);
              m.hp -= cDmg;
           });
        }
      }
      
      // Bone Time buff countdown
      if (p.boneTimeActive && p.boneTimeDuration > 0) {
        p.boneTimeDuration -= dt / 1000;
        if (p.boneTimeDuration <= 0) {
            p.boneTimeActive = false;
            p.boneTimeDuration = 0;
            p.spdBuff = p.spdBuff ? p.spdBuff / 3 : 1;
            if (pEl) setTimeout(() => showFloatDamage('BONE TIME END', pEl, '#888'), 0);
        }
      }
      
      // Active skills (with CD and Duration logic)
      if (p.skillActiveTime > 0) {
        p.skillActiveTime -= dt / 1000;
        const actEq = data.active_eq;
        if (actEq && pSkill && pSkill[actEq]) {
            const aSk = pSkill[actEq];
            if (aSk.type === 'laser') {
                let tMob = null;
                if (runState.focusTarget !== null && runState.monsters[runState.focusTarget] && runState.monsters[runState.focusTarget].hp > 0 && runState.monsters[runState.focusTarget].x <= 200 + (runState.focusTarget * 45) + 2) {
                  tMob = runState.monsters[runState.focusTarget];
                } else {
                  tMob = activeMonsters[Math.floor(Math.random() * activeMonsters.length)];
                }
                const ldmg = (p.atk * aSk.val) * (dt/1000);
                tMob.hp -= ldmg;
                if (Math.random() < 0.1) {
                  const mobEl = All.$id('hmob-' + tMob.idx);
                  spawnSkillEffect(pEl, mobEl, aSk.type);
                }
            } else if (aSk.type === 'gaster_blaster') {
                let tMob = null;
                if (runState.focusTarget !== null && runState.monsters[runState.focusTarget] && runState.monsters[runState.focusTarget].hp > 0 && runState.monsters[runState.focusTarget].x <= 200 + (runState.focusTarget * 45) + 2) {
                  tMob = runState.monsters[runState.focusTarget];
                } else {
                  tMob = activeMonsters[Math.floor(Math.random() * activeMonsters.length)];
                }
                
                if (!p.gbEl && !p.gbClosing) {
                    const scene = pEl ? (pEl.closest('.hero-scene') || All.sh.querySelector('.hero-scene')) : null;
                    if (scene) {
                        p.gbEl = document.createElement('div');
                        p.gbEl.style.cssText = 'position:absolute; bottom:16px; left:-80px; transition:left 0.25s ease-out; z-index:10;';
                        p.gbEl.innerHTML = `<img src="${SANS_HERO_SPRITES.gb_open_01}" style="height:64px; image-rendering:pixelated; display:block;">`;
                        scene.appendChild(p.gbEl);
                        const gbImg = p.gbEl.querySelector('img');
                        // Fly in from left and stop next to Sans (Sans is at 60 + pIdx*45)
                        setTimeout(() => { if (p.gbEl) p.gbEl.style.left = (60 + (pIdx * 45) + 25) + 'px'; }, 10);
                        setTimeout(() => { if (gbImg) gbImg.src = SANS_HERO_SPRITES.gb_open_02; }, 250);
                        setTimeout(() => { if (gbImg) gbImg.src = SANS_HERO_SPRITES.gb_fire_01; }, 400);
                        setTimeout(() => { if (gbImg) gbImg.src = SANS_HERO_SPRITES.gb_fire_02; }, 550);
                        setTimeout(() => { if (gbImg) gbImg.src = SANS_HERO_SPRITES.gb_fire_03; }, 700);
                    }
                }

                p.gasterTick = (p.gasterTick || 0) + dt/1000;
                if (p.gasterTick >= 0.25) { // 4 ticks per second
                    p.gasterTick -= 0.25;
                    const dmg = Math.max(1, Math.floor(tMob.maxHp * 0.01)); // 1% max hp
                    tMob.hp -= dmg;
                    tMob.karma = (tMob.karma || 0) + 1;
                    const mobEl = All.$id('hmob-' + tMob.idx);
                    if (mobEl) setTimeout(() => showFloatDamage('-' + dmg, mobEl, '#fff'), 0);
                    spawnSkillEffect(p.gbEl || pEl, mobEl, 'laser_sans');
                }
                
                if (p.skillActiveTime <= 0 && p.gbEl && !p.gbClosing) {
                    p.gbClosing = true;
                    const img = p.gbEl.querySelector('img');
                    if (img) img.src = SANS_HERO_SPRITES.gb_close;
                    setTimeout(() => {
                        if (p.gbEl) { p.gbEl.remove(); p.gbEl = null; }
                        p.gbClosing = false;
                    }, 300);
                }
            }
        }
      } else if (p.skillMaxCd > 0) {
        let stSpdMult = 1.0;
        if (p.spdBuff) stSpdMult *= p.spdBuff;
        if (p.badTimeTimer > 0) stSpdMult *= 2.0; // GET DUNKED ON speedup
        p.skillCd -= (dt / 1000) * stSpdMult;
        const skBar = All.$id('sk-pet-' + pIdx);
        if (skBar) skBar.style.width = Math.min(100, Math.max(0, ((p.skillMaxCd - p.skillCd) / p.skillMaxCd) * 100)) + '%';
        
        if (p.skillCd <= 0) {
          const actEq = data.active_eq;
          if (actEq && pSkill && pSkill[actEq]) {
            const aSk = pSkill[actEq];
            p.skillCd = p.skillMaxCd;
            p.skillActiveTime = aSk.duration || 0;
            
            // Tìm mục tiêu ưu tiên
            let tMob = null;
            if (runState.focusTarget !== null && runState.monsters[runState.focusTarget] && runState.monsters[runState.focusTarget].hp > 0 && runState.monsters[runState.focusTarget].x <= 200 + (runState.focusTarget * 45) + 2) {
              tMob = runState.monsters[runState.focusTarget];
            } else {
              tMob = activeMonsters[Math.floor(Math.random() * activeMonsters.length)];
            }
            const mobEl = All.$id('hmob-' + tMob.idx);

            // Execute Active Skill Burst
            if (aSk.type === 'heal_party' || aSk.type === 'heal_self') {
              const targets = aSk.type === 'heal_party' ? alivePets : [p];
              targets.forEach(ap => {
                const healAmt = (aSk.val < 1) ? ap.maxHp * aSk.val : aSk.val;
                ap.hp = Math.min(ap.maxHp, ap.hp + healAmt);
                const tIdx = runState.pets.indexOf(ap);
                const tEl = All.$id('hpet-' + tIdx);
                setTimeout(() => showFloatDamage('+' + Math.floor(healAmt), tEl, '#a4dc8c'), 0);
                const hpPet = All.$id('hp-pet-' + tIdx);
                if (hpPet) hpPet.style.width = ((ap.hp / ap.maxHp) * 100) + '%';
                spawnSkillEffect(pEl, tEl, aSk.type);
              });
            } else if (aSk.type === 'slam_dmg') {
              const dmg = p.atk * aSk.val;
              tMob.hp -= dmg;
              setTimeout(() => showFloatDamage('-' + dmg, mobEl, '#ff5555'), 150);
              spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === 'multi_strike') {
              if (p.id === 'naoyaSlime') {
                  // [Tawa Hook]: Kích hoạt Cutscene Điện ảnh
                  runState.isTransitioning = true; // Đóng băng thời gian
                  playNaoyaCutscene(p, pEl, mobEl, () => {
                      // Đợi chém xong mới xả sát thương tổng cộng dồn
                      let totalDmg = 0;
                      for(let i = 0; i < aSk.val; i++) {
                          if (tMob.hp > 0) {
                              tMob.hp -= p.atk * 0.5;
                              totalDmg += p.atk * 0.5;
                          }
                      }
                      setTimeout(() => showFloatDamage('-' + Math.floor(totalDmg), mobEl, '#ff0000'), 0);
                      
                      // --- HỆ THỐNG GIAO TIẾP (NAOYA DIALOGUE) ---
                      const isDead = tMob.hp <= 0;
                      const quotesAlive = ["Rác rưởi!", "Chậm quá đấy!", "Biết thân biết phận đi!"];
                      const quote = isDead 
                          ? "Mày không phải Toji." 
                          : quotesAlive[Math.floor(Math.random() * quotesAlive.length)];
                      
                      // Hiện Bong bóng thoại cho Naoya
                      setTimeout(() => showFloatDamage('💬 ' + quote, pEl, '#fcd34d'), 300);

                      runState.isTransitioning = false; // Mở lại trận đấu
                  });
              } else {
                  for(let i=0; i<aSk.val; i++) {
                    setTimeout(() => {
                        if (tMob.hp > 0) {
                            tMob.hp -= p.atk;
                            spawnAttackEffect(p.id, pEl, mobEl, false, false);
                        }
                    }, i * 150);
                  }
              }
            } else if (aSk.type === 'atk_spd_self') {
               p.spdBuff = aSk.val; 
               p.spdBuffTimer = aSk.duration;
               setTimeout(() => showFloatDamage('SPD UP', pEl, '#ffff00'), 0);
            } else if (aSk.type === 'charm') {
               tMob.atkDebuff = aSk.val;
               tMob.atkDebuffTimer = aSk.duration;
               setTimeout(() => showFloatDamage('CHARMED', mobEl, '#ff88dd'), 0);
            } else if (aSk.type === 'shield_self') {
               const shieldAmt = (aSk.val < 1) ? p.maxHp * aSk.val : aSk.val;
               p.shield = (p.shield || 0) + shieldAmt;
               setTimeout(() => showFloatDamage('SHIELD', pEl, '#aaddff'), 0);
               spawnSkillEffect(pEl, pEl, 'shield');
            } else if (aSk.type === 'shield_party') {
               alivePets.forEach(ap => {
                   const shieldAmt = (aSk.val < 1) ? ap.maxHp * aSk.val : aSk.val;
                   ap.shield = (ap.shield || 0) + shieldAmt;
                   const tIdx = runState.pets.indexOf(ap);
                   const tEl = All.$id('hpet-' + tIdx);
                   setTimeout(() => showFloatDamage('SHIELD', tEl, '#aaddff'), 0);
                   spawnSkillEffect(pEl, tEl, 'shield');
               });
            } else if (aSk.type === 'slow') {
               tMob.spdDebuff = aSk.val;
               tMob.spdDebuffTimer = aSk.duration;
               setTimeout(() => showFloatDamage('SLOWED', mobEl, '#99ddff'), 0);
            } else if (aSk.type === 'thorn_whip') {
               const dmg = p.atk * aSk.val;
               tMob.hp -= dmg;
               p.hp = Math.min(p.maxHp, p.hp + dmg * 0.5);
               setTimeout(() => showFloatDamage('-' + dmg, mobEl, '#4CAF50'), 0);
               spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === 'cd_reduce') {
               alivePets.forEach(ap => { ap.skillCd = Math.max(0, ap.skillCd - aSk.val); });
               setTimeout(() => showFloatDamage('CD -' + aSk.val + 's', pEl, '#00ffff'), 0);
            } else if (aSk.type === 'lightning_strike') {
               const dmg = p.atk * aSk.val;
               tMob.hp -= dmg;
               setTimeout(() => showFloatDamage('-' + dmg, mobEl, '#00ffff'), 0);
               spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === 'push_back') {
               tMob.x = Math.min(350, tMob.x + 50);
               tMob.cd += 0.5;
               setTimeout(() => showFloatDamage('KNOCKBACK', mobEl, '#fff'), 0);
            } else if (aSk.type === 'soul_reap') {
               const dmg = tMob.hp * aSk.val;
               tMob.hp -= dmg;
               setTimeout(() => showFloatDamage('-' + Math.floor(dmg), mobEl, '#9c27b0'), 0);
               spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === 'fear') {
               tMob.stunCd = (tMob.stunCd || 0) + aSk.duration;
               setTimeout(() => showFloatDamage('FEAR', mobEl, '#5e35b1'), 0);
            } else if (aSk.type === 'random_dmg') {
               const randomVal = 1 + Math.random() * (aSk.val - 1);
               const dmg = Math.floor(p.atk * randomVal);
               tMob.hp -= dmg;
               setTimeout(() => showFloatDamage('-' + dmg, mobEl, '#f24d4d'), 150);
               spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === 'random_buff') {
               alivePets.forEach(ap => {
                  ap.atkBuff = (ap.atkBuff || 0) + aSk.val;
                  ap.atkBuffTimer = aSk.duration;
                  setTimeout(() => showFloatDamage('BUFFED', All.$id('hpet-' + runState.pets.indexOf(ap)), '#ffd94d'), 0);
               });
            } else if (aSk.type === 'stun_bolt') {
               tMob.stunCd = (tMob.stunCd || 0) + aSk.duration;
               setTimeout(() => showFloatDamage('STUN', mobEl, '#ccc'), 0);
               spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === 'dispel') {
               const dmg = p.atk * aSk.val;
               tMob.hp -= dmg;
               tMob.atkBuff = 0;
               setTimeout(() => showFloatDamage('DISPEL -' + dmg, mobEl, '#00bcd4'), 0);
               spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === 'hellfire') {
               p.hp = Math.max(1, p.hp - (p.hp * 0.2));
               const dmg = p.atk * aSk.val;
               tMob.hp -= dmg;
               setTimeout(() => showFloatDamage('-' + dmg, mobEl, '#ff5722'), 0);
               spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === 'vampiric_buff') {
               alivePets.forEach(ap => { if (ap !== p) ap.hp = Math.max(1, ap.hp - ap.maxHp * 0.1); });
               p.atkBuff = (p.atkBuff || 1) + aSk.val;
               p.atkBuffTimer = aSk.duration;
               setTimeout(() => showFloatDamage('VAMPIRIC', pEl, '#d32f2f'), 0);
            } else if (aSk.type === 'resurrect') {
               const deadPets = runState.pets.filter(pt => pt.hp <= 0);
               if (deadPets.length > 0) {
                   const dp = deadPets[0];
                   dp.hp = Math.floor(dp.maxHp * aSk.val);
                   const dpEl = All.$id('hpet-' + runState.pets.indexOf(dp));
                   if (dpEl) {
                       dpEl.style.opacity = '1';
                       setTimeout(() => showFloatDamage('REVIVE', dpEl, '#ffff00'), 0);
                   }
               }
            } else if (aSk.type === 'absorb') {
               p.absorbCharge = aSk.val;
               setTimeout(() => showFloatDamage('ABSORB', pEl, '#e040fb'), 0);
            } else if (aSk.type === 'star_fall') {
               const dmg = p.atk * aSk.val;
               tMob.hp -= dmg;
               tMob.stunCd = (tMob.stunCd || 0) + 1.0;
               setTimeout(() => showFloatDamage('STARFALL -' + dmg, mobEl, '#ffeb3b'), 0);
               spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === 'party_speed_buff') {
               alivePets.forEach(ap => { ap.spdBuff = aSk.val; ap.spdBuffTimer = aSk.duration; });
               setTimeout(() => showFloatDamage('SPD BUFF', pEl, '#00e676'), 0);
            } else if (aSk.type === 'gaster_blaster') {
                p.gasterTick = 0;
                p.gbClosing = false;
            } else if (aSk.type === 'blind') {
               tMob.blindCd = aSk.duration;
               setTimeout(() => showFloatDamage('BLIND', mobEl, '#607d8b'), 0);
            } else if (aSk.type === 'sugar_rush') {
               p.spdBuff = aSk.val;
               p.atkDebuff = 0.5;
               p.sugarTimer = aSk.duration;
               setTimeout(() => showFloatDamage('SUGAR RUSH', pEl, '#ff80ab'), 0);
            } else if (aSk.type === 'bone_time') {
                // Buff mode: x3 attack speed + bone on every hit for the duration
                p.boneTimeActive = true;
                p.boneTimeDuration = aSk.duration || 2;
                p.spdBuff = (p.spdBuff || 1) * 3;
                setTimeout(() => showFloatDamage('BONE TIME!', pEl, '#00ffff'), 0);
            } else if (aSk.type === 'snowball_roll') {
               const dmg = p.atk * aSk.val;
               tMob.hp -= dmg;
               tMob.x = Math.min(350, tMob.x + 30);
               setTimeout(() => showFloatDamage('-' + dmg, mobEl, '#e0f7fa'), 0);
               spawnSkillEffect(pEl, mobEl, aSk.type);
            } else if (aSk.type === 'coin_toss') {
               const cost = Math.floor(ctx.S.hero.gold * 0.2);
               if (cost > 0) ctx.S.hero.gold -= cost;
               const dmg = Math.floor(tMob.maxHp * 0.5);
               tMob.hp -= dmg;
               setTimeout(() => showFloatDamage('-' + dmg + ' True DMG', mobEl, '#ffca28'), 0);
            } else if (aSk.type === 'atk_up') {
               p.atkBuff = (p.atkBuff || 1) + aSk.val;
               p.atkBuffTimer = aSk.duration;
               setTimeout(() => showFloatDamage('ATK UP', pEl, '#f44336'), 0);
            }
          }
        }
      }
      
      // Manage Buff/Debuff Timers
      if (p.atkBuffTimer > 0) { p.atkBuffTimer -= dt/1000; if(p.atkBuffTimer<=0) p.atkBuff = null; }
      if (p.spdBuffTimer > 0) { p.spdBuffTimer -= dt/1000; if(p.spdBuffTimer<=0) p.spdBuff = null; }
      if (p.sugarTimer > 0) { p.sugarTimer -= dt/1000; if(p.sugarTimer<=0) { p.spdBuff = null; p.atkDebuff = null; } }
      if (p.invincibleTimer > 0) { p.invincibleTimer -= dt/1000; }
      if (p.badTimeTimer > 0) { p.badTimeTimer -= dt/1000; }

      let rtSpdMult = 1.0;
      if (p.spdBuff) rtSpdMult *= p.spdBuff;
      
      // Đòn đánh thường
      p.cd -= (dt / 1000) * rtSpdMult;
      const cdBar = All.$id('cd-pet-' + pIdx);
      if (cdBar) cdBar.style.width = Math.min(100, Math.max(0, ((p.maxCd - p.cd) / p.maxCd) * 100)) + '%';
      
      if (p.cd <= 0) {
        p.cd = p.maxCd;
        const styleMult = ctx.S.hero.style === 'attack' ? 1.5 : (ctx.S.hero.style === 'defense' ? 0.6 : 1.0);
        let atkMult = styleMult;
        if (p.atkBuff) atkMult *= p.atkBuff;
        if (p.atkDebuff) atkMult *= p.atkDebuff;
        
        for (let i = 0; i < (p.multiHit || 1); i++) {
          setTimeout(() => {
            if (!runState) return;
            const curActive = runState.monsters.filter(m => m.hp > 0 && m.x <= 200 + (m.idx * 45) + 2);
            if (curActive.length === 0) return;
            
            let tMob = null;
            if (runState.focusTarget !== null && runState.monsters[runState.focusTarget] && runState.monsters[runState.focusTarget].hp > 0 && runState.monsters[runState.focusTarget].x <= 200 + (runState.focusTarget * 45) + 2) {
              tMob = runState.monsters[runState.focusTarget];
            } else {
              tMob = curActive[Math.floor(Math.random() * curActive.length)];
            }
            const mobEl = All.$id('hmob-' + tMob.idx);
            
            p.combo = (p.combo || 0) + 1;
            let isCrit = Math.random() < p.crit;
            let currentCritDmg = p.critDmg;
            if (passEq && pSkill[passEq] && pSkill[passEq].type === 'combo_master' && p.combo % pSkill[passEq].val === 0) {
                isCrit = true;
                if (p.id === 'naoyaSlime') currentCritDmg = 3;
            }
            
            let dmgBase = Math.max(1, Math.floor(p.atk * atkMult * (0.8 + Math.random() * 0.4)));
            if (p.armorPen > 0) dmgBase = Math.floor(dmgBase * (1 + p.armorPen));
            
            if (passEq && pSkill[passEq]) {
                const ps = pSkill[passEq];
                if (ps.type === 'first_strike' && !tMob['fs_' + p.id]) {
                    dmgBase *= ps.val;
                    tMob['fs_' + p.id] = true;
                }
            }
            
            let dmg = isCrit ? Math.floor(dmgBase * currentCritDmg) : dmgBase;
            
            if (passEq && pSkill[passEq] && pSkill[passEq].type === 'splash_dmg') {
                dmg = Math.floor(dmg * (1 + pSkill[passEq].val));
            }
            
            if (passEq && pSkill[passEq] && pSkill[passEq].type === 'execute') {
                const threshold = p.id === 'naoyaSlime' ? pSkill[passEq].val : 0.2;
                const chance = p.id === 'naoyaSlime' ? 1.0 : pSkill[passEq].val;
                if (tMob.hp / tMob.maxHp <= threshold && Math.random() < chance) {
                    dmg = tMob.hp;
                    if (mobEl) setTimeout(() => showFloatDamage('EXECUTE', mobEl, '#ff0000'), 150);
                }
            }

            if (passEq && pSkill[passEq] && pSkill[passEq].type === 'scavenger') {
                if (p.hp >= p.maxHp && Math.random() < pSkill[passEq].val) {
                    ctx.S.hero.gold++;
                    showFloatDamage('+1G', pEl, '#ffca28');
                }
            }

            // Initial burst
            if (passEq && pSkill[passEq] && pSkill[passEq].type === 'initial_burst' && runState.waveTime <= 3.0) {
                dmg = Math.floor(dmg * pSkill[passEq].val);
            }
            
            if (p.id === 'sans') {
                if (!runState.projectiles) runState.projectiles = [];
                const pEl = All.$id('hpet-' + pIdx);
                const scene = pEl ? (pEl.closest('.hero-scene') || All.sh.querySelector('.hero-scene')) : null;
                
                // Always spawn white bone (normal attack)
                const boneEl = document.createElement('div');
                boneEl.style.cssText = 'position:absolute; bottom:18px; left:0; pointer-events:none; z-index:9;';
                boneEl.innerHTML = `<img src="${SANS_HERO_SPRITES.bone_white}" style="height:24px; image-rendering:pixelated; display:block;">`;
                if (scene) scene.appendChild(boneEl);
                runState.projectiles.push({
                    x: 60 + (pIdx * 45), vx: 200,
                    type: 'bone_white', dmg: p.atk, karmaAmt: 2,
                    el: boneEl, hitCd: 0
                });

                // During Bone Time buff: also spawn a bouncing blue bone
                if (p.boneTimeActive) {
                    const blueEl = document.createElement('div');
                    blueEl.style.cssText = 'position:absolute; bottom:18px; left:0; pointer-events:none; z-index:9;';
                    blueEl.innerHTML = `<img src="${SANS_HERO_SPRITES.bone_blue}" style="height:24px; image-rendering:pixelated; display:block;">`;
                    if (scene) scene.appendChild(blueEl);
                    runState.projectiles.push({
                        x: 60 + (pIdx * 45), vx: 200,
                        type: 'bone_blue', dmg: Math.floor(p.atk * 1.5), karmaAmt: 2,
                        el: blueEl, hitCd: 0, bounces: 0, maxBounces: 6
                    });
                }
                
                if (pEl) { pEl.classList.remove('idle'); pEl.classList.add('attack'); setTimeout(() => { pEl.classList.remove('attack'); pEl.classList.add('idle'); }, 300); }
                return; // SKIP NORMAL DAMAGE
            }

            const doDamage = () => {
              tMob.hp -= dmg;
              
              if (p.lifesteal > 0) {
                const heal = Math.floor(dmg * p.lifesteal);
                if (heal > 0) {
                  p.hp = Math.min(p.maxHp, p.hp + heal);
                  setTimeout(() => showFloatDamage('+' + heal, pEl, '#a4dc8c'), 150);
                  const hpPet = All.$id('hp-pet-' + pIdx);
                  if (hpPet) setTimeout(() => { hpPet.style.width = ((p.hp / p.maxHp) * 100) + '%'; }, 150);
                }
              }
            };

            doDamage();

            
            if (pEl) { pEl.classList.remove('idle'); pEl.classList.add('attack'); setTimeout(() => { pEl.classList.remove('attack'); pEl.classList.add('idle'); }, 300); }
            if (mobEl) { setTimeout(() => { mobEl.classList.remove('idle'); mobEl.classList.add('hurt'); setTimeout(() => { mobEl.classList.remove('hurt'); mobEl.classList.add('idle'); }, 200); }, 150); }
            
            spawnAttackEffect(p.id, pEl, mobEl, false, isCrit);
            if (mobEl) setTimeout(() => showFloatDamage('-' + dmg, mobEl, isCrit ? '#f2c231' : null), 150);
          }, i * 200);
        }
      }
    });
    
    // 2. Monster Updates & Attacks
    activeMonsters.forEach(m => {
      const hpMob = All.$id('hp-mob-' + m.idx);
      if (hpMob) hpMob.style.width = Math.max(0, (m.hp / m.maxHp) * 100) + '%';
      const cdMob = All.$id('cd-mob-' + m.idx);
      if (cdMob) cdMob.style.width = Math.min(100, Math.max(0, ((m.maxCd - m.cd) / m.maxCd) * 100)) + '%';
      
      // Update monster debuffs
      if (m.atkDebuffTimer > 0) { m.atkDebuffTimer -= dt/1000; if(m.atkDebuffTimer<=0) m.atkDebuff = null; }
      if (m.spdDebuffTimer > 0) { m.spdDebuffTimer -= dt/1000; if(m.spdDebuffTimer<=0) m.spdDebuff = null; }
      if (m.blindCd > 0) { m.blindCd -= dt/1000; }

      if (m.stunCd && m.stunCd > 0) {
        m.stunCd -= dt / 1000;
      } else {
        let mSpdMult = 1.0;
        if (m.spdDebuff) mSpdMult *= m.spdDebuff;
        m.cd -= (dt / 1000) * mSpdMult;
        if (m.cd <= 0) {
          m.cd = m.maxCd;
          
          let validTargets = alivePets.filter(p => {
             const data = ctx.S.hero.roster[p.id] || {};
             const pSkill = PET_SKILLS[p.id];
             return !(data.passive_eq && pSkill && pSkill[data.passive_eq] && pSkill[data.passive_eq].type === 'stealth');
          });
          if (validTargets.length === 0) validTargets = alivePets;
          const target = validTargets[Math.floor(Math.random() * validTargets.length)];
          
          const mult = ctx.S.hero.style === 'attack' ? 1.5 : (ctx.S.hero.style === 'defense' ? 0.6 : 1.0);
          let isDodge = Math.random() < target.dodge || m.blindCd > 0;
          
          const pIdx = runState.pets.indexOf(target);
          const pEl = All.$id('hpet-' + pIdx);
          const mEl = All.$id('hmob-' + m.idx);
          
          spawnAttackEffect('monster', mEl, pEl, true, false);
          if (mEl) { mEl.classList.remove('idle'); mEl.classList.add('attack'); setTimeout(() => { mEl.classList.remove('attack'); mEl.classList.add('idle'); }, 300); }
          
          if (!isDodge) {
            let mAtkMult = mult;
            if (m.atkDebuff) mAtkMult *= m.atkDebuff;
            let dmg = Math.max(1, Math.floor(m.atk * mAtkMult * (0.8 + Math.random() * 0.4)));
            
            if (target.invincibleTimer > 0) dmg = 0;
            else if (target.dmgResist > 0) dmg = Math.floor(dmg * (1 - target.dmgResist));
            
            if (runState.waveTime <= 2.0 && ctx.S.hero.roster[target.id]?.passive_eq) {
               const pSkill = PET_SKILLS[target.id];
               const pEq = ctx.S.hero.roster[target.id].passive_eq;
               if (pSkill && pSkill[pEq] && pSkill[pEq].type === 'invincible_start') dmg = 0;
            }
            
            if (target.absorbCharge > 0) {
                target.absorbCharge--;
                if (pEl) setTimeout(() => showFloatDamage('ABSORBED', pEl, '#e040fb'), 150);
                dmg = 0;
            }

            if (dmg > 0 && target.reflect > 0) {
               const refDmg = Math.floor(dmg * target.reflect);
               m.hp -= refDmg;
               if (mEl) setTimeout(() => showFloatDamage('-' + refDmg, mEl, '#e06578'), 150);
            }
            
            if (target.shield && target.shield > 0) {
               if (target.shield >= dmg) {
                  target.shield -= dmg;
                  dmg = 0;
                  if (pEl) setTimeout(() => showFloatDamage('BLOCK', pEl, '#aaddff'), 150);
               } else {
                  dmg -= target.shield;
                  target.shield = 0;
               }
            }

            target.hp -= dmg;
            
            // SANS OVERRIDE: Much better & Get dunked on
            if (target.id === 'sans') {
                const sData = ctx.S.hero.roster['sans'];
                if (sData) {
                    if (sData.passive_eq === 'p1' && target.hp <= 0 && target.muchBetterReady !== false) {
                        target.muchBetterReady = false;
                        target.hp = 1;
                        target.invincibleTimer = 3.0; // 3s damage block
                        
                        const scene = pEl ? (pEl.closest('.hero-scene') || All.sh.querySelector('.hero-scene')) : null;
                        if (scene) {
                            const imgBase = pEl ? pEl.querySelector('img') : null;
                            if (imgBase) imgBase.style.opacity = 0;
                            
                            // Calculate position of pEl relative to scene
                            const petRect = pEl.getBoundingClientRect();
                            const sceneRect = scene.getBoundingClientRect();
                            const relLeft = petRect.left - sceneRect.left;
                            const relBottom = sceneRect.bottom - petRect.bottom;

                            const ketchupEl = document.createElement('div');
                            ketchupEl.style.cssText = `position:absolute; bottom:${relBottom}px; left:${relLeft}px; pointer-events:none; z-index:10;`;
                            ketchupEl.innerHTML = `<img src="${SANS_HERO_SPRITES.stool_chup_1}" style="height:32px; image-rendering:pixelated; display:block;">`;
                            scene.appendChild(ketchupEl);
                            
                            const kImg = ketchupEl.querySelector('img');
                            // 10 frames, cycle 3 times over 3s (each frame ~100ms, 30 steps total)
                            const frames = [SANS_HERO_SPRITES.stool_chup_1, SANS_HERO_SPRITES.stool_chup_2, SANS_HERO_SPRITES.stool_chup_3, SANS_HERO_SPRITES.stool_chup_4, SANS_HERO_SPRITES.stool_chup_5, SANS_HERO_SPRITES.stool_chup_6, SANS_HERO_SPRITES.stool_chup_7, SANS_HERO_SPRITES.stool_chup_8, SANS_HERO_SPRITES.stool_chup_9, SANS_HERO_SPRITES.stool_chup_10];
                            for (let i = 1; i <= 30; i++) {
                                setTimeout(() => {
                                    if (kImg) kImg.src = frames[i % 10];
                                }, i * 100);
                            }

                            setTimeout(() => {
                                ketchupEl.remove();
                                if (imgBase) imgBase.style.opacity = 1;
                            }, 3000);
                        }
                        if (pEl) setTimeout(() => showFloatDamage('MUCH BETTER', pEl, '#ff0000'), 0);
                        
                        setTimeout(() => {
                            if (!runState) return;
                            target.hp = Math.min(target.maxHp, target.hp + target.maxHp * 0.5);
                            const hpPet = All.$id('hp-pet-' + pIdx);
                            if (hpPet) hpPet.style.width = ((target.hp / target.maxHp) * 100) + '%';
                            if (pEl) showFloatDamage('HEAL 50%', pEl, '#a4dc8c');
                        }, 3000);
                    }
                    if (sData.passive_eq === 'p2' && (target.hp / target.maxHp) < 0.5 && target.badTimeReady !== false) {
                        target.badTimeReady = false;
                        target.badTimeTimer = 5.0;
                        if (pEl) setTimeout(() => showFloatDamage('GET DUNKED ON!', pEl, '#ff0000'), 0);
                    }
                }
            }
            // >>> END SANS OVERRIDE <<<

            if (target.hp <= 0 && target.cheatDeath > 0) {
               target.cheatDeath--;
               target.hp = 1;
               if (pEl) setTimeout(() => showFloatDamage('CHEAT DEATH', pEl, '#ffd94d'), 150);
            } else if (target.hp < 0) {
               target.hp = 0;
            }
            
            if (dmg > 0) { if (pEl) setTimeout(() => showFloatDamage('-' + dmg, pEl), 150); }
            else if (dmg === 0 && !target.absorbCharge && !target.shield) { if (pEl) setTimeout(() => showFloatDamage('BLOCK', pEl, '#aaddff'), 150); }
            
            if (pEl && target.hp <= 0) setTimeout(() => { pEl.style.opacity = '0.3'; }, 150);
            
            const hpPet = All.$id('hp-pet-' + pIdx);
            if (hpPet) setTimeout(() => { hpPet.style.width = ((target.hp / target.maxHp) * 100) + '%'; }, 150);
          } else {
            if (pEl) setTimeout(() => showFloatDamage('MISS', pEl, '#aaddff'), 150);
          }
        }
      }
    });

    // 3. Projectiles Update
    if (!runState.projectiles) runState.projectiles = [];
    const scene = All.sh.querySelector('.hero-scene');
    for (let i = runState.projectiles.length - 1; i >= 0; i--) {
        const proj = runState.projectiles[i];
        proj.x += proj.vx * (dt/1000);
        let isDead = false;
        
        if (proj.type === 'bone_blue') {
            if (proj.x > 420 || proj.x < 0) { proj.vx *= -1; proj.bounces++; }
            if (proj.bounces >= proj.maxBounces) isDead = true;
        } else if (proj.type === 'bone_white') {
            if (proj.x > 450) isDead = true;
        }
        
        if (isDead) {
            if (proj.el) proj.el.remove();
            runState.projectiles.splice(i, 1);
            continue;
        }
        
        if (proj.el) {
            proj.el.style.left = proj.x + 'px';
        }
        
        proj.hitCd = proj.hitCd || 0;
        if (proj.hitCd > 0) proj.hitCd -= dt/1000;
        
        if (proj.hitCd <= 0) {
            let hitAny = false;
            activeMonsters.forEach(m => {
                if (m.hp <= 0) return;
                const mEl = All.$id('hmob-' + m.idx);
                const dist = Math.abs(m.x - proj.x);
                if (dist < 40) {
                    m.hp -= proj.dmg;
                    if (proj.karmaAmt) m.karma = (m.karma || 0) + proj.karmaAmt;
                    if (mEl) {
                        mEl.classList.remove('idle'); mEl.classList.add('hurt'); setTimeout(() => { mEl.classList.remove('hurt'); mEl.classList.add('idle'); }, 200);
                        setTimeout(() => showFloatDamage('-' + proj.dmg, mEl, '#fff'), 0);
                    }
                    hitAny = true;
                }
            });
            if (hitAny) proj.hitCd = proj.type === 'bone_blue' ? 0.3 : 0.5;
        }
    }

    // 4. Karma Update
    activeMonsters.forEach(m => {
        if (m.hp > 0 && m.karma && m.karma > 0) {
            // Constant DPS: 1% maxHp per stack per second
            const dps = m.maxHp * 0.01 * m.karma;
            m.hp -= dps * (dt/1000);
            
            // Visual -1 spam (tick rate = 2 * karma stacks per sec)
            const tickRate = 2 * m.karma;
            m._karmaTickAcc = (m._karmaTickAcc || 0) + (tickRate * dt/1000);
            if (m._karmaTickAcc >= 1.0) {
                const ticks = Math.floor(m._karmaTickAcc);
                m._karmaTickAcc -= ticks;
                const mEl = All.$id('hmob-' + m.idx);
                if (mEl) {
                    for(let i=0; i<Math.min(ticks, 5); i++) {
                        setTimeout(() => showFloatDamage('-1', mEl, '#e040fb'), i * 50);
                    }
                }
            }

            // Stack decay: lose 1 stack per second
            m.karmaTimer = (m.karmaTimer || 0) + dt/1000;
            if (m.karmaTimer >= 1.0) {
                m.karmaTimer -= 1.0;
                m.karma = Math.max(0, m.karma - 1);
            }
        }
    });

  }
  
  updateHeroStats();
}


function showFloatDamage(text, target, color = null) {
  if (!target) return;
  const fl = document.createElement('div');
  fl.className = 'dmg-float';
  fl.textContent = text;
  if (color) {
    fl.style.color = color;
  } else if (text.toString().startsWith('-') && Math.random() > 0.8) {
    fl.classList.add('crit');
  }
  fl.style.left = (Math.random() * 30 - 15) + 'px'; // Random left offset
  fl.style.bottom = '30px';
  target.appendChild(fl);
  setTimeout(() => fl.remove(), 800);
}

function spawnSkillEffect(startEl, targetEl, skillType) {
  if (!startEl) return;
  const scene = startEl.closest('.hero-scene') || All.sh.querySelector('.hero-scene');
  if (!scene) return;
  
  const sRect = scene.getBoundingClientRect();
  
  const healSkills = ['heal_party', 'heal_self'];
  const shieldSkills = ['shield_party', 'shield_self', 'shield', 'absorb'];
  const buffSkills = ['atk_spd_self', 'charm', 'cd_reduce', 'random_buff', 'vampiric_buff', 'resurrect', 'party_speed_buff', 'atk_up'];
  const damageSkills = ['slam_dmg', 'multi_strike', 'thorn_whip', 'lightning_strike', 'push_back', 'soul_reap', 'fear', 'stun_bolt', 'dispel', 'hellfire', 'star_fall', 'blind', 'sugar_rush', 'snowball_roll', 'coin_toss', 'random_dmg', 'slow'];
  
  if (healSkills.includes(skillType)) {
    if (!targetEl) return;
    const fx = document.createElement('div');
    fx.className = 'fx-heal';
    fx.innerHTML = spriteSVG('healFx', 32);
    scene.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = (tRect.left - sRect.left + tRect.width/2 - 16) + 'px';
    fx.style.top = (tRect.top - sRect.top + tRect.height/2 - 16) + 'px';
    setTimeout(() => fx.remove(), 1000);
  }
  else if (shieldSkills.includes(skillType)) {
    if (!targetEl) return;
    const fx = document.createElement('div');
    fx.className = 'fx-shield';
    fx.innerHTML = spriteSVG('shieldFx', 48);
    fx.style.position = 'absolute';
    fx.style.pointerEvents = 'none';
    scene.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = (tRect.left - sRect.left + tRect.width/2 - 24) + 'px';
    fx.style.top = (tRect.top - sRect.top + tRect.height/2 - 24) + 'px';
    setTimeout(() => fx.remove(), 2000);
  }
  else if (buffSkills.includes(skillType)) {
    if (!targetEl) return;
    const fx = document.createElement('div');
    fx.className = 'fx-buff';
    let buffSprite = 'holyLight';
    if (skillType === 'charm') buffSprite = 'heartFx';
    if (skillType === 'vampiric_buff') buffSprite = 'bloodFx';
    fx.innerHTML = spriteSVG(buffSprite, 48);
    scene.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = (tRect.left - sRect.left + tRect.width/2 - 24) + 'px';
    fx.style.top = (tRect.top - sRect.top + tRect.height/2 - 24) + 'px';
    setTimeout(() => fx.remove(), 800);
  }
  else if (skillType === 'laser' || skillType === 'laser_sans') {
    if (!targetEl) return;
    const tRect = targetEl.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const sx = startRect.left - sRect.left + startRect.width/2;
    const sy = startRect.top - sRect.top + startRect.height/2;
    
    let dist = 1000;
    let angle = 0;
    
    if (skillType === 'laser') {
        const ex = tRect.left - sRect.left + tRect.width/2;
        const ey = tRect.top - sRect.top + tRect.height/2;
        dist = Math.hypot(ex - sx, ey - sy);
        angle = Math.atan2(ey - sy, ex - sx);
    }
    
    const fx = document.createElement('div');
    fx.className = skillType === 'laser_sans' ? 'laser-sans' : 'laser-beam';
    fx.style.width = dist + 'px';
    fx.style.left = sx + 'px';
    fx.style.top = sy + 'px';
    fx.style.transform = skillType === 'laser_sans' ? `translateY(-50%)` : `rotate(${angle}rad)`;
    scene.appendChild(fx);
    setTimeout(() => fx.remove(), 300);
  }
  else if (damageSkills.includes(skillType)) {
    if (!targetEl) return;
    const dmgSpriteMap = {
      slam_dmg: 'smashFx', multi_strike: 'slashFx', thorn_whip: 'leafBolt', lightning_strike: 'lightning',
      push_back: 'biteFx', soul_reap: 'scytheFx', fear: 'skullFx', stun_bolt: 'stunFx',
      hellfire: 'fireball', star_fall: 'starBolt', snowball_roll: 'snowball', coin_toss: 'coin', random_dmg: 'fireball',
      dispel: 'dispelFx', blind: 'blindFx', sugar_rush: 'sugarFx', slow: 'coldBreath'
    };
    const fx = document.createElement('div');
    fx.className = 'fx-impact';
    fx.innerHTML = spriteSVG(dmgSpriteMap[skillType] || 'fireball', 64);
    scene.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = (tRect.left - sRect.left + tRect.width/2 - 32) + 'px';
    fx.style.top = (tRect.top - sRect.top + tRect.height/2 - 32) + 'px';
    setTimeout(() => fx.remove(), 250);
  }
}

function spawnAttackEffect(pId, startEl, targetEl, isEnemy, isCrit) {
  if (!startEl || !targetEl) return;
  const scene = startEl.closest('.hero-scene') || All.sh.querySelector('.hero-scene');
  if (!scene) return;
  
  const sRect = scene.getBoundingClientRect();
  const startRect = startEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();
  
  const sx = startRect.left - sRect.left + startRect.width/2;
  const sy = startRect.top - sRect.top + startRect.height/2;
  const ex = targetRect.left - sRect.left + targetRect.width/2;
  const ey = targetRect.top - sRect.top + targetRect.height/2;
  
  let animType = 'projectile';
  let spriteId = 'fireball';
  
  if (isEnemy) {
    animType = 'projectile'; spriteId = 'fireball';
  } else {
    // Determine type by pet ID
    const meleeSlash = ['octo', 'ghostBlob', 'impBlob', 'naoyaSlime'];
    const meleeSmash = ['slime', 'octoCream'];
    const meleeBite = ['slimePink'];
    
    if (meleeSlash.includes(pId)) { animType = 'slash'; spriteId = 'slashFx'; }
    else if (meleeSmash.includes(pId)) { animType = 'impact'; spriteId = 'smashFx'; }
    else if (meleeBite.includes(pId)) { animType = 'impact'; spriteId = 'biteFx'; }
    else if (pId === 'jellyfish') { animType = 'projectile'; spriteId = Math.random() > 0.5 ? 'iceball' : 'lightning'; }
    else if (pId === 'dewSprout') { animType = 'projectile'; spriteId = 'leafBolt'; }
    else if (pId === 'peach_soda') { animType = 'projectile'; spriteId = 'waterball'; }
    else if (pId === 'starBell') { animType = 'projectile'; spriteId = 'starBolt'; }
    else if (pId === 'angelBlob') { animType = 'projectile'; spriteId = 'holyLight'; }
    else if (pId === 'cloudMallow') { animType = 'projectile'; spriteId = 'lightning'; }
    else if (pId === 'penguin') { animType = 'projectile'; spriteId = 'snowball'; }
    else if (pId === 'mystery_blob') { animType = 'projectile'; spriteId = 'shadowBolt'; }
    else if (pId === 'prismBlob') { animType = 'projectile'; spriteId = 'rainbowBolt'; }
    else if (pId === 'hero') { animType = 'projectile'; spriteId = 'arrow'; }
    else { animType = 'projectile'; spriteId = 'fireball'; }
  }

  if (animType === 'projectile') {
    const proj = document.createElement('div');
    proj.className = 'dg-projectile';
    proj.innerHTML = isEnemy ? '<div style="width:8px;height:8px;background:#e06578;border-radius:50%;box-shadow:0 0 5px #ff0000;"></div>' : spriteSVG(spriteId, 16);
    scene.appendChild(proj);
    proj.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
    const duration = 150;
    proj.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    setTimeout(() => { proj.style.transform = `translate3d(${ex}px, ${ey}px, 0)`; }, 10);
    setTimeout(() => proj.remove(), duration + 10);
  } else {
    // Melee Effect directly on target
    const fx = document.createElement('div');
    fx.className = animType === 'slash' ? 'fx-slash' : 'fx-impact';
    fx.innerHTML = spriteSVG(spriteId, 32);
    scene.appendChild(fx);
    fx.style.left = ex + 'px';
    fx.style.top = ey + 'px';
    setTimeout(() => fx.remove(), animType === 'slash' ? 200 : 250);
  }
}

function showFloatDrop(icon, target) {
  if (!target) return;
  const fl = document.createElement('div');
  fl.className = 'dmg-float drop';
  fl.innerHTML = '+1 ' + spriteSVG(icon, 16);
  fl.style.left = (Math.random() * 20) + 'px';
  fl.style.bottom = '40px';
  target.appendChild(fl);
  setTimeout(() => fl.remove(), 1200);
}

function renderHeroUI() {
  if (!runState) return;
  const container = All.$id('hero-party');
  if (container) {
    const extraStyle = ctx.S.hero.style === 'defense' ? 'filter: drop-shadow(0 0 4px #4da6ff);' : '';
    container.innerHTML = runState.pets.map((p, i) => {
      const isSans = p.id === 'sans';
      const hpColor = isSans ? 'background:#00ffff;' : '';
      const hpText = '';
      return `<div class="hero-pet idle" id="hpet-${i}" style="z-index:${10-i}; ${extraStyle} opacity: ${p.hp > 0 ? 1 : 0.3}">
         <div class="hp-bar-mini" style="position:relative; overflow:hidden;"><div class="hp-fill-mini" id="hp-pet-${i}" style="width:${(p.hp/p.maxHp)*100}%; ${hpColor}"></div>${hpText}</div>
         <div class="hero-bars-container">
           <div class="hero-bar-row"><div class="hero-bar-fill fill-cd" id="cd-pet-${i}" style="width:0%"></div></div>
           ${p.skillMaxCd > 0 ? `<div class="hero-bar-row"><div class="hero-bar-fill fill-sk" id="sk-pet-${i}" style="width:0%"></div></div>` : ''}
         </div>
         ${p.id === 'sans'
           ? `<img draggable="false" data-sans-sprite class="sans-sprite" src="${SANS_FARM_SPRITES.idle}" style="height:32px; width:auto; image-rendering:pixelated; display:block; margin-bottom:2px; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.5));">`
           : petSVG(p.id, 32)}
       </div>`;
    }).join('');
  }
  updateHeroStats();
}

function updateHeroStats() {
  const lvEl = All.$id('hero-level');
  const goldEl = All.$id('hero-gold');
  
  if (lvEl && runState) lvEl.textContent = runState.stage;
  if (goldEl) goldEl.textContent = ctx.S.hero.gold;
}

// Logic kéo thả Taskbar
export let hGesture = null;
export function onHeroDown(e) {
  if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
  const bar = All.$id('hero-bar');
  if (!e.target.closest('.hero-drag')) return;
  
  bar.setPointerCapture(e.pointerId);
  hGesture = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: bar.offsetLeft, oy: bar.offsetTop, moved: false };
}

export function onHeroMove(e) {
  if (!hGesture || e.pointerId !== hGesture.id) return;
  const rawDx = e.clientX - hGesture.sx;
  const rawDy = e.clientY - hGesture.sy;
  
  if (!hGesture.moved && (Math.abs(rawDx) > 4 || Math.abs(rawDy) > 4)) {
    hGesture.moved = true;
  }
  
  if (hGesture.moved) {
    const bar = All.$id('hero-bar');
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = bar.getBoundingClientRect();
    
    let x = hGesture.ox + rawDx;
    let y = hGesture.oy + rawDy;
    
    x = Math.max(0, Math.min(x, vw - rect.width));
    y = Math.max(0, Math.min(y, vh - rect.height));
    
    bar.style.left = x + 'px';
    bar.style.top = y + 'px';
    bar.style.right = 'auto'; 
    bar.style.bottom = 'auto';
  }
}

export function onHeroUp(e) {
  if (!hGesture || e.pointerId !== hGesture.id) return;
  const bar = All.$id('hero-bar');
  try { bar.releasePointerCapture(e.pointerId); } catch (er) {}
  
  if (!hGesture.moved) {
    bar.classList.toggle('minimized');
    ctx.S.hero.minimized = bar.classList.contains('minimized');
    save();
  } else {
    const vw = window.innerWidth, vh = window.innerHeight;
    let newFx = bar.offsetLeft / vw;
    let newFy = bar.offsetTop / vh;
    if (!isNaN(newFx)) ctx.S.hero.fx = Math.min(Math.max(newFx, 0), 1);
    if (!isNaN(newFy)) ctx.S.hero.fy = Math.min(Math.max(newFy, 0), 1);
    save();
  }
  
  hGesture = null;
}

export function placeHeroBar() {
  if (!ctx.S.hero) return;
  const bar = All.$id('hero-bar');
  if (!bar) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  
  let fx = ctx.S.hero.fx;
  let fy = ctx.S.hero.fy;
  if (typeof fx !== 'number' || isNaN(fx)) fx = 0.5;
  if (typeof fy !== 'number' || isNaN(fy)) fy = 0.9;
  
  const w = bar.offsetWidth || 320;
  const h = bar.offsetHeight || 60;
  
  let scale = 1;
  const padding = 10; // small padding to not stick to edge exactly
  if (vw < w + padding * 2) {
    scale = (vw - padding * 2) / w;
  }
  
  const scaledW = w * scale;
  const scaledH = h * scale;
  
  const x = Math.min(Math.max(fx * vw, 0), vw - scaledW);
  const y = Math.min(Math.max(fy * vh, 0), vh - scaledH);
  
  bar.style.transformOrigin = 'top left';
  bar.style.transform = `scale(${scale})`;
  
  bar.style.left = x + 'px'; 
  bar.style.top = y + 'px';
  bar.style.right = 'auto';
  bar.style.bottom = 'auto';
  
  if (ctx.S.hero.minimized) {
    bar.classList.add('minimized');
  } else {
    bar.classList.remove('minimized');
  }
}

export function initHero() {
  const bar = All.$id('hero-bar');
  if (bar) {
    bar.addEventListener('pointerdown', onHeroDown);
    window.addEventListener('pointermove', onHeroMove);
    window.addEventListener('pointerup', onHeroUp);
    window.addEventListener('resize', placeHeroBar);
    
    const closeBtn = All.$id('hero-close');
    if (closeBtn) closeBtn.addEventListener('click', closeHeroMode);
    
    const cashOutBtn = All.$id('hero-cashout');
    if (cashOutBtn) cashOutBtn.addEventListener('click', cashOutHero);
  }
  
  All.$id('mbody').addEventListener('click', e => {
    let el;
    // @ts-ignore
    el = e.target.closest('.hero-slot.filled');
    if (el) {
      saveHeroScrolls();
      ctx.S.hero.party.splice(parseInt(el.dataset.rem), 1);
      save(); openHeroPanel();
      restoreHeroScrolls();
      return;
    }
    // @ts-ignore
    el = e.target.closest('.h-r-pet');
    if (el) {
      const pId = el.dataset.add;
      if (ctx.S.hero.party.includes(pId)) return;
      if (ctx.S.hero.party.length >= 3) return All.toast('Đội hình đã đầy! (Max 3)');
      saveHeroScrolls();
      ctx.S.hero.party.push(pId);
      save(); openHeroPanel();
      restoreHeroScrolls();
      return;
    }
    // @ts-ignore
    el = e.target.closest('.h-r-info');
    if (el) { 
        saveHeroScrolls();
        openPetSkills(el.dataset.info); 
        return; 
    }
    // @ts-ignore
    el = e.target.closest('.hero-style-btn');
    if (el) { 
        saveHeroScrolls();
        ctx.S.hero.style = el.dataset.style; 
        save(); openHeroPanel(); 
        restoreHeroScrolls();
        return; 
    }
    // @ts-ignore
    el = e.target.closest('#hero-deploy');
    if (el) {
      if (ctx.S.hero.party.length === 0) return All.toast('Vui lòng xếp Đội hình trước khi Xuất chiến!');
      closeModal(); openHeroMode();
      return;
    }
    // @ts-ignore
    el = e.target.closest('.sk-unlock-btn');
    if (el) {
      const pId = el.dataset.pid;
      const tier = el.dataset.tier;
      const cost = parseInt(el.dataset.cost);
      if (spendGold(cost)) {
        ctx.S.hero.roster[pId][`${tier}_unlocked`] = true;
        save(); openPetSkills(pId);
      }
      return;
    }
    // @ts-ignore
    el = e.target.closest('[data-action="equip"], [data-action="unequip"]');
    if (el) {
      const pId = el.dataset.pid;
      const typeId = el.dataset.type;
      const action = el.dataset.action;
      const isAct = typeId.startsWith('a');
      if (action === 'equip') {
        if (isAct) ctx.S.hero.roster[pId].active_eq = typeId;
        else ctx.S.hero.roster[pId].passive_eq = typeId;
      } else {
        if (isAct) delete ctx.S.hero.roster[pId].active_eq;
        else delete ctx.S.hero.roster[pId].passive_eq;
      }
      save(); openPetSkills(pId);
      if (runState && runState.pets.some(p => p.id === pId)) {
        const pt = runState.pets.find(p => p.id === pId);
        if (pt) {
            if (isAct) {
                const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
                pt.skillMaxCd = (action === 'equip') ? (pSkill[typeId].cd || 0) : 0;
                pt.skillCd = pt.skillMaxCd;
            }
            renderHeroUI();
        }
      }
      return;
    }
    // @ts-ignore
    el = e.target.closest('#pet-enh-hp');
    if (el) {
      const pId = el.dataset.pid;
      const cost = parseInt(el.dataset.cost);
      if (spendGold(cost)) {
        ctx.S.hero.roster[pId].enhHp = (ctx.S.hero.roster[pId].enhHp || 0) + 1;
        save(); openPetSkills(pId);
      }
      return;
    }
    // @ts-ignore
    el = e.target.closest('#pet-enh-atk');
    if (el) {
      const pId = el.dataset.pid;
      const cost = parseInt(el.dataset.cost);
      if (spendGold(cost)) {
        ctx.S.hero.roster[pId].enhAtk = (ctx.S.hero.roster[pId].enhAtk || 0) + 1;
        save(); openPetSkills(pId);
      }
      return;
    }
    // @ts-ignore
    el = e.target.closest('#pet-enh-spd');
    if (el) {
      const pId = el.dataset.pid;
      const cost = parseInt(el.dataset.cost);
      if (spendGold(cost)) {
        ctx.S.hero.roster[pId].enhSpd = (ctx.S.hero.roster[pId].enhSpd || 0) + 1;
        save(); openPetSkills(pId);
      }
      return;
    }
    // @ts-ignore
    el = e.target.closest('#pet-back-btn');
    if (el) { 
        openHeroPanel(); 
        restoreHeroScrolls();
        return; 
    }
  });
}

// --- CUTSCENE ĐIỆN ẢNH ĐỘC QUYỀN CỦA NAOYA SLIME ---
export function playNaoyaCutscene(attacker, attackerEl, targetEls, onComplete) {
    if (!attackerEl || !targetEls) return onComplete && onComplete();
    const targets = Array.isArray(targetEls) ? targetEls : [targetEls];
    if (targets.length === 0) return onComplete && onComplete();

    const scene = targets[0].closest('.hero-scene') || targets[0].closest('#dg-arena');
    if (!scene) return onComplete && onComplete();

    // 1. Phủ màn Cinematic tĩnh (Letterbox + Grayscale Time-Stop)
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute; inset:0; z-index:20; opacity:0; transition:opacity 0.3s; background:radial-gradient(circle, transparent 20%, rgba(0,0,0,0.6) 100%); pointer-events:none;';
    
    // Viền phim rạp trên dưới
    const topBar = document.createElement('div');
    const botBar = document.createElement('div');
    const barStyle = 'position:absolute; left:0; right:0; height:18%; background:#000; z-index:21; transition:transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1); pointer-events:none;';
    topBar.style.cssText = barStyle + 'top:0; transform:translateY(-100%);';
    botBar.style.cssText = barStyle + 'bottom:0; transform:translateY(100%);';

    scene.appendChild(overlay);
    scene.appendChild(topBar);
    scene.appendChild(botBar);

    // Kích hoạt Khung hình phim
    setTimeout(() => {
        overlay.style.opacity = '1';
        topBar.style.transform = 'translateY(0)';
        botBar.style.transform = 'translateY(0)';
    }, 10);

    // 2. Kéo Naoya và Nạn nhân lên sân khấu chính, chốt tọa độ gốc
    const origTransform = attackerEl.style.transform;
    const oldAz = attackerEl.style.zIndex;
    attackerEl.style.zIndex = '25';

    const targetOriginals = targets.map(tEl => ({
        el: tEl,
        origTransform: tEl.style.transform,
        oldTz: tEl.style.zIndex
    }));

    targetOriginals.forEach(t => t.el.style.zIndex = '22');

    const sRect = scene.getBoundingClientRect();
    const targetCoords = targets.map(tEl => {
        const tRect = tEl.getBoundingClientRect();
        return {
            tx: tRect.left - sRect.left + tRect.width / 2,
            ty: tRect.top - sRect.top + tRect.height / 2
        };
    });

    let frame = 0;
    const maxFrames = 24;
    
    attackerEl.style.transition = 'none';

    // 3. Bắt đầu 24 Khung hình băm vằm
    const interval = setInterval(() => {
        frame++;
        
        const randIdx = Math.floor(Math.random() * targetCoords.length);
        const { tx, ty } = targetCoords[randIdx];
        const currentTargetEl = targets[randIdx];
        const origT = targetOriginals[randIdx].origTransform;

        // Naoya dịch chuyển liên tục, chém chéo cơ thể
        const angle = Math.random() * Math.PI * 2;
        const radius = 25 + Math.random() * 40; 
        const px = tx + Math.cos(angle) * radius - 16;
        const py = ty + Math.sin(angle) * radius - 16;
        
        attackerEl.style.transform = `translate3d(${px}px, ${py}px, 0) scale(1.3) skewX(${(Math.random()-0.5)*30}deg)`;

        // Tàn ảnh (Ghosting trail) đằng sau lưng!
        const ghost = attackerEl.cloneNode(true);
        ghost.className = 'projection-ghost';
        ghost.style.position = 'absolute';
        ghost.style.zIndex = '24';
        ghost.style.opacity = '0.6';
        ghost.style.filter = 'brightness(1.5)';
        ghost.style.pointerEvents = 'none';
        scene.appendChild(ghost);
        setTimeout(() => ghost.remove(), 100);

        // Nạn nhân rung lắc liên hồi, cộng dồn vào transform gốc để không bị lệch
        currentTargetEl.style.transform = origT + ` translate(${(Math.random()-0.5)*10}px, ${(Math.random()-0.5)*10}px)`;

        if (frame >= maxFrames) {
            clearInterval(interval);
            
            // Khung hình 24: Bùng nổ không gian
            const boom = document.createElement('div');
            boom.style.cssText = `position:absolute; left:${tx}px; top:${ty}px; width:0; height:0; background:#fff; box-shadow:0 0 100px 50px #fff; border-radius:50%; z-index:26; transform:translate(-50%, -50%); transition:width 0.1s, height 0.1s, opacity 0.3s; opacity:1;`;
            scene.appendChild(boom);
            
            setTimeout(() => {
                boom.style.width = '200px';
                boom.style.height = '200px';
                boom.style.opacity = '0';
            }, 10);
            
            setTimeout(() => boom.remove(), 350);

            // Hoàn trả màn hình và UI
            overlay.style.opacity = '0';
            topBar.style.transform = 'translateY(-100%)';
            botBar.style.transform = 'translateY(100%)';
            
            setTimeout(() => {
                overlay.remove();
                topBar.remove();
                botBar.remove();
            }, 300);

            // Ném Naoya về chỗ cũ
            attackerEl.style.transition = 'transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1)';
            attackerEl.style.transform = origTransform;
            
            // Phục hồi nguyên trạng kẻ địch
            targetOriginals.forEach(t => {
                t.el.style.transform = t.origTransform;
            });
            
            setTimeout(() => {
                attackerEl.style.zIndex = oldAz;
                targetOriginals.forEach(t => {
                    t.el.style.zIndex = t.oldTz;
                });
            }, 300);

            // 4. Kích nổ Dame
            if (onComplete) onComplete();
        }
    }, 40); // 24 FPS (1000/24 ~ 40ms)
}
