const fs = require('fs');

let text = fs.readFileSync('src/render.js', 'utf8');

const t1Regex = /All\.\$id\('toolbar'\)\.addEventListener\('click', e => \{[\s\S]*?\}\);\n/;
const t2Regex = /All\.\$id\('chipLink'\)\.addEventListener\('click', \(\) => \{[\s\S]*/;

const match1 = text.match(t1Regex);
const match2 = text.match(t2Regex);

if (match1 && match2) {
    text = text.replace(t1Regex, '');
    text = text.replace(t2Regex, '');

    text += `\n\nexport function initRender() {\n`;
    text += match1[0];
    text += match2[0];
    text += `\n}\n`;

    fs.writeFileSync('src/render.js', text);
    console.log('Fixed render.js');
} else {
    console.log('Could not find matches in render.js');
}
