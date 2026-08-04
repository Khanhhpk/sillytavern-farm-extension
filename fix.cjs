const fs = require('fs');

// Restore ui.js
const code = fs.readFileSync('index.js', 'utf8');
const allLines = code.split('\n');

// rebuild ui.js (lines 194-339)
let linesUI = allLines.slice(193, 339);
linesUI = linesUI.map(l => l.replace(/^ {2}(function|const|let)\s+([a-zA-Z0-9_]+)/, (m, g1, g2) => {
    if (['S', 'ui', 'orb', 'win', 'bagWin', 'passWin', 'shopWin', 'msg', 'saveTimer', 'witchTimer'].includes(g2)) {
        return l.replace(/^ {2}(let|const)\s+/, 'ctx.');
    }
    return l.replace(/^ {2}/, 'export ');
}).replace(/^ {2}/, ''));
let cUI = linesUI.join('\n').replace(/(?<!\.)\b(S|ui|orb|win|bagWin|passWin|shopWin|msg|saveTimer|witchTimer)\b/g, 'ctx.$1');

// fix pdoc/pwin
cUI = cUI.replace(/\bpdoc\b/g, 'document').replace(/\bpwin\b/g, 'window');

// fix style
cUI = cUI.replace('sh.appendChild(style);', `const style = document.createElement('style');\nstyle.textContent = styleCSS;\nsh.appendChild(style);`);

let impUI = `import { styleCSS } from './style.js';\nimport { ctx } from './store.js';\nimport * as All from './all.js';\nimport { BLOCK_PRICE_PG, WEATHERS, TEST_MODE, DAY_MS, CROPS, GROW, MIN, REGROW, FERTS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, ZONE_NAME } from './data.js';\nimport { mulberry32, petSVG, spriteSVG, tileURI, warmUpCache, PETS, PASSES, P, LP, PET_P } from './graphics.js';\n\n`;
fs.writeFileSync('src/ui.js', impUI + cUI);

console.log('Restored ui.js');
