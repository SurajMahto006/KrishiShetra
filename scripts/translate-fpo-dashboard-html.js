const fs = require('fs');
const path = require('path');

const fpoHtmlPath = path.join(__dirname, '..', 'fpo-dashboard.html');
let html = fs.readFileSync(fpoHtmlPath, 'utf8');

const replacements = [
  // Nav
  { from: '<span data-i18n="nav_dashboard">Dashboard</span>', to: '<span data-i18n="fpo.navDashboard">Dashboard</span>' },
  { from: '<span data-i18n="nav_farmers">Farmers</span>', to: '<span data-i18n="fpo.navFarmers">Farmers</span>' },
  { from: '<span data-i18n="nav_lots">Lots</span>', to: '<span data-i18n="fpo.navLots">Lots</span>' },
  { from: '<span data-i18n="nav_market">Market</span>', to: '<span data-i18n="fpo.navMarket">Market</span>' },
  { from: '<span data-i18n="nav_buyers">Buyers</span>', to: '<span data-i18n="fpo.navBuyers">Buyers</span>' },
  { from: '<span data-i18n="nav_orders">Orders</span>', to: '<span data-i18n="fpo.navOrders">Orders</span>' },
  { from: '<span data-i18n="nav_analytics">Analytics</span>', to: '<span data-i18n="fpo.navAnalytics">Analytics</span>' },
  { from: '<span class="brand-badge">FPO Hub</span>', to: '<span class="brand-badge" data-i18n="fpo.fpoHub">FPO Hub</span>' },

  // Profile Dropdown
  { from: 'FPO Organization Profile', to: '<span data-i18n="fpo.fpoOrganizationProfile">FPO Organization Profile</span>' },
  { from: 'Member Farmers Directory', to: '<span data-i18n="fpo.memberFarmersDirectory">Member Farmers Directory</span>' },
  { from: 'Buyer Contracts & Orders', to: '<span data-i18n="fpo.buyerContractsAndOrders">Buyer Contracts & Orders</span>' },

  // Hero
  { from: '<span data-i18n="hero_badge">FPO Command Center</span>', to: '<span data-i18n="fpo.fpoCommandCenter">FPO Command Center</span>' },
  { from: '<h1 class="hero-title" data-i18n="hero_title">Welcome, <span>Nashik Farmers FPO</span> 👋</h1>', to: '<h1 class="hero-title"><span data-i18n="fpo.welcomeFpo">Welcome</span>, <span>Nashik Farmers FPO</span> 👋</h1>' },
  { from: '<p class="hero-subtitle" data-i18n="hero_sub">', to: '<p class="hero-subtitle" data-i18n="fpo.fpoHeroSubtitle">' },
  { from: '<span class="fpo-meta-label" data-i18n="meta_fpo">FPO Name</span>', to: '<span class="fpo-meta-label" data-i18n="fpo.fpoName">FPO Name</span>' },
  { from: '<span class="fpo-meta-label" data-i18n="meta_loc">Location</span>', to: '<span class="fpo-meta-label" data-i18n="fpo.location">Location</span>' },
  { from: '<span class="fpo-meta-label" data-i18n="meta_farmers">Registered Farmers</span>', to: '<span class="fpo-meta-label" data-i18n="fpo.registeredFarmers">Registered Farmers</span>' },
  { from: '<span class="fpo-meta-label" data-i18n="meta_produce">Total Produce</span>', to: '<span class="fpo-meta-label" data-i18n="fpo.totalProduceAggregated">Total Produce</span>' },
  { from: '<span class="fpo-meta-label" data-i18n="meta_buyers">Active Buyers</span>', to: '<span class="fpo-meta-label" data-i18n="fpo.activeBuyers">Active Buyers</span>' },
  { from: '<span class="badge badge-success">● Live Sync</span>', to: '<span class="badge badge-success" data-i18n="fpo.liveSync">● Live Sync</span>' },

  // KPIs
  { from: '<span class="kpi-label" data-i18n="kpi_farmers">Farmers</span>', to: '<span class="kpi-label" data-i18n="fpo.farmersCountLabel">Farmers</span>' },
  { from: '<span class="kpi-label" data-i18n="kpi_produce">Aggregated Produce</span>', to: '<span class="kpi-label" data-i18n="fpo.aggregatedProduceLabel">Aggregated Produce</span>' },
  { from: '<span class="kpi-label" data-i18n="kpi_lots">Active Lots</span>', to: '<span class="kpi-label" data-i18n="fpo.activeLotsCountLabel">Active Lots</span>' },
  { from: '<span class="kpi-label" data-i18n="kpi_offers">Buyer Offers</span>', to: '<span class="kpi-label" data-i18n="fpo.buyerOffersCountLabel">Buyer Offers</span>' },

  // Farmers Section
  { from: '<h2 data-i18n="sec_farmers"><span>👨‍🌾</span> Farmer Members</h2>', to: '<h2><span>👨‍🌾</span> <span data-i18n="fpo.farmerMembersTitle">Farmer Members</span></h2>' },
  { from: '<p data-i18n="sec_farmers_sub">Registered individual member contributions and crop lot aggregation status.</p>', to: '<p data-i18n="fpo.farmerMembersSubtitle">Registered individual member contributions and crop lot aggregation status.</p>' },
  { from: '<span data-i18n="btn_add_farmer">+ Add Farmer</span>', to: '<span data-i18n="fpo.addFarmerBtn">+ Add Farmer</span>' },
  { from: '<span data-i18n="btn_view_all_farmers">View All Farmers</span>', to: '<span data-i18n="fpo.viewAllFarmersBtn">View All Farmers</span>' },
  { from: 'placeholder="Search farmer by name, village or crop..."', to: 'placeholder="Search farmer by name, village or crop..." data-i18n-placeholder="fpo.searchFarmerPlaceholder"' },
  { from: '<button class="filter-pill active" onclick="setFarmerFilter(\'all\', this)">All Crops</button>', to: '<button class="filter-pill active" onclick="setFarmerFilter(\'all\', this)" data-i18n="fpo.allCropsFilter">All Crops</button>' },

  // Table Headers
  { from: '<th data-i18n="th_name">Farmer Name</th>', to: '<th data-i18n="fpo.farmerNameTh">Farmer Name</th>' },
  { from: '<th data-i18n="th_crop">Crop</th>', to: '<th data-i18n="fpo.cropTh">Crop</th>' },
  { from: '<th data-i18n="th_quantity">Quantity</th>', to: '<th data-i18n="fpo.quantityTh">Quantity</th>' },
  { from: '<th data-i18n="th_lot_status">Lot Status</th>', to: '<th data-i18n="fpo.lotStatusTh">Lot Status</th>' },
  { from: '<th data-i18n="th_quality">Quality</th>', to: '<th data-i18n="fpo.qualityTh">Quality</th>' },
  { from: '<th data-i18n="th_status">Status</th>', to: '<th data-i18n="fpo.statusTh">Status</th>' },
  { from: '<th style="text-align:right;">Actions</th>', to: '<th style="text-align:right;" data-i18n="fpo.actionsTh">Actions</th>' },

  // Lots Section
  { from: '<h2 data-i18n="sec_lots"><span>📦</span> Aggregated Lots</h2>', to: '<h2><span>📦</span> <span data-i18n="fpo.aggregatedLotsTitle">Aggregated Lots</span></h2>' },
  { from: '<p data-i18n="sec_lots_sub">Unified bulk commodity lots created from multi-farmer pooling for institutional buyer negotiation.</p>', to: '<p data-i18n="fpo.aggregatedLotsSubtitle">Unified bulk commodity lots created from multi-farmer pooling for institutional buyer negotiation.</p>' },
  { from: '+ Create New Lot', to: '<span data-i18n="fpo.createNewLotBtn">+ Create New Lot</span>' },

  // Market Intelligence
  { from: '<h2 data-i18n="sec_market"><span>📈</span> Market Intelligence & AI Insights</h2>', to: '<h2><span>📈</span> <span data-i18n="fpo.marketIntelligenceTitle">Market Intelligence & AI Insights</span></h2>' },
  { from: '<p data-i18n="sec_market_sub">Real-time APMC price benchmarks, spatial price trends, and predictive aggregation intelligence.</p>', to: '<p data-i18n="fpo.marketIntelligenceSubtitle">Real-time APMC price benchmarks, spatial price trends, and predictive aggregation intelligence.</p>' },
  { from: '<h3 class="ai-headline" data-i18n="ai_headline">Collective Selling Opportunity</h3>', to: '<h3 class="ai-headline" data-i18n="fpo.collectiveSellingOpportunity">Collective Selling Opportunity</h3>' },
  { from: '<p class="ai-quote" data-i18n="ai_quote">', to: '<p class="ai-quote" data-i18n="fpo.aiQuoteText">' },
  { from: '<span data-i18n="btn_ai_forecast">View AI Forecast</span>', to: '<span data-i18n="fpo.viewAiForecastBtn">View AI Forecast</span>' },

  // Buyer Offers
  { from: '<h2 data-i18n="sec_buyers"><span>🤝</span> Verified Institutional Buyer Offers</h2>', to: '<h2><span>🤝</span> <span data-i18n="fpo.verifiedBuyerOffersTitle">Verified Institutional Buyer Offers</span></h2>' },
  { from: '<p data-i18n="sec_buyers_sub">Direct contracts and live bidding from KYC-verified food processors and exporters.</p>', to: '<p data-i18n="fpo.verifiedBuyerOffersSubtitle">Direct contracts and live bidding from KYC-verified food processors and exporters.</p>' },
  { from: 'Compare Offers', to: '<span data-i18n="fpo.compareOffersBtn">Compare Offers</span>' },

  // Orders
  { from: '<h2 data-i18n="sec_orders"><span>🚚</span> Orders & Logistics Fulfillment</h2>', to: '<h2><span>🚚</span> <span data-i18n="fpo.ordersAndLogisticsTitle">Orders & Logistics Fulfillment</span></h2>' },
  { from: '<p data-i18n="sec_orders_sub">Live dispatch tracking, transporter assignment, and digital proof-of-delivery.</p>', to: '<p data-i18n="fpo.ordersAndLogisticsSubtitle">Live dispatch tracking, transporter assignment, and digital proof-of-delivery.</p>' },
  { from: '1 Active Shipment in Transit', to: '<span data-i18n="fpo.activeShipmentBadge">1 Active Shipment in Transit</span>' },

  // Analytics
  { from: '<h2 data-i18n="sec_analytics"><span>📊</span> FPO Performance Analytics</h2>', to: '<h2><span>📊</span> <span data-i18n="fpo.performanceAnalyticsTitle">FPO Performance Analytics</span></h2>' },
  { from: '<p data-i18n="sec_analytics_sub">Financial overview, member impact metrics, and aggregation volume trends.</p>', to: '<p data-i18n="fpo.performanceAnalyticsSubtitle">Financial overview, member impact metrics, and aggregation volume trends.</p>' },
  { from: 'Export PDF Report', to: '<span data-i18n="fpo.exportPdfReportBtn">Export PDF Report</span>' },
  { from: '<span class="metric-mini-label" data-i18n="metric_onboarded">Total Farmers Onboarded</span>', to: '<span class="metric-mini-label" data-i18n="fpo.totalFarmersOnboardedLabel">Total Farmers Onboarded</span>' },
  { from: '<span class="metric-mini-label" data-i18n="metric_sold">Total Produce Sold</span>', to: '<span class="metric-mini-label" data-i18n="fpo.totalProduceSoldLabel">Total Produce Sold</span>' },
  { from: '<span class="metric-mini-label" data-i18n="metric_avg_price">Average Selling Price</span>', to: '<span class="metric-mini-label" data-i18n="fpo.averageSellingPriceLabel">Average Selling Price</span>' },
  { from: '<span class="metric-mini-label" data-i18n="metric_revenue">Revenue Generated</span>', to: '<span class="metric-mini-label" data-i18n="fpo.revenueGeneratedLabel">Revenue Generated</span>' },
  { from: '<span class="metric-mini-label" data-i18n="metric_improvement" style="color:var(--text-evergreen);">Price Improvement</span>', to: '<span class="metric-mini-label" data-i18n="fpo.priceImprovementLabel" style="color:var(--text-evergreen);">Price Improvement</span>' },
  { from: '<span class="metric-mini-sub" style="color:var(--text-charcoal);font-weight:700;">Higher Net Realization</span>', to: '<span class="metric-mini-sub" data-i18n="fpo.higherNetRealizationSub" style="color:var(--text-charcoal);font-weight:700;">Higher Net Realization</span>' },

  // Modals
  { from: '<h3 class="modal-title">👨‍🌾 Add Farmer Member</h3>', to: '<h3 class="modal-title" data-i18n="fpo.addFarmerModalTitle">👨‍🌾 Add Farmer Member</h3>' },
  { from: '<label class="form-label">Farmer Full Name *</label>', to: '<label class="form-label" data-i18n="fpo.farmerFullNameLabel">Farmer Full Name *</label>' },
  { from: '<label class="form-label">Village / Taluka *</label>', to: '<label class="form-label" data-i18n="fpo.villageTalukaLabel">Village / Taluka *</label>' },
  { from: '<label class="form-label">Phone Number *</label>', to: '<label class="form-label" data-i18n="fpo.phoneNumberLabel">Phone Number *</label>' },
  { from: '<label class="form-label">Crop Contribution *</label>', to: '<label class="form-label" data-i18n="fpo.cropContributionLabel">Crop Contribution *</label>' },
  { from: '<label class="form-label">Quantity (Quintals/Tons) *</label>', to: '<label class="form-label" data-i18n="fpo.quantityInputLabel">Quantity (Quintals/Tons) *</label>' },
  { from: '<label class="form-label">Quality Grade</label>', to: '<label class="form-label" data-i18n="fpo.qualityGradeLabel">Quality Grade</label>' },
  { from: '<label class="form-label">Assign to Lot</label>', to: '<label class="form-label" data-i18n="fpo.assignToLotLabel">Assign to Lot</label>' },
  { from: '<button type="submit" class="btn btn-primary" style="flex:1;">Save Farmer Record</button>', to: '<button type="submit" class="btn btn-primary" style="flex:1;" data-i18n="fpo.saveFarmerRecordBtn">Save Farmer Record</button>' },
  { from: '<button type="button" class="btn btn-secondary" style="flex:1;" onclick="closeModal(\'addFarmerModal\')">Cancel</button>', to: '<button type="button" class="btn btn-secondary" style="flex:1;" onclick="closeModal(\'addFarmerModal\')" data-i18n="common.cancel">Cancel</button>' }
];

replacements.forEach(r => {
  html = html.replaceAll(r.from, r.to);
});

fs.writeFileSync(fpoHtmlPath, html, 'utf8');
console.log('fpo-dashboard.html tags updated successfully!');
