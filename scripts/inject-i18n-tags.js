const fs = require('fs');
const path = require('path');

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
let updated = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('i18n.js')) {
    console.log('[OK]', path.relative(rootDir, file), 'already has i18n.js');
    return;
  }

  const rel = path.relative(rootDir, file);
  const isSubdir = rel.includes('admin') || rel.includes('transporter');
  const scriptTag = isSubdir ? '<script src="../js/i18n.js"></script>' : '<script src="js/i18n.js"></script>';

  if (content.includes('<script src="js/auth.js"></script>')) {
    content = content.replace('<script src="js/auth.js"></script>', scriptTag + '\n  <script src="js/auth.js"></script>');
  } else if (content.includes('<script src="../js/auth.js"></script>')) {
    content = content.replace('<script src="../js/auth.js"></script>', scriptTag + '\n  <script src="../js/auth.js"></script>');
  } else if (content.includes('</body>')) {
    content = content.replace('</body>', '  ' + scriptTag + '\n</body>');
  } else {
    console.log('[WARN] could not insert i18n into', rel);
    return;
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('[ADDED]', rel, '->', scriptTag);
  updated++;
});

console.log('Total updated files:', updated);
