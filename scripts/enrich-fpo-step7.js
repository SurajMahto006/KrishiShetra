const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'src', 'locales', 'en.json');
const hiPath = path.join(__dirname, '..', 'src', 'locales', 'hi.json');
const mrPath = path.join(__dirname, '..', 'src', 'locales', 'mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

const fpoTranslations = {
  // Navigation
  navDashboard: { en: 'Dashboard', hi: 'डैशबोर्ड', mr: 'डॅशबोर्ड' },
  navFarmers: { en: 'Farmers', hi: 'किसान', mr: 'शेतकरी' },
  navLots: { en: 'Lots', hi: 'लॉट्स', mr: 'लॉट्स' },
  navMarket: { en: 'Market', hi: 'मंडी भाव', mr: 'बाजारभाव' },
  navBuyers: { en: 'Buyers', hi: 'खरीदार', mr: 'खरेदीदार' },
  navOrders: { en: 'Orders', hi: 'ऑर्डर', mr: 'ऑर्डर्स' },
  navAnalytics: { en: 'Analytics', hi: 'एनालिटिक्स', mr: 'अ‍ॅनालिटिक्स' },

  // Hero & Header
  fpoHub: { en: 'FPO Hub', hi: 'एफपीओ हब', mr: 'एफपीओ हब' },
  fpoCommandCenter: { en: 'FPO Command Center', hi: 'एफपीओ कमांड सेंटर', mr: 'एफपीओ कमांड सेंटर' },
  welcomeFpo: { en: 'Welcome, {{name}} 👋', hi: 'स्वागत है, {{name}} 👋', mr: 'स्वागत आहे, {{name}} 👋' },
  fpoHeroSubtitle: { 
    en: 'Manage your farmers, aggregate produce and connect directly with better buyers.',
    hi: 'अपने किसान सदस्यों का प्रबंधन करें, उपज एकत्र करें और सीधे बेहतर खरीदारों से जुड़ें।',
    mr: 'आपल्या शेतकरी सदस्यांचे व्यवस्थापन करा, शेतमाल एकत्र करा आणि थेट चांगल्या खरेदीदारांशी जोडा.'
  },
  fpoOrganizationProfile: { en: 'FPO Organization Profile', hi: 'एफपीओ संस्था प्रोफाइल', mr: 'एफपीओ संस्था प्रोफाइल' },
  memberFarmersDirectory: { en: 'Member Farmers Directory', hi: 'सदस्य किसान निर्देशिका', mr: 'सदस्य शेतकरी यादी' },
  buyerContractsAndOrders: { en: 'Buyer Contracts & Orders', hi: 'खरीदार अनुबंध एवं ऑर्डर', mr: 'खरेदीदार करार आणि ऑर्डर्स' },
  fpoName: { en: 'FPO Name', hi: 'एफपीओ का नाम', mr: 'एफपीओ चे नाव' },
  location: { en: 'Location', hi: 'स्थान', mr: 'स्थान' },
  registeredFarmers: { en: 'Registered Farmers', hi: 'पंजीकृत किसान', mr: 'नोंदणीकृत शेतकरी' },
  totalProduceAggregated: { en: 'Total Produce', hi: 'कुल एकत्र उपज', mr: 'एकूण गोळा केलेला शेतमाल' },
  activeBuyers: { en: 'Active Buyers', hi: 'सक्रिय खरीदार', mr: 'सक्रिय खरेदीदार' },
  activeMembers: { en: 'Active Members', hi: 'सक्रिय सदस्य', mr: 'सक्रिय सदस्य' },
  tonsAggregated: { en: 'Tons Aggregated', hi: 'टन एकत्र किया गया', mr: 'टन गोळा केले' },
  verifiedPartners: { en: 'Verified Partners', hi: 'सत्यापित भागीदार', mr: 'सत्यापित भागीदार' },
  liveSync: { en: 'Live Sync', hi: 'लाइव सिंक', mr: 'थेट सिंक' },

  // KPI Summary
  farmersCountLabel: { en: 'Farmers', hi: 'किसान', mr: 'शेतकरी' },
  farmersGrowthThisMonth: { en: '+12 this month', hi: '+12 इस माह', mr: '+१२ या महिन्यात' },
  aggregatedProduceLabel: { en: 'Aggregated Produce', hi: 'एकत्रित उपज', mr: 'एकत्रित शेतमाल' },
  tonsUnit: { en: 'Tons', hi: 'टन', mr: 'टन' },
  qualityInspectedBadge: { en: '100% Quality Inspected', hi: '100% गुणवत्ता प्रमाणित', mr: '१००% गुणवत्ता तपासणी पूर्ण' },
  activeLotsCountLabel: { en: 'Active Lots', hi: 'सक्रिय लॉट्स', mr: 'सक्रिय लॉट्स' },
  readyForDispatchBadge: { en: '8 Ready for Dispatch', hi: '8 प्रेषण हेतु तैयार', mr: '८ पाठवण्यासाठी सज्ज' },
  buyerOffersCountLabel: { en: 'Buyer Offers', hi: 'खरीदार ऑफर', mr: 'खरेदीदार ऑफर्स' },
  highValueMatchesBadge: { en: '4 High Value Matches', hi: '4 उच्च मूल्य सौदे', mr: '४ उच्च मूल्य सौदे' },

  // Member Farmers Section
  farmerMembersTitle: { en: 'Farmer Members', hi: 'किसान सदस्य', mr: 'शेतकरी सदस्य' },
  farmerMembersSubtitle: {
    en: 'Registered individual member contributions and crop lot aggregation status.',
    hi: 'पंजीकृत किसान सदस्यों का योगदान एवं फसल लॉट एकत्रीकरण स्थिति।',
    mr: 'नोंदणीकृत शेतकरी सदस्यांचे योगदान आणि पीक लॉट एकत्रीकरण स्थिती.'
  },
  addFarmerBtn: { en: '+ Add Farmer', hi: '+ किसान जोड़ें', mr: '+ शेतकरी जोडा' },
  viewAllFarmersBtn: { en: 'View All Farmers', hi: 'सभी किसान देखें', mr: 'सर्व शेतकरी पहा' },
  searchFarmerPlaceholder: {
    en: 'Search farmer by name, village or crop...',
    hi: 'किसान का नाम, गांव या फसल खोजें...',
    mr: 'शेतकऱ्याचे नाव, गाव किंवा पीक शोधा...'
  },
  allCropsFilter: { en: 'All Crops', hi: 'सभी फसलें', mr: 'सर्व पिके' },
  farmerNameTh: { en: 'Farmer Name', hi: 'किसान का नाम', mr: 'शेतकऱ्याचे नाव' },
  cropTh: { en: 'Crop', hi: 'फसल', mr: 'पीक' },
  quantityTh: { en: 'Quantity', hi: 'मात्रा', mr: 'प्रमाण' },
  lotStatusTh: { en: 'Lot Status', hi: 'लॉट स्थिति', mr: 'लॉट स्थिती' },
  qualityTh: { en: 'Quality', hi: 'गुणवत्ता', mr: 'गुणवत्ता' },
  statusTh: { en: 'Status', hi: 'स्थिति', mr: 'स्थिती' },
  actionsTh: { en: 'Actions', hi: 'कार्रवाई', mr: 'कृती' },
  detailsBtn: { en: 'Details', hi: 'विवरण', mr: 'तपशील' },
  verifiedAndWeighed: { en: '✓ Verified & Weighed', hi: '✓ सत्यापित एवं तौला गया', mr: '✓ तपासणी व वजन पूर्ण' },
  inColdStore: { en: '✓ In Cold Store', hi: '✓ कोल्ड स्टोरेज में', mr: '✓ कोल्ड स्टोरेजमध्ये' },
  readyForSale: { en: '✓ Ready for Sale', hi: '✓ बिक्री के लिए तैयार', mr: '✓ विक्रीसाठी सज्ज' },
  aggregationInProgress: { en: '○ Aggregation in Progress', hi: '○ एकत्रीकरण प्रगति पर', mr: '○ एकत्रीकरण चालू आहे' },
  storedAndSealed: { en: '✓ Stored & Sealed', hi: '✓ भंडारित एवं सीलबंद', mr: '✓ साठवणूक व सीलबंद' },

  // Aggregated Lots
  aggregatedLotsTitle: { en: 'Aggregated Lots', hi: 'एकत्रित लॉट्स', mr: 'एकत्रित लॉट्स' },
  aggregatedLotsSubtitle: {
    en: 'Unified bulk commodity lots created from multi-farmer pooling for institutional buyer negotiation.',
    hi: 'संस्थागत खरीदारों से बातचीत हेतु कई किसानों के पूलिंग से बने एकीकृत थोक जिंस लॉट।',
    mr: 'संस्थात्मक खरेदीदारांशी वाटाघाटीसाठी अनेक शेतकऱ्यांच्या एकत्रिकरणातून तयार केलेले घाऊक शेतमाल लॉट्स.'
  },
  createNewLotBtn: { en: '+ Create New Lot', hi: '+ नया लॉट बनाएं', mr: '+ नवीन लॉट तयार करा' },
  gradeACertified: { en: 'Grade A Certified', hi: 'ग्रेड A प्रमाणित', mr: 'ग्रेड A प्रमाणित' },
  totalVolumeLabel: { en: 'Total Volume', hi: 'कुल मात्रा', mr: 'एकूण प्रमाण' },
  contributorsLabel: { en: 'Contributors', hi: 'योगदानकर्ता', mr: 'सहभागी शेतकरी' },
  basePriceLabel: { en: 'Base Price', hi: 'आधार मूल्य', mr: 'पायाभूत भाव' },
  farmersCountUnit: { en: 'Farmers', hi: 'किसान', mr: 'शेतकरी' },
  viewLotBtn: { en: 'View Lot', hi: 'लॉट देखें', mr: 'लॉट पहा' },
  findBuyersBtn: { en: 'Find Buyers', hi: 'खरीदार खोजें', mr: 'खरेदीदार शोधा' },

  // Market Intelligence
  marketIntelligenceTitle: { en: 'Market Intelligence & AI Insights', hi: 'मंडी भाव विश्लेषण एवं एआई अंतर्दृष्टि', mr: 'बाजारभाव विश्लेषण व एआय अंतर्दृष्टी' },
  marketIntelligenceSubtitle: {
    en: 'Real-time APMC price benchmarks, spatial price trends, and predictive aggregation intelligence.',
    hi: 'वास्तविक समय APMC मूल्य बेंचमार्क, क्षेत्रीय मूल्य रुझान और पूर्व-अनुमानित एकत्रीकरण विश्लेषण।',
    mr: 'रिअल-टाइम APMC बाजारभाव, प्रादेशिक कल आणि पूर्वानुमानाधारित शेतमाल विश्लेषण.'
  },
  priceTrendsTitle: { en: '7-Day APMC Price Trends (₹/Quintal)', hi: '7-दिवसीय एपीएमसी मूल्य रुझान (₹/क्विंटल)', mr: '७-दिवसीय APMC बाजारभाव कल (₹/क्विंटल)' },
  priceTrendsSubtitle: {
    en: 'Comparing Local Nashik Mandi vs Institutional Direct FPO Price',
    hi: 'स्थानीय नासिक मंडी बनाम संस्थागत प्रत्यक्ष एफपीओ मूल्य की तुलना',
    mr: 'स्थानिक नाशिक बाजारभाव वि. संस्थात्मक थेट एफपीओ भावाची तुलना'
  },
  fpoPremiumBadge: { en: '+5.8% FPO Premium', hi: '+5.8% एफपीओ प्रीमियम', mr: '+५.८% एफपीओ नफा' },
  aiAgriIntelligenceBadge: { en: 'AI AGRI-INTELLIGENCE', hi: 'एआई कृषि-विश्लेषण', mr: 'एआय कृषी-विश्लेषण' },
  collectiveSellingOpportunity: { en: 'Collective Selling Opportunity', hi: 'सामूहिक बिक्री का बेहतरीन अवसर', mr: 'सामूहिक विक्रीची सुवर्णसंधी' },
  aiQuoteText: {
    en: '“Demand for Wheat is high in Pune. Aggregating 25 tons can improve buyer interest and negotiation power.”',
    hi: '“पुणे में गेहूं की मांग अधिक है। 25 टन एकत्र करने से खरीदारों की रुचि और मोलभाव शक्ति बढ़ सकती है।”',
    mr: '“पुण्यात गव्हाची मागणी जास्त आहे. २५ टन एकत्र केल्यास खरेदीदारांचा रस आणि वाटाघाटीची ताकद वाढेल.”'
  },
  expectedPriceRangeLabel: { en: 'Expected Price Range', hi: 'अपेक्षित मूल्य दायरा', mr: 'अपेक्षित भाव मर्यादा' },
  confidenceScoreLabel: { en: 'Confidence Score', hi: 'मॉडल सटीकता स्कोर', mr: 'अचूकता विश्वासार्हता' },
  viewAiForecastBtn: { en: 'View AI Forecast', hi: 'एआई पूर्वानुमान देखें', mr: 'एआय अंदाज पहा' },

  // Buyer Offers
  verifiedBuyerOffersTitle: { en: 'Verified Institutional Buyer Offers', hi: 'सत्यापित संस्थागत खरीदार के ऑफर', mr: 'सत्यापित संस्थात्मक खरेदीदारांच्या ऑफर्स' },
  verifiedBuyerOffersSubtitle: {
    en: 'Direct contracts and live bidding from KYC-verified food processors and exporters.',
    hi: 'केवाईसी-सत्यापित खाद्य प्रसंस्करणकर्ताओं और निर्यातकों से सीधे अनुबंध एवं लाइव बोलियां।',
    mr: 'KYC-सत्यापित फूड प्रोसेसर्स आणि निर्यातदारांकडून थेट कंत्राटे व थेट बोली.'
  },
  compareOffersBtn: { en: 'Compare Offers', hi: 'ऑफर की तुलना करें', mr: 'ऑफर्सची तुलना करा' },
  activeOfferBadge: { en: 'Active Offer', hi: 'सक्रिय ऑफर', mr: 'सक्रिय ऑफर' },
  topBidderBadge: { en: 'Top Bidder', hi: 'सर्वोच्च बोलीदाता', mr: 'सर्वोच्च बोलीदार' },
  exportGradeBadge: { en: 'Export Grade', hi: 'निर्यात ग्रेड', mr: 'निर्यात प्रत' },
  commodityLabel: { en: 'Commodity', hi: 'जिंस / फसल', mr: 'शेतमाल / पीक' },
  offeredPriceLabel: { en: 'Offered Price', hi: 'प्रस्तावित दर', mr: 'ऑफर केलेला भाव' },
  deliveryTermsLabel: { en: 'Delivery Terms', hi: 'वितरण शर्तें', mr: 'डिलिव्हरी अटी' },
  paymentTermsLabel: { en: 'Payment Terms', hi: 'भुगतान शर्तें', mr: 'पेमेंट अटी' },
  viewOfferBtn: { en: 'View Offer', hi: 'ऑफर देखें', mr: 'ऑफर पहा' },
  acceptOfferBtn: { en: 'Accept Offer', hi: 'ऑफर स्वीकार करें', mr: 'ऑफर स्वीकारा' },
  counterOfferBtn: { en: 'Counter Offer', hi: 'काउंटर ऑफर', mr: 'काउंटर ऑफर' },

  // Orders & Logistics
  ordersAndLogisticsTitle: { en: 'Orders & Logistics Fulfillment', hi: 'ऑर्डर एवं लॉजिस्टिक्स पूर्ति', mr: 'ऑर्डर्स आणि वाहतूक पूर्तता' },
  ordersAndLogisticsSubtitle: {
    en: 'Live dispatch tracking, transporter assignment, and digital proof-of-delivery.',
    hi: 'लाइव प्रेषण ट्रैकिंग, ट्रांसपोर्टर आवंटन और डिजिटल डिलीवरी प्रमाण।',
    mr: 'थेट वाहन ट्रॅकिंग, वाहतूकदार वाटप आणि डिजिटल पोचपावती.'
  },
  activeShipmentBadge: { en: '1 Active Shipment in Transit', hi: '1 शिपमेंट मार्ग में सक्रिय है', mr: '१ वाहतूक मार्गात सक्रिय आहे' },
  buyerConfirmedStep: { en: '✓ Buyer Confirmed', hi: '✓ खरीदार द्वारा पुष्टि', mr: '✓ खरेदीदाराकडून पुष्टी' },
  transportAssignedStep: { en: '✓ Transport Assigned', hi: '✓ ट्रांसपोर्टर आवंटित', mr: '✓ वाहतूकदार नियुक्त' },
  pickupInProgressStep: { en: '○ Pickup (In Progress)', hi: '○ पिकअप (प्रगति पर)', mr: '○ पिकअप (चालू आहे)' },
  deliveryStep: { en: '○ Delivery', hi: '○ वितरण', mr: '○ वितरण' },
  paymentStep: { en: '○ Payment', hi: '○ भुगतान', mr: '○ पेमेंट' },
  callDriverBtn: { en: 'Call Driver', hi: 'ड्राइवर को कॉल करें', mr: 'चालकाला कॉल करा' },
  trackLiveBtn: { en: 'Track Live', hi: 'लाइव ट्रैक करें', mr: 'थेट ट्रॅक करा' },
  dispatchTelemetryTitle: { en: 'Dispatch Telemetry', hi: 'प्रेषण टेलीमेट्री एवं वजन', mr: 'वाहतूक व वजन माहिती' },
  dispatchTelemetrySubtitle: { en: 'Aggregated metrics for current dispatch batch', hi: 'वर्तमान प्रेषण बैच के लिए एकत्रित मेट्रिक्स', mr: 'सध्याच्या वाहतूक तुकडीची एकत्रित माहिती' },
  netWeighbridgeWeightLabel: { en: 'Net Weighbridge Weight', hi: 'धर्मकांटा शुद्ध वजन', mr: 'वजनकाट्यावरील निव्वळ वजन' },
  ewayBillStatusLabel: { en: 'e-Way Bill Status', hi: 'ई-वे बिल स्थिति', mr: 'ई-वे बिल स्थिती' },
  estimatedTransitTimeLabel: { en: 'Estimated Transit Time', hi: 'अनुमानित यात्रा समय', mr: 'अंदाजित प्रवास वेळ' },
  escrowPayoutLabel: { en: 'Escrow Payout upon Delivery', hi: 'वितरण पर एस्क्रो भुगतान', mr: 'डिलिव्हरीनंतर एस्क्रो पेमेंट' },

  // Performance Analytics
  performanceAnalyticsTitle: { en: 'FPO Performance Analytics', hi: 'एफपीओ प्रदर्शन विश्लेषण', mr: 'एफपीओ कामगिरी विश्लेषण' },
  performanceAnalyticsSubtitle: {
    en: 'Financial overview, member impact metrics, and aggregation volume trends.',
    hi: 'वित्तीय अवलोकन, सदस्य प्रभाव मेट्रिक्स और एकत्रीकरण मात्रा के रुझान।',
    mr: 'आर्थिक आढावा, शेतकरी फायदा आणि शेतमाल एकत्रीकरणाचा कल.'
  },
  exportPdfReportBtn: { en: 'Export PDF Report', hi: 'पीडीएफ रिपोर्ट डाउनलोड करें', mr: 'PDF अहवाल डाउनलोड करा' },
  totalFarmersOnboardedLabel: { en: 'Total Farmers Onboarded', hi: 'कुल पंजीकृत किसान', mr: 'एकूण जोडलेले शेतकरी' },
  totalProduceSoldLabel: { en: 'Total Produce Sold', hi: 'कुल बेची गई उपज', mr: 'एकूण विकलेला शेतमाल' },
  averageSellingPriceLabel: { en: 'Average Selling Price', hi: 'औसत बिक्री मूल्य', mr: 'सरासरी विक्री भाव' },
  revenueGeneratedLabel: { en: 'Revenue Generated', hi: 'कुल अर्जित राजस्व', mr: 'मिळालेला एकूण महसूल' },
  priceImprovementLabel: { en: 'Price Improvement', hi: 'किसानों का मूल्य सुधार', mr: 'शेतकऱ्यांचा नफा वाढ' },
  higherNetRealizationSub: { en: 'Higher Net Realization', hi: 'उच्चतर शुद्ध प्राप्ति', mr: 'जास्त निव्वळ नफा' },
  monthlyVolumeRevenueTitle: { en: 'Monthly Aggregation Volume & Revenue (2026)', hi: 'मासिक एकत्रीकरण मात्रा एवं राजस्व (2026)', mr: 'मासिक शेतमाल एकत्रीकरण व महसूल (२०२६)' },
  monthlyVolumeRevenueSubtitle: { en: 'Tons aggregated vs Total realization in Lakhs', hi: 'एकत्रित टन बनाम लाख रुपयों में कुल प्राप्ति', mr: 'गोळा केलेले टन वि. लाखांमधील एकूण उत्पन्न' },
  commodityShareTitle: { en: 'Commodity Share Breakdown', hi: 'फसलवार प्रतिशत वितरण', mr: 'पीकनिहाय वाटा वितरण' },
  commodityShareSubtitle: { en: 'Share of 128.5 Tons aggregated', hi: 'एकत्रित 128.5 टन का आनुपातिक वितरण', mr: 'एकत्रित १२८.५ टनांमधील प्रमाण' },

  // Modals
  addFarmerModalTitle: { en: '👨‍🌾 Add Farmer Member', hi: '👨‍🌾 किसान सदस्य जोड़ें', mr: '👨‍🌾 शेतकरी सदस्य जोडा' },
  farmerFullNameLabel: { en: 'Farmer Full Name *', hi: 'किसान का पूरा नाम *', mr: 'शेतकऱ्याचे पूर्ण नाव *' },
  villageTalukaLabel: { en: 'Village / Taluka *', hi: 'गांव / तालुका *', mr: 'गाव / तालुका *' },
  phoneNumberLabel: { en: 'Phone Number *', hi: 'फोन नंबर *', mr: 'फोन नंबर *' },
  cropContributionLabel: { en: 'Crop Contribution *', hi: 'फसल योगदान *', mr: 'पीक योगदान *' },
  quantityInputLabel: { en: 'Quantity (Quintals/Tons) *', hi: 'मात्रा (क्विंटल/टन) *', mr: 'प्रमाण (क्विंटल/टन) *' },
  qualityGradeLabel: { en: 'Quality Grade', hi: 'गुणवत्ता ग्रेड', mr: 'गुणवत्ता प्रत (ग्रेड)' },
  assignToLotLabel: { en: 'Assign to Lot', hi: 'लॉट में असाइन करें', mr: 'लॉटमध्ये समाविष्ट करा' },
  saveFarmerRecordBtn: { en: 'Save Farmer Record', hi: 'किसान रिकॉर्ड सहेजें', mr: 'शेतकरी नोंद सेव्ह करा' },
  aiForecastModalTitle: { en: '✨ AI Agri-Forecast & Price Prediction', hi: '✨ एआई कृषि-पूर्वानुमान एवं मूल्य भविष्यवाणी', mr: '✨ एआय कृषी-अंदाज व भाव भाकीत' },
  highDemandWindow: { en: 'High Demand Window: Next 14 Days', hi: 'उच्च मांग की अवधि: आगामी 14 दिन', mr: 'जास्त मागणीचा कालावधी: पुढील १४ दिवस' },
  optimalSellingHubLabel: { en: 'Optimal Selling Hub', hi: 'इष्टतम बिक्री केंद्र', mr: 'उत्तम विक्री केंद्र' },
  predictedPriceBandLabel: { en: 'Predicted Price Band', hi: 'अनुमानित मूल्य दायरा', mr: 'अंदाजित भाव मर्यादा' },
  matchBuyersBtn: { en: 'Match Buyers for this Forecast', hi: 'इस पूर्वानुमान के खरीदार खोजें', mr: 'या अंदाजासाठी खरेदीदार शोधा' }
};

if (!en.fpo) en.fpo = {};
if (!hi.fpo) hi.fpo = {};
if (!mr.fpo) mr.fpo = {};

Object.keys(fpoTranslations).forEach(key => {
  en.fpo[key] = fpoTranslations[key].en;
  hi.fpo[key] = fpoTranslations[key].hi;
  mr.fpo[key] = fpoTranslations[key].mr;
});

// Also add shorthand aliases in fpo if needed
const aliases = {
  nav_dashboard: 'navDashboard',
  nav_farmers: 'navFarmers',
  nav_lots: 'navLots',
  nav_market: 'navMarket',
  nav_buyers: 'navBuyers',
  nav_orders: 'navOrders',
  nav_analytics: 'navAnalytics',
  hero_badge: 'fpoCommandCenter',
  hero_title: 'fpoCommandCenter',
  hero_sub: 'fpoHeroSubtitle',
  meta_fpo: 'fpoName',
  meta_loc: 'location',
  meta_farmers: 'registeredFarmers',
  meta_produce: 'totalProduceAggregated',
  meta_buyers: 'activeBuyers',
  kpi_farmers: 'farmersCountLabel',
  kpi_produce: 'aggregatedProduceLabel',
  kpi_lots: 'activeLotsCountLabel',
  kpi_offers: 'buyerOffersCountLabel',
  sec_farmers: 'farmerMembersTitle',
  sec_farmers_sub: 'farmerMembersSubtitle',
  btn_add_farmer: 'addFarmerBtn',
  btn_view_all_farmers: 'viewAllFarmersBtn',
  th_name: 'farmerNameTh',
  th_crop: 'cropTh',
  th_quantity: 'quantityTh',
  th_lot_status: 'lotStatusTh',
  th_quality: 'qualityTh',
  th_status: 'statusTh',
  sec_lots: 'aggregatedLotsTitle',
  sec_lots_sub: 'aggregatedLotsSubtitle',
  sec_market: 'marketIntelligenceTitle',
  sec_market_sub: 'marketIntelligenceSubtitle',
  ai_headline: 'collectiveSellingOpportunity',
  ai_quote: 'aiQuoteText',
  btn_ai_forecast: 'viewAiForecastBtn',
  sec_buyers: 'verifiedBuyerOffersTitle',
  sec_buyers_sub: 'verifiedBuyerOffersSubtitle',
  sec_orders: 'ordersAndLogisticsTitle',
  sec_orders_sub: 'ordersAndLogisticsSubtitle',
  sec_analytics: 'performanceAnalyticsTitle',
  sec_analytics_sub: 'performanceAnalyticsSubtitle',
  metric_onboarded: 'totalFarmersOnboardedLabel',
  metric_sold: 'totalProduceSoldLabel',
  metric_avg_price: 'averageSellingPriceLabel',
  metric_revenue: 'revenueGeneratedLabel',
  metric_improvement: 'priceImprovementLabel'
};

Object.keys(aliases).forEach(alias => {
  const targetKey = aliases[alias];
  en.fpo[alias] = fpoTranslations[targetKey].en;
  hi.fpo[alias] = fpoTranslations[targetKey].hi;
  mr.fpo[alias] = fpoTranslations[targetKey].mr;
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2), 'utf8');

console.log('Complete FPO translations added successfully to en.json, hi.json, and mr.json!');
