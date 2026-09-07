const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const enPath = path.join(localesDir, 'en.json');
const hiPath = path.join(localesDir, 'hi.json');
const mrPath = path.join(localesDir, 'mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

// ── 1. ENRICH COMMON NAMESPACE (Sorts, filters, table headers, empty states, time ranges, months, days) ──
const commonEn = {
  ...en.common,
  // Time ranges
  timeRange7D: "Last 7 Days",
  timeRange30D: "Last 30 Days",
  timeRange90D: "Last 3 Months",
  timeRange1Y: "Last 1 Year",
  // Months
  monthJan: "Jan",
  monthFeb: "Feb",
  monthMar: "Mar",
  monthApr: "Apr",
  monthMay: "May",
  monthJun: "Jun",
  monthJul: "Jul",
  monthAug: "Aug",
  monthSep: "Sep",
  monthSepEst: "Sep (Est)",
  monthOct: "Oct",
  monthNov: "Nov",
  monthDec: "Dec",
  // Days
  dayMon: "Mon",
  dayTue: "Tue",
  dayWed: "Wed",
  dayThu: "Thu",
  dayFri: "Fri",
  daySat: "Sat",
  daySun: "Sun",
  dayToday: "Today",
  // Common Table Headers
  thLotId: "Lot ID",
  thCrop: "Crop & Variety",
  thQuantity: "Quantity (q)",
  thPrice: "Price (₹/q)",
  thMandi: "Mandi / Location",
  thDistance: "Distance",
  thNetProfit: "Net Realization",
  thFarmer: "Farmer / Seller",
  thBuyer: "Buyer / Company",
  thTransporter: "Transporter / Vehicle",
  thStatus: "Status",
  thDate: "Date",
  thActions: "Actions",
  thStorageFacility: "Storage Facility",
  thCapacity: "Available Capacity",
  thStorageRate: "Storage Rate",
  thEstimatedCost: "Estimated Cost",
  thGrossRevenue: "Gross Revenue",
  thNetMargin: "Net Margin",
  thTripId: "Trip ID",
  thVehicle: "Vehicle No",
  thRoute: "Route",
  // Filter Dropdown Common Options
  allCrops: "All Crops",
  allMandis: "All Mandis",
  allStatuses: "All Statuses",
  allDistricts: "All Districts",
  allFacilities: "All Facility Types",
  allCategories: "All Categories",
  allGrades: "All Grades",
  filterByCommodity: "Filter by Crop",
  filterByDistrict: "Filter by District",
  filterByStatus: "Filter by Status",
  searchPlaceholder: "Search by crop, mandi, seller...",
  // Sort Options
  sortPriceLowHigh: "Price: Low to High",
  sortPriceHighLow: "Price: High to Low",
  sortDistanceNearest: "Distance: Nearest First",
  sortCapacityHighLow: "Capacity: High to Low",
  sortNetProfitHighLow: "Net Realization: Highest First",
  sortNewestFirst: "Date: Newest First",
  sortQuantityHighLow: "Quantity: High to Low",
  sortRatingHighLow: "Rating: Highest First",
  // Empty States
  noDataAvailable: "No data available for the selected filters.",
  noLotsFound: "No produce lots found matching your criteria.",
  noOrdersFound: "No orders recorded yet.",
  noInquiriesFound: "No trade inquiries found.",
  noStorageFound: "No storage facilities found nearby.",
  noTransactionsFound: "No transaction history available.",
  noAlertsConfigured: "No active price alerts set.",
  noTripsFound: "No trips found matching filter.",
  noChartData: "Insufficient data to plot chart.",
  // Chart Axis & Labels
  xAxisDate: "Date / Timeline",
  xAxisMonth: "Month",
  xAxisMandi: "Mandi / Market",
  xAxisDistance: "Distance from Origin (km)",
  yAxisPrice: "Price (₹/quintal)",
  yAxisVolume: "Volume (Tons)",
  yAxisRevenue: "Revenue (₹ Lakh)",
  yAxisNetProfit: "Net Realization (₹/quintal after freight)",
  yAxisUsers: "Active Users",
  yAxisAmount: "Amount (₹)",
  yAxisTransactions: "Number of Transactions",
  others: "Others",
  total: "Total"
};

const commonHi = {
  ...hi.common,
  // Time ranges
  timeRange7D: "पिछले 7 दिन",
  timeRange30D: "पिछले 30 दिन",
  timeRange90D: "पिछले 3 महीने",
  timeRange1Y: "पिछला 1 वर्ष",
  // Months
  monthJan: "जनवरी",
  monthFeb: "फ़रवरी",
  monthMar: "मार्च",
  monthApr: "अप्रैल",
  monthMay: "मई",
  monthJun: "जून",
  monthJul: "जुलाई",
  monthAug: "अगस्त",
  monthSep: "सितंबर",
  monthSepEst: "सितंबर (अनुमानित)",
  monthOct: "अक्टूबर",
  monthNov: "नवंबर",
  monthDec: "दिसंबर",
  // Days
  dayMon: "सोम",
  dayTue: "मंगल",
  dayWed: "बुध",
  dayThu: "गुरु",
  dayFri: "शुक्र",
  daySat: "शनि",
  daySun: "रवि",
  dayToday: "आज",
  // Common Table Headers
  thLotId: "लॉट आईडी",
  thCrop: "फसल व किस्म",
  thQuantity: "मात्रा (क्विंटल)",
  thPrice: "भाव (₹/क्विंटल)",
  thMandi: "मंडी / स्थान",
  thDistance: "दूरी",
  thNetProfit: "शुद्ध आय",
  thFarmer: "किसान / विक्रेता",
  thBuyer: "खरीदार / कंपनी",
  thTransporter: "परिवहनकर्ता / वाहन",
  thStatus: "स्थिति",
  thDate: "दिनांक",
  thActions: "कार्रवाई",
  thStorageFacility: "भंडारण सुविधा",
  thCapacity: "उपलब्ध क्षमता",
  thStorageRate: "भंडारण दर",
  thEstimatedCost: "अनुमानित लागत",
  thGrossRevenue: "सकल राजस्व",
  thNetMargin: "शुद्ध लाभ",
  thTripId: "ट्रिप आईडी",
  thVehicle: "वाहन क्रमांक",
  thRoute: "मार्ग",
  // Filter Dropdown Common Options
  allCrops: "सभी फसलें",
  allMandis: "सभी मंडियां",
  allStatuses: "सभी स्थितियां",
  allDistricts: "सभी जिले",
  allFacilities: "सभी सुविधा प्रकार",
  allCategories: "सभी श्रेणियां",
  allGrades: "सभी ग्रेड",
  filterByCommodity: "फसल अनुसार फ़िल्टर",
  filterByDistrict: "जिले अनुसार फ़िल्टर",
  filterByStatus: "स्थिति अनुसार फ़िल्टर",
  searchPlaceholder: "फसल, मंडी, विक्रेता खोजें...",
  // Sort Options
  sortPriceLowHigh: "भाव: कम से अधिक",
  sortPriceHighLow: "भाव: अधिक से कम",
  sortDistanceNearest: "दूरी: निकटतम पहले",
  sortCapacityHighLow: "क्षमता: अधिक से कम",
  sortNetProfitHighLow: "शुद्ध आय: अधिकतम पहले",
  sortNewestFirst: "दिनांक: नवीनतम पहले",
  sortQuantityHighLow: "मात्रा: अधिक से कम",
  sortRatingHighLow: "रेटिंग: उच्चतम पहले",
  // Empty States
  noDataAvailable: "चयनित फ़िल्टर के लिए कोई डेटा उपलब्ध नहीं है।",
  noLotsFound: "आपके मानदंडों से मेल खाने वाला कोई लॉट नहीं मिला।",
  noOrdersFound: "अभी तक कोई ऑर्डर दर्ज नहीं किया गया है।",
  noInquiriesFound: "कोई व्यापार पूछताछ नहीं मिली।",
  noStorageFound: "पास में कोई भंडारण सुविधा नहीं मिली।",
  noTransactionsFound: "कोई लेनदेन इतिहास उपलब्ध नहीं है।",
  noAlertsConfigured: "कोई सक्रिय भाव अलर्ट सेट नहीं है।",
  noTripsFound: "फ़िल्टर से मेल खाने वाली कोई ट्रिप नहीं मिली।",
  noChartData: "चार्ट प्रदर्शित करने के लिए पर्याप्त डेटा नहीं है।",
  // Chart Axis & Labels
  xAxisDate: "दिनांक / समयसीमा",
  xAxisMonth: "माह",
  xAxisMandi: "मंडी / बाजार",
  xAxisDistance: "मूल स्थान से दूरी (किमी)",
  yAxisPrice: "भाव (₹/क्विंटल)",
  yAxisVolume: "मात्रा (टन)",
  yAxisRevenue: "राजस्व (₹ लाख)",
  yAxisNetProfit: "शुद्ध प्राप्ति (₹/क्विंटल भाड़ा उपरांत)",
  yAxisUsers: "सक्रिय उपयोगकर्ता",
  yAxisAmount: "राशि (₹)",
  yAxisTransactions: "लेनदेन की संख्या",
  others: "अन्य",
  total: "कुल"
};

const commonMr = {
  ...mr.common,
  // Time ranges
  timeRange7D: "मागील 7 दिवस",
  timeRange30D: "मागील 30 दिवस",
  timeRange90D: "मागील 3 महिने",
  timeRange1Y: "मागील 1 वर्ष",
  // Months
  monthJan: "जानेवारी",
  monthFeb: "फेब्रुवारी",
  monthMar: "मार्च",
  monthApr: "एप्रिल",
  monthMay: "मे",
  monthJun: "जून",
  monthJul: "जुलै",
  monthAug: "ऑगस्ट",
  monthSep: "सप्टेंबर",
  monthSepEst: "सप्टेंबर (अंदाजित)",
  monthOct: "ऑक्टोबर",
  monthNov: "नोव्हेंबर",
  monthDec: "डिसेंबर",
  // Days
  dayMon: "सोम",
  dayTue: "मंगळ",
  dayWed: "बुध",
  dayThu: "गुरू",
  dayFri: "शुक्र",
  daySat: "शनि",
  daySun: "रवि",
  dayToday: "आज",
  // Common Table Headers
  thLotId: "लॉट आयडी",
  thCrop: "पीक व जात",
  thQuantity: "प्रमाण (क्विंटल)",
  thPrice: "दर (₹/क्विंटल)",
  thMandi: "बाजार / ठिकाण",
  thDistance: "अंतर",
  thNetProfit: "निव्वळ प्राप्ती",
  thFarmer: "शेतकरी / विक्रेता",
  thBuyer: "खरेदीदार / कंपनी",
  thTransporter: "वाहतूकदार / वाहन",
  thStatus: "स्थिती",
  thDate: "तारीख",
  thActions: "कृती",
  thStorageFacility: "साठवणूक सुविधा",
  thCapacity: "उपलब्ध क्षमता",
  thStorageRate: "साठवणूक दर",
  thEstimatedCost: "अंदाजित खर्च",
  thGrossRevenue: "एकूण महसूल",
  thNetMargin: "निव्वळ नफा",
  thTripId: "ट्रिप आयडी",
  thVehicle: "वाहन क्र.",
  thRoute: "मार्ग",
  // Filter Dropdown Common Options
  allCrops: "सर्व पिके",
  allMandis: "सर्व बाजार समित्या",
  allStatuses: "सर्व स्थिती",
  allDistricts: "सर्व जिल्हे",
  allFacilities: "सर्व सुविधा प्रकार",
  allCategories: "सर्व वर्ग",
  allGrades: "सर्व प्रतवारी",
  filterByCommodity: "पिकानुसार फिल्टर",
  filterByDistrict: "जिल्ह्यानुसार फिल्टर",
  filterByStatus: "स्थितीनुसार फिल्टर",
  searchPlaceholder: "पीक, बाजार, विक्रेता शोधा...",
  // Sort Options
  sortPriceLowHigh: "दर: कमी ते जास्त",
  sortPriceHighLow: "दर: जास्त ते कमी",
  sortDistanceNearest: "अंतर: सर्वात जवळचे आधी",
  sortCapacityHighLow: "क्षमता: जास्त ते कमी",
  sortNetProfitHighLow: "निव्वळ प्राप्ती: सर्वाधिक आधी",
  sortNewestFirst: "तारीख: नवीन आधी",
  sortQuantityHighLow: "प्रमाण: जास्त ते कमी",
  sortRatingHighLow: "रेटिंग: सर्वोत्तम आधी",
  // Empty States
  noDataAvailable: "निवडलेल्या फिल्टरसाठी कोणताही डेटा उपलब्ध नाही.",
  noLotsFound: "तुमच्या निकषांशी जुळणारा कोणताही शेतमाल लॉट आढळला नाही.",
  noOrdersFound: "अद्याप कोणतीही ऑर्डर नोंदवलेली नाही.",
  noInquiriesFound: "कोणतीही विचारणा आढळली नाही.",
  noStorageFound: "जवळ कोणतीही साठवणूक सुविधा आढळली नाही.",
  noTransactionsFound: "कोणताही व्यवहार इतिहास उपलब्ध नाही.",
  noAlertsConfigured: "कोणताही सक्रिय दर अलर्ट सेट नाही.",
  noTripsFound: "फिल्टरशी जुळणारी कोणतीही ट्रिप आढळली नाही.",
  noChartData: "आलेख काढण्यासाठी पुरेसा डेटा नाही.",
  // Chart Axis & Labels
  xAxisDate: "तारीख / कालावधी",
  xAxisMonth: "महिना",
  xAxisMandi: "बाजार समिती / मार्केट",
  xAxisDistance: "मूळ ठिकाणापासून अंतर (किमी)",
  yAxisPrice: "दर (₹/क्विंटल)",
  yAxisVolume: "प्रमाण (टन)",
  yAxisRevenue: "महसूल (₹ लाख)",
  yAxisNetProfit: "निव्वळ प्राप्ती (₹/क्विंटल वाहतूक वजा)",
  yAxisUsers: "सक्रिय वापरकर्ते",
  yAxisAmount: "रक्कम (₹)",
  yAxisTransactions: "व्यवहारांची संख्या",
  others: "इतर",
  total: "एकूण"
};

// ── 2. ENRICH MARKET NAMESPACE (Price Trends, Mandi Compare, Tooltips, Legends) ──
const marketEn = {
  ...en.market,
  priceTrend: "Price Trend",
  marketPriceTrend: "Market Price Trends",
  mandiComparison: "Mandi Price & Profitability Comparison",
  distanceVsProfit: "Distance vs Net Realization",
  mandiDecisionPoint: "Mandi Decision Point",
  netRealizationLabelShort: "Net Realization (₹/q)",
  pricePerQuintal: "Price (₹/q)",
  freightCostForQty: "Total Freight Cost (₹) for {{qty}}q",
  distanceLabel: "Distance: {{distance}} km",
  mandiPriceLabel: "Mandi Price: {{price}}/q",
  freightCostLabel: "Freight Cost: {{cost}}/q",
  netRealizationLabel: "Net Realization: {{net}}/q",
  baseMandiPrice: "Base Mandi Price",
  netFarmerProfit: "Net Farmer Profit",
  freightCost: "Freight Cost",
  xAxisDistance: "Distance from Origin (km)",
  yAxisNetProfit: "Net Realization (₹/quintal after freight)",
  projectedRate: "Projected Rate: ₹{{price}}/q"
};

const marketHi = {
  ...hi.market,
  priceTrend: "मूल्य रुझान",
  marketPriceTrend: "बाजार मूल्य रुझान",
  mandiComparison: "मंडी भाव व लाभप्रदता तुलना",
  distanceVsProfit: "दूरी बनाम शुद्ध आय",
  mandiDecisionPoint: "मंडी निर्णय बिंदु",
  netRealizationLabelShort: "शुद्ध आय (₹/क्विंटल)",
  pricePerQuintal: "भाव (₹/क्विंटल)",
  freightCostForQty: "{{qty}} क्विंटल के लिए कुल मालभाड़ा (₹)",
  distanceLabel: "दूरी: {{distance}} किमी",
  mandiPriceLabel: "मंडी भाव: {{price}}/क्विंटल",
  freightCostLabel: "मालभाड़ा खर्च: {{cost}}/क्विंटल",
  netRealizationLabel: "शुद्ध आय: {{net}}/क्विंटल",
  baseMandiPrice: "आधार मंडी भाव",
  netFarmerProfit: "किसान का शुद्ध लाभ",
  freightCost: "मालभाड़ा खर्च",
  xAxisDistance: "मूल स्थान से दूरी (किमी)",
  yAxisNetProfit: "शुद्ध प्राप्ति (₹/क्विंटल भाड़ा उपरांत)",
  projectedRate: "अनुमानित दर: ₹{{price}}/क्विंटल"
};

const marketMr = {
  ...mr.market,
  priceTrend: "किंमत कल",
  marketPriceTrend: "बाजार भाव कल",
  mandiComparison: "बाजार भाव व नफा तुलना",
  distanceVsProfit: "अंतर विरुद्ध निव्वळ नफा",
  mandiDecisionPoint: "बाजार निर्णय बिंदू",
  netRealizationLabelShort: "निव्वळ प्राप्ती (₹/क्विंटल)",
  pricePerQuintal: "दर (₹/क्विंटल)",
  freightCostForQty: "{{qty}} क्विंटलसाठी एकूण वाहतूक खर्च (₹)",
  distanceLabel: "अंतर: {{distance}} किमी",
  mandiPriceLabel: "बाजार भाव: {{price}}/क्विंटल",
  freightCostLabel: "वाहतूक खर्च: {{cost}}/क्विंटल",
  netRealizationLabel: "निव्वळ प्राप्ती: {{net}}/क्विंटल",
  baseMandiPrice: "मूळ बाजार भाव",
  netFarmerProfit: "शेतकऱ्याचा निव्वळ नफा",
  freightCost: "वाहतूक खर्च",
  xAxisDistance: "मूळ ठिकाणापासून अंतर (किमी)",
  yAxisNetProfit: "निव्वळ प्राप्ती (₹/क्विंटल वाहतूक वजा)",
  projectedRate: "अंदाजित दर: ₹{{price}}/क्विंटल"
};

// ── 3. ENRICH FPO NAMESPACE (FPO Charts, Legends, Axes) ──
const fpoEn = {
  ...en.fpo,
  priceTrendsCardTitle: "7-Day APMC Price Trends (₹/Quintal)",
  priceTrendsCardSubtitle: "Comparing Local Nashik Mandi vs Institutional Direct FPO Price",
  monthlyVolumeCardTitle: "Monthly Aggregation Volume & Revenue (2026)",
  monthlyVolumeCardSubtitle: "Tons aggregated vs Total realization in Lakhs",
  commodityShareCardTitle: "Commodity Share Breakdown",
  commodityShareCardSubtitle: "Share of 128.5 Tons aggregated",
  fpoRealization: "KrishiShetra FPO Realization (₹/q)",
  mandiBenchmarkRate: "Nashik APMC Mandi Rate (₹/q)",
  aggregatedTons: "Aggregated (Tons)",
  revenueLakh: "Revenue (₹ Lakh)",
  dayMonLabel: "Mon (24 Aug)",
  dayTueLabel: "Tue (25 Aug)",
  dayWedLabel: "Wed (26 Aug)",
  dayThuLabel: "Thu (27 Aug)",
  dayFriLabel: "Fri (28 Aug)",
  daySatLabel: "Sat (29 Aug)",
  dayTodayLabel: "Today (30 Aug)"
};

const fpoHi = {
  ...hi.fpo,
  priceTrendsCardTitle: "7-दिवसीय एपीएमसी मूल्य रुझान (₹/क्विंटल)",
  priceTrendsCardSubtitle: "स्थानीय नासिक मंडी बनाम संस्थागत प्रत्यक्ष एफपीओ मूल्य की तुलना",
  monthlyVolumeCardTitle: "मासिक एकत्रीकरण मात्रा व राजस्व (2026)",
  monthlyVolumeCardSubtitle: "एकत्रित टन बनाम लाख में कुल प्राप्ति",
  commodityShareCardTitle: "वस्तु हिस्सेदारी वितरण",
  commodityShareCardSubtitle: "एकत्रित 128.5 टन की हिस्सेदारी",
  fpoRealization: "कृषिक्षेत्र एफपीओ प्राप्ति (₹/क्विंटल)",
  mandiBenchmarkRate: "नासिक एपीएमसी मंडी दर (₹/क्विंटल)",
  aggregatedTons: "एकत्रित मात्रा (टन)",
  revenueLakh: "राजस्व (₹ लाख)",
  dayMonLabel: "सोम (24 अग)",
  dayTueLabel: "मंगल (25 अग)",
  dayWedLabel: "बुध (26 अग)",
  dayThuLabel: "गुरु (27 अग)",
  dayFriLabel: "शुक्र (28 अग)",
  daySatLabel: "शनि (29 अग)",
  dayTodayLabel: "आज (30 अग)"
};

const fpoMr = {
  ...mr.fpo,
  priceTrendsCardTitle: "7-दिवसीय एपीएमसी बाजार भाव कल (₹/क्विंटल)",
  priceTrendsCardSubtitle: "स्थानिक नाशिक बाजार समिती विरूद्ध थेट संस्थात्मक एफपीओ दराची तुलना",
  monthlyVolumeCardTitle: "मासिक संकलन प्रमाण व महसूल (2026)",
  monthlyVolumeCardSubtitle: "संकलित टन विरूद्ध लाखांमध्ये एकूण प्राप्ती",
  commodityShareCardTitle: "शेतमाल हिस्सा विभागणी",
  commodityShareCardSubtitle: "संकलित 128.5 टन मधील हिस्सा",
  fpoRealization: "कृषिक्षेत्र एफपीओ प्राप्ती (₹/क्विंटल)",
  mandiBenchmarkRate: "नाशिक एपीएमसी बाजार दर (₹/क्विंटल)",
  aggregatedTons: "संकलित प्रमाण (टन)",
  revenueLakh: "महसूल (₹ लाख)",
  dayMonLabel: "सोम (24 ऑग)",
  dayTueLabel: "मंगळ (25 ऑग)",
  dayWedLabel: "बुध (26 ऑग)",
  dayThuLabel: "गुरू (27 ऑग)",
  dayFriLabel: "शुक्र (28 ऑग)",
  daySatLabel: "शनि (29 ऑग)",
  dayTodayLabel: "आज (30 ऑग)"
};

// ── 4. ENRICH ADMIN NAMESPACE (Admin Charts, Growth, GMV, Regions) ──
const adminEn = {
  ...en.admin,
  registrationTrendsTitle: "New User Registrations",
  roleDistributionTitle: "User Role Distribution",
  cropDistributionTitle: "Crop Cultivation Distribution",
  gmvTrendTitle: "Gross Merchandise Value (GMV) Trend",
  transactionVolumeTitle: "Transaction Volume & Trends",
  regionalDistributionTitle: "Regional Activity Breakdown",
  farmerTrendTitle: "Farmer Onboarding Trends",
  gmvLakhs: "GMV (₹ Lakhs)",
  targetLakhs: "Target (₹ Lakhs)",
  transactionsLabel: "Transactions",
  newUsers: "New Users",
  newFarmers: "New Farmers",
  farmersLabel: "Farmers",
  fposLabel: "FPOs",
  buyersLabel: "Buyers",
  adminsLabel: "Admins",
  farmersCountPct: "{{label}}: {{count}} farmers ({{pct}}%)",
  usersCountPct: "{{label}}: {{count}} users ({{pct}}%)"
};

const adminHi = {
  ...hi.admin,
  registrationTrendsTitle: "नए उपयोगकर्ता पंजीकरण",
  roleDistributionTitle: "उपयोगकर्ता भूमिका वितरण",
  cropDistributionTitle: "फसल खेती वितरण",
  gmvTrendTitle: "सकल व्यापार मूल्य (GMV) रुझान",
  transactionVolumeTitle: "लेनदेन मात्रा व रुझान",
  regionalDistributionTitle: "क्षेत्रीय गतिविधि वितरण",
  farmerTrendTitle: "किसान ऑनबोर्डिंग रुझान",
  gmvLakhs: "जीएमवी (₹ लाख)",
  targetLakhs: "लक्ष्य (₹ लाख)",
  transactionsLabel: "लेनदेन",
  newUsers: "नए उपयोगकर्ता",
  newFarmers: "नए किसान",
  farmersLabel: "किसान",
  fposLabel: "एफपीओ",
  buyersLabel: "खरीदार",
  adminsLabel: "प्रशासक",
  farmersCountPct: "{{label}}: {{count}} किसान ({{pct}}%)",
  usersCountPct: "{{label}}: {{count}} उपयोगकर्ता ({{pct}}%)"
};

const adminMr = {
  ...mr.admin,
  registrationTrendsTitle: "नवीन वापरकर्ता नोंदणी",
  roleDistributionTitle: "वापरकर्ता भूमिका वितरण",
  cropDistributionTitle: "पीक लागवड वितरण",
  gmvTrendTitle: "एकूण व्यापारी मूल्य (GMV) कल",
  transactionVolumeTitle: "व्यवहार प्रमाण व कल",
  regionalDistributionTitle: "प्रादेशिक व्यवहार विभागणी",
  farmerTrendTitle: "शेतकरी ऑनबोर्डिंग कल",
  gmvLakhs: "जीएमव्ही (₹ लाख)",
  targetLakhs: "लक्ष्य (₹ लाख)",
  transactionsLabel: "व्यवहार",
  newUsers: "नवीन वापरकर्ते",
  newFarmers: "नवीन शेतकरी",
  farmersLabel: "शेतकरी",
  fposLabel: "एफपीओ",
  buyersLabel: "खरेदीदार",
  adminsLabel: "प्रशासक",
  farmersCountPct: "{{label}}: {{count}} शेतकरी ({{pct}}%)",
  usersCountPct: "{{label}}: {{count}} वापरकर्ते ({{pct}}%)"
};

// ── 5. ENRICH TRANSPORTER NAMESPACE (Earnings & Expense Breakdown) ──
const transporterEn = {
  ...en.transporter,
  earningsChartTitle: "Monthly Earnings & Freight",
  expenseChartTitle: "Trip Expense Breakdown",
  grossFreight: "Gross Freight (₹)",
  netMargin: "Net Margin (₹)",
  netProfit: "Net Profit",
  dieselFuel: "Diesel Fuel",
  driverBata: "Driver Bata",
  fastagTolls: "FASTag Tolls",
  platformFee: "Platform Fee"
};

const transporterHi = {
  ...hi.transporter,
  earningsChartTitle: "मासिक कमाई व मालभाड़ा",
  expenseChartTitle: "ट्रिप व्यय वितरण",
  grossFreight: "सकल मालभाड़ा (₹)",
  netMargin: "शुद्ध लाभ (₹)",
  netProfit: "शुद्ध लाभ",
  dieselFuel: "डीजल ईंधन",
  driverBata: "चालक भत्ता",
  fastagTolls: "फास्टैग टोल",
  platformFee: "प्लेटफॉर्म शुल्क"
};

const transporterMr = {
  ...mr.transporter,
  earningsChartTitle: "मासिक कमाई व वाहतूक भाडे",
  expenseChartTitle: "ट्रिप खर्च विभागणी",
  grossFreight: "एकूण वाहतूक भाडे (₹)",
  netMargin: "निव्वळ नफा (₹)",
  netProfit: "निव्वळ नफा",
  dieselFuel: "डिझेल इंधन",
  driverBata: "चालक भत्ता",
  fastagTolls: "फास्टॅग टोल",
  platformFee: "प्लॅटफॉर्म शुल्क"
};

// ── 6. ENRICH CROPLOT NAMESPACE (Crops in charts) ──
const cropLotEn = {
  ...en.cropLot,
  wheatSharbati: "Wheat (Sharbati)",
  nashikRedOnion: "Nashik Red Onion",
  hybridTomato: "Hybrid Tomato",
  basmatiRice: "Basmati Rice",
  sugarcane: "Sugarcane",
  cotton: "Cotton",
  soybean: "Soybean",
  maize: "Maize"
};

const cropLotHi = {
  ...hi.cropLot,
  wheatSharbati: "गेहूं (शरबती)",
  nashikRedOnion: "नासिक लाल प्याज",
  hybridTomato: "हाइब्रिड टमाटर",
  basmatiRice: "बासमती चावल",
  sugarcane: "गन्ना",
  cotton: "कपास",
  soybean: "सोयाबीन",
  maize: "मक्का"
};

const cropLotMr = {
  ...mr.cropLot,
  wheatSharbati: "गहू (शरबती)",
  nashikRedOnion: "नाशिक लाल कांदा",
  hybridTomato: "हायब्रिड टोमॅटो",
  basmatiRice: "बासमती तांदूळ",
  sugarcane: "ऊस",
  cotton: "कापूस",
  soybean: "सोयाबीन",
  maize: "मका"
};

en.common = commonEn;
hi.common = commonHi;
mr.common = commonMr;

en.market = marketEn;
hi.market = marketHi;
mr.market = marketMr;

en.fpo = fpoEn;
hi.fpo = fpoHi;
mr.fpo = fpoMr;

en.admin = adminEn;
hi.admin = adminHi;
mr.admin = adminMr;

en.transporter = transporterEn;
hi.transporter = transporterHi;
mr.transporter = transporterMr;

en.cropLot = cropLotEn;
hi.cropLot = cropLotHi;
mr.cropLot = cropLotMr;

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2) + '\n', 'utf8');
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2) + '\n', 'utf8');

console.log('Successfully enriched Data Visualization dictionaries in en.json, hi.json, and mr.json!');
