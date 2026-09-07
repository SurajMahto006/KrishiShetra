const fs = require('fs');
const path = require('path');

const farmerPages = [
  'dashboard.html',
  'lots.html',
  'market.html',
  'mandi-compare.html',
  'ai-forecast.html',
  'storage.html'
];

farmerPages.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Look for common patterns of hardcoded text without data-i18n in tags like <h3>, <button>, <span>, <label>, <p>
  // Exclude script, style, SVG, Lucide icons, comments, and tags already containing data-i18n
  const lines = content.split('\n');
  const untagged = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    // Check if line contains user-facing headings or buttons without data-i18n
    if (
      (trimmed.includes('<h1') || trimmed.includes('<h2') || trimmed.includes('<h3') || trimmed.includes('<h4') || trimmed.includes('<button') || trimmed.includes('<label')) &&
      !trimmed.includes('data-i18n') &&
      !trimmed.includes('type="hidden"') &&
      !trimmed.includes('data-lucide') &&
      !trimmed.includes('id="fp-') &&
      !trimmed.includes('class="dash-modal__close"') &&
      !trimmed.includes('onclick="close') &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('<!--')
    ) {
      // Check if it has actual text content
      const textMatch = trimmed.match(/>([^<>{}\$]+)</);
      if (textMatch && textMatch[1].trim().length > 2) {
        untagged.push({ line: idx + 1, content: trimmed });
      }
    }
  });

  console.log(`[${file}] Found ${untagged.length} potential untagged elements:`);
  untagged.slice(0, 10).forEach(u => console.log(`   L${u.line}: ${u.content}`));
});
