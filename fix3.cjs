const fs = require('fs');

function extractAndWrap(file, startStrs, initName) {
    let text = fs.readFileSync(file, 'utf8');
    let initBody = [];
    
    for (let s of startStrs) {
        let idx = text.indexOf(s);
        if (idx === -1) {
            console.error('Could not find string in ' + file + ':\n' + s);
            continue;
        }
        // Extract from idx to the next export/function declaration or EOF
        let endIdx = text.substring(idx).search(/\nexport (let|const|function)/);
        let chunk = '';
        if (endIdx !== -1) {
            chunk = text.substring(idx, idx + endIdx);
            text = text.substring(0, idx) + text.substring(idx + endIdx);
        } else {
            chunk = text.substring(idx);
            text = text.substring(0, idx);
        }
        initBody.push(chunk.trim());
    }
    
    text += '\n\nexport function ' + initName + '() {\n  ' + initBody.join('\n  ') + '\n}\n';
    fs.writeFileSync(file, text);
    console.log('Fixed ' + file);
}

// 3. render.js
extractAndWrap(
    'src/render.js',
    [
        "All.$id('toolbar').addEventListener('click', e => {",
        "All.$id('chipLink').addEventListener('click', () => {"
    ],
    'initRender'
);

// 4. pets.js
extractAndWrap(
    'src/pets.js',
    [
        "window.setInterval(() => {",
        "All.$id('mascots').addEventListener('click', e => {"
    ],
    'initPets'
);

// 5. witch.js
extractAndWrap(
    'src/witch.js',
    [
        "All.$id('witch').addEventListener('click', e => {"
    ],
    'initWitch'
);

// We already fixed orb.js, windows.js, shop.js.
