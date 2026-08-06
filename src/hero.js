import { ctx } from './store.js';
import * as All from './all.js';
import { spriteSVG, petSVG, PETS } from './graphics.js';
import { CROPS } from './data.js';
import { save } from './state.js';
import { openModal, closeModal } from './shop.js';

let heroLoop = null;
let lastTick = 0;
let currentMonster = null;
let monsterX = 100;
let floatingDamageContainer = null;

export const PET_SKILLS = {
  slime: { s5: { type: 'heal_party', val: 10, cd: 4, desc: 'Hồi 10 HP cho cả đội (Mỗi 4s)', price: 200000 }, s15: { type: 'max_hp_party', val: 0.3, desc: 'Nội tại: Tăng 30% Max HP toàn đội', price: 500000 } },
  octo: { s5: { type: 'atk_up', val: 0.5, desc: 'Nội tại: Tăng 50% ATK bản thân', price: 200000 }, s15: { type: 'multi_hit', val: 2, desc: 'Nội tại: Mỗi đòn đánh x2 sát thương', price: 500000 } },
  slimePink: { s5: { type: 'lifesteal', val: 0.3, desc: 'Nội tại: Hút máu 30%', price: 200000 }, s15: { type: 'crit_rate', val: 0.3, desc: 'Nội tại: Tỉ lệ bạo kích +30%', price: 500000 } },
  octoCream: { s5: { type: 'dodge', val: 0.3, desc: 'Nội tại: Tỉ lệ né 30%', price: 200000 }, s15: { type: 'reflect', val: 0.5, desc: 'Nội tại: Phản 50% sát thương', price: 500000 } },
  dewSprout: { s5: { type: 'heal_self', val: 15, cd: 3, desc: 'Tự hồi 15 HP (Mỗi 3s)', price: 200000 }, s15: { type: 'atk_speed', val: 0.5, desc: 'Nội tại: Tốc đánh x1.5', price: 500000 } },
  cloudMallow: { s5: { type: 'heal_party', val: 15, cd: 4, desc: 'Hồi 15 HP cho cả đội (Mỗi 4s)', price: 200000 }, s15: { type: 'stun', val: 0.2, desc: 'Nội tại: 20% làm choáng 1s', price: 500000 } },
  ghostBlob: { s5: { type: 'dodge', val: 0.2, desc: 'Nội tại: Tỉ lệ né 20%', price: 200000 }, s15: { type: 'lifesteal', val: 0.5, desc: 'Nội tại: Hút máu 50%', price: 500000 } },
  mystery_blob: { s5: { type: 'random_dmg', val: 3, cd: 5, desc: 'Gây 300% ATK ngẫu nhiên (Mỗi 5s)', price: 200000 }, s15: { type: 'random_buff', val: 1, cd: 10, desc: 'Buff ngẫu nhiên toàn đội (Mỗi 10s)', price: 500000 } },
  jellyfish: { s5: { type: 'stun', val: 0.2, desc: 'Nội tại: 20% làm choáng 1s', price: 200000 }, s15: { type: 'crit_dmg', val: 3.0, desc: 'Nội tại: Sát thương Crit x3', price: 500000 } },
  impBlob: { s5: { type: 'crit_rate', val: 0.3, desc: 'Nội tại: Tỉ lệ bạo kích +30%', price: 200000 }, s15: { type: 'berserk', val: 2.0, desc: 'Nội tại: Cuồng nộ (ATK x2, HP -50%)', price: 500000 } },
  angelBlob: { s5: { type: 'heal_party', val: 25, cd: 5, desc: 'Hồi 25 HP cho cả đội (Mỗi 5s)', price: 200000 }, s15: { type: 'resurrect', val: 1, desc: 'Nội tại: Hồi sinh 1 lần (50% HP)', price: 500000 } },
  prismBlob: { s5: { type: 'shield_party', val: 50, cd: 10, desc: 'Tạo Khiên 50 cho toàn đội (Mỗi 10s)', price: 200000 }, s15: { type: 'laser', val: 5, cd: 8, desc: 'Laser sát thương diện rộng x5 ATK', price: 500000 } },
  starBell: { s5: { type: 'atk_party', val: 0.3, desc: 'Nội tại: Tăng 30% ATK toàn đội', price: 200000 }, s15: { type: 'crit_party', val: 0.2, desc: 'Nội tại: Tăng 20% Crit toàn đội', price: 500000 } },
  peach_soda: { s5: { type: 'atk_speed', val: 0.5, desc: 'Nội tại: Tốc đánh x1.5', price: 200000 }, s15: { type: 'heal_party', val: 20, cd: 3, desc: 'Hồi 20 HP toàn đội (Mỗi 3s)', price: 500000 } },
  penguin: { s5: { type: 'dodge', val: 0.4, desc: 'Nội tại: Tỉ lệ né 40%', price: 200000 }, s15: { type: 'gold_drop', val: 2.0, desc: 'Nội tại: Vàng rớt ra x2', price: 500000 } },
  default: { s5: { type: 'atk_up', val: 0.2, desc: 'Nội tại: Tăng 20% ATK', price: 200000 }, s15: { type: 'crit_rate', val: 0.2, desc: 'Nội tại: Tỉ lệ bạo kích +20%', price: 500000 } }
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
          const nextExp = Math.floor(100 * Math.pow(1.5, petData.level - 1));
          if (petData.exp >= nextExp) {
            petData.exp -= nextExp;
            petData.level++;
          } else {
            break;
          }
        }
        if (petData.level >= 30) {
          petData.level = 30;
          petData.exp = Math.floor(100 * Math.pow(1.5, 29));
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
    level: data.level,
    exp: data.exp || 0,
    maxHp: Math.floor(st.baseHp + (data.level - 1) * st.hpPerLv + enhHp * 50),
    atk: Math.floor(st.baseAtk + (data.level - 1) * st.atkPerLv + enhAtk * 10),
    spd: Number((st.baseSpd + enhSpd * 0.1).toFixed(2)),
    nextExp: Math.floor(100 * Math.pow(1.5, data.level - 1)),
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
    { id: 'attack', name: 'Tấn công (DPS x1.5)', icon: 'emBang' },
    { id: 'defense', name: 'Phòng thủ (Giáp x1.5)', icon: 'emStar' },
    { id: 'balanced', name: 'Cân bằng', icon: 'emLeaf' }
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
        <div class="h-r-bar"><div class="h-r-fill" style="width:${st.level >= 30 ? 100 : Math.min(100, st.exp/st.nextExp*100)}%"></div><span>${st.level >= 30 ? 'MAX' : `${Math.floor(st.exp)}/${st.nextExp}`}</span></div>
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
      
      <div class="hero-deploy-btn" id="hero-deploy">XUẤT PHÁT!</div>
    </div>
  `);
  
  const mbody = All.$id('mbody');
  mbody.querySelectorAll('.hero-slot.filled').forEach(el => el.addEventListener('click', () => {
    ctx.S.hero.party.splice(parseInt(el.dataset.rem), 1);
    save();
    openHeroPanel();
  }));
  
  mbody.querySelectorAll('.h-r-pet').forEach(el => el.addEventListener('click', () => {
    const pId = el.dataset.add;
    if (ctx.S.hero.party.includes(pId)) return;
    if (ctx.S.hero.party.length >= 3) return All.toast('Đội hình đã đầy! (Max 3)');
    ctx.S.hero.party.push(pId);
    save();
    openHeroPanel();
  }));
  
  mbody.querySelectorAll('.h-r-info').forEach(el => el.addEventListener('click', () => {
    openPetSkills(el.dataset.info);
  }));
  
  mbody.querySelectorAll('.hero-style-btn').forEach(el => el.addEventListener('click', () => {
    ctx.S.hero.style = el.dataset.style;
    save();
    openHeroPanel();
  }));
  
  mbody.querySelector('#hero-deploy').addEventListener('click', () => {
    if (ctx.S.hero.party.length === 0) {
      return All.toast('Vui lòng xếp Đội hình trước khi Xuất chiến!');
    }
    closeModal();
    openHeroMode();
  });
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
  if (!ctx.S.hero.roster[pId]) ctx.S.hero.roster[pId] = { level: 1, exp: 0, enhHp: 0, enhAtk: 0, s5_unlocked: false, s15_unlocked: false };
  const data = ctx.S.hero.roster[pId];
  const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
  
  const skillHtml = [ {lvl: 5, sk: pSkill.s5, id: 's5'}, {lvl: 15, sk: pSkill.s15, id: 's15'} ].map(tier => {
    const levelMet = data.level >= tier.lvl;
    const isUnlocked = data[`${tier.id}_unlocked`];
    let actionBtn = '';
    
    if (isUnlocked) {
      actionBtn = `<div style="color:#a4dc8c; font-weight:bold; font-size:12px; text-align:center;">Đã mở</div>`;
    } else if (levelMet) {
      actionBtn = `<div class="hero-deploy-btn sk-unlock-btn" data-tier="${tier.id}" data-cost="${tier.sk.price}" style="margin-top:0; padding:6px 12px; font-size:12px; width:auto;">Mở khóa<br>${tier.sk.price}G</div>`;
    } else {
      actionBtn = `<div style="color:#777; font-size:12px; text-align:center;">Cần Lv.${tier.lvl}</div>`;
    }
    
    return `<div class="p-skill-tier ${isUnlocked ? 'unlocked' : 'locked'}">
      <div class="p-sk-icon">${isUnlocked ? spriteSVG('emStar', 24) : spriteSVG('emLock', 24)}</div>
      <div class="p-sk-desc">
        <div style="font-size: 13px; font-weight: bold; color: ${isUnlocked ? '#a4dc8c' : '#777'};">Kỹ năng Lv.${tier.lvl}</div>
        <div style="font-size: 14px; margin-top: 2px;">${tier.sk.desc}</div>
      </div>
      <div>${actionBtn}</div>
    </div>`;
  }).join('');
  
  openModal('Thông Tin Thú Cưng', `
    <div class="hero-modal-wrapper">
      <div style="display:flex; gap: 16px; margin-bottom: 16px; align-items:center;">
        <div style="background:#2c2538; border-radius:12px; padding:12px; border: 2px solid #5d4a85;">
          ${petSVG(pId, 64)}
        </div>
        <div style="flex:1;">
          <div style="font-size: 18px; font-weight:bold; color: #f2c231; margin-bottom: 4px;">Lv.${st.level}</div>
          <div style="font-size: 14px;">HP Cơ bản: <b>${st.maxHp}</b> (+${st.enhHpLevel} Cường hóa)</div>
          <div style="font-size: 14px;">ATK Cơ bản: <b>${st.atk}</b> (+${st.enhAtkLevel} Cường hóa)</div>
          <div style="font-size: 14px;">Tốc đánh: <b>${st.spd}</b> (+${st.enhSpdLevel} Cường hóa)</div>
          <div class="h-r-bar" style="margin-top:8px;"><div class="h-r-fill" style="width:${st.level >= 30 ? 100 : Math.min(100, st.exp/st.nextExp*100)}%"></div><span>${st.level >= 30 ? 'MAX LEVEL' : `EXP: ${Math.floor(st.exp)}/${st.nextExp}`}</span></div>
        </div>
      </div>
      
      <div class="hero-panel-section">Tech Tree (Nội Tại & Kỹ Năng)</div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${skillHtml}
      </div>
      
      <div class="hero-panel-section" style="margin-top:16px;">Cường Hóa (Enhance)</div>
      <div class="betsides">
        <div class="betside hero-deploy-btn" id="pet-enh-hp" style="margin-top:0; padding:10px; font-size:14px;">
          +50 HP<br><span style="font-size:12px; font-weight:normal;">(${st.enhHpCost} Vàng)</span>
        </div>
        <div class="betside hero-deploy-btn" id="pet-enh-atk" style="margin-top:0; padding:10px; font-size:14px;">
          +10 ATK<br><span style="font-size:12px; font-weight:normal;">(${st.enhAtkCost} Vàng)</span>
        </div>
        <div class="betside hero-deploy-btn" id="pet-enh-spd" style="margin-top:0; padding:10px; font-size:14px;">
          +0.1 SPD<br><span style="font-size:12px; font-weight:normal;">(${st.enhSpdCost} Vàng)</span>
        </div>
      </div>
      
      <div class="hero-deploy-btn" id="pet-back-btn" style="margin-top: 16px; background: #2c2538; border-color: #5d4a85;">
        Quay Lại
      </div>
    </div>
  `);
  
  const mbody = All.$id('mbody');
  
  mbody.querySelectorAll('.sk-unlock-btn').forEach(btn => btn.addEventListener('click', () => {
    const cost = parseInt(btn.dataset.cost);
    const tier = btn.dataset.tier;
    if (spendGold(cost)) {
      ctx.S.hero.roster[pId][`${tier}_unlocked`] = true;
      save();
      openPetSkills(pId);
    }
  }));
  
  mbody.querySelector('#pet-enh-hp').addEventListener('click', () => {
    if (spendGold(st.enhHpCost)) {
      ctx.S.hero.roster[pId].enhHp = (ctx.S.hero.roster[pId].enhHp || 0) + 1;
      save();
      openPetSkills(pId);
    }
  });
  
  mbody.querySelector('#pet-enh-atk').addEventListener('click', () => {
    if (spendGold(st.enhAtkCost)) {
      ctx.S.hero.roster[pId].enhAtk = (ctx.S.hero.roster[pId].enhAtk || 0) + 1;
      save();
      openPetSkills(pId);
    }
  });
  
  mbody.querySelector('#pet-enh-spd').addEventListener('click', () => {
    if (spendGold(st.enhSpdCost)) {
      ctx.S.hero.roster[pId].enhSpd = (ctx.S.hero.roster[pId].enhSpd || 0) + 1;
      save();
      openPetSkills(pId);
    }
  });
  
  mbody.querySelector('#pet-back-btn').addEventListener('click', () => {
    openHeroPanel();
  });
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
  
  ctx.S.hero.party.forEach(pId => {
    const data = ctx.S.hero.roster[pId] || {};
    const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
    if (data.s5_unlocked && pSkill.s5.type === 'max_hp_party') partyHpMult += pSkill.s5.val;
    if (data.s15_unlocked && pSkill.s15.type === 'max_hp_party') partyHpMult += pSkill.s15.val;
    if (data.s5_unlocked && pSkill.s5.type === 'atk_party') partyAtkMult += pSkill.s5.val;
    if (data.s15_unlocked && pSkill.s15.type === 'atk_party') partyAtkMult += pSkill.s15.val;
    if (data.s5_unlocked && pSkill.s5.type === 'crit_party') partyCritMult += pSkill.s5.val;
    if (data.s15_unlocked && pSkill.s15.type === 'crit_party') partyCritMult += pSkill.s15.val;
  });

  // Khởi tạo Run
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
      let dodge = 0;
      let lifesteal = 0;
      let res = 0;
      let multiHit = 1;
      let atkSpeed = st.spd || 1.0;
      let reflect = 0;
      
      [ {req: 's5', sk: pSkill.s5}, {req: 's15', sk: pSkill.s15} ].forEach(tier => {
        if (data[`${tier.req}_unlocked`]) {
          if (tier.sk.type === 'atk_up') atkMult += tier.sk.val;
          if (tier.sk.type === 'crit_rate') critRate += tier.sk.val;
          if (tier.sk.type === 'crit_dmg') critDmg = tier.sk.val;
          if (tier.sk.type === 'dodge') dodge += tier.sk.val;
          if (tier.sk.type === 'lifesteal') lifesteal += tier.sk.val;
          if (tier.sk.type === 'resurrect') res += tier.sk.val;
          if (tier.sk.type === 'multi_hit') multiHit = tier.sk.val;
          if (tier.sk.type === 'atk_speed') atkSpeed *= (1 + tier.sk.val);
          if (tier.sk.type === 'reflect') reflect = tier.sk.val;
          if (tier.sk.type === 'berserk') { atkMult *= tier.sk.val; hpMult *= 0.5; }
        }
      });
      
      atkSpeed = Math.min(5.0, atkSpeed);
      
      const hp = Math.floor(st.maxHp * hpMult);
      return { 
        id: pId, 
        maxHp: hp, hp: hp, shield: 0,
        hpMult, atkMult, // Store for level up recalculation
        atk: Math.floor(st.atk * atkMult), 
        cd: 0, maxCd: 1.0 / atkSpeed,
        crit: critRate, critDmg: critDmg,
        dodge, lifesteal, res, multiHit, reflect,
        skillCd: 0, 
        skillMaxCd: pSkill.s5.cd || pSkill.s15.cd || 0
      };
    }),
    monster: null
  };
  
  spawnMonster();
  renderHeroUI();
  placeHeroBar();
  
  if (!heroLoop) {
    lastTick = Date.now();
    heroLoop = setInterval(heroTick, 100); // Game loop 10fps
  }
  heroToast('Taskbar Hero đã xuất phát!');
}

export function closeHeroMode() {
  const bar = All.$id('hero-bar');
  if (bar) bar.style.display = 'none';
  if (heroLoop) {
    clearInterval(heroLoop);
    heroLoop = null;
  }
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
  const cropKeys = Object.keys(CROPS);
  const randomCrop = cropKeys[Math.floor(Math.random() * cropKeys.length)];
  
  const isBoss = runState.stage > 0 && runState.stage % 5 === 0;
  const hpMult = isBoss ? 5 : 1;
  const maxHp = (runState.stage * 20 + 80) * hpMult;
  const atk = (runState.stage * 4 + 5) * (isBoss ? 2 : 1);
  
  runState.monster = {
    id: randomCrop,
    hp: maxHp,
    maxHp: maxHp,
    atk: atk,
    cd: 2.0,
    maxCd: 2.0,
    isBoss: isBoss,
    isDead: false
  };
  monsterX = 350; // Quái ở xa 350px (bên phải taskbar)
  
  const em = All.$id('hero-enemy');
  if (em) {
    const scale = isBoss ? 'scale(1.5)' : '';
    const bossStyle = isBoss ? 'filter: drop-shadow(0 0 5px #ff0000);' : '';
    em.innerHTML = `
      <div class="hero-mob idle" id="hmob" style="transform: translateX(${monsterX}px) ${scale}; transform-origin: bottom right; transition: transform 0.1s linear; ${bossStyle}">
        <div class="hp-bar-mini"><div class="hp-fill-mini" id="hp-mob"></div></div>
        ${spriteSVG(CROPS[randomCrop].sp || 'seedLight', 32)}
      </div>`;
  }
  
  const mobHp = All.$id('hp-mob');
  if (mobHp) mobHp.style.width = '100%';
}

function heroTick() {
  const now = Date.now();
  const dt = now - lastTick;
  lastTick = now;
  
  if (!runState || !runState.monster) return;
  
  const partyEl = All.$id('hero-party');
  const mobEl = All.$id('hmob');
  
  // Di chuyển (Dừng khi monsterX <= 200px, vì Party chiếm từ 10px đến ~120px)
  if (runState.monster.isDead) return;

  if (monsterX > 200) {
    monsterX -= (40 * (dt / 1000)); // tốc độ 40px/s
    if (mobEl) {
      const scale = runState.monster.isBoss ? 'scale(1.5)' : '';
      mobEl.style.transform = `translateX(${monsterX}px) ${scale}`;
    }
  } else {
    // Combat
    const alivePets = runState.pets.filter(p => p.hp > 0);
    if (alivePets.length === 0) {
      runState.monster = null;
      heroToast('Đội hình đã gục ngã! Về Stage 1...');
      setTimeout(() => {
        if (!runState) return;
        runState.stage = 1;
        runState.pets.forEach(p => p.hp = p.maxHp);
        renderHeroUI();
        spawnMonster();
      }, 3000);
      return;
    }
    
    // 1. Pets Skills & Attack
    alivePets.forEach(p => {
      // Kỹ năng chủ động (Heal, Shield, Random Dmg, Laser)
      if (p.skillMaxCd > 0) {
        p.skillCd -= dt / 1000;
        if (p.skillCd <= 0) {
          p.skillCd = p.skillMaxCd;
          const pSkill = PET_SKILLS[p.id] || PET_SKILLS.default;
          [ {req:'s5', sk: pSkill.s5}, {req:'s15', sk: pSkill.s15} ].forEach(tier => {
            if (ctx.S.hero.roster[p.id] && ctx.S.hero.roster[p.id][`${tier.req}_unlocked`] && tier.sk) {
              const aIdx = runState.pets.indexOf(p);
              const pEl = All.$id(`hpet-${aIdx}`);
              if (tier.sk.type === 'heal_party' || tier.sk.type === 'heal_self') {
                const targets = tier.sk.type === 'heal_party' ? alivePets : [p];
                targets.forEach(ap => {
                  ap.hp = Math.min(ap.maxHp, ap.hp + tier.sk.val);
                  const tIdx = runState.pets.indexOf(ap);
                  const tEl = All.$id(`hpet-${tIdx}`);
                  setTimeout(() => showFloatDamage(`+${tier.sk.val}`, tEl, '#a4dc8c'), 0);
                  const hpPet = All.$id(`hp-pet-${tIdx}`);
                  if (hpPet) hpPet.style.width = `${(ap.hp / ap.maxHp) * 100}%`;
                  spawnSkillEffect(pEl, tEl, tier.sk.type);
                });
              }
              if (tier.sk.type === 'shield_party') {
                alivePets.forEach(ap => {
                  ap.shield = tier.sk.val;
                  const tIdx = runState.pets.indexOf(ap);
                  const tEl = All.$id(`hpet-${tIdx}`);
                  setTimeout(() => showFloatDamage(`SHIELD`, tEl, '#aaddff'), 0);
                  spawnSkillEffect(pEl, tEl, tier.sk.type);
                });
              }
              if (tier.sk.type === 'random_dmg') {
                const rdmg = Math.floor(p.atk * tier.sk.val);
                runState.monster.hp -= rdmg;
                setTimeout(() => showFloatDamage(`-${rdmg}`, mobEl, '#f24d4d'), 150);
                spawnSkillEffect(pEl, mobEl, tier.sk.type);
              }
              if (tier.sk.type === 'laser') {
                const ldmg = Math.floor(p.atk * tier.sk.val);
                runState.monster.hp -= ldmg;
                setTimeout(() => showFloatDamage(`LASER -${ldmg}`, mobEl, '#ff88dd'), 150);
                spawnSkillEffect(pEl, mobEl, tier.sk.type);
              }
              if (tier.sk.type === 'random_buff') {
                alivePets.forEach(ap => { 
                  ap.atk += Math.floor(ap.atk * 0.2); 
                  const tIdx = runState.pets.indexOf(ap);
                  const tEl = All.$id(`hpet-${tIdx}`);
                  setTimeout(() => showFloatDamage(`ATK BUFF`, tEl, '#ffd94d'), 0);
                  spawnSkillEffect(pEl, tEl, tier.sk.type);
                });
              }
            }
          });
        }
        
        // Update Skill UI Bar
        const skBar = All.$id(`sk-pet-${runState.pets.indexOf(p)}`);
        if (skBar) skBar.style.width = `${Math.min(100, Math.max(0, ((p.skillMaxCd - p.skillCd) / p.skillMaxCd) * 100))}%`;
      }
      
      // Đòn đánh thường
      p.cd -= dt / 1000;
      const cdBar = All.$id(`cd-pet-${runState.pets.indexOf(p)}`);
      if (cdBar) cdBar.style.width = `${Math.min(100, Math.max(0, ((p.maxCd - p.cd) / p.maxCd) * 100))}%`;

      if (p.cd <= 0) {
        p.cd = p.maxCd;
        const mult = ctx.S.hero.style === 'attack' ? 1.5 : 1.0;
        
        for (let i = 0; i < p.multiHit; i++) {
          setTimeout(() => {
            if (!runState || !runState.monster || runState.monster.hp <= 0 || runState.monster.isDead) return;
            
            const isCrit = Math.random() < p.crit;
            const dmgBase = Math.max(1, Math.floor(p.atk * mult * (0.8 + Math.random() * 0.4)));
            let dmg = isCrit ? Math.floor(dmgBase * p.critDmg) : dmgBase;
            
            runState.monster.hp -= dmg;
            
            // Nội tại Hút máu (Lifesteal)
            if (p.lifesteal > 0) {
              const heal = Math.floor(dmg * p.lifesteal);
              if (heal > 0) {
                p.hp = Math.min(p.maxHp, p.hp + heal);
                const pIdx = runState.pets.indexOf(p);
                const pEl = All.$id(`hpet-${pIdx}`);
                setTimeout(() => showFloatDamage(`+${heal}`, pEl, '#a4dc8c'), 150);
                const hpPet = All.$id(`hp-pet-${pIdx}`);
                if (hpPet) setTimeout(() => { hpPet.style.width = `${(p.hp / p.maxHp) * 100}%`; }, 150);
              }
            }
            
            // Nội tại Gây choáng (Stun)
            const pSkill = PET_SKILLS[p.id] || PET_SKILLS.default;
            let isStun = false;
            const data = ctx.S.hero.roster[p.id] || {};
            if (data.s5_unlocked && pSkill.s5 && pSkill.s5.type === 'stun' && Math.random() < pSkill.s5.val) isStun = true;
            if (data.s15_unlocked && pSkill.s15 && pSkill.s15.type === 'stun' && Math.random() < pSkill.s15.val) isStun = true;
            if (isStun) {
              runState.monster.stunCd = (runState.monster.stunCd || 0) + 1.0; // Stun 1s
            }
            
            // Hoạt ảnh
            const pIdx = runState.pets.indexOf(p);
            const pEl = All.$id(`hpet-${pIdx}`);
            if (pEl) { pEl.classList.remove('idle'); pEl.classList.add('attack'); setTimeout(() => { pEl.classList.remove('attack'); pEl.classList.add('idle'); }, 300); }
            if (mobEl) { setTimeout(() => { mobEl.classList.remove('idle'); mobEl.classList.add('hurt'); setTimeout(() => { mobEl.classList.remove('hurt'); mobEl.classList.add('idle'); }, 200); }, 150); }
            
            spawnAttackEffect(p.id, pEl, mobEl, false, isCrit);
            setTimeout(() => showFloatDamage(`-${dmg}`, mobEl, isCrit ? '#f2c231' : null), 150);
            if (isStun) setTimeout(() => showFloatDamage('STUN!', mobEl, '#ccc'), 200);
          }, i * 200); // Giãn cách đòn đánh nếu có multiHit
        }
      }
    });
    
    // Cập nhật máu quái
    const hpMob = All.$id('hp-mob');
    if (hpMob) hpMob.style.width = `${Math.max(0, (runState.monster.hp / runState.monster.maxHp) * 100)}%`;
    
    // 2. Monster Attacks
    if (runState.monster.stunCd && runState.monster.stunCd > 0) {
      runState.monster.stunCd -= dt / 1000;
    } else if (runState.monster.hp > 0) {
      runState.monster.cd -= dt / 1000;
      if (runState.monster.cd <= 0) {
        runState.monster.cd = runState.monster.maxCd;
        const target = alivePets[alivePets.length - 1]; // Đánh con đứng bên phải (cuối mảng)
        const mult = ctx.S.hero.style === 'defense' ? 0.6 : 1.0;
        
        const isDodge = Math.random() < target.dodge;
        const pIdx = runState.pets.indexOf(target);
        const pEl = All.$id(`hpet-${pIdx}`);
        
        spawnAttackEffect('monster', mobEl, pEl, true, false);
        if (mobEl) { mobEl.classList.remove('idle'); mobEl.classList.add('attack'); setTimeout(() => { mobEl.classList.remove('attack'); mobEl.classList.add('idle'); }, 300); }
        
        if (isDodge) {
          setTimeout(() => showFloatDamage('MISS', pEl, '#999'), 150);
        } else {
          let dmg = Math.max(1, Math.floor(runState.monster.atk * mult * (0.8 + Math.random() * 0.4)));
          
          if (target.shield > 0) {
            const absorb = Math.min(target.shield, dmg);
            target.shield -= absorb;
            dmg -= absorb;
          }
          
          if (target.reflect > 0) {
            const refDmg = Math.floor(dmg * target.reflect);
            runState.monster.hp -= refDmg;
            setTimeout(() => showFloatDamage(`REFLECT ${refDmg}`, mobEl, '#ff5555'), 150);
          }
          
          target.hp -= dmg;
          
          if (target.hp <= 0 && target.res > 0) {
            target.res--;
            target.hp = Math.floor(target.maxHp * 0.5);
            setTimeout(() => showFloatDamage('REVIVE', pEl, '#ffd94d'), 150);
          } else if (target.hp < 0) {
             target.hp = 0;
          }
          
          if (dmg > 0) setTimeout(() => showFloatDamage(`-${dmg}`, pEl), 150);
          else setTimeout(() => showFloatDamage(`BLOCK`, pEl, '#aaddff'), 150);
          
          if (pEl && target.hp <= 0) {
            setTimeout(() => { pEl.style.opacity = '0.3'; }, 150);
          }
          
          const hpPet = All.$id(`hp-pet-${pIdx}`);
          if (hpPet) setTimeout(() => { hpPet.style.width = `${(target.hp / target.maxHp) * 100}%`; }, 150);
        }
      }
    }
    
    // 3. Monster Dies
    if (runState.monster.hp <= 0 && !runState.monster.isDead) {
      runState.monster.isDead = true;
      const m = runState.monster;
      if (mobEl) {
        mobEl.classList.remove('idle', 'hurt', 'attack');
        mobEl.style.transition = 'all 0.4s ease-out';
        mobEl.style.opacity = '0';
        mobEl.style.transform = `translateX(${monsterX + 10}px) scale(0.1)`;
        setTimeout(() => showFloatDamage(`KO`, mobEl, '#ffaa00'), 0);
      }
      
      setTimeout(() => {
        if (!runState || !runState.monster) return;
        const goldDrop = Math.floor((runState.stage * 50 + 150) * (m.isBoss ? 5 : 1) * (0.8 + Math.random() * 0.4));
        let pGoldMult = 1.0;
        runState.pets.forEach(p => {
           const data = ctx.S.hero.roster[p.id];
           if (data && data.s15_unlocked && PET_SKILLS[p.id]?.s15?.type === 'gold_drop') pGoldMult *= PET_SKILLS[p.id].s15.val;
        });
        ctx.S.hero.gold += Math.floor(goldDrop * pGoldMult);
      
      const expDrop = (runState.stage * 10 + 5) * (m.isBoss ? 5 : 1);
      runState.pets.forEach(p => {
        if (!ctx.S.hero.roster[p.id]) ctx.S.hero.roster[p.id] = { level: 1, exp: 0, enhHp: 0, enhAtk: 0, s5_unlocked: false, s15_unlocked: false };
        let petData = ctx.S.hero.roster[p.id];
        if (petData.exp === undefined || isNaN(petData.exp)) petData.exp = 0;
        
        petData.exp += Math.floor(expDrop / runState.pets.length);
        
        let leveledUp = false;
        while (petData.level < 30) {
          const nextExp = Math.floor(100 * Math.pow(1.5, petData.level - 1));
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
          petData.exp = Math.floor(100 * Math.pow(1.5, 29)); // Cap it
        }
        
        if (leveledUp) {
          const pIdx = runState.pets.indexOf(p);
          const pEl = All.$id(`hpet-${pIdx}`);
          setTimeout(() => showFloatDamage('LEVEL UP!', pEl, '#f2c231'), 500);
          heroToast(`${PETS[p.id]?.name || 'Pet'} vừa lên cấp ${petData.level}!`);
          const st = getPetStats(p.id);
          const oldMax = p.maxHp;
          p.maxHp = Math.floor(st.maxHp * (p.hpMult || 1));
          p.hp += (p.maxHp - oldMax); // Tăng máu hiện tại theo lượng maxHp tăng thêm
          p.atk = Math.floor(st.atk * (p.atkMult || 1));
        }
      });
      
      // Rớt đồ (Loot)
      const r = Math.random();
      if (m.isBoss) {
        if (r < 0.5) { ctx.S.tickets = ctx.S.tickets || {}; ctx.S.tickets.norm = (ctx.S.tickets.norm || 0) + 1; showFloatDrop('ticketNorm', partyEl); }
        else if (r < 0.8) { ctx.S.ferts['f2'] = (ctx.S.ferts['f2'] || 0) + 1; showFloatDrop('toolFert', partyEl); }
      } else {
        if (r < 0.1) { ctx.S.seeds[m.id] = (ctx.S.seeds[m.id] || 0) + 1; showFloatDrop(CROPS[m.id].sp || 'seedLight', partyEl); }
        else if (r < 0.15) { ctx.S.ferts['f1'] = (ctx.S.ferts['f1'] || 0) + 1; showFloatDrop('toolFert', partyEl); }
      }
      
      runState.stage++;
      if (runState.stage > ctx.S.hero.maxStage) ctx.S.hero.maxStage = runState.stage;
      
      // Hồi máu 1 chút khi qua ải
      runState.pets.forEach(p => { if (p.hp > 0) p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.1); });
      
      save();
      renderHeroUI();
      spawnMonster();
    }, 500); // Chờ 500ms cho hiệu ứng bay màu quái
    }
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
  const scene = startEl.closest('.hero-scene') || document.querySelector('.hero-scene');
  if (!scene) return;
  
  const sRect = scene.getBoundingClientRect();
  
  if (skillType === 'heal_party' || skillType === 'heal_self') {
    if (!targetEl) return;
    const fx = document.createElement('div');
    fx.className = 'fx-heal';
    fx.innerHTML = spriteSVG('healFx', 24);
    scene.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = (tRect.left - sRect.left + tRect.width/2) + 'px';
    fx.style.top = (tRect.top - sRect.top + tRect.height/2) + 'px';
    setTimeout(() => fx.remove(), 1000);
  }
  else if (skillType === 'shield_party') {
    if (!targetEl) return;
    const fx = document.createElement('div');
    fx.className = 'fx-shield';
    fx.innerHTML = spriteSVG('shieldFx', 32);
    fx.style.position = 'absolute';
    fx.style.pointerEvents = 'none';
    scene.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = (tRect.left - sRect.left + tRect.width/2 - 16) + 'px';
    fx.style.top = (tRect.top - sRect.top + tRect.height/2 - 16) + 'px';
    setTimeout(() => fx.remove(), 2000);
  }
  else if (skillType === 'random_buff') {
    if (!targetEl) return;
    const fx = document.createElement('div');
    fx.className = 'fx-buff';
    fx.innerHTML = spriteSVG('holyLight', 32);
    scene.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = (tRect.left - sRect.left + tRect.width/2) + 'px';
    fx.style.top = (tRect.top - sRect.top + tRect.height/2) + 'px';
    setTimeout(() => fx.remove(), 800);
  }
  else if (skillType === 'laser') {
    if (!targetEl) return;
    const tRect = targetEl.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const sx = startRect.left - sRect.left + startRect.width/2;
    const sy = startRect.top - sRect.top + startRect.height/2;
    const ex = tRect.left - sRect.left + tRect.width/2;
    const ey = tRect.top - sRect.top + tRect.height/2;
    
    const dist = Math.hypot(ex - sx, ey - sy);
    const angle = Math.atan2(ey - sy, ex - sx);
    
    const fx = document.createElement('div');
    fx.className = 'laser-beam';
    fx.style.width = dist + 'px';
    fx.style.left = sx + 'px';
    fx.style.top = sy + 'px';
    fx.style.transform = `rotate(${angle}rad)`;
    scene.appendChild(fx);
    setTimeout(() => fx.remove(), 300);
  }
  else if (skillType === 'random_dmg') {
    if (!targetEl) return;
    const fx = document.createElement('div');
    fx.className = 'fx-impact';
    fx.innerHTML = spriteSVG('fireball', 48);
    scene.appendChild(fx);
    const tRect = targetEl.getBoundingClientRect();
    fx.style.left = (tRect.left - sRect.left + tRect.width/2) + 'px';
    fx.style.top = (tRect.top - sRect.top + tRect.height/2) + 'px';
    setTimeout(() => fx.remove(), 250);
  }
}

function spawnAttackEffect(pId, startEl, targetEl, isEnemy, isCrit) {
  if (!startEl || !targetEl) return;
  const scene = startEl.closest('.hero-scene') || document.querySelector('.hero-scene');
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
    const meleeSlash = ['octo', 'ghostBlob', 'impBlob'];
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
    else if (pId === 'cloudMallow') { animType = 'projectile'; spriteId = 'arrow'; } // Temp
    else if (pId === 'penguin') { animType = 'projectile'; spriteId = 'snowball'; }
    else if (pId === 'mystery_blob') { animType = 'projectile'; spriteId = 'shadowBolt'; }
    else if (pId === 'prismBlob') { animType = 'projectile'; spriteId = 'rainbowBolt'; }
    else { animType = 'projectile'; spriteId = 'fireball'; }
  }

  if (animType === 'projectile') {
    const proj = document.createElement('div');
    proj.className = 'dg-projectile';
    proj.innerHTML = isEnemy ? '<div style="width:8px;height:8px;background:#e06578;border-radius:50%;box-shadow:0 0 5px #ff0000;"></div>' : spriteSVG(spriteId, 16);
    scene.appendChild(proj);
    proj.style.left = sx + 'px';
    proj.style.top = sy + 'px';
    const duration = 150;
    proj.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    setTimeout(() => { proj.style.left = ex + 'px'; proj.style.top = ey + 'px'; }, 10);
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
    container.innerHTML = runState.pets.map((p, i) => 
      `<div class="hero-pet idle" id="hpet-${i}" style="z-index:${10-i}; ${extraStyle} opacity: ${p.hp > 0 ? 1 : 0.3}">
         <div class="hp-bar-mini"><div class="hp-fill-mini" id="hp-pet-${i}" style="width:${(p.hp/p.maxHp)*100}%"></div></div>
         <div class="hero-bars-container">
           <div class="hero-bar-row"><div class="hero-bar-fill fill-cd" id="cd-pet-${i}" style="width:0%"></div></div>
           ${p.skillMaxCd > 0 ? `<div class="hero-bar-row"><div class="hero-bar-fill fill-sk" id="sk-pet-${i}" style="width:0%"></div></div>` : ''}
         </div>
         ${petSVG(p.id, 32)}
       </div>`
    ).join('');
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
  hGesture = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: bar.offsetLeft, oy: bar.offsetTop };
}

export function onHeroMove(e) {
  if (!hGesture || e.pointerId !== hGesture.id) return;
  const bar = All.$id('hero-bar');
  bar.style.left = hGesture.ox + e.clientX - hGesture.sx + 'px';
  bar.style.top = hGesture.oy + e.clientY - hGesture.sy + 'px';
  bar.style.right = 'auto'; 
  bar.style.bottom = 'auto';
}

export function onHeroUp(e) {
  if (!hGesture || e.pointerId !== hGesture.id) return;
  const bar = All.$id('hero-bar');
  try { bar.releasePointerCapture(e.pointerId); } catch (er) {}
  
  const vw = window.innerWidth, vh = window.innerHeight;
  let newFx = bar.offsetLeft / vw;
  let newFy = bar.offsetTop / vh;
  if (!isNaN(newFx)) ctx.S.hero.fx = Math.min(Math.max(newFx, 0), 1);
  if (!isNaN(newFy)) ctx.S.hero.fy = Math.min(Math.max(newFy, 0), 1);
  save();
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
  const x = Math.min(Math.max(fx * vw, 0), vw - w);
  const y = Math.min(Math.max(fy * vh, 0), vh - h);
  
  bar.style.left = x + 'px'; 
  bar.style.top = y + 'px';
  bar.style.right = 'auto';
  bar.style.bottom = 'auto';
}

export function initHero() {
  const bar = All.$id('hero-bar');
  if (bar) {
    bar.addEventListener('pointerdown', onHeroDown);
    window.addEventListener('pointermove', onHeroMove);
    window.addEventListener('pointerup', onHeroUp);
    
    const closeBtn = All.$id('hero-close');
    if (closeBtn) closeBtn.addEventListener('click', closeHeroMode);
    
    const cashOutBtn = All.$id('hero-cashout');
    if (cashOutBtn) cashOutBtn.addEventListener('click', cashOutHero);
  }
}


