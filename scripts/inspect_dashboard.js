const fs = require('fs');
const html = fs.readFileSync('dashboard.html', 'utf8');
const lines = html.split('\n');

console.log('=== MATCHES IN dashboard.html ===');
lines.forEach((l, idx) => {
  if (/(map|decision|storage|warehouse|depot|sell-vs-store|svs)/i.test(l)) {
    if (l.includes('<section') || l.includes('<div') || l.includes('id=') || l.includes('class=')) {
      console.log(`${idx + 1}: ${l.trim().substring(0, 100)}`);
    }
  }
});
