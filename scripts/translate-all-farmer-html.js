const fs = require('fs');
const path = require('path');

function replaceInFile(filename, replacements) {
  const filePath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filename}`);
    return 0;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  replacements.forEach(({ target, replacement, isRegex }) => {
    if (isRegex) {
      if (target.test(content)) {
        content = content.replace(target, replacement);
        count++;
      }
    } else {
      if (content.includes(target)) {
        content = content.split(target).join(replacement);
        count++;
      }
    }
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[${filename}] Applied ${count} replacements.`);
  return count;
}

// 1. DASHBOARD.HTML
replaceInFile('dashboard.html', [
  // Nav Links
  { target: '<i data-lucide="layout-dashboard" class="dash-header__link-icon"></i> Dashboard', replacement: '<i data-lucide="layout-dashboard" class="dash-header__link-icon"></i> <span data-i18n="navigation.dashboard">Dashboard</span>' },
  { target: '<i data-lucide="package" class="dash-header__link-icon"></i> My Lots', replacement: '<i data-lucide="package" class="dash-header__link-icon"></i> <span data-i18n="navigation.myLots">My Lots</span>' },
  { target: '<i data-lucide="bar-chart-3" class="dash-header__link-icon"></i> Market', replacement: '<i data-lucide="bar-chart-3" class="dash-header__link-icon"></i> <span data-i18n="navigation.marketplace">Market</span>' },
  { target: '<i data-lucide="warehouse" class="dash-header__link-icon"></i> Storage', replacement: '<i data-lucide="warehouse" class="dash-header__link-icon"></i> <span data-i18n="navigation.storage">Storage</span>' },
  { target: '<i data-lucide="brain" class="dash-header__link-icon"></i> AI Forecast', replacement: '<i data-lucide="brain" class="dash-header__link-icon"></i> <span data-i18n="navigation.aiForecast">AI Forecast</span>' },
  { target: '<i data-lucide="users" class="dash-header__link-icon"></i> Buyers', replacement: '<i data-lucide="users" class="dash-header__link-icon"></i> <span data-i18n="navigation.buyers">Buyers</span>' },
  { target: '<i data-lucide="clipboard-list" class="dash-header__link-icon"></i> Orders', replacement: '<i data-lucide="clipboard-list" class="dash-header__link-icon"></i> <span data-i18n="navigation.orders">Orders</span>' },
  { target: '<i data-lucide="bar-chart-2" class="dash-header__link-icon"></i> Compare', replacement: '<i data-lucide="bar-chart-2" class="dash-header__link-icon"></i> <span data-i18n="navigation.compare">Compare</span>' },

  // Mobile Nav Links
  { target: '<i data-lucide="layout-dashboard"></i> Dashboard</a>', replacement: '<i data-lucide="layout-dashboard"></i> <span data-i18n="navigation.dashboard">Dashboard</span></a>' },
  { target: '<i data-lucide="package"></i> My Lots</a>', replacement: '<i data-lucide="package"></i> <span data-i18n="navigation.myLots">My Lots</span></a>' },
  { target: '<i data-lucide="warehouse"></i> Storage Options</a>', replacement: '<i data-lucide="warehouse"></i> <span data-i18n="navigation.storage">Storage Options</span></a>' },
  { target: '<i data-lucide="bar-chart-3"></i> Market Prices</a>', replacement: '<i data-lucide="bar-chart-3"></i> <span data-i18n="navigation.marketplace">Market Prices</span></a>' },
  { target: '<i data-lucide="brain"></i> AI Forecast</a>', replacement: '<i data-lucide="brain"></i> <span data-i18n="navigation.aiForecast">AI Forecast</span></a>' },
  { target: '<i data-lucide="users"></i> Buyers</a>', replacement: '<i data-lucide="users"></i> <span data-i18n="navigation.buyers">Buyers</span></a>' },
  { target: '<i data-lucide="clipboard-list"></i> Orders</a>', replacement: '<i data-lucide="clipboard-list"></i> <span data-i18n="navigation.orders">Orders</span></a>' },
  { target: '<i data-lucide="user"></i> Profile Settings</a>', replacement: '<i data-lucide="user"></i> <span data-i18n="farmer.farmProfile">Profile Settings</span></a>' },

  // Action Cards Titles & Desc
  { target: '<h3 class="kisan-action-card__title" id="lbl-action-card1-title">\n                  Today\'s Mandi Prices <span style="font-size:12px; font-weight:700; color:#D6A84F;">Live APMC</span>\n                </h3>', replacement: '<h3 class="kisan-action-card__title" id="lbl-action-card1-title"><span data-i18n="farmer.todayMandiPrices">Today\'s Mandi Prices</span> <span style="font-size:12px; font-weight:700; color:#D6A84F;" data-i18n="farmer.livePrices">Live APMC</span></h3>' },
  { target: '<p class="kisan-action-card__subtitle" id="lbl-action-card1-desc">\n                  Check live mandi prices, daily commodity arrivals, and price trends across major APMCs.\n                </p>', replacement: '<p class="kisan-action-card__subtitle" id="lbl-action-card1-desc" data-i18n="farmer.todayMandiDesc">Check live mandi prices, daily commodity arrivals, and price trends across major APMCs.</p>' },
  { target: '<h3 class="kisan-action-card__title" id="lbl-action-card2-title">\n                  List Crop for Sale <span style="font-size:12px; font-weight:700; color:#2E7D32;">+ New Lot</span>\n                </h3>', replacement: '<h3 class="kisan-action-card__title" id="lbl-action-card2-title"><span data-i18n="farmer.listCropForSale">List Crop for Sale</span> <span style="font-size:12px; font-weight:700; color:#2E7D32;" data-i18n="farmer.newLotBadge">+ New Lot</span></h3>' },
  { target: '<p class="kisan-action-card__subtitle" id="lbl-action-card2-desc">\n                  List your harvested produce and receive direct, verified offers from corporate buyers.\n                </p>', replacement: '<p class="kisan-action-card__subtitle" id="lbl-action-card2-desc" data-i18n="farmer.listCropDesc">List your harvested produce and receive direct, verified offers from corporate buyers.</p>' },
  { target: '<h3 class="kisan-action-card__title" id="lbl-action-card3-title">\n                  Find & Compare Warehouses <span style="font-size:12px; font-weight:700; color:#1565C0;">Nearby</span>\n                </h3>', replacement: '<h3 class="kisan-action-card__title" id="lbl-action-card3-title"><span data-i18n="farmer.findGodowns">Find & Compare Warehouses</span> <span style="font-size:12px; font-weight:700; color:#1565C0;" data-i18n="farmer.nearbyBadge">Nearby</span></h3>' },
  { target: '<p class="kisan-action-card__subtitle" id="lbl-action-card3-desc">\n                  Locate WDRA/MSWC accredited warehouses, compare monthly tariffs, and book space.\n                </p>', replacement: '<p class="kisan-action-card__subtitle" id="lbl-action-card3-desc" data-i18n="farmer.findGodownsDesc">Locate WDRA/MSWC accredited warehouses, compare monthly tariffs, and book space.</p>' },
  { target: '<h3 class="kisan-action-card__title" id="lbl-action-card4-title">\n                  Sell Now vs. Store & Hold <span style="font-size:12px; font-weight:700; color:#7B1FA2;">AI Advisor</span>\n                </h3>', replacement: '<h3 class="kisan-action-card__title" id="lbl-action-card4-title"><span data-i18n="farmer.sellNowVsStore">Sell Now vs. Store & Hold</span> <span style="font-size:12px; font-weight:700; color:#7B1FA2;" data-i18n="farmer.aiAdvisorBadge">AI Advisor</span></h3>' },
  { target: '<p class="kisan-action-card__subtitle" id="lbl-action-card4-desc">\n                  Calculate if storing your harvest yields higher profit vs selling immediately at today\'s mandi price.\n                </p>', replacement: '<p class="kisan-action-card__subtitle" id="lbl-action-card4-desc" data-i18n="farmer.sellNowVsStoreDesc">Calculate if storing your harvest yields higher profit vs selling immediately at today\'s mandi price.</p>' },

  // Compare banner
  { target: 'Compare Now <i data-lucide="arrow-right"></i>', replacement: '<span data-i18n="farmer.compareNowBtn">Compare Now</span> <i data-lucide="arrow-right"></i>' },

  // Opportunity Card
  { target: '<h3 class="dash-opp-card__title">Smart Selling Opportunity</h3>', replacement: '<h3 class="dash-opp-card__title" data-i18n="farmer.smartSellingOpp">Smart Selling Opportunity</h3>' },
  { target: '<p class="dash-opp-card__desc">Your listed rice inventory is currently worth approximately:</p>', replacement: '<p class="dash-opp-card__desc" data-i18n="farmer.inventoryWorth">Your listed rice inventory is currently worth approximately:</p>' },
  { target: '<div class="dash-opp-card__detail"><span>Current Market</span>', replacement: '<div class="dash-opp-card__detail"><span data-i18n="farmer.currentMarket">Current Market</span>' },
  { target: '<div class="dash-opp-card__detail"><span>Recommended Target</span>', replacement: '<div class="dash-opp-card__detail"><span data-i18n="farmer.recommendedTarget">Recommended Target</span>' },
  { target: '<div class="dash-opp-card__detail dash-opp-card__detail--highlight"><span>Potential Extra Income</span>', replacement: '<div class="dash-opp-card__detail dash-opp-card__detail--highlight"><span data-i18n="farmer.potentialExtraIncome">Potential Extra Income</span>' },
  { target: '<i data-lucide="search"></i> Find Best Buyer', replacement: '<i data-lucide="search"></i> <span data-i18n="farmer.findBestBuyer">Find Best Buyer</span>' },

  // Storage Card in Dashboard
  { target: '<h3 style="font-size:16.5px; font-weight:800; color:var(--ks-evergreen); margin:0;">Storage & Selling Decision Support</h3>', replacement: '<h3 style="font-size:16.5px; font-weight:800; color:var(--ks-evergreen); margin:0;" data-i18n="farmer.storageDecisionSupport">Storage & Selling Decision Support</h3>' },
  { target: '<span style="font-size:12px; color:#666;">AI comparison: Sell at current mandi rate vs. Store in nearby accredited warehouse</span>', replacement: '<span style="font-size:12px; color:#666;" data-i18n="farmer.storageDecisionSub">AI comparison: Sell at current mandi rate vs. Store in nearby accredited warehouse</span>' },
  { target: 'AI ADVICE: STORE &amp; HOLD', replacement: '<span data-i18n="farmer.aiAdviceStoreHold">AI ADVICE: STORE &amp; HOLD</span>' },
  { target: '<div style="font-size:11px; font-weight:700; color:#777;">ACTIVE HARVEST INVENTORY</div>', replacement: '<div style="font-size:11px; font-weight:700; color:#777;" data-i18n="farmer.activeHarvestInventory">ACTIVE HARVEST INVENTORY</div>' },
  { target: '<div style="font-size:11px; font-weight:700; color:#2E7D32;">ESTIMATED NET EXTRA GAIN</div>', replacement: '<div style="font-size:11px; font-weight:700; color:#2E7D32;" data-i18n="farmer.estimatedNetExtraGain">ESTIMATED NET EXTRA GAIN</div>' },
  { target: '<div style="font-size:11px; font-weight:700; color:#1976D2;">NEAREST ACCREDITED WAREHOUSE</div>', replacement: '<div style="font-size:11px; font-weight:700; color:#1976D2;" data-i18n="farmer.nearestAccreditedWarehouse">NEAREST ACCREDITED WAREHOUSE</div>' },
  { target: '<i data-lucide="warehouse" style="width:14px;height:14px;"></i> View Storage Options', replacement: '<i data-lucide="warehouse" style="width:14px;height:14px;"></i> <span data-i18n="farmer.viewStorageOptions">View Storage Options</span>' },
  { target: '<i data-lucide="calculator" style="width:14px;height:14px;"></i> Sell vs Store Calculator', replacement: '<i data-lucide="calculator" style="width:14px;height:14px;"></i> <span data-i18n="farmer.sellVsStoreCalc">Sell vs Store Calculator</span>' },

  // Market Insights Header
  { target: '<h2 class="dash-section__title">Market Intelligence & Insights</h2>', replacement: '<h2 class="dash-section__title" data-i18n="farmer.marketIntelligenceTitle">Market Intelligence & Insights</h2>' },
  { target: '<p class="dash-section__subtitle">Real-time alerts for better selling decisions</p>', replacement: '<p class="dash-section__subtitle" data-i18n="farmer.marketIntelligenceSubtitle">Real-time alerts for better selling decisions</p>' },
  { target: 'Full Market Overview <i data-lucide="arrow-right"></i>', replacement: '<span data-i18n="farmer.fullMarketOverview">Full Market Overview</span> <i data-lucide="arrow-right"></i>' },

  // Mandi Map Section
  { target: '<h2 class="dash-section__title">Nearby Mandis (India)</h2>', replacement: '<h2 class="dash-section__title" data-i18n="farmer.nearbyMandisMapTitle">Nearby Mandis (India)</h2>' },
  { target: '<p class="dash-section__subtitle">Locate APMC markets across India, compare live commodity prices & get AI selling advice</p>', replacement: '<p class="dash-section__subtitle" data-i18n="farmer.nearbyMandisMapSubtitle">Locate APMC markets across India, compare live commodity prices & get AI selling advice</p>' },
  { target: '<span>🇮🇳 View All India</span>', replacement: '<span data-i18n="farmer.viewAllIndia">🇮🇳 View All India</span>' },
  { target: '<i data-lucide="crosshair"></i> <span>My Location</span>', replacement: '<i data-lucide="crosshair"></i> <span data-i18n="farmer.myLocation">My Location</span>' },
  { target: '<span class="mandi-ai-badge"><i data-lucide="sparkles"></i> AI Selling Assistant</span>', replacement: '<span class="mandi-ai-badge"><i data-lucide="sparkles"></i> <span data-i18n="farmer.aiSellingAssistant">AI Selling Assistant</span></span>' },
  { target: 'Analyzing nearby markets for your location...', replacement: '<span data-i18n="farmer.analyzingNearbyMarkets">Analyzing nearby markets for your location...</span>' },
  { target: '<button class="mandi-toggle-btn mandi-toggle-btn--active" data-view="map" aria-label="Map View">\n                  <i data-lucide="map"></i> <span>Map</span>', replacement: '<button class="mandi-toggle-btn mandi-toggle-btn--active" data-view="map" aria-label="Map View">\n                  <i data-lucide="map"></i> <span data-i18n="farmer.mapView">Map</span>' },
  { target: '<button class="mandi-toggle-btn" data-view="list" aria-label="List View">\n                  <i data-lucide="list"></i> <span>List</span>', replacement: '<button class="mandi-toggle-btn" data-view="list" aria-label="List View">\n                  <i data-lucide="list"></i> <span data-i18n="farmer.listView">List</span>' },
  { target: '<p>Loading Indian Mandis Map...</p>', replacement: '<p data-i18n="farmer.loadingMandisMap">Loading Indian Mandis Map...</p>' },
  { target: '<div class="mandi-location-prompt__or">or choose city</div>', replacement: '<div class="mandi-location-prompt__or" data-i18n="farmer.orChooseCity">or choose city</div>' },

  // Help Modal
  { target: '<h3>Kisan Support & Helpline</h3>', replacement: '<h3 data-i18n="farmer.kisanSupportTitle">Kisan Support & Helpline</h3>' },
  { target: '<div style="font-weight:700; color:var(--ks-evergreen);">Kisan Call Center (Toll Free)</div>', replacement: '<div style="font-weight:700; color:var(--ks-evergreen);" data-i18n="farmer.kisanCallCenterTollFree">Kisan Call Center (Toll Free)</div>' },
  { target: '<div style="font-size:11px; color:var(--ks-text-muted);">Available 6:00 AM to 10:00 PM all 7 days</div>', replacement: '<div style="font-size:11px; color:var(--ks-text-muted);" data-i18n="farmer.availableHours">Available 6:00 AM to 10:00 PM all 7 days</div>' }
]);

// 2. LOTS.HTML
replaceInFile('lots.html', [
  // Nav
  { target: '<i data-lucide="layout-dashboard" class="dash-header__link-icon"></i> Dashboard', replacement: '<i data-lucide="layout-dashboard" class="dash-header__link-icon"></i> <span data-i18n="navigation.dashboard">Dashboard</span>' },
  { target: '<i data-lucide="package" class="dash-header__link-icon"></i> My Lots', replacement: '<i data-lucide="package" class="dash-header__link-icon"></i> <span data-i18n="navigation.myLots">My Lots</span>' },
  { target: '<i data-lucide="warehouse" class="dash-header__link-icon"></i> Storage Options', replacement: '<i data-lucide="warehouse" class="dash-header__link-icon"></i> <span data-i18n="navigation.storage">Storage Options</span>' },
  { target: '<i data-lucide="bar-chart-3" class="dash-header__link-icon"></i> Market', replacement: '<i data-lucide="bar-chart-3" class="dash-header__link-icon"></i> <span data-i18n="navigation.marketplace">Market</span>' },
  { target: '<i data-lucide="brain" class="dash-header__link-icon"></i> AI Forecast', replacement: '<i data-lucide="brain" class="dash-header__link-icon"></i> <span data-i18n="navigation.aiForecast">AI Forecast</span>' },
  { target: '<i data-lucide="users" class="dash-header__link-icon"></i> Buyers', replacement: '<i data-lucide="users" class="dash-header__link-icon"></i> <span data-i18n="navigation.buyers">Buyers</span>' },
  { target: '<i data-lucide="clipboard-list" class="dash-header__link-icon"></i> Orders', replacement: '<i data-lucide="clipboard-list" class="dash-header__link-icon"></i> <span data-i18n="navigation.orders">Orders</span>' },

  // Header Banner
  { target: '<h1 class="dash-section__title" style="font-size: 26px;"><i data-lucide="package" style="width:26px;height:26px;vertical-align:middle;margin-right:8px;color:var(--ks-gold);"></i> My Produce Lots</h1>', replacement: '<h1 class="dash-section__title" style="font-size: 26px;"><i data-lucide="package" style="width:26px;height:26px;vertical-align:middle;margin-right:8px;color:var(--ks-gold);"></i> <span data-i18n="farmer.cropListingsTitle">My Produce Lots</span></h1>' },
  { target: '<p class="dash-section__subtitle">Manage your farm produce listings, storage holdings, and review buyer inquiries.</p>', replacement: '<p class="dash-section__subtitle" data-i18n="farmer.cropListingsSubtitle">Manage your farm produce listings, storage holdings, and review buyer inquiries.</p>' },
  { target: '<i data-lucide="warehouse"></i> Storage Hub & Advisor', replacement: '<i data-lucide="warehouse"></i> <span data-i18n="farmer.storageHubAdvisor">Storage Hub & Advisor</span>' },
  { target: '<button class="btn btn--primary" id="btn-create-lot-page" onclick="FarmerFlow.openCreateLotModal()"><i\n              data-lucide="plus-circle"></i> + Create Produce Lot</button>', replacement: '<button class="btn btn--primary" id="btn-create-lot-page" onclick="FarmerFlow.openCreateLotModal()"><i data-lucide="plus-circle"></i> <span data-i18n="farmer.createProduceLot">+ Create Produce Lot</span></button>' },

  // Tabs
  { target: '📦 All Produce Lots', replacement: '📦 <span data-i18n="farmer.allProduceLotsTab">All Produce Lots</span>' },
  { target: '🌾 On Farm / Active', replacement: '🌾 <span data-i18n="farmer.onFarmActiveTab">On Farm / Active</span>' },
  { target: '🏬 Stored & Warehouse Lots', replacement: '🏬 <span data-i18n="farmer.storedWarehouseLotsTab">Stored & Warehouse Lots</span>' },
  { target: '⚡ Sell vs. Store Decision Support', replacement: '⚡ <span data-i18n="farmer.sellVsStoreDecisionTab">Sell vs. Store Decision Support</span>' },

  // Panels
  { target: '<h3 class="dash-panel__title" id="lots-panel-title">My Active Lots</h3>', replacement: '<h3 class="dash-panel__title" id="lots-panel-title" data-i18n="farmer.myActiveLotsTitle">My Active Lots</h3>' },
  { target: '<p class="dash-panel__subtitle">Manage listed crops & storage options</p>', replacement: '<p class="dash-panel__subtitle" data-i18n="farmer.manageListedCropsSubtitle">Manage listed crops & storage options</p>' },
  { target: '<i\n                  data-lucide="plus"></i> + New Lot</button>', replacement: '<i data-lucide="plus"></i> <span data-i18n="farmer.newLotBadge">+ New Lot</span></button>' },
  { target: '<i\n                  data-lucide="package-plus"></i> List Another Lot</button>', replacement: '<i data-lucide="package-plus"></i> <span data-i18n="farmer.listAnotherLot">List Another Lot</span></button>' },
  { target: '<h3 class="dash-panel__title">Received Buyer Offers</h3>', replacement: '<h3 class="dash-panel__title" data-i18n="farmer.receivedOffersTitle">Received Buyer Offers</h3>' },
  { target: '<p class="dash-panel__subtitle">Direct quotes from verified corporate procurement companies</p>', replacement: '<p class="dash-panel__subtitle" data-i18n="farmer.receivedOffersSubtitle">Direct quotes from verified corporate procurement companies</p>' },
  { target: 'Browse All Buyers <i data-lucide="arrow-right"></i>', replacement: '<span data-i18n="farmer.browseAllBuyers">Browse All Buyers</span> <i data-lucide="arrow-right"></i>' },
  { target: '<i\n                  data-lucide="users"></i> View All Buyers</a>', replacement: '<i data-lucide="users"></i> <span data-i18n="farmer.viewAllBuyers">View All Buyers</span></a>' },

  // Modals in Lots
  { target: '<h3>+ Create New Crop Lot</h3>', replacement: '<h3>+ <span data-i18n="cropLotModal.createLotHeading">Create New Crop Lot</span></h3>' },
  { target: '<label for="lot-crop-select">Crop</label>', replacement: '<label for="lot-crop-select" data-i18n="cropLotModal.cropCategory">Crop</label>' },
  { target: '<label for="lot-qty-input">Quantity (Quintals)</label>', replacement: '<label for="lot-qty-input" data-i18n="cropLotModal.quantityAvailable">Quantity (Quintals)</label>' },
  { target: '<label for="lot-price-input">Expected Price (₹/q)</label>', replacement: '<label for="lot-price-input" data-i18n="cropLotModal.expectedPricePerUnit">Expected Price (₹/q)</label>' },
  { target: '<label for="lot-grade-select">Quality / Grade</label>', replacement: '<label for="lot-grade-select" data-i18n="cropLotModal.gradeSelection">Quality / Grade</label>' },
  { target: '<label for="lot-harvest-input">Harvest Date</label>', replacement: '<label for="lot-harvest-input" data-i18n="market.harvestDate">Harvest Date</label>' },
  { target: '<label for="lot-location-input">Farm Location / Mandi</label>', replacement: '<label for="lot-location-input" data-i18n="cropLotModal.originDistrict">Farm Location / Mandi</label>' },
  { target: '<label for="lot-desc-input">Description / Moisture / Variety</label>', replacement: '<label for="lot-desc-input" data-i18n="cropLotModal.moistureQualityNotes">Description / Moisture / Variety</label>' },
  { target: '<i\n            data-lucide="check"></i> Create & List Lot</button>', replacement: '<i data-lucide="check"></i> <span data-i18n="cropLotModal.publishBtn">Create & List Lot</span></button>' },

  // Pause / Delete Modal
  { target: '<h3>Edit Crop Lot</h3>', replacement: '<h3 data-i18n="cropLot.editProduceLot">Edit Crop Lot</h3>' },
  { target: '<h3 id="pause-modal-title">Pause Listing?</h3>', replacement: '<h3 id="pause-modal-title" data-i18n="cropLot.pauseProduceLot">Pause Listing?</h3>' },
  { target: '<h3>Delete Crop Lot</h3>', replacement: '<h3 data-i18n="cropLot.deleteProduceLot">Delete Crop Lot</h3>' },
  { target: '<h3>Negotiate Price</h3>', replacement: '<h3 data-i18n="buyer.negotiateRate">Negotiate Price</h3>' }
]);

// 3. MARKET.HTML
replaceInFile('market.html', [
  { target: '<i data-lucide="layout-dashboard" class="dash-header__link-icon"></i> Dashboard', replacement: '<i data-lucide="layout-dashboard" class="dash-header__link-icon"></i> <span data-i18n="navigation.dashboard">Dashboard</span>' },
  { target: '<i data-lucide="package" class="dash-header__link-icon"></i> My Lots', replacement: '<i data-lucide="package" class="dash-header__link-icon"></i> <span data-i18n="navigation.myLots">My Lots</span>' },
  { target: '<i data-lucide="bar-chart-3" class="dash-header__link-icon"></i> Market', replacement: '<i data-lucide="bar-chart-3" class="dash-header__link-icon"></i> <span data-i18n="navigation.marketplace">Market</span>' },
  { target: '<i data-lucide="brain" class="dash-header__link-icon"></i> AI Forecast', replacement: '<i data-lucide="brain" class="dash-header__link-icon"></i> <span data-i18n="navigation.aiForecast">AI Forecast</span>' },
  { target: '<i data-lucide="users" class="dash-header__link-icon"></i> Buyers', replacement: '<i data-lucide="users" class="dash-header__link-icon"></i> <span data-i18n="navigation.buyers">Buyers</span>' },
  { target: '<i data-lucide="clipboard-list" class="dash-header__link-icon"></i> Orders', replacement: '<i data-lucide="clipboard-list" class="dash-header__link-icon"></i> <span data-i18n="navigation.orders">Orders</span>' },

  { target: '<h2 class="dash-section__title">Market Overview</h2>', replacement: '<h2 class="dash-section__title" data-i18n="market.marketOverview">Market Overview</h2>' },
  { target: '<p class="dash-section__subtitle">Live prices from verified nearby mandis</p>', replacement: '<p class="dash-section__subtitle" data-i18n="market.livePricesSubtitle">Live prices from verified nearby mandis</p>' },
  { target: '<button class="dash-section__action" id="btn-refresh-market"><i data-lucide="refresh-cw"></i> Refresh Prices</button>', replacement: '<button class="dash-section__action" id="btn-refresh-market"><i data-lucide="refresh-cw"></i> <span data-i18n="market.refreshPrices">Refresh Prices</span></button>' },

  { target: '<h2 class="dash-section__title">What Farmers Are Selling</h2>', replacement: '<h2 class="dash-section__title" data-i18n="market.whatFarmersAreSelling">What Farmers Are Selling</h2>' },
  { target: '<p class="dash-section__subtitle">Top traded commodities listed across regional mandis</p>', replacement: '<p class="dash-section__subtitle" data-i18n="market.whatFarmersAreSellingSub">Top traded commodities listed across regional mandis</p>' },
  { target: 'View My Listings <i data-lucide="arrow-right"></i>', replacement: '<span data-i18n="market.viewMyListings">View My Listings</span> <i data-lucide="arrow-right"></i>' },

  { target: '<h2 class="dash-section__title">Compare Mandi Prices</h2>', replacement: '<h2 class="dash-section__title" data-i18n="market.compareMandiPrices">Compare Mandi Prices</h2>' },
  { target: '<p class="dash-section__subtitle">Find the best market for your crop across states</p>', replacement: '<p class="dash-section__subtitle" data-i18n="market.compareMandiPricesSub">Find the best market for your crop across states</p>' },
  { target: '<label for="compare-crop">Selected Crop</label>', replacement: '<label for="compare-crop" data-i18n="market.selectedCrop">Selected Crop</label>' },
  { target: '<label for="compare-location">State / Region</label>', replacement: '<label for="compare-location" data-i18n="market.stateRegion">State / Region</label>' },

  { target: '<th>Market Mandi</th>', replacement: '<th data-i18n="market.marketMandi">Market Mandi</th>' },
  { target: '<th>Price (₹/q)</th>', replacement: '<th data-i18n="market.pricePerQ">Price (₹/q)</th>' },
  { target: '<th>Weekly Trend</th>', replacement: '<th data-i18n="market.weeklyTrend">Weekly Trend</th>' },
  { target: '<th>Demand Level</th>', replacement: '<th data-i18n="market.demandLevel">Demand Level</th>' },

  { target: '<p class="dash-chart-card__subtitle">Historical daily modal price analysis</p>', replacement: '<p class="dash-chart-card__subtitle" data-i18n="market.historicalModalPrice">Historical daily modal price analysis</p>' },
  { target: '<span class="dash-chart-stats__label">Current</span>', replacement: '<span class="dash-chart-stats__label" data-i18n="market.current">Current</span>' },
  { target: '<span class="dash-chart-stats__label">Highest</span>', replacement: '<span class="dash-chart-stats__label" data-i18n="market.highest">Highest</span>' },
  { target: '<span class="dash-chart-stats__label">Lowest</span>', replacement: '<span class="dash-chart-stats__label" data-i18n="market.lowest">Lowest</span>' },
  { target: '<span class="dash-chart-stats__label">Average</span>', replacement: '<span class="dash-chart-stats__label" data-i18n="market.average">Average</span>' },

  { target: '<h2 class="dash-section__title">Market Insights</h2>', replacement: '<h2 class="dash-section__title" data-i18n="market.marketInsights">Market Insights</h2>' },
  { target: '<p class="dash-section__subtitle">Actionable intelligence for better selling decisions</p>', replacement: '<p class="dash-section__subtitle" data-i18n="market.actionableIntelligence">Actionable intelligence for better selling decisions</p>' },

  { target: '<span class="dash-crop-modal__price-label">Current Mandi Price</span>', replacement: '<span class="dash-crop-modal__price-label" data-i18n="market.currentMandiPrice">Current Mandi Price</span>' },
  { target: '<span>AI Selling Forecast</span>', replacement: '<span data-i18n="market.aiSellingForecast">AI Selling Forecast</span>' },
  { target: '<h4>Nearby Mandi Price Comparison</h4>', replacement: '<h4 data-i18n="market.nearbyMandiComparison">Nearby Mandi Price Comparison</h4>' },
  { target: '<h4>Top Verified Corporate Buyers</h4>', replacement: '<h4 data-i18n="market.topVerifiedBuyers">Top Verified Corporate Buyers</h4>' },
  { target: '<i data-lucide="plus-circle"></i> Sell\n            This Crop', replacement: '<i data-lucide="plus-circle"></i> <span data-i18n="market.sellThisCrop">Sell This Crop</span>' },
  { target: '<i\n              data-lucide="bell-ring"></i> Set Price Alert', replacement: '<i data-lucide="bell-ring"></i> <span data-i18n="market.setPriceAlert">Set Price Alert</span>' },
  { target: '<h3>Create Price Alert</h3>', replacement: '<h3 data-i18n="market.createPriceAlert">Create Price Alert</h3>' },
  { target: '<label for="alert-crop-input">Crop</label>', replacement: '<label for="alert-crop-input" data-i18n="cropLotModal.cropCategory">Crop</label>' },
  { target: '<label for="alert-price-input">Target Price (₹/quintal)</label>', replacement: '<label for="alert-price-input" data-i18n="market.targetPrice">Target Price (₹/quintal)</label>' },
  { target: '<label for="alert-market-input">Market Mandi</label>', replacement: '<label for="alert-market-input" data-i18n="market.marketMandi">Market Mandi</label>' },
  { target: '<label>Notify Via</label>', replacement: '<label data-i18n="market.notifyVia">Notify Via</label>' }
]);

// 4. MANDI-COMPARE.HTML
replaceInFile('mandi-compare.html', [
  { target: '<i data-lucide="layout-dashboard" class="dash-header__link-icon"></i> Dashboard', replacement: '<i data-lucide="layout-dashboard" class="dash-header__link-icon"></i> <span data-i18n="navigation.dashboard">Dashboard</span>' },
  { target: '<i data-lucide="package" class="dash-header__link-icon"></i> My Lots', replacement: '<i data-lucide="package" class="dash-header__link-icon"></i> <span data-i18n="navigation.myLots">My Lots</span>' },
  { target: '<i data-lucide="bar-chart-3" class="dash-header__link-icon"></i> Market', replacement: '<i data-lucide="bar-chart-3" class="dash-header__link-icon"></i> <span data-i18n="navigation.marketplace">Market</span>' },
  { target: '<i data-lucide="brain" class="dash-header__link-icon"></i> AI Forecast', replacement: '<i data-lucide="brain" class="dash-header__link-icon"></i> <span data-i18n="navigation.aiForecast">AI Forecast</span>' },
  { target: '<i data-lucide="users" class="dash-header__link-icon"></i> Buyers', replacement: '<i data-lucide="users" class="dash-header__link-icon"></i> <span data-i18n="navigation.buyers">Buyers</span>' },
  { target: '<i data-lucide="clipboard-list" class="dash-header__link-icon"></i> Orders', replacement: '<i data-lucide="clipboard-list" class="dash-header__link-icon"></i> <span data-i18n="navigation.orders">Orders</span>' },
  { target: '<i data-lucide="bar-chart-2" class="dash-header__link-icon"></i> Compare', replacement: '<i data-lucide="bar-chart-2" class="dash-header__link-icon"></i> <span data-i18n="navigation.compare">Compare</span>' },

  { target: '<h1 class="mpc-page-hero__title">Mandi Price Comparison</h1>', replacement: '<h1 class="mpc-page-hero__title" data-i18n="mandiCompare.compareTitle">Mandi Price Comparison</h1>' },
  { target: '<span class="mpc-live-badge"><span class="mpc-live-dot"></span> Live Intelligence</span>', replacement: '<span class="mpc-live-badge"><span class="mpc-live-dot"></span> <span data-i18n="mandiCompare.liveIntelligence">Live Intelligence</span></span>' },
  { target: '<p class="mpc-page-hero__sub">Compare prices, logistics costs, distance and market conditions to find the most profitable mandi.</p>', replacement: '<p class="mpc-page-hero__sub" data-i18n="mandiCompare.compareSubtitle">Compare prices, logistics costs, distance and market conditions to find the most profitable mandi.</p>' },
  { target: '<i data-lucide="refresh-cw"></i> Refresh Prices', replacement: '<i data-lucide="refresh-cw"></i> <span data-i18n="mandiCompare.refreshPrices">Refresh Prices</span>' },
  { target: '<span class="mpc-your-crops-label"><i data-lucide="sprout"></i> Your Listed Lots:</span>', replacement: '<span class="mpc-your-crops-label"><i data-lucide="sprout"></i> <span data-i18n="mandiCompare.yourListedLots">Your Listed Lots:</span></span>' },
  { target: '<label class="mpc-label" for="mpc-crop-select">\n              <i data-lucide="wheat"></i> Commodity\n            </label>', replacement: '<label class="mpc-label" for="mpc-crop-select"><i data-lucide="wheat"></i> <span data-i18n="mandiCompare.commodity">Commodity</span></label>' },
  { target: '<label class="mpc-label" for="mpc-qty-input">\n              <i data-lucide="scale"></i> Batch Quantity\n            </label>', replacement: '<label class="mpc-label" for="mpc-qty-input"><i data-lucide="scale"></i> <span data-i18n="mandiCompare.batchQuantity">Batch Quantity</span></label>' },
  { target: '<label class="mpc-label" for="mpc-origin-select">\n              <i data-lucide="map-pin"></i> Origin Hub\n            </label>', replacement: '<label class="mpc-label" for="mpc-origin-select"><i data-lucide="map-pin"></i> <span data-i18n="mandiCompare.originHub">Origin Hub</span></label>' },
  { target: '<label class="mpc-label" for="mpc-grade-select">\n              <i data-lucide="sparkles"></i> Quality Grade\n            </label>', replacement: '<label class="mpc-label" for="mpc-grade-select"><i data-lucide="sparkles"></i> <span data-i18n="mandiCompare.qualityGrade">Quality Grade</span></label>' },
  { target: '<label class="mpc-label" for="mpc-sort-select">\n              <i data-lucide="arrow-up-down"></i> Primary Ranking\n            </label>', replacement: '<label class="mpc-label" for="mpc-sort-select"><i data-lucide="arrow-up-down"></i> <span data-i18n="mandiCompare.primaryRanking">Primary Ranking</span></label>' },

  { target: '<span class="mpc-kpi-label">Best Net Realization</span>', replacement: '<span class="mpc-kpi-label" data-i18n="mandiCompare.bestNetRealization">Best Net Realization</span>' },
  { target: '<span class="mpc-kpi-label">Lowest Transport Cost</span>', replacement: '<span class="mpc-kpi-label" data-i18n="mandiCompare.lowestTransportCost">Lowest Transport Cost</span>' },
  { target: '<span class="mpc-kpi-label">Closest Mandi</span>', replacement: '<span class="mpc-kpi-label" data-i18n="mandiCompare.closestMandi">Closest Mandi</span>' },
  { target: '<span class="mpc-kpi-label">Best Overall Option</span>', replacement: '<span class="mpc-kpi-label" data-i18n="mandiCompare.bestOverallOption">Best Overall Option</span>' },
  { target: '<h2 class="mpc-section-title"><i data-lucide="table"></i> Multi-Mandi Decision Matrix</h2>', replacement: '<h2 class="mpc-section-title"><i data-lucide="table"></i> <span data-i18n="mandiCompare.multiMandiMatrix">Multi-Mandi Decision Matrix</span></h2>' },
  { target: '<h2 class="mpc-section-title"><i data-lucide="bar-chart-3"></i> Visual Profitability Analysis</h2>', replacement: '<h2 class="mpc-section-title"><i data-lucide="bar-chart-3"></i> <span data-i18n="mandiCompare.visualAnalysisTitle">Visual Profitability Analysis</span></h2>' },
  { target: '<h2 class="mpc-section-title"><i data-lucide="cloud-sun"></i> Market Conditions & Weather</h2>', replacement: '<h2 class="mpc-section-title"><i data-lucide="cloud-sun"></i> <span data-i18n="mandiCompare.marketConditionsWeather">Market Conditions & Weather</span></h2>' },
  { target: '<h2 class="mpc-section-title"><i data-lucide="grid"></i> Individual Mandi Profiles</h2>', replacement: '<h2 class="mpc-section-title"><i data-lucide="grid"></i> <span data-i18n="mandiCompare.individualProfiles">Individual Mandi Profiles</span></h2>' }
]);

// 5. AI-FORECAST.HTML
replaceInFile('ai-forecast.html', [
  { target: '<h1 class="dash-section__title" style="font-size: 28px;">🤖 AI Market Price Forecast Engine</h1>', replacement: '<h1 class="dash-section__title" style="font-size: 28px;">🤖 <span data-i18n="ai.forecastEngineTitle">AI Market Price Forecast Engine</span></h1>' },
  { target: '<p class="dash-section__subtitle">Predict price trends across 42 mandis using historical seasonality,\n              weather radar, and buyer demand trends.</p>', replacement: '<p class="dash-section__subtitle" data-i18n="ai.forecastEngineSubtitle">Predict price trends across 42 mandis using historical seasonality, weather radar, and buyer demand trends.</p>' },
  { target: '<label for="forecast-crop-select">Select Crop</label>', replacement: '<label for="forecast-crop-select" data-i18n="ai.selectCrop">Select Crop</label>' },
  { target: '<label for="forecast-market-select">Select Market Mandi</label>', replacement: '<label for="forecast-market-select" data-i18n="ai.selectMandi">Select Market Mandi</label>' },
  { target: '<label>Forecast Horizon</label>', replacement: '<label data-i18n="ai.forecastHorizon">Forecast Horizon</label>' },
  { target: '7 Days', replacement: '<span data-i18n="ai.sevenDays">7 Days</span>' },
  { target: '14 Days', replacement: '<span data-i18n="ai.fourteenDays">14 Days</span>' },
  { target: '30 Days', replacement: '<span data-i18n="ai.thirtyDays">30 Days</span>' },
  { target: '<i data-lucide="sparkles"></i> <span>Generate Forecast</span>', replacement: '<i data-lucide="sparkles"></i> <span data-i18n="ai.generateForecast">Generate Forecast</span>' },
  { target: '<span class="dash-ai-card__rec-label">Current Price</span>', replacement: '<span class="dash-ai-card__rec-label" data-i18n="ai.currentPrice">Current Price</span>' },
  { target: '<span class="dash-ai-card__rec-label">Expected Price</span>', replacement: '<span class="dash-ai-card__rec-label" data-i18n="ai.expectedPrice">Expected Price</span>' },
  { target: '<span class="dash-ai-card__rec-label">Projected Change</span>', replacement: '<span class="dash-ai-card__rec-label" data-i18n="ai.projectedChange">Projected Change</span>' },
  { target: '<span class="dash-ai-card__rec-label">Confidence</span>', replacement: '<span class="dash-ai-card__rec-label" data-i18n="ai.confidence">Confidence</span>' },
  { target: '<i\n                      data-lucide="plus-circle"></i> Create Lot at Target Price</a>', replacement: '<i data-lucide="plus-circle"></i> <span data-i18n="ai.createLotAtTarget">Create Lot at Target Price</span></a>' },
  { target: '<i\n                      data-lucide="bell-ring"></i> Set Target Alert (₹2,970)</button>', replacement: '<i data-lucide="bell-ring"></i> <span data-i18n="ai.setTargetAlert">Set Target Alert</span></button>' },
  { target: '<h3 style="font-size:17px; font-weight:800; color:var(--ks-evergreen); margin:0;">Sell Now vs. Store &amp; Hold AI Analysis</h3>', replacement: '<h3 style="font-size:17px; font-weight:800; color:var(--ks-evergreen); margin:0;" data-i18n="ai.sellNowVsStoreAnalysis">Sell Now vs. Store &amp; Hold AI Analysis</h3>' },
  { target: '<span style="font-size:12px; color:#666;">Will storing your crop yield higher net profit after deducting warehouse rent &amp; weight loss?</span>', replacement: '<span style="font-size:12px; color:#666;" data-i18n="ai.sellNowVsStoreSubtitle">Will storing your crop yield higher net profit after deducting warehouse rent &amp; weight loss?</span>' },
  { target: '<i data-lucide="check-circle" style="width:13px;height:13px;"></i> RECOMMENDATION: STORE &amp; HOLD', replacement: '<i data-lucide="check-circle" style="width:13px;height:13px;"></i> <span data-i18n="ai.recommendationStoreHold">RECOMMENDATION: STORE &amp; HOLD</span>' },
  { target: '<div style="font-size:11px; font-weight:800; color:#795548;">OPTION A — SELL NOW</div>', replacement: '<div style="font-size:11px; font-weight:800; color:#795548;" data-i18n="ai.optionASellNow">OPTION A — SELL NOW</div>' },
  { target: '<div style="font-size:11px; font-weight:800; color:#2E7D32;">OPTION B — STORE FOR 30 DAYS (RECOMMENDED)</div>', replacement: '<div style="font-size:11px; font-weight:800; color:#2E7D32;" data-i18n="ai.optionBStore">OPTION B — STORE FOR 30 DAYS (RECOMMENDED)</div>' },
  { target: '<i data-lucide="warehouse"></i> Explore Storage Options', replacement: '<i data-lucide="warehouse"></i> <span data-i18n="ai.exploreStorageOptions">Explore Storage Options</span>' },
  { target: '<i data-lucide="calculator"></i> Custom Calculator', replacement: '<i data-lucide="calculator"></i> <span data-i18n="ai.customCalculator">Custom Calculator</span>' }
]);

// 6. STORAGE.HTML
replaceInFile('storage.html', [
  { target: '<span data-i18n="heroTitle">Warehouse & Cold Storage Discovery</span>', replacement: '<span data-i18n="storage.warehouseColdStorageTitle">Warehouse & Cold Storage Discovery</span>' },
  { target: '<span class="storage-hero__badge" data-i18n="heroBadge">Distress Selling Prevention</span>', replacement: '<span class="storage-hero__badge" data-i18n="storage.distressSellingPrevention">Distress Selling Prevention</span>' },
  { target: '<p class="storage-hero__subtitle" data-i18n="heroSubtitle">', replacement: '<p class="storage-hero__subtitle" data-i18n="storage.storageHeroSubtitle">' },
  { target: '<span data-i18n="btnCalc">⚡ Sell vs Store Advisor</span>', replacement: '<span data-i18n="storage.sellVsStoreAdvisor">⚡ Sell vs Store Advisor</span>' },
  { target: '<span data-i18n="btnPledge">Apply for Fast Pledge Loan</span>', replacement: '<span data-i18n="storage.applyPledgeLoan">Apply for Fast Pledge Loan</span>' },
  { target: '<span id="tab-label-discovery">Nearby Warehouses & Godowns</span>', replacement: '<span id="tab-label-discovery" data-i18n="storage.nearbyWarehousesTab">Nearby Warehouses & Godowns</span>' },
  { target: '<span id="tab-label-calculator">Sell Now vs. Store & Hold</span>', replacement: '<span id="tab-label-calculator" data-i18n="storage.sellVsStoreTab">Sell Now vs. Store & Hold</span>' },
  { target: '<span id="tab-label-bookings">My Storage & e-NWR Loans</span>', replacement: '<span id="tab-label-bookings" data-i18n="storage.myStorageBookingsTab">My Storage & e-NWR Loans</span>' },
  { target: '<label style="font-size: 11.5px; font-weight: 700; color: #555; display: block; margin-bottom: 4px;">Search Facilities</label>', replacement: '<label style="font-size: 11.5px; font-weight: 700; color: #555; display: block; margin-bottom: 4px;" data-i18n="storage.searchFacilities">Search Facilities</label>' },
  { target: 'placeholder="Search warehouses, cold storages, districts..."', replacement: 'placeholder="Search warehouses, cold storages, districts..." data-i18n-placeholder="storage.searchFacilitiesPlaceholder"' },
  { target: '<label style="font-size: 11.5px; font-weight: 700; color: #555; display: block; margin-bottom: 4px;" data-i18n="filterType">Storage Type</label>', replacement: '<label style="font-size: 11.5px; font-weight: 700; color: #555; display: block; margin-bottom: 4px;" data-i18n="storage.storageType">Storage Type</label>' },
  { target: '<label style="font-size: 11.5px; font-weight: 700; color: #555; display: block; margin-bottom: 4px;" data-i18n="filterCrop">Crop Suitability</label>', replacement: '<label style="font-size: 11.5px; font-weight: 700; color: #555; display: block; margin-bottom: 4px;" data-i18n="storage.cropSuitability">Crop Suitability</label>' }
]);

// 7. ORDERS.HTML
replaceInFile('orders.html', [
  { target: '<h1>📋 <span data-i18n="orders.ordersAndFulfillment">Confirmed Orders & Procurement Pipeline</span></h1>', replacement: '<h1 data-i18n="orders.ordersAndFulfillment">📋 Confirmed Orders & Procurement Pipeline</h1>' },
  { target: '<p>Track fulfillment progress, mandi dispatches, delivery progress, and payment settlements.</p>', replacement: '<p data-i18n="orders.ordersSubtitle">Track fulfillment progress, mandi dispatches, delivery progress, and payment settlements.</p>' }
]);

console.log('Finished translating all farmer HTML pages!');
