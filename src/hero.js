import { ctx } from './store.js';
import * as All from './all.js';
import { spriteSVG, petSVG } from './graphics.js';
import { CROPS } from './data.js';
import { save } from './state.js';
import { openModal, closeModal } from './shop.js';

let heroLoop = null;
let lastTick = 0;
let currentMonster = null;
let monsterX = 100;
let floatingDamageContainer = null;

export const PET_SKILLS = {
  slime: { s5: { type: 'heal_party', val: 10, cd: 4, desc: 'Hồi 10 HP cho cả đội (Mỗi 4s)' }, s15: { type: 'max_hp_party', val: 0.3, desc: 'Nội tại: Tăng 30% Max HP toàn đội' } },
  octo: { s5: { type: 'atk_up', val: 0.2, desc: 'Nội tại: Tăng 20% ATK bản thân' }, s15: { type: 'multi_hit', val: 2, desc: 'Nội tại: Đánh 2 đòn liên tiếp' } },
  slimePink: { s5: { type: 'lifesteal', val: 0.2, desc: 'Nội tại: Hút máu 20%' }, s15: { type: 'crit_rate', val: 0.3, desc: 'Nội tại: Tỉ lệ bạo kích +30%' } },
  octoCream: { s5: { type: 'dodge', val: 0.2, desc: 'Nội tại: Tỉ lệ né 20%' }, s15: { type: 'reflect', val: 0.5, desc: 'Nội tại: Phản 50% sát thương' } },
  ghostBlob: { s5: { type: 'dodge', val: 0.2, desc: 'Nội tại: Tỉ lệ né 20%' }, s15: { type: 'lifesteal', val: 0.3, desc: 'Nội tại: Hút máu 30%' } },
  jellyfish: { s5: { type: 'stun', val: 0.2, dur: 1, desc: 'Nội tại: 20% làm choáng 1s' }, s15: { type: 'crit_dmg', val: 3.0, desc: 'Nội tại: Sát thương Crit x3' } },
  impBlob: { s5: { type: 'crit_rate', val: 0.3, desc: 'Nội tại: Tỉ lệ bạo kích +30%' }, s15: { type: 'atk_up', val: 0.5, desc: 'Nội tại: Tăng 50% ATK bản thân' } },
  angelBlob: { s5: { type: 'heal_party', val: 15, cd: 5, desc: 'Hồi 15 HP cho cả đội (Mỗi 5s)' }, s15: { type: 'resurrect', val: 1, desc: 'Nội tại: Hồi sinh 1 lần (50% HP)' } },
  default: { s5: { type: 'atk_up', val: 0.2, desc: 'Nội tại: Tăng 20% ATK' }, s15: { type: 'crit_rate', val: 0.2, desc: 'Nội tại: Tỉ lệ bạo kích +20%' } }
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
}

export function getPetStats(pId) {
  const data = ctx.S.hero.roster[pId] || { level: 1, exp: 0 };
  // Mỗi pet có base stat ngẫu nhiên hoặc dựa trên ID? Tạm lấy base chung.
  return {
    level: data.level,
    exp: data.exp,
    maxHp: 100 + data.level * 20,
    atk: 10 + data.level * 3,
    nextExp: data.level * 100,
    upgradeCost: data.level * 50
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
      <div class="h-r-info" data-info="${pId}" title="Xem Kỹ năng" style="cursor:pointer;">
        <div>Lv.${st.level} (ATK: ${st.atk} | HP: ${st.maxHp})</div>
        <div class="h-r-bar"><div class="h-r-fill" style="width:${Math.min(100, st.exp/st.nextExp*100)}%"></div><span>${st.exp}/${st.nextExp}</span></div>
      </div>
      <div class="h-r-upg" data-upg="${pId}" title="Nâng cấp Level">
        ${spriteSVG('coin', 12)} ${st.upgradeCost}
      </div>
    </div>`;
  }).join('');
  
  const styleBtns = styles.map(s => 
    `<div class="hero-style-btn${ctx.S.hero.style === s.id ? ' active' : ''}" data-style="${s.id}">
      ${spriteSVG(s.icon, 20)} ${s.name}
    </div>`
  ).join('');

  openModal('Phòng Tập Anh Hùng', `
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
  
  mbody.querySelectorAll('.h-r-upg').forEach(el => el.addEventListener('click', () => {
    const pId = el.dataset.upg;
    const st = getPetStats(pId);
    if (ctx.S.hero.gold >= st.upgradeCost) {
      ctx.S.hero.gold -= st.upgradeCost;
      if (!ctx.S.hero.roster[pId]) ctx.S.hero.roster[pId] = { level: 1, exp: 0 };
      ctx.S.hero.roster[pId].level++;
      save();
      openHeroPanel();
    } else {
      All.toast('Không đủ vàng!');
    }
  }));
  
  mbody.querySelectorAll('.hero-style-btn').forEach(el => el.addEventListener('click', () => {
    ctx.S.hero.style = el.dataset.style;
    save();
    openHeroPanel();
  }));
  
  mbody.querySelector('#hero-deploy').addEventListener('click', () => {
    if (ctx.S.hero.party.length === 0) return All.toast('Đội hình trống!');
    closeModal();
    openHeroMode();
  });
}

function openPetSkills(pId) {
  const st = getPetStats(pId);
  const data = ctx.S.hero.roster[pId] || { level: 1, exp: 0 };
  const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
  
  const skillHtml = [ {lvl: 5, sk: pSkill.s5}, {lvl: 15, sk: pSkill.s15} ].map(tier => {
    const unlocked = data.level >= tier.lvl;
    return `<div class="p-skill-tier ${unlocked ? 'unlocked' : 'locked'}">
      <div class="p-sk-icon">${unlocked ? spriteSVG('emStar', 24) : spriteSVG('emLock', 24)}</div>
      <div class="p-sk-desc">
        <div style="font-size: 13px; font-weight: bold; color: ${unlocked ? '#a4dc8c' : '#777'};">Mở khóa ở Lv.${tier.lvl}</div>
        <div style="font-size: 14px; margin-top: 2px;">${tier.sk.desc}</div>
      </div>
    </div>`;
  }).join('');
  
  openModal('Kỹ Năng & Nâng Cấp', `
    <div style="display:flex; gap: 16px; margin-bottom: 16px; align-items:center;">
      <div style="background:#2c2538; border-radius:12px; padding:12px; border: 2px solid #5d4a85;">
        ${petSVG(pId, 64)}
      </div>
      <div style="flex:1;">
        <div style="font-size: 18px; font-weight:bold; color: #f2c231; margin-bottom: 4px;">Lv.${st.level}</div>
        <div style="font-size: 14px;">HP Cơ bản: <b>${st.maxHp}</b></div>
        <div style="font-size: 14px;">ATK Cơ bản: <b>${st.atk}</b></div>
        <div class="h-r-bar" style="margin-top:8px;"><div class="h-r-fill" style="width:${Math.min(100, st.exp/st.nextExp*100)}%"></div><span>EXP: ${st.exp}/${st.nextExp}</span></div>
      </div>
    </div>
    
    <div class="hero-panel-section">Tech Tree (Nội Tại & Kỹ Năng)</div>
    <div style="display:flex; flex-direction:column; gap:8px;">
      ${skillHtml}
    </div>
    
    <div class="hero-deploy-btn" id="pet-upg-btn" style="margin-top: 20px;">
      Nâng Cấp (${st.upgradeCost} Vàng)
    </div>
    <div class="hero-deploy-btn" id="pet-back-btn" style="margin-top: 8px; background: #2c2538; border-color: #5d4a85;">
      Quay Lại
    </div>
  `);
  
  const mbody = All.$id('mbody');
  mbody.querySelector('#pet-upg-btn').addEventListener('click', () => {
    const st2 = getPetStats(pId);
    if (ctx.S.hero.gold >= st2.upgradeCost) {
      ctx.S.hero.gold -= st2.upgradeCost;
      if (!ctx.S.hero.roster[pId]) ctx.S.hero.roster[pId] = { level: 1, exp: 0 };
      ctx.S.hero.roster[pId].level++;
      save();
      openPetSkills(pId); // Reload current modal
    } else {
      All.toast('Không đủ vàng!');
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
  ctx.S.hero.party.forEach(pId => {
    const data = ctx.S.hero.roster[pId] || { level: 1 };
    const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
    if (data.level >= 15 && pSkill.s15.type === 'max_hp_party') partyHpMult += pSkill.s15.val;
  });

  // Khởi tạo Run
  runState = {
    stage: 1,
    pets: ctx.S.hero.party.map(pId => {
      const st = getPetStats(pId);
      const data = ctx.S.hero.roster[pId] || { level: 1 };
      const pSkill = PET_SKILLS[pId] || PET_SKILLS.default;
      
      let atkMult = 1;
      let critRate = 0.1; // Base crit
      let critDmg = 2.0;  // Base crit dmg
      let dodge = 0;
      let lifesteal = 0;
      let res = 0;
      
      [ {req: 5, sk: pSkill.s5}, {req: 15, sk: pSkill.s15} ].forEach(tier => {
        if (data.level >= tier.req) {
          if (tier.sk.type === 'atk_up') atkMult += tier.sk.val;
          if (tier.sk.type === 'crit_rate') critRate += tier.sk.val;
          if (tier.sk.type === 'crit_dmg') critDmg = tier.sk.val;
          if (tier.sk.type === 'dodge') dodge += tier.sk.val;
          if (tier.sk.type === 'lifesteal') lifesteal += tier.sk.val;
          if (tier.sk.type === 'resurrect') res += tier.sk.val;
        }
      });
      
      const hp = Math.floor(st.maxHp * partyHpMult);
      return { 
        id: pId, 
        maxHp: hp, hp: hp, 
        atk: Math.floor(st.atk * atkMult), 
        cd: 0, maxCd: 1.0,
        crit: critRate, critDmg: critDmg,
        dodge, lifesteal, res,
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
  All.toast('Taskbar Hero đã xuất phát!');
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

export function cashOutHero() {
  if (ctx.S.hero.gold > 0) {
    ctx.S.coins = (ctx.S.coins || 0) + ctx.S.hero.gold;
    All.toast(`Đã rút ${ctx.S.hero.gold}G về trang trại!`);
    ctx.S.hero.gold = 0;
    save();
    updateHeroStats();
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
    isBoss: isBoss
  };
  monsterX = 350; // Quái ở xa 350px (bên phải taskbar)
  
  const em = All.$id('hero-enemy');
  if (em) {
    const scale = isBoss ? 'scale(1.5)' : '';
    const bossStyle = isBoss ? 'filter: drop-shadow(0 0 5px #ff0000);' : '';
    em.innerHTML = `
      <div class="hero-mob idle" id="hmob" style="transform: translateX(${monsterX}px) ${scale}; transform-origin: bottom right; ${bossStyle}">
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
  
  // Di chuyển (Dừng khi monsterX <= 130px, vì Party chiếm từ 10px đến ~120px)
  if (monsterX > 130) {
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
      All.toast('Đội hình đã gục ngã! Về Stage 1...');
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
      // Kỹ năng chủ động (Heal)
      if (p.skillMaxCd > 0) {
        p.skillCd -= dt / 1000;
        if (p.skillCd <= 0) {
          p.skillCd = p.skillMaxCd;
          const pSkill = PET_SKILLS[p.id] || PET_SKILLS.default;
          [pSkill.s5, pSkill.s15].forEach(sk => {
            if (sk && sk.type === 'heal_party') {
              alivePets.forEach(ap => {
                ap.hp = Math.min(ap.maxHp, ap.hp + sk.val);
                const aIdx = runState.pets.indexOf(ap);
                const aEl = All.$id(`hpet-${aIdx}`);
                setTimeout(() => showFloatDamage(`+${sk.val}`, aEl, '#a4dc8c'), 0);
                const hpPet = All.$id(`hp-pet-${aIdx}`);
                if (hpPet) hpPet.style.width = `${(ap.hp / ap.maxHp) * 100}%`;
              });
            }
          });
        }
      }
      
      // Đòn đánh thường
      p.cd -= dt / 1000;
      if (p.cd <= 0) {
        p.cd = p.maxCd;
        const mult = ctx.S.hero.style === 'attack' ? 1.5 : 1.0;
        
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
        if (pSkill.s5 && pSkill.s5.type === 'stun' && Math.random() < pSkill.s5.val) isStun = true;
        if (pSkill.s15 && pSkill.s15.type === 'stun' && Math.random() < pSkill.s15.val) isStun = true;
        if (isStun) {
          runState.monster.stunCd = (runState.monster.stunCd || 0) + 1.0; // Stun 1s
        }
        
        // Hoạt ảnh
        const pIdx = runState.pets.indexOf(p);
        const pEl = All.$id(`hpet-${pIdx}`);
        if (pEl) { pEl.classList.remove('idle'); pEl.classList.add('attack'); setTimeout(() => { pEl.classList.remove('attack'); pEl.classList.add('idle'); }, 300); }
        if (mobEl) { setTimeout(() => { mobEl.classList.remove('idle'); mobEl.classList.add('hurt'); setTimeout(() => { mobEl.classList.remove('hurt'); mobEl.classList.add('idle'); }, 200); }, 150); }
        
        spawnProjectile(pEl, mobEl, false, isCrit ? '#f2c231' : null);
        setTimeout(() => showFloatDamage(`-${dmg}`, mobEl, isCrit ? '#f2c231' : null), 150);
        if (isStun) setTimeout(() => showFloatDamage('STUN!', mobEl, '#ccc'), 200);
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
        
        spawnProjectile(mobEl, pEl, true);
        if (mobEl) { mobEl.classList.remove('idle'); mobEl.classList.add('attack'); setTimeout(() => { mobEl.classList.remove('attack'); mobEl.classList.add('idle'); }, 300); }
        
        if (isDodge) {
          setTimeout(() => showFloatDamage('MISS', pEl, '#999'), 150);
        } else {
          const dmg = Math.max(1, Math.floor(runState.monster.atk * mult * (0.8 + Math.random() * 0.4)));
          target.hp -= dmg;
          
          if (target.hp <= 0 && target.res > 0) {
            target.res--;
            target.hp = Math.floor(target.maxHp * 0.5);
            setTimeout(() => showFloatDamage('REVIVE', pEl, '#ffd94d'), 150);
          } else if (target.hp < 0) {
             target.hp = 0;
          }
          
          setTimeout(() => showFloatDamage(`-${dmg}`, pEl), 150);
          
          if (pEl && target.hp <= 0) {
            setTimeout(() => { pEl.style.opacity = '0.3'; }, 150);
          }
          
          const hpPet = All.$id(`hp-pet-${pIdx}`);
          if (hpPet) setTimeout(() => { hpPet.style.width = `${(target.hp / target.maxHp) * 100}%`; }, 150);
        }
      }
    }
    
    // 3. Monster Dies
    if (runState.monster.hp <= 0) {
      const m = runState.monster;
      const goldDrop = Math.floor(Math.random() * runState.stage * (m.isBoss ? 15 : 3)) + 1;
      ctx.S.hero.gold += goldDrop;
      
      // Exp chia đều cho party
      const expDrop = (runState.stage * 10 + 5) * (m.isBoss ? 5 : 1);
      runState.pets.forEach(p => {
        if (!ctx.S.hero.roster[p.id]) ctx.S.hero.roster[p.id] = { level: 1, exp: 0 };
        ctx.S.hero.roster[p.id].exp += Math.floor(expDrop / runState.pets.length);
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

function spawnProjectile(startEl, targetEl, isEnemy, color = null) {
  if (!startEl || !targetEl) return;
  const scene = document.querySelector('.hero-scene');
  if (!scene) return;
  
  const proj = document.createElement('div');
  proj.className = 'dg-projectile';
  if (isEnemy) {
    proj.innerHTML = '<div style="width:8px;height:8px;background:#e06578;border-radius:50%;box-shadow:0 0 5px #ff0000;"></div>';
  } else {
    const c1 = color || '#aaddff';
    const c2 = color || '#0088ff';
    proj.innerHTML = `<div style="width:8px;height:8px;background:${c1};border-radius:50%;box-shadow:0 0 5px ${c2};"></div>`;
  }
  
  scene.appendChild(proj);
  
  const sRect = scene.getBoundingClientRect();
  const startRect = startEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();
  
  const sx = startRect.left - sRect.left + startRect.width/2;
  const sy = startRect.top - sRect.top + startRect.height/2;
  const ex = targetRect.left - sRect.left + targetRect.width/2;
  const ey = targetRect.top - sRect.top + targetRect.height/2;
  
  proj.style.left = sx + 'px';
  proj.style.top = sy + 'px';
  
  const duration = 150;
  proj.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
  
  setTimeout(() => {
    proj.style.left = ex + 'px';
    proj.style.top = ey + 'px';
  }, 10);
  
  setTimeout(() => proj.remove(), duration + 10);
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


