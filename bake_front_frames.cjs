const Jimp = require('jimp');

async function main() {
  const head = await Jimp.read('sans sprites/08_face_normal/face_front_smile_01.png');
  const torso = await Jimp.read('sans sprites/01_torso_front/torso_front_01.png');
  const legs1 = await Jimp.read('sans sprites/03_legs_front/legs_front_01.png');
  const legs2 = await Jimp.read('sans sprites/03_legs_front/legs_front_02.png');

  // Generate alternating legs
  const leftStep = legs1.clone();
  const rightStep = legs1.clone();
  const l2Left = legs2.clone().crop(0, 0, 9, 7);
  const l2Right = legs2.clone().crop(10, 0, 9, 7);
  leftStep.blit(l2Left, 0, 1);
  rightStep.blit(l2Right, 10, 1);

  // Canvas size: 23x30
  // Head: 17x15 -> x=3, y=0
  // Torso: 23x11 -> x=0, y=13
  // Legs: 19x8 -> x=2, y=21 (overlaps torso to fix the gap)

  const comp1 = new Jimp(23, 30);
  comp1.composite(leftStep, 2, 21).composite(torso, 0, 13).composite(head, 3, 0);
  await comp1.writeAsync('sans sprites/05_full_body_walk/walk_front_01.png');

  const comp2 = new Jimp(23, 30);
  comp2.composite(rightStep, 2, 21).composite(torso, 0, 13).composite(head, 3, 0);
  await comp2.writeAsync('sans sprites/05_full_body_walk/walk_front_02.png');

  console.log('Done baking front frames');
}

main();
