const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'src', 'locales', 'en.json');
const hiPath = path.join(__dirname, '..', 'src', 'locales', 'hi.json');
const mrPath = path.join(__dirname, '..', 'src', 'locales', 'mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

// Storage Domain Translations
const storageTranslations = {
  // Registration & Onboarding
  storageOwner: { en: 'Storage Owner', hi: 'गोदाम मालिक', mr: 'गोदाम मालक' },
  storageOwnerBadge: { en: 'STORAGE OWNER', hi: 'गोदाम मालिक', mr: 'गोदाम मालक' },
  storageOwnerRegistration: { en: 'Storage Owner Registration', hi: 'भंडारण मालिक पंजीकरण', mr: 'गोदाम मालक नोंदणी' },
  registerAsStorageOwner: { en: 'Register as Storage Owner / Warehouse Operator', hi: 'भंडारण मालिक / गोदाम संचालक के रूप में पंजीकरण करें', mr: 'गोदाम मालक / वेअरहाऊस ऑपरेटर म्हणून नोंदणी करा' },
  ownerName: { en: 'Owner / Manager Name', hi: 'मालिक / प्रबंधक का नाम', mr: 'मालक / व्यवस्थापकाचे नाव' },
  ownerNamePlaceholder: { en: 'e.g. Suresh Kulkarni', hi: 'उदा. सुरेश कुलकर्णी', mr: 'उदा. सुरेश कुलकर्णी' },
  facilityName: { en: 'Storage Facility Name', hi: 'भंडारण सुविधा का नाम', mr: 'गोदाम / साठवणूक केंद्राचे नाव' },
  facilityNamePlaceholder: { en: 'e.g. MSWC Warehouse — Pune Hub', hi: 'उदा. एमएसडब्ल्यूसी गोदाम — पुणे हब', mr: 'उदा. एमएसडब्ल्यूसी वेअरहाऊस — पुणे हब' },
  facilityType: { en: 'Facility Type', hi: 'सुविधा का प्रकार', mr: 'साठवणूक केंद्राचा प्रकार' },
  facilityTypeSelect: { en: 'Select Facility Type', hi: 'सुविधा का प्रकार चुनें', mr: 'साठवणूक केंद्राचा प्रकार निवडा' },
  warehouse: { en: 'Dry Warehouse / Godown', hi: 'सूखा गोदाम / वेअरहाऊस', mr: 'कोरडे गोदाम / वेअरहाऊस' },
  coldStorage: { en: 'Cold Storage / Cold Chain', hi: 'कोल्ड स्टोरेज / शीतगृह', mr: 'कोल्ड स्टोरेज / शीतगृह' },
  silo: { en: 'Scientific Grain Silo', hi: 'वैज्ञानिक अनाज साइलो', mr: 'वैज्ञानिक धान्य सायलो' },
  dryStorage: { en: 'Covered Dry Storage', hi: 'कवर्ड सूखा भंडारण', mr: 'संरक्षित कोरडी साठवणूक' },
  hermeticStorage: { en: 'Hermetic Airtight Storage', hi: 'वायुरुद्ध सीलबंद भंडारण', mr: 'हवाबंद सुरक्षित साठवणूक' },
  address: { en: 'Facility Address', hi: 'सुविधा का पता', mr: 'साठवणूक केंद्राचा पत्ता' },
  addressLine1: { en: 'Address Line 1 / Street', hi: 'पता पंक्ति 1 / मार्ग', mr: 'पत्ता ओळ 1 / रस्ता' },
  district: { en: 'District', hi: 'जिला', mr: 'जिल्हा' },
  state: { en: 'State', hi: 'राज्य', mr: 'राज्य' },
  taluka: { en: 'Taluka / Block', hi: 'तालुका / ब्लॉक', mr: 'तालुका / गट' },
  pincode: { en: 'PIN Code', hi: 'पिन कोड', mr: 'पिन कोड' },
  landmark: { en: 'Landmark / APMC Proximity', hi: 'सीमा चिन्ह / निकटतम मंडी', mr: 'जवळची खूण / बाजार समितीजवळ' },
  location: { en: 'Geographic Location & Coordinates', hi: 'भौगोलिक स्थान एवं निर्देशांक', mr: 'भौगोलिक स्थान व निर्देशक' },
  latitude: { en: 'Latitude', hi: 'अक्षांश (Latitude)', mr: 'अक्षांश (Latitude)' },
  longitude: { en: 'Longitude', hi: 'देशांतर (Longitude)', mr: 'रेखांश (Longitude)' },
  gpsCoordinates: { en: 'GPS Coordinates', hi: 'जीपीएस निर्देशांक', mr: 'जीपीएस निर्देशक' },
  useCurrentLocation: { en: 'Use Current Location', hi: 'वर्तमान स्थान का उपयोग करें', mr: 'वर्तमान स्थान वापरा' },
  capacity: { en: 'Storage Capacity', hi: 'भंडारण क्षमता', mr: 'साठवणूक क्षमता' },
  totalCapacity: { en: 'Total Storage Capacity', hi: 'कुल भंडारण क्षमता', mr: 'एकूण साठवणूक क्षमता' },
  availableCapacity: { en: 'Available Capacity', hi: 'उपलब्ध रिक्त क्षमता', mr: 'उपलब्ध मोकळी क्षमता' },
  occupiedCapacity: { en: 'Occupied Capacity', hi: 'उपयोग में ली गई क्षमता', mr: 'वापरात असलेली क्षमता' },
  capacityUnit: { en: 'Capacity Unit', hi: 'क्षमता इकाई', mr: 'क्षमता एकक' },
  metricTonnes: { en: 'Metric Tonnes (MT)', hi: 'मीट्रिक टन (MT)', mr: 'मेट्रिक टन (MT)' },
  quintals: { en: 'Quintals (q)', hi: 'क्विंटल (q)', mr: 'क्विंटल (q)' },
  bags: { en: 'Bags (50kg standard)', hi: 'बोरियां (50 किग्रा मानक)', mr: 'गोणी / पोती (50 किलो)' },
  storageRate: { en: 'Storage Tariff Rate', hi: 'भंडारण किराया दर', mr: 'साठवणूक भाडे दर' },
  storageRateUnit: { en: 'Rate Unit', hi: 'दर की इकाई', mr: 'दराचे एकक' },
  perBagMonth: { en: '₹ per bag / month', hi: '₹ प्रति बोरी / माह', mr: '₹ प्रति पोते / महिना' },
  perQuintalMonth: { en: '₹ per quintal / month', hi: '₹ प्रति क्विंटल / माह', mr: '₹ प्रति क्विंटल / महिना' },
  perTonMonth: { en: '₹ per tonne / month', hi: '₹ प्रति टन / माह', mr: '₹ प्रति टन / महिना' },
  perDayQuintal: { en: '₹ per day / quintal', hi: '₹ प्रति दिन / क्विंटल', mr: '₹ प्रति दिवस / क्विंटल' },
  handlingCharges: { en: 'Handling & In-Out Charges', hi: 'लोडिंग-अनलोडिंग एवं हैंडलिंग शुल्क', mr: 'हमाली व चढवणे-उतरवणे खर्च' },
  handlingRatePerQuintal: { en: 'Handling Charge (₹/quintal)', hi: 'हैंडलिंग शुल्क (₹/क्विंटल)', mr: 'हमाली शुल्क (₹/क्विंटल)' },
  supportedCrops: { en: 'Supported Crops & Commodities', hi: 'समर्थित फसलें एवं जिंस', mr: 'साठवणूक योग्य पिके व शेतमाल' },
  facilityFeatures: { en: 'Facility Features & Amenities', hi: 'सुविधा विशेषताएं एवं उपकरण', mr: 'केंद्रातील सुविधा व वैशिष्ट्ये' },
  temperatureControlled: { en: 'Temperature Controlled Chambers', hi: 'तापमान नियंत्रित कक्ष', mr: 'तापमान नियंत्रित खोल्या' },
  cctvSecurity: { en: '24/7 CCTV & Security Guarding', hi: '24/7 सीसीटीवी एवं सुरक्षा पहरा', mr: '24/7 सीसीटीव्ही व सुरक्षा रक्षक' },
  pestManagement: { en: 'Scientific Pest Management & Fumigation', hi: 'वैज्ञानिक कीट नियंत्रण एवं धूमन', mr: 'वैज्ञानिक कीड नियंत्रण व धुरीकरण' },
  weighbridgeOnsite: { en: '100T Electronic Weighbridge Onsite', hi: 'परिसर में 100 टन इलेक्ट्रॉनिक धर्मकांटा', mr: 'परिसरात 100 टन इलेक्ट्रॉनिक वजनकाटा' },
  assayingLab: { en: 'Quality Assaying Lab & Moisture Testing', hi: 'गुणवत्ता परीक्षण प्रयोगशाला व नमी मापक', mr: 'गुणवत्ता तपासणी प्रयोगशाळा व आर्द्रता मापक' },
  eNwrReady: { en: 'WDRA Negotiable e-NWR Ready', hi: 'डब्ल्यूडीआरए ई-एनडब्ल्यूआर रसीद सक्षम', mr: 'WDRA ई-एनडब्ल्यूआर पावती सक्षम' },
  railSiding: { en: 'Railway Siding Connectivity', hi: 'रेलवे साइडिंग कनेक्टिविटी', mr: 'रेल्वे साइडिंग जोडणी' },
  preCooling: { en: 'Rapid Pre-Cooling Unit', hi: 'तीव्र प्री-कूलिंग यूनिट', mr: 'जलद प्री-कूलिंग युनिट' },
  backupGenerators: { en: '100% Power Backup Generators', hi: '100% पावर बैकअप जनरेटर', mr: '100% वीज बॅकअप जनरेटर' },
  submitFacility: { en: 'Register Storage Facility', hi: 'भंडारण सुविधा पंजीकृत करें', mr: 'साठवणूक केंद्र नोंदणी करा' },
  addStorageFacilityModalTitle: { en: 'Add New Storage Facility', hi: 'नई भंडारण सुविधा जोड़ें', mr: 'नवीन साठवणूक केंद्र जोडा' },
  editStorageFacilityModalTitle: { en: 'Edit Storage Facility Configuration', hi: 'भंडारण सुविधा कॉन्फ़िगरेशन संपादित करें', mr: 'साठवणूक केंद्र माहिती संपादित करा' },

  // Dashboard & Metrics
  storageDashboardTitle: { en: 'Warehouse & Storage Infrastructure', hi: 'गोदाम एवं भंडारण अवसंरचना', mr: 'गोदाम व साठवणूक पायाभूत सुविधा' },
  storageDashboardSubtitle: {
    en: 'Monitor accredited warehouse capacities, cold chain facilities, tariffs, and farmer booking requests.',
    hi: 'सत्यापित गोदाम क्षमता, कोल्ड चेन सुविधाएं, दर और किसान भंडारण अनुरोधों का प्रबंधन करें।',
    mr: 'सत्यापित गोदाम क्षमता, शीतगृह सुविधा, दर आणि शेतकरी साठवणूक मागण्यांचे व्यवस्थापन करा.'
  },
  totalStorageCapacity: { en: 'Total Storage Capacity', hi: 'कुल भंडारण क्षमता', mr: 'एकूण साठवणूक क्षमता' },
  availableStorageSpace: { en: 'Available Storage Space', hi: 'उपलब्ध भंडारण स्थान', mr: 'उपलब्ध साठवणूक जागा' },
  storageRequests: { en: 'Storage Requests', hi: 'भंडारण अनुरोध', mr: 'साठवणूक विनंत्या' },
  activeStorage: { en: 'Active Storage Deposits', hi: 'सक्रिय भंडारण जमा', mr: 'सक्रिय साठवणूक ठेवी' },
  completedStorage: { en: 'Completed Storage', hi: 'पूर्ण भंडारण', mr: 'पूर्ण झालेली साठवणूक' },
  facilityStatus: { en: 'Facility Status', hi: 'सुविधा स्थिति', mr: 'केंद्राची स्थिती' },
  averageUtilization: { en: 'Average Utilization', hi: 'औसत उपयोगिता', mr: 'सरासरी वापर' },
  activeSpaceBookings: { en: 'Active Space Bookings', hi: 'सक्रिय स्पेस बुकिंग', mr: 'सक्रिय जागा बुकिंग' },
  accreditedFacilities: { en: 'Accredited Facilities', hi: 'सत्यापित मान्यताप्राप्त सुविधाएं', mr: 'सत्यापित मान्यताप्राप्त केंद्रे' },
  operational: { en: 'Operational', hi: 'सक्रिय / चालू', mr: 'कार्यरत' },
  full: { en: 'Capacity Full', hi: 'क्षमता पूर्ण', mr: 'क्षमता पूर्ण' },
  underMaintenance: { en: 'Under Maintenance', hi: 'रखरखाव अधीन', mr: 'दुरुस्ती अंतर्गत' },
  closed: { en: 'Temporarily Closed', hi: 'अस्थायी रूप से बंद', mr: 'तात्पुरते बंद' },
  liveCapacityTracking: { en: 'Live Real-Time Capacity Tracking', hi: 'वास्तविक समय क्षमता ट्रैकिंग', mr: 'रिअल-टाइम क्षमता ट्रॅकिंग' },
  activeStorageFacilities: { en: 'Active Storage & Cold Chain Facilities', hi: 'सक्रिय भंडारण एवं कोल्ड चेन सुविधाएं', mr: 'सक्रिय गोदामे व शीतगृह केंद्रे' },

  // Verification
  pendingVerification: { en: 'Pending Verification', hi: 'सत्यापन लंबित', mr: 'पडताळणी प्रलंबित' },
  verified: { en: 'Verified Accredited', hi: 'सत्यापित मान्यताप्राप्त', mr: 'सत्यापित मान्यताप्राप्त' },
  rejected: { en: 'Verification Rejected', hi: 'सत्यापन अस्वीकृत', mr: 'पडताळणी नाकारली' },
  suspended: { en: 'Suspended', hi: 'निलंबित', mr: 'निलंबित' },
  accreditation: { en: 'Accreditation & License', hi: 'मान्यता एवं लाइसेंस', mr: 'मान्यता आणि परवाना' },
  accreditationType: { en: 'Accreditation Type', hi: 'मान्यता का प्रकार', mr: 'मान्यतेचा प्रकार' },
  wdraAccredited: { en: 'WDRA Accredited & e-NWR Ready', hi: 'डब्ल्यूडीआरए मान्यताप्राप्त एवं ई-एनडब्ल्यूआर सक्षम', mr: 'WDRA मान्यताप्राप्त आणि ई-एनडब्ल्यूआर सक्षम' },
  mswcAccredited: { en: 'State Warehousing Corp (MSWC)', hi: 'एमएसडब्ल्यूसी राज्य भंडारण निगम', mr: 'महाराष्ट्र राज्य वखार महामंडळ (MSWC)' },
  cwcAccredited: { en: 'Central Warehousing Corp (CWC)', hi: 'केंद्रीय भंडारण निगम (CWC)', mr: 'केंद्रीय वखार महामंडळ (CWC)' },
  fssaiCertified: { en: 'FSSAI Certified Cold Chain', hi: 'एफएसएसएआई प्रमाणित कोल्ड चेन', mr: 'FSSAI प्रमाणित शीतगृह' },
  apmcLicensed: { en: 'APMC Licensed Facility', hi: 'कृषि उपज मंडी समिति (APMC) लाइसेंस प्राप्त', mr: 'बाजार समिती (APMC) परवानाधारक' },

  // Request Management
  newRequest: { en: 'New Storage Request', hi: 'नया भंडारण अनुरोध', mr: 'नवीन साठवणूक विनंती' },
  incomingRequests: { en: 'Incoming Farmer Space Requests', hi: 'किसानों के प्राप्त भंडारण अनुरोध', mr: 'शेतकऱ्यांकडून आलेल्या जागा विनंत्या' },
  accept: { en: 'Accept', hi: 'स्वीकार करें', mr: 'स्वीकारा' },
  acceptRequest: { en: 'Accept Storage Request', hi: 'भंडारण अनुरोध स्वीकार करें', mr: 'साठवणूक विनंती स्वीकारा' },
  reject: { en: 'Reject', hi: 'अस्वीकार करें', mr: 'नाकारा' },
  rejectRequest: { en: 'Reject Storage Request', hi: 'भंडारण अनुरोध अस्वीकार करें', mr: 'साठवणूक विनंती नाकारा' },
  active: { en: 'Active', hi: 'सक्रिय', mr: 'सक्रिय' },
  completed: { en: 'Completed', hi: 'पूर्ण', mr: 'पूर्ण' },
  cancelled: { en: 'Cancelled', hi: 'रद्द', mr: 'रद्द' },
  requested: { en: 'Requested', hi: 'अनुरोधित', mr: 'मागणी केली' },
  pendingConfirmation: { en: 'Awaiting Confirmation', hi: 'पुष्टि की प्रतीक्षा में', mr: 'निश्चितीची प्रतीक्षा' },
  warehouseReceiptNumber: { en: 'Warehouse Receipt (e-NWR) #', hi: 'गोदाम रसीद (e-NWR) संख्या', mr: 'वेअरहाऊस पावती (e-NWR) क्रमांक' },
  farmerName: { en: 'Farmer / Depositor Name', hi: 'किसान / जमाकर्ता का नाम', mr: 'शेतकरी / ठेवीदाराचे नाव' },
  depositStartDate: { en: 'Deposit Start Date', hi: 'जमा प्रारंभ तिथि', mr: 'साठवणूक सुरू होण्याची तारीख' },
  depositEndDate: { en: 'Expected Release Date', hi: 'अपेक्षित निकासी तिथि', mr: 'अपेक्षित माल काढण्याची तारीख' },
  durationDays: { en: 'Duration (Days)', hi: 'अवधि (दिन)', mr: 'कालावधी (दिवस)' },
  farmerNotes: { en: 'Special Handling / Farmer Notes', hi: 'विशेष निर्देश / किसान टिप्पणी', mr: 'विशेष सूचना / शेतकऱ्याची नोंद' },
  requestDetails: { en: 'Storage Request Details', hi: 'भंडारण अनुरोध विवरण', mr: 'साठवणूक विनंती तपशील' },

  // UI Actions & Buttons
  addFacilityBtn: { en: '+ Add Storage Facility', hi: '+ नई भंडारण सुविधा जोड़ें', mr: '+ नवीन साठवणूक केंद्र जोडा' },
  bookSpaceBtn: { en: 'Book Storage', hi: 'भंडारण बुक करें', mr: 'साठवणूक बुक करा' },
  applyPledgeBtn: { en: 'Pledge Loan', hi: 'गिरवी ऋण', mr: 'तारण कर्ज' },
  navigateBtn: { en: 'Navigate', hi: 'मार्ग देखें', mr: 'दिशा दाखवा' },
  viewDetailsBtn: { en: 'View Details', hi: 'विवरण देखें', mr: 'तपशील पहा' },
  filterResetBtn: { en: 'Reset Filters', hi: 'फ़िल्टर रीसेट करें', mr: 'फिल्टर रीसेट करा' },
  recalculateBtn: { en: 'Recalculate', hi: 'पुनर्गणना करें', mr: 'पुन्हा गणना करा' },
  listenVerdictBtn: { en: 'Listen', hi: 'सुने', mr: 'ऐका' },
  stopVerdictBtn: { en: 'Stop', hi: 'रोकें', mr: 'थांबवा' },
  chooseFacility: { en: 'Choose Facility', hi: 'सुविधा चुनें', mr: 'केंद्र निवडा' },
  selected: { en: 'Selected', hi: 'चयनित', mr: 'निवडलेले' },
  bookStorage: { en: 'Book Storage', hi: 'भंडारण बुक करें', mr: 'साठवणूक बुक करा' },
  pledgeLoan: { en: 'Pledge Loan', hi: 'गिरवी ऋण', mr: 'तारण कर्ज' },
  farmerStorageView: { en: 'Farmer Storage View', hi: 'किसान भंडारण दृश्य', mr: 'शेतकरी साठवणूक दृश्य' },
  superAdmin: { en: 'Super Admin', hi: 'सुपर एडमिन', mr: 'सुपर ॲडमिन' },
  adminUser: { en: 'Admin User', hi: 'व्यवस्थापक उपयोगकर्ता', mr: 'प्रशासक वापरकर्ता' },

  // Table Headers
  tableName: { en: 'Facility Name', hi: 'सुविधा का नाम', mr: 'केंद्राचे नाव' },
  tableType: { en: 'Type', hi: 'प्रकार', mr: 'प्रकार' },
  tableLocation: { en: 'Location', hi: 'स्थान', mr: 'स्थान' },
  tableCapacity: { en: 'Capacity (Free / Total)', hi: 'क्षमता (रिक्त / कुल)', mr: 'क्षमता (मोकळी / एकूण)' },
  tableTariff: { en: 'Tariff Rate', hi: 'किराया दर', mr: 'भाडे दर' },
  tableAccreditation: { en: 'Accreditation', hi: 'मान्यता', mr: 'मान्यता' },
  tableStatus: { en: 'Status', hi: 'स्थिति', mr: 'स्थिती' },
  tableActions: { en: 'Actions', hi: 'कार्रवाइयां', mr: 'कृती' },

  // Empty States
  noFacilitiesFoundTitle: { en: 'No Storage Facilities Found', hi: 'कोई भंडारण सुविधा नहीं मिली', mr: 'कोणतेही साठवणूक केंद्र आढळले नाही' },
  noFacilitiesFoundDesc: {
    en: 'Try expanding the radius or changing the crop / storage type filter.',
    hi: 'दूरी का दायरा बढ़ाएं या फसल / भंडारण प्रकार फ़िल्टर बदलें।',
    mr: 'अंतराची मर्यादा वाढवा किंवा पीक / साठवणूक प्रकार फिल्टर बदला.'
  },
  noBookingsTitle: { en: 'No Active Storage Bookings', hi: 'कोई सक्रिय भंडारण बुकिंग नहीं', mr: 'कोणतेही सक्रिय साठवणूक बुकिंग नाही' },
  noBookingsDesc: {
    en: "You haven't submitted any warehouse space requests yet. Discover nearby facilities to store your harvest.",
    hi: 'आपने अभी तक कोई गोदाम स्थान अनुरोध नहीं भेजा है। अपनी फसल सुरक्षित रखने के लिए नजदीकी गोदाम खोजें।',
    mr: 'आपण अद्याप कोणतीही गोदाम जागा विनंती पाठवलेली नाही. शेतमाल साठवण्यासाठी जवळची केंद्रे शोधा.'
  },
  noPledgeRequestsTitle: { en: 'No Pledge Financing Applications', hi: 'कोई तारण ऋण आवेदन नहीं', mr: 'कोणताही तारण कर्ज अर्ज नाही' },
  noPledgeRequestsDesc: {
    en: 'Apply for immediate working capital against your stored warehouse receipts to prevent distress selling.',
    hi: 'मजबूरी में कम दाम पर बेचने से बचने के लिए अपनी गोदाम रसीद (e-NWR) पर कार्यशील पूंजी ऋण हेतु आवेदन करें।',
    mr: 'कमी भावात शेतमाल विकणे टाळण्यासाठी आपल्या वेअरहाऊस पावतीवर (e-NWR) त्वरित तारण कर्ज मिळवा.'
  },
  noRequestsTitle: { en: 'No Space Requests Pending', hi: 'कोई नया भंडारण अनुरोध लंबित नहीं है', mr: 'कोणतीही साठवणूक विनंती प्रलंबित नाही' },
  noRequestsDesc: {
    en: 'When farmers in your district submit space booking requests, they will appear here for review.',
    hi: 'जब आपके जिले के किसान भंडारण अनुरोध भेजेंगे, वे यहां समीक्षा के लिए दिखाई देंगे।',
    mr: 'आपल्या जिल्ह्यातील शेतकऱ्यांनी साठवणुकीची विनंती पाठवल्यावर ती येथे मंजुरीसाठी दिसेल.'
  },

  // Comparison & Advice
  highestProfit: { en: '🏆 HIGHEST PROFIT', hi: '🏆 अधिकतम लाभ', mr: '🏆 सर्वाधिक नफा' },
  nearest: { en: '⚡ NEAREST', hi: '⚡ निकटतम', mr: '⚡ सर्वात जवळ' },
  lowestCost: { en: '💰 LOWEST COST', hi: '💰 सबसे कम लागत', mr: '💰 सर्वात कमी खर्च' },
  monthlyStorageTariff: { en: 'Monthly Storage Tariff:', hi: 'मासिक भंडारण किराया:', mr: 'मासिक साठवणूक भाडे:' },
  handlingAndUnloading: { en: 'Handling & Unloading:', hi: 'हैंडलिंग एवं अनलोडिंग:', mr: 'हमाली व माल उतरवणे:' },
  totalHoldingCosts: { en: 'Total Holding Costs:', hi: 'कुल भंडारण लागत:', mr: 'एकूण साठवणूक खर्च:' },
  projectedNetGain: { en: 'Projected Net Gain', hi: 'अनुमानित शुद्ध लाभ', mr: 'अपेक्षित निव्वळ नफा' },
  netRealizationHeading: { en: 'Net Realization', hi: 'शुद्ध प्राप्ति', mr: 'निव्वळ उत्पन्न' },
  freeSpaceMetric: { en: 'Free Space', hi: 'उपलब्ध स्थान', mr: 'मोकळी जागा' },
  cropsSupportedLabel: { en: 'Crops:', hi: 'फसलें:', mr: 'पिके:' },
  distanceAway: { en: 'away', hi: 'दूर', mr: 'लांब' },
  utilized: { en: 'Utilized', hi: 'उपयोग हुआ', mr: 'वापर झाला' },
  myFarmLocation: { en: '📍 Your Farm Location', hi: '📍 आपका खेत स्थान', mr: '📍 आपले शेताचे स्थान' },
  findingFacilities: { en: 'Finding nearby storage facilities...', hi: 'नजदीकी भंडारण सुविधाएं खोजी जा रही हैं...', mr: 'जवळची साठवणूक केंद्रे शोधत आहे...' },
  evaluatingCropOptions: { en: 'Evaluating all suitable warehouse & cold storage options for', hi: 'के लिए उपयुक्त गोदाम एवं शीतगृह विकल्पों का मूल्यांकन जारी...', mr: 'साठी योग्य गोदाम व शीतगृह पर्यायांचे मूल्यांकन करत आहे...' },
  loadingBookings: { en: 'Loading your warehouse deposits & storage requests...', hi: 'आपकी गोदाम जमा और भंडारण अनुरोध लोड हो रहे हैं...', mr: 'आपल्या वेअरहाऊस ठेवी आणि साठवणूक विनंत्या लोड करत आहे...' },
  loadingPledge: { en: 'Loading your pledge liquidity applications...', hi: 'आपके तारण ऋण आवेदन लोड हो रहे हैं...', mr: 'आपले तारण कर्ज अर्ज लोड करत आहे...' },
  estStorageCostLabel: { en: 'Est. Storage Cost', hi: 'अनुमानित भंडारण लागत', mr: 'अपेक्षित साठवणूक खर्च' },
  loanRequestedLabel: { en: 'Loan Requested', hi: 'ऋण मांग', mr: 'मागितलेले कर्ज' },
  maxLtvPermissible: { en: 'Max 75% LTV Permissible', hi: 'अधिकतम 75% एलटीवी अनुमेय', mr: 'कमाल 75% LTV मर्यादेत' },
  storedQuantityLabel: { en: 'Stored:', hi: 'भंडारित:', mr: 'साठवलेले:' },
  lenderLabel: { en: 'Lender:', hi: 'ऋणदाता:', mr: 'बँक/संस्था:' },
  estValueLabel: { en: 'Est. Value:', hi: 'अनुमानित मूल्य:', mr: 'अपेक्षित मूल्य:' },
  receiptLabel: { en: 'Receipt:', hi: 'रसीद संख्या:', mr: 'पावती क्रमांक:' },
  facilityLabel: { en: 'Facility:', hi: 'सुविधा:', mr: 'केंद्र:' },
  durationLabel: { en: 'Duration:', hi: 'अवधि:', mr: 'कालावधी:' },
  daysLabel: { en: 'Days', hi: 'दिन', mr: 'दिवस' },
  optionPrefix: { en: 'Option', hi: 'विकल्प', mr: 'पर्याय' }
};

// Validation Translations
const validationTranslations = {
  facilityNameRequired: { en: 'Storage facility name is required', hi: 'भंडारण सुविधा का नाम आवश्यक है', mr: 'साठवणूक केंद्राचे नाव आवश्यक आहे' },
  ownerNameRequired: { en: 'Owner / Manager name is required', hi: 'मालिक / प्रबंधक का नाम आवश्यक है', mr: 'मालक / व्यवस्थापकाचे नाव आवश्यक आहे' },
  facilityTypeRequired: { en: 'Facility type is required', hi: 'सुविधा का प्रकार चुनना आवश्यक है', mr: 'साठवणूक केंद्राचा प्रकार निवडणे आवश्यक आहे' },
  totalCapacityRequired: { en: 'Total capacity must be greater than 0', hi: 'कुल क्षमता 0 से अधिक होनी चाहिए', mr: 'एकूण क्षमता 0 पेक्षा जास्त असणे आवश्यक आहे' },
  availableCapacityRequired: { en: 'Available capacity cannot exceed total capacity', hi: 'उपलब्ध क्षमता कुल क्षमता से अधिक नहीं हो सकती', mr: 'उपलब्ध क्षमता एकूण क्षमतेपेक्षा जास्त असू शकत नाही' },
  storageRateRequired: { en: 'Storage tariff rate is required', hi: 'भंडारण किराया दर आवश्यक है', mr: 'साठवणूक भाडे दर आवश्यक आहे' },
  districtRequired: { en: 'District is required', hi: 'जिला आवश्यक है', mr: 'जिल्हा आवश्यक आहे' },
  stateRequired: { en: 'State is required', hi: 'राज्य आवश्यक है', mr: 'राज्य आवश्यक आहे' },
  cropRequired: { en: 'At least one supported crop must be selected', hi: 'कम से कम एक समर्थित फसल का चयन आवश्यक है', mr: 'किमान एका पिकाची निवड आवश्यक आहे' },
  durationRequired: { en: 'Storage duration must be at least 1 day', hi: 'भंडारण अवधि कम से कम 1 दिन होनी चाहिए', mr: 'साठवणूक कालावधी किमान 1 दिवस असावा' },
  capacityExceeded: { en: 'Requested quantity exceeds available facility capacity', hi: 'अनुरोधित मात्रा उपलब्ध सुविधा क्षमता से अधिक है', mr: 'मागितलेले प्रमाण उपलब्ध क्षमतेपेक्षा जास्त आहे' },
  quantityRequired: { en: 'Please enter a valid quantity', hi: 'कृपया एक मान्य मात्रा दर्ज करें', mr: 'कृपया वैध प्रमाण प्रविष्ट करा' },
  positiveNumberRequired: { en: 'Value must be a positive number', hi: 'मान एक धनात्मक संख्या होना चाहिए', mr: 'किंमत धन संख्या असणे आवश्यक आहे' }
};

// Error Translations
const errorTranslations = {
  facilityCreateFailed: { en: 'Failed to register storage facility. Please verify inputs.', hi: 'भंडारण सुविधा पंजीकृत करने में विफल। कृपया प्रविष्टियों की जांच करें।', mr: 'साठवणूक केंद्र नोंदणी अयशस्वी. कृपया माहिती तपासा.' },
  facilityUpdateFailed: { en: 'Failed to update storage facility configuration.', hi: 'भंडारण सुविधा विन्यास अद्यतित करने में विफल।', mr: 'साठवणूक केंद्र माहिती अपडेट करणे अयशस्वी.' },
  facilityNotFound: { en: 'Storage facility not found.', hi: 'भंडारण सुविधा नहीं मिली।', mr: 'साठवणूक केंद्र आढळले नाही.' },
  requestAcceptFailed: { en: 'Failed to accept storage request.', hi: 'भंडारण अनुरोध स्वीकार करने में विफल।', mr: 'साठवणूक विनंती स्वीकारणे अयशस्वी.' },
  requestRejectFailed: { en: 'Failed to reject storage request.', hi: 'भंडारण अनुरोध अस्वीकार करने में विफल।', mr: 'साठवणूक विनंती नाकारणे अयशस्वी.' },
  bookingFailed: { en: 'Storage booking request failed. Please check capacity.', hi: 'भंडारण बुकिंग अनुरोध विफल। कृपया क्षमता जांचें।', mr: 'साठवणूक बुकिंग अयशस्वी. कृपया उपलब्ध क्षमता तपासा.' },
  pledgeFailed: { en: 'Pledge financing application failed.', hi: 'तारण ऋण आवेदन विफल रहा।', mr: 'तारण कर्ज अर्ज अयशस्वी झाला.' },
  storageDataLoadFailed: { en: 'Unable to load storage facilities data.', hi: 'भंडारण सुविधा डेटा लोड करने में असमर्थ।', mr: 'साठवणूक केंद्रांची माहिती लोड करता आली नाही.' }
};

// Success Translations
const successTranslations = {
  facilityCreated: { en: 'Storage facility registered successfully!', hi: 'भंडारण सुविधा सफलतापूर्वक पंजीकृत हो गई!', mr: 'साठवणूक केंद्र यशस्वीरित्या नोंदणीकृत झाले!' },
  facilityUpdated: { en: 'Storage facility updated successfully!', hi: 'भंडारण सुविधा सफलतापूर्वक अद्यतित की गई!', mr: 'साठवणूक केंद्र यशस्वीरित्या अपडेट झाले!' },
  requestAccepted: { en: 'Storage request accepted! Warehouse receipt generated.', hi: 'भंडारण अनुरोध स्वीकार कर लिया गया! गोदाम रसीद जनरेट हुई।', mr: 'साठवणूक विनंती मंजूर केली! वेअरहाऊस पावती तयार झाली.' },
  requestRejected: { en: 'Storage request has been rejected.', hi: 'भंडारण अनुरोध अस्वीकृत कर दिया गया है।', mr: 'साठवणूक विनंती नाकारण्यात आली आहे.' },
  requestCancelled: { en: 'Storage request cancelled successfully.', hi: 'भंडारण अनुरोध सफलतापूर्वक रद्द किया गया।', mr: 'साठवणूक विनंती यशस्वीरित्या रद्द केली.' },
  bookingSubmitted: { en: 'Storage request submitted successfully! Facility manager will review.', hi: 'भंडारण अनुरोध सफलतापूर्वक जमा किया गया! सुविधा प्रबंधक समीक्षा करेंगे।', mr: 'साठवणूक विनंती यशस्वीरित्या पाठवली! केंद्र व्यवस्थापक मंजुरी देतील.' },
  pledgeApplied: { en: 'Pledge loan application submitted to partner lender!', hi: 'तारण ऋण आवेदन भागीदार बैंक/संस्थान को भेजा गया!', mr: 'तारण कर्ज अर्ज भागीदार बँकेकडे पाठवला गेला!' },
  storageLanguageUpdated: { en: 'Storage preferences updated.', hi: 'भंडारण प्राथमिकताएं अद्यतित की गईं।', mr: 'साठवणूक प्राधान्ये अद्ययावत केली.' }
};

// Auth Storage Owner addition
const authAdditions = {
  storageOwner: { en: 'Storage Owner', hi: 'गोदाम मालिक', mr: 'गोदाम मालक' },
  storageOwnerBadge: { en: 'STORAGE OWNER', hi: 'गोदाम मालिक', mr: 'गोदाम मालक' }
};

// Merge all into en, hi, mr dictionaries
function mergeCategory(dict, category, additions, lang) {
  if (!dict[category]) dict[category] = {};
  for (const [k, v] of Object.entries(additions)) {
    dict[category][k] = v[lang];
  }
}

['en', 'hi', 'mr'].forEach(lang => {
  const target = lang === 'en' ? en : lang === 'hi' ? hi : mr;
  mergeCategory(target, 'storage', storageTranslations, lang);
  mergeCategory(target, 'validation', validationTranslations, lang);
  mergeCategory(target, 'errors', errorTranslations, lang);
  mergeCategory(target, 'success', successTranslations, lang);
  mergeCategory(target, 'auth', authAdditions, lang);
});

// Write updated locale files
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2), 'utf8');

console.log('Successfully enriched en.json, hi.json, mr.json with Step 9 Storage Owner translations!');
