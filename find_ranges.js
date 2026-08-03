const fs = require('fs');
const lines = fs.readFileSync('index.js', 'utf8').split('\n');

function findRange(startStr, endStr) {
  const start = lines.findIndex(l => l.includes(startStr));
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].includes(endStr)) {
      end = i;
      break;
    }
  }
  console.log(`Range for "${startStr}" to "${endStr}": ${start + 1} to ${end + 1}`);
  return { start, end };
}

findRange('const style = document.createElement(\'style\');', '`;');
findRange('/* ---------- Số liệu (TEST_MODE là chỗ giữ chỗ) ---------- */', 'const WEATHERS = ');
findRange('function mulberry32(a) {', '/* ---------- DOM:Shadow root ---------- */');
findRange('const PETS = {', 'const FLOATY = {');
