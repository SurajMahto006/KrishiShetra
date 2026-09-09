const fs = require('fs');
const path = require('path');
const i18n = require('../src/i18n.js');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(getHtmlFiles(fullPath));
      }
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const rootDir = path.join(__dirname, '..');
const files = getHtmlFiles(rootDir);
let totalMissing = 0;

['en', 'hi', 'mr'].forEach(lang => {
  i18n.changeLanguage(lang);
  console.log(`\n=== Checking Language: ${lang} ===`);
  files.forEach(f => {
    const rel = path.relative(rootDir, f);
    const content = fs.readFileSync(f, 'utf8');
    const tags = [...content.matchAll(/data-i18n(?:-placeholder|-title)?="([^"]+)"/g)].map(m => m[1]);
    const missing = [...new Set(tags)].filter(k => {
      const val = i18n.t(k);
      return !val || val === k;
    });
    if (missing.length > 0) {
      console.log(`  [${rel}] missing ${missing.length}:`, missing);
      totalMissing += missing.length;
    }
  });
});

console.log('\nFinished. Total missing across 3 languages:', totalMissing);
