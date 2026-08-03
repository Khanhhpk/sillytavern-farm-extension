/**
 * build.cjs – Builds index.js directly without Webpack.
 * The game uses Shadow DOM. The 'style' variable must be a <style> element
 * at module scope so initFarm() can do: sh.appendChild(style)
 */
const fs = require('fs');
const path = require('path');

// 1. Read CSS, escape for template literal embedding
let css = fs.readFileSync(path.join(__dirname, 'src/style.css'), 'utf8');
css = css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

// 2. Read JS source
let js = fs.readFileSync(path.join(__dirname, 'src/index.js'), 'utf8');

// Strip injected globals header (if present)
js = js.replace(/\/\/ Dynamically access ST variables[\s\S]*?const generateRaw = [^\n]*;\n\n?/g, '');

// Strip CSS import line
js = js.replace(/^import '\.\/style\.css';\n?/m, '');

// Strip existing export init (we add our own cleaner one at the end)
js = js.replace(/\nexport async function init\(\) \{[^}]*\}\s*$/, '');

// 3. Build final output
// Key insight: initFarm() does sh.appendChild(style) where sh is a Shadow Root.
// The 'style' variable must exist at module scope as a <style> DOM element.
const output = `// sillytavern-farm-extension – built by build.cjs (no Webpack)

// Shadow DOM needs a <style> element. initFarm() calls sh.appendChild(style).
const style = document.createElement('style');
style.textContent = \`${css}\`;

${js}

// ST Extension Hook
export async function init() {
  console.log('[Farm] init() called by SillyTavern');
  initFarm();
}
`;

fs.writeFileSync(path.join(__dirname, 'index.js'), output, 'utf8');
console.log('Built index.js (' + Buffer.byteLength(output) + ' bytes)');
