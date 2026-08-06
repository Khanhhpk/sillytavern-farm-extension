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

// Khởi tạo State cho Hero Mode
export function initHeroState() {
  if (!ctx.S.hero) {
    ctx.S.hero = {
      level: 1,
      exp: 0,
      gold: 0,
      fx: 0.5,
      fy: 0.9,
      party: [], // Danh sách pet ID đang chiến đấu
      style: 'balanced', // attack, defense, balanced
      kills: 0
    };
  }
  if (!ctx.S.hero.style) ctx.S.hero.style = 'balanced';
  if (typeof ctx.S.hero.kills !== 'number') ctx.S.hero.kills = 0;
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
    if (pId) return `<div class="hero-slot filled" data-rem="${i}">${petSVG(pId, 40)}</div>`;
    return `<div class="hero-slot empty">Trống</div>`;
  }).join('');
  
  const allPets = ctx.S.pets || [];
  const petRoster = allPets.map(pId => {
    const inParty = ctx.S.hero.party.includes(pId);
    return `<div class="hero-roster-pet${inParty ? ' used' : ''}" data-add="${pId}">${petSVG(pId, 32)}</div>`;
  }).join('');
  
  const styleBtns = styles.map(s => 
    `<div class="hero-style-btn${ctx.S.hero.style === s.id ? ' active' : ''}" data-style="${s.id}">
      ${spriteSVG(s.icon, 20)} ${s.name}
    </div>`
  ).join('');

  openModal('Tổ đội Anh Hùng', `
    <div class="hero-panel-stats">
      <div>Lv. ${ctx.S.hero.level}</div>
      <div>EXP: ${Math.floor(ctx.S.hero.exp)}/${ctx.S.hero.level * 100}</div>
      <div>Gold: ${ctx.S.hero.gold}</div>
    </div>
    
    <div class="hero-panel-section">Đội hình ra trận (Max 3)</div>
    <div class="hero-party-slots">${partySlots}</div>
    
    <div class="hero-panel-section">Kho Thú Cưng</div>
    <div class="hero-pet-roster">${petRoster || '<i>Bạn chưa có Thú cưng nào! Hãy vào Shop để đón các bé.</i>'}</div>
    
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
  
  mbody.querySelectorAll('.hero-roster-pet:not(.used)').forEach(el => el.addEventListener('click', () => {
    if (ctx.S.hero.party.length >= 3) return All.toast('Đội hình đã đầy! (Max 3)');
    ctx.S.hero.party.push(el.dataset.add);
    save();
    openHeroPanel();
  }));
  
  mbody.querySelectorAll('.hero-style-btn').forEach(el => el.addEventListener('click', () => {
    ctx.S.hero.style = el.dataset.style;
    save();
    openHeroPanel();
  }));
  
  mbody.querySelector('#hero-deploy').addEventListener('click', () => {
    closeModal();
    openHeroMode();
  });
}

export function openHeroMode() {
  initHeroState();
  All.closeWin(); // Đóng bảng Farm chính thay vì chỉ ẩn display
  
  const bar = All.$id('hero-bar');
  if (bar) bar.style.display = 'flex';
  
  if (!currentMonster) spawnMonster();
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
  const cropKeys = Object.keys(CROPS);
  const randomCrop = cropKeys[Math.floor(Math.random() * cropKeys.length)];
  
  const isBoss = ctx.S.hero.kills > 0 && ctx.S.hero.kills % 10 === 0;
  const hpMult = isBoss ? 5 : 1;
  const maxHp = (ctx.S.hero.level * 10 + Math.floor(Math.random() * 10)) * hpMult;
  
  currentMonster = {
    id: randomCrop,
    hp: maxHp,
    maxHp: maxHp,
    isBoss: isBoss
  };
  monsterX = 150; // Quái ở xa 150px
  
  const em = All.$id('hero-enemy');
  if (em) {
    const scale = isBoss ? 'transform: scale(1.5); transform-origin: bottom right;' : '';
    const bossStyle = isBoss ? 'filter: drop-shadow(0 0 5px #ff0000);' : '';
    em.innerHTML = `<div class="hero-mob idle" id="hmob" style="${scale} ${bossStyle}">${spriteSVG(CROPS[randomCrop].sp || 'seedLight', 32)}</div>`;
  }
}

function heroTick() {
  const now = Date.now();
  const dt = now - lastTick;
  lastTick = now;
  
  if (!currentMonster) return;
  
  const partyEl = All.$id('hero-party');
  const mobEl = All.$id('hmob');
  
  // Di chuyển
  if (monsterX > 30) {
    monsterX -= (30 * (dt / 1000)); // tốc độ 30px/s
    if (mobEl) mobEl.style.transform = `translateX(${monsterX}px)`;
  } else {
    // Tấn công (khi khoảng cách <= 30)
    // Cập nhật hoạt ảnh
    const pets = partyEl ? partyEl.querySelectorAll('.hero-pet') : [];
    pets.forEach((p, i) => {
      // Cho một pet ngẫu nhiên hoặc thay phiên tấn công
      if (Math.random() < 0.3) {
        p.classList.remove('idle');
        p.classList.add('attack');
        setTimeout(() => { p.classList.remove('attack'); p.classList.add('idle'); }, 300);
      }
    });
    
    if (mobEl) {
      mobEl.classList.remove('idle');
      mobEl.classList.add('hurt');
      setTimeout(() => { mobEl.classList.remove('hurt'); mobEl.classList.add('idle'); }, 200);
    }
    
    // DPS dựa vào số lượng party và cấp độ, tính thêm Lối đánh
    let mult = 1;
    if (ctx.S.hero.style === 'attack') mult = 1.5;
    else if (ctx.S.hero.style === 'defense') mult = 0.8;
    
    const damage = Math.max(1, Math.floor((ctx.S.hero.level * 2 + ctx.S.hero.party.length * 3) * (dt/1000) * 5 * mult)); 
    currentMonster.hp -= damage;
    showFloatDamage(damage, mobEl);
    
    if (currentMonster.hp <= 0) {
      // Quái chết
      ctx.S.hero.kills++;
      const goldDrop = Math.floor(Math.random() * ctx.S.hero.level * (currentMonster.isBoss ? 10 : 2)) + 1;
      const expDrop = (ctx.S.hero.level * 5 + Math.floor(Math.random() * 5)) * (currentMonster.isBoss ? 5 : 1);
      
      ctx.S.hero.gold += goldDrop;
      ctx.S.hero.exp += expDrop;
      
      // Rớt đồ (Loot)
      const r = Math.random();
      if (currentMonster.isBoss) {
        if (r < 0.5) { // 50% rớt vé norm
          ctx.S.tickets = ctx.S.tickets || {};
          ctx.S.tickets.norm = (ctx.S.tickets.norm || 0) + 1;
          showFloatDrop('ticketNorm', partyEl);
        } else if (r < 0.8) { // 30% rớt phân bón xịn
          ctx.S.ferts['f2'] = (ctx.S.ferts['f2'] || 0) + 1;
          showFloatDrop('toolFert', partyEl);
        }
      } else {
        if (r < 0.1) { // 10% rớt hạt giống
          ctx.S.seeds[currentMonster.id] = (ctx.S.seeds[currentMonster.id] || 0) + 1;
          showFloatDrop(CROPS[currentMonster.id].sp || 'seedLight', partyEl);
        } else if (r < 0.15) { // 5% rớt phân bón thường
          ctx.S.ferts['f1'] = (ctx.S.ferts['f1'] || 0) + 1;
          showFloatDrop('toolFert', partyEl);
        }
      }
      save();
      
      checkLevelUp();
      spawnMonster();
    }
  }
  
  updateHeroStats();
}

function checkLevelUp() {
  const reqExp = ctx.S.hero.level * 100;
  if (ctx.S.hero.exp >= reqExp) {
    ctx.S.hero.exp -= reqExp;
    ctx.S.hero.level++;
    All.toast(`Hero Party đạt cấp ${ctx.S.hero.level}!`);
  }
}

function showFloatDamage(dmg, target) {
  if (!target) return;
  const fl = document.createElement('div');
  fl.className = 'dmg-float' + (Math.random() > 0.8 ? ' crit' : '');
  fl.textContent = '-' + dmg;
  fl.style.left = (Math.random() * 20 - 10) + 'px';
  fl.style.bottom = '30px';
  target.appendChild(fl);
  setTimeout(() => fl.remove(), 800);
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
  const container = All.$id('hero-party');
  if (container) {
    // Nếu lối đánh phòng thủ thì thêm effect (màu aura xanh)
    const extraStyle = ctx.S.hero.style === 'defense' ? 'filter: drop-shadow(0 0 4px #4da6ff);' : '';
    container.innerHTML = ctx.S.hero.party.map((pId, i) => 
      `<div class="hero-pet idle" style="z-index:${10-i}; ${extraStyle}">${petSVG(pId, 32)}</div>`
    ).join('');
  }
  updateHeroStats();
}

function updateHeroStats() {
  const lvEl = All.$id('hero-level');
  const expEl = All.$id('hero-exp');
  const expBar = All.$id('hero-exp-bar');
  const goldEl = All.$id('hero-gold');
  
  if (lvEl) lvEl.textContent = ctx.S.hero.level;
  if (expEl) expEl.textContent = `${Math.floor(ctx.S.hero.exp)}/${ctx.S.hero.level * 100}`;
  if (expBar) expBar.style.width = `${Math.min(100, (ctx.S.hero.exp / (ctx.S.hero.level * 100)) * 100)}%`;
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


