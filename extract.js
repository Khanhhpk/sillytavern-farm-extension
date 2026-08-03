const fs = require('fs');
const lines = fs.readFileSync('index.js', 'utf8').split('\n');

// Extract CSS (lines 4 to 321)
// Wait, index is 0-based.
// Line 4 is index 3: const style = document.createElement('style');
// Line 322 is index 321: `;\n
// Actually, let's use the content dynamically to be safe.
const cssStartIdx = lines.findIndex(l => l.includes('style.textContent = `'));
const cssEndIdx = lines.findIndex((l, i) => i > cssStartIdx && l.includes('`;'));
const cssContent = lines.slice(cssStartIdx + 1, cssEndIdx).join('\n');
fs.writeFileSync('src/style.js', 'export const styleCSS = `\n' + cssContent + '\n`;\n');

// Extract Data (lines 347 to 403)
const dataStartIdx = lines.findIndex(l => l.includes('/* ---------- Số liệu'));
const dataEndIdx = lines.findIndex((l, i) => i > dataStartIdx && l.includes('const WEATHERS ='));
let dataContent = lines.slice(dataStartIdx + 1, dataEndIdx + 1).join('\n');
const dataVarsToExport = ['MIN', 'GROW', 'REGROW', 'DAY_MS', 'WATER_CD', 'REGROW_MAX', 'POKE_CD', 'TREASURE_CD', 'PETS_OUT_MAX', 'WITCH_STAY', 'witchGap', 'SNAP_EDGE', 'CROPS', 'ZONE_NAME', 'FERTS', 'BLOCK_PRICE_PG', 'blockPrice', 'WEATHERS'];
dataVarsToExport.forEach(v => {
  dataContent = dataContent.replace(new RegExp('^\\s*const\\s+' + v + '\\s*=', 'gm'), 'export const ' + v + ' =');
});
fs.writeFileSync('src/data.js', dataContent);

// Extract Graphics (lines 477 to 940)
const gfxStartIdx = lines.findIndex(l => l.includes('function mulberry32(a) {'));
const gfxEndIdx = lines.findIndex((l, i) => i > gfxStartIdx && l.includes('/* ---------- DOM:Shadow root ---------- */')) - 1;
let gfxContent = lines.slice(gfxStartIdx, gfxEndIdx + 1).join('\n');
const gfxVarsToExport = ['petSVG', 'spriteSVG', 'tileURI', 'getWitchSVG', 'getPetWitchSVG', 'mulberry32', 'P', 'LP', 'PET_P', 'PETS'];
gfxVarsToExport.forEach(v => {
  gfxContent = gfxContent.replace(new RegExp('function\\s+' + v + '\\s*\\('), 'export function ' + v + '(');
  gfxContent = gfxContent.replace(new RegExp('^\\s*const\\s+' + v + '\\s*=', 'gm'), 'export const ' + v + ' =');
});
fs.writeFileSync('src/graphics.js', 'import { CROPS } from \'./data.js\';\n\n' + gfxContent);

// Rewrite index.js
const imports = [
  'import { MIN, GROW, REGROW, DAY_MS, WATER_CD, REGROW_MAX, POKE_CD, TREASURE_CD, PETS_OUT_MAX, WITCH_STAY, witchGap, SNAP_EDGE, CROPS, ZONE_NAME, FERTS, BLOCK_PRICE_PG, blockPrice, WEATHERS } from \'./src/data.js\';',
  'import { petSVG, spriteSVG, tileURI, getWitchSVG, getPetWitchSVG, PETS } from \'./src/graphics.js\';',
  'import { styleCSS } from \'./src/style.js\';'
];

const newIndexLines = [];
for (let i = 0; i < lines.length; i++) {
  if (i === 0) {
    newIndexLines.push(...imports);
    newIndexLines.push(lines[i]);
    continue;
  }
  
  if (i >= cssStartIdx - 1 && i <= cssEndIdx) {
    if (i === cssEndIdx) {
      newIndexLines.push('const style = document.createElement(\'style\');');
      newIndexLines.push('style.textContent = styleCSS;');
    }
    continue;
  }
  
  if (i >= dataStartIdx && i <= dataEndIdx) continue;
  if (i >= gfxStartIdx && i <= gfxEndIdx) continue;
  
  newIndexLines.push(lines[i]);
}

fs.writeFileSync('index.js', newIndexLines.join('\n'));
console.log('Extraction successfully finished!');
