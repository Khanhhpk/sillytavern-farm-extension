const Jimp = require('jimp');

async function main() {
  const head = await Jimp.read('sans_head_side.png');
  
  const t1 = await Jimp.read('sans sprites/02_torso_side/torso_side_01.png');
  const l1 = await Jimp.read('sans sprites/04_legs_side/legs_side_01.png');
  
  const t2 = await Jimp.read('sans sprites/02_torso_side/torso_side_02.png');
  const l2 = await Jimp.read('sans sprites/04_legs_side/legs_side_02.png');
  
  const comp1 = new Jimp(23, 30);
  // Using x=5 for l1 makes it align under the body
  comp1.composite(l1, 5, 23).composite(t1, 5, 13).composite(head, 4, 0);
  await comp1.writeAsync('sans sprites/05_full_body_walk/walk_side_01.png');
  
  const comp2 = new Jimp(23, 30);
  comp2.composite(l1, 5, 23).composite(l2, 1, 24).composite(t1, 5, 13).composite(head, 4, 0);
  await comp2.writeAsync('sans sprites/05_full_body_walk/walk_side_02.png');
  
  console.log('Done baking side frames');
}
main();
