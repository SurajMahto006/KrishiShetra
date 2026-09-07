const fs = require('fs');

['login.html', 'register.html'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /<([a-zA-Z0-9]+)(?![^>]*data-i18n)[^>]*>([^<>\n\r\t]+)<\/\1>/g;
  let match;
  console.log(`\n=== Elements without data-i18n in ${file} ===`);
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    const text = match[2].trim();
    if (text && !['script', 'style', 'title', 'meta', 'link', 'svg'].includes(tag) && !text.match(/^[\s\d+•✓→⏳🇮🇳\-–—]*$/)) {
      console.log(`  <${tag}>: "${text}"`);
      count++;
    }
  }
  if (count === 0) {
    console.log(`  All user-facing elements have data-i18n!`);
  }
});
