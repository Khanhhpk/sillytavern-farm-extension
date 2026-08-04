const fs = require('fs');
const code = fs.readFileSync('index.js', 'utf8');

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
let allExports = [];

sections.forEach(sec => {
    let lines = allLines.slice(sec.start - 1, sec.end);
    let fileExports = [];
    lines = lines.map(line => {
        let m = line.match(/^ {2}(function|const|let)\s+([a-zA-Z0-9_]+)/);
        if (m) {
            fileExports.push(m[2]);
            return line.replace(/^ {2}/, 'export ');
        }
        return line.replace(/^ {2}/, '');
    });
    
    allExports.push({ file: sec.name, exports: fileExports });
    
    let imports = `import { S, ui, orb, win, bagWin, passWin, shopWin, msg, saveTimer, witchTimer, setS, setUI, setOrb, setWin, setBagWin, setPassWin, setShopWin, setMsg, setSaveTimer, setWitchTimer, extension_settings, eventSource, event_types, saveSettingsDebounced, generateRaw, NS, extensionName, RUNTIME_KEY, now, emptyPlots, blockPrice, pagePlots, curPlots, curBlocks, eachPage, gameDay, weatherOf, isRain } from './store.js';\n`;
    imports += `import * as All from './all.js';\n\n`;
    
    fs.writeFileSync('src/' + sec.name, imports + lines.join('\n'));
});

let allJs = sections.map(sec => `export * from './${sec.name}';`).join('\n');
fs.writeFileSync('src/all.js', allJs);
console.log('Done splitting files');
