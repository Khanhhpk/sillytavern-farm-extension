const fs = require('fs');
const path = require('path');

const srcFile = 'd:/Project st/ext game nông trại/ST_farm-v1.1_VI_extracted.js';
const code = fs.readFileSync(srcFile, 'utf8');

// 1. Extract CSS
// Look for const style = pdoc.createElement('style'); style.textContent = ` ... `;
const cssRegex = /const style = pdoc\.createElement\('style'\);\s*style\.textContent = `([\s\S]*?)`;/;
const cssMatch = code.match(cssRegex);
let cssContent = '';
if (cssMatch) {
  cssContent = cssMatch[1];
  // Remove the CSS injection code
  const codeWithoutCss = code.replace(cssRegex, '// CSS moved to style.css\n');
  fs.mkdirSync(path.join(__dirname, 'src'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'style.css'), cssContent);
  fs.writeFileSync(path.join(__dirname, 'src', 'main.js'), codeWithoutCss);
  console.log('Successfully extracted style.css and src/main.js');
} else {
  console.log('Could not find CSS block');
}
