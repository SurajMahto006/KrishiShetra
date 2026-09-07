const fs = require('fs');
const path = require('path');

const fpoJsPath = path.join(__dirname, '..', 'js', 'fpo-dashboard.js');
let code = fs.readFileSync(fpoJsPath, 'utf8');

// Ensure t() helper at top
if (!code.includes('const t = (key, fallback)')) {
  code = `const t = (key, fallback) => (window.i18next && typeof window.i18next.t === 'function' ? window.i18next.t(key, fallback) : (fallback || key));\n` + code;
}

// Replace changeLanguage function
code = code.replace(
  /function changeLanguage\(lang\) \{[\s\S]*?\}/,
  `function changeLanguage(lang) {\n  if (window.i18next && typeof window.i18next.changeLanguage === 'function') {\n    window.i18next.changeLanguage(lang);\n  }\n}`
);

// Add languageChanged event listener at bottom if not present
if (!code.includes("window.addEventListener('languageChanged'")) {
  const listener = `
// Reactive translation refresh on language switch
window.addEventListener('languageChanged', () => {
  if (marketChartInstance) {
    initCharts();
  }
});
`;
  code += listener;
}

fs.writeFileSync(fpoJsPath, code, 'utf8');
console.log('js/fpo-dashboard.js patched successfully!');
