import { ctx } from './store.js';
import * as All from './all.js';
import { spriteSVG, petSVG } from './graphics.js';
import { CROPS } from './data.js';
import { save } from './state.js';

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
    };
  }
}

export function openHeroMode() {
  initHeroState();
  All.$id('win').style.display = 'none';
  All.$id('hero-bar').style.display = 'flex';
  
  // Tự chọn party mặc định nếu rỗng
  if (ctx.S.hero.party.length === 0) {
    const availablePets = Object.keys(ctx.S.pets || {}).filter(k => ctx.S.pets[k] >= 1);
    ctx.S.hero.party = availablePets.slice(0, 3);
  }
  
  if (!currentMonster) spawnMonster();
  renderHeroUI();
  placeHeroBar();
  
  if (!heroLoop) {
    lastTick = Date.now();
    heroLoop = setInterval(heroTick, 100); // Game loop 10fps
  }
}

export function closeHeroMode() {
  All.$id('hero-bar').style.display = 'none';
  if (heroLoop) {
    clearInterval(heroLoop);
    heroLoop = null;
  }
  // Mở lại orb
  All.$id('orb').style.display = 'flex';
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
  const maxHp = ctx.S.hero.level * 10 + Math.floor(Math.random() * 10);
  currentMonster = {
    id: randomCrop,
    hp: maxHp,
    maxHp: maxHp
  };
  monsterX = 150; // Quái ở xa 150px
  
  const em = All.$id('hero-enemy');
  if (em) {
    em.innerHTML = `<div class="hero-mob" id="hmob">${spriteSVG(CROPS[randomCrop].sp || 'seedLight', 32)}</div>`;
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
    // Tạo hiệu ứng chạy lật đật cho pet
    if (partyEl) partyEl.style.transform = `translateY(${Math.sin(now / 100) * 2}px)`;
  } else {
    // Tấn công (khi khoảng cách <= 30)
    if (partyEl) partyEl.style.transform = `translateY(0) translateX(5px)`; // Nhào tới
    setTimeout(() => { if (partyEl) partyEl.style.transform = 'translateY(0) translateX(0)'; }, 50);
    
    // DPS dựa vào số lượng party và cấp độ
    const damage = Math.max(1, Math.floor((ctx.S.hero.level * 2 + ctx.S.hero.party.length * 3) * (dt/1000) * 5)); 
    currentMonster.hp -= damage;
    showFloatDamage(damage, mobEl);
    
    if (currentMonster.hp <= 0) {
      // Quái chết
      const goldDrop = Math.floor(Math.random() * ctx.S.hero.level * 2) + 1;
      const expDrop = ctx.S.hero.level * 5 + Math.floor(Math.random() * 5);
      
      ctx.S.hero.gold += goldDrop;
      ctx.S.hero.exp += expDrop;
      
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

function renderHeroUI() {
  const container = All.$id('hero-party');
  if (container) {
    container.innerHTML = ctx.S.hero.party.map((pId, i) => 
      `<div class="hero-pet" style="z-index:${10-i}">${petSVG(pId, 32)}</div>`
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
  ctx.S.hero.fx = Math.min(Math.max(bar.offsetLeft, 0), vw - bar.offsetWidth) / vw;
  ctx.S.hero.fy = Math.min(Math.max(bar.offsetTop, 0), vh - bar.offsetHeight) / vh;
  save();
  hGesture = null;
}

export function placeHeroBar() {
  if (!ctx.S.hero) return;
  const bar = All.$id('hero-bar');
  if (!bar) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const x = Math.min(Math.max(ctx.S.hero.fx * vw, 0), vw - 360);
  const y = Math.min(Math.max(ctx.S.hero.fy * vh, 0), vh - 60);
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


