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
//
// Path layout (from browser's perspective):
//   Extension:           /scripts/extensions/third-party/sillytavern-farm-extension/index.js
//   ST extensions.js:    /scripts/extensions.js
//   ST script.js:        /scripts/script.js
//
//   So from our file: ../../../ goes up to /scripts/ level, then append filename.
const output = `// sillytavern-farm-extension – built by build.cjs (no Webpack)

// Shadow DOM style element – used by initFarm() via sh.appendChild(style)
const style = document.createElement('style');
style.textContent = \`${css}\`;

// ST globals – declared as 'let' at module scope so initFarm() can close over them.
let extension_settings, eventSource, event_types, saveSettingsDebounced, generateRaw;

${js}

// ST Extension Hook
export async function init() {
  // The extension is served from:
  //   /scripts/extensions/third-party/sillytavern-farm-extension/index.js
  // So '../../../' resolves to /scripts/ which is where extensions.js and script.js live.

  try {
    const extMod = await import('../../../extensions.js');
    extension_settings    = extMod.extension_settings;
    saveSettingsDebounced = extMod.saveSettingsDebounced;
    eventSource           = extMod.eventSource;
    event_types           = extMod.event_types;
    console.log('[Farm] Loaded from extensions.js – ext_settings:', typeof extension_settings, '| save:', typeof saveSettingsDebounced);
  } catch (e) {
    console.warn('[Farm] extensions.js import failed:', e.message);
  }

  if (typeof saveSettingsDebounced !== 'function') {
    try {
      const scriptMod = await import('../../../script.js');
      if (!saveSettingsDebounced) saveSettingsDebounced = scriptMod.saveSettingsDebounced;
      if (!eventSource)           eventSource           = scriptMod.eventSource;
      if (!event_types)           event_types           = scriptMod.event_types;
      if (!generateRaw)           generateRaw           = scriptMod.generateRaw;
      console.log('[Farm] Loaded from script.js – save:', typeof saveSettingsDebounced);
    } catch (e) {
      console.warn('[Farm] script.js import failed:', e.message);
    }
  }

  // Fallback: SillyTavern.getContext()
  if (!extension_settings || typeof saveSettingsDebounced !== 'function') {
    try {
      const ctx = window.SillyTavern?.getContext?.() || {};
      if (!extension_settings)                  extension_settings    = ctx.extensionSettings || ctx.extension_settings;
      if (typeof saveSettingsDebounced !== 'function') saveSettingsDebounced = ctx.saveSettingsDebounced;
      if (!eventSource)                         eventSource           = ctx.eventSource;
      if (!event_types)                         event_types           = ctx.eventTypes || ctx.event_types;
      if (!generateRaw)                         generateRaw           = ctx.generateRaw;
      console.log('[Farm] Fallback getContext() – ext_settings:', typeof extension_settings, '| save:', typeof saveSettingsDebounced);
    } catch (e) {}
  }

  if (!extension_settings) extension_settings = {};
  if (typeof saveSettingsDebounced !== 'function') saveSettingsDebounced = () => console.warn('[Farm] saveSettingsDebounced not available!');

  // Debug: confirm what we actually have
  console.log('[Farm] init() READY – ext_settings keys:', Object.keys(extension_settings).length, '| save fn:', typeof saveSettingsDebounced);

  initFarm();
}
`;

fs.writeFileSync(path.join(__dirname, 'index.js'), output, 'utf8');
console.log('Built index.js (' + Buffer.byteLength(output) + ' bytes)');
