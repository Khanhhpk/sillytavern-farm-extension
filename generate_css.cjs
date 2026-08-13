const fs = require('fs');
let css = `
    @keyframes sans_icecream {`;
for(let i=1;i<=10;i++) css += `\n      ${(i-1)*10}%, ${i*10-0.1}% { content: url("plugins/sillytavern-farm-extension/sans sprites/icecream/sprite-18-${i}.png"); }`;
css += `\n    }\n    @keyframes sans_stool_chup {`;
for(let i=1;i<=10;i++) css += `\n      ${(i-1)*10}%, ${i*10-0.1}% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_chup/sprite-10-${i}.png"); }`;
css += `\n    }\n    @keyframes sans_stool {`;
for(let i=1;i<=2;i++) css += `\n      ${(i-1)*50}%, ${i*50-0.1}% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool/sprite-8-${i}.png"); }`;
css += `\n    }\n    @keyframes sans_stool_comb {`;
for(let i=1;i<=3;i++) css += `\n      ${((i-1)*33.33).toFixed(2)}%, ${(i*33.33-0.1).toFixed(2)}% { content: url("plugins/sillytavern-farm-extension/sans sprites/stool_comb/sprite-9-${i}.png"); }`;
css += `
    }
    .pet[data-pet="sans"][data-sans-action="icecream"] .pbody img[data-sans-sprite] { animation: sans_icecream 2s infinite; }
    .pet[data-pet="sans"][data-sans-action="stool_chup"] .pbody img[data-sans-sprite] { animation: sans_stool_chup 2s infinite; }
    .pet[data-pet="sans"][data-sans-action="stool"] .pbody img[data-sans-sprite] { animation: sans_stool 2s infinite; }
    .pet[data-pet="sans"][data-sans-action="stool_comb"] .pbody img[data-sans-sprite] { animation: sans_stool_comb 2s infinite; }
`;

fs.appendFileSync('src/style.js', css);
