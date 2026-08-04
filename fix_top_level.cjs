const fs = require('fs');

// Fix orb.js
let text = fs.readFileSync('src/orb.js', 'utf8');
const orbChunk1 = `ctx.orb.addEventListener('pointerdown', onOrbDown);
ctx.orb.addEventListener('pointermove', onOrbMove);
ctx.orb.addEventListener('pointerup', e => onOrbUp(e, false));
ctx.orb.addEventListener('pointercancel', e => onOrbUp(e, true));`;
const orbChunk2 = `window.addEventListener('resize', onResize);
disposers.push(() => window.removeEventListener('resize', onResize));
placeOrb();`;

text = text.replace(orbChunk1, '');
text = text.replace(orbChunk2, '');
fs.writeFileSync('src/orb.js', text);
console.log('Fixed orb.js');

// Fix windows.js
text = fs.readFileSync('src/windows.js', 'utf8');
const winChunk = `dragBar.addEventListener('pointerdown', e => {
  if (e.target.id === 'close') return;
  dragBar.setPointerCapture(e.pointerId);
  wg = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: ctx.win.offsetLeft, oy: ctx.win.offsetTop };
});
dragBar.addEventListener('pointermove', e => {
  if (!wg || e.pointerId !== wg.id) return;
  ctx.win.style.left = wg.ox + e.clientX - wg.sx + 'px';
  ctx.win.style.top = wg.oy + e.clientY - wg.sy + 'px';
});
dragBar.addEventListener('pointerup', e => {
  if (!wg || e.pointerId !== wg.id) return;
  try { dragBar.releasePointerCapture(e.pointerId); } catch (er) {}
  wg = null;
  ctx.S.win = { fx: ctx.win.offsetLeft / window.innerWidth, fy: ctx.win.offsetTop / window.innerHeight };
  save();
});`;
text = text.replace(winChunk, '');
fs.writeFileSync('src/windows.js', text);
console.log('Fixed windows.js');

