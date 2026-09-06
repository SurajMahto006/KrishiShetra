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
  replacements.forEach(({ target, replacement }) => {
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      count++;
    }
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[${filename}] Applied ${count} translations.`);
  return count;
}

// 1. DASHBOARD.HTML
replaceInFile('dashboard.html', [
  {
    target: '<h3>+ Create New Crop Lot</h3>',
    replacement: '<h3>+ <span data-i18n="cropLotModal.createLotHeading">Create New Crop Lot</span></h3>'
  },
  {
    target: '<label for="lot-crop-select">Crop</label>',
    replacement: '<label for="lot-crop-select" data-i18n="cropLotModal.cropCategory">Crop</label>'
  },
  {
    target: '<label for="lot-qty-input">Quantity (Quintals)</label>',
    replacement: '<label for="lot-qty-input" data-i18n="cropLotModal.quantityAvailable">Quantity (Quintals)</label>'
  },
  {
    target: '<label for="lot-price-input">Expected Price (₹/q)</label>',
    replacement: '<label for="lot-price-input" data-i18n="cropLotModal.expectedPricePerUnit">Expected Price (₹/q)</label>'
  },
  {
    target: '<label for="lot-grade-select">Quality / Grade</label>',
    replacement: '<label for="lot-grade-select" data-i18n="cropLotModal.gradeSelection">Quality / Grade</label>'
  },
  {
    target: '<label for="lot-harvest-input">Harvest Date</label>',
    replacement: '<label for="lot-harvest-input" data-i18n="market.harvestDate">Harvest Date</label>'
  },
  {
    target: '<label for="lot-location-input">Farm Location / Mandi</label>',
    replacement: '<label for="lot-location-input" data-i18n="cropLotModal.originDistrict">Farm Location / Mandi</label>'
  },
  {
    target: '<label for="lot-storage-type">Storage Location / Facility</label>',
    replacement: '<label for="lot-storage-type" data-i18n="cropLotModal.storageLocationType">Storage Location / Facility</label>'
  },
  {
    target: '<label for="lot-storage-decision">Selling Strategy</label>',
    replacement: '<label for="lot-storage-decision" data-i18n="storage.aiRecommendation">Selling Strategy</label>'
  },
  {
    target: '<label for="lot-desc-input">Description / Moisture / Variety</label>',
    replacement: '<label for="lot-desc-input" data-i18n="cropLotModal.moistureQualityNotes">Description / Moisture / Variety</label>'
  },
  {
    target: '<button type="submit" class="btn btn--primary dash-modal__submit" id="btn-submit-lot"><i data-lucide="check"></i> Create & List Lot</button>',
    replacement: '<button type="submit" class="btn btn--primary dash-modal__submit" id="btn-submit-lot"><i data-lucide="check"></i> <span data-i18n="cropLotModal.publishBtn">Create & List Lot</span></button>'
  },
  {
    target: '<span class="dash-crop-modal__sub">Real-time alerts & buyer messages</span>',
    replacement: '<span class="dash-crop-modal__sub" data-i18n="notifications.notificationsTitle">Real-time alerts & buyer messages</span>'
  },
  {
    target: '<h3>My Profile & Account Settings</h3>',
    replacement: '<h3 data-i18n="farmer.farmProfile">My Profile & Account Settings</h3>'
  },
  {
    target: '<h4 style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin-bottom: 10px;">Personal Information</h4>',
    replacement: '<h4 style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin-bottom: 10px;" data-i18n="farmer.farmProfile">Personal Information</h4>'
  },
  {
    target: '<label for="prof-name">Full Name</label>',
    replacement: '<label for="prof-name" data-i18n="auth.fullName">Full Name</label>'
  },
  {
    target: '<label for="prof-phone">Mobile Number (10 digits)</label>',
    replacement: '<label for="prof-phone" data-i18n="auth.mobileNumber">Mobile Number (10 digits)</label>'
  },
  {
    target: '<i data-lucide="save"></i> Save Profile',
    replacement: '<i data-lucide="save"></i> <span data-i18n="common.save">Save Profile</span>'
  },
  {
    target: '<h4 style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin-bottom: 10px;">Change Password</h4>',
    replacement: '<h4 style="font-size: 14px; font-weight: 700; color: var(--ks-evergreen); margin-bottom: 10px;" data-i18n="auth.resetPassword">Change Password</h4>'
  },
  {
    target: '<label for="prof-curr-pass">Current Password</label>',
    replacement: '<label for="prof-curr-pass" data-i18n="auth.password">Current Password</label>'
  },
  {
    target: '<label for="prof-new-pass">New Password</label>',
    replacement: '<label for="prof-new-pass" data-i18n="auth.newPassword">New Password</label>'
  },
  {
    target: '<label for="prof-conf-pass">Confirm New Password</label>',
    replacement: '<label for="prof-conf-pass" data-i18n="auth.newPassword">Confirm New Password</label>'
  },
  {
    target: '<i data-lucide="lock"></i> Update Password',
    replacement: '<i data-lucide="lock"></i> <span data-i18n="auth.resetPassword">Update Password</span>'
  },
  {
    target: '<h4>Find Nearby Mandis</h4>',
    replacement: '<h4 data-i18n="farmer.nearestMandis">Find Nearby Mandis</h4>'
  },
  {
    target: '<p>Allow location access to find closest agricultural markets near your farm.</p>',
    replacement: '<p data-i18n="farmer.dashboardSubtitle">Allow location access to find closest agricultural markets near your farm.</p>'
  },
  {
    target: '<button class="btn btn--primary btn--sm" id="mandi-use-location-btn">📍 Use My Location</button>',
    replacement: '<button class="btn btn--primary btn--sm" id="mandi-use-location-btn">📍 <span data-i18n="farmer.directions">Use My Location</span></button>'
  },
  {
    target: '<label class="mandi-filter-label" for="mandi-crop-filter">Crop:</label>',
    replacement: '<label class="mandi-filter-label" for="mandi-crop-filter" data-i18n="market.commodity">Crop:</label>'
  },
  {
    target: '<label class="mandi-filter-label" for="mandi-state-filter">State:</label>',
    replacement: '<label class="mandi-filter-label" for="mandi-state-filter" data-i18n="common.state">State:</label>'
  },
  {
    target: '<label class="mandi-filter-label">Radius:</label>',
    replacement: '<label class="mandi-filter-label" data-i18n="farmer.radiusFilter">Radius:</label>'
  }
]);

// 2. LOTS.HTML
replaceInFile('lots.html', [
  {
    target: '<p class="dash-welcome__sub" id="dash-sub">Manage your farm produce listings, storage holdings, and review buyer inquiries.</p>',
    replacement: '<p class="dash-welcome__sub" id="dash-sub" data-i18n="farmer.cropListingsSubtitle">Manage your farm produce listings, storage holdings, and review buyer inquiries.</p>'
  },
  {
    target: '<h3>My Active Lots</h3>',
    replacement: '<h3 data-i18n="farmer.cropListingsTitle">My Active Lots</h3>'
  },
  {
    target: '<p>Manage listed crops & storage options</p>',
    replacement: '<p data-i18n="farmer.cropListingsSubtitle">Manage listed crops & storage options</p>'
  },
  {
    target: '<h3>Received Buyer Offers</h3>',
    replacement: '<h3 data-i18n="farmer.receivedOffersTitle">Received Buyer Offers</h3>'
  },
  {
    target: '<p>Direct quotes from verified corporate procurement companies</p>',
    replacement: '<p data-i18n="farmer.receivedOffersSubtitle">Direct quotes from verified corporate procurement companies</p>'
  },
  {
    target: '<span>Manage My Lots</span>',
    replacement: '<span data-i18n="farmer.myProduceLots">Manage My Lots</span>'
  },
  {
    target: '<button class="btn btn--primary dash-welcome__btn" id="btn-sell-crop" onclick="FarmerFlow.openCreateLotModal()"><i data-lucide="plus-circle"></i> + Create New Lot</button>',
    replacement: '<button class="btn btn--primary dash-welcome__btn" id="btn-sell-crop" onclick="FarmerFlow.openCreateLotModal()"><i data-lucide="plus-circle"></i> <span data-i18n="cropLot.createProduceLot">+ Create New Lot</span></button>'
  }
]);

// 3. MARKET.HTML
replaceInFile('market.html', [
  {
    target: '<h2>Market Overview</h2>',
    replacement: '<h2 data-i18n="market.marketOverview">Market Overview</h2>'
  },
  {
    target: '<p>Live prices from verified nearby mandis</p>',
    replacement: '<p data-i18n="market.livePricesSubtitle">Live prices from verified nearby mandis</p>'
  },
  {
    target: '<option value="all">All Crops (15)</option>',
    replacement: '<option value="all" data-i18n="market.allCrops">All Crops (15)</option>'
  },
  {
    target: '<option value="all">All States</option>',
    replacement: '<option value="all" data-i18n="market.allStates">All States</option>'
  },
  {
    target: '<th class="sortable" data-sort="commodity">Commodity <i data-lucide="arrow-up-down"></i></th>',
    replacement: '<th class="sortable" data-sort="commodity"><span data-i18n="market.commodity">Commodity</span> <i data-lucide="arrow-up-down"></i></th>'
  },
  {
    target: '<th class="sortable" data-sort="mandi">Mandi <i data-lucide="arrow-up-down"></i></th>',
    replacement: '<th class="sortable" data-sort="mandi"><span data-i18n="market.mandiName">Mandi</span> <i data-lucide="arrow-up-down"></i></th>'
  },
  {
    target: '<th class="sortable" data-sort="variety">Variety <i data-lucide="arrow-up-down"></i></th>',
    replacement: '<th class="sortable" data-sort="variety"><span data-i18n="market.variety">Variety</span> <i data-lucide="arrow-up-down"></i></th>'
  },
  {
    target: '<th class="sortable" data-sort="arrival_date">Arrival Date <i data-lucide="arrow-up-down"></i></th>',
    replacement: '<th class="sortable" data-sort="arrival_date"><span data-i18n="market.arrivalDate">Arrival Date</span> <i data-lucide="arrow-up-down"></i></th>'
  },
  {
    target: '<th class="sortable" data-sort="modal_price">Modal Price (₹/q) <i data-lucide="arrow-up-down"></i></th>',
    replacement: '<th class="sortable" data-sort="modal_price"><span data-i18n="market.modalRate">Modal Price (₹/q)</span> <i data-lucide="arrow-up-down"></i></th>'
  },
  {
    target: '<th class="sortable" data-sort="min_price">Min (₹/q) <i data-lucide="arrow-up-down"></i></th>',
    replacement: '<th class="sortable" data-sort="min_price"><span data-i18n="market.minRate">Min (₹/q)</span> <i data-lucide="arrow-up-down"></i></th>'
  },
  {
    target: '<th class="sortable" data-sort="max_price">Max (₹/q) <i data-lucide="arrow-up-down"></i></th>',
    replacement: '<th class="sortable" data-sort="max_price"><span data-i18n="market.maxRate">Max (₹/q)</span> <i data-lucide="arrow-up-down"></i></th>'
  },
  {
    target: '<th class="sortable" data-sort="trend">Trend <i data-lucide="arrow-up-down"></i></th>',
    replacement: '<th class="sortable" data-sort="trend"><span data-i18n="market.trendDirection">Trend</span> <i data-lucide="arrow-up-down"></i></th>'
  },
  {
    target: '<th>Action</th>',
    replacement: '<th data-i18n="market.action">Action</th>'
  },
  {
    target: '<div class="alert-banner__content">Market rates updated live from Agmarknet & APMC registries. Last synced: <strong id="sync-time">Today, 08:30 AM IST</strong></div>',
    replacement: '<div class="alert-banner__content"><span data-i18n="market.liveMarketAlert">Market rates updated live from Agmarknet & APMC registries.</span> <strong id="sync-time">Today, 08:30 AM IST</strong></div>'
  }
]);

// 4. MANDI-COMPARE.HTML
replaceInFile('mandi-compare.html', [
  {
    target: '<h1>Mandi Price Comparison</h1>',
    replacement: '<h1 data-i18n="mandiCompare.compareTitle">Mandi Price Comparison</h1>'
  },
  {
    target: '<p>Compare prices, logistics costs, distance and market conditions to find the most profitable mandi.</p>',
    replacement: '<p data-i18n="mandiCompare.compareSubtitle">Compare prices, logistics costs, distance and market conditions to find the most profitable mandi.</p>'
  },
  {
    target: '<label for="cropSelect" class="form-label">Select Crop</label>',
    replacement: '<label for="cropSelect" class="form-label" data-i18n="mandiCompare.selectCommodity">Select Crop</label>'
  },
  {
    target: '<label for="quantityInput" class="form-label">Quantity to Sell (Quintals)</label>',
    replacement: '<label for="quantityInput" class="form-label" data-i18n="mandiCompare.enterQuantity">Quantity to Sell (Quintals)</label>'
  },
  {
    target: '<label for="originLocation" class="form-label">Origin / Farm Location</label>',
    replacement: '<label for="originLocation" class="form-label" data-i18n="mandiCompare.originLocation">Origin / Farm Location</label>'
  },
  {
    target: '<label for="transportRateInput" class="form-label">Transport Cost Rate (₹/km)</label>',
    replacement: '<label for="transportRateInput" class="form-label" data-i18n="mandiCompare.transportCostPerKm">Transport Cost Rate (₹/km)</label>'
  },
  {
    target: '<button class="btn btn--primary" id="btn-calculate-compare">Calculate Most Profitable Mandi</button>',
    replacement: '<button class="btn btn--primary" id="btn-calculate-compare" data-i18n="mandiCompare.calculateNetBtn">Calculate Most Profitable Mandi</button>'
  }
]);

// 5. AI-FORECAST.HTML
replaceInFile('ai-forecast.html', [
  {
    target: '<h1>🤖 AI Market Price Forecast Engine</h1>',
    replacement: '<h1>🤖 <span data-i18n="ai.forecastEngineTitle">AI Market Price Forecast Engine</span></h1>'
  },
  {
    target: '<label for="forecast-crop-select" class="form-label">Select Crop</label>',
    replacement: '<label for="forecast-crop-select" class="form-label" data-i18n="ai.selectCropToForecast">Select Crop</label>'
  },
  {
    target: '<span class="forecast-confidence-label">Model Confidence:</span>',
    replacement: '<span class="forecast-confidence-label" data-i18n="ai.forecastConfidence">Model Confidence:</span>'
  },
  {
    target: '<h3>7-Day Price Forecast (₹/Quintal)</h3>',
    replacement: '<h3><span data-i18n="ai.sevenDayTrend">7-Day Price Forecast (₹/Quintal)</span></h3>'
  },
  {
    target: '<h3>AI Selling Advice</h3>',
    replacement: '<h3><span data-i18n="ai.decisionVerdict">AI Selling Advice</span></h3>'
  },
  {
    target: '<h3>Optimal Selling Window</h3>',
    replacement: '<h3><span data-i18n="ai.optimalSellingWindow">Optimal Selling Window</span></h3>'
  }
]);

// 6. BUYER-INQUIRIES.HTML & BUYERS.HTML
replaceInFile('buyer-inquiries.html', [
  {
    target: '<strong>My Inquiries & Negotiations</strong>',
    replacement: '<strong data-i18n="buyer.myInquiries">My Inquiries & Negotiations</strong>'
  },
  {
    target: '<p>Review quotations, submit counter-offers, and confirm deals with farmers.</p>',
    replacement: '<p data-i18n="buyer.negotiationTimeline">Review quotations, submit counter-offers, and confirm deals with farmers.</p>'
  },
  {
    target: '<button class="btn btn--sm active" data-filter="all">All Inquiries</button>',
    replacement: '<button class="btn btn--sm active" data-filter="all" data-i18n="common.all">All Inquiries</button>'
  },
  {
    target: '<button class="btn btn--sm" data-filter="pending">Pending</button>',
    replacement: '<button class="btn btn--sm" data-filter="pending" data-i18n="common.pending">Pending</button>'
  },
  {
    target: '<button class="btn btn--sm" data-filter="accepted">Accepted (Ready to Order)</button>',
    replacement: '<button class="btn btn--sm" data-filter="accepted" data-i18n="common.accepted">Accepted (Ready to Order)</button>'
  },
  {
    target: '<button class="btn btn--sm" data-filter="rejected">Rejected</button>',
    replacement: '<button class="btn btn--sm" data-filter="rejected" data-i18n="common.rejected">Rejected</button>'
  }
]);

replaceInFile('buyers.html', [
  {
    target: '<h1>🤝 Verified Corporate & Institutional Buyers</h1>',
    replacement: '<h1>🤝 <span data-i18n="fpo.institutionalBuyers">Verified Corporate & Institutional Buyers</span></h1>'
  },
  {
    target: '<h3>Incoming Bids & Direct Offers</h3>',
    replacement: '<h3 data-i18n="farmer.receivedOffersTitle">Incoming Bids & Direct Offers</h3>'
  },
  {
    target: '<p>Quotes received for your active crop listings</p>',
    replacement: '<p data-i18n="farmer.receivedOffersSubtitle">Quotes received for your active crop listings</p>'
  }
]);

// 7. ORDERS.HTML
replaceInFile('orders.html', [
  {
    target: '<h1>📋 Confirmed Orders & Procurement Pipeline</h1>',
    replacement: '<h1>📋 <span data-i18n="orders.ordersAndFulfillment">Confirmed Orders & Procurement Pipeline</span></h1>'
  },
  {
    target: '<p>Track fulfillment progress, mandi dispatches, delivery progress, and payment settlements.</p>',
    replacement: '<p data-i18n="orders.ordersAndFulfillment">Track fulfillment progress, mandi dispatches, delivery progress, and payment settlements.</p>'
  }
]);

// 8. STORAGE.HTML
replaceInFile('storage.html', [
  {
    target: '<strong>Storage & Warehouse Discovery</strong>',
    replacement: '<strong data-i18n="storage.storageDiscovery">Storage & Warehouse Discovery</strong>'
  },
  {
    target: '<span>Nearby Warehouses & Godowns</span>',
    replacement: '<span data-i18n="storage.nearbyWarehouses">Nearby Warehouses & Godowns</span>'
  },
  {
    target: '<span>Sell Now vs. Store & Hold</span>',
    replacement: '<span data-i18n="storage.sellVsStoreTitle">Sell Now vs. Store & Hold</span>'
  },
  {
    target: '<span>My Storage & e-NWR Loans</span>',
    replacement: '<span data-i18n="storage.pledgeFinancingTitle">My Storage & e-NWR Loans</span>'
  }
]);
