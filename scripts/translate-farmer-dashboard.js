const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dashboard.html');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // Welcome / Hero
  {
    target: '<h1 class="dash-welcome__headline" id="dash-headline">Make smarter selling decisions with <em>KrishiShetra.</em></h1>',
    replacement: '<h1 class="dash-welcome__headline" id="dash-headline"><span data-i18n="farmer.makeSmarterDecisions">Make smarter selling decisions with</span> <em>KrishiShetra.</em></h1>'
  },
  {
    target: '<p class="dash-welcome__sub" id="dash-sub">Track live mandi prices, get AI forecasts, and sell directly to verified institutional buyers.</p>',
    replacement: '<p class="dash-welcome__sub" id="dash-sub" data-i18n="farmer.dashboardSubtitle">Track live mandi prices, get AI forecasts, and sell directly to verified institutional buyers.</p>'
  },
  {
    target: '<button class="btn btn--primary dash-welcome__btn" id="btn-sell-crop" onclick="FarmerFlow.openCreateLotModal()"><i data-lucide="plus-circle"></i> + Sell Your Crop</button>',
    replacement: '<button class="btn btn--primary dash-welcome__btn" id="btn-sell-crop" onclick="FarmerFlow.openCreateLotModal()"><i data-lucide="plus-circle"></i> <span data-i18n="farmer.sellYourCrop">+ Sell Your Crop</span></button>'
  },
  {
    target: '<a href="market.html" class="btn btn--secondary dash-welcome__btn" id="btn-view-prices"><i data-lucide="trending-up"></i> View Market Prices</a>',
    replacement: '<a href="market.html" class="btn btn--secondary dash-welcome__btn" id="btn-view-prices"><i data-lucide="trending-up"></i> <span data-i18n="farmer.viewMarketPrices">View Market Prices</span></a>'
  },

  // Daily AI Advice Banner
  {
    target: '<span class="kisan-tip-banner__badge" id="kisan-tip-badge">Daily AI Advice</span>',
    replacement: '<span class="kisan-tip-banner__badge" id="kisan-tip-badge" data-i18n="farmer.dailyAiAdvice">Daily AI Advice</span>'
  },
  {
    target: '<span style="font-size: 12px; color: #D8C28A; font-weight: 700;" id="kisan-tip-date">Live AI</span>',
    replacement: '<span style="font-size: 12px; color: #D8C28A; font-weight: 700;" id="kisan-tip-date" data-i18n="farmer.liveAi">Live AI</span>'
  },
  {
    target: '<span id="voice-btn-text">Listen</span>',
    replacement: '<span id="voice-btn-text" data-i18n="farmer.listen">Listen</span>'
  },

  // 4 Large Action Cards
  {
    target: `<h3 class="kisan-action-card__title" id="lbl-action-card1-title">
                  Today's Mandi Prices <span style="font-size:12px; font-weight:700; color:#D6A84F;">Live APMC</span>
                </h3>`,
    replacement: `<h3 class="kisan-action-card__title" id="lbl-action-card1-title">
                  <span data-i18n="farmer.todayMandiPrices">Today's Mandi Prices</span> <span style="font-size:12px; font-weight:700; color:#D6A84F;" data-i18n="farmer.livePrices">Live APMC</span>
                </h3>`
  },
  {
    target: `<p class="kisan-action-card__subtitle" id="lbl-action-card1-desc">
                  Check live mandi prices, daily commodity arrivals, and price trends across major APMCs.
                </p>`,
    replacement: `<p class="kisan-action-card__subtitle" id="lbl-action-card1-desc" data-i18n="farmer.todayMandiDesc">
                  Check live mandi prices, daily commodity arrivals, and price trends across major APMCs.
                </p>`
  },
  {
    target: '<span id="btn-text-card1">View Prices</span>',
    replacement: '<span id="btn-text-card1" data-i18n="farmer.viewMarketPrices">View Prices</span>'
  },
  {
    target: `<h3 class="kisan-action-card__title" id="lbl-action-card2-title">
                  List Crop for Sale <span style="font-size:12px; font-weight:700; color:#2E7D32;">+ New Lot</span>
                </h3>`,
    replacement: `<h3 class="kisan-action-card__title" id="lbl-action-card2-title">
                  <span data-i18n="farmer.listCropForSale">List Crop for Sale</span> <span style="font-size:12px; font-weight:700; color:#2E7D32;" data-i18n="farmer.newLotBadge">+ New Lot</span>
                </h3>`
  },
  {
    target: `<p class="kisan-action-card__subtitle" id="lbl-action-card2-desc">
                  List your harvested produce and receive direct, verified offers from corporate buyers.
                </p>`,
    replacement: `<p class="kisan-action-card__subtitle" id="lbl-action-card2-desc" data-i18n="farmer.listCropDesc">
                  List your harvested produce and receive direct, verified offers from corporate buyers.
                </p>`
  },
  {
    target: '<span id="btn-text-card2">List Crop</span>',
    replacement: '<span id="btn-text-card2" data-i18n="cropLot.createProduceLot">List Crop</span>'
  },
  {
    target: `<h3 class="kisan-action-card__title" id="lbl-action-card3-title">
                  Find & Compare Warehouses <span style="font-size:12px; font-weight:700; color:#1565C0;">Nearby</span>
                </h3>`,
    replacement: `<h3 class="kisan-action-card__title" id="lbl-action-card3-title">
                  <span data-i18n="farmer.findGodowns">Find & Compare Warehouses</span> <span style="font-size:12px; font-weight:700; color:#1565C0;" data-i18n="farmer.nearbyBadge">Nearby</span>
                </h3>`
  },
  {
    target: `<p class="kisan-action-card__subtitle" id="lbl-action-card3-desc">
                  Locate WDRA/MSWC accredited warehouses, compare monthly tariffs, and book space.
                </p>`,
    replacement: `<p class="kisan-action-card__subtitle" id="lbl-action-card3-desc" data-i18n="farmer.findGodownsDesc">
                  Locate WDRA/MSWC accredited warehouses, compare monthly tariffs, and book space.
                </p>`
  },
  {
    target: '<span id="btn-text-card3">Find Godowns</span>',
    replacement: '<span id="btn-text-card3" data-i18n="storage.findWarehouses">Find Godowns</span>'
  },
  {
    target: `<h3 class="kisan-action-card__title" id="lbl-action-card4-title">
                  Sell Now vs. Store & Hold <span style="font-size:12px; font-weight:700; color:#7B1FA2;">AI Advisor</span>
                </h3>`,
    replacement: `<h3 class="kisan-action-card__title" id="lbl-action-card4-title">
                  <span data-i18n="farmer.sellNowVsStore">Sell Now vs. Store & Hold</span> <span style="font-size:12px; font-weight:700; color:#7B1FA2;" data-i18n="farmer.aiAdvisorBadge">AI Advisor</span>
                </h3>`
  },
  {
    target: `<p class="kisan-action-card__subtitle" id="lbl-action-card4-desc">
                  Calculate if storing your harvest yields higher profit vs selling immediately at today's mandi price.
                </p>`,
    replacement: `<p class="kisan-action-card__subtitle" id="lbl-action-card4-desc" data-i18n="farmer.sellNowVsStoreDesc">
                  Calculate if storing your harvest yields higher profit vs selling immediately at today's mandi price.
                </p>`
  },
  {
    target: '<span id="btn-text-card4">View AI Advice</span>',
    replacement: '<span id="btn-text-card4" data-i18n="farmer.viewAiAdvice">View AI Advice</span>'
  },

  // Quick Stats
  {
    target: '<div class="dash-stat__label" id="lbl-stat-active-lots">Active Lots</div>',
    replacement: '<div class="dash-stat__label" id="lbl-stat-active-lots" data-i18n="farmer.activeLotsLabel">Active Lots</div>'
  },
  {
    target: '<div class="dash-stat__label" id="lbl-stat-best-price">Best Market Price</div>',
    replacement: '<div class="dash-stat__label" id="lbl-stat-best-price" data-i18n="farmer.bestMarketPriceLabel">Best Market Price</div>'
  },
  {
    target: '<div class="dash-stat__label" id="lbl-stat-buyer-offers">Buyer Offers</div>',
    replacement: '<div class="dash-stat__label" id="lbl-stat-buyer-offers" data-i18n="farmer.buyerOffersLabel">Buyer Offers</div>'
  },
  {
    target: '<div class="dash-stat__label" id="lbl-stat-pending-orders">Pending Orders</div>',
    replacement: '<div class="dash-stat__label" id="lbl-stat-pending-orders" data-i18n="farmer.pendingOrdersLabel">Pending Orders</div>'
  },

  // Mandi Price Comparison Entry Card
  {
    target: '<h3 class="mpc-entry-card__title">📊 Compare Mandi Prices</h3>',
    replacement: '<h3 class="mpc-entry-card__title">📊 <span data-i18n="farmer.compareMandisTitle">Compare Mandi Prices</span></h3>'
  },
  {
    target: '<p class="mpc-entry-card__desc">Find the best price for your crop across 45+ Indian APMCs. Compare earnings, transport costs &amp; get a clear ⭐ recommendation.</p>',
    replacement: '<p class="mpc-entry-card__desc" data-i18n="farmer.compareMandisDesc">Find the best price for your crop across 45+ Indian APMCs. Compare earnings, transport costs &amp; get a clear ⭐ recommendation.</p>'
  },
  {
    target: '<span class="mpc-entry-card__stat-lbl">Mandis</span>',
    replacement: '<span class="mpc-entry-card__stat-lbl" data-i18n="farmer.mandisCount">Mandis</span>'
  },
  {
    target: '<span class="mpc-entry-card__stat-lbl">Crops</span>',
    replacement: '<span class="mpc-entry-card__stat-lbl" data-i18n="farmer.cropsCount">Crops</span>'
  },
  {
    target: '<span class="mpc-entry-card__stat-lbl">Prices</span>',
    replacement: '<span class="mpc-entry-card__stat-lbl" data-i18n="farmer.livePrices">Prices</span>'
  },
  {
    target: `<button class="btn btn--primary mpc-entry-card__btn">
              Compare Now <i data-lucide="arrow-right"></i>
            </button>`,
    replacement: `<button class="btn btn--primary mpc-entry-card__btn">
              <span data-i18n="farmer.compareNowBtn">Compare Now</span> <i data-lucide="arrow-right"></i>
            </button>`
  },

  // Farmer Journey Stepper
  {
    target: '<h3>🌾 How KrishiShetra Works for Farmers</h3>',
    replacement: '<h3>🌾 <span data-i18n="farmer.roadmapTitle">How KrishiShetra Works for Farmers</span></h3>'
  }
];

let count = 0;
replacements.forEach(({ target, replacement }) => {
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    count++;
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Updated dashboard.html with ${count} i18n tags.`);
