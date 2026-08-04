const fs = require('fs');
const code = fs.readFileSync('index.js', 'utf8');

const files = fs.readdirSync('src');
files.forEach(f => {
    if (!['data.js', 'graphics.js', 'style.js', 'store.js', 'main.js'].includes(f)) {
        fs.unlinkSync('src/' + f);
    }
});

const sections = [
    { start: 34, end: 105, name: 'state.js' },      
    { start: 106, end: 193, name: 'utils.js' },     
    { start: 194, end: 339, name: 'ui.js' },        
    { start: 340, end: 953, name: 'events.js' },    
    { start: 954, end: 1028, name: 'orb.js' },      
    { start: 1029, end: 1070, name: 'windows.js' }, 
    { start: 1071, end: 1217, name: 'logic.js' },   
    { start: 1218, end: 1547, name: 'render.js' },  
    { start: 1548, end: 1814, name: 'shop.js' },    
    { start: 1815, end: 2097, name: 'pets.js' },    
    { start: 2098, end: 2321, name: 'witch.js' },   
    { start: 2322, end: 2351, name: 'destroy.js' }  
];

const allLines = code.split('\n');

sections.forEach(sec => {
    let lines = allLines.slice(sec.start - 1, sec.end);
    lines = lines.map(line => {
        let m = line.match(/^ {2}(function|const|let)\s+([a-zA-Z0-9_]+)/);
        if (m) {
            if (['S', 'ui', 'orb', 'win', 'bagWin', 'passWin', 'shopWin', 'msg', 'saveTimer', 'witchTimer'].includes(m[2])) {
                return line.replace(/^ {2}(let|const)\s+/, 'ctx.');
            }
            return line.replace(/^ {2}/, 'export ');
        }
        return line.replace(/^ {2}/, '');
    });
    
    let content = lines.join('\n');
    
    const globals = ['S', 'ui', 'orb', 'win', 'bagWin', 'passWin', 'shopWin', 'msg', 'saveTimer', 'witchTimer'];
    globals.forEach(g => {
        const regex = new RegExp(`(?<!\\.)\\b${g}\\b`, 'g');
        content = content.replace(regex, 'ctx.' + g);
    });
    
    if (sec.name === 'state.js') {
        content = content.replace(/ctx\.orb:/g, 'orb:').replace(/ctx\.win:/g, 'win:');
    }
    if (sec.name === 'witch.js') {
        content = content.replace(/function toast\(ctx\.msg\)/g, 'function toast(msg)');
    }

    
    let imports = `import { ctx } from './store.js';\n`;
    imports += `import * as All from './all.js';\n`;
    imports += `import { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';\n`;
    imports += `import { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';\n\n`;
    
    fs.writeFileSync('src/' + sec.name, imports + content);
});

let allJs = sections.map(sec => `export * from './${sec.name}';`).join('\n');
fs.writeFileSync('src/all.js', allJs);
console.log('Cleaned and recreated');
