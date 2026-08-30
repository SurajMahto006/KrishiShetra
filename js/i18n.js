/**
 * KRISHISHETRA — COMPREHENSIVE MULTILINGUAL ENGINE (i18n)
 * English (EN) + हिंदी (HI) + मराठी (MR)
 * 
 * Production-grade farmer-first internationalization system:
 * - Single source of truth for all translations
 * - Live in-place DOM translation without page reload or state loss
 * - Locale-aware date, currency, and numerical formatting
 * - Multilingual crop & mandi entity resolvers for search
 * - LocalStorage persistence and fallback guarantee
 */

(function () {
  'use strict';

  const TRANSLATIONS = {
    en: {
      meta: {
        languageName: 'English',
        languageNative: 'English',
        code: 'en'
      },
      nav: {
        brandSub: 'Farmer Intelligence',
        searchPlaceholder: 'Search crops, mandis, buyers... (Ctrl+K)',
        dashboard: 'Dashboard',
        lots: 'My Lots',
        market: 'Market Prices',
        forecast: 'AI Forecast',
        buyers: 'Buyers',
        orders: 'Orders',
        sellCrop: '+ Sell Crop',
        notifications: 'Notifications',
        language: 'Language',
        help: 'Help & Toll Free',
        profile: 'Profile Settings',
        myLotsMenu: 'My Crop Lots',
        priceAlertsMenu: 'Price Alerts',
        helpMenu: 'Help & Support',
        logout: 'Logout',
        quickNavHome: 'Home',
        quickNavMarket: 'Market',
        quickNavLots: 'Lots',
        quickNavForecast: 'AI Forecast',
        quickNavBuyers: 'Buyers',
        quickNavOrders: 'Orders'
      },
      hero: {
        greeting: 'Good Morning, Rajesh',
        headline: 'Make smarter selling decisions with',
        headlineEm: 'KrishiShetra.',
        subtext: 'Track live mandi prices, get AI forecasts, and sell directly to verified institutional buyers across India.',
        btnSell: '+ Sell Your Crop',
        btnMarket: 'View Market Prices',
        location: 'Maharashtra (Pune APMC)',
        weather: '29°C · Clear Sky',
        liveBadge: 'Live Market Data'
      },
      stats: {
        activeLots: 'Active Lots',
        lotsSub: '2 crops listed',
        bestPrice: 'Best Market Price',
        bestPriceSub: 'Mumbai APMC · ↑ 6.1%',
        buyerOffers: 'Buyer Offers',
        offersSub: '₹2,17,700 offered',
        pendingOrders: 'Pending Orders',
        ordersSub: '₹99,500 in progress',
        tagLive: 'Live',
        tagPickup: 'Pickup',
        tagActive: 'Active'
      },
      actions: {
        title: 'Quick Actions',
        sellCrop: 'Sell Crop',
        sellCropDesc: 'Add new crop lot',
        marketPrices: 'Market Prices',
        marketPricesDesc: '15 APMC mandis',
        findBuyers: 'Find Buyers',
        findBuyersDesc: 'Verified procurement',
        aiForecast: 'AI Forecast',
        aiForecastDesc: 'Price predictions',
        priceAlerts: 'Price Alerts',
        priceAlertsDesc: 'SMS & App alerts',
        myLots: 'My Lots',
        myLotsDesc: 'Manage listings'
      },
      oppCard: {
        badge: 'AI Recommendation · Live Analysis',
        title: 'Smart Selling Opportunity',
        desc: 'Your listed rice inventory is currently worth approximately:',
        currentMarket: 'Current Market',
        recTarget: 'Recommended Target',
        extraIncome: 'Potential Extra Realization',
        btnFindBuyer: 'Find Best Buyer'
      },
      insights: {
        eyebrow: 'Market Intelligence',
        title: 'Market Intelligence & Insights',
        subtitle: 'Real-time agricultural price signals & buyer movements for Maharashtra mandis',
        fullOverview: 'Full Market Overview',
        tagLive: 'Live Signal',
        tagWarm: 'High Momentum',
        tagArrival: 'Arrival Surge',
        tagBest: 'Top Mandi',
        insight1: 'Rice demand is <strong>increasing by 14%</strong> across Maharashtra mandis due to institutional buying.',
        insight2: 'Onion prices are <strong>rising in Pune & Nashik</strong>. Current price is ₹2,850/q, 12% above seasonal average.',
        insight3: 'Tomato market arrivals are <strong>up by 20%</strong> in Solapur. Recommended to sell fresh harvest within 2 days.',
        insight4: '<strong>Mumbai APMC (Vashi)</strong> currently offers highest realization on premium grade grain lots.'
      },
      crops: {
        rice: 'Rice (Paddy)',
        wheat: 'Wheat',
        maize: 'Maize (Corn)',
        soybean: 'Soybean',
        pulses: 'Pulses (Tur/Chana)',
        onion: 'Onion',
        tomato: 'Tomato',
        potato: 'Potato',
        chilli: 'Chilli',
        groundnut: 'Groundnut',
        cotton: 'Cotton',
        sugarcane: 'Sugarcane',
        mango: 'Mango',
        banana: 'Banana',
        grapes: 'Grapes'
      },
      mandis: {
        pune: 'Pune APMC',
        mumbai: 'Mumbai APMC (Vashi)',
        nashik: 'Nashik APMC',
        nagpur: 'Nagpur APMC',
        solapur: 'Solapur APMC',
        indore: 'Indore Mandi',
        guntur: 'Guntur APMC',
        rajkot: 'Rajkot APMC'
      },
      units: {
        perQuintal: '₹/quintal',
        quintals: 'Quintals',
        q: 'q',
        rupee: '₹'
      },
      modals: {
        createLotTitle: 'Create New Crop Listing',
        selectCrop: 'Select Crop',
        quantity: 'Quantity (Quintals)',
        expectedPrice: 'Expected Price per Quintal (₹)',
        harvestDate: 'Harvest / Ready Date',
        qualityGrade: 'Quality Grade',
        location: 'Farm Location / Village',
        description: 'Crop Variety & Quality Notes',
        btnSubmitLot: 'Publish Crop Listing',
        btnCancel: 'Cancel',
        editLotTitle: 'Edit Crop Lot',
        btnSaveLot: 'Save Changes',
        notificationsTitle: 'Recent Notifications',
        markAllRead: 'Mark all as read',
        languageTitle: 'Select Preferred Language',
        helpTitle: 'Farmer Support & Advisory',
        kisanHelpline: 'Kisan Call Center (Toll-Free)',
        apmcHelpline: 'Maharashtra APMC Direct Desk',
        profileTitle: 'Farmer Profile & Settings',
        farmerName: 'Full Name',
        phoneNumber: 'Mobile Number (Linked with Aadhaar)',
        stateDistrict: 'State & District',
        landSize: 'Land Holding (Acres)',
        saveProfile: 'Save Profile',
        alertTitle: 'Create Mandi Price Alert',
        alertTargetPrice: 'Alert me when market price reaches (₹/q)',
        alertNotificationType: 'Notification Channels',
        btnSetAlert: 'Activate Price Alert'
      },
      common: {
        loading: 'Loading live data...',
        searchNoResults: 'No matching records found. Try another crop or market.',
        savedSuccess: 'Changes saved successfully.',
        deleteConfirm: 'Are you sure you want to delete this listing?',
        viewDetails: 'View Details',
        active: 'Active',
        pending: 'Pending',
        sold: 'Sold',
        paused: 'Paused',
        verified: 'Verified Buyer',
        viewAll: 'View All'
      }
    },

    hi: {
      meta: {
        languageName: 'Hindi',
        languageNative: 'हिंदी',
        code: 'hi'
      },
      nav: {
        brandSub: 'किसान बाज़ार साथी',
        searchPlaceholder: 'फसल, मंडी, खरीदार खोजें... (Ctrl+K)',
        dashboard: 'डैशबोर्ड',
        lots: 'मेरी फसलें',
        market: 'मंडी भाव',
        forecast: 'AI पूर्वानुमान',
        buyers: 'खरीदार',
        orders: 'ऑर्डर',
        sellCrop: '+ फसल बेचें',
        notifications: 'सूचनाएं',
        language: 'भाषा',
        help: 'सहायता एवं कॉल सेंटर',
        profile: 'प्रोफ़ाइल सेटिंग्स',
        myLotsMenu: 'मेरी सूचीबद्ध फसलें',
        priceAlertsMenu: 'भाव अलर्ट',
        helpMenu: 'किसान सहायता',
        logout: 'लॉग आउट',
        quickNavHome: 'होम',
        quickNavMarket: 'मंडी भाव',
        quickNavLots: 'मेरी फसलें',
        quickNavForecast: 'AI पूर्वानुमान',
        quickNavBuyers: 'खरीदार',
        quickNavOrders: 'ऑर्डर'
      },
      hero: {
        greeting: 'सुप्रभात, राजेश जी',
        headline: 'अपनी फसल का सही दाम पाएं,',
        headlineEm: 'KrishiShetra के साथ।',
        subtext: 'लाइव मंडी भाव देखें, AI भाव पूर्वानुमान समझें और सीधे सत्यापित संस्थागत खरीदारों को फसल बेचें।',
        btnSell: '+ अपनी फसल बेचें',
        btnMarket: 'मंडी भाव देखें',
        location: 'महाराष्ट्र (पुणे APMC)',
        weather: '29°C · साफ़ मौसम',
        liveBadge: 'लाइव मंडी डेटा'
      },
      stats: {
        activeLots: 'सक्रिय फसलें',
        lotsSub: '2 फसलें सूचीबद्ध',
        bestPrice: 'सबसे अच्छा मंडी भाव',
        bestPriceSub: 'मुंबई APMC · ↑ 6.1% बढ़ोतरी',
        buyerOffers: 'खरीदार ऑफ़र',
        offersSub: '₹2,17,700 कुल मांग',
        pendingOrders: 'प्रक्रियाधीन ऑर्डर',
        ordersSub: '₹99,500 चालू ऑर्डर',
        tagLive: 'लाइव',
        tagPickup: 'पिकअप',
        tagActive: 'सक्रिय'
      },
      actions: {
        title: 'त्वरित सेवाएं',
        sellCrop: 'फसल बेचें',
        sellCropDesc: 'नई फसल जोड़ें',
        marketPrices: 'मंडी भाव',
        marketPricesDesc: '15 APMC मंडियां',
        findBuyers: 'खरीदार खोजें',
        findBuyersDesc: 'सत्यापित कंपनियां',
        aiForecast: 'AI पूर्वानुमान',
        aiForecastDesc: 'भाव का भविष्य',
        priceAlerts: 'भाव अलर्ट',
        priceAlertsDesc: 'SMS और ऐप अलर्ट',
        myLots: 'मेरी फसलें',
        myLotsDesc: 'फसल लिस्टिंग संभालें'
      },
      oppCard: {
        badge: 'AI सिफारिश · लाइव विश्लेषण',
        title: 'बेचने का सही मौका',
        desc: 'आपकी सूचीबद्ध धान (चावल) फसल का अनुमानित कुल मूल्य:',
        currentMarket: 'वर्तमान मंडी भाव',
        recTarget: 'सुझाया गया लक्ष्य भाव',
        extraIncome: 'संभावित अतिरिक्त कमाई',
        btnFindBuyer: 'सर्वश्रेष्ठ खरीदार खोजें'
      },
      insights: {
        eyebrow: 'बाज़ार की ताज़ा जानकारी',
        title: 'मंडी समाचार एवं बाज़ार संकेत',
        subtitle: 'महाराष्ट्र की प्रमुख मंडियों के ताज़ा भाव व खरीदारों की हलचल',
        fullOverview: 'संपूर्ण मंडी विश्लेषण',
        tagLive: 'लाइव संकेत',
        tagWarm: 'मजबूत मांग',
        tagArrival: 'आवक वृद्धि',
        tagBest: 'शीर्ष मंडी',
        insight1: 'संस्थागत खरीद के कारण महाराष्ट्र की मंडियों में धान की मांग <strong>14% बढ़ गई है</strong>।',
        insight2: 'पुणे व नाशिक में प्याज़ के भाव <strong>तेज़ी से बढ़ रहे हैं</strong>। वर्तमान भाव ₹2,850/क्विंटल है।',
        insight3: 'सोलापुर मंडी में टमाटर की <strong>आवक 20% बढ़ गई है</strong>। ताज़ा फसल 2 दिनों में बेचने की सलाह है।',
        insight4: '<strong>मुंबई APMC (वाशी)</strong> में उत्तम गुणवत्ता की उपज पर सबसे अधिक भाव मिल रहा है।'
      },
      crops: {
        rice: 'धान (चावल)',
        wheat: 'गेहूं',
        maize: 'मक्का',
        soybean: 'सोयाबीन',
        pulses: 'दालें (तुअर/चना)',
        onion: 'प्याज़',
        tomato: 'टमाटर',
        potato: 'आलू',
        chilli: 'मिर्च',
        groundnut: 'मूंगफली',
        cotton: 'कपास',
        sugarcane: 'गन्ना',
        mango: 'आम',
        banana: 'केला',
        grapes: 'अंगूर'
      },
      mandis: {
        pune: 'पुणे APMC',
        mumbai: 'मुंबई APMC (वाशी)',
        nashik: 'नाशिक APMC',
        nagpur: 'नागपुर APMC',
        solapur: 'सोलापुर APMC',
        indore: 'इंदौर मंडी',
        guntur: 'गुंटूर APMC',
        rajkot: 'राजकोट APMC'
      },
      units: {
        perQuintal: '₹/क्विंटल',
        quintals: 'क्विंटल',
        q: 'क्विं.',
        rupee: '₹'
      },
      modals: {
        createLotTitle: 'नई फसल बिक्री हेतु जोड़ें',
        selectCrop: 'फसल चुनें',
        quantity: 'मात्रा (क्विंटल में)',
        expectedPrice: 'अपेक्षित मूल्य प्रति क्विंटल (₹)',
        harvestDate: 'कटाई / तैयारी की तिथि',
        qualityGrade: 'गुणवत्ता ग्रेड',
        location: 'खेत का स्थान / गांव',
        description: 'फसल की किस्म एवं गुणवत्ता का विवरण',
        btnSubmitLot: 'फसल लिस्टिंग प्रकाशित करें',
        btnCancel: 'रद्द करें',
        editLotTitle: 'फसल विवरण बदलें',
        btnSaveLot: 'बदलाव सहेजें',
        notificationsTitle: 'ताज़ा सूचनाएं',
        markAllRead: 'सभी पढ़ा हुआ चिह्नित करें',
        languageTitle: 'अपनी भाषा चुनें',
        helpTitle: 'किसान सहायता केंद्र',
        kisanHelpline: 'किसान कॉल सेंटर (टोल-फ्री)',
        apmcHelpline: 'महाराष्ट्र APMC सहायता डेस्क',
        profileTitle: 'किसान प्रोफ़ाइल व सेटिंग्स',
        farmerName: 'पूरा नाम',
        phoneNumber: 'मोबाइल नंबर (आधार लिंक)',
        stateDistrict: 'राज्य एवं ज़िला',
        landSize: 'खेत का क्षेत्रफल (एकड़)',
        saveProfile: 'प्रोफ़ाइल सहेजें',
        alertTitle: 'मंडी भाव अलर्ट बनाएं',
        alertTargetPrice: 'जब भाव इस स्तर पर पहुंचे तो अलर्ट भेजें (₹/क्विंटल)',
        alertNotificationType: 'सूचना माध्यम',
        btnSetAlert: 'भाव अलर्ट सक्रिय करें'
      },
      common: {
        loading: 'लाइव डेटा लोड हो रहा है...',
        searchNoResults: 'कोई परिणाम नहीं मिला। कृपया दूसरी फसल या मंडी खोजें।',
        savedSuccess: 'जानकारी सफलतापूर्वक सहेज ली गई।',
        deleteConfirm: 'क्या आप इस फसल लिस्टिंग को हटाना चाहते हैं?',
        viewDetails: 'विवरण देखें',
        active: 'सक्रिय',
        pending: 'प्रतीक्षारत',
        sold: 'बिक चुका',
        paused: 'रोका गया',
        verified: 'सत्यापित खरीदार',
        viewAll: 'सभी देखें'
      }
    },

    mr: {
      meta: {
        languageName: 'Marathi',
        languageNative: 'मराठी',
        code: 'mr'
      },
      nav: {
        brandSub: 'शेतकरी बाजार साथी',
        searchPlaceholder: 'पीक, बाजार समिती, खरेदीदार शोधा... (Ctrl+K)',
        dashboard: 'डॅशबोर्ड',
        lots: 'माझी पिके',
        market: 'बाजारभाव',
        forecast: 'AI अंदाज',
        buyers: 'खरेदीदार',
        orders: 'ऑर्डर्स',
        sellCrop: '+ पीक विका',
        notifications: 'सूचना',
        language: 'भाषा',
        help: 'मदत व कॉल सेंटर',
        profile: 'प्रोफाइल सेटिंग',
        myLotsMenu: 'माझी नोंदवलेली पिके',
        priceAlertsMenu: 'भाव अलर्ट',
        helpMenu: 'शेतकरी मदत',
        logout: 'लॉग आउट',
        quickNavHome: 'मुख्य',
        quickNavMarket: 'बाजारभाव',
        quickNavLots: 'माझी पिके',
        quickNavForecast: 'AI अंदाज',
        quickNavBuyers: 'खरेदीदार',
        quickNavOrders: 'ऑर्डर्स'
      },
      hero: {
        greeting: 'शुभ सकाळ, राजेश जी',
        headline: 'पिकाला मिळवा योग्य भाव,',
        headlineEm: 'KrishiShetra सोबत.',
        subtext: 'थेट चालू बाजारभाव तपासा, AI भाव अंदाज जाणून घ्या आणि थेट नामांकित संस्थात्मक खरेदीदारांना पीक विका.',
        btnSell: '+ आपले पीक विका',
        btnMarket: 'बाजारभाव पहा',
        location: 'महाराष्ट्र (पुणे APMC)',
        weather: '२९°C · निरभ्र आकाश',
        liveBadge: 'थेट बाजार माहिती'
      },
      stats: {
        activeLots: 'सक्रिय पिके',
        lotsSub: '२ पिके नोंदवली आहेत',
        bestPrice: 'सर्वोत्तम बाजारभाव',
        bestPriceSub: 'मुंबई APMC · ↑ ६.१% वाढ',
        buyerOffers: 'खरेदीदार ऑफर्स',
        offersSub: '₹२,१७,७०० एकूण मागणी',
        pendingOrders: 'चालू ऑर्डर्स',
        ordersSub: '₹९९,५०० काम सुरू',
        tagLive: 'थेट',
        tagPickup: 'पिकअप',
        tagActive: 'सक्रिय'
      },
      actions: {
        title: 'जलद सेवा',
        sellCrop: 'पीक विका',
        sellCropDesc: 'नवीन पीक जोडा',
        marketPrices: 'बाजारभाव',
        marketPricesDesc: '१५ APMC बाजार',
        findBuyers: 'खरेदीदार शोधा',
        findBuyersDesc: 'नोंदणीकृत व्यापारी',
        aiForecast: 'AI अंदाज',
        aiForecastDesc: 'भावाचा अंदाज',
        priceAlerts: 'भाव अलर्ट',
        priceAlertsDesc: 'SMS व ॲप अलर्ट',
        myLots: 'माझी पिके',
        myLotsDesc: 'नोंदणी व्यवस्थापन'
      },
      oppCard: {
        badge: 'AI शिफारस · थेट विश्लेषण',
        title: 'पीक विक्रीसाठी योग्य वेळ',
        desc: 'आपल्या नोंदवलेल्या भात (तांदूळ) पिकाचे अंदाजे एकूण मूल्य:',
        currentMarket: 'चालू बाजारभाव',
        recTarget: 'अपेक्षित लक्ष्य भाव',
        extraIncome: 'संभाव्य जास्तीचा नफा',
        btnFindBuyer: 'उत्कृष्ट खरेदीदार शोधा'
      },
      insights: {
        eyebrow: 'बाजार गुप्तचर माहिती',
        title: 'बाजार स्थिती व थेट संकेत',
        subtitle: 'महाराष्ट्रातील प्रमुख बाजार समित्यांचे ताजे भाव व खरेदीदारांची हालचाल',
        fullOverview: 'संपूर्ण बाजार आढावा',
        tagLive: 'थेट संकेत',
        tagWarm: 'वाढती मागणी',
        tagArrival: 'आवक वाढली',
        tagBest: 'अव्वल बाजार',
        insight1: 'मोठ्या खरेदीदारांमुळे महाराष्ट्रात भाताची मागणी <strong>१४% ने वाढली आहे</strong>.',
        insight2: 'पुणे व नाशिक बाजारात कांद्याचे भाव <strong>वेगाने वाढत आहेत</strong>. चालू भाव ₹२,८५०/क्विंटल आहे.',
        insight3: 'सोलापूर बाजारात टोमॅटोची <strong>आवक २०% ने वाढली आहे</strong>. ताजे पीक २ दिवसांत विकण्याचा सल्ला आहे.',
        insight4: '<strong>मुंबई APMC (वाशी)</strong> बाजारात दर्जेदार पिकाला सर्वाधिक भाव मिळत आहे.'
      },
      crops: {
        rice: 'भात (तांदूळ)',
        wheat: 'गहू',
        maize: 'मका',
        soybean: 'सोयाबीन',
        pulses: 'डाळी (तूर/हरभरा)',
        onion: 'कांदा',
        tomato: 'टोमॅटो',
        potato: 'बटाटा',
        chilli: 'मिरची',
        groundnut: 'भुईमूग',
        cotton: 'कापूस',
        sugarcane: 'ऊस',
        mango: 'आंबा',
        banana: 'केळी',
        grapes: 'द्राक्षे'
      },
      mandis: {
        pune: 'पुणे APMC',
        mumbai: 'मुंबई APMC (वाशी)',
        nashik: 'नाशिक APMC',
        nagpur: 'नागपूर APMC',
        solapur: 'सोलापूर APMC',
        indore: 'इंदूर मंडी',
        guntur: 'गुंटूर APMC',
        rajkot: 'राजकोट APMC'
      },
      units: {
        perQuintal: '₹/क्विंटल',
        quintals: 'क्विंटल',
        q: 'क्विं.',
        rupee: '₹'
      },
      modals: {
        createLotTitle: 'नवीन पीक विक्रीसाठी जोडा',
        selectCrop: 'पीक निवडा',
        quantity: 'प्रमाण (क्विंटलमध्ये)',
        expectedPrice: 'अपेक्षित भाव प्रति क्विंटल (₹)',
        harvestDate: 'काढणी / तयार दिनांक',
        qualityGrade: 'गुणवत्ता प्रत (Grade)',
        location: 'शेताचे ठिकाण / गाव',
        description: 'पिकाचा वाण व दर्जाची माहिती',
        btnSubmitLot: 'पीक विक्रीसाठी प्रसिद्ध करा',
        btnCancel: 'रद्द करा',
        editLotTitle: 'पीक तपशील बदला',
        btnSaveLot: 'बदल सेव्ह करा',
        notificationsTitle: 'ताज्या सूचना',
        markAllRead: 'सर्व वाचल्याचे चिन्हांकित करा',
        languageTitle: 'आपली भाषा निवडा',
        helpTitle: 'शेतकरी मदत केंद्र',
        kisanHelpline: 'किसान कॉल सेंटर (टोल-फ्री)',
        apmcHelpline: 'महाराष्ट्र APMC थेट कक्ष',
        profileTitle: 'शेतकरी माहिती व सेटिंग्ज',
        farmerName: 'पूर्ण नाव',
        phoneNumber: 'मोबाईल नंबर (आधार लिंक)',
        stateDistrict: 'राज्य व जिल्हा',
        landSize: 'शेती क्षेत्र (एकर)',
        saveProfile: 'माहिती सेव्ह करा',
        alertTitle: 'बाजारभाव अलर्ट तयार करा',
        alertTargetPrice: 'भाव या पातळीवर आल्यास मला कळवा (₹/क्विंटल)',
        alertNotificationType: 'सूचना मार्ग',
        btnSetAlert: 'भाव अलर्ट सुरू करा'
      },
      common: {
        loading: 'थेट माहिती लोड होत आहे...',
        searchNoResults: 'माहिती सापडली नाही. कृपया दुसरे पीक किंवा बाजार शोधा.',
        savedSuccess: 'माहिती यशस्वीरीत्या सेव्ह केली.',
        deleteConfirm: 'तुम्हाला ही पीक नोंदणी हटवायची आहे का?',
        viewDetails: 'तपशील पहा',
        active: 'सक्रिय',
        pending: 'प्रलंबित',
        sold: 'विक्री झाली',
        paused: 'थांबवले',
        verified: 'सत्यापित खरेदीदार',
        viewAll: 'सर्व पहा'
      }
    }
  };

  // Multilingual Crop Synonym & Alias Map for Search
  const CROP_SEARCH_MAP = {
    rice: ['rice', 'paddy', 'धान', 'चावल', 'भात', 'तांदूळ', 'basmati', 'sona masoori'],
    wheat: ['wheat', 'गेहूं', 'गहू', 'lokwan', 'sharbati'],
    onion: ['onion', 'प्याज़', 'कांदा', 'garwa', 'red onion'],
    tomato: ['tomato', 'टमाटर', 'टोमॅटो', 'hybrid'],
    maize: ['maize', 'corn', 'मक्का', 'मका', 'yellow corn'],
    soybean: ['soybean', 'सोयाबीन', 'soya'],
    pulses: ['pulses', 'tur', 'chana', 'dal', 'दालें', 'तुअर', 'चना', 'डाळी', 'तूर', 'हरभरा'],
    potato: ['potato', 'आलू', 'बटाटा', 'jyoti'],
    chilli: ['chilli', 'chili', 'मिर्च', 'मिरची', 'teja', 'byadgi'],
    groundnut: ['groundnut', 'peanut', 'मूंगफली', 'भुईमूग', 'shengdana'],
    cotton: ['cotton', 'कपास', 'कापूस'],
    sugarcane: ['sugarcane', 'गन्ना', 'ऊस'],
    mango: ['mango', 'आम', 'आंबा', 'alphonso', 'kesar', 'hapus'],
    banana: ['banana', 'केला', 'केळी'],
    grapes: ['grapes', 'अंगूर', 'द्राक्षे', 'thompson']
  };

  class KrishiI18n {
    constructor() {
      this.currentLang = this.getSavedLanguage();
      this.translations = TRANSLATIONS;
    }

    getSavedLanguage() {
      try {
        const saved = localStorage.getItem('krishi_lang');
        if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
          return saved;
        }
      } catch (e) {}
      return 'en';
    }

    setLanguage(lang) {
      if (!this.translations[lang]) {
        console.warn(`[KrishiI18n] Language "${lang}" not supported. Fallback to English.`);
        lang = 'en';
      }

      this.currentLang = lang;
      try {
        localStorage.setItem('krishi_lang', lang);
      } catch (e) {}

      // Update HTML lang attribute
      document.documentElement.lang = lang;

      // Update UI active buttons in language modal & header switcher
      this.updateLanguageUIElements(lang);

      // Perform DOM in-place translation
      this.translatePage();

      // Dispatch global event for reactive UI stores
      window.dispatchEvent(new CustomEvent('krishi:language-change', {
        detail: { lang, meta: this.translations[lang].meta }
      }));

      // Show friendly confirmation toast
      const langNames = { en: 'English', hi: 'हिंदी (Hindi)', mr: 'मराठी (Marathi)' };
      if (typeof window.showToast === 'function') {
        window.showToast(`भाषा बदलली: ${langNames[lang] || lang}`);
      }
    }

    updateLanguageUIElements(lang) {
      // Update modal language buttons
      document.querySelectorAll('.dash-lang-btn').forEach(btn => {
        const btnLang = btn.getAttribute('data-lang') || (btn.getAttribute('onclick') || '').match(/setLanguage\(['"](\w+)['"]\)/)?.[1];
        if (btnLang === lang) {
          btn.classList.add('dash-lang-btn--active');
          let strong = btn.querySelector('strong');
          if (!strong) {
            strong = document.createElement('strong');
            btn.appendChild(strong);
          }
          strong.textContent = lang === 'mr' ? 'सक्रिय' : lang === 'hi' ? 'सक्रिय' : 'Active';
        } else {
          btn.classList.remove('dash-lang-btn--active');
          const strong = btn.querySelector('strong');
          if (strong) strong.remove();
        }
      });

      // Update quick language pills in header if present
      document.querySelectorAll('.lang-pill-btn').forEach(pill => {
        if (pill.getAttribute('data-lang') === lang) {
          pill.classList.add('lang-pill-btn--active');
        } else {
          pill.classList.remove('lang-pill-btn--active');
        }
      });
    }

    t(keyPath, fallback = '') {
      const keys = keyPath.split('.');
      let val = this.translations[this.currentLang];
      
      for (const k of keys) {
        if (val && val[k] !== undefined) {
          val = val[k];
        } else {
          // Fallback to English
          val = this.resolveFallback(keyPath);
          break;
        }
      }

      if (typeof val === 'string') return val;
      return fallback || keyPath;
    }

    resolveFallback(keyPath) {
      const keys = keyPath.split('.');
      let val = this.translations.en;
      for (const k of keys) {
        if (val && val[k] !== undefined) {
          val = val[k];
        } else {
          return keyPath;
        }
      }
      return typeof val === 'string' ? val : keyPath;
    }

    getCropName(cropId) {
      if (!cropId) return '';
      const norm = cropId.toLowerCase();
      const current = this.translations[this.currentLang]?.crops?.[norm];
      if (current) return current;
      return this.translations.en?.crops?.[norm] || cropId;
    }

    getMandiName(mandiId) {
      if (!mandiId) return '';
      const norm = mandiId.toLowerCase().replace(/ apmc|\(vashi\)| mandi/g, '').trim();
      const current = this.translations[this.currentLang]?.mandis?.[norm];
      if (current) return current;
      return mandiId;
    }

    formatDate(dateStr) {
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const locale = this.currentLang === 'hi' ? 'hi-IN' : this.currentLang === 'mr' ? 'mr-IN' : 'en-IN';
        return d.toLocaleDateString(locale, options);
      } catch (e) {
        return dateStr;
      }
    }

    formatNumber(num) {
      try {
        const n = parseFloat(num);
        if (isNaN(n)) return num;
        const locale = this.currentLang === 'hi' ? 'hi-IN' : this.currentLang === 'mr' ? 'mr-IN' : 'en-IN';
        return n.toLocaleString(locale);
      } catch (e) {
        return num;
      }
    }

    matchesCropQuery(cropId, query) {
      if (!query || !cropId) return true;
      const q = query.toLowerCase().trim();
      const aliases = CROP_SEARCH_MAP[cropId.toLowerCase()] || [cropId.toLowerCase()];
      return aliases.some(alias => alias.includes(q) || q.includes(alias));
    }

    translatePage() {
      // 1. Plain text replacement with [data-i18n]
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          const text = this.t(key);
          if (text) el.textContent = text;
        }
      });

      // 2. HTML text replacement with [data-i18n-html]
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (key) {
          const html = this.t(key);
          if (html) el.innerHTML = html;
        }
      });

      // 3. Placeholder replacement with [data-i18n-placeholder]
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) {
          const ph = this.t(key);
          if (ph) el.setAttribute('placeholder', ph);
        }
      });

      // 4. Title attribute replacement with [data-i18n-title]
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (key) {
          const title = this.t(key);
          if (title) el.setAttribute('title', title);
        }
      });

      // Re-trigger Lucide icons if any changed
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  // Create global singleton instance
  window.KrishiI18n = new KrishiI18n();
  window.t = (key, fallback) => window.KrishiI18n.t(key, fallback);
  window.setLanguage = (lang) => window.KrishiI18n.setLanguage(lang);

  // Auto initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    window.KrishiI18n.setLanguage(window.KrishiI18n.currentLang);
  });
})();
