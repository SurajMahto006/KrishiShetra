const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const p = path.join(dir, item);
    const stat = fs.statSync(p);
    if (stat.isDirectory() && !p.includes('node_modules') && !p.includes('.git') && !p.includes('dist')) {
      scanDir(p);
    } else if (item.endsWith('.html')) {
      const content = fs.readFileSync(p, 'utf8');
      const matches = content.match(/data-i18n(?:-[a-z]+)?=["'][^"']+["']/g) || [];
      console.log(p.padEnd(45), matches.length);
    }
  }
}

scanDir('.');
