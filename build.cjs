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

// ST globals – declared as 'let' at module scope so initFarm() can close over them.
// Populated inside init() via dynamic import (extension_settings is NOT on window).
let extension_settings, eventSource, event_types, saveSettingsDebounced, generateRaw;

${js}

// ST Extension Hook
export async function init() {
  // Dynamic import of ST's own module exports (not available on window)
  try {
    const extMod = await import('../../extensions.js');
    extension_settings   = extMod.extension_settings;
    saveSettingsDebounced = extMod.saveSettingsDebounced;
    eventSource          = extMod.eventSource;
    event_types          = extMod.event_types;
  } catch (e) {
    console.warn('[Farm] Could not import extensions.js:', e.message);
  }

  // saveSettingsDebounced may live in script.js instead
  if (typeof saveSettingsDebounced !== 'function') {
    try {
      const scriptMod = await import('../../script.js');
      saveSettingsDebounced = scriptMod.saveSettingsDebounced;
      if (!eventSource)    eventSource   = scriptMod.eventSource;
      if (!event_types)    event_types   = scriptMod.event_types;
      if (!generateRaw)    generateRaw   = scriptMod.generateRaw;
    } catch (e) {
      console.warn('[Farm] Could not import script.js:', e.message);
    }
  }

  // Absolute fallback: use SillyTavern.getContext()
  if (!extension_settings) {
    try {
      const ctx = window.SillyTavern?.getContext?.() || {};
      extension_settings    = ctx.extensionSettings || ctx.extension_settings || {};
      saveSettingsDebounced = ctx.saveSettingsDebounced || (() => {});
    } catch (e) {}
  }
  if (!extension_settings) extension_settings = {};
  if (typeof saveSettingsDebounced !== 'function') saveSettingsDebounced = () => {};

  console.log('[Farm] init() – extension_settings ok:', !!extension_settings,
              '| saveSettingsDebounced ok:', typeof saveSettingsDebounced === 'function');
  initFarm();
}
`;

fs.writeFileSync(path.join(__dirname, 'index.js'), output, 'utf8');
console.log('Built index.js (' + Buffer.byteLength(output) + ' bytes)');
