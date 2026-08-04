const fs = require('fs');

// Add $id to ui.js
let ui = fs.readFileSync('src/ui.js', 'utf8');
if (!ui.includes('export const $id')) {
    ui = ui.replace('export const sh = root.attachShadow({ mode: \'open\' });', 'export const sh = root.attachShadow({ mode: \'open\' });\nexport const $id = id => sh.getElementById(id);');
    fs.writeFileSync('src/ui.js', ui);
    console.log('Added $id to ui.js');
}

const files = fs.readdirSync('src').filter(f => f.endsWith('.js'));
files.forEach(f => {
    let content = fs.readFileSync('src/' + f, 'utf8');
    let changed = false;
    
    // Using string split/join to avoid regex syntax issues
    const target = '$id(';
    if (content.includes(target) && f !== 'ui.js') {
        // Only replace $id( if not already All.$id(
        content = content.replace(/(?<!All\.)\$id\(/g, 'All.$id(');
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync('src/' + f, content);
        console.log('Replaced $id in ' + f);
    }
});
