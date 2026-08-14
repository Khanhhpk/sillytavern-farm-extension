const fs = require('fs');

global.document = {
    createElement: (tag) => ({ style: {}, className: '', classList: { add: ()=>{}, remove: ()=>{} }, appendChild: ()=>{}, innerHTML: '', textContent: '', querySelector: () => null, remove: ()=>{}, parentNode: { removeChild: ()=>{} } })
};
global.window = {};

let code = fs.readFileSync('src/dungeon.js', 'utf8');
code = code.replace(/import .* from .*/g, '');
code = code.replace(/export /g, '');

global.All = { $id: (id) => ({ ...global.document.createElement('div'), contains: () => true }), getActiveCookingBuffs: () => [] };
global.PET_STATS = { default: { hp: 100, atk: 10, range: 40, cd: 1, speed: 50 }, sans: { hp: 1, atk: 1, range: 300, cd: 0.2, speed: 55, ai: 'sans_ai' }, ghostBlob: { hp: 100, atk: 10, range: 40, cd: 1, speed: 50 } };
global.petsData = global.PET_STATS;
global.SANS_DUNGEON_SPRITES = { idle: 'idle', bone: 'bone' };
global.sansDungeonSpriteForAction = () => ({src: 'idle', flip: false});
global.sansDungeonSpriteFor = () => ({src: 'idle', flip: false});
global.applySansSprite = () => {};
global.arenaEl = global.All.$id('dg-arena');

try {
    eval(code);
    const arenaEl = global.arenaEl;
    const groupA = [{ id: 'ghostBlob', type: 'pet', hp: 100, maxHp: 100, x: 50, y: 50, dx: 0, dy: 0, atk: 10, range: 40, speed: 50, cd: 1, maxCd: 1, el: document.createElement('div'), karmaStacks: 1, status: { karmaDuration: 3 } }];
    const groupB = [{ id: 'sans', type: 'enemy', hp: 1, maxHp: 1, x: 200, y: 200, dx: 0, dy: 0, atk: 10, range: 300, cd: 0.2, maxCd: 0.2, speed: 55, ai: 'sans_ai', el: document.createElement('div'), upgrades: { karmaTick: 0, karmaDur: 0 }, stamina: 100, maxStamina: 100, tpCd: 0, gravityCd: 0, blueMagicCd: 0, gasterCd: 0 }];
    global.projectiles = [];
    
    console.log('Running loop...');
    for(let i=0; i<5000; i++) {
        updateEntities(groupA, groupB, 0.016, {width: 960, height: 450});
        updateEntities(groupB, groupA, 0.016, {width: 960, height: 450});
    }
    console.log('Loop completed successfully.');
} catch (e) {
    console.log('ERROR CAUGHT:', e.stack);
}
