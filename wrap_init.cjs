const fs = require('fs');

const filesToWrap = {
    'orb.js': 'export function initOrb() {\n',
    'pets.js': 'export function initPets() {\n',
    'render.js': 'export function initRender() {\n',
    'shop.js': 'export function initShop() {\n',
    'windows.js': 'export function initWindows() {\n',
    'witch.js': 'export function initWitch() {\n'
};

for (const [file, wrapperStart] of Object.entries(filesToWrap)) {
    let content = fs.readFileSync('src/' + file, 'utf8');
    const lines = content.split('\n');
    let newLines = [];
    let insideWrapper = false;
    
    // We want to capture global statements like All.$id, addEventListener, disposers.push, ctx.* assignments at the top level
    for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        const trimmed = l.trim();
        // Identify if this is a top-level execution line (not an import/export declaration, function/class definition, or empty/comment)
        // This is a bit heuristic.
        const isExportDecl = l.startsWith('export const') || l.startsWith('export let') || l.startsWith('export var') || l.startsWith('export function');
        const isGlobalExec = !l.startsWith(' ') && !l.startsWith('import') && !isExportDecl && !l.startsWith('//') && !l.startsWith('/*') && trimmed !== '' && !trimmed.startsWith('}') && !trimmed.startsWith(']') && !trimmed.startsWith(';');
        
        if (isGlobalExec && !insideWrapper) {
            // Check if it's actually an assignment or function call
            if (trimmed.includes('All.$id') || trimmed.includes('addEventListener') || trimmed.includes('ctx.') || trimmed.includes('disposers.push') || trimmed.includes('sh.querySelectorAll') || trimmed.includes('document.addEventListener')) {
                newLines.push(wrapperStart);
                insideWrapper = true;
            }
        }
        
        if (insideWrapper) {
            newLines.push('  ' + l); // indent
        } else {
            newLines.push(l);
        }
    }
    
    if (insideWrapper) {
        newLines.push('}\n');
    }
    
    fs.writeFileSync('src/' + file, newLines.join('\n'));
    console.log('Wrapped ' + file);
}
