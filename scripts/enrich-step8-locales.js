const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'src', 'locales', 'en.json');
const hiPath = path.join(__dirname, '..', 'src', 'locales', 'hi.json');
const mrPath = path.join(__dirname, '..', 'src', 'locales', 'mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

const updates = {
  common: {
    fullName: {
      en: "Full Name",
      hi: "पूरा नाम",
      mr: "पूर्ण नाव"
    },
    saveSettings: {
      en: "Save Settings",
      hi: "सेटिंग्स सहेजें",
      mr: "सेटिंग्ज जतन करा"
    },
    kisanSupport: {
      en: "Kisan Support & Helpline",
      hi: "किसान सहायता एवं हेल्पलाइन",
      mr: "किसान मदत व हेल्पलाइन"
    },
    kisanHelpline: {
      en: "Kisan Helpline",
      hi: "किसान हेल्पलाइन",
      mr: "किसान हेल्पलाइन"
    },
    heroTagline: {
      en: "Know the Price. Choose the Market. Sell Better.",
      hi: "दाम जानें। मंडी चुनें। बेहतर बेचें।",
      mr: "भाव जाणा। बाजार निवडा। अधिक नफा मिळवा।"
    },
    profileAndFarm: {
      en: "My Profile & Farm",
      hi: "मेरी प्रोफाइल व खेत",
      mr: "माझे प्रोफाईल आणि शेती"
    },
    manageMyLots: {
      en: "Manage My Lots",
      hi: "मेरे लॉट प्रबंधित करें",
      mr: "माझे लॉट्स व्यवस्थापित करा"
    },
    priceAlerts: {
      en: "Price Alerts",
      hi: "मूल्य अलर्ट",
      mr: "भाव सूचना / अलर्ट"
    }
  },
  navigation: {
    home: {
      en: "Home",
      hi: "होम",
      mr: "मुख्यपृष्ठ"
    },
    forecast: {
      en: "Forecast",
      hi: "पूर्वानुमान",
      mr: "अंदाज"
    },
    myLots: {
      en: "My Lots",
      hi: "मेरे लॉट",
      mr: "माझे लॉट्स"
    }
  },
  farmer: {
    farmerProfile: {
      en: "Farmer Profile & Settings",
      hi: "किसान प्रोफाइल एवं सेटिंग्स",
      mr: "शेतकरी प्रोफाईल आणि सेटिंग्ज"
    },
    manageMyLots: {
      en: "Manage My Lots",
      hi: "मेरे लॉट प्रबंधित करें",
      mr: "माझे लॉट्स व्यवस्थापित करा"
    },
    priceAlerts: {
      en: "Price Alerts",
      hi: "मूल्य अलर्ट",
      mr: "भाव सूचना / अलर्ट"
    },
    kisanHelpline: {
      en: "Kisan Helpline",
      hi: "किसान हेल्पलाइन",
      mr: "किसान हेल्पलाइन"
    },
    kisanCallCenter: {
      en: "Kisan Call Center (Toll Free)",
      hi: "किसान कॉल सेंटर (टोल फ्री)",
      mr: "किसान कॉल सेंटर (टोल फ्री)"
    },
    verifiedBuyersTitle: {
      en: "Verified Corporate & Institutional Buyers",
      hi: "सत्यापित कॉर्पोरेट एवं संस्थागत खरीदार",
      mr: "सत्यापित कॉर्पोरेट आणि संस्थागत खरेदीदार"
    },
    verifiedBuyersSub: {
      en: "Direct procurement with guaranteed digital payments",
      hi: "गारंटीकृत डिजिटल भुगतान के साथ सीधी खरीद",
      mr: "हमी डिजिटल पेमेंटसह थेट खरेदी"
    },
    verifiedBuyersDesc: {
      en: "Direct procurement partners offering verified credentials, fair pricing, and 24h bank transfers.",
      hi: "सत्यापित साख, उचित मूल्य और 24 घंटे में बैंक ट्रांसफर प्रदान करने वाले सीधी खरीद भागीदार।",
      mr: "सत्यापित पत, योग्य भाव आणि २४ तासांत बँक ट्रान्सफर देणारे थेट खरेदी भागीदार."
    },
    activeProcurementPartners: {
      en: "Active Procurement Partners",
      hi: "सक्रिय खरीद भागीदार",
      mr: "सक्रिय खरेदी भागीदार"
    },
    incomingOffersTitle: {
      en: "Incoming Bids & Direct Offers",
      hi: "प्राप्त बोलियां एवं प्रत्यक्ष प्रस्ताव",
      mr: "प्राप्त झालेल्या बोली आणि थेट ऑफर्स"
    },
    incomingOffersDesc: {
      en: "Quotes received for your active crop listings",
      hi: "आपकी सक्रिय फसल लिस्टिंग के लिए प्राप्त उद्धरण (कोट्स)",
      mr: "तुमच्या सक्रिय शेतमाल नोंदींसाठी मिळालेल्या ऑफर्स"
    }
  },
  cropLot: {
    createLot: {
      en: "List Lot for Buyers",
      hi: "खरीदारों के लिए लॉट सूचीबद्ध करें",
      mr: "खरेदीदारांसाठी लॉट नोंदवा"
    }
  },
  offers: {
    negotiatePrice: {
      en: "Negotiate Price",
      hi: "मूल्य पर बातचीत करें",
      mr: "भावावर वाटाघाटी करा"
    },
    buyerOfferDetails: {
      en: "Buyer Offer Details",
      hi: "खरीदार प्रस्ताव विवरण",
      mr: "खरेदीदार ऑफर तपशील"
    },
    counterOfferPrice: {
      en: "Your Counter Offer Price (₹/q)",
      hi: "आपका प्रति-प्रस्ताव मूल्य (₹/क्विंटल)",
      mr: "तुमचा प्रति-ऑफर भाव (₹/क्विंटल)"
    },
    noteToBuyer: {
      en: "Message / Note to Buyer",
      hi: "खरीदार को संदेश / नोट",
      mr: "खरेदीदारास संदेश / नोंद"
    },
    notePlaceholder: {
      en: "e.g. Can provide delivery to Pune warehouse within 48 hours.",
      hi: "उदा. 48 घंटों के भीतर पुणे गोदाम में डिलीवरी प्रदान कर सकते हैं।",
      mr: "उदा. ४८ तासांच्या आत पुणे गोदामात डिलिव्हरी देऊ शकतो."
    },
    sendCounterOffer: {
      en: "Send Counter Offer",
      hi: "प्रति-प्रस्ताव भेजें",
      mr: "प्रति-ऑफर पाठवा"
    }
  },
  buyer: {
    buyerPortal: {
      en: "Open KrishiShetra Buyer Portal",
      hi: "कृषिक्षेत्र खरीदार पोर्टल खोलें",
      mr: "कृषिक्षेत्र खरेदीदार पोर्टल उघडा"
    },
    buyerDashboard: {
      en: "Procurement Command Center",
      hi: "खरीद कमांड सेंटर",
      mr: "खरेदी कमांड सेंटर"
    },
    buyerDashboardSubtitle: {
      en: "Live agricultural procurement, active contracts, and escrow settlements",
      hi: "लाइव कृषि खरीद, सक्रिय अनुबंध और एस्क्रो निपटान",
      mr: "थेट शेतमाल खरेदी, सक्रिय करार आणि एस्क्रो खाती"
    },
    verifiedBuyer: {
      en: "Verified Institutional Buyer",
      hi: "सत्यापित संस्थागत खरीदार",
      mr: "सत्यापित संस्थागत खरेदीदार"
    },
    activeLotsAvailable: {
      en: "Active Lots Available",
      hi: "सक्रिय लॉट उपलब्ध",
      mr: "सक्रिय लॉट्स उपलब्ध"
    },
    activeInquiriesCount: {
      en: "Active Inquiries",
      hi: "सक्रिय पूछताछ",
      mr: "सक्रिय विचारणा"
    },
    inTransitVolume: {
      en: "In-Transit Volume",
      hi: "पारगमन में मात्रा (ट्रांजिट)",
      mr: "वाहतुकीतील प्रमाण"
    },
    escrowLockedAmount: {
      en: "Escrow Locked Amount",
      hi: "एस्क्रो सुरक्षित राशि",
      mr: "एस्क्रो सुरक्षित रक्कम"
    },
    procurementActivity: {
      en: "Procurement Activity",
      hi: "खरीद गतिविधियां",
      mr: "खरेदी घडामोडी"
    },
    recommendedLotsForYou: {
      en: "Recommended Lots For You",
      hi: "आपके लिए अनुशंसित लॉट",
      mr: "तुमच्यासाठी शिफारस केलेले लॉट्स"
    },
    grainsAndCereals: {
      en: "Grains & Cereals",
      hi: "अनाज एवं धान्य",
      mr: "धान्य आणि तृणधान्ये"
    },
    pulsesAndLegumes: {
      en: "Pulses & Legumes",
      hi: "दालें एवं दलहन",
      mr: "डाळी आणि कडधान्ये"
    },
    fruitsAndVeg: {
      en: "Fruits & Vegetables",
      hi: "फल एवं सब्जियां",
      mr: "फळे आणि भाज्या"
    },
    spicesAndCommercial: {
      en: "Spices & Commercial Crops",
      hi: "मसाले एवं वाणिज्यिक फसलें",
      mr: "मसाले आणि नगदी पिके"
    },
    filterByState: {
      en: "State / Region",
      hi: "राज्य / क्षेत्र",
      mr: "राज्य / विभाग"
    },
    filterByGrade: {
      en: "Quality Grade",
      hi: "गुणवत्ता ग्रेड",
      mr: "दर्जा / प्रत"
    },
    filterBySeller: {
      en: "Seller Type",
      hi: "विक्रेता प्रकार",
      mr: "विक्रेता प्रकार"
    },
    filterByVolume: {
      en: "Available Quantity",
      hi: "उपलब्ध मात्रा",
      mr: "उपलब्ध प्रमाण"
    },
    filterByPrice: {
      en: "Price Range",
      hi: "मूल्य सीमा",
      mr: "भाव मर्यादा"
    },
    viewLotDetails: {
      en: "View Lot Details",
      hi: "लॉट विवरण देखें",
      mr: "लॉट तपशील पहा"
    },
    grainSize: {
      en: "Grain Size",
      hi: "दाने का आकार",
      mr: "दाण्याचा आकार"
    },
    gradingCertificate: {
      en: "Assay & Grading Certificate",
      hi: "गुणवत्ता परख एवं ग्रेडिंग प्रमाणपत्र",
      mr: "गुणवत्ता तपासणी व प्रत प्रमाणपत्र"
    },
    basePricePerQtl: {
      en: "Base Price per Quintal",
      hi: "मूल आधार मूल्य प्रति क्विंटल",
      mr: "मूळ भाव प्रति क्विंटल"
    },
    estimatedFreight: {
      en: "Estimated Freight",
      hi: "अनुमानित परिवहन भाड़ा",
      mr: "अंदाजे वाहतूक खर्च"
    },
    handlingAndMandiFee: {
      en: "Handling & Mandi Fees",
      hi: "मंडी शुल्क एवं हैंडलिंग",
      mr: "मंडी शुल्क व हमाली"
    },
    buyNowEscrow: {
      en: "Buy Now with Escrow",
      hi: "एस्क्रो से अभी खरीदें",
      mr: "एस्क्रोसह त्वरित खरेदी करा"
    },
    sendInquiryModalTitle: {
      en: "Send Procurement Inquiry",
      hi: "खरीद पूछताछ भेजें",
      mr: "खरेदी विचारणा पाठवा"
    },
    offeredPricePerQtl: {
      en: "Offered Price per Quintal",
      hi: "प्रस्तावित मूल्य प्रति क्विंटल",
      mr: "प्रस्तावित भाव प्रति क्विंटल"
    },
    deliveryLocation: {
      en: "Delivery Location / Warehouse",
      hi: "डिलीवरी स्थान / गोदाम",
      mr: "पोच ठिकाण / गोदाम"
    },
    targetDeliveryDate: {
      en: "Target Delivery Date",
      hi: "अपेक्षित डिलीवरी तिथि",
      mr: "अपेक्षित डिलिव्हरी तारीख"
    },
    paymentMethod: {
      en: "Payment Method",
      hi: "भुगतान विधि",
      mr: "पेमेंट पद्धत"
    },
    inquiryNotes: {
      en: "Inquiry Notes / Instructions",
      hi: "पूछताछ निर्देश / विशेष नोट",
      mr: "विचारणा सूचना / विशेष नोंद"
    },
    submitInquiryBtn: {
      en: "Submit Inquiry",
      hi: "पूछताछ सबमिट करें",
      mr: "विचारणा दाखल करा"
    },
    cancelBtn: {
      en: "Cancel",
      hi: "रद्द करें",
      mr: "रद्द करा"
    },
    inquiriesWorkspace: {
      en: "Inquiries & Negotiations",
      hi: "पूछताछ एवं बातचीत कार्यक्षेत्र",
      mr: "विचारणा व वाटाघाटी कक्ष"
    },
    negotiationStepperTitle: {
      en: "Negotiation Timeline",
      hi: "बातचीत की समयरेखा (टाइमलाइन)",
      mr: "वाटाघाटी टाइमलाइन"
    },
    counterOfferPrice: {
      en: "Counter Offer Price",
      hi: "प्रति-प्रस्ताव मूल्य",
      mr: "प्रति-ऑफर भाव"
    },
    acceptCounterOffer: {
      en: "Accept Counter Offer",
      hi: "प्रति-प्रस्ताव स्वीकार करें",
      mr: "प्रति-ऑफर स्वीकारा"
    },
    rejectOffer: {
      en: "Reject Offer",
      hi: "प्रस्ताव अस्वीकार करें",
      mr: "ऑफर नाकारा"
    },
    sendCounterProposal: {
      en: "Send Counter Proposal",
      hi: "नया प्रति-प्रस्ताव भेजें",
      mr: "नवीन प्रति-ऑफर पाठवा"
    },
    dealAgreed: {
      en: "Deal Agreed / PO Generated",
      hi: "सौदा तय / खरीद आदेश जारी",
      mr: "करार मंजूर / खरेदी आदेश तयार"
    },
    ordersWorkspace: {
      en: "Orders & Fulfillment",
      hi: "आदेश एवं आपूर्ति प्रबंधन",
      mr: "ऑर्डर्स आणि पूर्तता व्यवस्थापन"
    },
    activeOrders: {
      en: "Active Orders",
      hi: "सक्रिय आदेश",
      mr: "सक्रिय ऑर्डर्स"
    },
    orderHistory: {
      en: "Order History",
      hi: "आदेश इतिहास",
      mr: "ऑर्डर इतिहास"
    },
    orderTrackingModalTitle: {
      en: "Live Order Tracking & Telemetry",
      hi: "लाइव ऑर्डर ट्रैकिंग एवं वाहन टेलीमेट्री",
      mr: "थेट ऑर्डर ट्रॅकिंग आणि वाहन टेलीमेट्री"
    },
    currentLocation: {
      en: "Current Location",
      hi: "वर्तमान स्थान",
      mr: "सध्याचे ठिकाण"
    },
    estimatedArrival: {
      en: "Estimated Arrival",
      hi: "अनुमानित आगमन समय",
      mr: "अंदाजे पोहोचण्याची वेळ"
    },
    driverContact: {
      en: "Driver Contact",
      hi: "चालक संपर्क",
      mr: "चालक संपर्क क्रमांक"
    },
    releasePaymentEscrow: {
      en: "Release Escrow Payment",
      hi: "एस्क्रो भुगतान जारी करें",
      mr: "एस्क्रो पेमेंट रिलीज करा"
    },
    totalFundsInEscrow: {
      en: "Total Funds in Escrow",
      hi: "एस्क्रो में कुल धनराशि",
      mr: "एस्क्रोमधील एकूण रक्कम"
    },
    releasedToFarmers: {
      en: "Released to Farmers",
      hi: "किसानों को वितरित राशि",
      mr: "शेतकऱ्यांना दिलेली रक्कम"
    },
    pendingRelease: {
      en: "Pending Release",
      hi: "वितरण हेतु लंबित राशि",
      mr: "प्रलंबित रक्कम"
    },
    depositEscrowFunds: {
      en: "Deposit Escrow Funds",
      hi: "एस्क्रो में धनराशि जमा करें",
      mr: "एस्क्रोमध्ये रक्कम जमा करा"
    },
    downloadLedgerPdf: {
      en: "Download Ledger PDF",
      hi: "खाता बही (लेजर) PDF डाउनलोड करें",
      mr: "खातेवही (लेजर) PDF डाउनलोड करा"
    },
    transactionId: {
      en: "Transaction ID",
      hi: "लेनदेन आईडी",
      mr: "व्यवहार आयडी"
    },
    escrowStatusProtected: {
      en: "100% Escrow Protected",
      hi: "100% एस्क्रो सुरक्षित",
      mr: "१००% एस्क्रो सुरक्षित"
    },
    producerDirectoryTitle: {
      en: "Producer & FPO Directory",
      hi: "उत्पादक एवं एफपीओ डायरेक्टरी",
      mr: "उत्पादक आणि FPO डिरेक्टरी"
    },
    producerDirectorySubtitle: {
      en: "KYC-verified farmers, FPC clusters, and cooperatives",
      hi: "केवाईसी-सत्यापित किसान, एफपीसी समूह और सहकारी समितियां",
      mr: "KYC-सत्यापित शेतकरी, FPC गट आणि सहकारी संस्था"
    },
    searchProducers: {
      en: "Search Producers...",
      hi: "उत्पादक खोजें...",
      mr: "उत्पादक शोधा..."
    },
    filterFposOnly: {
      en: "FPOs & Collectives",
      hi: "एफपीओ एवं समूह",
      mr: "FPO आणि शेतकरी गट"
    },
    filterDirectFarmers: {
      en: "Direct Progressive Farmers",
      hi: "सीधे प्रगतिशील किसान",
      mr: "थेट प्रगतीशील शेतकरी"
    },
    verifiedFpoBadge: {
      en: "KYC-Verified FPO",
      hi: "केवाईसी-सत्यापित एफपीओ",
      mr: "KYC-सत्यापित FPO"
    },
    producerLotsCount: {
      en: "Active Listings",
      hi: "सक्रिय लिस्टिंग",
      mr: "सक्रिय नोंदी"
    },
    contactProducerBtn: {
      en: "Contact Producer",
      hi: "उत्पादक से संपर्क करें",
      mr: "उत्पादकांशी संपर्क साधा"
    },
    companyName: {
      en: "Company / Enterprise Name",
      hi: "कंपनी / व्यावसायिक संस्था नाम",
      mr: "कंपनी / व्यावसायिक संस्थेचे नाव"
    },
    gstinNumber: {
      en: "GSTIN Number",
      hi: "जीएसटीआईएन संख्या",
      mr: "GSTIN क्रमांक"
    },
    panNumber: {
      en: "Business PAN Number",
      hi: "व्यावसायिक पैन नंबर",
      mr: "व्यवसाय पॅन क्रमांक"
    },
    fssaiLicense: {
      en: "FSSAI License",
      hi: "एफएसएसएआई लाइसेंस",
      mr: "FSSAI परवाना"
    },
    primaryProcurementCategory: {
      en: "Primary Procurement Category",
      hi: "प्राथमिक खरीद श्रेणी",
      mr: "प्राथमिक खरेदी वर्ग"
    },
    warehouseAddress: {
      en: "Primary Warehouse Address",
      hi: "मुख्य गोदाम का पता",
      mr: "मुख्य गोदामाचा पत्ता"
    },
    saveProfileBtn: {
      en: "Save Profile & Settings",
      hi: "प्रोफाइल एवं सेटिंग्स सहेजें",
      mr: "प्रोफाईल आणि सेटिंग्ज जतन करा"
    },
    kycVerificationSubtitle: {
      en: "Submit official corporate registration documents for AgriStack verification",
      hi: "एग्रीस्टैक सत्यापन हेतु आधिकारिक कंपनी दस्तावेज जमा करें",
      mr: "अ‍ॅग्रीस्टॅक पडताळणीसाठी अधिकृत कंपनी कागदपत्रे सादर करा"
    },
    gstCertificateDoc: {
      en: "GST Registration Certificate",
      hi: "जीएसटी पंजीकरण प्रमाणपत्र",
      mr: "GST नोंदणी प्रमाणपत्र"
    },
    panCardDoc: {
      en: "Corporate PAN Card",
      hi: "कंपनी पैन कार्ड",
      mr: "कंपनी पॅन कार्ड"
    },
    fssaiLicenseDoc: {
      en: "FSSAI Trading/Processing License",
      hi: "एफएसएसएआई व्यापार/प्रसंस्करण लाइसेंस",
      mr: "FSSAI व्यापार/प्रक्रिया परवाना"
    },
    bankProofDoc: {
      en: "Bank Account Cancelled Cheque / Statement",
      hi: "बैंक खाता रद्द चेक / विवरण",
      mr: "बँक खाते रद्द चेक / स्टेटमेंट"
    },
    uploadDocumentBtn: {
      en: "Upload Document",
      hi: "दस्तावेज अपलोड करें",
      mr: "कागदपत्र अपलोड करा"
    },
    kycVerifiedSuccess: {
      en: "AgriStack KYC Verification Approved",
      hi: "एग्रीस्टैक केवाईसी सत्यापन स्वीकृत",
      mr: "अ‍ॅग्रीस्टॅक KYC पडताळणी मंजूर"
    },
    verificationPendingReview: {
      en: "Verification In Review",
      hi: "सत्यापन समीक्षाधीन है",
      mr: "पडताळणी पुनरावलोकनात आहे"
    },
    statusPending: {
      en: "Awaiting Seller Response",
      hi: "विक्रेता प्रतिक्रिया प्रतीक्षित",
      mr: "विक्रेत्याच्या उत्तराची प्रतीक्षा"
    },
    statusCounterReceived: {
      en: "Counter Offer Received",
      hi: "प्रति-प्रस्ताव प्राप्त",
      mr: "प्रति-ऑफर प्राप्त झाली"
    },
    statusAccepted: {
      en: "Deal Agreed / PO Generated",
      hi: "सौदा तय / खरीद आदेश जारी",
      mr: "करार मंजूर / खरेदी आदेश तयार"
    },
    statusRejected: {
      en: "Closed / Rejected",
      hi: "बंद / अस्वीकृत",
      mr: "बंद / नाकारले"
    },
    orderStatusInTransit: {
      en: "In Transit",
      hi: "पारगमन में (रास्ते में)",
      mr: "वाहतुकीत (मार्गावर)"
    },
    orderStatusDelivered: {
      en: "Delivered (Inspection Pending)",
      hi: "वितरित (निरीक्षण लंबित)",
      mr: "वितरित (तपासणी प्रलंबित)"
    },
    orderStatusCompleted: {
      en: "Escrow Settled",
      hi: "एस्क्रो निपटान पूर्ण",
      mr: "एस्क्रो खात्यातून जमा पूर्ण"
    }
  }
};

for (const [category, keys] of Object.entries(updates)) {
  if (!en[category]) en[category] = {};
  if (!hi[category]) hi[category] = {};
  if (!mr[category]) mr[category] = {};

  for (const [key, tr] of Object.entries(keys)) {
    en[category][key] = tr.en;
    hi[category][key] = tr.hi;
    mr[category][key] = tr.mr;
  }
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2), 'utf8');

console.log('Successfully enriched locales for Step 8 with 100% exact parity!');
