const fs = require('fs');
const code = fs.readFileSync('index.js', 'utf8');
const match = code.match(/export async function init\(\) \{([\s\S]*)/);
if (match) {
    const bottom = match[1];
    let mainJs = `import * as Store from './store.js';\nimport * as All from './all.js';\nimport { warmUpCache } from './graphics.js';\nimport { CROPS } from './data.js';\nimport { styleCSS } from './style.js';\n\n`;
    mainJs += `export function initFarm() {\n  try { window[Store.RUNTIME_KEY]?.destroy?.(); } catch(e) {}\n  document.getElementById('star-tavern-farm-root')?.remove();\n\n  const style = document.createElement('style');\n  style.textContent = styleCSS;\n  document.head.appendChild(style);\n\n  All.loadState();\n  All.placeOrb();\n  console.log('Farm initialized');\n}\n\n`;
    
    let modifiedBottom = `export async function init() {` + bottom
                               .replace(/extension_settings\s*=/g, 'Store.extension_settings =')
                               .replace(/eventSource\s*=/g, 'Store.eventSource =')
                               .replace(/event_types\s*=/g, 'Store.event_types =')
                               .replace(/saveSettingsDebounced\s*=/g, 'Store.saveSettingsDebounced =')
                               .replace(/generateRaw\s*=/g, 'Store.generateRaw =');
    mainJs += modifiedBottom;
    fs.writeFileSync('src/main.js', mainJs);
    console.log('src/main.js created');
} else {
    console.log('Not found init');
}
