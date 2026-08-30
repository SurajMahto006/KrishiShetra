/**
 * KRISHISHETRA — COMPLETE ENTERPRISE MULTILINGUAL SYSTEM
 * English (EN) + हिंदी (HI) + मराठी (MR)
 * 
 * Central Internationalization Engine covering 100% of platform features:
 * - Landing page (Hero, Stats, Problem/Solution, 6-Step Flow, Bento Features, Testimonials, Footer)
 * - Authentication & Role Selection (Farmer, Institutional Buyer, FPO)
 * - Farmer Dashboard (Hero, KPIs, Quick Actions, AI Selling Opportunity, Market Intelligence Signals)
 * - My Lots Management (CRUD, Quality Grading, Listing Statuses)
 * - Live Market Prices (15 Mandis, Dynamic Search, Historical Trends, Mandi Comparison)
 * - AI Forecast Engine (Price Trajectory, Confidence Rating, Optimal Selling Window)
 * - Buyer Directory & Direct Linkage (Verified Procurement, Instant Offers, Negotiations)
 * - Orders, Logistics & Escrow Tracking (Pickup Schedule, Transit, Escrow Settlement, Grievances)
 * - Buyer Sourcing Portal
 * - Dynamic Entity Resolvers (Crops, Mandis, Statuses, Units)
 * - Locale-Aware Date, Indian Currency, and Number Formatting
 */

(function () {
  'use strict';

  const TRANSLATIONS = {
    en: {
      meta: { name: 'English', native: 'English', code: 'en' },

      // ── 1. GLOBAL NAVIGATION & COMMON ──
      nav: {
        brand: 'KrishiShetra',
        brandSub: 'Farmer Intelligence Platform',
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
        help: 'Help & Toll-Free',
        profile: 'Profile Settings',
        myLotsMenu: 'My Crop Lots',
        priceAlertsMenu: 'Price Alerts',
        helpMenu: 'Kisan Helpline',
        logout: 'Logout',
        login: 'Login / Sign In',
        forFarmers: 'For Farmers',
        forBuyers: 'For Buyers',
        forFpos: 'For FPOs',
        howItWorks: 'How It Works',
        product: 'Product',
        intelligence: 'Market Intelligence'
      },

      // ── 2. LANDING PAGE (index.html) ──
      landing: {
        heroEyebrow: 'AI-Powered Agricultural Market Intelligence',
        heroTitle1: 'Your Crop.',
        heroTitle2: 'Your Market.',
        heroTitle3: 'Your Best Price.',
        heroSubtitle: 'KrishiShetra connects Indian farmers directly with live APMC mandi intelligence, AI-powered price forecasting, and verified institutional buyers.',
        btnGetStarted: 'Login / Get Started',
        btnExploreFeatures: 'Explore Features',
        trustMarketIntel: 'Live Mandi Intel',
        trustAiInsights: 'AI Forecasts',
        trustVerifiedBuyers: 'Verified Buyers',
        trustInstantPay: 'Escrow Payment',
        
        statMandis: '15+ Mandis',
        statMandisSub: 'Live Real-Time Prices',
        statFarmers: '50,000+ Farmers',
        statFarmersSub: 'Empowered Nationwide',
        statBuyers: '120+ Corporate Buyers',
        statBuyersSub: 'Verified Procurement',
        statRealization: '+18% Higher',
        statRealizationSub: 'Average Crop Realization',

        problemTitle: 'Why Indian Farmers Lose Value',
        problemDesc: 'Traditional middlemen, opaque mandi pricing, and distress selling reduce farmer profits by up to 35%.',
        solTitle: 'How KrishiShetra Solves It',
        solDesc: 'Direct farmer-to-buyer linkage backed by real-time APMC data and AI price prediction.',

        flowTitle: '6-Step Agricultural Value Chain',
        flowSubtitle: 'From harvest to guaranteed bank settlement — simplified for every farmer.',
        flow1Title: 'Live Mandi Intelligence',
        flow1Desc: 'Track real-time prices across 15+ APMC mandis to find the highest-paying market.',
        flow2Title: 'AI Price Forecasting',
        flow2Desc: 'Know whether to sell today or hold for higher realization over the next 3–7 days.',
        flow3Title: 'Smart Selling Decision',
        flow3Desc: 'AI analyzes inventory, mandi distance, and transport costs to recommend optimal targets.',
        flow4Title: 'Verified Buyer Discovery',
        flow4Desc: 'Receive competitive procurement offers directly from FMCG brands, exporters, and mills.',
        flow5Title: 'Transparent Negotiations',
        flow5Desc: 'Accept or counter-offer digitally with secure lock-in agreements.',
        flow6Title: 'Guaranteed Escrow Payment',
        flow6Desc: 'Direct bank transfer within 24–48 hours of quality inspection at farmgate.',

        footerRights: 'All rights reserved. Empowering Indian Agriculture.',
        footerTollFree: 'Kisan Toll-Free Helpline: 1800-180-1551 (24x7)'
      },

      // ── 3. AUTHENTICATION & LOGIN (login.html) ──
      auth: {
        pageTitle: 'Access Platform',
        pageSubtitle: 'Select your role to access your customized agricultural command center.',
        roleFarmer: 'Farmer / Producer',
        roleFarmerDesc: 'Sell crops at best price, check mandi rates & AI forecasts',
        roleBuyer: 'Institutional Buyer',
        roleBuyerDesc: 'Direct farm sourcing, bulk procurement & trade contracts',
        roleFpo: 'FPO / Cooperatives',
        roleFpoDesc: 'Aggregate farm lots, manage member inventory & bulk deals',
        phoneLabel: 'Mobile Number',
        phonePlaceholder: 'Enter 10-digit mobile number',
        passwordLabel: 'Password / MPIN',
        passwordPlaceholder: 'Enter your password or MPIN',
        rememberMe: 'Remember this device',
        forgotPass: 'Forgot password?',
        btnLogin: 'Access Dashboard',
        loginWithOtp: 'Sign in with OTP',
        noAccount: 'New to KrishiShetra?',
        registerNow: 'Register as New Farmer',
        helpContact: 'Need help logging in? Call Toll-Free 1800-180-1551'
      },

      // ── 4. FARMER DASHBOARD (dashboard.html) ──
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

      // ── 5. MY LOTS (lots.html) ──
      lotsPage: {
        title: 'My Crop Lots',
        subtitle: 'Manage active listings, track buyer viewings, and respond to incoming procurement offers.',
        btnCreate: '+ Create New Crop Lot',
        tabAll: 'All Lots',
        tabListed: 'Active Listed',
        tabPaused: 'Paused',
        tabSold: 'Completed Sales',
        filterPlaceholder: 'Filter by crop name or quality...',
        emptyTitle: 'No crop lots found',
        emptyDesc: 'List your harvested produce to receive direct offers from verified buyers across India.',
        expectedPrice: 'Expected Price',
        marketPrice: 'Current Market',
        lotValue: 'Total Valuation',
        grade: 'Quality Grade',
        quantity: 'Quantity',
        btnEdit: 'Edit',
        btnPause: 'Pause Listing',
        btnResume: 'Resume Listing',
        btnDelete: 'Delete',
        btnOffers: 'View Offers'
      },

      // ── 6. MARKET PRICES (market.html) ──
      marketPage: {
        title: 'Live APMC Mandi Prices',
        subtitle: 'Real-time commodity rates across 15 agricultural markets in Maharashtra & neighboring states.',
        searchPlaceholder: 'Search by crop name or mandi location...',
        filterAllCrops: 'All Crops',
        filterAllMandis: 'All Mandis',
        filterDemand: 'Demand Level',
        demandHigh: 'High Demand',
        demandMedium: 'Moderate',
        demandLow: 'Low Demand',
        btnCompare: 'Compare Mandis',
        trendUp: 'Rising',
        trendDown: 'Declining',
        viewDetails: 'View Mandi Breakdown',
        highestRate: 'Highest Realization',
        distance: 'Distance from farm',
        transportEst: 'Estimated transport'
      },

      // ── 7. AI FORECAST (ai-forecast.html) ──
      forecastPage: {
        title: 'AI Price Forecasting Engine',
        subtitle: 'Machine-learning models trained on 10 years of mandi arrivals, weather patterns, and procurement trends.',
        selCrop: 'Select Crop to Analyze',
        predictedPrice: 'Predicted 7-Day Peak',
        confidenceScore: 'AI Confidence Score',
        recommendationTitle: 'Recommended Action',
        recHold: 'Hold for 3 days — Price surge expected (+6.8%)',
        recSell: 'Sell immediately — High arrivals incoming (-4.2%)',
        marketSignals: 'Key Market Drivers',
        factorArrivals: 'Mandi Arrivals Trend',
        factorWeather: 'Weather & Moisture Impact',
        factorInstitutional: 'Institutional Buyer Demand'
      },

      // ── 8. BUYERS DIRECTORY (buyers.html) ──
      buyersPage: {
        title: 'Verified Institutional Buyers',
        subtitle: 'Connect directly with verified FMCG procurement houses, export houses, and processing mills.',
        searchPlaceholder: 'Search by company, crop required, or location...',
        verifiedBadge: 'APMC Verified Buyer',
        rating: 'Rating',
        cropsNeeded: 'Procuring Crops',
        minBatch: 'Minimum Batch',
        paymentTerms: 'Payment Terms',
        btnRequestOffer: 'Request Instant Offer',
        btnNegotiate: 'Negotiate Terms'
      },

      // ── 9. ORDERS & LOGISTICS (orders.html) ──
      ordersPage: {
        title: 'Orders, Logistics & Escrow Tracking',
        subtitle: 'Track active dispatches, farmgate quality inspection, and guaranteed escrow bank settlements.',
        activeOrders: 'Active Dispatches',
        completedOrders: 'Settled Transactions',
        orderId: 'Order ID',
        buyer: 'Purchasing Buyer',
        quantity: 'Dispatched Quantity',
        totalAmount: 'Deal Value',
        statusTransit: 'In Transit to Hub',
        statusPickup: 'Pickup Scheduled',
        statusInspecting: 'Farmgate Quality Check',
        statusSettled: 'Payment Released to Bank',
        btnTrackVehicle: 'Track Logistics',
        btnRaiseGrievance: 'Raise Dispute / Grievance'
      },

      // ── 10. BUYER PORTAL (buyer.html) ──
      buyerPortal: {
        title: 'Institutional Sourcing Dashboard',
        subtitle: 'Direct farmgate inventory, transparent lot verification, and electronic trade execution.',
        availableLots: 'Available Farmgate Lots',
        activeBids: 'Active Procurement Bids',
        executedDeals: 'Executed Supply Contracts',
        btnPlaceBid: 'Submit Procurement Offer',
        qualityCert: 'Certified Farm Lot'
      },

      // ── 11. ENTITIES (Crops & Mandis) ──
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

      // ── 12. MODALS & FORMS ──
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
      meta: { name: 'Hindi', native: 'हिंदी', code: 'hi' },

      // ── 1. GLOBAL NAVIGATION & COMMON ──
      nav: {
        brand: 'KrishiShetra',
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
        login: 'लॉग इन / प्रवेश',
        forFarmers: 'किसानों के लिए',
        forBuyers: 'खरीदारों के लिए',
        forFpos: 'FPO संगठनों के लिए',
        howItWorks: 'यह कैसे काम करता है',
        product: 'प्लेटफ़ॉर्म',
        intelligence: 'बाज़ार जानकारी'
      },

      // ── 2. LANDING PAGE (index.html) ──
      landing: {
        heroEyebrow: 'AI-संचालित कृषि बाज़ार आसूचना नेटवर्क',
        heroTitle1: 'आपकी फसल।',
        heroTitle2: 'आपका बाज़ार।',
        heroTitle3: 'आपका सबसे अच्छा भाव।',
        heroSubtitle: 'KrishiShetra भारतीय किसानों को सीधे APMC मंडियों के लाइव भाव, AI मूल्य पूर्वानुमान और सत्यापित संस्थागत खरीदारों से जोड़ता है।',
        btnGetStarted: 'लॉग इन / शुरू करें',
        btnExploreFeatures: 'विशेषताएं देखें',
        trustMarketIntel: 'लाइव मंडी भाव',
        trustAiInsights: 'AI पूर्वानुमान',
        trustVerifiedBuyers: 'सत्यापित खरीदार',
        trustInstantPay: 'सुरक्षित भुगतान',

        statMandis: '15+ प्रमुख मंडियां',
        statMandisSub: 'लाइव ताज़ा भाव',
        statFarmers: '50,000+ किसान',
        statFarmersSub: 'देशभर में लाभान्वित',
        statBuyers: '120+ कॉर्पोरेट खरीदार',
        statBuyersSub: 'सत्यापित खरीददार',
        statRealization: '+18% अधिक लाभ',
        statRealizationSub: 'औसत अतिरिक्त आय',

        problemTitle: 'पारंपरिक व्यवस्था में किसानों का नुकसान',
        problemDesc: 'बिचौलियों और मंडी की अपारदर्शिता के कारण किसानों को फसल का सही मूल्य नहीं मिल पाता।',
        solTitle: 'KrishiShetra समाधान',
        solDesc: 'सत्यापित खरीदारों से सीधी बिक्री, लाइव भाव तुलना और AI आधारित सही समय का सुझाव।',

        flowTitle: '6-चरणीय कृषि मूल्य श्रृंखला',
        flowSubtitle: 'फसल कटाई से लेकर बैंक खाते में गारंटीड भुगतान तक — हर किसान के लिए आसान।',
        flow1Title: 'लाइव मंडी भाव',
        flow1Desc: '15 से अधिक APMC मंडियों के भाव देखें और अपनी फसल के लिए सबसे अच्छी मंडी चुनें।',
        flow2Title: 'AI भाव पूर्वानुमान',
        flow2Desc: 'जानें कि आज बेचना फायदेमंद है या अगले 3-7 दिनों में भाव और बढ़ेंगे।',
        flow3Title: 'बिक्री का सही फैसला',
        flow3Desc: 'AI आपके स्टॉक, दूरी और भाड़े का विश्लेषण कर सही बिक्री मूल्य सुझाता है।',
        flow4Title: 'सत्यापित खरीदार खोजें',
        flow4Desc: 'FMCG कंपनियों, निर्यातकों व मिलों से सीधे प्रतिस्पर्धी ऑफ़र प्राप्त करें।',
        flow5Title: 'पारदर्शी मोल-भाव',
        flow5Desc: 'डिजिटल रूप से बातचीत करें और सुरक्षित समझौते पर सहमति बनाएं।',
        flow6Title: 'सुरक्षित एस्क्रो भुगतान',
        flow6Desc: 'गुणवत्ता जांच के 24-48 घंटों के भीतर सीधे बैंक खाते में भुगतान।',

        footerRights: 'सर्वाधिकार सुरक्षित। भारतीय कृषि का सशक्तिकरण।',
        footerTollFree: 'किसान टोल-फ्री हेल्पलाइन: 1800-180-1551 (24x7 निःशुल्क)'
      },

      // ── 3. AUTHENTICATION & LOGIN (login.html) ──
      auth: {
        pageTitle: 'प्लेटफ़ॉर्म में प्रवेश करें',
        pageSubtitle: 'अपनी भूमिका चुनें और अपने अनुकूलित कृषि डैशबोर्ड में प्रवेश करें।',
        roleFarmer: 'किसान / उत्पादक',
        roleFarmerDesc: 'फसल सही दाम पर बेचें, मंडी भाव व AI पूर्वानुमान देखें',
        roleBuyer: 'संस्थागत खरीदार',
        roleBuyerDesc: 'सीधे खेतों से खरीद, थोक आपूर्ति व व्यापार अनुबंध',
        roleFpo: 'FPO / किसान सहकारी संस्था',
        roleFpoDesc: 'सामूहिक फसल प्रबंधन, सदस्यों का स्टॉक व बड़े सौदे',
        phoneLabel: 'मोबाइल नंबर',
        phonePlaceholder: '10 अंकों का मोबाइल नंबर दर्ज करें',
        passwordLabel: 'पासवर्ड / MPIN',
        passwordPlaceholder: 'अपना पासवर्ड या MPIN दर्ज करें',
        rememberMe: 'इस उपकरण को याद रखें',
        forgotPass: 'पासवर्ड भूल गए?',
        btnLogin: 'डैशबोर्ड में प्रवेश करें',
        loginWithOtp: 'OTP से लॉगिन करें',
        noAccount: 'KrishiShetra पर नए हैं?',
        registerNow: 'नए किसान के रूप में पंजीकरण करें',
        helpContact: 'लॉगिन में सहायता चाहिए? टोल-फ्री कॉल करें: 1800-180-1551'
      },

      // ── 4. FARMER DASHBOARD (dashboard.html) ──
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

      // ── 5. MY LOTS (lots.html) ──
      lotsPage: {
        title: 'मेरी फसल लिस्टिंग',
        subtitle: 'सक्रिय फसलों का प्रबंधन करें, खरीदारों की रुचि देखें और प्राप्त ऑफ़र पर निर्णय लें।',
        btnCreate: '+ नई फसल जोड़ें',
        tabAll: 'सभी फसलें',
        tabListed: 'सक्रिय लिस्टिंग',
        tabPaused: 'रोकी गई',
        tabSold: 'बिक चुकी फसलें',
        filterPlaceholder: 'फसल या गुणवत्ता के आधार पर खोजें...',
        emptyTitle: 'कोई फसल लिस्टिंग नहीं मिली',
        emptyDesc: 'देशभर के सत्यापित खरीदारों से सीधे ऑफ़र पाने के लिए अपनी फसल जोड़ें।',
        expectedPrice: 'अपेक्षित भाव',
        marketPrice: 'वर्तमान मंडी भाव',
        lotValue: 'कुल अनुमानित मूल्य',
        grade: 'गुणवत्ता ग्रेड',
        quantity: 'मात्रा',
        btnEdit: 'बदलें',
        btnPause: 'रोकें',
        btnResume: 'पुनः चालू करें',
        btnDelete: 'हटाएं',
        btnOffers: 'ऑफ़र देखें'
      },

      // ── 6. MARKET PRICES (market.html) ──
      marketPage: {
        title: 'लाइव APMC मंडी भाव',
        subtitle: 'महाराष्ट्र एवं पड़ोसी राज्यों की 15 प्रमुख कृषि मंडियों के ताज़ा भाव।',
        searchPlaceholder: 'फसल का नाम या मंडी का स्थान खोजें...',
        filterAllCrops: 'सभी फसलें',
        filterAllMandis: 'सभी मंडियां',
        filterDemand: 'मांग का स्तर',
        demandHigh: 'उच्च मांग',
        demandMedium: 'मध्यम मांग',
        demandLow: 'कम मांग',
        btnCompare: 'मंडियों की तुलना करें',
        trendUp: 'बढ़ोतरी',
        trendDown: 'गिरावट',
        viewDetails: 'विस्तृत भाव देखें',
        highestRate: 'सर्वोत्तम भाव',
        distance: 'खेत से दूरी',
        transportEst: 'अनुमानित भाड़ा'
      },

      // ── 7. AI FORECAST (ai-forecast.html) ──
      forecastPage: {
        title: 'AI फसल भाव पूर्वानुमान',
        subtitle: '10 वर्षों के मंडी डेटा, मौसम एवं मांग के आधार पर तैयार उन्नत पूर्वानुमान।',
        selCrop: 'फसल चुनें',
        predictedPrice: '7 दिनों का संभावित उच्चतम भाव',
        confidenceScore: 'AI विश्वसनीयता स्कोर',
        recommendationTitle: 'AI सलाह',
        recHold: '3 दिन रुकें — भाव में तेज़ी की संभावना (+6.8%)',
        recSell: 'तुरंत बेचें — मंडी में भारी आवक की संभावना (-4.2%)',
        marketSignals: 'बाज़ार को प्रभावित करने वाले कारक',
        factorArrivals: 'मंडी में फसल की आवक',
        factorWeather: 'मौसम व नमी का प्रभाव',
        factorInstitutional: 'बड़ी कंपनियों की मांग'
      },

      // ── 8. BUYERS DIRECTORY (buyers.html) ──
      buyersPage: {
        title: 'सत्यापित संस्थागत खरीदार',
        subtitle: 'प्रतिष्ठित FMCG कंपनियों, निर्यातकों एवं प्रसंस्करण मिलों से सीधे जुड़ें।',
        searchPlaceholder: 'कंपनी का नाम, आवश्यक फसल या स्थान खोजें...',
        verifiedBadge: 'APMC सत्यापित खरीदार',
        rating: 'रेटिंग',
        cropsNeeded: 'आवश्यक फसलें',
        minBatch: 'न्यूनतम खरीद मात्रा',
        paymentTerms: 'भुगतान की शर्तें',
        btnRequestOffer: 'ऑफ़र मांगें',
        btnNegotiate: 'बातचीत करें'
      },

      // ── 9. ORDERS & LOGISTICS (orders.html) ──
      ordersPage: {
        title: 'ऑर्डर, लॉजिस्टिक्स व भुगतान ट्रैकिंग',
        subtitle: 'सक्रिय वाहन, खेत पर गुणवत्ता जांच और सीधे बैंक खाते में भुगतान की स्थिति देखें।',
        activeOrders: 'चालू ऑर्डर',
        completedOrders: 'पूरे हुए सौदे',
        orderId: 'ऑर्डर क्रमांक',
        buyer: 'खरीदार कंपनी',
        quantity: 'भेजी गई मात्रा',
        totalAmount: 'कुल सौदा मूल्य',
        statusTransit: 'वाहन रास्ते में है',
        statusPickup: 'पिकअप निर्धारित',
        statusInspecting: 'गुणवत्ता जांच जारी',
        statusSettled: 'बैंक खाते में भुगतान जमा',
        btnTrackVehicle: 'वाहन ट्रैक करें',
        btnRaiseGrievance: 'शिकायत दर्ज करें'
      },

      // ── 10. BUYER PORTAL (buyer.html) ──
      buyerPortal: {
        title: 'संस्थागत खरीद पोर्टल',
        subtitle: 'सीधे खेतों से प्रामाणिक फसल खरीद, गुणवत्ता सत्यापन व डिजिटल अनुबंध।',
        availableLots: 'उपलब्ध फसल लॉट',
        activeBids: 'सक्रिय खरीद बोलियां',
        executedDeals: 'सफल अनुबंध',
        btnPlaceBid: 'खरीद प्रस्ताव भेजें',
        qualityCert: 'प्रमाणित किसान लॉट'
      },

      // ── 11. ENTITIES (Crops & Mandis) ──
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

      // ── 12. MODALS & FORMS ──
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
      meta: { name: 'Marathi', native: 'मराठी', code: 'mr' },

      // ── 1. GLOBAL NAVIGATION & COMMON ──
      nav: {
        brand: 'KrishiShetra',
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
        login: 'लॉग इन / प्रवेश',
        forFarmers: 'शेतकऱ्यांसाठी',
        forBuyers: 'खरेदीदारांसाठी',
        forFpos: 'FPO संस्थांसाठी',
        howItWorks: 'हे कसे कार्य करते',
        product: 'प्लॅटफॉर्म',
        intelligence: 'बाजार माहिती'
      },

      // ── 2. LANDING PAGE (index.html) ──
      landing: {
        heroEyebrow: 'AI-सक्षम कृषी बाजार बुद्धिमत्ता नेटवर्क',
        heroTitle1: 'आपले पीक.',
        heroTitle2: 'आपली बाजारपेठ.',
        heroTitle3: 'आपला सर्वोत्तम भाव.',
        heroSubtitle: 'KrishiShetra महाराष्ट्रातील शेतकऱ्यांना थेट APMC बाजार समित्यांचे थेट दर, AI भाव अंदाज आणि नामांकित संस्थात्मक खरेदीदारांशी जोडते.',
        btnGetStarted: 'लॉग इन / सुरुवात करा',
        btnExploreFeatures: 'वैशिष्ट्ये पहा',
        trustMarketIntel: 'थेट बाजारभाव',
        trustAiInsights: 'AI भाव अंदाज',
        trustVerifiedBuyers: 'सत्यापित खरेदीदार',
        trustInstantPay: 'हमीशीर पेमेंट',

        statMandis: '१५+ प्रमुख बाजार',
        statMandisSub: 'थेट चालू भाव',
        statFarmers: '५०,०००+ शेतकरी',
        statFarmersSub: 'राज्यभरात समाधानी',
        statBuyers: '१२०+ मोठे खरेदीदार',
        statBuyersSub: 'नोंदणीकृत कंपन्या',
        statRealization: '+१८% अधिक नफा',
        statRealizationSub: 'सरासरी वाढीव प्राप्ती',

        problemTitle: 'पारंपरिक बाजारपेठेत शेतकऱ्यांचे नुकसान',
        problemDesc: 'दलाल आणि बाजारातील अस्पष्टतेमुळे शेतकऱ्यांना पिकाचा खरा भाव मिळत नाही.',
        solTitle: 'KrishiShetra चा उपाय',
        solDesc: 'थेट खरेदीदारांशी थेट विक्री, सर्व बाजारांचे भाव तुलना आणि AI द्वारे योग्य वेळेचा सल्ला.',

        flowTitle: '६-टप्प्यांची मूल्य साखळी',
        flowSubtitle: 'काढणीपासून थेट बँक खात्यात पैसे मिळेपर्यंत — प्रत्येक शेतकऱ्यासाठी सोपे.',
        flow1Title: 'थेट बाजारभाव माहिती',
        flow1Desc: '१५ हून अधिक बाजार समित्यांचे भाव तपासा आणि सर्वाधिक भाव देणारा बाजार निवडा.',
        flow2Title: 'AI भाव अंदाज',
        flow2Desc: 'आजच माल विकावा की पुढील ३-७ दिवसांत अधिक भाव मिळेल हे आधीच जाणून घ्या.',
        flow3Title: 'विक्रीचा हुशार निर्णय',
        flow3Desc: 'AI आपल्या साठ्याची प्रत, अंतर व वाहतूक खर्च मोजून सर्वोत्तम भावाची शिफारस करते.',
        flow4Title: 'सत्यापित खरेदीदार शोधा',
        flow4Desc: 'मोठ्या कंपन्या, कारखाने व निर्यातदारांकडून थेट सर्वोत्तम खरेदी ऑफर्स मिळवा.',
        flow5Title: 'पारदर्शक बोलणी',
        flow5Desc: 'डिजिटल पद्धतीने भावाची बोलणी करा आणि सुरक्षित सौदा पक्का करा.',
        flow6Title: 'हमीशीर बँक पेमेंट',
        flow6Desc: 'शेतात माल तपासणीनंतर २४-४८ तासांत थेट बँक खात्यात रक्कम जमा.',

        footerRights: 'सर्व हक्क सुरक्षित. भारतीय शेतकऱ्यांचे सक्षमीकरण.',
        footerTollFree: 'किसान टोल-फ्री हेल्पलाईन: 1800-180-1551 (२४x७ मोफत)'
      },

      // ── 3. AUTHENTICATION & LOGIN (login.html) ──
      auth: {
        pageTitle: 'प्लॅटफॉर्मवर प्रवेश करा',
        pageSubtitle: 'आपली भूमिका निवडा आणि आपल्या डिजिटल कृषी डॅशबोर्डमध्ये प्रवेश करा.',
        roleFarmer: 'शेतकरी / उत्पादक',
        roleFarmerDesc: 'पीक योग्य भावात विका, बाजारभाव व AI अंदाज पहा',
        roleBuyer: 'संस्थात्मक खरेदीदार',
        roleBuyerDesc: 'शेतातून थेट खरेदी, घाऊक पुरवठा व व्यापार करार',
        roleFpo: 'FPO / शेतकरी उत्पादक संस्था',
        roleFpoDesc: 'एकत्रित माल व्यवस्थापन, सभासदांचा साठा व मोठे सौदे',
        phoneLabel: 'मोबाईल नंबर',
        phonePlaceholder: '१० अंकी मोबाईल नंबर टाका',
        passwordLabel: 'पासवर्ड / MPIN',
        passwordPlaceholder: 'आपला पासवर्ड किंवा MPIN टाका',
        rememberMe: 'हे डिव्हाइस लक्षात ठेवा',
        forgotPass: 'पासवर्ड विसरलात?',
        btnLogin: 'डॅशबोर्डमध्ये जा',
        loginWithOtp: 'OTP द्वारे लॉगिन करा',
        noAccount: 'KrishiShetra वर नवीन आहात?',
        registerNow: 'नवीन शेतकरी म्हणून नोंदणी करा',
        helpContact: 'लॉगिन करण्यात अडचण? टोल-फ्री कॉल करा: 1800-180-1551'
      },

      // ── 4. FARMER DASHBOARD (dashboard.html) ──
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

      // ── 5. MY LOTS (lots.html) ──
      lotsPage: {
        title: 'माझी पीक नोंदणी',
        subtitle: 'सक्रिय पिकांचे व्यवस्थापन करा, खरेदीदारांची मागणी पहा आणि आलेल्या ऑफर्स स्वीकारा.',
        btnCreate: '+ नवीन पीक जोडा',
        tabAll: 'सर्व पिके',
        tabListed: 'सक्रिय विक्री',
        tabPaused: 'थांबवलेली पिके',
        tabSold: 'विक्री झालेली पिके',
        filterPlaceholder: 'पीक किंवा दर्जानुसार शोधा...',
        emptyTitle: 'नोंदवलेले पीक सापडले नाही',
        emptyDesc: 'देशभरातील मोठ्या खरेदीदारांकडून थेट भाव मिळवण्यासाठी आपले पीक जोडा.',
        expectedPrice: 'अपेक्षित भाव',
        marketPrice: 'चालू बाजारभाव',
        lotValue: 'एकूण अंदाजे मूल्य',
        grade: 'गुणवत्ता प्रत',
        quantity: 'प्रमाण',
        btnEdit: 'बदला',
        btnPause: 'थांबवा',
        btnResume: 'सुरू करा',
        btnDelete: 'हटवा',
        btnOffers: 'ऑफर्स पहा'
      },

      // ── 6. MARKET PRICES (market.html) ──
      marketPage: {
        title: 'थेट APMC बाजारभाव',
        subtitle: 'महाराष्ट्र व लगतच्या राज्यांमधील १५ प्रमुख बाजार समित्यांचे थेट चालू दर.',
        searchPlaceholder: 'पिकाचे नाव किंवा बाजार शोधा...',
        filterAllCrops: 'सर्व पिके',
        filterAllMandis: 'सर्व बाजार समित्या',
        filterDemand: 'मागणीचा स्तर',
        demandHigh: 'उच्च मागणी',
        demandMedium: 'मध्यम मागणी',
        demandLow: 'कमी मागणी',
        btnCompare: 'बाजार समित्यांची तुलना करा',
        trendUp: 'वाढ',
        trendDown: 'घट',
        viewDetails: 'सविस्तर भाव पहा',
        highestRate: 'सर्वोत्तम भाव',
        distance: 'शेतापासून अंतर',
        transportEst: 'अंदाजे वाहतूक खर्च'
      },

      // ── 7. AI FORECAST (ai-forecast.html) ──
      forecastPage: {
        title: 'AI पीक भाव अंदाज यंत्रणा',
        subtitle: '१० वर्षांचा बाजार डेटा, हवामान व मागणीच्या आधारे तयार केलेले अचूक अंदाज.',
        selCrop: 'पीक निवडा',
        predictedPrice: '७ दिवसांचा अंदाजित कमाल भाव',
        confidenceScore: 'AI अचूकता स्कोर',
        recommendationTitle: 'AI चा सल्ला',
        recHold: '३ दिवस थांबा — भावात वाढ होण्याची शक्यता (+६.८%)',
        recSell: 'लगेच विका — बाजारात आवक वाढण्याची शक्यता (-४.२%)',
        marketSignals: 'भावावर परिणाम करणारे घटक',
        factorArrivals: 'बाजारातील मालाची आवक',
        factorWeather: 'हवामान व पावसाचा परिणाम',
        factorInstitutional: 'मोठ्या कंपन्यांची मागणी'
      },

      // ── 8. BUYERS DIRECTORY (buyers.html) ──
      buyersPage: {
        title: 'सत्यापित संस्थात्मक खरेदीदार',
        subtitle: 'नामांकित FMCG कंपन्या, कारखाने व निर्यातदारांशी थेट व्यापार करा.',
        searchPlaceholder: 'कंपनी, आवश्यक पीक किंवा शहर शोधा...',
        verifiedBadge: 'APMC अधिकृत खरेदीदार',
        rating: 'रेटिंग',
        cropsNeeded: 'आवश्यक पिके',
        minBatch: 'किमान खरेदी मर्यादा',
        paymentTerms: 'पेमेंट अटी',
        btnRequestOffer: 'ऑफर्स मागा',
        btnNegotiate: 'चर्चा करा'
      },

      // ── 9. ORDERS & LOGISTICS (orders.html) ──
      ordersPage: {
        title: 'ऑर्डर्स, वाहतूक व पेमेंट ट्रॅकिंग',
        subtitle: 'गाडीचे लाईव्ह लोकेशन, शेतावर प्रत तपासणी व थेट बँकेत पैसे जमा होण्याची माहिती.',
        activeOrders: 'चालू ऑर्डर्स',
        completedOrders: 'पूर्ण झालेले सौदे',
        orderId: 'ऑर्डर नंबर',
        buyer: 'खरेदीदार कंपनी',
        quantity: 'पाठवलेले प्रमाण',
        totalAmount: 'एकूण सौदा रक्कम',
        statusTransit: 'गाडी रस्त्यावर आहे',
        statusPickup: 'पिकअप ठरले आहे',
        statusInspecting: 'प्रत तपासणी सुरू',
        statusSettled: 'बँक खात्यात पैसे जमा',
        btnTrackVehicle: 'वाहन ट्रॅक करा',
        btnRaiseGrievance: 'तक्रार नोंदवा'
      },

      // ── 10. BUYER PORTAL (buyer.html) ──
      buyerPortal: {
        title: 'संस्थात्मक खरेदी डॅशबोर्ड',
        subtitle: 'शेतातून थेट दर्जेदार पिकांची खरेदी, पारदर्शक तपासणी व डिजिटल करार.',
        availableLots: 'उपलब्ध शेतकरी पिके',
        activeBids: 'आपल्या चालू खरेदी ऑफर्स',
        executedDeals: 'यशस्वी पुरवठा करार',
        btnPlaceBid: 'खरेदी ऑफर द्या',
        qualityCert: 'प्रमाणित शेतकरी पीक'
      },

      // ── 11. ENTITIES (Crops & Mandis) ──
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

      // ── 12. MODALS & FORMS ──
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

  // Multilingual Crop Synonym & Alias Map for Universal Search
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
        console.warn(`[KrishiI18n] Language "${lang}" not found. Falling back to English.`);
        lang = 'en';
      }

      this.currentLang = lang;
      try {
        localStorage.setItem('krishi_lang', lang);
      } catch (e) {}

      document.documentElement.lang = lang;
      this.updateLanguageUIElements(lang);
      this.translatePage();

      window.dispatchEvent(new CustomEvent('krishi:language-change', {
        detail: { lang, meta: this.translations[lang].meta }
      }));

      const langNames = { en: 'English', hi: 'हिंदी (Hindi)', mr: 'मराठी (Marathi)' };
      if (typeof window.showToast === 'function') {
        const msg = lang === 'mr' ? 'भाषा बदलली: मराठी' : lang === 'hi' ? 'भाषा बदली गई: हिंदी' : 'Language changed to English';
        window.showToast(msg);
      }
    }

    updateLanguageUIElements(lang) {
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

    /**
     * Safely updates text content of an element while preserving child icons/SVGs/elements.
     */
    setElementTextSafe(el, newText) {
      if (!el || typeof newText !== 'string') return;

      // Check if element has child elements like icons (i, svg, span)
      const hasChildElements = el.children.length > 0;

      if (!hasChildElements) {
        el.textContent = newText;
        return;
      }

      // If element has a dedicated .i18n-text span, update it directly
      const dedicatedSpan = el.querySelector('.i18n-text');
      if (dedicatedSpan) {
        dedicatedSpan.textContent = newText;
        return;
      }

      // Look for first text node to update
      let textNodeFound = false;
      for (let i = 0; i < el.childNodes.length; i++) {
        const node = el.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0) {
          node.nodeValue = (node.nodeValue.startsWith(' ') ? ' ' : '') + newText.trim() + (node.nodeValue.endsWith(' ') ? ' ' : '');
          textNodeFound = true;
          break;
        }
      }

      if (!textNodeFound) {
        // Create an i18n text wrapper so icons are preserved
        const span = document.createElement('span');
        span.className = 'i18n-text';
        span.textContent = ' ' + newText;
        el.appendChild(span);
      }
    }

    translatePage() {
      // 1. Plain text replacement with [data-i18n] (Safe Icon Preservation)
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          const text = this.t(key);
          if (text) {
            this.setElementTextSafe(el, text);
          }
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

      // 5. Dynamic Select Options Translation
      document.querySelectorAll('select').forEach(select => {
        const isCropSelect = select.id.includes('crop');
        const isMandiSelect = select.id.includes('location') || select.id.includes('mandi');

        Array.from(select.options).forEach(opt => {
          const val = opt.value;
          if (val === 'all') {
            if (isCropSelect) {
              opt.textContent = this.currentLang === 'mr' ? 'सर्व पिके (१५)' : this.currentLang === 'hi' ? 'सभी फसलें (15)' : 'All Crops (15)';
            } else if (isMandiSelect) {
              opt.textContent = this.currentLang === 'mr' ? 'सर्व बाजार समित्या' : this.currentLang === 'hi' ? 'सभी मंडियां' : 'All Mandis';
            }
          } else if (isCropSelect && val) {
            const translatedCrop = this.getCropName(val);
            if (translatedCrop && translatedCrop !== val) {
              opt.textContent = translatedCrop;
            }
          } else if (isMandiSelect && val) {
            const translatedMandi = this.getMandiName(val);
            if (translatedMandi && translatedMandi !== val) {
              opt.textContent = translatedMandi;
            }
          }
        });
      });

      // 6. Refresh Lucide Icons without flickering
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        try {
          window.lucide.createIcons();
        } catch(e) {}
      }
    }
  }

  // Create global singleton
  window.KrishiI18n = new KrishiI18n();
  window.t = (key, fallback) => window.KrishiI18n.t(key, fallback);
  window.setLanguage = (lang) => window.KrishiI18n.setLanguage(lang);

  // Sync language across multiple open browser tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'krishi_lang' && e.newValue && e.newValue !== window.KrishiI18n.currentLang) {
      window.KrishiI18n.setLanguage(e.newValue);
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    window.KrishiI18n.setLanguage(window.KrishiI18n.currentLang);
  });
})();
