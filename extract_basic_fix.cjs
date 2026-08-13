const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const spriteMap = {
  'walk_front_idle': 'sprite-1-1.png',
  'walk_front_1': 'sprite-1-2.png',
  'walk_front_2': 'sprite-1-4.png',
  
  'walk_left_idle': 'sprite-2-1.png',
  'walk_left_1': 'sprite-2-2.png',
  'walk_left_2': 'sprite-2-4.png',
  
  'walk_right_idle': 'sprite-3-1.png',
  'walk_right_1': 'sprite-3-2.png',
  'walk_right_2': 'sprite-3-4.png',
  
  'walk_back_idle': 'sprite-4-1.png',
  'walk_back_1': 'sprite-4-2.png',
  'walk_back_2': 'sprite-4-4.png'
};

function isMagenta(r, g, b) {
  // background is 195, 134, 255
  return r === 195 && g === 134 && b === 255;
}

async function main() {
  const inDir = 'basic sans sprite';
  const outDir = 'sans sprites/00_overworld_walk';
  
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  for (const [newName, originalName] of Object.entries(spriteMap)) {
    const p = path.join(inDir, originalName);
    if (!fs.existsSync(p)) {
      console.log('Not found:', p);
      continue;
    }

    const img = await Jimp.read(p);
    
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      if (isMagenta(r, g, b)) {
        this.bitmap.data[idx + 3] = 0; // Alpha to 0
      }
    });


    await img.writeAsync(path.join(outDir, newName + '.png'));
    console.log('Processed:', newName);
  }
}

main().catch(console.error);
