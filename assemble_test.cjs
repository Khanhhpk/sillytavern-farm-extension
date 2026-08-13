const Jimp = require('jimp');

async function main() {
  const head = await Jimp.read('sans sprites/08_face_normal/face_front_smile_01.png');
  const torso = await Jimp.read('sans sprites/01_torso_front/torso_front_01.png');
  const legs = await Jimp.read('sans sprites/03_legs_front/legs_front_01.png');
  const ref = await Jimp.read('sans sprites/05_full_body/full_body_front.png');
  
  const comp = new Jimp(23, 30);
  
  const cx = 11; // center pixel
  
  const ly = 22;
  const lx = Math.floor(11 - legs.bitmap.width / 2);
  
  const ty = 13; 
  const tx = Math.floor(11 - torso.bitmap.width / 2);
  
  const hy = 0;
  const hx = Math.floor(11 - head.bitmap.width / 2);
  
  comp.composite(legs, lx, ly);
  comp.composite(torso, tx, ty);
  comp.composite(head, hx, hy);
  
  const diff = Jimp.diff(comp, ref, 0.1);
  console.log('Difference:', diff.percent);
  
  const preview = new Jimp(50, 30);
  preview.composite(ref, 0, 0);
  preview.composite(comp, 25, 0);
  
  await preview.writeAsync('C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\fa4f0e97-27be-4d96-9eb4-6fe29f2db2c1\\test_assemble_2.png');
  console.log('Saved to brain artifacts.');
}
main();
