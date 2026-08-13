const fs = require('fs');
let c = fs.readFileSync('src/style.js', 'utf8');
const badStart = c.indexOf('    @keyframes sans_icecream {');
if (badStart !== -1) {
    c = c.slice(0, badStart);
}
// Ensure it ends correctly
c = c.replace(/}\s*`;\s*$/g, '');
c = c.trimEnd();
if (c.endsWith('}')) {
    // Normal
} else if (c.endsWith('} \n}')) {
    c = c.slice(0, c.lastIndexOf('}'));
}

const cssEnd = `
    @keyframes sans_icecream {
      0%, 9.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/icecream/sprite-18-1.png"); }
      10%, 19.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/icecream/sprite-18-2.png"); }
      20%, 29.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/icecream/sprite-18-3.png"); }
      30%, 39.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/icecream/sprite-18-4.png"); }
      40%, 49.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/icecream/sprite-18-5.png"); }
      50%, 59.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/icecream/sprite-18-6.png"); }
      60%, 69.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/icecream/sprite-18-7.png"); }
      70%, 79.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/icecream/sprite-18-8.png"); }
      80%, 89.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/icecream/sprite-18-9.png"); }
      90%, 99.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/icecream/sprite-18-10.png"); }
    }
    @keyframes sans_stool_chup {
      0%, 9.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_chup/sprite-10-1.png"); }
      10%, 19.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_chup/sprite-10-2.png"); }
      20%, 29.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_chup/sprite-10-3.png"); }
      30%, 39.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_chup/sprite-10-4.png"); }
      40%, 49.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_chup/sprite-10-5.png"); }
      50%, 59.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_chup/sprite-10-6.png"); }
      60%, 69.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_chup/sprite-10-7.png"); }
      70%, 79.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_chup/sprite-10-8.png"); }
      80%, 89.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_chup/sprite-10-9.png"); }
      90%, 99.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_chup/sprite-10-10.png"); }
    }
    @keyframes sans_stool {
      0%, 49.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool/sprite-8-1.png"); }
      50%, 99.9% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool/sprite-8-2.png"); }
    }
    @keyframes sans_stool_comb {
      0.00%, 33.23% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_comb/sprite-9-1.png"); }
      33.33%, 66.56% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_comb/sprite-9-2.png"); }
      66.66%, 99.89% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_comb/sprite-9-3.png"); }
    }
    .pet[data-pet="sans"][data-sans-action="icecream"] .pbody img[data-sans-sprite] { animation: sans_icecream 2s infinite; }
    .pet[data-pet="sans"][data-sans-action="stool_chup"] .pbody img[data-sans-sprite] { animation: sans_stool_chup 2s infinite; }
    .pet[data-pet="sans"][data-sans-action="stool"] .pbody img[data-sans-sprite] { animation: sans_stool 2s infinite; }
    .pet[data-pet="sans"][data-sans-action="stool_comb"] .pbody img[data-sans-sprite] { animation: sans_stool_comb 2s infinite; }
}
\`;`;

fs.writeFileSync('src/style.js', c + '\n' + cssEnd);
