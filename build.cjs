/**
 * build.cjs – Builds index.js directly without Webpack.
 */
const fs = require('fs');
const path = require('path');

// 1. Read CSS, escape for template literal embedding
let css = fs.readFileSync(path.join(__dirname, 'src/style.css'), 'utf8');
css = css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

// 2. Read JS source
let js = fs.readFileSync(path.join(__dirname, 'src/index.js'), 'utf8');

// Strip injected globals header (if present from old runs)
js = js.replace(/\/\/ Dynamically access ST variables[\s\S]*?const generateRaw = [^\n]*;\n\n?/g, '');

// Strip CSS import line
js = js.replace(/^import '\.\/style\.css';\n?/m, '');

// Strip existing export init
js = js.replace(/\nexport async function init\(\) \{[^}]*\}\s*$/, '');

// 3. Build final output
const output = `// sillytavern-farm-extension – built by build.cjs (no Webpack)

// Shadow DOM style element – used by initFarm() via sh.appendChild(style)
const style = document.createElement('style');
style.textContent = \`${css}\`;

// ST globals – declared here as 'let' so initFarm() can close over them.
// Assigned in init() when ST is guaranteed to have loaded them onto window.
let extension_settings, eventSource, event_types, saveSettingsDebounced, generateRaw;

${js}

// ST Extension Hook
export async function init() {
  // Grab ST globals from window (ST is fully ready by the time init() fires)
  extension_settings = window.extension_settings || {};
  eventSource       = window.eventSource;
  event_types       = window.event_types;
  saveSettingsDebounced = window.saveSettingsDebounced;
  generateRaw       = window.generateRaw;

  console.log('[Farm] init() called by SillyTavern');
  initFarm();
}
`;

fs.writeFileSync(path.join(__dirname, 'index.js'), output, 'utf8');
console.log('Built index.js (' + Buffer.byteLength(output) + ' bytes)');
