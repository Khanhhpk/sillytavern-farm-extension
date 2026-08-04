const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));

files.forEach(f => {
    const p = path.join(srcDir, f);
    let content = fs.readFileSync(p, 'utf8');
    let changed = false;

    const replaceMap = {
        'extension_settings': 'ctx.extension_settings',
        'saveSettingsDebounced': 'ctx.saveSettingsDebounced',
        'event_types': 'ctx.event_types',
        'eventSource': 'ctx.eventSource',
        'generateRaw': 'ctx.generateRaw'
    };

    Object.keys(replaceMap).forEach(key => {
        // Replace word boundaries, but not if preceded by 'ctx.' or followed by ':' (like in object declarations)
        const regex = new RegExp(`(?<!ctx\\.)\\b${key}\\b(?!:)`, 'g');
        const count = (content.match(regex) || []).length;
        if (count > 0) {
            content = content.replace(regex, replaceMap[key]);
            changed = true;
        }
    });

    if (content.includes('loadState();\napplyTheme();')) {
        content = content.replace('loadState();\napplyTheme();', '');
        changed = true;
    }
    if (content.includes('loadCharState();\nexport')) {
        content = content.replace('loadCharState();\nexport', 'export');
        changed = true;
    }
    
    // Add extensionName to import from store.js if used
    if (content.includes('extensionName') && !content.includes('extensionName } from')) {
        content = content.replace(/import \{ ctx([^}]*)\} from '\.\/store\.js';/, "import { ctx, extensionName$1} from './store.js';");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(p, content);
        console.log(`Updated ${f}`);
    }
});
