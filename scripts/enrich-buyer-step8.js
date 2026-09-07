const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'src', 'locales', 'en.json');
const hiPath = path.join(__dirname, '..', 'src', 'locales', 'hi.json');
const mrPath = path.join(__dirname, '..', 'src', 'locales', 'mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

const buyerTranslations = {
  // Dashboard & Hero
  procurementCommandCenter: { en: 'Procurement Command Center', hi: 'खरीद कमान केंद्र', mr: 'खरेदी कमांड सेंटर' },
  dashboardSubtitle: {
    en: 'Manage your agricultural procurement, active contracts, and escrow settlements.',
    hi: 'अपनी कृषि खरीद, सक्रिय अनुबंध और एस्क्रो भुगतान प्रबंधित करें।',
    mr: 'आपली कृषी खरेदी, सक्रिय करार आणि एस्क्रो खाती व्यवस्थापित करा.'
  },
  browseMarketplace: { en: 'Browse Marketplace', hi: 'मंडी बाजार ब्राउज़ करें', mr: 'बाजारपेठ पहा' },
  newInquiry: { en: 'New Inquiry', hi: 'नई पूछताछ', mr: 'नवीन विचारणा' },
  viewOrders: { en: 'View Orders', hi: 'ऑर्डर देखें', mr: 'ऑर्डर्स पहा' },
  activeInquiries: { en: 'Active Inquiries', hi: 'सक्रिय पूछताछ', mr: 'सक्रिय विचारणा' },
  negotiationsInProgress: { en: 'Negotiations in progress', hi: 'सौदा वार्ता प्रगति पर है', mr: 'वाटाघाटी चालू आहेत' },
  confirmedOrders: { en: 'Confirmed Orders', hi: 'पुष्टि किए गए ऑर्डर', mr: 'निश्चित ऑर्डर्स' },
  awaitingFulfillment: { en: 'Awaiting fulfillment', hi: 'आपूर्ति की प्रतीक्षा में', mr: 'पूर्ततेच्या प्रतीक्षेत' },
  inTransit: { en: 'In Transit', hi: 'मार्ग में', mr: 'मार्गात' },
  activeShipments: { en: 'Active shipments moving', hi: 'सक्रिय प्रेषण वाहन गतिमान', mr: 'सक्रिय वाहतूक सुरू आहे' },
  escrowInVault: { en: 'Escrow in Vault', hi: 'सुरक्षित एस्क्रो राशि', mr: 'सुरक्षित एस्क्रो रक्कम' },
  lockedForDeals: { en: 'Locked for active deals', hi: 'सक्रिय सौदों हेतु सुरक्षित', mr: 'सक्रिय सौद्यांसाठी आरक्षित' },
  marketLotsAvailable: { en: 'Market Lots Available', hi: 'उपलब्ध फसल लॉट्स', mr: 'उपलब्ध शेतमाल लॉट्स' },
  freshProduceListed: { en: 'Fresh produce listed today', hi: 'आज सूचीबद्ध ताजा शेतमाल', mr: 'आज सूचीबद्ध ताजी पिके' },
  quickActions: { en: 'Direct Procurement & Actions', hi: 'प्रत्यक्ष खरीद एवं त्वरित कार्रवाइयां', mr: 'थेट खरेदी आणि जलद कृती' },
  postCustomRequirement: { en: 'Post Custom Requirement', hi: 'कस्टम खरीद मांग पोस्ट करें', mr: 'खरेदीची मागणी नोंदवा' },
  landedCostCalculator: { en: 'Landed Cost Calculator', hi: 'वितरण लागत कैलकुलेटर', mr: 'एकूण पोच खर्च गणक' },
  producerDirectory: { en: 'Producer Directory', hi: 'उत्पादक किसान एवं एफपीओ निर्देशिका', mr: 'शेतकरी व एफपीओ यादी' },
  recommendedForYou: { en: 'Recommended For Your Requirements', hi: 'आपकी खरीद आवश्यकताओं के अनुसार अनुशंसित', mr: 'आपल्या गरजेनुसार शिफारसी' },

  // Marketplace & Filters
  marketplaceTitle: { en: 'Agricultural Produce Marketplace', hi: 'कृषि उपज बाजार', mr: 'कृषी शेतमाल बाजारपेठ' },
  marketplaceSubtitle: {
    en: 'Verified farm-gate & warehouse produce lots available for immediate contract locking.',
    hi: 'तत्काल अनुबंध हेतु सत्यापित फार्म-गेट एवं गोदाम उपज लॉट्स।',
    mr: 'थेट शेतातून व गोदामातून खरेदीसाठी सत्यापित शेतमाल लॉट्स.'
  },
  quickFilters: { en: 'Quick Filters', hi: 'त्वरित फ़िल्टर', mr: 'जलद फिल्टर्स' },
  allLots: { en: 'All Lots', hi: 'सभी लॉट्स', mr: 'सर्व लॉट्स' },
  gradeAPremium: { en: 'Grade A Premium', hi: 'ग्रेड A प्रीमियम', mr: 'ग्रेड A दर्जेदार' },
  fpoAggregated: { en: 'FPO Aggregated', hi: 'एफपीओ एकत्रित', mr: 'एफपीओ एकत्रित' },
  organicCertified: { en: 'Organic Certified', hi: 'जैविक प्रमाणित', mr: 'सेंद्रिय प्रमाणित' },
  discountedDeals: { en: 'Discounted Deals', hi: 'विशेष छूट सौदे', mr: 'विशेष सवलत सौदे' },
  warehouseStored: { en: 'WDRA Warehouse Stored', hi: 'गोदाम भंडारित', mr: 'गोदाम साठवणूक' },
  filterByCommodity: { en: 'Filter by Commodity', hi: 'फसल / जिंस अनुसार फ़िल्टर', mr: 'पिकानुसार फिल्टर' },
  filterByLocation: { en: 'Filter by State / District', hi: 'राज्य / जिला अनुसार फ़िल्टर', mr: 'राज्य / जिल्हा फिल्टर' },
  filterByQuality: { en: 'Quality Grade', hi: 'गुणवत्ता ग्रेड', mr: 'गुणवत्ता प्रत' },
  sellerType: { en: 'Seller Type', hi: 'विक्रेता का प्रकार', mr: 'विक्रेत्याचा प्रकार' },
  quantityRange: { en: 'Quantity Range', hi: 'मात्रा का दायरा', mr: 'प्रमाणाची मर्यादा' },
  priceRange: { en: 'Max Asking Price (₹/q)', hi: 'अधिकतम मूल्य (₹/क्विंटल)', mr: 'कमाल भाव (₹/क्विंटल)' },
  sortBy: { en: 'Sort By', hi: 'क्रमबद्ध करें', mr: 'क्रमवारी लावा' },
  sortRecommended: { en: 'Recommended', hi: 'अनुशंसित', mr: 'शिफारस केलेले' },
  sortPriceLowHigh: { en: 'Price: Low to High', hi: 'मूल्य: कम से अधिक', mr: 'भाव: कमी ते जास्त' },
  sortPriceHighLow: { en: 'Price: High to Low', hi: 'मूल्य: अधिक से कम', mr: 'भाव: जास्त ते कमी' },
  sortQuantityHighLow: { en: 'Quantity: High to Low', hi: 'मात्रा: अधिक से कम', mr: 'प्रमाण: जास्त ते कमी' },
  sortNewest: { en: 'Newest First', hi: 'नवीनतम पहले', mr: 'नवीनतम प्रथम' },
  inspectAndBuy: { en: 'Inspect & Buy', hi: 'जांचें एवं खरीदें', mr: 'तपासा आणि खरेदी करा' },
  sendInquiry: { en: 'Send Purchase Inquiry', hi: 'खरीद पूछताछ भेजें', mr: 'खरेदी विचारणा पाठवा' },
  noLotsFound: { en: 'No Produce Lots Found', hi: 'कोई फसल लॉट नहीं मिला', mr: 'कोणतेही शेतमाल लॉट्स आढळले नाहीत' },
  noLotsFoundDesc: {
    en: 'Try adjusting your filter parameters or search terms to discover available listings.',
    hi: 'उपलब्ध सूचियां देखने के लिए अपने फ़िल्टर मापदंड या खोज शब्द समायोजित करें।',
    mr: 'उपलब्ध शेतमाल पाहण्यासाठी आपले फिल्टर्स किंवा शोध शब्द बदला.'
  },

  // Lot Details & Landed Cost
  lotSpecifications: { en: 'Produce Lot Specifications', hi: 'फसल लॉट विनिर्देश', mr: 'शेतमाल लॉट तपशील' },
  qualityAssayParams: { en: 'Assayed Quality Parameters', hi: 'परीक्षित गुणवत्ता मापदंड', mr: 'तपासलेले गुणवत्ता निकष' },
  originLocation: { en: 'Origin Location', hi: 'उत्पत्ति स्थान', mr: 'मूळ स्थान' },
  sellerDetails: { en: 'Producer / Seller Details', hi: 'उत्पादक / विक्रेता विवरण', mr: 'उत्पादक / विक्रेता तपशील' },
  landedCostTitle: { en: 'Live Landed Cost Breakdown', hi: 'वितरण सहित कुल लागत विश्लेषण', mr: 'पोच खर्चाचे संपूर्ण विश्लेषण' },
  baseCropCost: { en: 'Base Produce Cost', hi: 'मूल फसल मूल्य', mr: 'शेतमालाचा मूळ भाव' },
  freightCost: { en: 'Transport Freight Charges', hi: 'परिवहन मालभाड़ा', mr: 'वाहतूक खर्च' },
  assayingFee: { en: 'Quality Assaying & Handling', hi: 'गुणवत्ता परीक्षण एवं हैंडलिंग', mr: 'गुणवत्ता तपासणी व हमाली' },
  mandiCessFee: { en: 'Platform & Mandi Cess', hi: 'मंडी उपकर एवं प्लेटफॉर्म शुल्क', mr: 'बाजार उपकर व प्लॅटफॉर्म शुल्क' },
  totalLandedCost: { en: 'Total Landed Cost', hi: 'कुल वितरण लागत', mr: 'एकूण पोच खर्च' },
  perQuintal: { en: 'per Quintal', hi: 'प्रति क्विंटल', mr: 'प्रति क्विंटल' },
  instantLockDeal: { en: 'Instant Buy & Lock Contract', hi: 'तुरंत खरीदें एवं अनुबंध लॉक करें', mr: 'त्वरित खरेदी करा व करार निश्चित करा' },

  // Inquiries & Direct Negotiations
  myInquiriesTitle: { en: 'My Procurement Inquiries & Offers', hi: 'मेरी खरीद पूछताछ एवं बातचीत', mr: 'माझ्या खरेदी विचारणा व ऑफर्स' },
  myInquiriesSubtitle: {
    en: 'Track price negotiations, counter-offers, and deal acceptances with farmers & FPOs.',
    hi: 'किसानों और एफपीओ के साथ मूल्य वार्ता, काउंटर ऑफर और सौदों की स्थिति ट्रैक करें।',
    mr: 'शेतकरी व एफपीओसोबत भावावरील चर्चा, काउंटर ऑफर्स आणि सौद्यांचा मागोवा घ्या.'
  },
  pendingInquiries: { en: 'Pending Inquiries', hi: 'लंबित पूछताछ', mr: 'प्रलंबित विचारणा' },
  counterOffered: { en: 'Counter-Offered', hi: 'काउंटर ऑफर प्राप्त', mr: 'काउंटर ऑफर मिळालेले' },
  acceptedDeals: { en: 'Accepted Deals', hi: 'स्वीकृत सौदे', mr: 'मंजूर झालेले सौदे' },
  declinedInquiries: { en: 'Declined', hi: 'अस्वीकृत', mr: 'नाकारलेले' },
  submitCounterOffer: { en: 'Submit Counter-Offer', hi: 'काउंटर ऑफर भेजें', mr: 'काउंटर ऑफर पाठवा' },
  acceptDeal: { en: 'Accept Deal & Proceed to Order', hi: 'सौदा स्वीकारें एवं ऑर्डर जारी करें', mr: 'सौदा स्वीकारा आणि ऑर्डर द्या' },
  negotiationTimeline: { en: 'Negotiation Timeline', hi: 'बातचीत की समयरेखा', mr: 'वाटाघाटीचा घटनाक्रम' },

  // Orders & Logistics
  buyerOrdersTitle: { en: 'Confirmed Procurement Orders', hi: 'पुष्टि किए गए खरीद ऑर्डर', mr: 'निश्चित खरेदी ऑर्डर्स' },
  buyerOrdersSubtitle: {
    en: 'Manage order fulfillment stages, transporter coordination, and escrow disbursement.',
    hi: 'ऑर्डर पूर्ति चरण, ट्रांसपोर्टर समन्वय और एस्क्रो भुगतान जारी करने का प्रबंधन करें।',
    mr: 'ऑर्डर पूर्तता टप्पे, वाहतूक समन्वय आणि एस्क्रो पेमेंट वितरण व्यवस्थापित करा.'
  },
  escrowLifecycle: { en: 'Escrow Lifecycle Stepper', hi: 'एस्क्रो जीवनचक्र चरण', mr: 'एस्क्रो जीवनचक्र टप्पे' },
  carrierTelemetry: { en: 'Assigned Transporter & Telemetry', hi: 'आवंटित ट्रांसपोर्टर एवं ट्रैकिंग', mr: 'नियुक्त वाहतूकदार आणि ट्रॅकिंग' },
  confirmDeliveryReleaseEscrow: { en: 'Confirm Delivery & Release Escrow', hi: 'वितरण की पुष्टि करें और एस्क्रो जारी करें', mr: 'डिलिव्हरीची पुष्टी करा आणि एस्क्रो पेमेंट द्या' },
  downloadInvoice: { en: 'Download Tax Invoice', hi: 'टैक्स इनवॉइस डाउनलोड करें', mr: 'कर पावती (Invoice) डाउनलोड करा' },

  // Directory
  directoryTitle: { en: 'Producer & FPO Directory', hi: 'उत्पादक किसान एवं एफपीओ निर्देशिका', mr: 'शेतकरी व एफपीओ यादी' },
  directorySubtitle: {
    en: 'Browse KYC-verified farmers, FPC clusters, and cooperative societies.',
    hi: 'केवाईसी-सत्यापित किसानों, एफपीसी समूहों और सहकारी समितियों की सूची देखें।',
    mr: 'KYC-सत्यापित शेतकरी, एफपीसी आणि सहकारी संस्थांची यादी पहा.'
  },
  allProducers: { en: 'All Producers', hi: 'सभी उत्पादक', mr: 'सर्व उत्पादक' },
  fpoClusters: { en: 'FPO Clusters', hi: 'एफपीओ क्लस्टर', mr: 'एफपीओ गट' },
  progressiveFarmers: { en: 'Progressive Farmers', hi: 'प्रगतिशील किसान', mr: 'प्रगतिशील शेतकरी' },
  totalMembers: { en: 'Total Members', hi: 'कुल सदस्य', mr: 'एकूण सदस्य' },
  cultivatedAcreage: { en: 'Cultivated Land', hi: 'कृषि भूमि', mr: 'शेती क्षेत्र' },
  majorCommodities: { en: 'Major Commodities', hi: 'मुख्य फसलें', mr: 'मुख्य पिके' },

  // Escrow Vault
  escrowVaultTitle: { en: 'Escrow Vault & Settlement Ledger', hi: 'एस्क्रो वॉल्ट एवं भुगतान खाता', mr: 'एस्क्रो व्हॉल्ट आणि पेमेंट खाते' },
  escrowVaultSubtitle: {
    en: '100% secure collateralized agri-settlements with automated bank payouts upon delivery verification.',
    hi: 'डिलीवरी सत्यापन पर स्वचालित बैंक भुगतान के साथ 100% सुरक्षित कृषि-भुगतान।',
    mr: 'डिलिव्हरी पडताळणीनंतर स्वयंचलित बँक वितरणासह १००% सुरक्षित पेमेंट.'
  },
  totalVaultBalance: { en: 'Total Vault Balance', hi: 'कुल वॉल्ट शेष', mr: 'एकूण व्हॉल्ट शिल्लक' },
  lockedInEscrow: { en: 'Locked in Escrow', hi: 'एस्क्रो में आरक्षित', mr: 'एस्क्रोमध्ये आरक्षित' },
  disbursedToFarmers: { en: 'Disbursed to Farmers', hi: 'किसानों को भुगतान किया गया', mr: 'शेतकऱ्यांना वितरित रक्कम' },
  refundedBalance: { en: 'Refunded to Buyer', hi: 'वापस की गई राशि', mr: 'परत मिळालेली रक्कम' },
  transactionHistory: { en: 'Transaction History', hi: 'लेन-देन का इतिहास', mr: 'व्यवहारांचा इतिहास' },

  // Profile & KYC
  buyerProfile: { en: 'Business Profile & Settings', hi: 'व्यावसायिक प्रोफाइल एवं सेटिंग्स', mr: 'व्यावसायिक प्रोफाइल आणि सेटिंग्ज' },
  kycVerification: { en: 'AgriStack & KYC Verification', hi: 'एग्रीस्टैक एवं केवाईसी सत्यापन', mr: 'अ‍ॅग्रीस्टॅक आणि KYC पडताळणी' },
  companyDetails: { en: 'Enterprise Information', hi: 'कंपनी / प्रतिष्ठान विवरण', mr: 'कंपनी / संस्था तपशील' },
  gstinVerified: { en: 'GSTIN Registration (Verified ✓)', hi: 'जीएसटी पंजीकरण (सत्यापित ✓)', mr: 'GST नोंदणी (सत्यापित ✓)' },
  fssaiVerified: { en: 'FSSAI Food Safety License', hi: 'एफएसएसएआई खाद्य सुरक्षा लाइसेंस', mr: 'FSSAI अन्न सुरक्षा परवाना' },
  bankAccountDetails: { en: 'Escrow Linked Settlement Account', hi: 'एस्क्रो से जुड़ा निपटान बैंक खाता', mr: 'एस्क्रो संलग्न बँक खाते' },
  negotiateRate: { en: 'Negotiate Rate', hi: 'दर पर बातचीत करें', mr: 'भावावर चर्चा करा' }
};

if (!en.buyer) en.buyer = {};
if (!hi.buyer) hi.buyer = {};
if (!mr.buyer) mr.buyer = {};

Object.keys(buyerTranslations).forEach(k => {
  en.buyer[k] = buyerTranslations[k].en;
  hi.buyer[k] = buyerTranslations[k].hi;
  mr.buyer[k] = buyerTranslations[k].mr;
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2), 'utf8');

console.log('Complete Buyer translations enriched in en.json, hi.json, and mr.json!');
