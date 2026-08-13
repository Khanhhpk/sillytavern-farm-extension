const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const targetBg = { r: 165, g: 73, b: 165 };

function isBg(c) {
  const r = (c >> 24) & 255;
  const g = (c >> 16) & 255;
  const b = (c >> 8) & 255;
  const a = c & 255;
  return Math.abs(r - targetBg.r) < 10 && Math.abs(g - targetBg.g) < 10 && Math.abs(b - targetBg.b) < 10;
}

async function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await processDir(fullPath);
    } else if (file.endsWith('.png')) {
      const img = await Jimp.read(fullPath);
      let changed = false;
      img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx];
        const g = this.bitmap.data[idx+1];
        const b = this.bitmap.data[idx+2];
        if (Math.abs(r - targetBg.r) < 10 && Math.abs(g - targetBg.g) < 10 && Math.abs(b - targetBg.b) < 10) {
          this.bitmap.data[idx+3] = 0;
          changed = true;
        }
      });
      if (changed) {
        await img.writeAsync(fullPath);
        console.log('Made transparent:', fullPath);
      }
    }
  }
}

processDir('sans sprites').then(() => console.log('Done clearing background!')).catch(console.error);
