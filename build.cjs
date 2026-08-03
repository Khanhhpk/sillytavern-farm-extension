/**
 * build.cjs – Builds index.js directly without Webpack.
 * Inlines CSS as a <style> tag injection, strips import statement.
 */
const fs = require('fs');
const path = require('path');

// 1. Read CSS, escape for use inside a JS template literal
let css = fs.readFileSync(path.join(__dirname, 'src/style.css'), 'utf8');
// Escape backticks and backslashes so the CSS can be embedded in a template literal
css = css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

// 2. Read JS source
let js = fs.readFileSync(path.join(__dirname, 'src/index.js'), 'utf8');

// Strip any injected globals header we added earlier
js = js.replace(/\/\/ Dynamically access ST variables[\s\S]*?const generateRaw = [^\n]*;\n\n?/g, '');

// Strip the CSS import line
js = js.replace(/^import '\.\/style\.css';\n?/m, '');

// Strip the existing export init (we'll add a clean one at the end)
js = js.replace(/\nexport async function init\(\) \{[^}]*\}\s*$/m, '');

// 3. Build final output
const output = `// sillytavern-farm-extension – built by build.cjs (no webpack)
// === CSS injection ===
(function injectFarmCSS() {
  if (document.getElementById('star-farm-style')) return;
  const el = document.createElement('style');
  el.id = 'star-farm-style';
  el.textContent = \`${css}\`;
  document.head.appendChild(el);
})();

// === Game code ===
${js}

// === ST Extension Hook ===
export async function init() {
  console.log('[Farm] init() called by SillyTavern hook');
  initFarm();
}
`;

fs.writeFileSync(path.join(__dirname, 'index.js'), output, 'utf8');
console.log('Built index.js successfully (' + Buffer.byteLength(output) + ' bytes)');
