const fs = require('fs');

function fixFile(file, topLinesToRemove, bottomLinesToRemove, initContent, initName) {
    let text = fs.readFileSync(file, 'utf8');
    for (let re of topLinesToRemove) {
        text = text.replace(re, '');
    }
    for (let re of bottomLinesToRemove) {
        text = text.replace(re, '');
    }
    text += '\n\nexport function ' + initName + '() {\n' + initContent + '\n}\n';
    fs.writeFileSync(file, text);
    console.log('Fixed ' + file);
}

// 2. windows.js
fixFile(
    'src/windows.js',
    [
        /All\.\$id\('close'\)\.addEventListener\('click', closeWin\);/,
        /export const dragBar = All\.\$id\('drag'\);/
    ],
    [
        /dragBar\.addEventListener\('pointerdown', e => \{\n  if \(e\.target\.id === 'close'\) return;\n  dragBar\.setPointerCapture\(e\.pointerId\);\n  wg = \{ id: e\.pointerId, sx: e\.clientX, sy: e\.clientY, ox: ctx\.win\.offsetLeft, oy: ctx\.win\.offsetTop \};\n\}\);/,
        /dragBar\.addEventListener\('pointermove', e => \{\n  if \(!wg \|\| e\.pointerId !== wg\.id\) return;\n  ctx\.win\.style\.left = wg\.ox \+ e\.clientX - wg\.sx \+ 'px';\n  ctx\.win\.style\.top = wg\.oy \+ e\.clientY - wg\.sy \+ 'px';\n\}\);/,
        /dragBar\.addEventListener\('pointerup', e => \{\n  if \(!wg \|\| e\.pointerId !== wg\.id\) return;\n  try \{ dragBar\.releasePointerCapture\(e\.pointerId\); \} catch \(er\) \{\}\n  wg = null;\n  ctx\.S\.win = \{ fx: ctx\.win\.offsetLeft \/ window\.innerWidth, fy: ctx\.win\.offsetTop \/ window\.innerHeight \};\n  save\(\);\n\}\);/
    ],
    `  All.$id('close').addEventListener('click', closeWin);
  dragBar = All.$id('drag');
  dragBar.addEventListener('pointerdown', e => {
    if (e.target.id === 'close') return;
    dragBar.setPointerCapture(e.pointerId);
    wg = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: ctx.win.offsetLeft, oy: ctx.win.offsetTop };
  });
  dragBar.addEventListener('pointermove', e => {
    if (!wg || e.pointerId !== wg.id) return;
    ctx.win.style.left = wg.ox + e.clientX - wg.sx + 'px';
    ctx.win.style.top = wg.oy + e.clientY - wg.sy + 'px';
  });
  dragBar.addEventListener('pointerup', e => {
    if (!wg || e.pointerId !== wg.id) return;
    try { dragBar.releasePointerCapture(e.pointerId); } catch (er) {}
    wg = null;
    ctx.S.win = { fx: ctx.win.offsetLeft / window.innerWidth, fy: ctx.win.offsetTop / window.innerHeight };
    All.save();
  });`,
    'initWindows'
);

let txt = fs.readFileSync('src/windows.js', 'utf8');
txt = txt.replace('export let wg = null;', 'export let wg = null;\nexport let dragBar = null;');
fs.writeFileSync('src/windows.js', txt);
