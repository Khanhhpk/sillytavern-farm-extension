import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';

async function bakeSprite(bodyPath, legsPath, outPath) {
  const body = await Jimp.read(bodyPath);
  const legs = await Jimp.read(legsPath);
  
  // Create a 32x32 transparent image
  const bg = new Jimp(32, 32, 0x00000000);
  
  // Calculate leg position (bottom center)
  const legX = Math.floor((32 - legs.bitmap.width) / 2);
  const legY = 32 - legs.bitmap.height;
  
  // Calculate body position (sitting on top of legs, centered horizontally)
  const bodyX = Math.floor((32 - body.bitmap.width) / 2);
  const bodyY = legY - body.bitmap.height;
  
  // Composite
  bg.composite(legs, legX, legY);
  bg.composite(body, bodyX, bodyY);
  
  await bg.writeAsync(outPath);
  console.log(`Baked: ${outPath}`);
}

async function run() {
  const dungeon = 'sans_sprites_dungeon';
  const legsF = path.join(dungeon, 'legs_front/legs_front_01.png');
  const legsS = path.join(dungeon, 'legs_side/legs_side_01.png');
  
  // Attack Up/Down
  const upDownDir = path.join(dungeon, 'attack_updown');
  const upDownFiles = fs.readdirSync(upDownDir).filter(f => f.endsWith('.png'));
  for (const f of upDownFiles) {
    await bakeSprite(path.join(upDownDir, f), legsF, path.join(upDownDir, f));
  }
  
  // Attack Left/Right
  const leftRightDir = path.join(dungeon, 'attack_leftright');
  const leftRightFiles = fs.readdirSync(leftRightDir).filter(f => f.endsWith('.png'));
  for (const f of leftRightFiles) {
    await bakeSprite(path.join(leftRightDir, f), legsS, path.join(leftRightDir, f));
  }
  
  console.log('Done!');
}

run().catch(console.error);
