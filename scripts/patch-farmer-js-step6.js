const fs = require('fs');
const path = require('path');

const farmerJsPath = path.join(__dirname, '..', 'js', 'farmer.js');
let content = fs.readFileSync(farmerJsPath, 'utf8');

// Ensure t() helper is at the top
if (!content.includes('const t = (key, fallback)')) {
  content = `const t = (key, fallback) => (window.i18next ? window.i18next.t(key, fallback) : (fallback || key));\n` + content;
}

// Add languageChanged event listener to FarmerFlow if not present
if (!content.includes("window.addEventListener('languageChanged'")) {
  const listenerCode = `
// Reactive translation refresh on language switch
window.addEventListener('languageChanged', () => {
  if (window.FarmerFlow) {
    if (document.getElementById('lots-panel-body') || document.getElementById('farmer-lots-grid')) {
      window.FarmerFlow.loadMyLots(window.FarmerFlow.currentFilter || 'all');
    }
    if (document.getElementById('offers-panel-body') || document.getElementById('farmer-offers-container')) {
      window.FarmerFlow.loadReceivedInquiries();
    }
  }
});
`;
  content += listenerCode;
}

fs.writeFileSync(farmerJsPath, content, 'utf8');
console.log('js/farmer.js updated with reactive i18n listener!');
