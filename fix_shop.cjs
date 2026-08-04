const fs = require('fs');

let text = fs.readFileSync('src/shop.js', 'utf8');

const t1 = `All.$id('mclose').addEventListener('click', closeModal);
All.$id('mbody').addEventListener('click', e => {
  const el = e.target.closest('[data-pick]');
  if (!el || !pendingPick) return;
  const cb = pendingPick; pendingPick = null;
  closeModal(); cb(el.dataset.pick);
});
All.$id('modal').addEventListener('click', e => { if (e.target === All.$id('modal')) closeModal(); });`;

const t2 = `All.sh.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openPanel(b.dataset.open)));`;
const t2b = `sh.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openPanel(b.dataset.open)));`;

text = text.replace(t1, '');
text = text.replace(t2, '');
text = text.replace(t2b, '');

text += `\n\nexport function initShop() {\n`;
text += t1 + '\n';
text += t2b + '\n';
text += `}\n`;

fs.writeFileSync('src/shop.js', text);
console.log('Fixed shop.js');
