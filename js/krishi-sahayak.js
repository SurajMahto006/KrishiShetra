/**
 * KRISHI SAHAYAK — AI Market Decision-Support Continuous Voice & Conversational Assistant
 * KrishiShetra Multi-Turn Farmer Marketplace Assistant
 *
 * Fully synchronized across English (en-IN), Hindi (hi-IN), and Marathi (mr-IN).
 * Deterministic client-side multi-turn memory with rule-based entity & intent engine.
 * Non-blocking, farmer-friendly, highly accessible UI/UX.
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════
  // 1. SELF-CONTAINED DATA TABLES
  // ══════════════════════════════════════════════════════════════════
  var KS_DATA = {
    crops: [
      { id: 'rice',      name: 'Rice',      price: null, change: 5.2, dir: 'up',   market: 'Pune APMC',             demand: 'high'   },
      { id: 'wheat',     name: 'Wheat',     price: null, change: 6.2, dir: 'up',   market: 'Nashik APMC',           demand: 'medium' },
      { id: 'maize',     name: 'Maize',     price: null, change: 2.1, dir: 'up',   market: 'Nashik APMC',           demand: 'medium' },
      { id: 'soybean',   name: 'Soybean',   price: null, change: 4.8, dir: 'up',   market: 'Indore Mandi',          demand: 'high'   },
      { id: 'pulses',    name: 'Pulses',    price: null, change: 1.5, dir: 'up',   market: 'Nagpur APMC',           demand: 'medium' },
      { id: 'onion',     name: 'Onion',     price: null, change: 3.8, dir: 'up',   market: 'Nashik APMC',           demand: 'high'   },
      { id: 'tomato',    name: 'Tomato',    price: null, change: 1.4, dir: 'down', market: 'Pune APMC',             demand: 'medium' },
      { id: 'potato',    name: 'Potato',    price: null, change: 0.8, dir: 'up',   market: 'Pune APMC',             demand: 'low'    },
      { id: 'chilli',    name: 'Chilli',    price: null, change: 7.2, dir: 'up',   market: 'Guntur APMC',           demand: 'high'   },
      { id: 'groundnut', name: 'Groundnut', price: null, change: 2.9, dir: 'up',   market: 'Rajkot APMC',           demand: 'medium' },
      { id: 'cotton',    name: 'Cotton',    price: null, change: 0.6, dir: 'down', market: 'Nagpur APMC',           demand: 'medium' },
      { id: 'sugarcane', name: 'Sugarcane', price: null, change: 1.2, dir: 'up',   market: 'Kolhapur APMC',         demand: 'medium' },
      { id: 'mango',     name: 'Mango',     price: null, change: 3.5, dir: 'up',   market: 'Ratnagiri',             demand: 'high'   },
      { id: 'banana',    name: 'Banana',    price: null, change: 2.1, dir: 'down', market: 'Jalgaon APMC',          demand: 'low'    },
      { id: 'grapes',    name: 'Grapes',    price: null, change: 4.1, dir: 'up',   market: 'Nashik APMC',           demand: 'high'   }
    ],

    mandis: [
      { name: 'Nashik APMC',         distKm: 42,  demandLevel: 'High',     state: 'Maharashtra',     priceMultiplier: 1.05 },
      { name: 'Lasalgaon APMC',      distKm: 58,  demandLevel: 'High',     state: 'Maharashtra',     priceMultiplier: 1.08 },
      { name: 'Pune APMC',           distKm: 28,  demandLevel: 'Medium',   state: 'Maharashtra',     priceMultiplier: 0.98 },
      { name: 'Mumbai APMC (Vashi)', distKm: 165, demandLevel: 'High',     state: 'Maharashtra',     priceMultiplier: 1.00 },
      { name: 'Nagpur APMC',         distKm: 450, demandLevel: 'Medium',   state: 'Maharashtra',     priceMultiplier: 0.94 },
      { name: 'Solapur APMC',        distKm: 220, demandLevel: 'Low',      state: 'Maharashtra',     priceMultiplier: 0.90 },
      { name: 'Indore Mandi',        distKm: 520, demandLevel: 'High',     state: 'Madhya Pradesh',  priceMultiplier: 1.02 }
    ],

    buyers: [
      { id: 'b1', name: 'ABC Foods Ltd',              verified: true, rating: '4.9 ★', crops: ['Rice', 'Wheat', 'Tomato'],           minQty: '10 quintals', offerPrice: '₹2,850/q', distance: '38 km', deals: '184 Completed Deals', paymentDays: 'Instant 24h Bank Transfer' },
      { id: 'b2', name: 'Reliance Fresh Procurement', verified: true, rating: '4.8 ★', crops: ['Rice', 'Onion', 'Tomato', 'Banana'], minQty: '20 quintals', offerPrice: '₹2,920/q', distance: '42 km', deals: '320 Completed Deals', paymentDays: 'Direct APMC Escrow'        },
      { id: 'b3', name: 'ITC Agri Business Division', verified: true, rating: '4.9 ★', crops: ['Wheat', 'Soybean', 'Chilli', 'Maize'],minQty: '15 quintals', offerPrice: '₹2,780/q', distance: '51 km', deals: '410 Completed Deals', paymentDays: 'Instant NEFT'              },
      { id: 'b4', name: 'BigBasket Direct Sourcing',  verified: true, rating: '4.7 ★', crops: ['Onion', 'Tomato', 'Potato', 'Grapes'],minQty: '5 quintals',  offerPrice: '₹2,820/q', distance: '24 km', deals: '290 Completed Deals', paymentDays: '48h Farm Gate'             },
      { id: 'b5', name: 'XYZ Agro Exports',           verified: true, rating: '4.8 ★', crops: ['Grapes', 'Mango', 'Chilli', 'Cotton'],minQty: '25 quintals', offerPrice: '₹3,050/q', distance: '45 km', deals: '145 Completed Deals', paymentDays: 'Escrow Guarantee'          },
      { id: 'b6', name: 'Green Valley Organic Mills',  verified: true, rating: '4.6 ★', crops: ['Pulses', 'Rice', 'Soybean'],         minQty: '10 quintals', offerPrice: '₹5,350/q', distance: '85 km', deals: '88 Completed Deals',  paymentDays: 'Direct UPI/Bank'           }
    ]
  };

  var CROP_NAMES = {
    tomato:    { en: 'Tomato',    hi: 'टमाटर',    mr: 'टोमॅटो' },
    onion:     { en: 'Onion',     hi: 'प्याज',     mr: 'कांदा' },
    wheat:     { en: 'Wheat',     hi: 'गेहूं',      mr: 'गहू' },
    rice:      { en: 'Rice',      hi: 'चावल',     mr: 'तांदूळ' },
    soybean:   { en: 'Soybean',   hi: 'सोयाबीन',   mr: 'सोयाबीन' },
    potato:    { en: 'Potato',    hi: 'आलू',      mr: 'बटाटा' },
    chilli:    { en: 'Chilli',    hi: 'मिर्च',     mr: 'मिरची' },
    maize:     { en: 'Maize',     hi: 'मक्का',     mr: 'मका' },
    cotton:    { en: 'Cotton',    hi: 'कपास',     mr: 'कापूस' },
    grapes:    { en: 'Grapes',    hi: 'अंगूर',     mr: 'द्राक्षे' },
    mango:     { en: 'Mango',     hi: 'आम',       mr: 'आंबा' },
    banana:    { en: 'Banana',    hi: 'केला',      mr: 'केळी' },
    pulses:    { en: 'Pulses',    hi: 'दाल/चना',   mr: 'डाळ/तूर' },
    groundnut: { en: 'Groundnut', hi: 'मूंगफली',   mr: 'शेंगदाणा' }
  };

  // ══════════════════════════════════════════════════════════════════
  // 1B. CENTRALIZED I18N CONFIGURATION (Welcome, Suggestions & Known Mandis)
  // ══════════════════════════════════════════════════════════════════
  var WELCOME_MESSAGES = {
    mr: "नमस्कार! मी मंडी भाव, खरेदीदार आणि वाहतूक यामध्ये मदत करू शकतो.",
    hi: "नमस्ते! मैं मंडी भाव, खरीदार और परिवहन में मदद कर सकता हूँ।",
    en: "Namaste! I can help with mandi prices, buyers and transport."
  };

  var HEADER_SUBTITLES = {
    mr: "तुमचा शेती सहाय्यक",
    hi: "आपका कृषि सहायक",
    en: "Your farming assistant"
  };

  var SUGGESTIONS_CONFIG = {
    initial: {
      en: [
        { text: "Check mandi price", query: "Check mandi price", icon: "📊" },
        { text: "Compare mandis", query: "Compare mandis", icon: "⚖️" },
        { text: "Find buyers", query: "Find buyers", icon: "🤝" }
      ],
      hi: [
        { text: "मंडी भाव देखें", query: "मंडी भाव देखें", icon: "📊" },
        { text: "मंडियों की तुलना करें", query: "मंडियों की तुलना करें", icon: "⚖️" },
        { text: "खरीदार खोजें", query: "खरीदार खोजें", icon: "🤝" }
      ],
      mr: [
        { text: "मंडी भाव पाहा", query: "मंडी भाव पाहा", icon: "📊" },
        { text: "मंड्यांची तुलना करा", query: "मंड्यांची तुलना करा", icon: "⚖️" },
        { text: "खरेदीदार शोधा", query: "खरेदीदार शोधा", icon: "🤝" }
      ]
    },
    after_price: {
      en: [
        { text: "Compare mandis", query: "Compare mandis", icon: "⚖️" },
        { text: "Find buyers", query: "Find buyers", icon: "🤝" }
      ],
      hi: [
        { text: "मंडियों की तुलना करें", query: "मंडियों की तुलना करें", icon: "⚖️" },
        { text: "खरीदार खोजें", query: "खरीदार खोजें", icon: "🤝" }
      ],
      mr: [
        { text: "मंड्यांची तुलना करा", query: "मंड्यांची तुलना करा", icon: "⚖️" },
        { text: "खरेदीदार शोधा", query: "खरेदीदार शोधा", icon: "🤝" }
      ]
    },
    after_buyer: {
      en: [
        { text: "Check mandi price", query: "Check mandi price", icon: "📊" },
        { text: "Find buyers", query: "Find buyers", icon: "🤝" }
      ],
      hi: [
        { text: "मंडी भाव देखें", query: "मंडी भाव देखें", icon: "📊" },
        { text: "खरीदार खोजें", query: "खरीदार खोजें", icon: "🤝" }
      ],
      mr: [
        { text: "मंडी भाव पाहा", query: "मंडी भाव पाहा", icon: "📊" },
        { text: "खरेदीदार शोधा", query: "खरेदीदार शोधा", icon: "🤝" }
      ]
    }
  };

  var KNOWN_MANDIS = [
    {
      id: 'chandwad',
      canonical: 'Chandwad',
      queryMarket: 'Chandwad',
      district: 'Nashik',
      state: 'Maharashtra',
      displayName: { mr: 'चांदवड मंडी', hi: 'चांदवड़ मंडी', en: 'APMC Chandwad' },
      patterns: ['चांदवड', 'चांदवड़', 'chandwad', 'chandvad'],
      negativePatterns: ['चंडीगढ़', 'चंडीगढ', 'चंदिगढ', 'chandigarh', 'चंद्रपूर', 'चंद्रपुर', 'chandrapur']
    },
    {
      id: 'chandigarh',
      canonical: 'Chandigarh',
      queryMarket: 'Chandigarh',
      district: 'Chandigarh',
      state: 'Chandigarh',
      displayName: { mr: 'चंदीगड मंडी', hi: 'चंडीगढ़ मंडी', en: 'Chandigarh Mandi' },
      patterns: ['चंडीगढ़', 'चंडीगढ', 'चंदिगढ', 'chandigarh'],
      negativePatterns: ['चांदवड', 'चांदवड़', 'chandwad', 'chandvad', 'चंद्रपूर', 'चंद्रपुर', 'chandrapur']
    },
    {
      id: 'chandrapur',
      canonical: 'Chandrapur',
      queryMarket: 'Chandrapur',
      district: 'Chandrapur',
      state: 'Maharashtra',
      displayName: { mr: 'चंद्रपूर मंडी', hi: 'चंद्रपुर मंडी', en: 'Chandrapur APMC' },
      patterns: ['चंद्रपूर', 'चंद्रपुर', 'chandrapur'],
      negativePatterns: ['चांदवड', 'चांदवड़', 'chandwad', 'chandvad', 'चंडीगढ़', 'चंडीगढ', 'chandigarh']
    },
    {
      id: 'lasalgaon',
      canonical: 'Lasalgaon',
      queryMarket: 'Lasalgaon',
      district: 'Nashik',
      state: 'Maharashtra',
      displayName: { mr: 'लासलगाव APMC', hi: 'लासलगांव APMC', en: 'Lasalgaon APMC' },
      patterns: ['लासलगाव', 'लासलगांव', 'लासलगावा', 'lasalgaon'],
      negativePatterns: []
    },
    {
      id: 'pimpalgaon',
      canonical: 'Pimpalgaon',
      queryMarket: 'Pimpalgaon',
      district: 'Nashik',
      state: 'Maharashtra',
      displayName: { mr: 'पिंपळगाव APMC', hi: 'पिंपलगांव APMC', en: 'Pimpalgaon APMC' },
      patterns: ['पिंपळगाव', 'पिंपलगांव', 'pimpalgaon'],
      negativePatterns: []
    },
    {
      id: 'nashik',
      canonical: 'Nashik',
      queryMarket: 'Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      displayName: { mr: 'नाशिक APMC', hi: 'नासिक APMC', en: 'Nashik APMC' },
      patterns: ['नाशिक', 'नासिक', 'nashik', 'nasik'],
      negativePatterns: []
    },
    {
      id: 'vashi',
      canonical: 'Vashi',
      queryMarket: 'Vashi',
      district: 'Navi Mumbai',
      state: 'Maharashtra',
      displayName: { mr: 'वाशी APMC (मुंबई)', hi: 'वाशी APMC (मुंबई)', en: 'Mumbai APMC (Vashi)' },
      patterns: ['वाशी', 'vashi', 'mumbai', 'मुंबई', 'नवी मुंबई', 'navi mumbai'],
      negativePatterns: []
    },
    {
      id: 'pune',
      canonical: 'Pune',
      queryMarket: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      displayName: { mr: 'पुणे APMC', hi: 'पुणे APMC', en: 'Pune APMC' },
      patterns: ['पुणे', 'pune', 'पूना', 'poona'],
      negativePatterns: []
    },
    {
      id: 'nagpur',
      canonical: 'Nagpur',
      queryMarket: 'Nagpur',
      district: 'Nagpur',
      state: 'Maharashtra',
      displayName: { mr: 'नागपूर APMC', hi: 'नागपुर APMC', en: 'Nagpur APMC' },
      patterns: ['नागपूर', 'नागपुर', 'nagpur'],
      negativePatterns: []
    },
    {
      id: 'solapur',
      canonical: 'Solapur',
      queryMarket: 'Solapur',
      district: 'Solapur',
      state: 'Maharashtra',
      displayName: { mr: 'सोलापूर APMC', hi: 'सोलापुर APMC', en: 'Solapur APMC' },
      patterns: ['सोलापूर', 'सोलापुर', 'solapur'],
      negativePatterns: []
    },
    {
      id: 'indore',
      canonical: 'Indore',
      queryMarket: 'Indore',
      district: 'Indore',
      state: 'Madhya Pradesh',
      displayName: { mr: 'इंदूर मंडी', hi: 'इंदौर मंडी', en: 'Indore Mandi' },
      patterns: ['इंदूर', 'इंदौर', 'indore'],
      negativePatterns: []
    }
  ];

  // ══════════════════════════════════════════════════════════════════
  // 2. DATA ACCESS LAYER
  // ══════════════════════════════════════════════════════════════════
  var KrishiSahayakData = {
    getCrop: function (cropId) {
      if (typeof MPC_DATA !== 'undefined' && MPC_DATA.length) {
        var ownCrop = KS_DATA.crops.find(function (c) { return c.id === cropId; });
        if (ownCrop) return ownCrop;
      }
      return KS_DATA.crops.find(function (c) { return c.id === cropId; }) || null;
    },

    getAllCrops: function () {
      return KS_DATA.crops;
    },

    fetchMandiPrices: function (cropId, targetMandi) {
      var crop = (typeof cropId === 'string') ? cropId : 'onion';
      var m = (typeof targetMandi === 'object' && targetMandi) ? (targetMandi.queryMarket || targetMandi.canonical || targetMandi.id) : (targetMandi || '');
      var url = '/api/market/mandi-prices?commodity=' + encodeURIComponent(crop) + (m ? '&market=' + encodeURIComponent(m) : '');
      return fetch(url).then(function (r) { return r.json(); }).catch(function () { return { success: false, data: [] }; });
    },

    getMandiRankings: function (cropId, quantityQ) {
      var crop = this.getCrop(cropId);
      if (!crop) return [];

      var truckRate = 28;
      var basePrice = crop.price || 2500;
      return KS_DATA.mandis.map(function (m) {
        var pricePerQ = Math.round(basePrice * m.priceMultiplier);
        var grossValue = pricePerQ * quantityQ;
        var trucks = Math.ceil(quantityQ / 50);
        var transportTotal = Math.round(trucks * m.distKm * truckRate);
        var netReturn = Math.max(grossValue - transportTotal, 0);
        var netPerQ = Math.round(netReturn / quantityQ);
        var demandScore = m.demandLevel === 'High' ? 5000 : m.demandLevel === 'Medium' ? 2500 : 500;
        var proximityScore = (1 / (m.distKm + 1)) * 10000 * 0.2;
        var score = netReturn * 0.6 + proximityScore + demandScore;
        return {
          name: m.name, distKm: m.distKm, demandLevel: m.demandLevel, state: m.state,
          pricePerQ: pricePerQ, grossValue: grossValue, transportTotal: transportTotal,
          netReturn: netReturn, netPerQ: netPerQ, score: score
        };
      }).sort(function (a, b) { return b.score - a.score; });
    },

    getBuyersForCrop: function (cropId) {
      var crop = this.getCrop(cropId);
      if (!crop) return [];
      var cropName = crop.name;
      return KS_DATA.buyers.filter(function (b) {
        return b.crops && b.crops.some(function (c) {
          return c.toLowerCase() === cropName.toLowerCase();
        });
      });
    },

    getFarmerLots: function () {
      try {
        var raw = localStorage.getItem('krishishetra_state_v1');
        if (raw) {
          var state = JSON.parse(raw);
          return (state.lots || []).filter(function (l) { return l.status === 'listed'; });
        }
      } catch (e) {}
      return [];
    },

    getTrend: function (cropId) {
      var crop = this.getCrop(cropId);
      if (!crop) return null;
      var current = crop.price || 2500;
      var mult = crop.dir === 'up' ? 1 : -1;
      return {
        current: current,
        forecast3d: Math.round(current * (1 + mult * crop.change * 0.01)),
        forecast7d: Math.round(current * (1 + mult * crop.change * 0.018)),
        dir: crop.dir,
        change: crop.change,
        market: crop.market
      };
    },

    getTransportEstimate: function (distKm, quantityQ) {
      var q = Math.max(1, quantityQ || 10);
      var d = Math.max(5, distKm || 40);
      var trucks = Math.ceil(q / 50);
      var total = Math.round(trucks * d * 28);
      return { trucks: trucks, total: total, ratePerQ: Math.round(total / q), distKm: d };
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // 3. LANGUAGE DETECTOR (English, Hindi, Marathi)
  // ══════════════════════════════════════════════════════════════════
  var LanguageDetector = {
    currentLanguage: (function () {
      try {
        var saved = localStorage.getItem('krishi_lang') || localStorage.getItem('krishiLang');
        if (saved && ['en', 'hi', 'mr'].indexOf(saved) !== -1) return saved;
      } catch (e) {}
      return 'mr'; // KrishiShetra farmer portal default
    })(),

    detect: function (text) {
      if (!text || !text.trim()) return this.currentLanguage;

      var hasDevanagari = /[\u0900-\u097F]/.test(text);
      if (!hasDevanagari) {
        // If query is typed in English or Latin script
        // Check if user has selected Hindi/Marathi in UI; if so, keep the conversation language!
        if (this.currentLanguage === 'hi' || this.currentLanguage === 'mr') {
          // If strictly english query like "where sell" or "onion price", detect 'en' for phrasing,
          // but respect the UI language when returning final formatted response if preferred.
          return 'en';
        }
        return 'en';
      }

      var lower = text.toLowerCase();

      var mrWords = [
        'माझ्याकडे', 'माझे', 'माझा', 'माझी', 'मला', 'आहेत', 'आहे', 'नाही', 'कुठे', 'कसे',
        'केव्हा', 'विकावा', 'विकावे', 'विकू', 'विकायचे', 'विकायची', 'शेतकरी', 'बाजार', 'बाजारात',
        'बाजारभाव', 'भाव', 'दर', 'किंमत', 'किंमती', 'वाहतूक', 'खर्च', 'किती', 'काय', 'चालू',
        'येईल', 'होईल', 'खरेदीदार', 'शोधा', 'सांगा', 'करा', 'करावे', 'मिळेल', 'मिळतील', 'नफा',
        'निव्वळ', 'परतावा', 'चांगला', 'चांगले', 'चांगली', 'कोणता', 'कोणते', 'कोणत्या', 'टोमॅटो',
        'कांदा', 'कांद्या', 'कांद्याचा', 'कांद्याचे', 'कांद्याची', 'कांद्याला', 'कांद्यांना', 'कांदे',
        'बटाटा', 'बटाट्या', 'बटाट्याचा', 'बटाट्याचे', 'बटाटे', 'गहू', 'गव्हा', 'गव्हाचा', 'गव्हाचे',
        'तांदूळ', 'तांदळा', 'तांदळाचा', 'भात', 'मका', 'मक्या', 'मक्याचा', 'कापूस', 'कापसा',
        'केळी', 'द्राक्षे', 'द्राक्ष', 'आंबा', 'आंब्या', 'शेंगदाणा', 'भुईमूग', 'तूर', 'तुरी',
        'डाळ', 'पाहिजे', 'द्या', 'वरून', 'कडून', 'साठी', 'पिकासाठी', 'त्यांचे', 'यांचे', 'वाशी',
        'थांबू', 'वाढतील', 'वाढणार', 'पडेल', 'ग्राहक', 'व्यापारी', 'नमस्कार', 'हॅलो', 'पुढचा', 'प्रश्न', 'होय'
      ];

      var hiWords = [
        'मेरे', 'मेरी', 'मेरा', 'मुझे', 'मुझको', 'हैं', 'है', 'नहीं', 'कहाँ', 'कहा',
        'कैसे', 'कब', 'बेचना', 'बेचू', 'बेचे', 'किसान', 'मंडी', 'परिवहन', 'खर्च',
        'कितना', 'कितने', 'आएगा', 'होगा', 'खरीदार', 'ढूंढो', 'ढूँढो', 'बताओ', 'बताएं',
        'करो', 'मिलेगा', 'मिलेंगे', 'मुनाफा', 'फायदा', 'दाम', 'अच्छा', 'अच्छी', 'कौनसा',
        'कौनसी', 'टमाटर', 'प्याज', 'प्याज़', 'आलू', 'गेहूं', 'चावल', 'कपास', 'केला', 'अंगूर',
        'आम', 'मूंगफली', 'दाल', 'चाहिए', 'सकता', 'सकते', 'सकती', 'नमस्ते', 'प्रणाम', 'अगला', 'सवाल'
      ];

      var mrScore = 0;
      var hiScore = 0;

      for (var i = 0; i < mrWords.length; i++) {
        if (lower.indexOf(mrWords[i]) !== -1) mrScore += 3;
      }
      for (var j = 0; j < hiWords.length; j++) {
        if (lower.indexOf(hiWords[j]) !== -1) hiScore += 3;
      }

      if (/[क-ह]ावे|[क-ह]तील|[क-ह]तात|[क-ह]तोय|[क-ह]णारा?|ात\b|्यात\b|्याचा\b|्याचे\b|्याची\b|ायचे\b|ावा\b|ावे\b/.test(text)) mrScore += 2;
      if (/\b(में|को|से|का|की|के|रहा|रही|रहे|था|थी|थे|हूँ|हूं|क्या)\b/.test(text)) hiScore += 2;

      if (mrScore > hiScore) {
        return 'mr';
      } else if (hiScore > mrScore) {
        return 'hi';
      }

      return this.currentLanguage || 'mr';
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // 4. MULTI-TURN CONVERSATION CONTEXT MEMORY (Phase 2)
  // ══════════════════════════════════════════════════════════════════
  var KrishiSahayakMemory = {
    language: 'mr',
    lastIntent: null,
    cropId: null,
    cropName: null,
    variety: null,
    mandi: null,
    lastMandi: null,
    district: null,
    state: null,
    comparedMandi: null,
    quantityQ: null,
    unit: 'quintal',
    price: null,
    grade: null,
    awaiting: null,       // null | 'CLARIFY_CROP' | 'CLARIFY_MANDI' | 'CLARIFY_QTY' | 'CONFIRM_NEARBY' | 'ASK_NEXT_QUESTION'
    pendingAction: null,  // intent to execute once clarification is answered
    conversationActive: true,

    update: function (data) {
      if (!data) return;
      if (data.cropId) {
        this.cropId = data.cropId;
        var c = KrishiSahayakData.getCrop(data.cropId);
        this.cropName = c ? c.name : data.cropId;
      }
      if (data.cropName) this.cropName = data.cropName;
      if (data.variety) this.variety = data.variety;
      if (data.quantityQ) this.quantityQ = data.quantityQ;
      if (data.unit) this.unit = data.unit;
      if (data.grade) this.grade = data.grade;
      if (data.price !== undefined) this.price = data.price;
      if (data.district) this.district = data.district;
      if (data.state) this.state = data.state;
      if (data.mandi) {
        this.lastMandi = this.mandi;
        this.mandi = data.mandi;
      }
      if (data.comparedMandi) this.comparedMandi = data.comparedMandi;
      if (data.lastIntent) this.lastIntent = data.lastIntent;
      if (data.awaiting !== undefined) this.awaiting = data.awaiting;
      if (data.pendingAction !== undefined) this.pendingAction = data.pendingAction;
      if (data.conversationActive !== undefined) this.conversationActive = data.conversationActive;
      if (data.language) this.language = data.language;
    },

    getContext: function () {
      return {
        language: this.language,
        crop: this.cropName || this.cropId,
        cropId: this.cropId,
        cropName: this.cropName,
        variety: this.variety,
        mandi: this.mandi,
        lastMandi: this.lastMandi,
        district: this.district,
        state: this.state,
        quantity: this.quantityQ,
        quantityQ: this.quantityQ,
        unit: this.unit,
        price: this.price,
        grade: this.grade,
        lastIntent: this.lastIntent,
        awaiting: this.awaiting,
        pendingAction: this.pendingAction,
        conversationActive: this.conversationActive
      };
    },

    clearAwaiting: function () {
      this.awaiting = null;
      this.pendingAction = null;
    },

    reset: function () {
      this.cropId = null;
      this.cropName = null;
      this.variety = null;
      this.mandi = null;
      this.lastMandi = null;
      this.district = null;
      this.state = null;
      this.price = null;
      this.comparedMandi = null;
      this.quantityQ = null;
      this.grade = null;
      this.awaiting = null;
      this.pendingAction = null;
      this.lastIntent = null;
      this.conversationActive = false;
    },

    clear: function () {
      this.reset();
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // 5. INTENT DETECTION & ENTITY EXTRACTION ENGINE (Phase 11)
  // ══════════════════════════════════════════════════════════════════
  var KrishiSahayakEngine = {
    CROP_KEYWORDS: {
      tomato: [
        'tomato', 'tomatoes', 'tamatar',
        'टोमॅटो', 'टोमेटो', 'टोमॅटोस', 'टोमॅटोचा', 'टोमॅटोचे', 'टोमॅटोची', 'टोमॅटोंचा', 'टोमॅटोला',
        'टमाटर', 'टमाटरों'
      ],
      onion: [
        'onion', 'onions', 'pyaz', 'pyaaz', 'kanda',
        'कांदा', 'कांद्या', 'कांद्याचा', 'कांद्याचे', 'कांद्याची', 'कांद्याला', 'कांद्यांना', 'कांद्यांचे', 'कांदे',
        'प्याज', 'प्याज़'
      ],
      wheat: [
        'wheat', 'gehu', 'gehun',
        'गहू', 'गव्हा', 'गव्हाचा', 'गव्हाचे', 'गव्हाची', 'गव्हाला',
        'गेहूं', 'गेहू'
      ],
      rice: [
        'rice', 'chawal', 'paddy', 'dhan',
        'तांदूळ', 'तांदळा', 'तांदळाचा', 'तांदळाचे', 'तांदळाची', 'भात',
        'चावल', 'धान'
      ],
      soybean: [
        'soybean', 'soya', 'soyabean', 'soybeans',
        'सोयाबीन', 'सोयाबीनचा', 'सोयाबीनचे', 'सोयाबीनची', 'सोया'
      ],
      potato: [
        'potato', 'potatoes', 'aloo', 'alu', 'batata',
        'बटाटा', 'बटाट्या', 'बटाट्याचा', 'बटाट्याचे', 'बटाट्याची', 'बटाटे',
        'आलू'
      ],
      chilli: [
        'chilli', 'chili', 'chillies', 'mirch', 'red chilli',
        'मिरची', 'मिरच्या', 'मिरचीचा', 'मिरचीचे', 'मिरचीची',
        'मिर्च'
      ],
      maize: [
        'maize', 'corn', 'makka',
        'मका', 'मक्या', 'मक्याचा', 'मक्याचे', 'मक्याला',
        'मक्का', 'भुट्टा'
      ],
      cotton: [
        'cotton', 'kapas',
        'कापूस', 'कापसा', 'कापसाचा', 'कापसाचे', 'कापसाला',
        'कपास'
      ],
      grapes: [
        'grapes', 'grape', 'angoor',
        'द्राक्षे', 'द्राक्ष', 'द्राक्षा', 'द्राक्षाचा', 'द्राक्षाचे',
        'अंगूर'
      ],
      mango: [
        'mango', 'mangoes', 'aam',
        'आंबा', 'आंब्या', 'आंब्याचा', 'आंब्याचे', 'आंबे',
        'आम'
      ],
      banana: [
        'banana', 'bananas', 'kela',
        'केळी', 'केळे', 'केळ्या', 'केळ्याचा', 'केळ्याचे',
        'केला', 'केले'
      ],
      pulses: [
        'pulses', 'pulse', 'dal', 'tur', 'toor', 'chana', 'gram',
        'डाळ', 'डाळी', 'डाळीचा', 'डाळीचे', 'तूर', 'तुरी', 'तुरीचा', 'तुरीचे', 'चना', 'हरभरा', 'हरभऱ्याचा',
        'दाल', 'तुअर', 'अरहर'
      ],
      groundnut: [
        'groundnut', 'peanut', 'peanuts', 'mungfali',
        'शेंगदाणा', 'शेंगदाणे', 'शेंगदाण्याचा', 'भुईमूग', 'भुईमुगाचा',
        'मूंगफली'
      ]
    },

    isYes: function (text) {
      if (!text) return false;
      var norm = text.toLowerCase().trim().replace(/[।?!,.:;]/g, '');
      return /^(yes|yeah|yep|ha|haa|haan|sure|okay|ok|हो|होय|नक्की|नक्कीच|हाँ|हां|जी हाँ|ज़रूर|जरूर|बिल्कुल)$/i.test(norm) ||
             /^(yes|हाँ|हो)\s*(next|done|अगला|पुढचा)?/i.test(norm) ||
             /(अगला सवाल|पुढचा प्रश्न|next question)/i.test(norm);
    },

    isNo: function (text) {
      if (!text) return false;
      var norm = text.toLowerCase().trim().replace(/[।?!,.:;]/g, '');
      return /^(no|nope|nah|nahi|nahin|नहीं|नाही|ना|बस|नको|done|that's all|stop|exit|close|bye|अलविदा)$/i.test(norm) ||
             /^(i'm done|im done|done|no thanks|बस इतना ही|झाले|काही नको|काही नाही)$/i.test(norm);
    },

    detectIntent: function (text, memory) {
      if (!text || !text.trim()) return 'UNKNOWN';
      var lower = text.toLowerCase().trim();
      var norm = lower.replace(/[।?!,.:;]/g, ' ');

      // 1. Natural YES / NO handling when actively in conversation or closing prompt
      if (memory && memory.awaiting === 'ASK_NEXT_QUESTION') {
        if (this.isYes(text)) return 'YES_CONTINUE';
        if (this.isNo(text)) return 'NO_CLOSE';
      }

      // Handle nearby mandis confirmation state
      if (memory && memory.awaiting === 'CONFIRM_NEARBY_MANDIS') {
        if (this.isYes(text) || /(जवळच्या|शेजारील|पास की|nearby|दाखवा|दिखाएं|show)/i.test(norm)) {
          return 'SHOW_NEARBY_MANDIS';
        }
        if (this.isNo(text)) {
          return 'NO_CLOSE';
        }
      }

      // Check general explicit exit / cancel
      if (this.isNo(text)) {
        return 'NO_CLOSE';
      }
      if (this.isYes(text)) {
        return 'YES_CONTINUE';
      }

      // 2. Pure Greeting Check
      var hasBusinessQuery = /(भाव|बाजारभाव|किंमत|दर|दाम|रेट|price|rate|bhav|विक|bech|sell|खरेदी|ग्राहक|व्यापारी|buyer|वाहतूक|परिवहन|ट्रक|गाडी|transport|नफा|मुनाफा|profit|return|वाढ|कमी|थांब|ट्रेंड|trend|forecast|कांद|टोमॅ|बटाट|गव्हा|गहू|तांद|भात|सोया|तूर|डाळ|मका|कापूस|कपास|मंडी|बाजार|क्विंटल|किलो)/i.test(norm);
      var isPureGreeting = /^(नमस्कार|हॅलो|हाय|नमस्ते|प्रणाम|शुभ सकाळ|शुभ दुपार|शुभ संध्याकाळ|hello|hi|hey|namaste|namaskar|jai kisan)[\s!.]*$/i.test(norm) ||
                           (/^(हॅलो|हाय|नमस्कार|नमस्ते|hello|hi)\s*(कृषी सहायक|कृषि सहायक|krishi sahayak)/i.test(norm)) ||
                           (/^(कृषी सहायक|कृषि सहायक|krishi sahayak)[\s!.]*$/i.test(norm));

      if (isPureGreeting && !hasBusinessQuery) {
        return 'GREETING';
      }

      // 3. COMPARE_MANDIS (e.g. "compare it with Pune", "Nashik vs Lasalgaon", "मंडियों की तुलना")
      if (/(compare.*with|compare.*to|versus|\bvs\b|मंड्यांची तुलना|मंडियों की तुलना|तुलना करा|तुलना करो|शी तुलना|से तुलना)/i.test(norm)) {
        return 'COMPARE_MANDIS';
      }

      // 4. WHICH_BUYER_BETTER (specific buyer comparison query)
      if (/(कोणता.*खरेदीदार.*चांगला|सर्वोत्तम.*खरेदीदार|कोणता.*उत्तम|कोणता.*व्यापारी.*चांगला|कोणता.*चांगला|कौनसा.*खरीदार.*अच्छा|बेस्ट.*खरीदार|which.*buyer.*better|best.*buyer|better.*buyer|compare.*buyer)/i.test(norm)) {
        return 'WHICH_BUYER_BETTER';
      }

      // 5. FIND_BUYERS (खरेदीदार / ग्राहक / व्यापारी शोधणे)
      if (/(खरेदीदार.*शोध|खरेदीदार.*सांग|खरेदीदार.*कुठे|खरेदीदार.*मिळ|माझ्यासाठी.*खरेदीदार|माल.*कोण.*घेईल|कोण.*खरेदी.*करेल|मला.*ग्राहक.*शोध|पिकासाठी.*खरेदीदार|खरेदीदार शोधा|ग्राहक.*शोध|व्यापारी.*शोध|खरेदीदार|खरीदार.*ढूंढ|खरीदार.*बता|खरीदार.*कहाँ|खरीदार खोजें|खरीदार|find.*buyer|who.*buy|buyer.*near|buyers)/i.test(norm)) {
        return 'FIND_BUYERS';
      }

      // 6. PRICE_TREND (भाव वाढणार का, आता विकू का, थांबू का, ट्रेंड, कल क्या होगा, what about tomorrow)
      if (/(भाव.*वाढणार|भाव.*वाढतील|भाव.*कमी.*होतील|आता.*विकू.*का|थांबू.*का|आत्ता.*विकावे.*का|भाव.*कधी.*वाढतील|बाजाराचा.*कल|भावाचा.*ट्रेंड|भाव.*कसे.*राहतील|कल.*काय|अंदाज.*काय|भाव.*वाढेल|वाढेल.*का|भाव.*बढ़ेगा|रुकूं.*या.*बेचूं|ट्रेंड.*क्या|कल.*क्या|कल.*भाव|उद्या.*भाव|उद्या.*काय|what.*about.*tomorrow|should.*sell.*now|wait.*sell|price.*trend|price.*forecast|will.*price.*increase|trend)/i.test(norm)) {
        return 'PRICE_TREND';
      }

      // 7. WHERE_SELL (कुठे विकावा, कुठे विकावे, कुठे विकू, कोणत्या बाजारात विकावे, कहाँ बेचूं)
      if (/(कुठे.*विका|कुठे.*विकू|कुठे.*विकाय|माल.*कुठे.*विका|कोणत्या.*बाजारात.*विका|कोणत्या.*मंडईत.*विका|सर्वात.*चांगला.*बाजार|चांगला.*बाजार.*कोणता|कुठे.*जास्त.*भाव|कोणत्या.*मार्केट|कुठे.*विक्री|कहाँ.*बेच|कहाँ.*बेचना|किधर.*बेच|कौनसी.*मंडी|where.*sell|best.*market|which.*mandi|where.*should.*i.*sell)/i.test(norm) ||
          ((norm.indexOf('कुठे') !== -1 || norm.indexOf('कहाँ') !== -1 || norm.indexOf('where') !== -1) && (norm.indexOf('विक') !== -1 || norm.indexOf('बेच') !== -1 || norm.indexOf('sell') !== -1))) {
        return 'WHERE_SELL';
      }

      // 8. TRANSPORT (वाहतूक खर्च, ट्रान्सपोर्ट, ट्रक, परिवहन)
      if (/(वाहतूक.*खर्च|ट्रान्सपोर्ट.*खर्च|माल.*नेण्यासाठी.*खर्च|वाहतूक.*किती|ट्रकचा.*खर्च|गाडी.*भाडे|गाडी.*खर्च|वाहतूक|परिवहन.*खर्च|भाड़ा.*कितना|ट्रक.*खर्च|परिवहन|transport.*cost|truck.*cost|freight|how.*much.*transport|shipping.*cost|transport)/i.test(norm) ||
          (norm.indexOf('वाहतूक') !== -1 || norm.indexOf('ट्रान्सपोर्ट') !== -1 || norm.indexOf('परिवहन') !== -1)) {
        return 'TRANSPORT';
      }

      // 9. NET_RETURN (निव्वळ नफा, निव्वळ किती पैसे, शुद्ध मुनाफ़ा, net return)
      if (/(निव्वळ.*नफा|निव्वळ.*किती|सगळा.*खर्च.*वजा|वाहतूक.*वजा|माझा.*नफा|नफा.*किती|नेट.*रिटर्न|निव्वळ.*परतावा|निव्वळ परतावा|किती.*नफा|शुद्ध.*मुनाफा|शुद्ध मुनाफ़ा|कितना.*मुनाफा|net.*return|calculate.*net|how.*much.*earn|net.*profit|calculate.*earnings)/i.test(norm) ||
          (norm.indexOf('निव्वळ') !== -1 || (norm.indexOf('नफा') !== -1 && (norm.indexOf('किती') !== -1 || norm.indexOf('मिळ') !== -1)))) {
        return 'NET_RETURN';
      }

      // 10. PRICE_CHECK (कांद्याचा भाव काय चालू आहे, बाजार भाव सांगा मला, onion price, mandi rate)
      var hasPriceWord = /(भाव|बाजारभाव|बाजार\s*भाव|किंमत|किंमती|दर|दाम|रेट|price|rate|bhav)/i.test(norm);
      var hasInquiryWord = /(काय|किती|सांगा|चालू|आज|आजचा|आजचे|दिसतो|सांग|आहे|आहेत|कितना|क्या|बताओ|बताएं|check|what|how\s*much|today)/i.test(norm);
      var cropFound = this.extractCropFromText(text);
      var mandiFound = this.extractMandi(text);

      if (hasPriceWord && (hasInquiryWord || cropFound || mandiFound)) {
        return 'PRICE_CHECK';
      }

      if (/(कांद्याचा.*भाव|भाव.*काय|भाव.*किती|बाजारभाव.*सांगा|बाजार.*भाव.*सांगा|आजचा.*बाजार.*भाव|किंमत.*किती|बाजारात.*काय.*भाव|भाव.*चालू|मंडी.*भाव|मंडी का भाव|बाजारभाव पाहा|दाम.*क्या|रेट.*क्या|market.*price|today.*price|check.*price|check market price)/i.test(norm)) {
        return 'PRICE_CHECK';
      }

      // 11. Follow-up mandi/crop query (e.g., "and Lasalgaon?", "Nashik", "Lasalgaon ka?")
      if (mandiFound && memory && memory.cropId) {
        return memory.lastIntent || 'PRICE_CHECK';
      }

      // 12. LOT_REGISTRATION / CROP STATEMENT (e.g. "माझ्याकडे 500 किलो कांदे आहेत.")
      var hasLotWords = /(माझ्याकडे|माझा|माझे|माझी|आहेत|आहे|मेरे पास|मेरे|i have|have got|i got)/i.test(norm);
      if (hasLotWords && cropFound && this.extractQuantity(text)) {
        return 'LOT_REGISTRATION';
      }

      // If user typed crop directly during clarification
      if (cropFound) {
        if (memory && memory.awaiting === 'CLARIFY_CROP') {
          return memory.pendingAction || 'PRICE_CHECK';
        }
        if (!hasPriceWord) {
          return 'PRICE_CHECK';
        }
      }

      return 'UNKNOWN';
    },

    extractCropFromText: function (text) {
      if (!text) return null;
      var lower = text.toLowerCase();
      for (var cropId in this.CROP_KEYWORDS) {
        var keywords = this.CROP_KEYWORDS[cropId];
        for (var i = 0; i < keywords.length; i++) {
          if (lower.indexOf(keywords[i].toLowerCase()) !== -1) {
            return cropId;
          }
        }
      }
      return null;
    },

    extractQuantity: function (text) {
      if (!text) return null;
      var normalized = text.replace(/[०-९]/g, function (d) {
        return '०१२३४५६७८९'.indexOf(d);
      });
      var match = normalized.match(/(\d+)\s*(kg|quintal|q|quintals|kilo|kilos|किलो|क्विंटल|टन)?/i);
      if (!match) return null;
      var num = parseInt(match[1]);
      var unit = (match[2] || 'kg').toLowerCase();
      if (unit.charAt(0) === 'q' || unit === 'क्विंटल') return num;
      if (unit === 'टन') return num * 10;
      return Math.max(1, Math.round(num / 100)); // kg to quintals
    },

    extractGrade: function (text) {
      if (/grade\s*a|दर्जा\s*अ|प्रत\s*अ|ग्रेड\s*ए/i.test(text)) return 'Grade A';
      if (/grade\s*b|दर्जा\s*ब|प्रत\s*ब|ग्रेड\s*बी/i.test(text)) return 'Grade B';
      if (/grade\s*c|दर्जा\s*क|प्रत\s*क|ग्रेड\s*सी/i.test(text)) return 'Grade C';
      return null;
    },

    resolveMandiEntity: function (text) {
      if (!text) return null;
      var clean = text.toLowerCase().trim().replace(/[।?!,.:;()\/\\-]/g, ' ');

      // 1. Check all KNOWN_MANDIS with strict negative patterns & suffix tolerance
      for (var i = 0; i < KNOWN_MANDIS.length; i++) {
        var m = KNOWN_MANDIS[i];

        // Check negative patterns first (e.g. reject Chandigarh for Chandwad, reject Chandwad for Chandigarh)
        if (m.negativePatterns && m.negativePatterns.length > 0) {
          var hasNeg = false;
          for (var n = 0; n < m.negativePatterns.length; n++) {
            if (clean.indexOf(m.negativePatterns[n].toLowerCase()) !== -1) {
              hasNeg = true;
              break;
            }
          }
          if (hasNeg) continue;
        }

        // Check positive patterns with suffix tolerance
        for (var p = 0; p < m.patterns.length; p++) {
          var pat = m.patterns[p].toLowerCase();
          // Regex matching token boundary with Marathi/Hindi/English postpositions/suffixes
          // Marathi suffixes: च्या, चा, ची, चे, ला, मधील, तील, हून, वरून, साठी, ात, ा
          // Hindi suffixes: के, का, की, में, से, को
          // English suffixes: 's
          var regex = new RegExp('(^|[^\\u0900-\\u097F\\w])' + pat + '(च्या|चा|ची|चे|ला|मधील|तील|हून|वरून|साठी|ात|ा|के|का|की|में|से|को|\\\'s)?($|[^\\u0900-\\u097F\\w])', 'i');
          if (regex.test(clean) || clean.indexOf(pat) !== -1) {
            return {
              id: m.id,
              canonical: m.canonical,
              queryMarket: m.queryMarket,
              district: m.district,
              state: m.state,
              displayName: m.displayName,
              toString: function () { return this.canonical; },
              toLowerCase: function () { return this.canonical.toLowerCase(); },
              indexOf: function (s) { return this.canonical.indexOf(s); },
              split: function (sep) { return this.canonical.split(sep); }
            };
          }
        }
      }

      // 2. Generic fallback for unknown mandi mentions (e.g., "XYZ मंडी", "XYZ APMC")
      var mMatch = clean.match(/([a-z\u0900-\u097F]{3,})\s*(?:मंडी|बाजार|apmc|मार्केट)/i);
      if (mMatch) {
        var cand = mMatch[1].trim();
        var stopwords = ['कोणत्या', 'कोणती', 'सर्व', 'आज', 'आजचा', 'आजचे', 'काही', 'या', 'माझ्या', 'माझी', 'सध्या', 'konse', 'konsi', 'today', 'check'];
        if (stopwords.indexOf(cand) === -1) {
          var cap = cand.charAt(0).toUpperCase() + cand.slice(1);
          return {
            id: cand,
            canonical: cap,
            queryMarket: cap,
            district: '',
            state: '',
            displayName: { mr: cap + ' मंडी', hi: cap + ' मंडी', en: cap + ' Mandi' },
            toString: function () { return this.canonical; },
            toLowerCase: function () { return this.canonical.toLowerCase(); },
            indexOf: function (s) { return this.canonical.indexOf(s); },
            split: function (sep) { return this.canonical.split(sep); }
          };
        }
      }

      return null;
    },

    extractMandi: function (text) {
      return this.resolveMandiEntity(text);
    },

    getFarmerContext: function () {
      var lots = KrishiSahayakData.getFarmerLots();
      if (!lots.length) return null;
      var lot = lots[0];
      return { cropId: lot.cropId, cropName: lot.crop, quantityQ: lot.quantity, grade: lot.grade, location: lot.location };
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // 6. MULTILINGUAL RESPONSE GENERATORS (Phases 1, 3, 4, 6, 7, 9)
  // ══════════════════════════════════════════════════════════════════
  var R = {
    _n: function (n) { return (n || 0).toLocaleString('en-IN'); },

    getCropDisplayName: function (cropId, lang) {
      if (!cropId) return '';
      if (CROP_NAMES[cropId] && CROP_NAMES[cropId][lang]) return CROP_NAMES[cropId][lang];
      var c = KrishiSahayakData.getCrop(cropId);
      return c ? c.name : cropId;
    },

    // Phase 6: Natural Closing Question
    getClosingQuestion: function (lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var text = {
        en: 'Would you like to do anything else?',
        hi: 'क्या आप कुछ और जानना चाहते हैं?',
        mr: 'तुम्हाला आणखी काही जाणून घ्यायचे आहे का?'
      }[lang] || 'Would you like to do anything else?';

      var yesBtn = {
        en: 'Yes, next question',
        hi: 'हाँ, अगला सवाल',
        mr: 'हो, पुढचा प्रश्न'
      }[lang] || 'Yes, next question';

      var noBtn = {
        en: 'No, I\'m done',
        hi: 'नहीं',
        mr: 'नाही'
      }[lang] || 'No, I\'m done';

      return '<div class="ks-closing-box">' +
        '<p class="ks-closing-box__q">' + text + '</p>' +
        '<div class="ks-closing-box__btns">' +
          '<button class="ks-quick-btn ks-btn-yes" data-action="yes-continue">' + yesBtn + '</button>' +
          '<button class="ks-quick-btn ks-btn-no" data-action="no-close">' + noBtn + '</button>' +
        '</div>' +
      '</div>';
    },

    // Phase 4: Localized Startup & Welcome Experience
    welcome: function (lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var text = WELCOME_MESSAGES[lang] || WELCOME_MESSAGES['en'];
      return {
        html: '<p class="ks-welcome-text">' + text + '</p>'
      };
    },

    // Phase 7: Smart Clarification (asks ONLY one question at a time, never asks closing prompt here)
    askingCrop: function (lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var pills = ['onion', 'tomato', 'wheat', 'soybean', 'potato', 'chilli'].map(function (id) {
        var name = CROP_NAMES[id] && CROP_NAMES[id][lang] ? CROP_NAMES[id][lang] : id;
        return '<button class="ks-quick-btn" data-query="' + name + '">' + name + '</button>';
      }).join('');

      var text = {
        mr: '<p style="margin-bottom:8px;">तुम्ही कोणत्या पिकाची माहिती पाहू इच्छिता? 🌾</p>',
        hi: '<p style="margin-bottom:8px;">आप किस फसल की जानकारी देखना चाहते हैं? 🌾</p>',
        en: '<p style="margin-bottom:8px;">Which crop are you asking about? 🌾</p>'
      }[lang] || '<p style="margin-bottom:8px;">Which crop are you asking about? 🌾</p>';

      return { html: text + '<div class="ks-quick-actions">' + pills + '</div>', isClarification: true };
    },

    askingCropForMandi: function (targetMandi, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var mName = (typeof targetMandi === 'object' && targetMandi)
        ? (targetMandi.displayName && targetMandi.displayName[lang] ? targetMandi.displayName[lang] : targetMandi.canonical)
        : (targetMandi || 'मंडी');

      var isChandwad = (typeof targetMandi === 'object' && targetMandi ? targetMandi.id === 'chandwad' : /chandwad|चांदवड/i.test(mName));

      var text = {
        mr: isChandwad ? 'चांदवड मंडीसाठी कोणत्या पिकाचा भाव पाहायचा? 🌾' : (mName + 'साठी कोणत्या पिकाचा भाव पाहायचा? 🌾'),
        hi: isChandwad ? 'चांदवड़ मंडी के लिए किस फसल का भाव देखना है? 🌾' : (mName + ' के लिए किस फसल का भाव देखना है? 🌾'),
        en: isChandwad ? 'Which crop\'s price would you like to check for Chandwad APMC? 🌾' : ('Which crop\'s price would you like to check for ' + mName + '? 🌾')
      }[lang] || (mName + 'साठी कोणत्या पिकाचा भाव पाहायचा? 🌾');

      var pills = ['onion', 'tomato', 'wheat', 'soybean', 'potato', 'chilli'].map(function (id) {
        var name = CROP_NAMES[id] && CROP_NAMES[id][lang] ? CROP_NAMES[id][lang] : id;
        return '<button class="ks-quick-btn" data-query="' + name + '">' + name + '</button>';
      }).join('');

      return {
        html: '<p style="margin-bottom:8px;">' + text + '</p>' +
          '<div class="ks-quick-actions">' + pills + '</div>',
        isClarification: true
      };
    },

    askingMandi: function (cropId, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var cName = R.getCropDisplayName(cropId, lang);
      var pills = KNOWN_MANDIS.filter(function (m) { return m.id !== 'chandigarh'; }).slice(0, 4).map(function (m) {
        var name = m.displayName && m.displayName[lang] ? m.displayName[lang] : m.canonical;
        return '<button class="ks-quick-btn" data-query="' + name + '">' + name + '</button>';
      }).join('');

      var text = {
        mr: '<p style="margin-bottom:8px;">' + cName + 'साठी कोणत्या बाजार समितीचा भाव पाहायचा आहे? 📍</p>',
        hi: '<p style="margin-bottom:8px;">' + cName + ' के लिए किस मंडी का भाव देखना चाहते हैं? 📍</p>',
        en: '<p style="margin-bottom:8px;">Which mandi would you like to check for ' + cName + '? 📍</p>'
      }[lang] || ('<p style="margin-bottom:8px;">Which mandi would you like to check for ' + cName + '? 📍</p>');

      return { html: text + '<div class="ks-quick-actions">' + pills + '</div>', isClarification: true };
    },

    // Phase 1 & 6: Positive / Negative closing transitions
    askNextQuestion: function (lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var text = {
        mr: 'नक्कीच! तुमचा पुढचा प्रश्न सांगा. 🌱',
        hi: 'ज़रूर। अपना अगला सवाल बताइए। 🌱',
        en: 'Sure! What is your next question? 🌱'
      }[lang] || 'Sure! What is your next question? 🌱';
      return { html: '<p>' + text + '</p>', isClarification: true };
    },

    closeConversation: function (lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var text = {
        mr: 'ठीक आहे. जेव्हाही गरज असेल, Krishi Sahayak येथे उपलब्ध आहे. तुमची शेती समृद्ध होवो! 🌱',
        hi: 'ठीक है। जब भी ज़रूरत हो, Krishi Sahayak यहाँ है। आपकी खेती समृद्ध हो! 🌱',
        en: 'Alright! Whenever you need help, Krishi Sahayak is right here. Wishing you a bountiful harvest! 🌱'
      }[lang] || 'Alright! Whenever you need help, Krishi Sahayak is right here. 🌱';
      return { html: '<p>' + text + '</p>', isClarification: true };
    },

    // Official Government Price Check Response (single crop / exact requested mandi)
    priceCheck: function (cropId, quantityQ, targetMandi, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var n = R._n;
      var cName = R.getCropDisplayName(cropId, lang);
      var cNameEn = (CROP_NAMES[cropId] ? CROP_NAMES[cropId].en : cropId) || 'Onion';

      // Call the existing server government mandi price API
      return KrishiSahayakData.fetchMandiPrices(cropId, targetMandi).then(function (res) {
        var mandiName = (typeof targetMandi === 'object' && targetMandi)
          ? (targetMandi.displayName && targetMandi.displayName[lang] ? targetMandi.displayName[lang] : targetMandi.canonical)
          : (targetMandi || '');

        var records = (res && res.success && Array.isArray(res.data)) ? res.data : [];

        // If a specific mandi was requested
        if (targetMandi) {
          var targetQuery = (typeof targetMandi === 'object' && targetMandi)
            ? (targetMandi.queryMarket || targetMandi.canonical || targetMandi.id).toLowerCase()
            : String(targetMandi).toLowerCase();

          // Strict match without cross-pollution
          var matched = records.find(function (r) {
            var m = (r.market || '').toLowerCase();
            if (targetQuery.indexOf('chandigarh') !== -1 && m.indexOf('chandigarh') === -1) return false;
            if (targetQuery.indexOf('chandwad') !== -1 && m.indexOf('chandwad') === -1) return false;
            if (targetQuery.indexOf('chandrapur') !== -1 && m.indexOf('chandrapur') === -1) return false;
            return m.indexOf(targetQuery) !== -1 || targetQuery.indexOf(m) !== -1;
          });

          // 1. EXACT MANDI RECORD FOUND IN GOVERNMENT DATA
          if (matched && (matched.modalPrice || matched.minPrice || matched.maxPrice)) {
            var modalPrice = matched.modalPrice || matched.maxPrice || matched.minPrice;
            var minPrice = matched.minPrice || modalPrice;
            var maxPrice = matched.maxPrice || modalPrice;
            var reportDate = matched.reportDate || matched.arrivalDate || 'Recent';
            var source = matched.source || 'Government of India / AGMARKNET';
            var status = matched.status || 'CACHED';

            KrishiSahayakMemory.update({
              price: modalPrice,
              mandi: targetMandi,
              district: matched.district || (targetMandi.district || ''),
              state: matched.state || (targetMandi.state || '')
            });

            // Text message following exact PART 9 contract
            var textMsg = '';
            if (lang === 'hi') {
              textMsg = mandiName + ' में ' + cName + ' का नवीनतम सरकारी मॉडल भाव ₹' + n(modalPrice) + '/qtl है।<br><br>'
                + 'Min: ₹' + n(minPrice) + '<br>'
                + 'Max: ₹' + n(maxPrice) + '<br>'
                + 'Reported: ' + reportDate;
            } else if (lang === 'mr') {
              textMsg = mandiName + ' मध्ये ' + cName + 'चा नवीनतम सरकारी मोडल भाव ₹' + n(modalPrice) + '/qtl आहे.<br><br>'
                + 'Min: ₹' + n(minPrice) + '<br>'
                + 'Max: ₹' + n(maxPrice) + '<br>'
                + 'Reported: ' + reportDate;
            } else {
              textMsg = 'The latest government-reported modal price for ' + cName + ' at ' + mandiName + ' is ₹' + n(modalPrice) + '/qtl.<br><br>'
                + 'Min: ₹' + n(minPrice) + '<br>'
                + 'Max: ₹' + n(maxPrice) + '<br>'
                + 'Reported: ' + reportDate;
            }

            // Compact Simple Price Card (PART 11)
            var card = '<div class="ks-compact-price-card">'
              + '<div class="ks-compact-price-card__header">'
              + '  <div class="ks-compact-price-card__mandi">' + mandiName + '</div>'
              + '  <div class="ks-compact-price-card__crop">' + cName + '</div>'
              + '</div>'
              + '<div class="ks-compact-price-card__price">₹' + n(modalPrice) + '<span style="font-size:13px;font-weight:normal;color:#6F7F75;">/qtl</span></div>'
              + '<div class="ks-compact-price-card__range">Min ₹' + n(minPrice) + ' · Max ₹' + n(maxPrice) + '</div>'
              + '<div class="ks-compact-price-card__footer">'
              + '  <span>📅 Reported: ' + reportDate + '</span>'
              + '  <span>🏛️ ' + (status === 'LIVE' ? 'Government live price' : 'Government-reported price') + '</span>'
              + '</div>'
              + '</div>';

            return {
              html: '<div style="font-size:13.5px;line-height:1.5;">' + textMsg + '</div>' + card,
              suggestionContext: 'after_price'
            };
          }

          // 2. REQUESTED MANDI HAS NO CURRENT RECORD
          // PART 9: If unavailable: "Chandigarh mandi ke onion ka latest government-reported price abhi available nahi hai."
          var unavailMsg = '';
          if (lang === 'hi') {
            unavailMsg = mandiName + ' के ' + cName + ' का नवीनतम सरकारी भाव अभी उपलब्ध नहीं है।';
          } else if (lang === 'mr') {
            unavailMsg = mandiName + 'च्या ' + cName + 'चा नवीनतम सरकारी भाव सध्या उपलब्ध नाही.';
          } else {
            unavailMsg = 'The latest government-reported price for ' + cName + ' at ' + mandiName + ' is currently unavailable.';
          }

          var unavailCard = '<div class="ks-compact-price-card ks-compact-price-card--unavailable">'
            + '<div class="ks-compact-price-card__header">'
            + '  <div class="ks-compact-price-card__mandi">' + mandiName + '</div>'
            + '  <div class="ks-compact-price-card__crop">' + cName + '</div>'
            + '</div>'
            + '<div class="ks-compact-price-card__price" style="font-size:16px;color:#92400E;">Price currently unavailable</div>'
            + '<div class="ks-compact-price-card__range" style="color:#78350F;font-size:11.5px;">No recent government report available</div>'
            + '</div>';

          return {
            html: '<p style="margin-bottom:6px;">' + unavailMsg + '</p>' + unavailCard,
            suggestionContext: 'initial'
          };
        }

        // If NO specific mandi requested, ask which mandi
        return R.askingMandi(cropId, lang);
      });
    },

    showNearbyMandis: function (cropId, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var n = R._n;
      var cName = R.getCropDisplayName(cropId, lang);

      return KrishiSahayakData.fetchMandiPrices(cropId).then(function (res) {
        var records = (res && res.success && Array.isArray(res.data)) ? res.data : [];
        if (!records.length) {
          var noDataMsg = {
            mr: 'सध्या या पिकासाठी जवळच्या कोणत्याही मंडईची सरकारी नोंद सापडली नाही.',
            hi: 'वर्तमान में इस फसल के लिए नजदीकी मंडियों का कोई सरकारी रिकॉर्ड उपलब्ध नहीं है।',
            en: 'No government records currently found for nearby mandis for this crop.'
          }[lang];
          return {
            html: '<p>' + noDataMsg + '</p>' + R.getClosingQuestion(lang),
            suggestionContext: 'initial'
          };
        }

        var topRecords = records.slice(0, 4);
        var rows = topRecords.map(function (r) {
          var modal = r.modalPrice || r.maxPrice || r.minPrice;
          var mName = r.market || 'APMC';
          return '<div class="ks-gov-price-row">' +
            '<span class="ks-gov-label">📍 ' + mName + '</span>' +
            '<span class="ks-gov-val">₹' + n(modal) + '/q</span>' +
          '</div>';
        }).join('');

        var title = {
          mr: '🏛️ <strong>' + cName + ' — उपलब्ध शेजारील मंड्यांचे सरकारी भाव:</strong>',
          hi: '🏛️ <strong>' + cName + ' — उपलब्ध नजदीकी मंडियों के सरकारी भाव:</strong>',
          en: '🏛️ <strong>' + cName + ' — Nearby Mandis Official Govt Prices:</strong>'
        }[lang];

        var card = '<div class="ks-gov-price-card">' +
          '<div class="ks-gov-price-card__header">' +
            '<div class="ks-gov-price-card__title">🧅 ' + cName + '</div>' +
            '<span class="ks-gov-badge">' + (lang === 'mr' ? 'अधिकृत सरकारी नोंद' : (lang === 'hi' ? 'आधिकारिक सरकारी रिकॉर्ड' : 'Official Govt Record')) + '</span>' +
          '</div>' +
          rows +
          '<div class="ks-gov-price-card__footer">' +
            '<span>🏛️ स्रोत: AGMARKNET / data.gov.in</span>' +
          '</div>' +
        '</div>';

        return {
          html: '<p style="margin-bottom:6px;">' + title + '</p>' + card + R.getClosingQuestion(lang),
          suggestionContext: 'after_price'
        };
      });
    },

    // Where to Sell / Mandi Recommendation
    whereSell: function (cropId, quantityQ, grade, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var crop = KrishiSahayakData.getCrop(cropId);
      if (!crop) return R.askingCrop(lang);

      var q = Math.max(1, quantityQ || 10);
      var rankings = KrishiSahayakData.getMandiRankings(cropId, q);
      var top3 = rankings.slice(0, 3);
      var medals = ['🥇', '🥈', '🥉'];
      var cardCls = ['ks-market-card--gold', 'ks-market-card--silver', 'ks-market-card--bronze'];
      var n = R._n;
      var cName = R.getCropDisplayName(crop.id, lang);

      var badgeLabels = {
        mr: ['सर्वोत्तम पर्याय', '२रा पर्याय', '३रा पर्याय'],
        hi: ['सर्वोत्तम विकल्प', 'दूसरा विकल्प', 'तीसरा विकल्प'],
        en: ['Best Option', '2nd Option', '3rd Option']
      }[lang] || ['Best Option', '2nd Option', '3rd Option'];

      var rowLabels = {
        mr: { price: 'बाजारभाव', dist: 'अंतर', transport: 'वाहतूक खर्च', net: 'निव्वळ नफा' },
        hi: { price: 'मंडी भाव', dist: 'दूरी', transport: 'परिवहन खर्च', net: 'शुद्ध मुनाफा' },
        en: { price: 'Mandi Price', dist: 'Distance', transport: 'Transport Cost', net: 'Est. Net Return' }
      }[lang];

      var cards = top3.map(function (m, i) {
        return '<div class="ks-market-card ' + cardCls[i] + '" style="margin-bottom:8px;">' +
          '<div class="ks-market-card__header"><span class="ks-market-card__rank">' + medals[i] + ' ' + m.name + '</span><span class="ks-market-card__badge">' + badgeLabels[i] + '</span></div>' +
          '<div class="ks-market-card__body">' +
          '<div class="ks-market-card__row"><span class="ks-market-card__row-label">💰 ' + rowLabels.price + '</span><span class="ks-market-card__row-val">₹' + n(m.pricePerQ) + '/q</span></div>' +
          '<div class="ks-market-card__row"><span class="ks-market-card__row-label">📍 ' + rowLabels.dist + '</span><span class="ks-market-card__row-val">' + m.distKm + ' km</span></div>' +
          '<div class="ks-market-card__row"><span class="ks-market-card__row-label">🚚 ' + rowLabels.transport + '</span><span class="ks-market-card__row-val">₹' + n(m.transportTotal) + '</span></div>' +
          '<div class="ks-market-card__net"><span class="ks-market-card__net-label">' + rowLabels.net + '</span><span class="ks-market-card__net-val">₹' + n(m.netReturn) + '</span></div>' +
          '</div></div>';
      }).join('');

      var best = top3[0];
      var recommendationInsight = {
        mr: '<p style="margin:8px 0;font-size:12.5px;color:#12372A;">💡 वाहतूक खर्च वजा जाता <strong>' + best.name + '</strong> मध्ये तुम्हाला सर्वाधिक निव्वळ परतावा (₹' + n(best.netReturn) + ') मिळतो.</p>',
        hi: '<p style="margin:8px 0;font-size:12.5px;color:#12372A;">💡 परिवहन लागत घटाने के बाद <strong>' + best.name + '</strong> में आपको सबसे अधिक शुद्ध लाभ (₹' + n(best.netReturn) + ') मिलेगा।</p>',
        en: '<p style="margin:8px 0;font-size:12.5px;color:#12372A;">💡 After deducting transport expenses, <strong>' + best.name + '</strong> yields the highest net return (₹' + n(best.netReturn) + ').</p>'
      }[lang];

      var headerText = {
        mr: '🌾 तुमच्या <strong>' + cName + ' (' + q + ' क्विंटल)</strong> साठी सर्वोत्तम बाजारपेठा:',
        hi: '🌾 आपके <strong>' + cName + ' (' + q + ' क्विंटल)</strong> के लिए शीर्ष अनुशंसित मंडियां:',
        en: '🌾 Top recommended markets for your <strong>' + cName + ' (' + q + ' quintals)</strong>:'
      }[lang];

      var actions = '<div class="ks-msg-actions">' +
        '<a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">⚖️ ' + (lang === 'mr' ? 'संपूर्ण तुलना' : (lang === 'hi' ? 'विस्तृत तुलना' : 'Full Comparison')) + '</a>' +
        '<button class="ks-quick-btn" data-query="' + (lang === 'mr' ? 'खरेदीदार शोधा' : (lang === 'hi' ? 'खरीदार खोजें' : 'Find buyers')) + '">🤝 ' + (lang === 'mr' ? 'खरेदीदार' : (lang === 'hi' ? 'खरीदार' : 'Buyers')) + '</button>' +
      '</div>';

      return {
        html: '<p style="margin-bottom:8px;">' + headerText + '</p>' + cards + recommendationInsight + actions + R.getClosingQuestion(lang)
      };
    },

    // Mandi Comparison (e.g., comparing Nashik with Pune)
    compareMandis: function (cropId, mandi1Name, mandi2Name, quantityQ, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var n = R._n;
      var cName = R.getCropDisplayName(cropId || 'onion', lang);

      var m1Str = (typeof mandi1Name === 'object' && mandi1Name ? (mandi1Name.canonical || mandi1Name.id) : String(mandi1Name || 'Chandigarh')).toLowerCase();
      var m2Str = (typeof mandi2Name === 'object' && mandi2Name ? (mandi2Name.canonical || mandi2Name.id) : String(mandi2Name || 'Chandwad')).toLowerCase();

      return KrishiSahayakData.fetchMandiPrices(cropId || 'onion').then(function (res) {
        var records = (res && res.success && Array.isArray(res.data)) ? res.data : [];

        var r1 = records.find(function (r) {
          var m = (r.market || '').toLowerCase();
          if (m1Str.indexOf('chandigarh') !== -1 && m.indexOf('chandigarh') === -1) return false;
          if (m1Str.indexOf('chandwad') !== -1 && m.indexOf('chandwad') === -1) return false;
          if (m1Str.indexOf('chandrapur') !== -1 && m.indexOf('chandrapur') === -1) return false;
          return m.indexOf(m1Str) !== -1 || m1Str.indexOf(m) !== -1;
        });

        var r2 = records.find(function (r) {
          var m = (r.market || '').toLowerCase();
          if (m2Str.indexOf('chandigarh') !== -1 && m.indexOf('chandigarh') === -1) return false;
          if (m2Str.indexOf('chandwad') !== -1 && m.indexOf('chandwad') === -1) return false;
          if (m2Str.indexOf('chandrapur') !== -1 && m.indexOf('chandrapur') === -1) return false;
          return m.indexOf(m2Str) !== -1 || m2Str.indexOf(m) !== -1;
        });

        var renderMandiSnippet = function(mName, rec) {
          if (rec && rec.modalPrice > 0) {
            return '<div class="ks-compact-price-card">'
              + '<div class="ks-compact-price-card__header"><div class="ks-compact-price-card__mandi">' + (rec.market || mName) + '</div><div class="ks-compact-price-card__crop">' + cName + '</div></div>'
              + '<div class="ks-compact-price-card__price">₹' + n(rec.modalPrice) + '<span style="font-size:12px;font-weight:normal;color:#6F7F75;">/qtl</span></div>'
              + '<div class="ks-compact-price-card__range">Min ₹' + n(rec.minPrice) + ' · Max ₹' + n(rec.maxPrice) + '</div>'
              + '<div class="ks-compact-price-card__footer"><span>📅 Reported: ' + (rec.reportDate || rec.arrivalDate || 'Recent') + '</span><span>🏛️ Official</span></div>'
              + '</div>';
          }
          return '<div class="ks-compact-price-card ks-compact-price-card--unavailable">'
            + '<div class="ks-compact-price-card__header"><div class="ks-compact-price-card__mandi">' + mName + '</div><div class="ks-compact-price-card__crop">' + cName + '</div></div>'
            + '<div class="ks-compact-price-card__price" style="font-size:15px;color:#92400E;">Price currently unavailable</div>'
            + '<div class="ks-compact-price-card__range" style="color:#78350F;font-size:11.5px;">No recent government report</div>'
            + '</div>';
        };

        var title = lang === 'mr' ? '⚖️ ' + cName + ' बाजारभाव तुलना:' : (lang === 'hi' ? '⚖️ ' + cName + ' मंडी भाव तुलना:' : '⚖️ Mandi Price Comparison for ' + cName + ':');
        var cardsHtml = renderMandiSnippet(mandi1Name, r1) + renderMandiSnippet(mandi2Name, r2);

        return {
          html: '<p style="font-weight:700;margin-bottom:8px;color:#12372A;">' + title + '</p>' + cardsHtml,
          suggestionContext: 'after_price'
        };
      });
    },

    priceTrend: function (cropId, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var crop = KrishiSahayakData.getCrop(cropId || 'onion');
      var trend = KrishiSahayakData.getTrend(crop.id);
      var n = R._n;
      var cName = R.getCropDisplayName(crop.id, lang);
      var isUp = trend.dir === 'up';
      var tagClass = isUp ? 'ks-trend-tag--up' : 'ks-trend-tag--down';
      var tagIcon = isUp ? '📈' : '📉';

      var tagLabel = {
        mr: isUp ? 'वाढीचा कल (+ ' + trend.change + '%)' : 'घसरणीचा कल (- ' + trend.change + '%)',
        hi: isUp ? 'तेजी का रुख (+ ' + trend.change + '%)' : 'मंदी का रुख (- ' + trend.change + '%)',
        en: isUp ? 'Upward Trend (+ ' + trend.change + '%)' : 'Downward Trend (- ' + trend.change + '%)'
      }[lang];

      var advice = {
        mr: isUp
          ? '💡 <strong>सल्ला:</strong> पुढील ३-५ दिवसांत भावात <strong>₹' + n(trend.forecast3d) + ' - ₹' + n(trend.forecast7d) + '</strong> पर्यंत वाढ अपेक्षित आहे. सुरक्षित साठवणूक असल्यास काही दिवस थांबणे फायदेशीर ठरेल.'
          : '💡 <strong>सल्ला:</strong> भावात पुढील आठवड्यात घसरण अपेक्षित आहे. सध्याच्या दरात (₹' + n(trend.current) + '/क्विंटल) माल विकणे किंवा इतर बाजारात तपासणे योग्य ठरेल.',
        hi: isUp
          ? '💡 <strong>सलाह:</strong> अगले ३-५ दिनों में भाव <strong>₹' + n(trend.forecast3d) + ' - ₹' + n(trend.forecast7d) + '</strong> तक बढ़ने का अनुमान है। सुरक्षित भंडारण होने पर कुछ दिन रुकना लाभदायक रहेगा।'
          : '💡 <strong>सलाह:</strong> भाव में अगले सप्ताह गिरावट की संभावना है। वर्तमान दर (₹' + n(trend.current) + '/क्विंटल) पर बेचना या नजदीकी मंडियों की तुलना करना उचित रहेगा।',
        en: isUp
          ? '💡 <strong>Recommendation:</strong> Prices are projected to increase to <strong>₹' + n(trend.forecast3d) + ' - ₹' + n(trend.forecast7d) + '/q</strong> over the next 3–7 days. Holding stock is advantageous if good storage is available.'
          : '💡 <strong>Recommendation:</strong> Prices are likely to soften in the coming week. Selling at current rates (₹' + n(trend.current) + '/q) or exploring alternative buyers is advised.'
      }[lang];

      var lblCurrent = { mr: 'आजचा भाव', hi: 'आज का भाव', en: 'Today\'s Rate' }[lang];
      var lbl3d = { mr: '३ दिवसांनंतर', hi: '३ दिन बाद', en: '3-Day Forecast' }[lang];
      var lbl7d = { mr: '७ दिवसांनंतर', hi: '७ दिन बाद', en: '7-Day Forecast' }[lang];

      return {
        html: '<div class="ks-msg-heading">' + tagIcon + ' ' + (lang === 'mr' ? cName + ' भावाचा कल व अंदाज' : (lang === 'hi' ? cName + ' मूल्य रुझान व पूर्वानुमान' : cName + ' Price Trend & Forecast')) + '</div>' +
          '<div class="ks-trend-card">' +
            '<div class="ks-trend-card__header">' +
              '<span class="ks-trend-card__title">📍 ' + trend.market + '</span>' +
              '<span class="ks-trend-tag ' + tagClass + '">' + tagLabel + '</span>' +
            '</div>' +
            '<div class="ks-trend-card__price-row">' +
              '<div class="ks-trend-price-item">' +
                '<div class="ks-trend-price-item__label">' + lblCurrent + '</div>' +
                '<div class="ks-trend-price-item__val">₹' + n(trend.current) + '</div>' +
              '</div>' +
              '<div class="ks-trend-price-item">' +
                '<div class="ks-trend-price-item__label">' + lbl3d + '</div>' +
                '<div class="ks-trend-price-item__val" style="color:' + (isUp ? '#2D6A4F' : '#DC2626') + ';">₹' + n(trend.forecast3d) + '</div>' +
              '</div>' +
              '<div class="ks-trend-price-item">' +
                '<div class="ks-trend-price-item__label">' + lbl7d + '</div>' +
                '<div class="ks-trend-price-item__val" style="color:' + (isUp ? '#2D6A4F' : '#DC2626') + ';">₹' + n(trend.forecast7d) + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<p style="margin-top:8px;font-size:12.5px;color:#17221D;">' + advice + '</p>' +
          '<div class="ks-msg-actions">' +
            '<a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">⚖️ ' + (lang === 'mr' ? 'मंड्यांची तुलना' : (lang === 'hi' ? 'मंडियों की तुलना' : 'Compare Mandis')) + '</a>' +
            '<a href="storage.html" class="ks-msg-action-btn">🏬 ' + (lang === 'mr' ? 'साठवणूक पर्याय' : (lang === 'hi' ? 'भंडारण विकल्प' : 'Storage Options')) + '</a>' +
          '</div>' +
          R.getClosingQuestion(lang)
      };
    },

    // Net Return Calculation (Phase 9 & 11 fix)
    netReturn: function (cropId, quantityQ, distKm, grade, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var crop = KrishiSahayakData.getCrop(cropId || 'onion');
      var q = Math.max(1, quantityQ || 10);
      var d = Math.max(10, distKm || 42);
      var n = R._n;
      var cName = R.getCropDisplayName(crop.id, lang);
      var pricePerQ = crop.price;
      var grossValue = pricePerQ * q;
      var trucks = Math.ceil(q / 50);
      var transportTotal = Math.round(trucks * d * 28);
      var netTotal = Math.max(0, grossValue - transportTotal);
      var netPerQ = Math.round(netTotal / q);

      var titles = {
        mr: '💰 <strong>' + cName + ' (' + q + ' क्विंटल)</strong> चा अंदाजे निव्वळ नफा:',
        hi: '💰 <strong>' + cName + ' (' + q + ' क्विंटल)</strong> का अनुमानित शुद्ध लाभ:',
        en: '💰 Estimated Net Return for <strong>' + cName + ' (' + q + ' quintals)</strong>:'
      }[lang];

      var rowGross = { mr: 'एकूण अपेक्षित विक्री मूल्य (' + q + 'q × ₹' + n(pricePerQ) + ')', hi: 'कुल अपेक्षित मूल्य (' + q + 'q × ₹' + n(pricePerQ) + ')', en: 'Gross Value (' + q + 'q × ₹' + n(pricePerQ) + ')' }[lang];
      var rowTransport = { mr: 'अंदाजे वाहतूक खर्च (' + d + ' किमी)', hi: 'अनुमानित परिवहन खर्च (' + d + ' किमी)', en: 'Estimated Transport (' + d + ' km)' }[lang];
      var rowNetTotal = { mr: 'निव्वळ नफा (हातचा परतावा)', hi: 'शुद्ध मुनाफा (शुद्ध आय)', en: 'Estimated Net Return' }[lang];
      var rowNetPerQ = { mr: 'निव्वळ प्रति क्विंटल भाव', hi: 'शुद्ध प्रति क्विंटल दर', en: 'Net Price Per Quintal' }[lang];

      return {
        html: '<p style="margin-bottom:8px;">' + titles + '</p>' +
          '<div class="ks-net-card">' +
            '<div class="ks-net-card__title">💼 Net Return Calculation</div>' +
            '<div class="ks-net-card__rows">' +
              '<div class="ks-net-card__row">' +
                '<span class="ks-net-card__row-label">' + rowGross + '</span>' +
                '<span class="ks-net-card__row-val">₹' + n(grossValue) + '</span>' +
              '</div>' +
              '<div class="ks-net-card__row">' +
                '<span class="ks-net-card__row-label">' + rowTransport + '</span>' +
                '<span class="ks-net-card__row-val" style="color:#FCA5A5;">- ₹' + n(transportTotal) + '</span>' +
              '</div>' +
              '<hr class="ks-net-card__divider">' +
              '<div class="ks-net-card__total-row">' +
                '<span class="ks-net-card__total-label">' + rowNetTotal + '</span>' +
                '<span class="ks-net-card__total-val">₹' + n(netTotal) + '</span>' +
              '</div>' +
              '<div class="ks-net-card__row" style="margin-top:4px;">' +
                '<span class="ks-net-card__row-label">' + rowNetPerQ + '</span>' +
                '<span class="ks-net-card__row-val" style="color:#8FCB9B;">₹' + n(netPerQ) + '/q</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="ks-msg-actions">' +
            '<a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">⚖️ ' + (lang === 'mr' ? 'मंड्यांची तुलना' : (lang === 'hi' ? 'मंडियों की तुलना' : 'Compare Mandis')) + '</a>' +
            '<button class="ks-quick-btn" data-query="' + (lang === 'mr' ? 'खरेदीदार शोधा' : (lang === 'hi' ? 'खरीदार खोजें' : 'Find buyers')) + '">🤝 ' + (lang === 'mr' ? 'खरेदीदार शोधा' : (lang === 'hi' ? 'खरीदार खोजें' : 'Find Buyers')) + '</button>' +
          '</div>' +
          R.getClosingQuestion(lang)
      };
    },

    // Find Verified Buyers
    findBuyers: function (cropId, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var buyers = KrishiSahayakData.getBuyersForCrop(cropId || 'onion');
      var cName = R.getCropDisplayName(cropId || 'onion', lang);
      if (!buyers.length) {
        var notFound = {
          mr: 'सध्या <strong>' + cName + '</strong> साठी थेट खरेदीदार उपलब्ध नाहीत.',
          hi: 'वर्तमान में <strong>' + cName + '</strong> के लिए सत्यापित खरीदार उपलब्ध नहीं हैं।',
          en: 'No verified buyers currently listed for <strong>' + cName + '</strong>.'
        }[lang];
        return {
          html: '<p>' + notFound + '</p><div class="ks-msg-actions"><a href="buyers.html" class="ks-msg-action-btn ks-msg-action-btn--primary">🤝 View All Buyers</a></div>' + R.getClosingQuestion(lang)
        };
      }

      var cards = buyers.slice(0, 3).map(function (b) {
        var vLabel = lang === 'mr' ? '✓ पडताळणी झालेले' : (lang === 'hi' ? '✓ सत्यापित' : '✓ Verified');
        return '<div class="ks-buyer-card">' +
          '<div class="ks-buyer-card__top"><div class="ks-buyer-card__avatar">🏢</div>' +
          '<div><div class="ks-buyer-card__name">' + b.name + ' <span style="color:#2D6A4F;font-size:11px;">' + vLabel + '</span></div>' +
          '<div class="ks-buyer-card__verified">' + b.rating + ' · ' + b.deals + '</div></div></div>' +
          '<div class="ks-buyer-card__meta">' +
          '<span class="ks-buyer-card__meta-item">📍 ' + b.distance + '</span>' +
          '<span class="ks-buyer-card__meta-item">📦 Min: ' + b.minQty + '</span>' +
          '<span class="ks-buyer-card__meta-item">💳 ' + b.paymentDays + '</span></div>' +
          '<div class="ks-buyer-card__price">' + b.offerPrice + '</div></div>';
      }).join('');

      var title = {
        mr: '🤝 <strong>' + cName + '</strong> साठी <strong>' + buyers.length + ' पडताळणी केलेले खरेदीदार</strong> उपलब्ध आहेत:',
        hi: '🤝 <strong>' + cName + '</strong> के लिए <strong>' + buyers.length + ' सत्यापित खरीदार</strong> उपलब्ध हैं:',
        en: '🤝 Found <strong>' + buyers.length + ' verified buyers</strong> for <strong>' + cName + '</strong>:'
      }[lang];

      return {
        html: '<p style="margin-bottom:8px;">' + title + '</p>' +
          cards +
          '<div class="ks-msg-actions">' +
            '<a href="buyers.html" class="ks-msg-action-btn ks-msg-action-btn--primary">🤝 ' + (lang === 'mr' ? 'सर्व खरेदीदार पहा' : (lang === 'hi' ? 'सभी खरीदार देखें' : 'View All Buyers')) + '</a>' +
          '</div>' +
          R.getClosingQuestion(lang)
      };
    },

    // Best Buyer Recommendation
    whichBuyerBetter: function (cropId, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var buyers = KrishiSahayakData.getBuyersForCrop(cropId || 'onion');
      var bestBuyer = (buyers && buyers.length) ? buyers[0] : KS_DATA.buyers[1];
      var cName = R.getCropDisplayName(cropId || 'onion', lang);

      var title = {
        mr: '🤝 <strong>' + cName + '</strong> साठी उपलब्ध खरेदीदारांपैकी <strong>' + bestBuyer.name + '</strong> हा सर्वोत्तम पर्याय आहे:',
        hi: '🤝 <strong>' + cName + '</strong> के लिए उपलब्ध खरीदारों में <strong>' + bestBuyer.name + '</strong> सबसे अच्छा विकल्प है:',
        en: '🤝 Among verified buyers for <strong>' + cName + '</strong>, <strong>' + bestBuyer.name + '</strong> is currently the top recommendation:'
      }[lang];

      return {
        html: '<p style="margin-bottom:8px;">' + title + '</p>' +
          '<div class="ks-buyer-card">' +
            '<div class="ks-buyer-card__top"><div class="ks-buyer-card__avatar">🏢</div>' +
            '<div><div class="ks-buyer-card__name">' + bestBuyer.name + ' <span style="color:#2D6A4F;font-size:11px;">✓ Best Rate</span></div>' +
            '<div class="ks-buyer-card__verified">' + bestBuyer.rating + ' · ' + bestBuyer.deals + '</div></div></div>' +
            '<div class="ks-buyer-card__meta">' +
            '<span class="ks-buyer-card__meta-item">📍 ' + bestBuyer.distance + '</span>' +
            '<span class="ks-buyer-card__meta-item">📦 Min: ' + bestBuyer.minQty + '</span>' +
            '<span class="ks-buyer-card__meta-item">💳 ' + bestBuyer.paymentDays + '</span></div>' +
            '<div class="ks-buyer-card__price">' + bestBuyer.offerPrice + '</div>' +
          '</div>' +
          '<div class="ks-msg-actions"><a href="buyers.html" class="ks-msg-action-btn ks-msg-action-btn--primary">🤝 Contact Buyer</a></div>' +
          R.getClosingQuestion(lang)
      };
    },

    // Transport Estimate
    transport: function (distKm, quantityQ, mandiName, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var d = distKm || 45;
      var q = quantityQ || 10;
      var est = KrishiSahayakData.getTransportEstimate(d, q);
      var n = R._n;
      var destTitle = mandiName ? mandiName : (d + ' km');

      var header = {
        mr: '🚚 <strong>' + destTitle + '</strong> साठी अंदाजे वाहतूक खर्च तपशील (' + q + ' क्विंटल):',
        hi: '🚚 <strong>' + destTitle + '</strong> के लिए अनुमानित परिवहन खर्च (' + q + ' क्विंटल):',
        en: '🚚 Estimated transport cost breakdown for <strong>' + destTitle + '</strong> (' + q + ' quintals):'
      }[lang];

      var tTrucks = lang === 'mr' ? 'आवश्यक ट्रक' : (lang === 'hi' ? 'आवश्यक ट्रक' : 'Trucks Required');
      var tRate = lang === 'mr' ? 'अंदाजे दर' : (lang === 'hi' ? 'अनुमानित दर' : 'Est. Rate');
      var tTotal = lang === 'mr' ? 'एकूण वाहतूक खर्च' : (lang === 'hi' ? 'कुल भाड़ा' : 'Total Freight');
      var tPerQ = lang === 'mr' ? 'प्रति क्विंटल खर्च' : (lang === 'hi' ? 'प्रति क्विंटल' : 'Per Quintal');

      return {
        html: '<p style="margin-bottom:8px;">' + header + '</p>' +
          '<div class="ks-transport-card">' +
            '<div class="ks-transport-card__header"><span class="ks-transport-card__icon">🚛</span><span class="ks-transport-card__title">' + destTitle + ' (' + est.distKm + ' km, ' + q + 'q)</span></div>' +
            '<div class="ks-transport-card__rows">' +
              '<div class="ks-transport-card__row"><span class="ks-transport-card__row-label">' + tTrucks + '</span><span class="ks-transport-card__row-val">' + est.trucks + ' truck</span></div>' +
              '<div class="ks-transport-card__row"><span class="ks-transport-card__row-label">' + tRate + '</span><span class="ks-transport-card__row-val">₹28/km/truck</span></div>' +
              '<div class="ks-transport-card__row"><span class="ks-transport-card__row-label">' + tTotal + '</span><span class="ks-transport-card__row-val" style="color:#12372A;">₹' + n(est.total) + '</span></div>' +
              '<div class="ks-transport-card__row"><span class="ks-transport-card__row-label">' + tPerQ + '</span><span class="ks-transport-card__row-val">₹' + n(est.ratePerQ) + '/q</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="ks-msg-actions"><a href="dashboard.html" class="ks-msg-action-btn ks-msg-action-btn--primary">🚚 Book Vehicle</a></div>' +
          R.getClosingQuestion(lang)
      };
    },

    // Why Recommended
    whyRecommended: function (mandiName, cropId, quantityQ, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var rankings = KrishiSahayakData.getMandiRankings(cropId, quantityQ);
      var mandi = rankings.find(function (r) {
        return r.name.toLowerCase().indexOf(mandiName.toLowerCase().split(' ')[0]) !== -1;
      }) || rankings[0];

      var cName = R.getCropDisplayName(cropId, lang);
      var n = R._n;

      return {
        html: '<p style="margin-bottom:8px;">तुमच्या <strong>' + cName + '</strong> साठी <strong>' + mandi.name + '</strong> का सर्वोत्तम आहे:</p>' +
          '<div class="ks-market-card ks-market-card--gold" style="padding:10px 12px;margin:8px 0;">' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">💰 भाव</span><span class="ks-market-card__row-val">₹' + n(mandi.pricePerQ) + '/q</span></div>' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">📍 अंतर</span><span class="ks-market-card__row-val">' + mandi.distKm + ' km</span></div>' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">🚚 वाहतूक खर्च</span><span class="ks-market-card__row-val">₹' + n(mandi.transportTotal) + '</span></div>' +
            '<div class="ks-market-card__net"><span class="ks-market-card__net-label">निव्वळ नफा</span><span class="ks-market-card__net-val">₹' + n(mandi.netReturn) + '</span></div>' +
          '</div>' +
          '<div class="ks-msg-actions"><a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">📊 सविस्तर तुलना</a></div>' +
          R.getClosingQuestion(lang)
      };
    },

    lotAcknowledged: function (cropId, quantityQ, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var cName = R.getCropDisplayName(cropId, lang);
      var text = {
        mr: 'मी नोंद घेतली आहे: <strong>' + cName + ' (' + quantityQ + ' क्विंटल)</strong>. 🌾<br>या पिकाबद्दल तुम्हाला काय जाणून घ्यायचे आहे?',
        hi: 'मैंने नोट कर लिया है: <strong>' + cName + ' (' + quantityQ + ' क्विंटल)</strong>। 🌾<br>इस फसल के बारे में आप क्या जानना चाहते हैं?',
        en: 'Noted: <strong>' + cName + ' (' + quantityQ + ' quintals)</strong>. 🌾<br>What would you like to know about this lot?'
      }[lang];

      return {
        html: '<p style="margin-bottom:8px;">' + text + '</p>' +
          '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="' + cName + ' भाव">📊 ' + cName + ' भाव</button>' +
            '<button class="ks-quick-btn" data-query="कुठे विकावे?">📍 कुठे विकावे?</button>' +
            '<button class="ks-quick-btn" data-query="खरेदीदार शोधा">🤝 खरेदीदार शोधा</button>' +
          '</div>',
        isClarification: true
      };
    },

    greeting: function (lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      return R.welcome(lang);
    },

    unknown: function (lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var text = {
        mr: 'मला तुमचा प्रश्न समजला नाही. तुम्ही बाजारभाव, कुठे विकावे, खरेदीदार किंवा निव्वळ नफ्याबद्दल विचारू शकता.',
        hi: 'मुझे आपका सवाल समझ नहीं आया। आप मंडी भाव, कहाँ बेचें, खरीदार या शुद्ध मुनाफे के बारे में पूछ सकते हैं।',
        en: 'I didn\'t quite catch that. You can ask about market prices, where to sell, buyers, transport, or net return.'
      }[lang];

      return {
        html: '<p style="margin-bottom:8px;">' + text + '</p>' +
          '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="' + (lang === 'mr' ? 'बाजारभाव पाहा' : (lang === 'hi' ? 'मंडी का भाव' : 'Check market price')) + '">📊 ' + (lang === 'mr' ? 'बाजारभाव' : (lang === 'hi' ? 'मंडी भाव' : 'Market Price')) + '</button>' +
            '<button class="ks-quick-btn" data-query="' + (lang === 'mr' ? 'कुठे विकावे?' : (lang === 'hi' ? 'कहाँ बेचूं?' : 'Where should I sell?')) + '">📍 ' + (lang === 'mr' ? 'कुठे विकावे?' : (lang === 'hi' ? 'कहाँ बेचें?' : 'Where to sell?')) + '</button>' +
            '<button class="ks-quick-btn" data-query="' + (lang === 'mr' ? 'खरेदीदार शोधा' : (lang === 'hi' ? 'खरीदार खोजें' : 'Find buyers')) + '">🤝 ' + (lang === 'mr' ? 'खरेदीदार' : (lang === 'hi' ? 'खरीदार' : 'Buyers')) + '</button>' +
          '</div>',
        isClarification: true
      };
    },

    networkError: function (lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var msg = {
        mr: 'मंडी माहिती सध्या लोड होत नाही आहे. पुन्हा प्रयत्न करायचा आहे का?',
        hi: 'मंडी की जानकारी अभी नहीं मिल पा रही है। एक बार फिर कोशिश करें?',
        en: 'Market information is temporarily unavailable. Would you like to try again?'
      }[lang];

      var retryBtn = { mr: 'पुन्हा प्रयत्न करा', hi: 'पुनः प्रयास करें', en: 'Try again' }[lang];
      var otherBtn = { mr: 'दुसरे काही विचारा', hi: 'कुछ और पूछें', en: 'Ask something else' }[lang];

      return {
        html: '<p style="margin-bottom:8px;">' + msg + '</p>' +
          '<div class="ks-msg-actions">' +
            '<button class="ks-quick-btn ks-btn-yes" data-action="retry">' + retryBtn + '</button>' +
            '<button class="ks-quick-btn ks-btn-no" data-action="other">' + otherBtn + '</button>' +
          '</div>',
        isClarification: true
      };
    },

    generic: function (lang) {
      return this.unknown(lang);
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // 7. VOICE INTERACTION CONTROLLER (Phase 5)
  // ══════════════════════════════════════════════════════════════════
  var KrishiSahayakVoice = {
    recognition: null,
    isListening: false,
    currentUtterance: null,
    activeSpeakingBtn: null,

    LANG_KEY: 'krishi_sahayak_voice_language',
    REPLY_KEY: 'krishi_sahayak_voice_reply',

    init: function () {
      this.initRecognition();
      this.bindVoices();
    },

    getLanguage: function () {
      return LanguageDetector.currentLanguage || 'en';
    },

    setLanguage: function (lang) {
      if (lang === 'en' || lang === 'hi' || lang === 'mr') {
        LanguageDetector.currentLanguage = lang;
        KrishiSahayakMemory.update({ language: lang });
        try { localStorage.setItem(this.LANG_KEY, lang); } catch (e) {}
        if (this.recognition) {
          this.recognition.lang = this.getRecognitionLocale(lang);
        }
      }
    },

    getRecognitionLocale: function (lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      if (lang === 'mr') return 'mr-IN';
      if (lang === 'hi') return 'hi-IN';
      return 'en-IN';
    },

    getSpeechLocale: function (lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      if (lang === 'mr') return 'mr-IN';
      if (lang === 'hi') return 'hi-IN';
      return 'en-IN';
    },

    isVoiceReplyEnabled: function () {
      try {
        var val = localStorage.getItem(this.REPLY_KEY);
        if (val === null) return true;
        return val === 'true';
      } catch (e) {
        return true;
      }
    },

    setVoiceReplyEnabled: function (enabled) {
      try {
        localStorage.setItem(this.REPLY_KEY, enabled ? 'true' : 'false');
      } catch (e) {}
    },

    isRecognitionSupported: function () {
      return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    },

    isSynthesisSupported: function () {
      return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined';
    },

    initRecognition: function () {
      if (!this.isRecognitionSupported()) return;
      var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      try {
        var rec = new SpeechRec();
        rec.continuous = false;
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.lang = this.getRecognitionLocale();

        var self = this;
        rec.onstart = function () {
          self.isListening = true;
          KrishiSahayakUI.setVoiceState('LISTENING');
        };

        rec.onresult = function (event) {
          self.isListening = false;
          if (event.results && event.results.length > 0 && event.results[0][0]) {
            var transcript = event.results[0][0].transcript;
            if (transcript && transcript.trim()) {
              self.handleTranscript(transcript.trim());
            } else {
              KrishiSahayakUI.setVoiceState('READY');
            }
          } else {
            KrishiSahayakUI.setVoiceState('READY');
          }
        };

        rec.onerror = function (event) {
          self.isListening = false;
          self.handleError(event.error);
        };

        rec.onend = function () {
          self.isListening = false;
          if (KrishiSahayakUI.voiceState === 'LISTENING') {
            KrishiSahayakUI.setVoiceState('READY');
          }
        };

        this.recognition = rec;
      } catch (e) {}
    },

    bindVoices: function () {
      if (!this.isSynthesisSupported()) return;
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = function () {};
      }
    },

    toggleListening: function () {
      if (!this.isRecognitionSupported()) {
        var lang = LanguageDetector.currentLanguage || 'en';
        var notice = {
          mr: 'तुमच्या ब्राउझरमध्ये आवाज ओळख समर्थित नाही. तुम्ही टाईप करून प्रश्न विचारू शकता.',
          hi: 'आपके ब्राउज़र में आवाज़ इनपुट समर्थित नहीं है। आप लिखकर सवाल पूछ सकते हैं।',
          en: 'Voice input is not supported in this browser. You can type your question instead.'
        }[lang];
        KrishiSahayakUI.showTemporaryNotice(notice);
        return;
      }

      if (this.currentUtterance || (window.speechSynthesis && window.speechSynthesis.speaking)) {
        this.stopSpeaking();
        this.startListening();
        return;
      }

      if (this.isListening) {
        this.stopListening();
        KrishiSahayakUI.setVoiceState('READY');
      } else {
        this.startListening();
      }
    },

    startListening: function () {
      if (!this.recognition) {
        this.initRecognition();
      }
      if (!this.recognition) {
        var lang = LanguageDetector.currentLanguage || 'en';
        var notice = {
          mr: 'तुम्ही टाईप करून प्रश्न विचारू शकता.',
          hi: 'आप लिखकर सवाल पूछ सकते हैं।',
          en: 'You can type your question instead.'
        }[lang];
        KrishiSahayakUI.showTemporaryNotice(notice);
        return;
      }

      this.stopSpeaking();

      try {
        this.recognition.lang = this.getRecognitionLocale();
        this.recognition.start();
      } catch (err) {
        try {
          this.recognition.abort();
          var self = this;
          setTimeout(function () {
            try {
              self.recognition.lang = self.getRecognitionLocale();
              self.recognition.start();
            } catch (e) {
              KrishiSahayakUI.setVoiceState('READY');
            }
          }, 150);
        } catch (e) {
          KrishiSahayakUI.setVoiceState('READY');
        }
      }
    },

    stopListening: function () {
      if (this.recognition && this.isListening) {
        try { this.recognition.stop(); } catch (e) {}
      }
      this.isListening = false;
    },

    handleTranscript: function (transcript) {
      KrishiSahayakUI.setVoiceState('PROCESSING');
      var detectedLang = LanguageDetector.detect(transcript);

      // Keep user's chosen UI language if transcript is pure roman/numbers
      var effectiveLang = LanguageDetector.currentLanguage || detectedLang;
      if (/[\u0900-\u097F]/.test(transcript)) {
        effectiveLang = detectedLang;
      }

      var langSelect = document.getElementById('ks-voice-lang-select');
      if (langSelect && langSelect.value !== effectiveLang) {
        langSelect.value = effectiveLang;
        LanguageDetector.currentLanguage = effectiveLang;
      }

      var input = document.getElementById('ks-chat-input');
      if (input) input.value = transcript;

      // Single pipeline for both typed & voice commands
      KrishiSahayakUI.sendUserMessage(transcript, true, effectiveLang);
    },

    handleError: function (errorType) {
      var lang = LanguageDetector.currentLanguage || 'en';
      var msg = '';
      switch (errorType) {
        case 'not-allowed':
        case 'permission-denied':
          msg = {
            mr: 'मायक्रोफोन परवानगी नाकारली. तुम्ही टाईप करून प्रश्न विचारू शकता.',
            hi: 'माइक्रोफ़ोन की अनुमति अस्वीकृत। आप लिखकर सवाल पूछ सकते हैं।',
            en: 'Microphone permission denied. You can type your question instead.'
          }[lang];
          break;
        case 'no-speech':
          msg = {
            mr: 'काहीही ऐकू आले नाही. कृपया पुन्हा बोला.',
            hi: 'कोई आवाज़ सुनाई नहीं दी। कृपया पुनः बोलें।',
            en: 'No speech was detected. Please tap the microphone and speak again.'
          }[lang];
          break;
        case 'network':
          msg = {
            mr: 'व्हॉइस नेटवर्क समस्या. तुम्ही टाईप करू शकता.',
            hi: 'नेटवर्क समस्या। आप लिखकर पूछ सकते हैं।',
            en: 'Voice network error. You can type your question instead.'
          }[lang];
          break;
        case 'aborted':
          KrishiSahayakUI.setVoiceState('READY');
          return;
        default:
          msg = {
            mr: 'कृपया पुन्हा बोला किंवा टाइप करा.',
            hi: 'कृपया दोबारा बोलें या टाइप करें।',
            en: 'Please speak again or type your question.'
          }[lang];
      }
      KrishiSahayakUI.showTemporaryNotice(msg);
      KrishiSahayakUI.setVoiceState('READY');
    },

    sanitizeForSpeech: function (html, lang) {
      if (!html) return '';
      var temp = document.createElement('div');
      temp.innerHTML = html;

      var unwanted = temp.querySelectorAll('button, a, .ks-msg-actions, .ks-quick-actions, svg, script, style, .ks-msg-note, .ks-contextual-btn-wrap, .ks-closing-box');
      for (var i = 0; i < unwanted.length; i++) {
        unwanted[i].remove();
      }

      var text = temp.innerText || temp.textContent || '';

      if (lang === 'mr') {
        text = text.replace(/₹\s*([0-9,]+)\s*\/\s*(क्विंटल|q)/gi, '$1 रुपये प्रति क्विंटल');
        text = text.replace(/₹\s*([0-9,]+)/gi, '$1 रुपये');
        text = text.replace(/([0-9]+)\s*(किमी|km)\b/gi, '$1 किलोमीटर');
        text = text.replace(/([0-9]+)\s*(क्विंटल|q)\b/gi, '$1 क्विंटल');
        text = text.replace(/([0-9]+)\s*(किलो|kg)\b/gi, '$1 किलो');
        text = text.replace(/([0-9.]+)%/g, '$1 टक्के');
      } else if (lang === 'hi') {
        text = text.replace(/₹\s*([0-9,]+)\s*\/\s*(क्विंटल|q)/gi, '$1 रुपये प्रति क्विंटल');
        text = text.replace(/₹\s*([0-9,]+)/gi, '$1 रुपये');
        text = text.replace(/([0-9]+)\s*(किमी|km)\b/gi, '$1 किलोमीटर');
        text = text.replace(/([0-9]+)\s*(क्विंटल|q)\b/gi, '$1 क्विंटल');
        text = text.replace(/([0-9]+)\s*(किलो|kg)\b/gi, '$1 किलो');
        text = text.replace(/([0-9.]+)%/g, '$1 प्रतिशत');
      } else {
        text = text.replace(/₹\s*([0-9,]+)\s*\/\s*q/gi, '$1 rupees per quintal');
        text = text.replace(/₹\s*([0-9,]+)/gi, '$1 rupees');
        text = text.replace(/([0-9]+)\s*q\b/gi, '$1 quintals');
        text = text.replace(/([0-9]+)\s*km\b/gi, '$1 kilometers');
        text = text.replace(/([0-9.]+)%/g, '$1 percent');
      }

      text = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]/g, '');
      text = text.replace(/[🌾📍💰🚚📈🔥📊📉🥇🥈🥉⭐💡⚠️🤝👋🎙️🔊🔇✓✕★·−↑↓|⚖️🏢🚛]/g, ' ');

      return text.replace(/\s+/g, ' ').trim();
    },

    speak: function (htmlOrText, lang, btnElement) {
      if (!this.isSynthesisSupported()) return;

      this.stopSpeaking();
      KrishiSahayakUI.setVoiceState('SPEAKING');

      var textLang = lang || LanguageDetector.currentLanguage || 'en';
      var plainText = htmlOrText.indexOf('<') !== -1 ? this.sanitizeForSpeech(htmlOrText, textLang) : htmlOrText;
      if (!plainText) {
        KrishiSahayakUI.setVoiceState('READY');
        return;
      }

      try {
        var utterance = new SpeechSynthesisUtterance(plainText);
        var targetLocale = this.getSpeechLocale(textLang);
        utterance.lang = targetLocale;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        var voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        if (voices && voices.length) {
          var match = null;
          if (textLang === 'mr') {
            match = voices.find(function (v) { return v.lang && (v.lang === 'mr-IN' || v.lang.indexOf('mr') === 0); }) ||
                    voices.find(function (v) { return v.lang && (v.lang === 'hi-IN' || v.lang.indexOf('hi') === 0); });
          } else if (textLang === 'hi') {
            match = voices.find(function (v) { return v.lang && (v.lang === 'hi-IN' || v.lang.indexOf('hi') === 0); });
          } else {
            match = voices.find(function (v) { return v.lang && (v.lang.indexOf('en-IN') !== -1 || v.lang.indexOf('en-GB') !== -1); });
          }
          if (match) utterance.voice = match;
        }

        var self = this;
        if (btnElement) {
          self.activeSpeakingBtn = btnElement;
          btnElement.classList.add('ks-msg__speak-btn--speaking');
        }

        var onDone = function () {
          self.stopSpeaking();
          KrishiSahayakUI.setVoiceState('READY');
        };

        utterance.onend = onDone;
        utterance.onerror = onDone;

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        this.stopSpeaking();
        KrishiSahayakUI.setVoiceState('READY');
      }
    },

    stopSpeaking: function () {
      if (this.isSynthesisSupported()) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      if (this.activeSpeakingBtn) {
        this.activeSpeakingBtn.classList.remove('ks-msg__speak-btn--speaking');
        this.activeSpeakingBtn.blur();
        this.activeSpeakingBtn = null;
      }
      this.currentUtterance = null;
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // 8. CHAT PANEL UI CONTROLLER (Phases 1, 4, 5, 8, 10)
  // ══════════════════════════════════════════════════════════════════
  var KrishiSahayakUI = {
    isOpen: false,
    _pendingContextMsg: null,
    voiceState: 'IDLE',
    conversationStarted: false,
    currentSuggestionContext: 'initial',

    init: function () {
      this._injectHTML();
      this._bindEvents();
      this._updateContextBar();
      this._updateInputPlaceholder(LanguageDetector.currentLanguage);
      this.setVoiceState('IDLE');
      var self = this;
      setTimeout(function () {
        self._showWelcome(LanguageDetector.currentLanguage);
        self.renderSuggestionChips(LanguageDetector.currentLanguage, 'initial');
      }, 350);
    },

    renderSuggestionChips: function (lang, contextType) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      contextType = contextType || this.currentSuggestionContext || 'initial';
      this.currentSuggestionContext = contextType;
      var wrap = document.getElementById('krishiSuggestionChips');
      if (!wrap) return;
      var list = (SUGGESTIONS_CONFIG[contextType] && SUGGESTIONS_CONFIG[contextType][lang]) ||
                 (SUGGESTIONS_CONFIG.initial && SUGGESTIONS_CONFIG.initial[lang]) || [];
      wrap.innerHTML = list.map(function (item) {
        return '<button class="ks-quick-btn" data-query="' + item.text + '"><span class="ks-quick-btn__icon">' + item.icon + '</span> ' + item.text + '</button>';
      }).join('');
    },

    onLanguageChange: function (newLang) {
      if (newLang !== 'en' && newLang !== 'hi' && newLang !== 'mr') return;
      LanguageDetector.currentLanguage = newLang;
      KrishiSahayakMemory.update({ language: newLang });
      if (KrishiSahayakVoice && typeof KrishiSahayakVoice.setLanguage === 'function') {
        KrishiSahayakVoice.setLanguage(newLang);
      }
      var ls = document.getElementById('ks-voice-lang-select');
      if (ls && ls.value !== newLang) {
        ls.value = newLang;
      }
      this.setVoiceState(this.voiceState);
      this._updateInputPlaceholder(newLang);
      this._updateContextBar();
      this.renderSuggestionChips(newLang, this.currentSuggestionContext);
      if (!this.conversationStarted) {
        this._showWelcome(newLang);
      }
    },

    _updateInputPlaceholder: function (lang) {
      var input = document.getElementById('ks-chat-input');
      if (!input) return;
      var ph = {
        en: 'Ask about prices, buyers, transport, storage…',
        hi: 'भाव, खरीदार, परिवहन, भंडारण के बारे में पूछें…',
        mr: 'भाव, खरेदीदार, वाहतूक, साठवणूक याबद्दल विचारा…'
      };
      input.placeholder = ph[lang] || ph['en'];
    },

    setVoiceState: function (state) {
      this.voiceState = state;
      var statusEl = document.getElementById('ks-voice-status');
      var btn = document.getElementById('ks-voice-btn');
      var input = document.getElementById('ks-chat-input');
      var lang = LanguageDetector.currentLanguage || 'en';

      var messages = {
        IDLE: {
          en: 'Tap the microphone to speak',
          hi: 'बोलने के लिए माइक दबाएं',
          mr: 'बोलण्यासाठी माइक दाबा'
        },
        LISTENING: {
          en: 'Listening… Please speak',
          hi: 'सुन रहे हैं… बोलिए',
          mr: 'ऐकत आहे… बोला'
        },
        PROCESSING: {
          en: 'Understanding…',
          hi: 'समझ रहे हैं…',
          mr: 'समजून घेत आहे…'
        },
        SPEAKING: {
          en: 'Speaking…',
          hi: 'बोल रहे हैं…',
          mr: 'बोलत आहे…'
        },
        READY: {
          en: 'Tap microphone for your next question',
          hi: 'अगले सवाल के लिए माइक दबाएं',
          mr: 'पुढील प्रश्नासाठी माइक दाबा'
        }
      };

      var msg = (messages[state] && messages[state][lang]) || messages[state]['en'];

      if (statusEl) {
        statusEl.textContent = msg;
        statusEl.className = 'ks-voice-status ks-voice-status--' + state.toLowerCase();
      }

      if (btn) {
        if (state === 'LISTENING') {
          btn.classList.add('ks-chat__voice-btn--listening');
          btn.setAttribute('aria-label', 'Listening... Tap to stop');
          btn.setAttribute('title', 'Listening... Tap to stop');
        } else {
          btn.classList.remove('ks-chat__voice-btn--listening');
          btn.setAttribute('aria-label', msg);
          btn.setAttribute('title', msg);
        }
      }

      if (input) {
        if (state === 'LISTENING' || state === 'PROCESSING') {
          input.setAttribute('placeholder', msg);
        } else {
          this._updateInputPlaceholder(lang);
        }
      }
    },

    _injectHTML: function () {
      var html = '' +
        '<div class="ks-fab-wrap" id="ks-fab-wrap">' +
          '<button class="ks-fab ks-fab--idle" id="ks-fab-btn" aria-label="Open Krishi Sahayak" title="Krishi Sahayak">' +
            '<span class="ks-fab__icon">🌱</span>' +
            '<span class="ks-fab__text"><span class="ks-fab__name">Krishi Sahayak</span></span>' +
          '</button>' +
        '</div>' +
        '<div class="ks-chat" id="ks-chat" role="dialog" aria-modal="true" aria-label="Krishi Sahayak" aria-hidden="true">' +
          '<div class="ks-chat__header">' +
            '<div class="ks-chat__header-avatar" aria-hidden="true">🌱</div>' +
            '<div class="ks-chat__header-info">' +
              '<div class="ks-chat__header-name">Krishi Sahayak</div>' +
              '<div class="ks-chat__header-sub" id="ks-header-sub">Your farming assistant</div>' +
            '</div>' +
            '<div class="ks-chat__header-actions">' +
              '<select id="ks-voice-lang-select" class="ks-voice-lang-select" aria-label="Language">' +
                '<option value="en">English</option>' +
                '<option value="hi">हिन्दी</option>' +
                '<option value="mr">मराठी</option>' +
              '</select>' +
              '<button class="ks-chat__header-btn" id="ks-chat-close" aria-label="Close">✕</button>' +
            '</div>' +
          '</div>' +
          '<div class="ks-chat__messages" id="ks-messages" role="log" aria-live="polite"></div>' +
          '<div id="krishiSuggestionChips" class="ks-suggestion-chips" aria-label="Suggestions"></div>' +
          '<div class="ks-chat__input-area">' +
            '<div class="ks-chat__input-wrap">' +
              '<input type="text" id="ks-chat-input" class="ks-chat__input" placeholder="Type your question..." autocomplete="off" aria-label="Type your question" maxlength="300">' +
              '<button class="ks-chat__voice-btn" id="ks-voice-btn" aria-label="Start voice input" title="🎙️ Speak">🎤</button>' +
              '<button class="ks-chat__send-btn" id="ks-send-btn" aria-label="Send message">➤</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      var wrap = document.createElement('div');
      wrap.innerHTML = html;
      while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    },

    _bindEvents: function () {
      var self = this;
      var fab = document.getElementById('ks-fab-btn');
      var close = document.getElementById('ks-chat-close');
      var minimize = document.getElementById('ks-chat-minimize');
      var send = document.getElementById('ks-send-btn');
      var input = document.getElementById('ks-chat-input');
      var messages = document.getElementById('ks-messages');
      var voiceBtn = document.getElementById('ks-voice-btn');
      var langSelect = document.getElementById('ks-voice-lang-select');
      var replyToggle = document.getElementById('ks-voice-reply-toggle');

      if (fab) fab.addEventListener('click', function () { self.toggle(); });
      if (close) close.addEventListener('click', function () { self.close(); });
      if (minimize) minimize.addEventListener('click', function () { self.close(); });
      if (send) send.addEventListener('click', function () { self._handleSend(); });
      if (input) {
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); self._handleSend(); }
        });
      }
      if (voiceBtn) {
        voiceBtn.addEventListener('click', function () {
          KrishiSahayakVoice.toggleListening();
        });
      }
      if (langSelect) {
        langSelect.value = LanguageDetector.currentLanguage;
        langSelect.addEventListener('change', function () {
          var newLang = this.value;
          self.onLanguageChange(newLang);
          if (window.KrishiI18n && typeof window.KrishiI18n.changeLanguage === 'function') {
            window.KrishiI18n.changeLanguage(newLang, 'chatbot');
          } else {
            window.dispatchEvent(new CustomEvent('chatbotLanguageChanged', { detail: { lang: newLang } }));
          }
        });
      }

      // Synchronize with external website language changes
      window.addEventListener('languageChanged', function (e) {
        if (!e || !e.detail || !e.detail.lang) return;
        self.onLanguageChange(e.detail.lang);
      });

      // Suggestion chips bar delegation
      var chipsWrap = document.getElementById('krishiSuggestionChips');
      if (chipsWrap) {
        chipsWrap.addEventListener('click', function (e) {
          var qBtn = e.target.closest('[data-query]');
          if (qBtn) {
            var q = qBtn.getAttribute('data-query');
            if (q) self.sendUserMessage(q, false);
          }
        });
      }

      if (replyToggle) {
        var syncReplyUI = function () {
          var on = KrishiSahayakVoice.isVoiceReplyEnabled();
          replyToggle.textContent = on ? '🔊' : '🔇';
          replyToggle.setAttribute('title', on ? 'Voice replies: ON (Tap to mute)' : 'Voice replies: OFF (Tap to enable)');
          replyToggle.setAttribute('aria-label', on ? 'Voice replies on' : 'Voice replies off');
        };
        syncReplyUI();
        replyToggle.addEventListener('click', function () {
          var cur = KrishiSahayakVoice.isVoiceReplyEnabled();
          KrishiSahayakVoice.setVoiceReplyEnabled(!cur);
          if (cur) KrishiSahayakVoice.stopSpeaking();
          syncReplyUI();
        });
      }

      if (messages) {
        messages.addEventListener('click', function (e) {
          // 1. Audio replay
          var speakBtn = e.target.closest('.ks-msg__speak-btn');
          if (speakBtn) {
            var botMsg = speakBtn.closest('.ks-msg--bot');
            var content = botMsg ? botMsg.querySelector('.ks-msg__content') : null;
            if (content) {
              if (speakBtn.classList.contains('ks-msg__speak-btn--speaking')) {
                KrishiSahayakVoice.stopSpeaking();
                self.setVoiceState('READY');
              } else {
                var msgLang = botMsg.getAttribute('data-lang') || LanguageDetector.currentLanguage;
                KrishiSahayakVoice.speak(content.innerHTML, msgLang, speakBtn);
              }
            }
            return;
          }

          // 2. Closing YES / NO Action buttons
          var yesBtn = e.target.closest('[data-action="yes-continue"]');
          if (yesBtn) {
            self.sendUserMessage(yesBtn.textContent.trim(), false);
            return;
          }
          var noBtn = e.target.closest('[data-action="no-close"]');
          if (noBtn) {
            self.sendUserMessage(noBtn.textContent.trim(), false);
            return;
          }

          // Nearby mandis button
          var nearbyBtn = e.target.closest('[data-action="show-nearby-mandis"]');
          if (nearbyBtn) {
            self.sendUserMessage(nearbyBtn.textContent.trim(), false);
            return;
          }

          // 3. Retry buttons
          var retryBtn = e.target.closest('[data-action="retry"]');
          if (retryBtn) {
            var mem = KrishiSahayakMemory.getContext();
            var prevCmd = mem.cropName ? (mem.cropName + ' price') : 'Check market price';
            self.sendUserMessage(prevCmd, false);
            return;
          }
          var otherBtn = e.target.closest('[data-action="other"]');
          if (otherBtn) {
            KrishiSahayakMemory.clearAwaiting();
            self.sendUserMessage('Check market price', false);
            return;
          }

          // 4. Quick Action Query Buttons
          var qBtn = e.target.closest('[data-query]');
          if (qBtn) {
            var q = qBtn.getAttribute('data-query');
            if (q) self.sendUserMessage(q, false);
          }
        });
      }

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && self.isOpen) self.close();
      });
    },

    _updateContextBar: function () {
      var mem = KrishiSahayakMemory.getContext();
      var ctx = (mem && mem.cropId) ? mem : KrishiSahayakEngine.getFarmerContext();
      var bar = document.getElementById('ks-context-bar');
      if (!bar) return;
      if (ctx && (ctx.cropName || ctx.cropId)) {
        var cDisplay = R.getCropDisplayName(ctx.cropId || ctx.cropName, LanguageDetector.currentLanguage);
        var mText = ctx.mandi ? (typeof ctx.mandi === 'object' ? (ctx.mandi.canonical || ctx.mandi.id) : String(ctx.mandi)).replace(' APMC', '') : '';
        bar.innerHTML = '<span class="ks-chat__context-label">Context:</span>' +
          '<span class="ks-chat__context-pill">🌾 ' + cDisplay + '</span>' +
          (mText ? '<span class="ks-chat__context-pill">📍 ' + mText + '</span>' : '') +
          (ctx.quantityQ ? '<span class="ks-chat__context-pill">📦 ' + ctx.quantityQ + 'q</span>' : '') +
          (ctx.grade ? '<span class="ks-chat__context-pill">' + ctx.grade + '</span>' : '');
      } else {
        bar.innerHTML = '';
      }
    },

    open: function () {
      var chat = document.getElementById('ks-chat');
      var fab = document.getElementById('ks-fab-btn');
      if (!chat) return;
      this.isOpen = true;
      chat.classList.add('ks-chat--open');
      chat.setAttribute('aria-hidden', 'false');
      if (fab) { fab.classList.remove('ks-fab--idle'); fab.classList.add('ks-fab--open'); }
      var self = this;
      if (this._pendingContextMsg) {
        var msg = this._pendingContextMsg;
        this._pendingContextMsg = null;
        setTimeout(function () { self.sendUserMessage(msg, false); }, 450);
      }
      setTimeout(function () {
        var inp = document.getElementById('ks-chat-input');
        if (inp) inp.focus();
      }, 320);
    },

    close: function () {
      var chat = document.getElementById('ks-chat');
      var fab = document.getElementById('ks-fab-btn');
      if (!chat) return;
      this.isOpen = false;
      chat.classList.remove('ks-chat--open');
      chat.setAttribute('aria-hidden', 'true');
      if (fab) { fab.classList.remove('ks-fab--open'); fab.classList.add('ks-fab--idle'); }
      KrishiSahayakVoice.stopSpeaking();
      KrishiSahayakVoice.stopListening();
      this.setVoiceState('IDLE');
    },

    toggle: function () { this.isOpen ? this.close() : this.open(); },

    openWithMessage: function (msg) {
      this._pendingContextMsg = msg;
      if (!this.isOpen) { this.open(); }
      else { var self = this; setTimeout(function () { self.sendUserMessage(msg, false); }, 200); }
    },

    _showWelcome: function (lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var messages = document.getElementById('ks-messages');
      if (!this.conversationStarted && messages) {
        messages.innerHTML = '';
      }
      this._appendBotMessage(R.welcome(lang).html, 'welcome', lang);
    },

    _handleSend: function () {
      var input = document.getElementById('ks-chat-input');
      if (!input) return;
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      this.sendUserMessage(text, false);
    },

    // Single unified command processor for typed & spoken input (Phase 5 & 10)
    sendUserMessage: function (text, isVoice, forceLang) {
      this.conversationStarted = true;
      KrishiSahayakVoice.stopSpeaking();

      var detectedLang = forceLang || LanguageDetector.detect(text);
      var effectiveLang = LanguageDetector.currentLanguage || detectedLang;
      if (/[\u0900-\u097F]/.test(text)) {
        effectiveLang = detectedLang;
      }

      var langSelect = document.getElementById('ks-voice-lang-select');
      if (langSelect && langSelect.value !== effectiveLang) {
        langSelect.value = effectiveLang;
        LanguageDetector.currentLanguage = effectiveLang;
      }

      this._appendUserMessage(text);
      this._showTyping();
      this.setVoiceState('PROCESSING');

      var self = this;
      var delay = isVoice ? 350 : 500;

      setTimeout(function () {
        self._hideTyping();
        var responsePromise = Promise.resolve(self._processMessage(text, effectiveLang));
        responsePromise.then(function (response) {
          if (!response) response = R.unknown(effectiveLang);
          var botDiv = self._appendBotMessage(response.html, '', effectiveLang);
          self._updateContextBar();

          if (response.suggestionContext) {
            self.renderSuggestionChips(effectiveLang, response.suggestionContext);
          }

          if (isVoice && KrishiSahayakVoice.isVoiceReplyEnabled() && botDiv) {
            var speakBtn = botDiv.querySelector('.ks-msg__speak-btn');
            KrishiSahayakVoice.speak(response.html, effectiveLang, speakBtn);
          } else {
            self.setVoiceState('READY');
          }
        }).catch(function (err) {
          var errResp = R.networkError(effectiveLang);
          self._appendBotMessage(errResp.html, '', effectiveLang);
          self.setVoiceState('READY');
        });
      }, delay);
    },

    _processMessage: function (text, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'en';
      var mem = KrishiSahayakMemory.getContext();

      // 1. Detect Intent with multi-turn context
      // Check speech ambiguity for Chandigarh vs Chandwad
      var lowerText = (text || '').toLowerCase().trim();
      if ((lowerText === 'chandi' || lowerText === 'chandi mandi' || lowerText === 'चंडी' || lowerText === 'चंडी मंडी' || lowerText.indexOf('चंडी भाव') !== -1) && lowerText.indexOf('गढ़') === -1 && lowerText.indexOf('वड') === -1) {
        var ambigQ = lang === 'mr'
          ? "तुमचा अर्थ चंदीगड मंडी आहे की चांदवड मंडी?"
          : (lang === 'hi'
            ? "क्या आपका मतलब चंडीगढ़ मंडी है या चांदवड़ मंडी?"
            : "Did you mean Chandigarh mandi or Chandwad mandi?");
        var ambigBtns = '<div class="ks-msg-actions">'
          + '<button class="ks-quick-btn" data-query="' + (lang === 'mr' ? 'चंदीगड मंडी भाव' : (lang === 'hi' ? 'चंडीगढ़ मंडी भाव' : 'Chandigarh mandi price')) + '">📍 Chandigarh Mandi</button>'
          + '<button class="ks-quick-btn" data-query="' + (lang === 'mr' ? 'चांदवड मंडी भाव' : (lang === 'hi' ? 'चांदवड़ मंडी भाव' : 'Chandwad mandi price')) + '">📍 Chandwad Mandi</button>'
          + '</div>';
        return {
          html: '<p style="margin-bottom:8px;">' + ambigQ + '</p>' + ambigBtns,
          suggestionContext: 'initial'
        };
      }

      var intent = KrishiSahayakEngine.detectIntent(text, mem);

      // Handle YES / NO conversational state transitions
      if (intent === 'YES_CONTINUE') {
        KrishiSahayakMemory.clearAwaiting();
        KrishiSahayakMemory.update({ conversationActive: true });
        return R.askNextQuestion(lang);
      }

      if (intent === 'NO_CLOSE') {
        KrishiSahayakMemory.reset();
        return R.closeConversation(lang);
      }

      // 2. Extract Entities
      var cropId = KrishiSahayakEngine.extractCropFromText(text);
      var qty = KrishiSahayakEngine.extractQuantity(text);
      var grade = KrishiSahayakEngine.extractGrade(text);
      var mandi = KrishiSahayakEngine.extractMandi(text);

      // Context inheritance: if user provides follow-up (e.g. "and Lasalgaon?", "Nashik", "10 quintal")
      var finalCropId = cropId || mem.cropId || null;
      var finalQty = qty || mem.quantityQ || 10;
      var finalGrade = grade || mem.grade || 'Standard';
      var targetMandi = mandi || mem.mandi || null;

      // Update memory with newly discovered entities
      KrishiSahayakMemory.update({
        cropId: finalCropId,
        quantityQ: finalQty,
        grade: finalGrade,
        mandi: targetMandi,
        lastIntent: intent !== 'UNKNOWN' ? intent : mem.lastIntent,
        conversationActive: true
      });

      // Special contextual queries: "why recommended", "is Vashi better"
      if (/why.*recommend/i.test(text) || /का.*चांगला/i.test(text) || /का.*सर्वोत्तम/i.test(text) || /vashi.*better/i.test(text) || /वाशी.*चांग/i.test(text)) {
        KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
        return R.whyRecommended(targetMandi || 'Mumbai APMC (Vashi)', finalCropId || 'tomato', finalQty, lang);
      }

      // 3. Process Intent
      switch (intent) {
        case 'PRICE_CHECK': {
          if (!finalCropId) {
            // Smart clarification: ask for crop only
            KrishiSahayakMemory.update({ awaiting: 'CLARIFY_CROP', pendingAction: 'PRICE_CHECK', mandi: targetMandi });
            if (targetMandi) {
              return R.askingCropForMandi(targetMandi, lang);
            }
            return R.askingCrop(lang);
          }
          KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
          return R.priceCheck(finalCropId, finalQty, targetMandi, lang);
        }

        case 'SHOW_NEARBY_MANDIS': {
          var targetCrop = mem.pendingCropId || mem.cropId || finalCropId || 'onion';
          KrishiSahayakMemory.clearAwaiting();
          KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
          return R.showNearbyMandis(targetCrop, lang);
        }

        case 'WHERE_SELL': {
          if (!finalCropId) {
            KrishiSahayakMemory.update({ awaiting: 'CLARIFY_CROP', pendingAction: 'WHERE_SELL' });
            return R.askingCrop(lang);
          }
          KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
          return R.whereSell(finalCropId, finalQty, finalGrade, lang);
        }

        case 'COMPARE_MANDIS': {
          var m1 = targetMandi || 'Chandwad';
          var m2 = (mandi && mandi !== targetMandi) ? mandi : 'Lasalgaon';
          KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
          return R.compareMandis(finalCropId || 'onion', m1, m2, finalQty, lang);
        }

        case 'PRICE_TREND': {
          if (!finalCropId) {
            KrishiSahayakMemory.update({ awaiting: 'CLARIFY_CROP', pendingAction: 'PRICE_TREND' });
            return R.askingCrop(lang);
          }
          KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
          return R.priceTrend(finalCropId, lang);
        }

        case 'NET_RETURN': {
          if (!finalCropId) {
            KrishiSahayakMemory.update({ awaiting: 'CLARIFY_CROP', pendingAction: 'NET_RETURN' });
            return R.askingCrop(lang);
          }
          KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
          return R.netReturn(finalCropId, finalQty, 42, finalGrade, lang);
        }

        case 'FIND_BUYERS': {
          if (!finalCropId) {
            KrishiSahayakMemory.update({ awaiting: 'CLARIFY_CROP', pendingAction: 'FIND_BUYERS' });
            return R.askingCrop(lang);
          }
          KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
          return R.findBuyers(finalCropId, lang);
        }

        case 'WHICH_BUYER_BETTER': {
          KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
          return R.whichBuyerBetter(finalCropId, lang);
        }

        case 'TRANSPORT': {
          var distM = text.match(/(\d+)\s*km/i) || text.match(/(\d+)\s*किमी/i);
          var d = distM ? parseInt(distM[1]) : (targetMandi && targetMandi.indexOf('Vashi') !== -1 ? 165 : 45);
          KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
          return R.transport(d, finalQty, targetMandi, lang);
        }

        case 'LOT_REGISTRATION': {
          KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
          return R.lotAcknowledged(finalCropId, finalQty, lang);
        }

        case 'GREETING': {
          KrishiSahayakMemory.clearAwaiting();
          return R.greeting(lang);
        }

        default: {
          // If crop found directly, run price check or pending action
          if (cropId) {
            var action = mem.pendingAction || 'PRICE_CHECK';
            KrishiSahayakMemory.clearAwaiting();
            if (action === 'WHERE_SELL') return R.whereSell(cropId, finalQty, finalGrade, lang);
            if (action === 'FIND_BUYERS') return R.findBuyers(cropId, lang);
            if (action === 'NET_RETURN') return R.netReturn(cropId, finalQty, 42, finalGrade, lang);
            if (action === 'PRICE_TREND') return R.priceTrend(cropId, lang);
            KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
            return R.priceCheck(cropId, finalQty, targetMandi, lang);
          }

          // If mandi found in follow-up, re-evaluate with current crop
          if (mandi && finalCropId) {
            KrishiSahayakMemory.update({ awaiting: 'ASK_NEXT_QUESTION' });
            return R.priceCheck(finalCropId, finalQty, mandi, lang);
          }

          // If mandi found without crop, clarify crop for this mandi
          if (mandi && !finalCropId) {
            KrishiSahayakMemory.update({ awaiting: 'CLARIFY_CROP', pendingAction: 'PRICE_CHECK', mandi: mandi });
            return R.askingCropForMandi(mandi, lang);
          }

          return R.unknown(lang);
        }
      }
    },

    _appendUserMessage: function (text) {
      var messages = document.getElementById('ks-messages');
      if (!messages) return;
      var div = document.createElement('div');
      div.className = 'ks-msg ks-msg--user';
      var span = document.createElement('span');
      span.className = 'ks-msg__bubble';
      span.textContent = text;
      div.appendChild(span);
      messages.appendChild(div);
      this._scrollBottom();
    },

    _appendBotMessage: function (html, extraClass, lang) {
      var messages = document.getElementById('ks-messages');
      if (!messages) return null;
      var div = document.createElement('div');
      div.className = 'ks-msg ks-msg--bot' + (extraClass ? ' ks-msg--' + extraClass : '');
      div.setAttribute('data-lang', lang || LanguageDetector.currentLanguage);
      var bubbleHtml = '<div class="ks-msg__content">' + html + '</div>';
      if (extraClass !== 'notice' && extraClass !== 'welcome') {
        bubbleHtml += '<div class="ks-msg__footer"><button class="ks-msg__speak-btn" aria-label="Replay response" title="🔊 Listen to response">🔊</button></div>';
      }
      div.innerHTML = '<div class="ks-msg__avatar" aria-hidden="true">🌾</div><div class="ks-msg__bubble">' + bubbleHtml + '</div>';
      messages.appendChild(div);
      this._scrollBottom();
      return div;
    },

    showTemporaryNotice: function (msg) {
      this._appendBotMessage('<p style="color:#6F7F75;font-size:12.5px;margin:0;">' + msg + '</p>', 'notice');
    },

    _showTyping: function () {
      var messages = document.getElementById('ks-messages');
      if (!messages) return;
      this._hideTyping();
      var div = document.createElement('div');
      div.className = 'ks-typing'; div.id = 'ks-typing-indicator';
      div.innerHTML = '<div class="ks-msg__avatar" aria-hidden="true">🌾</div><div class="ks-typing__bubble"><div class="ks-typing__dot"></div><div class="ks-typing__dot"></div><div class="ks-typing__dot"></div></div>';
      messages.appendChild(div);
      this._scrollBottom();
    },

    _hideTyping: function () {
      var el = document.getElementById('ks-typing-indicator');
      if (el) el.remove();
    },

    _scrollBottom: function () {
      var messages = document.getElementById('ks-messages');
      if (messages) requestAnimationFrame(function () { messages.scrollTop = messages.scrollHeight; });
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // 9. CONTEXTUAL BUTTON — mandi-compare.html recommendation section
  // ══════════════════════════════════════════════════════════════════
  var KrishiSahayakContextual = {
    init: function () {
      var target = document.getElementById('mpc-recommendation');
      if (!target) return;
      var self = this;
      var observer = new MutationObserver(function () {
        if (target.children.length > 0) { self._inject(target); observer.disconnect(); }
      });
      observer.observe(target, { childList: true, subtree: true });
      if (target.children.length > 0) self._inject(target);
    },

    _inject: function (container) {
      if (container.querySelector('.ks-contextual-btn-wrap')) return;

      var cropSel = document.getElementById('mpc-crop-select');
      var cropVal = cropSel ? cropSel.value : 'tomato';
      var cropOpt = cropSel && cropSel.selectedIndex >= 0 ? cropSel.options[cropSel.selectedIndex].text : 'your crop';
      var cleanCrop = cropOpt.replace(/[^\w\s]/g, '').trim();

      var wrap = document.createElement('div');
      wrap.className = 'ks-contextual-btn-wrap';
      wrap.innerHTML =
        '<button class="ks-contextual-btn" id="ks-contextual-btn" aria-label="Ask Krishi Sahayak why this market is recommended">' +
        '<span class="ks-contextual-btn__icon">💬</span>' +
        '<span><strong>Ask Krishi Sahayak</strong><span class="ks-contextual-btn__sub">Why is this market recommended?</span></span>' +
        '</button>';
      container.appendChild(wrap);

      wrap.querySelector('#ks-contextual-btn').addEventListener('click', function () {
        var titleEl = container.querySelector('h2, h3, .mpc-rec-mandi-name');
        var mandiName = titleEl ? titleEl.textContent.replace(/[^a-zA-Z\s]/g, '').trim() : 'the recommended market';
        var lang = LanguageDetector.currentLanguage;
        var qText = lang === 'mr'
          ? (mandiName + ' माझ्या ' + cleanCrop + ' साठी का सर्वोत्तम आहे?')
          : (lang === 'hi'
            ? (mandiName + ' मेरी ' + cleanCrop + ' के लिए क्यों अनुशंसित है?')
            : ('Why is ' + mandiName + ' recommended for my ' + cleanCrop + '?'));
        KrishiSahayakUI.openWithMessage(qText);
      });

      if (cropSel) {
        cropSel.addEventListener('change', function () {
          var existing = container.querySelector('.ks-contextual-btn-wrap');
          if (existing) existing.remove();
        });
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // 10. GLOBAL API EXPORTS
  // ══════════════════════════════════════════════════════════════════
  window.KrishiSahayak = {
    open:               function () { KrishiSahayakUI.open(); },
    close:              function () { KrishiSahayakUI.close(); },
    toggle:             function () { KrishiSahayakUI.toggle(); },
    openWithMessage:    function (msg) { KrishiSahayakUI.openWithMessage(msg); },
    sendMessage:        function (text) { KrishiSahayakUI.sendUserMessage(text, false); },
    setLanguage:        function (lang) { KrishiSahayakUI.onLanguageChange(lang); },
    Engine:             KrishiSahayakEngine,
    UI:                 KrishiSahayakUI,
    Memory:             KrishiSahayakMemory,
    Data:               KrishiSahayakData,
    Voice:              KrishiSahayakVoice,
    R:                  R,
    SUGGESTIONS_CONFIG: SUGGESTIONS_CONFIG,
    WELCOME_MESSAGES:   WELCOME_MESSAGES,
    KNOWN_MANDIS:       KNOWN_MANDIS
  };

  window.KrishiSahayakVoice = {
    startListening: function () { KrishiSahayakVoice.startListening(); },
    stopListening:  function () { KrishiSahayakVoice.stopListening(); },
    speak:          function (text, lang) { KrishiSahayakVoice.speak(text, lang); },
    stopSpeaking:   function () { KrishiSahayakVoice.stopSpeaking(); },
    setLanguage:    function (lang) { KrishiSahayakVoice.setLanguage(lang); },
    getLanguage:    function () { return KrishiSahayakVoice.getLanguage(); },
    getRecognitionLocale: function (lang) { return KrishiSahayakVoice.getRecognitionLocale(lang); },
    getSpeechLocale:      function (lang) { return KrishiSahayakVoice.getSpeechLocale(lang); }
  };

  window.KrishiSahayakEngine = KrishiSahayakEngine;
  window.LanguageDetector = LanguageDetector;
  window.KrishiSahayakMemory = KrishiSahayakMemory;
  window.KrishiSahayakUI = KrishiSahayakUI;

  // ══════════════════════════════════════════════════════════════════
  // 11. BOOTSTRAP
  // ══════════════════════════════════════════════════════════════════
  function bootstrap() {
    KrishiSahayakUI.init();
    KrishiSahayakVoice.init();
    if (document.getElementById('mpc-recommendation')) {
      KrishiSahayakContextual.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
