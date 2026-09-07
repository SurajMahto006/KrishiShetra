const fs = require('fs');
const path = require('path');

// 1. PATCH JS/FARMER.JS
const farmerJsPath = path.join(__dirname, '..', 'js', 'farmer.js');
let farmerJs = fs.readFileSync(farmerJsPath, 'utf8');

// Ensure helper t exists at top
if (!farmerJs.includes('const t = (key, fallback) =>')) {
  farmerJs = 'const t = (key, fallback) => (window.i18next ? window.i18next.t(key, fallback) : (fallback || key));\n' + farmerJs;
}

// Ensure languageChanged listener
if (!farmerJs.includes("window.addEventListener('languageChanged'")) {
  farmerJs = farmerJs.replace(
    "document.addEventListener('DOMContentLoaded', () => {\n  FarmerFlow.init();\n});",
    `document.addEventListener('DOMContentLoaded', () => {
  FarmerFlow.init();
  window.addEventListener('languageChanged', () => {
    if (FarmerFlow.lots && FarmerFlow.lots.length) {
      FarmerFlow.renderLotsList(FarmerFlow.lots);
    }
  });
});`
  );
}

// Translate statusBadge in FarmerFlow
farmerJs = farmerJs.replace(
  `const statusBadge = (status, storageType) => {
      if (storageType === 'warehouse') {
        return \`<span style="padding: 4px 10px; border-radius: 8px; background: #E8F5E9; color: #2E7D32; font-size: 12px; font-weight: 800;">🏬 Stored in Warehouse</span>\`;
      }
      if (storageType === 'cold_storage') {
        return \`<span style="padding: 4px 10px; border-radius: 8px; background: #E1F5FE; color: #0288D1; font-size: 12px; font-weight: 800;">❄️ Cold Storage</span>\`;
      }
      if (status === 'active') {
        return \`<span style="padding: 4px 10px; border-radius: 8px; background: #E8F5E9; color: #12372A; font-size: 12px; font-weight: 800; border: 1px solid #C8E6C9;">🟢 Active for Sale</span>\`;
      }
      if (status === 'draft') {
        return \`<span style="padding: 4px 10px; border-radius: 8px; background: #FEF3C7; color: #92400E; font-size: 12px; font-weight: 800;">📝 Draft</span>\`;
      }
      if (status === 'sold') {
        return \`<span style="padding: 4px 10px; border-radius: 8px; background: #DBEAFE; color: #1E40AF; font-size: 12px; font-weight: 800;">✓ Sold</span>\`;
      }
      return \`<span style="padding: 4px 10px; border-radius: 8px; background: #F5F4ED; color: #666; font-size: 12px; font-weight: 700;">\${status}</span>\`;
    };`,
  `const statusBadge = (status, storageType) => {
      if (storageType === 'warehouse') {
        return \`<span style="padding: 4px 10px; border-radius: 8px; background: #E8F5E9; color: #2E7D32; font-size: 12px; font-weight: 800;">🏬 \${t('storage.warehouse', 'Stored in Warehouse')}</span>\`;
      }
      if (storageType === 'cold_storage') {
        return \`<span style="padding: 4px 10px; border-radius: 8px; background: #E1F5FE; color: #0288D1; font-size: 12px; font-weight: 800;">❄️ \${t('storage.coldStorage', 'Cold Storage')}</span>\`;
      }
      if (status === 'active') {
        return \`<span style="padding: 4px 10px; border-radius: 8px; background: #E8F5E9; color: #12372A; font-size: 12px; font-weight: 800; border: 1px solid #C8E6C9;">🟢 \${t('common.active', 'Active for Sale')}</span>\`;
      }
      if (status === 'draft') {
        return \`<span style="padding: 4px 10px; border-radius: 8px; background: #FEF3C7; color: #92400E; font-size: 12px; font-weight: 800;">📝 \${t('cropLot.draft', 'Draft')}</span>\`;
      }
      if (status === 'sold') {
        return \`<span style="padding: 4px 10px; border-radius: 8px; background: #DBEAFE; color: #1E40AF; font-size: 12px; font-weight: 800;">✓ \${t('cropLot.sold', 'Sold')}</span>\`;
      }
      return \`<span style="padding: 4px 10px; border-radius: 8px; background: #F5F4ED; color: #666; font-size: 12px; font-weight: 700;">\${status}</span>\`;
    };`
);

// Translate action buttons in renderLotsList
farmerJs = farmerJs.replace(
  `<i data-lucide="handshake"></i> <span>Sell & View Offers</span>`,
  `<i data-lucide="handshake"></i> <span>\${t('farmer.receivedOffersTitle', 'Sell & View Offers')}</span>`
);
farmerJs = farmerJs.replace(
  `<i data-lucide="warehouse"></i> <span>Storage Options</span>`,
  `<i data-lucide="warehouse"></i> <span>\${t('storage.storageDiscovery', 'Storage Options')}</span>`
);
farmerJs = farmerJs.replace(
  `<div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">Asking Price</div>`,
  `<div style="font-size: 11px; text-transform: uppercase; color: #777; font-weight: 700;">\${t('cropLotModal.expectedPricePerUnit', 'Asking Price')}</div>`
);

fs.writeFileSync(farmerJsPath, farmerJs, 'utf8');
console.log('Patched js/farmer.js successfully!');

// 2. PATCH JS/MANDI-COMPARE.JS
const mpcJsPath = path.join(__dirname, '..', 'js', 'mandi-compare.js');
let mpcJs = fs.readFileSync(mpcJsPath, 'utf8');

if (!mpcJs.includes("window.addEventListener('languageChanged'")) {
  mpcJs = mpcJs.replace(
    "document.addEventListener('DOMContentLoaded', function() {",
    `document.addEventListener('DOMContentLoaded', function() {
  window.addEventListener('languageChanged', function() {
    if (mpcEngine) {
      mpcEngine.render();
    }
  });`
  );
}

fs.writeFileSync(mpcJsPath, mpcJs, 'utf8');
console.log('Patched js/mandi-compare.js successfully!');

// 3. PATCH JS/STORAGE.JS
const storageJsPath = path.join(__dirname, '..', 'js', 'storage.js');
let storageJs = fs.readFileSync(storageJsPath, 'utf8');

if (!storageJs.includes("window.addEventListener('languageChanged'")) {
  storageJs = storageJs.replace(
    "document.addEventListener('DOMContentLoaded', () => {\n  initStorageMap();",
    `document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('languageChanged', () => {
    loadStorageFacilities();
    calculateSellVsStore();
  });
  initStorageMap();`
  );
}

fs.writeFileSync(storageJsPath, storageJs, 'utf8');
console.log('Patched js/storage.js successfully!');
