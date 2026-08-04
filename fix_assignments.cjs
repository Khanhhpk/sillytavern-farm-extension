const fs = require('fs');
const path = require('path');

const shopJs = path.join(__dirname, 'src/shop.js');
let shopCode = fs.readFileSync(shopJs, 'utf8');

// replace SEC assignment
shopCode = shopCode.replace(/SEC = \{/g, 'Object.assign(SEC, {');
shopCode = shopCode.replace(/pendingPick = (.*?);/g, 'setPendingPick($1);');
if (!shopCode.includes('setPendingPick')) {
  shopCode = "import { setPendingPick } from './render.js';\n" + shopCode;
}
fs.writeFileSync(shopJs, shopCode);

const uiJs = path.join(__dirname, 'src/ui.js');
let uiCode = fs.readFileSync(uiJs, 'utf8');
uiCode = uiCode.replace(/mode = (.*?);/g, 'setMode($1);');
if (!uiCode.includes('setMode')) {
  uiCode = "import { setMode } from './render.js';\n" + uiCode;
}
fs.writeFileSync(uiJs, uiCode);

console.log('Fixed assignments');
