const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

async function main() {
  const outDir = 'sans sprites/05_full_body_walk';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  const headFront = await Jimp.read('sans sprites/08_face_normal/face_front_smile_01.png');
  
  // Extract side head from full_body_side.png (y=0 to 14)
  const fullSide = await Jimp.read('sans sprites/05_full_body/full_body_side.png');
  const headSide = fullSide.clone().crop(0, 0, fullSide.bitmap.width, 15);

  // FRONT WALK (8 frames)
  for (let i = 1; i <= 8; i++) {
    const torsoPath = `sans sprites/01_torso_front/torso_front_0${i}.png`;
    const legsPath = `sans sprites/03_legs_front/legs_front_0${i}.png`;
    
    if (!fs.existsSync(torsoPath) || !fs.existsSync(legsPath)) continue;
    
    const torso = await Jimp.read(torsoPath);
    const legs = await Jimp.read(legsPath);
    
    const comp = new Jimp(23, 30);
    const cx = 11;
    
    const ly = 22;
    const lx = Math.round(cx - legs.bitmap.width / 2);
    
    const ty = 13;
    const tx = Math.round(cx - torso.bitmap.width / 2);
    
    const hy = 0;
    const hx = Math.round(cx - headFront.bitmap.width / 2);
    
    comp.composite(legs, lx, ly);
    comp.composite(torso, tx, ty);
    comp.composite(headFront, hx, hy);
    
    await comp.writeAsync(`${outDir}/walk_front_0${i}.png`);
    console.log(`Created walk_front_0${i}.png`);
  }

  // SIDE WALK (4 frames)
  for (let i = 1; i <= 4; i++) {
    const torsoPath = `sans sprites/02_torso_side/torso_side_0${i}.png`;
    const legsPath = `sans sprites/04_legs_side/legs_side_0${i}.png`;
    
    if (!fs.existsSync(torsoPath) || !fs.existsSync(legsPath)) continue;
    
    const torso = await Jimp.read(torsoPath);
    const legs = await Jimp.read(legsPath);
    
    const comp = new Jimp(17, 30);
    const cx = 8;
    
    const ly = 22;
    const lx = Math.round(cx - legs.bitmap.width / 2);
    
    const ty = 13;
    const tx = Math.round(cx - torso.bitmap.width / 2);
    
    const hy = 0;
    const hx = Math.round(cx - headSide.bitmap.width / 2);
    
    comp.composite(legs, lx, ly);
    comp.composite(torso, tx, ty);
    comp.composite(headSide, hx, hy);
    
    await comp.writeAsync(`${outDir}/walk_side_0${i}.png`);
    console.log(`Created walk_side_0${i}.png`);
  }
}
main().catch(console.error);
