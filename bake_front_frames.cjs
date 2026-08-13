const Jimp = require('jimp');

async function main() {
  const head = await Jimp.read('sans sprites/08_face_normal/face_front_smile_01.png');
  const torso = await Jimp.read('sans sprites/01_torso_front/torso_front_01.png');
  const legs1 = await Jimp.read('sans sprites/03_legs_front/legs_front_01.png');
  const legs2 = await Jimp.read('sans sprites/03_legs_front/legs_front_02.png');

  // Canvas size: 25x32
  // Head: 23x11 -> x=1, y=0
  // Torso: 23x11 -> x=1, y=11
  // Legs: 19x8 -> x=3, y=22

  const comp1 = new Jimp(25, 32);
  comp1.composite(legs1, 3, 22).composite(torso, 1, 11).composite(head, 1, 0);
  await comp1.writeAsync('sans sprites/05_full_body_walk/walk_front_01.png');

  const comp2 = new Jimp(25, 32);
  comp2.composite(legs2, 3, 22).composite(torso, 1, 11).composite(head, 1, 0);
  await comp2.writeAsync('sans sprites/05_full_body_walk/walk_front_02.png');

  console.log('Done baking front frames');
}

main();
