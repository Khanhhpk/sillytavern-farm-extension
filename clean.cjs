const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf8');

code = code.replace(/import \{ extension_settings.*?;\n/g, '');
code = code.replace(/import \{ eventSource.*?;\n/g, '');
code = code.replace(/import \{ generateRaw.*?;\n/g, '');

const imports = `import { extension_settings, getContext } from '../../extensions.js';
import { eventSource, event_types, saveSettingsDebounced } from '../../script.js';
import { generateRaw } from '../../endpoints.js';
`;
code = imports + code;

fs.writeFileSync('src/index.js', code);
console.log('Cleaned up imports');
