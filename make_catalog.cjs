const fs = require('fs');
const files = fs.readdirSync('basic sans sprite').filter(f => f.endsWith('.png')).sort((a, b) => {
  const pa = a.match(/(\d+)/g);
  const pb = b.match(/(\d+)/g);
  if (parseInt(pa[0]) !== parseInt(pb[0])) return parseInt(pa[0]) - parseInt(pb[0]);
  return parseInt(pa[1]) - parseInt(pb[1]);
});
let html = '<html><body style="background: white;"><table><tr>';
files.forEach((f, i) => {
  html += '<td style="border: 1px solid black; padding: 5px;"><img src="basic sans sprite/' + f + '" style="transform: scale(2); image-rendering: pixelated; margin: 20px;"><br>' + i + ' : ' + f + '</td>';
  if ((i + 1) % 5 === 0) html += '</tr><tr>';
});
html += '</tr></table></body></html>';
fs.writeFileSync('catalog.html', html);
console.log('Done');
