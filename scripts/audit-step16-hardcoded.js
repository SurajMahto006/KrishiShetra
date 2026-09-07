const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const localesDir = path.join(rootDir, 'src', 'locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

// List all frontend HTML and JS files
const targetFiles = [];

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'server', 'src/locales'].includes(relPath)) continue;
      collectFiles(fullPath);
    } else {
      if (relPath.endsWith('.html') || (relPath.endsWith('.js') && !relPath.startsWith('scripts/') && !relPath.startsWith('server/'))) {
        targetFiles.push(relPath);
      }
    }
  }
}

collectFiles(rootDir);

console.log('Auditing', targetFiles.length, 'frontend files for hardcoded strings...\n');

const htmlHardcoded = [];
const jsHardcoded = [];

// Common keywords/patterns to look for
const suspiciousStrings = [
  'Loading...',
  'No data available',
  'Something went wrong',
  'Sell Now',
  'Submit',
  'Cancel',
  'Save Changes',
  'Delete',
  'Edit',
  'View Details',
  'Actions',
  'Status',
  'Please wait',
  'Success',
  'Error',
  'Warning',
  'Confirmed',
  'Rejected',
  'Pending'
];

targetFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  const lines = content.split('\n');

  if (file.endsWith('.html')) {
    // Check tags with direct text content that lack data-i18n
    // e.g. <button ...>Submit</button> without data-i18n
    lines.forEach((line, idx) => {
      // Find buttons, spans, headers, p tags with english text and no data-i18n
      const trimmed = line.trim();
      if ((trimmed.startsWith('<button') || trimmed.startsWith('<h') || trimmed.startsWith('<p') || trimmed.startsWith('<span') || trimmed.startsWith('<a') || trimmed.startsWith('<label'))
          && !line.includes('data-i18n')
          && !line.includes('class="logo"')
          && !line.includes('<script')
          && !line.includes('<style')) {
        // Check if contains substantial english words
        const textMatch = trimmed.match(/>([^<>{}\$%]+)</);
        if (textMatch && textMatch[1].trim().length > 2) {
          const txt = textMatch[1].trim();
          if (!/^[0-9\.\,\:\-\+\/\s₹%]+$/.test(txt) && !txt.includes('©') && !txt.startsWith('http')) {
            htmlHardcoded.push({ file, line: idx + 1, text: txt, context: trimmed.substring(0, 100) });
          }
        }
      }

      // Check placeholder without data-i18n-placeholder
      if (line.includes('placeholder="') && !line.includes('data-i18n-placeholder') && !line.includes('data-i18n')) {
        const phMatch = line.match(/placeholder="([^"]+)"/);
        if (phMatch && phMatch[1].trim().length > 1) {
          htmlHardcoded.push({ file, line: idx + 1, text: `[placeholder] ${phMatch[1]}`, context: trimmed.substring(0, 100) });
        }
      }
    });
  }

  // Scan JS content for hardcoded alert, confirm, toast, innerHTML text
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('console.log')) return;

    // Toast/Alert/Confirm patterns
    const alertMatch = trimmed.match(/(?:alert|confirm|prompt|showToast|showNotification|toast\.error|toast\.success|toast\.info)\s*\(\s*['"`]([^'"`]+)['"`]/i);
    if (alertMatch) {
      const msg = alertMatch[1].trim();
      if (msg.length > 2 && !msg.startsWith('http') && !msg.startsWith('/') && !msg.startsWith('api/')) {
        jsHardcoded.push({ file, line: idx + 1, type: 'alert/toast', text: msg, context: trimmed.substring(0, 100) });
      }
    }

    // Direct innerHTML = '...' or textContent = '...' with hardcoded english
    const domTextMatch = trimmed.match(/(?:innerHTML|textContent|innerText)\s*=\s*['"`]([^'"`<]+)['"`]/);
    if (domTextMatch) {
      const txt = domTextMatch[1].trim();
      if (txt.length > 2 && !/^[0-9\.\,\:\-\+\/\s₹%]+$/.test(txt) && !txt.startsWith('#') && !txt.startsWith('.')) {
        jsHardcoded.push({ file, line: idx + 1, type: 'dom-text', text: txt, context: trimmed.substring(0, 100) });
      }
    }
  });
});

console.log(`Found ${htmlHardcoded.length} potentially un-i18n'd HTML elements/placeholders.`);
console.log(`Found ${jsHardcoded.length} potentially un-i18n'd JS strings.\n`);

console.log('Sample HTML hardcoded candidates (first 30):');
htmlHardcoded.slice(0, 30).forEach(h => console.log(`  ${h.file}:${h.line} -> "${h.text}"`));

console.log('\nSample JS hardcoded candidates (first 30):');
jsHardcoded.slice(0, 30).forEach(j => console.log(`  ${j.file}:${j.line} [${j.type}] -> "${j.text}"`));
