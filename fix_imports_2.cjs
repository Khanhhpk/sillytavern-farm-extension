const fs = require('fs');
const path = require('path');

function addImport(file, name, source) {
  const filePath = path.join(__dirname, 'src', file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(`import { ${name} }`) && !content.includes(` ${name},`) && !content.includes(`, ${name} }`)) {
    content = `import { ${name} } from './${source}';\n` + content;
    fs.writeFileSync(filePath, content);
    console.log(`Added ${name} to ${file}`);
  }
}

addImport('shop.js', 'setPendingPick', 'render.js');
addImport('shop.js', 'testSecApi', 'events.js');
addImport('shop.js', 'fetchModelList', 'events.js');
addImport('ui.js', 'setMode', 'render.js');
addImport('utils.js', 'requestDayEvent', 'events.js');

