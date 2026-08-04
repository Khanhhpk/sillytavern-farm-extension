const fs = require('fs');
let text = fs.readFileSync('src/windows.js', 'utf8');

// Match from "dragBar.addEventListener('pointerdown'" up to "save();\n});" before "export function initWindows"
const regex = /dragBar\.addEventListener\('pointerdown'[\s\S]*?save\(\);\r?\n\}\);/;
const match = text.match(regex);
if (match) {
    // Only remove the FIRST occurrence (the top-level one, before initWindows)
    text = text.replace(regex, '');
    fs.writeFileSync('src/windows.js', text);
    console.log('Fixed windows.js via regex');
} else {
    console.log('Regex match failed');
}
