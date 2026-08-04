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

// 1. orb.js
fixFile(
    'src/orb.js',
    [
        /ctx\.orb = All\.\$id\('ctx\.orb'\), ctx\.win = All\.\$id\('ctx\.win'\);/
    ],
    [
        /ctx\.orb\.addEventListener\('pointerdown', onOrbDown\);\nctx\.orb\.addEventListener\('pointermove', onOrbMove\);\nctx\.orb\.addEventListener\('pointerup', e => onOrbUp\(e, false\)\);\nctx\.orb\.addEventListener\('pointercancel', e => onOrbUp\(e, true\)\);/g,
        /window\.addEventListener\('resize', onResize\);\ndisposers\.push\(\(\) => window\.removeEventListener\('resize', onResize\)\);\nplaceOrb\(\);/g
    ],
    `  ctx.orb = All.$id('ctx.orb');
  ctx.win = All.$id('ctx.win');
  ctx.orb.addEventListener('pointerdown', onOrbDown);
  ctx.orb.addEventListener('pointermove', onOrbMove);
  ctx.orb.addEventListener('pointerup', e => onOrbUp(e, false));
  ctx.orb.addEventListener('pointercancel', e => onOrbUp(e, true));
  window.addEventListener('resize', onResize);
  disposers.push(() => window.removeEventListener('resize', onResize));
  placeOrb();`,
    'initOrb'
);
