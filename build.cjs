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
let extension_settings, eventSource, event_types, saveSettingsDebounced, generateRaw;

${js}

// ST Extension Hook
export async function init() {
  // Thay vì import phức tạp dễ gây lỗi 404, chúng ta dùng chuẩn SillyTavern.getContext()
  // Đây là cách chính thống và an toàn nhất để lấy các biến toàn cục của ST.
  try {
    const ctx = window.SillyTavern && window.SillyTavern.getContext ? window.SillyTavern.getContext() : {};
    
    // Gán các hàm/biến từ context
    extension_settings    = ctx.extensionSettings || window.extension_settings || {};
    saveSettingsDebounced = ctx.saveSettingsDebounced || window.saveSettingsDebounced || (() => {});
    eventSource           = ctx.eventSource || window.eventSource;
    event_types           = ctx.eventTypes || window.event_types;
    generateRaw           = ctx.generateRaw || window.generateRaw;
    
    console.log('[Farm] Đã kết nối ST Context thành công!');
  } catch (e) {
    console.error('[Farm] Lỗi khi kết nối ST Context:', e);
  }

  // Khởi tạo game
  initFarm();
}
`;

fs.writeFileSync(path.join(__dirname, 'index.js'), output, 'utf8');
console.log('Built index.js (' + Buffer.byteLength(output) + ' bytes)');
