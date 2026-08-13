const Jimp = require('jimp');
const path = require('path');

function removeBg(img) {
  const bg = img.getPixelColor(0, 0);
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
    const p = img.getPixelColor(x, y);
    if (p === bg) {
      this.bitmap.data[idx + 3] = 0; // set alpha to 0
    }
  });
  return img;
}

async function main() {
  const torso = await Jimp.read('sans sprites/01_torso_front/torso_front_02.png');
  const legs = await Jimp.read('sans sprites/03_legs_front/legs_front_02.png');
  
  console.log(`Torso dim: ${torso.bitmap.width}x${torso.bitmap.height}`);
  console.log(`Legs dim: ${legs.bitmap.width}x${legs.bitmap.height}`);
  
  removeBg(torso);
  removeBg(legs);
  
  // Create a new image composite
  // Assuming they are the same size
  const comp = new Jimp(torso.bitmap.width, torso.bitmap.height);
  comp.composite(legs, 0, 0);
  comp.composite(torso, 0, 0);
  
  await comp.writeAsync('sans_composite_test.png');
  console.log('Test composite created at sans_composite_test.png');
}
main();
