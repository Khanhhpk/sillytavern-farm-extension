const fs = require('fs');
let text = fs.readFileSync('src/shop.js', 'utf8');

const regex = /All\.\$id\('mclose'\)\.addEventListener\('click', closeModal\);\r?\nAll\.\$id\('mbody'\)\.addEventListener\('click', e => \{\r?\n  const el = e\.target\.closest\('\[data-pick\]'\);\r?\n  if \(\!el \|\| \!pendingPick\) return;\r?\n  const cb = pendingPick; pendingPick = null;\r?\n  closeModal\(\); cb\(el\.dataset\.pick\);\r?\n\}\);\r?\nAll\.\$id\('modal'\)\.addEventListener\('click', e => \{ if \(e\.target === All\.\$id\('modal'\)\) closeModal\(\); \}\);\r?\n/;

// Replace ONLY the first occurrence (the top level one)
text = text.replace(regex, '');

fs.writeFileSync('src/shop.js', text);
console.log('Fixed shop.js correctly');
