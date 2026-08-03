const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf8');

// Remove existing imports for ST
code = code.replace(/import \{ extension_settings.*?;\n/g, '');
code = code.replace(/import \{ eventSource.*?;\n/g, '');
code = code.replace(/import \{ generateRaw.*?;\n/g, '');

// Add global declarations
const globals = `// Dynamically access ST variables to avoid ES module import path issues
const getContext = () => window.getContext ? window.getContext() : (SillyTavern && SillyTavern.getContext ? SillyTavern.getContext() : {});
const ST_context = getContext();

const extension_settings = window.extension_settings || ST_context.extension_settings || {};
const eventSource = window.eventSource || ST_context.eventSource;
const event_types = window.event_types || ST_context.event_types;
const saveSettingsDebounced = window.saveSettingsDebounced || ST_context.saveSettingsDebounced;
const generateRaw = window.generateRaw || ST_context.generateRaw;
`;
code = globals + code;

fs.writeFileSync('src/index.js', code);
console.log('Fixed src/index.js globals');
