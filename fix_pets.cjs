const fs = require('fs');

let text = fs.readFileSync('src/pets.js', 'utf8');

const t1 = `export const wander = window.setInterval(() => {                  // Nhịp tuần tra: cứ 7s lại giao điểm đến / ru ngủ / mở tiểu phẩm cho các bé đang rảnh
  if (!ctx.win.classList.contains('open')) return;           // Tối ưu: Dừng tuần tra và tính toán vị trí khi bảng bị ẩn
  if (!scene && now() >= nextSceneAt) tryScene();
  sh.querySelectorAll('#mascots .pet').forEach(el => {
    const id = el.dataset.pet;
    if (sceneBusy(id) || petTgt[id] || el.classList.contains('sleep')) return;   // Đang diễn / đang đi / đang ngủ thì đừng làm phiền
    if (!PETS[id].job && Math.random() < 0.08) return sleepPet(el);   // Rảnh lâu quá thì chợp mắt một giấc
    if (PETS[id].job && now() - (petTouch[id] || touchBase) > 5 * MIN && Math.random() < 0.08) return sleepPet(el);   // Bé làm việc 5 phút không ai đoái hoài thì đứng ngủ (tưới tự động không bị ảnh hưởng, mây ngủ vẫn mưa nhé)
    if (Math.random() < 0.35) moveTo(el, petSpot(id));
  });
}, 7000);`;

const t2 = `All.$id('mascots').addEventListener('click', e => {
  const el = e.target.closest('.pet'); if (!el) return;
  const id = el.dataset.pet, def = PETS[id];
  if (!def) return;
  petTouch[id] = now();                                  // Ghi lại một lần "được để ý" (dùng để xét ngủ gật của bé làm việc)
  if (el.classList.contains('sleep')) return wakePet(el, true);   // Bé đang ngủ: chọc = giật mình tỉnh, cú này không tính là chọc chọc
  const cry = def.cry[Math.floor(Math.random() * def.cry.length)];
  if (def.job === 'plant') return petPlant(el, cry);    // Nghề tốn tiền: chọc để kích hoạt làm hàng loạt
  if (def.job === 'fert') return petFert(el, cry);
  if (def.job === 'harvest') return petHarvest(el, cry);// #27: thu hoạch cũng đổi sang chọc mới chạy, khỏi quay lại mà ngơ ngác
  if (def.job) return petBubble(el, cry);               // Loại tưới nước: bị động trong ca, chọc = chào hỏi
  let txt = cry;                                        // Loại tìm kho báu: chọc chọc là rơi tiền
  if (now() - (ctx.S.petPoke[id] || 0) >= POKE_CD) {
    ctx.S.petPoke[id] = now();
    const gain = 1 + Math.floor(Math.random() * 5);
    ctx.S.coins += gain;
    txt += id === 'prismBlob' ? ' rũ ra ' + gain + ' G ánh vụn!'
      : id === 'starBlob' ? ' rơi ra ' + gain + ' G ánh sao!'
      : ' rơi ra ' + gain + ' G';
    save(); All.renderStatus();
  }
  petBubble(el, txt);
  wakePet(el, true);
});`;

text = text.replace(t1, 'export let wander = null;');
text = text.replace(t2, '');

text += `\n\nexport function initPets() {\n`;
text += t1.replace('export const wander = ', '  wander = ') + '\n';
text += t2 + '\n';
text += `}\n`;

fs.writeFileSync('src/pets.js', text);
console.log('Fixed pets.js');
