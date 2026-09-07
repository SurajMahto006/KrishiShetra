const fs = require('fs');
const path = require('path');

const farmerPages = [
  'dashboard.html',
  'lots.html',
  'market.html',
  'mandi-compare.html',
  'ai-forecast.html',
  'buyer-inquiries.html',
  'buyers.html',
  'orders.html',
  'storage.html'
];

farmerPages.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`Missing file: ${file}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find all elements with fixed text that lack data-i18n
  const regex = /<([a-zA-Z0-9]+)(?![^>]*data-i18n)[^>]*>([^<>{}\n\r\t]+)<\/\1>/g;
  let match;
  const untranslated = [];
  while ((match = regex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    const text = match[2].trim();
    if (text && !['script', 'style', 'title', 'meta', 'link', 'svg'].includes(tag) && !text.match(/^[\s\d+•✓→⏳🇮🇳\-–—₹/]*$/)) {
      untranslated.push({ tag, text });
    }
  }
  console.log(`\n=== ${file}: ${untranslated.length} untranslated text elements ===`);
  untranslated.slice(0, 15).forEach(item => console.log(`  <${item.tag}>: "${item.text}"`));
  if (untranslated.length > 15) console.log(`  ... and ${untranslated.length - 15} more`);
});
