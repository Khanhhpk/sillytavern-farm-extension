const Jimp = require('jimp');

async function main() {
  const image = await Jimp.read('sans sprites/01_torso_front/torso_front_01.png');
  const color = image.getPixelColor(0, 0);
  const rgba = Jimp.intToRGBA(color);
  console.log(`Background color:`, rgba);
}
main();
