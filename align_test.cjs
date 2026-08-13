const Jimp = require('jimp');

async function main() {
  const head = await Jimp.read('sans sprites/08_face_normal/face_front_smile_01.png');
  const torso = await Jimp.read('sans sprites/01_torso_front/torso_front_02.png');
  const legs = await Jimp.read('sans sprites/03_legs_front/legs_front_02.png');
  const ref = await Jimp.read('sans sprites/05_full_body/full_body_front.png');
  
  const comp = new Jimp(23, 30);
  
  // Try to align them based on centers
  // Head at top, torso in middle, legs at bottom
  // Let's just guess offsets for now
  
  // Center head horizontally
  const hx = Math.floor((23 - head.bitmap.width) / 2);
  const hy = 0;
  
  // Torso
  const tx = Math.floor((23 - torso.bitmap.width) / 2);
  const ty = 14; // guess
  
  // Legs
  const lx = Math.floor((23 - legs.bitmap.width) / 2);
  const ly = 22; // guess
  
  comp.composite(legs, lx, ly);
  comp.composite(torso, tx, ty);
  comp.composite(head, hx, hy);
  
  // also create a side-by-side with ref
  const preview = new Jimp(23 * 2 + 10, 30);
  preview.composite(ref, 0, 0);
  preview.composite(comp, 33, 0);
  
  await preview.writeAsync('align_test.png');
  console.log('align_test.png created');
}
main();
