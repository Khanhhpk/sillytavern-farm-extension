const fs = require('fs');

let code = fs.readFileSync('src/main.js', 'utf8');

// Remove the Tavern Helper wrapper
code = code.replace(/\$\(\(\) => \{ errorCatched\(initFarm\)\(\); \}\);/, '');
code = code.replace(/\$\(window\)\.on\('pagehide'.*?\n/, '');

// Replace window.parent with just window
code = code.replace(/const pwin = window\.parent, pdoc = pwin\.document;/g, 'const pwin = window, pdoc = document;');

// Change NS and storage
code = code.replace(/const NS = 'star_tavern_farm';/, 'const NS = "star_tavern_farm";\n  const extensionName = "sillytavern-farm-extension";');

// loadState modification
const loadStateRegex = /function loadState\(\) \{[\s\S]*?(?=\/\* v0\.8: hàm hỗ trợ cho trang \*\/)/;
const newLoadState = `function loadState() {
    if (!extension_settings[extensionName]) {
      extension_settings[extensionName] = {};
    }
    const g = extension_settings[extensionName] || {};
    S = g[NS] && g[NS].version === 1 ? g[NS] : freshState();
    if (!S.petPoke) S.petPoke = {};
    if (!S.mutDesc) S.mutDesc = {};
    if (!S.passes) S.passes = {};
    if (!S.pets) S.pets = ['slime', 'octo'];
    if (!S.petsOut) S.petsOut = S.pets.slice(0, 6);
    if (!S.jobCfg) S.jobCfg = {};
    if (!S.petFind) S.petFind = {};
    if (!S.theme) S.theme = 'sakura';
    if (!S.page) S.page = 1;
    
    Object.keys(S.bag || {}).forEach(k => {
      const base = k.split('@')[0];
      if (base === 'mysbG' || base === 'mysbW' || base === 'mysbM') {
        const nk = k.replace(base, 'moonberry');
        S.bag[nk] = (S.bag[nk] || 0) + S.bag[k];
        delete S.bag[k];
      }
    });
    [S.plots, S.plots2, S.plots3].forEach(arr => (arr || []).forEach(p => {
      if (p.crop && (p.crop.id === 'mysbG' || p.crop.id === 'mysbW' || p.crop.id === 'mysbM')) p.crop.id = 'moonberry';
    }));
    
    if (!S.witch) S.witch = { nextAt: now(), leaveAt: 0, missed: 0, order: null };
    if (!S.shards) S.shards = { prism: 0, star: 0 };
    if (!S.plots2) S.plots2 = emptyPlots();
    if (!S.plots3) S.plots3 = emptyPlots();
    if (S.unlockedBlocks2 == null) S.unlockedBlocks2 = 1;
    if (S.unlockedBlocks3 == null) S.unlockedBlocks3 = 1;
    
    [S.plots, S.plots2, S.plots3].forEach(arr => arr.forEach(p => {
      const c = p.crop; if (!c) return;
      if (!c.fertUsed) c.fertUsed = {};
      if (CROPS[c.id].regrow && c.left == null) c.left = REGROW_MAX;
    }));
  }
  `;
code = code.replace(loadStateRegex, newLoadState);

// save modification
const saveRegex = /function save\(immediate\) \{[\s\S]*?(?=\/\* ---------- Tiện ích ---------- \*\/)/;
const newSave = `function save(immediate) {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    const doSave = () => {
      extension_settings[extensionName][NS] = S;
      if (saveSettingsDebounced) saveSettingsDebounced();
    };
    if (immediate) doSave(); else saveTimer = setTimeout(doSave, 500);
    try { updateInjection(); } catch (e) {}
  }
  `;
code = code.replace(saveRegex, newSave);


// Wrap in ST extension init
let finalCode = `import { extension_settings, getContext } from '../../../../extensions.js';
import { eventSource, event_types, saveSettingsDebounced } from '../../../../script.js';
import { generateRaw } from '../../../../endpoints.js';
import './style.css';

` + code + `
jQuery(async () => {
    initFarm();
});
`;

fs.writeFileSync('src/index.js', finalCode);
console.log('Created src/index.js');
