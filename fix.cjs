const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf8');

// Replace eventOn(tavern_events.CHAT_CHANGED
code = code.replace(/eventOn\(tavern_events\.CHAT_CHANGED,/g, 'eventSource.on(event_types.CHAT_CHANGED,');

// Replace some other missing functions from Tavern Helper like insertOrAssignVariables if used?
code = code.replace(/insertOrAssignVariables\(/g, 'console.log("Farm: Cannot insert variables: ",');
code = code.replace(/getVariables\(\{ type: 'character' \}\)/g, '{}');
code = code.replace(/getCharWorldbookNames\(/g, '[] // getCharWorldbookNames(');
code = code.replace(/getWorldbook\(/g, 'null // getWorldbook(');

// Add imports back
const imports = `import { extension_settings, getContext } from '../../extensions.js';
import { eventSource, event_types, saveSettingsDebounced } from '../../script.js';
import { generateRaw } from '../../endpoints.js';

`;
code = imports + code;

fs.writeFileSync('src/index.js', code);
console.log('Fixed src/index.js imports and events');
