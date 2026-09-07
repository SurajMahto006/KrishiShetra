const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const enPath = path.join(localesDir, 'en.json');
const hiPath = path.join(localesDir, 'hi.json');
const mrPath = path.join(localesDir, 'mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

// Dictionaries to add
const additions = {
  common: {
    loading: { en: "Loading...", hi: "लोड हो रहा है...", mr: "लोड होत आहे..." },
    submitting: { en: "Submitting...", hi: "प्रस्तुत किया जा रहा है...", mr: "सादर केले जात आहे..." },
    saving: { en: "Saving...", hi: "सहेजा जा रहा है...", mr: "जतन केले जात आहे..." },
    refreshing: { en: "Refreshing...", hi: "रिफ्रेश हो रहा है...", mr: "ताजे करत आहे..." },
    viewing: { en: "Viewing", hi: "देख रहे हैं", mr: "पाहत आहे" },
    hoursAgo: { en: "{{count}} hours ago", hi: "{{count}} घंटे पहले", mr: "{{count}} तासांपूर्वी" },
    minutesAgo: { en: "{{count}} minutes ago", hi: "{{count}} मिनट पहले", mr: "{{count}} मिनिटांपूर्वी" },
    daysAgo: { en: "{{count}} days ago", hi: "{{count}} दिन पहले", mr: "{{count}} दिवसांपूर्वी" },
    justNow: { en: "Just now", hi: "अभी-अभी", mr: "आत्ताच" },
    actionRequired: { en: "Action Required", hi: "कार्रवाई आवश्यक", mr: "कारवाई आवश्यक" },
    underReview: { en: "Under Review", hi: "समीक्षाधीन", mr: "पुनरावलोकनाखाली" },
    approved: { en: "Approved", hi: "स्वीकृत", mr: "मंजूर" },
    verified: { en: "Verified", hi: "सत्यापित", mr: "सत्यापित" },
    pending: { en: "Pending", hi: "लंबित", mr: "प्रलंबित" },
    rejected: { en: "Rejected", hi: "अस्वीकृत", mr: "नाकारले" },
    active: { en: "Active", hi: "सक्रिय", mr: "सक्रिय" },
    inactive: { en: "Inactive", hi: "निष्क्रिय", mr: "निष्क्रिय" },
    completed: { en: "Completed", hi: "पूर्ण", mr: "पूर्ण" },
    cancelled: { en: "Cancelled", hi: "रद्द", mr: "रद्द" },
    goodEvening: { en: "Good Evening,", hi: "शुभ संध्या,", mr: "शुभ संध्याकाळ," },
    goodMorning: { en: "Good Morning,", hi: "शुभ प्रभात,", mr: "शुभ सकाळ," },
    goodAfternoon: { en: "Good Afternoon,", hi: "शुभ दोपहर,", mr: "शुभ दुपार," },
    welcomeBack: { en: "Welcome back", hi: "वापसी पर स्वागत है", mr: "पुन्हा स्वागत आहे" },
    confirmAction: { en: "Are you sure? This cannot be undone.", hi: "क्या आप निश्चित हैं? इसे पूर्ववत नहीं किया जा सकता।", mr: "तुम्हाला खात्री आहे का? हे पूर्ववत केले जाऊ शकत नाही." }
  },

  admin: {
    dashboardTitle: { en: "Admin Dashboard", hi: "एडमिन डैशबोर्ड", mr: "प्रशासक डॅशबोर्ड" },
    platformOverviewSubtitle: { en: "Here's what's happening on the KrishiShetra platform today.", hi: "आज कृषिषेत्र प्लेटफॉर्म पर क्या हो रहा है, इसका विवरण।", mr: "आज कृषीक्षेत्र प्लॅटफॉर्मवर काय घडत आहे त्याचा आढावा." },
    registrationTrends: { en: "Registration Trends", hi: "पंजीकरण रुझान", mr: "नोंदणी कल" },
    monthlyUserFarmerReg: { en: "Monthly user & farmer registrations", hi: "मासिक उपयोगकर्ता व किसान पंजीकरण", mr: "मासिक वापरकर्ता व शेतकरी नोंदणी" },
    userDistribution: { en: "User Distribution", hi: "उपयोगकर्ता वितरण", mr: "वापरकर्ता विभागणी" },
    platformRoleBreakdown: { en: "Platform role breakdown", hi: "प्लेटफॉर्म भूमिका विवरण", mr: "प्लॅटफॉर्म भूमिका विभागणी" },
    recentActivity: { en: "Recent Activity", hi: "हाल की गतिविधि", mr: "अलीकडील घडामोडी" },
    latestPlatformEvents: { en: "Latest platform events", hi: "नवीनतम प्लेटफॉर्म घटनाएं", mr: "नवीनतम प्लॅटफॉर्म कार्यक्रम" },
    quickActions: { en: "Quick Actions", hi: "त्वरित कार्य", mr: "जलद कृती" },
    commonAdminTasks: { en: "Common admin tasks", hi: "सामान्य व्यवस्थापक कार्य", mr: "सामान्य प्रशासकीय कामे" },
    addFarmer: { en: "Add Farmer", hi: "किसान जोड़ें", mr: "शेतकरी जोडा" },
    verifyKyc: { en: "Verify KYC", hi: "केवाईसी सत्यापित करें", mr: "केवायसी पडताळणी" },
    exportReport: { en: "Export Report", hi: "रिपोर्ट निर्यात करें", mr: "अहवाल निर्यात करा" },
    systemAlerts: { en: "System Alerts", hi: "सिस्टम अलर्ट", mr: "प्रणाली सूचना" },
    platformHealth: { en: "Platform Health", hi: "प्लेटफॉर्म स्वास्थ्य", mr: "प्लॅटफॉर्म आरोग्य" },
    kpis: { en: "Key performance indicators", hi: "प्रमुख प्रदर्शन संकेतक", mr: "प्रमुख कामगिरी निर्देशक" },
    notificationsToast: { en: "{{count}} new notifications", hi: "{{count}} नई सूचनाएं", mr: "{{count}} नवीन सूचना" },
    exportingChartData: { en: "Exporting chart data...", hi: "चार्ट डेटा निर्यात हो रहा है...", mr: "आलेख डेटा निर्यात होत आहे..." },
    loadingFullActivityLog: { en: "Loading full activity log...", hi: "संपूर्ण गतिविधि लॉग लोड हो रहा है...", mr: "संपूर्ण कार्य नोंद लोड होत आहे..." },
    generatingReports: { en: "Generating reports...", hi: "रिपोर्ट तैयार की जा रही है...", mr: "अहवाल तयार होत आहे..." },
    refreshingData: { en: "Refreshing data...", hi: "डेटा ताज़ा हो रहा है...", mr: "डेटा ताजे करत आहे..." },
    openingKycQueue: { en: "Opening KYC review queue...", hi: "केवाईसी समीक्षा कतार खोली जा रही है...", mr: "केवायसी पुनरावलोकन रांग उघडत आहे..." },
    viewingFarmerToast: { en: "Viewing farmer: {{name}}", hi: "किसान देख रहे हैं: {{name}}", mr: "शेतकरी पाहत आहे: {{name}}" },
    viewingUserToast: { en: "Viewing: {{name}}", hi: "देख रहे हैं: {{name}}", mr: "पाहत आहे: {{name}}" },
    updatingReportRange: { en: "Updating report range...", hi: "रिपोर्ट सीमा अपडेट हो रही है...", mr: "अहवाल श्रेणी अद्यतनित होत आहे..." },
    generatingFullReportPdf: { en: "Generating full report PDF...", hi: "पूर्ण रिपोर्ट पीडीएफ तैयार की जा रही है...", mr: "पूर्ण अहवाल पीडीएफ तयार होत आहे..." },
    exportingGmvData: { en: "Exporting GMV data...", hi: "जीएमवी डेटा निर्यात हो रहा है...", mr: "जीएमव्ही डेटा निर्यात होत आहे..." },
    exportingPriceData: { en: "Exporting price data...", hi: "मूल्य डेटा निर्यात हो रहा है...", mr: "किंमत डेटा निर्यात होत आहे..." },
    refreshingMetrics: { en: "Refreshing metrics...", hi: "मेट्रिक्स ताज़ा हो रहे हैं...", mr: "मापदंड ताजे केले जात आहेत..." },
    downloadingAuditLog: { en: "Downloading audit log...", hi: "ऑडिट लॉग डाउनलोड हो रहा है...", mr: "ऑडिट नोंद डाउनलोड होत आहे..." },
    superAdminConfirmToast: { en: "This action requires Super Admin confirmation.", hi: "इस कार्रवाई के लिए सुपर एडमिन पुष्टि की आवश्यकता है।", mr: "या कृतीसाठी सुपर प्रशासकाच्या पुष्टीकरणाची आवश्यकता आहे." },
    loginSuccessRedirecting: { en: "Login successful! Redirecting to dashboard...", hi: "लॉगिन सफल! डैशबोर्ड पर पुनर्निर्देशित किया जा रहा है...", mr: "लॉगिन यशस्वी! डॅशबोर्डवर पुनर्निर्देशित करत आहे..." },
    settingsSavedSuccess: { en: "Settings saved successfully!", hi: "सेटिंग्स सफलतापूर्वक सहेजी गईं!", mr: "सेटिंग्ज यशस्वीरित्या जतन केल्या!" },
    farmerManagement: { en: "Farmer Management", hi: "किसान प्रबंधन", mr: "शेतकरी व्यवस्थापन" },
    userManagement: { en: "User Management", hi: "उपयोगकर्ता प्रबंधन", mr: "वापरकर्ता व्यवस्थापन" },
    reportsAnalytics: { en: "Reports & Analytics", hi: "रिपोर्ट और एनालिटिक्स", mr: "अहवाल आणि विश्लेषण" },
    platformSettings: { en: "Platform Settings", hi: "प्लेटफॉर्म सेटिंग्स", mr: "प्लॅटफॉर्म सेटिंग्ज" },
    storageGovernance: { en: "Storage Governance", hi: "भंडारण प्रशासन", mr: "गोदाम प्रशासन" }
  },

  transporter: {
    fleetGpsSynced: { en: "Fleet GPS Telemetry synchronized with MoRTH AIS-140 servers.", hi: "फ्लीट जीपीएस टेलीमेट्री सड़क परिवहन मंत्रालय के एआईएस-140 सर्वर के साथ समन्वयित।", mr: "फ्लीट जीपीएस टेलिमेट्री रस्ते वाहतूक मंत्रालयाच्या एआयएस-140 सर्व्हरसह समक्रमित." },
    refreshedLoads: { en: "Refreshed available loads.", hi: "उपलब्ध भार ताज़ा किए गए।", mr: "उपलब्ध वाहतूक लोड ताजे केले." },
    newHighValueLoads: { en: "New high-value loads posted in your corridor!", hi: "आपके कॉरिडोर में नए उच्च-मूल्य लोड पोस्ट किए गए!", mr: "तुमच्या मार्गावर नवीन उच्च मूल्याचे लोड उपलब्ध आहेत!" },
    fastagAutoTopupOn: { en: "FASTag Auto-Recharge enabled via HDFC Corporate.", hi: "फास्टैग ऑटो-रिचार्ज एचडीएफसी कॉर्पोरेट द्वारा सक्षम किया गया।", mr: "फास्टॅग ऑटो-रिचार्ज एचडीएफसी कॉर्पोरेटद्वारे सक्षम केले." },
    dlVerificationDownloaded: { en: "Driver DL verification certificate downloaded for {{name}}.", hi: "{{name}} के लिए ड्राइवर डीएल सत्यापन प्रमाणपत्र डाउनलोड किया गया।", mr: "{{name}} यांच्यासाठी चालक डीएल पडताळणी प्रमाणपत्र डाउनलोड केले." },
    exportingGstLedger: { en: "Exporting GST B2B Freight Ledger (GSTR-1 format)...", hi: "जीएसटी बी2बी फ्रेट बहीखाता (जीएसटीआर-1 प्रारूप) निर्यात हो रहा है...", mr: "जीएसटी बी2बी वाहतूक खातेवही निर्यात होत आहे..." },
    downloadingTaxInvoice: { en: "Downloading Tax Invoice {{id}} (PDF)...", hi: "कर इनवॉइस {{id}} (पीडीएफ) डाउनलोड हो रहा है...", mr: "कर बीजक {{id}} (पीडीएफ) डाउनलोड होत आहे..." },
    vehicleDetailsExported: { en: "Vehicle details for {{regNo}} exported to VAHAN format.", hi: "{{regNo}} के लिए वाहन विवरण वाहन पोर्टल प्रारूप में निर्यात किया गया।", mr: "{{regNo}} साठी वाहन तपशील वाहन पोर्टल स्वरूपात निर्यात केले." },
    profileUpdatedSuccess: { en: "Profile updated successfully!", hi: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!", mr: "प्रोफाइल यशस्वीरित्या अद्यतनित केली!" },
    corridorRouteAdded: { en: "New corridor route added!", hi: "नया कॉरिडोर मार्ग जोड़ा गया!", mr: "नवीन वाहतूक मार्ग जोडला!" },
    loadAcceptedAssigned: { en: "Load {{loadId}} accepted successfully! Assigned to {{truck}} ({{driver}}) for ₹{{amount}}.", hi: "लोड {{loadId}} सफलतापूर्वक स्वीकार किया गया! {{truck}} ({{driver}}) को ₹{{amount}} में सौंपा गया।", mr: "लोड {{loadId}} यशस्वीरित्या स्वीकारला! {{truck}} ({{driver}}) यांना ₹{{amount}} मध्ये नेमून दिला." },
    driverPingSent: { en: "Driver location ping sent via SMS & WhatsApp.", hi: "एसएमएस और व्हाट्सएप के माध्यम से ड्राइवर लोकेशन पिंग भेजा गया।", mr: "एसएमएस आणि व्हॉट्सअॅपद्वारे चालकाला लोकेशन पिंग पाठवले." },
    enterValidOtp: { en: "Please enter valid 4-digit OTP provided by destination mandi receiver.", hi: "कृपया गंतव्य मंडी प्राप्तकर्ता द्वारा प्रदान किया गया मान्य 4-अंकीय ओटीपी दर्ज करें।", mr: "कृपया गंतव्य बाजार प्राप्तकर्त्याने दिलेला वैध 4-अंकी ओटीपी प्रविष्ट करा." },
    podOtpVerifiedPayout: { en: "POD OTP verified successfully for {{tripId}}! Escrow freight payout ₹{{amount}} released to your wallet.", hi: "{{tripId}} के लिए पीओडी ओटीपी सत्यापित! एस्क्रो भाड़ा भुगतान ₹{{amount}} आपके वॉलेट में जारी किया गया।", mr: "{{tripId}} साठी पीओडी ओटीपी सत्यापित! एस्क्रो वाहतूक मोबदला ₹{{amount}} तुमच्या पाकिटात जमा झाला." },
    onboardingDocsApproved: { en: "Onboarding & Verification documents submitted! Status: APPROVED (Gold Carrier Badge Granted).", hi: "ऑनबोर्डिंग और सत्यापन दस्तावेज जमा किए गए! स्थिति: स्वीकृत (गोल्ड कैरियर बैज प्रदान किया गया)।", mr: "नोंदणी व पडताळणी कागदपत्रे सादर केली! स्थिती: मंजूर (गोल्ड कॅरियर बॅज प्रदान)." },
    docVerifiedMorth: { en: "Document verified with Ministry of Road Transport & Highways database!", hi: "सड़क परिवहन एवं राजमार्ग मंत्रालय के डेटाबेस से दस्तावेज सत्यापित!", mr: "रस्ते वाहतूक आणि महामार्ग मंत्रालय डेटाबेससह दस्तऐवज सत्यापित!" },
    rcFileAttached: { en: "RC file attached successfully!", hi: "आरसी फ़ाइल सफलतापूर्वक संलग्न की गई!", mr: "आरसी फाइल यशस्वीरित्या जोडली!" },
    vehicleOnboardedSuccess: { en: "Vehicle {{reg}} onboarded successfully!", hi: "वाहन {{reg}} सफलतापूर्वक पंजीकृत किया गया!", mr: "वाहन {{reg}} यशस्वीरित्या नोंदणीकृत केले!" },
    dlScanAttached: { en: "DL scan attached and SARATHI verified!", hi: "डीएल स्कैन संलग्न और सारथी पोर्टल से सत्यापित!", mr: "डीएल स्कॅन जोडले आणि सारथी पोर्टलवरून सत्यापित केले!" },
    driverOnboardedSuccess: { en: "Driver {{name}} onboarded and verified!", hi: "चालक {{name}} का ऑनबोर्डिंग और सत्यापन पूरा हुआ!", mr: "चालक {{name}} ची नोंदणी आणि पडताळणी पूर्ण झाली!" },
    payoutInitiatedToBank: { en: "Payout of ₹{{amount}} initiated to your bank account! Reference: {{ref}}", hi: "₹{{amount}} का भुगतान आपके बैंक खाते में भेजा गया! संदर्भ: {{ref}}", mr: "₹{{amount}} चा परतावा तुमच्या बँक खात्यात पाठवला! संदर्भ: {{ref}}" }
  },

  fpo: {
    farmerRegisteredToLot: { en: "Farmer {{name}} successfully registered to {{lot}}!", hi: "किसान {{name}} सफलतापूर्वक {{lot}} में पंजीकृत हुए!", mr: "शेतकरी {{name}} यांची {{lot}} मध्ये यशस्वी नोंदणी झाली!" },
    sendWhatsAppSlip: { en: "Send WhatsApp Slip", hi: "व्हाट्सएप पर्ची भेजें", mr: "व्हॉट्सअॅप पावती पाठवा" },
    receiptSentToWhatsApp: { en: "Receipt sent to farmer WhatsApp!", hi: "रसीद किसान के व्हाट्सएप पर भेजी गई!", mr: "पावती शेतकऱ्याच्या व्हॉट्सअॅपवर पाठवली!" },
    contractInitiatedWith: { en: "Contract initiated with {{buyer}}!", hi: "{{buyer}} के साथ अनुबंध शुरू किया गया!", mr: "{{buyer}} सोबत करार सुरू केला!" },
    newAggregatedLotPublished: { en: "New Aggregated Lot successfully published to buyers network!", hi: "नया समूहीकृत लॉट खरीदार नेटवर्क पर सफलतापूर्वक प्रकाशित!", mr: "नवीन एकत्रित लॉट खरेदीदार नेटवर्कवर यशस्वीरित्या प्रकाशित!" },
    orderConfirmedDispatched: { en: "Order confirmed! Dispatched to Logistics fulfillment.", hi: "ऑर्डर की पुष्टि हो गई! रसद पूर्ति के लिए भेजा गया।", mr: "ऑर्डर पुष्टी झाली! वाहतूक पूर्ततेसाठी पाठवले." },
    selectedOfferFrom: { en: "Selected {{buyer}} offer", hi: "{{buyer}} का प्रस्ताव चुना गया", mr: "{{buyer}} यांची ऑफर निवडली" },
    newBuyerInquiriesAlert: { en: "{{count}} New buyer purchase inquiries received in the last 2 hours!", hi: "पिछले 2 घंटों में {{count}} नई खरीदार पूछताछ प्राप्त हुईं!", mr: "गेल्या २ तासांत {{count}} नवीन खरेदीदार चौकशी प्राप्त झाल्या!" },
    updatedMarketPriceTrends: { en: "Updated market price trends for {{crop}}", hi: "{{crop}} के लिए बाजार भाव रुझान अपडेट किए गए", mr: "{{crop}} साठी बाजार भाव कल अद्यतनित केले" }
  },

  farmer: {
    counterOfferSentSuccess: { en: "Counter offer sent to buyer! ✓", hi: "खरीदार को जवाबी प्रस्ताव भेजा गया! ✓", mr: "खरेदीदाराला प्रति-प्रस्ताव पाठवला! ✓" },
    inquiryAcceptedSuccess: { en: "Buyer inquiry accepted successfully!", hi: "खरीदार की पूछताछ सफलतापूर्वक स्वीकार की गई!", mr: "खरेदीदाराची चौकशी यशस्वीरित्या स्वीकारली!" },
    inquiryRejectedSuccess: { en: "Inquiry rejected.", hi: "पूछताछ अस्वीकृत कर दी गई।", mr: "चौकशी नाकारली गेली." },
    confirmRejectInquiry: { en: "Reject this buyer inquiry?", hi: "क्या आप इस खरीदार पूछताछ को अस्वीकार करना चाहते हैं?", mr: "तुम्ही ही खरेदीदार चौकशी नाकारू इच्छिता का?" },
    voiceReadAloudUnsupported: { en: "Voice read-aloud is not supported on this browser.", hi: "इस ब्राउज़र पर वॉइस रीड-अलाउड समर्थित नहीं है।", mr: "या ब्राउझरवर व्हॉइस रीड-अलाउड समर्थित नाही." },
    locatedNearestMandis: { en: "Located! Showing nearest mandis.", hi: "स्थान मिल गया! निकटतम मंडियां दिखाई जा रही हैं।", mr: "स्थान सापडले! जवळचे बाजार दाखवत आहे." },
    geolocationNotSupported: { en: "Geolocation not supported. Choose a city from the dropdown.", hi: "जियोलोकेशन समर्थित नहीं है। ड्रॉपडाउन से एक शहर चुनें।", mr: "जिओलोकेशन समर्थित नाही. ड्रॉपडाउनमधून एक शहर निवडा." },
    locationOutsideIndia: { en: "Location appears to be outside India. Please select your city manually.", hi: "स्थान भारत से बाहर प्रतीत होता है। कृपया अपना शहर मैन्युअल रूप से चुनें।", mr: "स्थान भारताबाहेर दिसत आहे. कृपया तुमचे शहर स्वतः निवडा." }
  },

  cropLot: {
    myLotsHeader: { en: "My Listed Lots", hi: "मेरे सूचीबद्ध लॉट", mr: "माझे सूचीबद्ध लॉट्स" },
    createNewLot: { en: "Create New Lot", hi: "नया लॉट बनाएं", mr: "नवीन लॉट तयार करा" },
    noLotsFoundDesc: { en: "You have not listed any crop lots yet. Create your first lot to connect with verified buyers.", hi: "आपने अभी तक कोई फसल लॉट सूचीबद्ध नहीं किया है। सत्यापित खरीदारों से जुड़ने के लिए अपना पहला लॉट बनाएं।", mr: "तुम्ही अजून कोणताही पीक लॉट सूचीबद्ध केलेला नाही. पडताळणी केलेल्या खरेदीदारांशी जोडण्यासाठी तुमचा पहिला लॉट तयार करा." },
    lotCreatedSuccess: { en: "Crop lot created and listed on market successfully!", hi: "फसल लॉट सफलतापूर्वक बनाया गया और बाजार में सूचीबद्ध हुआ!", mr: "पीक लॉट यशस्वीरित्या तयार केले आणि बाजारात सूचीबद्ध केले!" }
  },

  orders: {
    statusUpdatedSuccess: { en: "Order {{orderId}} status updated to {{status}} ✓", hi: "ऑर्डर {{orderId}} की स्थिति बदलकर {{status}} की गई ✓", mr: "ऑर्डर {{orderId}} स्थिती {{status}} वर अद्यतनित केली ✓" }
  },

  errors: {
    somethingWentWrong: { en: "Something went wrong. Please try again.", hi: "कुछ गलत हो गया। कृपया पुन: प्रयास करें।", mr: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा." },
    noDataAvailable: { en: "No data available at this time.", hi: "इस समय कोई डेटा उपलब्ध नहीं है।", mr: "या वेळी कोणताही डेटा उपलब्ध नाही." },
    actionFailed: { en: "Action could not be completed.", hi: "कार्रवाई पूरी नहीं हो सकी।", mr: "कृती पूर्ण करता आली नाही." },
    failedToAcceptInquiry: { en: "Failed to accept inquiry.", hi: "पूछताछ स्वीकार करने में विफल।", mr: "चौकशी स्वीकारण्यात अयशस्वी." },
    failedToRejectInquiry: { en: "Failed to reject inquiry.", hi: "पूछताछ अस्वीकार करने में विफल।", mr: "चौकशी नाकारण्यात अयशस्वी." },
    failedToSendCounterOffer: { en: "Failed to send counter offer.", hi: "जवाबी प्रस्ताव भेजने में विफल।", mr: "प्रति-प्रस्ताव पाठवण्यात अयशस्वी." },
    couldNotAccessGps: { en: "Could not access GPS location. Showing accredited facilities.", hi: "जीपीएस स्थान तक नहीं पहुंच सके। मान्यता प्राप्त सुविधाएं दिखाई जा रही हैं।", mr: "जीपीएस स्थानावर प्रवेश करू शकलो नाही. मान्यताप्राप्त गोदामे दाखवत आहे." }
  },

  success: {
    actionSuccess: { en: "Action completed successfully!", hi: "कार्रवाई सफलतापूर्वक पूरी हुई!", mr: "कृती यशस्वीरित्या पूर्ण झाली!" }
  }
};

// Merge additions into en, hi, mr
let addedCount = 0;
Object.keys(additions).forEach(cat => {
  if (!en[cat]) en[cat] = {};
  if (!hi[cat]) hi[cat] = {};
  if (!mr[cat]) mr[cat] = {};

  Object.keys(additions[cat]).forEach(key => {
    en[cat][key] = additions[cat][key].en;
    hi[cat][key] = additions[cat][key].hi;
    mr[cat][key] = additions[cat][key].mr;
    addedCount++;
  });
});

console.log(`Added ${addedCount} keys across all categories.`);

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2) + '\n', 'utf8');
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2) + '\n', 'utf8');

console.log('Saved en.json, hi.json, and mr.json successfully.');
