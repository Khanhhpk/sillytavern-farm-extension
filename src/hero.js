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
      <div class="h-r-pet" data-add="${pId}">${petSVG(pId, 32)}</div>
      <div class="h-r-info">
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
  
  mbody.querySelectorAll('.h-r-upg').forEach(el => el.addEventListener('click', () => {
    const pId = el.dataset.upg;
    const st = getPetStats(pId);
    if (ctx.S.hero.gold >= st.upgradeCost) {
      ctx.S.hero.gold -= st.upgradeCost;
      if (!ctx.S.hero.roster[pId]) ctx.S.hero.roster[pId] = { level: 1, exp: 0 };
      ctx.S.hero.roster[pId].level++;
      save();
      openHeroPanel();
      All.toast('Nâng cấp thành công!');
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
  
  // Khởi tạo Run
  runState = {
    stage: 1,
    pets: ctx.S.hero.party.map(pId => {
      const st = getPetStats(pId);
      return { id: pId, maxHp: st.maxHp, hp: st.maxHp, atk: st.atk, cd: 0, maxCd: 1.0 };
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
  monsterX = 200; // Quái ở xa 200px
  
  const em = All.$id('hero-enemy');
  if (em) {
    const scale = isBoss ? 'transform: scale(1.5); transform-origin: bottom right;' : '';
    const bossStyle = isBoss ? 'filter: drop-shadow(0 0 5px #ff0000);' : '';
    em.innerHTML = `
      <div class="hero-mob idle" id="hmob" style="${scale} ${bossStyle}">
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
  
  // Di chuyển
  if (monsterX > 30) {
    monsterX -= (40 * (dt / 1000)); // tốc độ 40px/s
    if (mobEl) mobEl.style.transform = `translateX(${monsterX}px)`;
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
    
    // 1. Pets Attack
    alivePets.forEach(p => {
      p.cd -= dt / 1000;
      if (p.cd <= 0) {
        p.cd = p.maxCd;
        const mult = ctx.S.hero.style === 'attack' ? 1.5 : 1.0;
        const dmg = Math.max(1, Math.floor(p.atk * mult * (0.8 + Math.random() * 0.4)));
        runState.monster.hp -= dmg;
        
        // Hoạt ảnh
        const pIdx = runState.pets.indexOf(p);
        const pEl = All.$id(`hpet-${pIdx}`);
        if (pEl) { pEl.classList.remove('idle'); pEl.classList.add('attack'); setTimeout(() => pEl.classList.add('idle'), 300); }
        if (mobEl) { setTimeout(() => { mobEl.classList.remove('idle'); mobEl.classList.add('hurt'); setTimeout(() => mobEl.classList.add('idle'), 200); }, 150); }
        
        spawnProjectile(pEl, mobEl, false);
        setTimeout(() => showFloatDamage(dmg, mobEl), 150);
      }
    });
    
    // Cập nhật máu quái
    const hpMob = All.$id('hp-mob');
    if (hpMob) hpMob.style.width = `${Math.max(0, (runState.monster.hp / runState.monster.maxHp) * 100)}%`;
    
    // 2. Monster Attacks
    if (runState.monster.hp > 0) {
      runState.monster.cd -= dt / 1000;
      if (runState.monster.cd <= 0) {
        runState.monster.cd = 2.0;
        const target = alivePets[0]; // Đánh con đầu tiên
        const mult = ctx.S.hero.style === 'defense' ? 0.6 : 1.0;
        const dmg = Math.max(1, Math.floor(runState.monster.atk * mult * (0.8 + Math.random() * 0.4)));
        target.hp -= dmg;
        if (target.hp < 0) target.hp = 0;
        
        const pIdx = runState.pets.indexOf(target);
        const pEl = All.$id(`hpet-${pIdx}`);
        
        spawnProjectile(mobEl, pEl, true);
        setTimeout(() => showFloatDamage(dmg, pEl), 150);
        
        if (mobEl) { mobEl.classList.remove('idle'); mobEl.classList.add('attack'); setTimeout(() => mobEl.classList.add('idle'), 300); }
        if (pEl && target.hp <= 0) {
          setTimeout(() => { pEl.style.opacity = '0.3'; }, 150);
        }
        
        const hpPet = All.$id(`hp-pet-${pIdx}`);
        if (hpPet) setTimeout(() => { hpPet.style.width = `${(target.hp / target.maxHp) * 100}%`; }, 150);
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

function showFloatDamage(dmg, target) {
  if (!target) return;
  const fl = document.createElement('div');
  fl.className = 'dmg-float' + (Math.random() > 0.8 ? ' crit' : '');
  fl.textContent = '-' + dmg;
  fl.style.left = (Math.random() * 30 - 15) + 'px'; // Random left offset
  fl.style.bottom = '30px';
  target.appendChild(fl);
  setTimeout(() => fl.remove(), 800);
}

function spawnProjectile(startEl, targetEl, isEnemy) {
  if (!startEl || !targetEl) return;
  const scene = document.querySelector('.hero-scene');
  if (!scene) return;
  
  const proj = document.createElement('div');
  proj.className = 'dg-projectile';
  if (isEnemy) {
    proj.innerHTML = '<div style="width:8px;height:8px;background:#e06578;border-radius:50%;box-shadow:0 0 5px #ff0000;"></div>';
  } else {
    proj.innerHTML = '<div style="width:10px;height:10px;background:#a4dc8c;border-radius:50%;box-shadow:0 0 8px #a4dc8c;"></div>';
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


