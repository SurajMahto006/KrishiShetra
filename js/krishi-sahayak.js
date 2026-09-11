/**
 * KRISHI SAHAYAK — AI Market Decision-Support Continuous Voice Assistant
 * KrishiShetra Farmer Dashboard Integration
 *
 * Architecture:
 *   KS_DATA                 — Self-contained data tables (crops, mandis, buyers)
 *   CROP_NAMES              — Multilingual crop name dictionary (en, hi, mr)
 *   KrishiSahayakData       — Data access layer (benchmarks, APMC rankings, buyers, trends)
 *   LanguageDetector        — Automatic language detector (English, Hindi, Marathi)
 *   KrishiSahayakMemory     — Lightweight cross-turn conversational context (crop, qty, grade, mandi, buyer)
 *   KrishiSahayakEngine     — Multilingual intent detection & entity extraction
 *   R                       — Multilingual response generators (en, hi, mr)
 *   KrishiSahayakVoice      — Continuous speech recognition & voice synthesis controller
 *   KrishiSahayakUI         — Chat panel UI controller with voice state machine
 *   KrishiSahayakContextual — Contextual button injector for mandi-compare.html
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════
  // 1. SELF-CONTAINED DATA TABLES
  // ══════════════════════════════════════════════════════════════════
  var KS_DATA = {
    crops: [
      { id: 'rice',      name: 'Rice',      price: 2850, change: 5.2, dir: 'up',   market: 'Pune APMC',             demand: 'high'   },
      { id: 'wheat',     name: 'Wheat',     price: 2650, change: 6.2, dir: 'up',   market: 'Nashik APMC',           demand: 'medium' },
      { id: 'maize',     name: 'Maize',     price: 2300, change: 2.1, dir: 'up',   market: 'Nashik APMC',           demand: 'medium' },
      { id: 'soybean',   name: 'Soybean',   price: 4650, change: 4.8, dir: 'up',   market: 'Indore Mandi',          demand: 'high'   },
      { id: 'pulses',    name: 'Pulses',    price: 5200, change: 1.5, dir: 'up',   market: 'Nagpur APMC',           demand: 'medium' },
      { id: 'onion',     name: 'Onion',     price: 2850, change: 3.8, dir: 'up',   market: 'Nashik APMC',           demand: 'high'   },
      { id: 'tomato',    name: 'Tomato',    price: 2400, change: 1.4, dir: 'down', market: 'Pune APMC',             demand: 'medium' },
      { id: 'potato',    name: 'Potato',    price: 1800, change: 0.8, dir: 'up',   market: 'Pune APMC',             demand: 'low'    },
      { id: 'chilli',    name: 'Chilli',    price: 8500, change: 7.2, dir: 'up',   market: 'Guntur APMC',           demand: 'high'   },
      { id: 'groundnut', name: 'Groundnut', price: 5600, change: 2.9, dir: 'up',   market: 'Rajkot APMC',           demand: 'medium' },
      { id: 'cotton',    name: 'Cotton',    price: 6800, change: 0.6, dir: 'down', market: 'Nagpur APMC',           demand: 'medium' },
      { id: 'sugarcane', name: 'Sugarcane', price:  350, change: 1.2, dir: 'up',   market: 'Kolhapur APMC',         demand: 'medium' },
      { id: 'mango',     name: 'Mango',     price: 4500, change: 3.5, dir: 'up',   market: 'Ratnagiri',             demand: 'high'   },
      { id: 'banana',    name: 'Banana',    price: 2200, change: 2.1, dir: 'down', market: 'Jalgaon APMC',          demand: 'low'    },
      { id: 'grapes',    name: 'Grapes',    price: 6200, change: 4.1, dir: 'up',   market: 'Nashik APMC',           demand: 'high'   },
    ],

    mandis: [
      { name: 'Nashik APMC',         distKm: 42,  demandLevel: 'High',     state: 'Maharashtra',     priceMultiplier: 1.05 },
      { name: 'Pune APMC',           distKm: 28,  demandLevel: 'Medium',   state: 'Maharashtra',     priceMultiplier: 0.98 },
      { name: 'Mumbai APMC (Vashi)', distKm: 165, demandLevel: 'High',     state: 'Maharashtra',     priceMultiplier: 1.00 },
      { name: 'Nagpur APMC',         distKm: 450, demandLevel: 'Medium',   state: 'Maharashtra',     priceMultiplier: 0.94 },
      { name: 'Solapur APMC',        distKm: 220, demandLevel: 'Low',      state: 'Maharashtra',     priceMultiplier: 0.90 },
      { name: 'Indore Mandi',        distKm: 520, demandLevel: 'High',     state: 'Madhya Pradesh',  priceMultiplier: 1.02 },
    ],

    buyers: [
      { id: 'b1', name: 'ABC Foods Ltd',              verified: true, rating: '4.9 ★', crops: ['Rice', 'Wheat', 'Tomato'],           minQty: '10 quintals', offerPrice: '₹2,850/q', distance: '38 km', deals: '184 Completed Deals', paymentDays: 'Instant 24h Bank Transfer'  },
      { id: 'b2', name: 'Reliance Fresh Procurement', verified: true, rating: '4.8 ★', crops: ['Rice', 'Onion', 'Tomato', 'Banana'], minQty: '20 quintals', offerPrice: '₹2,920/q', distance: '42 km', deals: '320 Completed Deals', paymentDays: 'Direct APMC Escrow'         },
      { id: 'b3', name: 'ITC Agri Business Division', verified: true, rating: '4.9 ★', crops: ['Wheat', 'Soybean', 'Chilli', 'Maize'],minQty: '15 quintals', offerPrice: '₹2,780/q', distance: '51 km', deals: '410 Completed Deals', paymentDays: 'Instant NEFT'               },
      { id: 'b4', name: 'BigBasket Direct Sourcing',  verified: true, rating: '4.7 ★', crops: ['Onion', 'Tomato', 'Potato', 'Grapes'],minQty: '5 quintals',  offerPrice: '₹2,820/q', distance: '24 km', deals: '290 Completed Deals', paymentDays: '48h Farm Gate'              },
      { id: 'b5', name: 'XYZ Agro Exports',           verified: true, rating: '4.8 ★', crops: ['Grapes', 'Mango', 'Chilli', 'Cotton'],minQty: '25 quintals', offerPrice: '₹3,050/q', distance: '45 km', deals: '145 Completed Deals', paymentDays: 'Escrow Guarantee'           },
      { id: 'b6', name: 'Green Valley Organic Mills',  verified: true, rating: '4.6 ★', crops: ['Pulses', 'Rice', 'Soybean'],         minQty: '10 quintals', offerPrice: '₹5,350/q', distance: '85 km', deals: '88 Completed Deals',  paymentDays: 'Direct UPI/Bank'            },
    ],
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
    groundnut: { en: 'Groundnut', hi: 'मूंगफली',   mr: 'शेंगदाणा' },
  };

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

    getMandiRankings: function (cropId, quantityQ) {
      var crop = this.getCrop(cropId);
      if (!crop) return [];

      var truckRate = 28; // ₹/km average
      return KS_DATA.mandis.map(function (m) {
        var pricePerQ = Math.round(crop.price * m.priceMultiplier);
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
          netReturn: netReturn, netPerQ: netPerQ, score: score,
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
      var current = crop.price;
      var mult = crop.dir === 'up' ? 1 : -1;
      return {
        current: current,
        forecast3d: Math.round(current * (1 + mult * crop.change * 0.01)),
        forecast7d: Math.round(current * (1 + mult * crop.change * 0.018)),
        dir: crop.dir,
        change: crop.change,
        market: crop.market,
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
    currentLanguage: 'mr', // Default to Marathi for Maharashtra agricultural context

    detect: function (text) {
      if (!text || !text.trim()) return this.currentLanguage;

      var hasDevanagari = /[\u0900-\u097F]/.test(text);
      if (!hasDevanagari) {
        this.currentLanguage = 'en';
        return 'en';
      }

      var lower = text.toLowerCase();

      var mrWords = [
        'माझ्याकडे', 'माझे', 'माझा', 'माझी', 'मला', 'आहेत', 'आहे', 'नाही', 'कुठे', 'कसे',
        'केव्हा', 'विकावा', 'विकावे', 'विकू', 'विकायचे', 'विकायची', 'शेतकरी', 'बाजार', 'बाजारात',
        'बाजारभाव', 'भाव', 'दर', 'किंमत', 'किंमती', 'वाहतूक', 'खर्च', 'किती', 'काय', 'चालू',
        'येईल', 'होईल', 'खरेदीदार', 'शोधा', 'सांगा', 'करा', 'करावे', 'मिळेल', 'मिळतील', 'नफा',
        'निव्वळ', 'परतावा', 'चांगला', 'चांगले', 'चांगली', 'कोणता', 'कोणते', 'कोणत्या', 'टोमॅटो',
        'कांदा', 'कांद्या', 'कांद्याचा', 'कांद्याचे', 'कांद्याची', 'कांद्याला', 'कांदे', 'बटाटा',
        'बटाट्या', 'बटाट्याचा', 'बटाट्याचे', 'बटाटे', 'गहू', 'गव्हा', 'गव्हाचा', 'गव्हाचे',
        'तांदूळ', 'तांदळा', 'तांदळाचा', 'भात', 'मका', 'मक्या', 'मक्याचा', 'कापूस', 'कापसा',
        'केळी', 'द्राक्षे', 'द्राक्ष', 'आंबा', 'आंब्या', 'शेंगदाणा', 'भुईमूग', 'तूर', 'तुरी',
        'डाळ', 'पाहिजे', 'द्या', 'वरून', 'कडून', 'साठी', 'पिकासाठी', 'त्यांचे', 'यांचे', 'वाशी',
        'थांबू', 'वाढतील', 'वाढणार', 'पडेल', 'ग्राहक', 'व्यापारी', 'नमस्कार', 'हॅलो'
      ];

      var hiWords = [
        'मेरे', 'मेरी', 'मेरा', 'मुझे', 'मुझको', 'हैं', 'है', 'नहीं', 'कहाँ', 'कहा',
        'कैसे', 'कब', 'बेचना', 'बेचू', 'बेचे', 'किसान', 'मंडी', 'परिवहन', 'खर्च',
        'कितना', 'कितने', 'आएगा', 'होगा', 'खरीदार', 'ढूंढो', 'ढूँढो', 'बताओ', 'बताएं',
        'करो', 'मिलेगा', 'मिलेंगे', 'मुनाफा', 'फायदा', 'दाम', 'अच्छा', 'अच्छी', 'कौनसा',
        'कौनसी', 'टमाटर', 'प्याज', 'आलू', 'गेहूं', 'चावल', 'कपास', 'केला', 'अंगूर',
        'आम', 'मूंगफली', 'दाल', 'चाहिए', 'सकता', 'सकते', 'सकती', 'नमस्ते', 'प्रणाम'
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
        this.currentLanguage = 'mr';
        return 'mr';
      } else if (hiScore > mrScore) {
        this.currentLanguage = 'hi';
        return 'hi';
      }

      if (this.currentLanguage === 'mr' || this.currentLanguage === 'hi') {
        return this.currentLanguage;
      }
      return 'mr';
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // 4. LIGHTWEIGHT CONVERSATION MEMORY
  // ══════════════════════════════════════════════════════════════════
  var KrishiSahayakMemory = {
    cropId: null,
    cropName: null,
    quantityQ: null,
    grade: null,
    selectedMandi: null,
    selectedBuyer: null,

    update: function (data) {
      if (!data) return;
      if (data.cropId) {
        this.cropId = data.cropId;
        var c = KrishiSahayakData.getCrop(data.cropId);
        this.cropName = c ? c.name : data.cropId;
      }
      if (data.quantityQ) this.quantityQ = data.quantityQ;
      if (data.grade) this.grade = data.grade;
      if (data.selectedMandi) this.selectedMandi = data.selectedMandi;
      if (data.selectedBuyer) this.selectedBuyer = data.selectedBuyer;
    },

    getContext: function () {
      return {
        cropId: this.cropId,
        cropName: this.cropName,
        quantityQ: this.quantityQ,
        grade: this.grade,
        selectedMandi: this.selectedMandi,
        selectedBuyer: this.selectedBuyer
      };
    },

    clear: function () {
      this.cropId = null;
      this.cropName = null;
      this.quantityQ = null;
      this.grade = null;
      this.selectedMandi = null;
      this.selectedBuyer = null;
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // 5. INTENT DETECTION & ENTITY EXTRACTION ENGINE
  // ══════════════════════════════════════════════════════════════════
  var KrishiSahayakEngine = {
    INTENTS: {
      WHERE_SELL: [
        /where.*sell/i, /kahan.*bech/i, /best.*market/i, /which.*mandi/i, /mandi.*kahan/i, /sell.*where/i,
        /recommend.*market/i, /best.*mandi/i, /should.*i.*sell/i, /where should/i, /konsi mandi/i, /kahan bechoo/i,
        /कुठे.*विका/i, /कुठे.*विकू/i, /कुठे.*विकाय/i, /माल.*कुठे.*विका/i, /कोणत्या.*बाजारात.*विका/i, /कोणत्या.*मंडईत.*विका/i,
        /सर्वात.*चांगला.*बाजार/i, /चांगला.*बाजार.*कोणता/i, /कुठे.*जास्त.*भाव/i, /कोणत्या.*मार्केट/i, /कुठे.*विक्री/i,
        /कहाँ.*बेच/i, /किधर.*बेच/i, /कहाँ.*बेचना/i, /कौनसी.*मंडी/i
      ],
      PRICE_CHECK: [
        /price/i, /bhav/i, /rate/i, /kitna.*mil/i, /market.*price/i, /aaj.*bhav/i, /today.*price/i, /mandi.*rate/i,
        /what.*price/i, /compare.*price/i, /price.*compare/i, /check.*price/i, /mandi.*compare/i,
        /कांद्याचा.*भाव/i, /टोमॅटोचा.*भाव/i, /बटाट्याचा.*भाव/i, /गव्हाचा.*भाव/i, /तांदळाचा.*भाव/i,
        /भाव.*काय.*चालू/i, /काय.*चालू.*आहे/i, /बाजार.*भाव.*काय/i, /बाजार.*भाव.*सांगा/i, /भाव.*सांगा/i,
        /भाव.*किती.*आहे/i, /भाव.*किती/i, /आज.*भाव/i, /आजचा.*भाव/i, /आजचे.*भाव/i, /आजचा.*बाजार.*भाव/i,
        /बाजार.*भाव/i, /बाजारभाव/i, /किंमत.*किती/i, /बाजारात.*काय.*भाव/i, /काय.*भाव/i, /काय.*दर/i, /दर.*काय/i,
        /भाव.*क्या/i, /दाम.*क्या/i, /रेट.*क्या/i, /मंडी.*भाव/i, /कितना.*भाव/i
      ],
      PRICE_TREND: [
        /trend/i, /should.*sell.*now/i, /wait.*sell/i, /sell.*now/i, /forecast/i, /price.*going/i, /aage.*bhav/i,
        /abhi.*bechoo/i, /hold/i, /price.*increase/i, /price.*decrease/i,
        /भाव.*वाढणार/i, /भाव.*वाढतील/i, /भाव.*कमी.*होतील/i, /आता.*विकू.*का/i, /थांबू.*का/i, /आत्ता.*विकावे.*का/i,
        /भाव.*कधी.*वाढतील/i, /बाजाराचा.*कल/i, /भावाचा.*ट्रेंड/i, /भाव.*कसे.*राहतील/i, /कल.*काय/i, /अंदाज.*काय/i,
        /वाढेल.*का/i, /भाव.*बढ़ेगा/i, /रुकूं.*या.*बेचूं/i, /ट्रेंड.*क्या/i
      ],
      WHICH_BUYER_BETTER: [
        /which.*buyer.*better/i, /best.*buyer/i, /better.*buyer/i, /recommend.*buyer/i, /compare.*buyer/i,
        /कोणता.*खरेदीदार.*चांगला/i, /सर्वोत्तम.*खरेदीदार/i, /कोणता.*उत्तम/i, /कोणता.*चांगला/i,
        /कौनसा.*खरीदार.*अच्छा/i, /बेस्ट.*खरीदार/i
      ],
      FIND_BUYERS: [
        /buyer/i, /khareedaar/i, /purchaser/i, /find.*buyer/i, /who.*buy/i, /buyer.*near/i, /corporate.*buy/i, /company.*buy/i,
        /खरेदीदार.*शोध/i, /खरेदीदार.*सांग/i, /माझ्यासाठी.*खरेदीदार/i, /माल.*कोण.*घेईल/i, /कोण.*खरेदी.*करेल/i,
        /खरेदीदार.*कुठे/i, /खरेदीदार.*मिळ/i, /मला.*ग्राहक.*शोध/i, /पिकासाठी.*खरेदीदार/i, /खरेदीदार/i, /व्यापारी/i,
        /खरीदार.*ढूंढ/i, /खरीदार.*बता/i, /खरीदार.*कहाँ/i, /खरीदार/i
      ],
      TRANSPORT: [
        /transport/i, /truck/i, /freight/i, /gaadi/i, /vehicle/i, /shipping/i, /logistics/i, /transport.*kitne/i,
        /kitna.*lagega/i, /truck.*cost/i,
        /वाहतूक.*खर्च/i, /ट्रान्सपोर्ट.*खर्च/i, /माल.*नेण्यासाठी.*खर्च/i, /वाहतूक.*किती/i, /ट्रकचा.*खर्च/i,
        /गाडी.*भाडे/i, /गाडी.*खर्च/i, /वाहतूक/i, /ट्रान्सपोर्ट/i, /परिवहन.*खर्च/i, /भाड़ा/i, /परिवहन/i
      ],
      NET_RETURN: [
        /net.*return/i, /how.*much.*earn/i, /profit/i, /calculate/i, /kitna.*milega/i, /total.*earn/i, /laabh/i,
        /earning/i, /net.*income/i, /return.*calculate/i, /how much will/i,
        /मला.*निव्वळ.*नफा/i, /निव्वळ.*नफा/i, /निव्वळ.*किती/i, /सगळा.*खर्च.*वजा/i, /वाहतूक.*वजा/i,
        /माझा.*नफा.*किती/i, /नेट.*रिटर्न/i, /निव्वळ.*परतावा/i, /किती.*पैसे.*मिळ/i, /शुद्ध.*मुनाफा/i, /कितना.*मुनाफा/i
      ],
      GREETING: [
        /^(hi|hello|namaste|jai kisan|namaskar|hey|नमस्कार|नमस्ते|प्रणाम|शुभ सकाळ|हॅलो कृषी सहायक)[\s.!]*$/i
      ],
    },

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

    detectIntent: function (text) {
      if (!text || !text.trim()) return 'UNKNOWN';
      var lower = text.toLowerCase().trim();
      var norm = lower.replace(/[।?!,.:;]/g, ' ');

      // Business & agricultural keywords that must never be treated as pure greetings
      var hasBusinessQuery = /(भाव|बाजारभाव|किंमत|दर|दाम|रेट|price|rate|bhav|विक|bech|sell|खरेदी|ग्राहक|व्यापारी|buyer|वाहतूक|परिवहन|ट्रक|गाडी|transport|नफा|मुनाफा|profit|return|वाढ|कमी|थांब|ट्रेंड|trend|कांद|टोमॅ|बटाट|गव्हा|गहू|तांद|भात|सोया|तूर|डाळ|मका|कापूस|कपास|मंडी|बाजार)/i.test(norm);

      // Check pure GREETING only if no business/action words are in the sentence
      var isPureGreeting = /^(नमस्कार|हॅलो|हाय|नमस्ते|प्रणाम|शुभ सकाळ|शुभ दुपार|शुभ संध्याकाळ|hello|hi|hey|namaste|namaskar|jai kisan)[\s!.]*$/i.test(norm) ||
                           (/^(हॅलो|हाय|नमस्कार|नमस्ते|hello|hi)\s*(कृषी सहायक|कृषि सहायक|krishi sahayak)/i.test(norm)) ||
                           (/^(कृषी सहायक|कृषि सहायक|krishi sahayak)[\s!.]*$/i.test(norm));

      if (isPureGreeting && !hasBusinessQuery) {
        return 'GREETING';
      }

      // 1. WHICH_BUYER_BETTER (specific buyer comparison query)
      if (/(कोणता.*खरेदीदार.*चांगला|सर्वोत्तम.*खरेदीदार|कोणता.*उत्तम|कोणता.*व्यापारी.*चांगला|कोणता.*चांगला|कौनसा.*खरीदार.*अच्छा|बेस्ट.*खरीदार|which.*buyer.*better|best.*buyer|better.*buyer|compare.*buyer)/i.test(norm)) {
        return 'WHICH_BUYER_BETTER';
      }

      // 2. FIND_BUYERS (खरेदीदार / ग्राहक / व्यापारी शोधणे)
      if (/(खरेदीदार.*शोध|खरेदीदार.*सांग|खरेदीदार.*कुठे|खरेदीदार.*मिळ|माझ्यासाठी.*खरेदीदार|माल.*कोण.*घेईल|कोण.*खरेदी.*करेल|मला.*ग्राहक.*शोध|पिकासाठी.*खरेदीदार|ग्राहक.*शोध|व्यापारी.*शोध|खरेदीदार|खरीदार.*ढूंढ|खरीदार.*बता|खरीदार.*कहाँ|खरीदार|find.*buyer|who.*buy|buyer.*near|buyers)/i.test(norm)) {
        return 'FIND_BUYERS';
      }

      // 3. PRICE_TREND (भाव वाढणार का, आता विकू का, थांबू का, ट्रेंड)
      if (/(भाव.*वाढणार|भाव.*वाढतील|भाव.*कमी.*होतील|आता.*विकू.*का|थांबू.*का|आत्ता.*विकावे.*का|भाव.*कधी.*वाढतील|बाजाराचा.*कल|भावाचा.*ट्रेंड|भाव.*कसे.*राहतील|कल.*काय|अंदाज.*काय|भाव.*वाढेल|वाढेल.*का|भाव.*बढ़ेगा|रुकूं.*या.*बेचूं|ट्रेंड.*क्या|कल.*क्या|should.*sell.*now|wait.*sell|price.*trend|price.*forecast|will.*price.*increase)/i.test(norm)) {
        return 'PRICE_TREND';
      }

      // 4. WHERE_SELL (कुठे विकावा, कुठे विकावे, कुठे विकू, कोणत्या बाजारात विकावे, इत्यादी)
      if (/(कुठे.*विका|कुठे.*विकू|कुठे.*विकाय|माल.*कुठे.*विका|कोणत्या.*बाजारात.*विका|कोणत्या.*मंडईत.*विका|सर्वात.*चांगला.*बाजार|चांगला.*बाजार.*कोणता|कुठे.*जास्त.*भाव|कोणत्या.*मार्केट|कुठे.*विक्री|कहाँ.*बेच|कहाँ.*बेचना|किधर.*बेच|कौनसी.*मंडी|where.*sell|best.*market|which.*mandi|where.*should.*i.*sell)/i.test(norm) ||
          ((norm.indexOf('कुठे') !== -1 || norm.indexOf('कहाँ') !== -1 || norm.indexOf('where') !== -1) && (norm.indexOf('विक') !== -1 || norm.indexOf('बेच') !== -1 || norm.indexOf('sell') !== -1))) {
        return 'WHERE_SELL';
      }

      // 5. TRANSPORT (वाहतूक खर्च, ट्रान्सपोर्ट, ट्रक, इत्यादी)
      if (/(वाहतूक.*खर्च|ट्रान्सपोर्ट.*खर्च|माल.*नेण्यासाठी.*खर्च|वाहतूक.*किती|ट्रकचा.*खर्च|गाडी.*भाडे|गाडी.*खर्च|वाहतूक|परिवहन.*खर्च|भाड़ा.*कितना|ट्रक.*खर्च|परिवहन|transport.*cost|truck.*cost|freight|how.*much.*transport|shipping.*cost)/i.test(norm) ||
          (norm.indexOf('वाहतूक') !== -1 || norm.indexOf('ट्रान्सपोर्ट') !== -1 || norm.indexOf('परिवहन') !== -1)) {
        return 'TRANSPORT';
      }

      // 6. NET_RETURN (निव्वळ नफा, निव्वळ किती पैसे, वजा केल्यावर नफा, इत्यादी)
      if (/(निव्वळ.*नफा|निव्वळ.*किती|सगळा.*खर्च.*वजा|वाहतूक.*वजा|माझा.*नफा|नफा.*किती|नेट.*रिटर्न|निव्वळ.*परतावा|किती.*नफा|शुद्ध.*मुनाफा|कितना.*मुनाफा|net.*return|how.*much.*earn|net.*profit|calculate.*earnings)/i.test(norm) ||
          (norm.indexOf('निव्वळ') !== -1 || (norm.indexOf('नफा') !== -1 && (norm.indexOf('किती') !== -1 || norm.indexOf('मिळ') !== -1)))) {
        return 'NET_RETURN';
      }

      // 7. PRICE_CHECK (कांद्याचा भाव काय चालू आहे, बाजार भाव सांगा मला, आजचा भाव, भाव किती आहे, इत्यादी)
      var hasPriceWord = /(भाव|बाजारभाव|बाजार\s*भाव|किंमत|किंमती|दर|दाम|रेट|price|rate|bhav)/i.test(norm);
      var hasInquiryWord = /(काय|किती|सांगा|चालू|आज|आजचा|आजचे|दिसतो|सांग|आहे|आहेत|कितना|क्या|बताओ|बताएं|check|what|how\s*much|today)/i.test(norm);
      var cropFound = this.extractCropFromText(text);

      if (hasPriceWord && (hasInquiryWord || cropFound)) {
        return 'PRICE_CHECK';
      }

      if (/(कांद्याचा.*भाव|भाव.*काय|भाव.*किती|बाजारभाव.*सांगा|बाजार.*भाव.*सांगा|आजचा.*बाजार.*भाव|किंमत.*किती|बाजारात.*काय.*भाव|भाव.*चालू|मंडी.*भाव|दाम.*क्या|रेट.*क्या|market.*price|today.*price|check.*price)/i.test(norm)) {
        return 'PRICE_CHECK';
      }

      // 8. LOT_REGISTRATION / CROP STATEMENT (e.g. "माझ्याकडे 500 किलो कांदे आहेत.")
      var hasLotWords = /(माझ्याकडे|माझा|माझे|माझी|आहेत|आहे|मेरे पास|मेरे|i have|have got|i got)/i.test(norm);
      if (hasLotWords && cropFound && this.extractQuantity(text)) {
        return 'LOT_REGISTRATION';
      }

      // 9. Standard regex pattern check as fallback
      for (var intentKey in this.INTENTS) {
        if (this.INTENTS[intentKey].some(function (p) { return p.test(text); })) {
          return intentKey;
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
      // Normalize Devanagari numerals to standard digits
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

    extractMandi: function (text) {
      var lower = text.toLowerCase();
      if (lower.indexOf('vashi') !== -1 || lower.indexOf('वाशी') !== -1 || lower.indexOf('mumbai') !== -1 || lower.indexOf('मुंबई') !== -1) {
        return 'Mumbai APMC (Vashi)';
      }
      if (lower.indexOf('nashik') !== -1 || lower.indexOf('नाशिक') !== -1) return 'Nashik APMC';
      if (lower.indexOf('pune') !== -1 || lower.indexOf('पुणे') !== -1) return 'Pune APMC';
      if (lower.indexOf('nagpur') !== -1 || lower.indexOf('नागपूर') !== -1) return 'Nagpur APMC';
      if (lower.indexOf('solapur') !== -1 || lower.indexOf('सोलापूर') !== -1) return 'Solapur APMC';
      if (lower.indexOf('indore') !== -1 || lower.indexOf('इंदूर') !== -1 || lower.indexOf('इंदौर') !== -1) return 'Indore Mandi';
      return null;
    },

    getFarmerContext: function () {
      var lots = KrishiSahayakData.getFarmerLots();
      if (!lots.length) return null;
      var lot = lots[0];
      return { cropId: lot.cropId, cropName: lot.crop, quantityQ: lot.quantity, grade: lot.grade, location: lot.location };
    },
  };

  // ══════════════════════════════════════════════════════════════════
  // 6. MULTILINGUAL RESPONSE GENERATORS (en, hi, mr)
  // ══════════════════════════════════════════════════════════════════
  var R = {
    _n: function (n) { return (n || 0).toLocaleString('en-IN'); },

    getCropDisplayName: function (cropId, lang) {
      if (CROP_NAMES[cropId] && CROP_NAMES[cropId][lang]) return CROP_NAMES[cropId][lang];
      var c = KrishiSahayakData.getCrop(cropId);
      return c ? c.name : cropId;
    },

    welcome: function (lang) {
      lang = lang || 'mr';
      if (lang === 'mr') {
        return {
          html: '<div><p style="margin-bottom:10px;">नमस्कार! 👋 मी <strong>कृषी सहायक</strong>. मी तुम्हाला शेतमालाच्या विक्रीबाबत योग्य व फायदेशीर निर्णय घेण्यास मदत करतो.</p>' +
            '<p style="font-size:12.5px;color:#6F7F75;margin-bottom:12px;">मी तुम्हाला पीक <strong>कुठे, केव्हा आणि कोणाला विकावे</strong> आणि निव्वळ नफा किती मिळेल हे सांगू शकतो.</p></div>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="माझे पीक कुठे विकावे?">📍 कुठे विकावे?</button>' +
            '<button class="ks-quick-btn" data-query="आजचे बाजारभाव सांगा">📊 बाजारभाव</button>' +
            '<button class="ks-quick-btn" data-query="आता विकू की थांबू?">📈 आता विकू की थांबू?</button>' +
            '<button class="ks-quick-btn" data-query="मला खरेदीदार शोधा">🤝 खरेदीदार शोधा</button>' +
            '<button class="ks-quick-btn" data-query="वाहतूक खर्च किती येईल?">🚚 वाहतूक खर्च</button>' +
            '<button class="ks-quick-btn" data-query="निव्वळ नफा किती मिळेल?">💰 निव्वळ नफा</button>' +
            '</div>'
        };
      } else if (lang === 'hi') {
        return {
          html: '<div><p style="margin-bottom:10px;">नमस्ते! 👋 मैं <strong>कृषि सहायक</strong> हूँ। मैं फसल बेचने के सही और लाभदायक निर्णय लेने में आपकी मदद करता हूँ।</p>' +
            '<p style="font-size:12.5px;color:#6F7F75;margin-bottom:12px;">मैं आपको फसल <strong>कहाँ, कब और किसे बेचें</strong> और कितना शुद्ध लाभ मिलेगा, यह बता सकता हूँ।</p></div>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="मेरी फसल कहाँ बेचूं?">📍 कहाँ बेचें?</button>' +
            '<button class="ks-quick-btn" data-query="आज के मंडी भाव बताओ">📊 मंडी भाव</button>' +
            '<button class="ks-quick-btn" data-query="अभी बेचूं या रुकूं?">📈 अभी बेचूं या रुकूं?</button>' +
            '<button class="ks-quick-btn" data-query="मुझे खरीदार ढूंढो">🤝 खरीदार ढूंढें</button>' +
            '<button class="ks-quick-btn" data-query="परिवहन खर्च कितना आएगा?">🚚 परिवहन खर्च</button>' +
            '<button class="ks-quick-btn" data-query="शुद्ध मुनाफा कितना मिलेगा?">💰 शुद्ध मुनाफा</button>' +
            '</div>'
        };
      } else {
        return {
          html: '<div><p style="margin-bottom:10px;">Namaste! 👋 I\'m <strong>Krishi Sahayak</strong>. I can help you make smarter decisions about selling your crops.</p>' +
            '<p style="font-size:12.5px;color:#6F7F75;margin-bottom:12px;">I can help you decide <strong>Where, When, and Whom</strong> to sell — and estimate your net return.</p></div>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="Where should I sell my crop?">📍 Where should I sell?</button>' +
            '<button class="ks-quick-btn" data-query="Compare today\'s mandi prices">📊 Compare mandi prices</button>' +
            '<button class="ks-quick-btn" data-query="Should I sell now or wait?">📈 Sell now or wait?</button>' +
            '<button class="ks-quick-btn" data-query="Find buyers for my crop">🤝 Find buyers</button>' +
            '<button class="ks-quick-btn" data-query="Find transport options">🚚 Find transport</button>' +
            '<button class="ks-quick-btn" data-query="Calculate my expected net return">💰 Calculate net return</button>' +
            '</div>'
        };
      }
    },

    askingCrop: function (lang) {
      lang = lang || 'mr';
      var pills = KS_DATA.crops.slice(0, 8).map(function (c) {
        var name = CROP_NAMES[c.id] && CROP_NAMES[c.id][lang] ? CROP_NAMES[c.id][lang] : c.name;
        return '<button class="ks-quick-btn" data-query="' + name + '">' + name + '</button>';
      }).join('');

      var text = lang === 'mr'
        ? '<p>मी तुम्हाला सर्वोत्तम विक्री बाजार शोधून देऊ शकतो! 🌾</p><p style="margin:8px 0 10px;font-size:12.5px;color:#6F7F75;">तुम्ही कोणते पीक विकू इच्छिता?</p>'
        : (lang === 'hi'
          ? '<p>मैं आपको सबसे अच्छा बिक्री अवसर ढूंढने में मदद कर सकता हूँ! 🌾</p><p style="margin:8px 0 10px;font-size:12.5px;color:#6F7F75;">आप कौन सी फसल बेचना चाहते हैं?</p>'
          : '<p>I can help you find the best selling opportunity! 🌾</p><p style="margin:8px 0 10px;font-size:12.5px;color:#6F7F75;">Which crop are you planning to sell?</p>');

      return { html: text + '<div class="ks-quick-actions">' + pills + '</div>' };
    },

    whereSell: function (cropId, quantityQ, grade, lang) {
      lang = lang || 'mr';
      var crop = KrishiSahayakData.getCrop(cropId);
      if (!crop) return R.generic(lang);
      var rankings = KrishiSahayakData.getMandiRankings(cropId, quantityQ);
      var top3 = rankings.slice(0, 3);
      var medals = ['🥇', '🥈', '🥉'];
      var cardCls = ['ks-market-card--gold', 'ks-market-card--silver', 'ks-market-card--bronze'];
      var n = R._n;
      var cName = R.getCropDisplayName(cropId, lang);
      var gradeDisplay = grade || (lang === 'mr' ? 'प्रत अ' : (lang === 'hi' ? 'ग्रेड ए' : 'Standard'));

      var badgeLabels = {
        mr: ['सर्वोत्तम पर्याय', '२रा पर्याय', '३रा पर्याय'],
        hi: ['सर्वोत्तम विकल्प', 'दूसरा विकल्प', 'तीसरा विकल्प'],
        en: ['Best Option', '2nd Option', '3rd Option']
      }[lang] || ['Best Option', '2nd Option', '3rd Option'];

      var rowLabels = {
        mr: { price: 'बाजारभाव', dist: 'अंतर', transport: 'वाहतूक खर्च', demand: 'मागणी', net: 'निव्वळ नफा', details: 'तपशील पहा' },
        hi: { price: 'मंडी भाव', dist: 'दूरी', transport: 'परिवहन खर्च', demand: 'मांग', net: 'शुद्ध मुनाफा', details: 'विवरण देखें' },
        en: { price: 'Price', dist: 'Distance', transport: 'Est. Transport', demand: 'Buyer Demand', net: 'Est. Net Return', details: 'View Details' }
      }[lang];

      var cards = top3.map(function (m, i) {
        var demandLabel = m.demandLevel === 'High' ? (lang === 'mr' ? '🔥 जास्त' : (lang === 'hi' ? '🔥 उच्च' : '🔥 High')) : '📊 ' + m.demandLevel;
        return '<div class="ks-market-card ' + cardCls[i] + '" style="margin-bottom:8px;">' +
          '<div class="ks-market-card__header"><span class="ks-market-card__rank">' + medals[i] + ' ' + m.name + '</span><span class="ks-market-card__badge">' + badgeLabels[i] + '</span></div>' +
          '<div class="ks-market-card__body">' +
          '<div class="ks-market-card__row"><span class="ks-market-card__row-label">💰 ' + rowLabels.price + '</span><span class="ks-market-card__row-val">₹' + n(m.pricePerQ) + '/q</span></div>' +
          '<div class="ks-market-card__row"><span class="ks-market-card__row-label">📍 ' + rowLabels.dist + '</span><span class="ks-market-card__row-val">' + m.distKm + ' km</span></div>' +
          '<div class="ks-market-card__row"><span class="ks-market-card__row-label">🚚 ' + rowLabels.transport + '</span><span class="ks-market-card__row-val">₹' + n(m.transportTotal) + '</span></div>' +
          '<div class="ks-market-card__row"><span class="ks-market-card__row-label">📈 ' + rowLabels.demand + '</span><span class="ks-market-card__row-val">' + demandLabel + '</span></div>' +
          '<div class="ks-market-card__net"><span class="ks-market-card__net-label">' + rowLabels.net + '</span><span class="ks-market-card__net-val">₹' + n(m.netReturn) + '</span></div>' +
          '</div>' +
          '<div class="ks-market-card__footer"><a href="mandi-compare.html" class="ks-msg-action-btn" style="flex:1;justify-content:center;">' + rowLabels.details + '</a></div>' +
          '</div>';
      }).join('');

      var best = top3[0], second = top3[1];
      var insight = '';
      if (second) {
        var priceDiff = Math.abs(second.pricePerQ - best.pricePerQ);
        if (lang === 'mr') {
          insight = '<p style="margin:10px 0 6px;font-size:12.5px;color:#6F7F75;">💡 जरी <strong>' + second.name + '</strong> मध्ये ₹' + n(priceDiff) + '/क्विंटल भाव जास्त असला, तरी वाहतूक खर्च वजा जाता <strong>' + best.name + '</strong> मध्ये सर्वाधिक निव्वळ नफा मिळतो.</p>';
        } else if (lang === 'hi') {
          insight = '<p style="margin:10px 0 6px;font-size:12.5px;color:#6F7F75;">💡 हालांकि <strong>' + second.name + '</strong> में ₹' + n(priceDiff) + '/क्विंटल अधिक भाव है, लेकिन परिवहन लागत घटाने के बाद <strong>' + best.name + '</strong> में सबसे ज्यादा शुद्ध मुनाफा होगा।</p>';
        } else {
          insight = '<p style="margin:10px 0 6px;font-size:12.5px;color:#6F7F75;">💡 Although <strong>' + second.name + '</strong> offers ₹' + n(priceDiff) + '/q higher rate, <strong>' + best.name + '</strong> provides a better net return after transport costs.</p>';
        }
      }

      var headerText = lang === 'mr'
        ? 'उपलब्ध बाजार समिती आकडेवारीनुसार, तुमच्या <strong>' + cName + ' (' + quantityQ + ' क्विंटल, ' + gradeDisplay + ')</strong> साठी सर्वोत्तम बाजारपेठा:'
        : (lang === 'hi'
          ? 'उपलब्ध मंडी डेटा के आधार पर, आपके <strong>' + cName + ' (' + quantityQ + ' क्विंटल, ' + gradeDisplay + ')</strong> के लिए शीर्ष मंडियां:'
          : 'Based on available APMC market data, here are the top markets for your <strong>' + cName + ' (' + quantityQ + 'q, ' + gradeDisplay + ')</strong>:');

      var noteText = lang === 'mr'
        ? '* उपलब्ध एपीएमसी बाजारभाव माहितीवर आधारित. अंतिम निर्णय तुमचा आहे.'
        : (lang === 'hi'
          ? '* उपलब्ध एपीएमसी मंडी भाव डेटा पर आधारित। अंतिम निर्णय आपका है।'
          : '* Estimated values based on available APMC data. Final decision is yours.');

      var fullCompBtn = lang === 'mr' ? '📊 संपूर्ण तुलना पहा' : (lang === 'hi' ? '📊 विस्तृत तुलना' : '📊 Full Comparison');
      var findBuyerBtn = lang === 'mr' ? '🤝 खरेदीदार शोधा' : (lang === 'hi' ? '🤝 खरीदार ढूंढें' : '🤝 Find Buyers');

      return {
        html: '<p style="margin-bottom:10px;">' + headerText + '</p>' +
          cards + insight +
          '<p class="ks-msg-note">' + noteText + '</p>' +
          '<div class="ks-msg-actions"><a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">' + fullCompBtn + '</a>' +
          '<button class="ks-quick-btn" data-query="' + findBuyerBtn + '">' + findBuyerBtn + '</button></div>'
      };
    },

    transport: function (distKm, quantityQ, mandiName, lang) {
      lang = lang || 'mr';
      var d = distKm || 45;
      var q = quantityQ || 10;
      var est = KrishiSahayakData.getTransportEstimate(d, q);
      var n = R._n;
      var destTitle = mandiName ? mandiName : (d + ' km');

      var header = lang === 'mr'
        ? '🚚 <strong>' + destTitle + '</strong> साठी अंदाजे वाहतूक खर्च तपशील (' + q + ' क्विंटल):'
        : (lang === 'hi'
          ? '🚚 <strong>' + destTitle + '</strong> के लिए अनुमानित परिवहन खर्च (' + q + ' क्विंटल):'
          : '🚚 Estimated transport cost breakdown for <strong>' + destTitle + '</strong> (' + q + ' quintals):');

      var tTrucks = lang === 'mr' ? 'आवश्यक ट्रक' : (lang === 'hi' ? 'आवश्यक ट्रक' : 'Trucks Required');
      var tRate = lang === 'mr' ? 'अंदाजे दर' : (lang === 'hi' ? 'अनुमानित दर' : 'Est. Rate');
      var tTotal = lang === 'mr' ? 'एकूण वाहतूक खर्च' : (lang === 'hi' ? 'कुल भाड़ा' : 'Total Freight');
      var tPerQ = lang === 'mr' ? 'प्रति क्विंटल खर्च' : (lang === 'hi' ? 'प्रति क्विंटल' : 'Per Quintal');
      var tBook = lang === 'mr' ? '🚚 वाहतूक व्यवस्था करा' : (lang === 'hi' ? '🚚 वाहन बुक करें' : '🚚 Arrange Transport');

      return {
        html: '<p style="margin-bottom:10px;">' + header + '</p>' +
          '<div class="ks-transport-card">' +
          '<div class="ks-transport-card__header"><span class="ks-transport-card__icon">🚛</span><span class="ks-transport-card__title">' + destTitle + ' (' + est.distKm + ' km, ' + q + 'q)</span></div>' +
          '<div class="ks-transport-card__rows">' +
          '<div class="ks-transport-card__row"><span class="ks-transport-card__row-label">' + tTrucks + '</span><span class="ks-transport-card__row-val">' + est.trucks + ' truck</span></div>' +
          '<div class="ks-transport-card__row"><span class="ks-transport-card__row-label">' + tRate + '</span><span class="ks-transport-card__row-val">₹28/km/truck</span></div>' +
          '<div class="ks-transport-card__row"><span class="ks-transport-card__row-label">' + tTotal + '</span><span class="ks-transport-card__row-val" style="color:#12372A;">₹' + n(est.total) + '</span></div>' +
          '<div class="ks-transport-card__row"><span class="ks-transport-card__row-label">' + tPerQ + '</span><span class="ks-transport-card__row-val">₹' + n(est.ratePerQ) + '/q</span></div>' +
          '</div></div>' +
          '<p class="ks-msg-note">* वाहनानुसार व मार्गानुसार दरात फरक असू शकतो.</p>' +
          '<div class="ks-msg-actions"><a href="dashboard.html" class="ks-msg-action-btn ks-msg-action-btn--primary">' + tBook + '</a></div>'
      };
    },

    findBuyers: function (cropId, lang) {
      lang = lang || 'mr';
      var buyers = KrishiSahayakData.getBuyersForCrop(cropId);
      var cName = R.getCropDisplayName(cropId, lang);
      if (!buyers.length) {
        var notFound = lang === 'mr'
          ? 'सध्या <strong>' + cName + '</strong> साठी थेट खरेदीदार उपलब्ध नाहीत.'
          : (lang === 'hi'
            ? 'वर्तमान में <strong>' + cName + '</strong> के लिए सत्यापित खरीदार उपलब्ध नहीं हैं।'
            : 'I couldn\'t find specific buyers for <strong>' + cName + '</strong> in the current data.');
        return {
          html: '<p>' + notFound + '</p><div class="ks-msg-actions"><a href="buyers.html" class="ks-msg-action-btn ks-msg-action-btn--primary">🤝 View All Buyers</a></div>'
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

      var title = lang === 'mr'
        ? '🤝 <strong>' + cName + '</strong> साठी <strong>' + buyers.length + ' पडताळणी केलेले खरेदीदार</strong> उपलब्ध आहेत:'
        : (lang === 'hi'
          ? '🤝 <strong>' + cName + '</strong> के लिए <strong>' + buyers.length + ' सत्यापित खरीदार</strong> उपलब्ध हैं:'
          : '🤝 Found <strong>' + buyers.length + ' verified buyers</strong> for <strong>' + cName + '</strong>:');

      var betterBtn = lang === 'mr' ? 'कोणता खरेदीदार चांगला आहे?' : (lang === 'hi' ? 'कौनसा खरीदार अच्छा है?' : 'Which buyer is better?');

      return {
        html: '<p style="margin-bottom:10px;">' + title + '</p>' +
          cards +
          '<p class="ks-msg-note">* खरेदीदारांशी थेट संपर्क साधून सध्याची मागणी तपासा.</p>' +
          '<div class="ks-msg-actions">' +
          '<a href="buyers.html" class="ks-msg-action-btn ks-msg-action-btn--primary">🤝 सर्व खरेदीदार पहा</a>' +
          '<button class="ks-quick-btn" data-query="' + betterBtn + '">⭐ ' + betterBtn + '</button>' +
          '</div>'
      };
    },

    whichBuyerBetter: function (cropId, lang) {
      lang = lang || 'mr';
      var buyers = KrishiSahayakData.getBuyersForCrop(cropId || 'tomato');
      var bestBuyer = (buyers && buyers.length) ? buyers[0] : KS_DATA.buyers[1];
      if (buyers && buyers.length > 1) {
        bestBuyer = buyers.slice().sort(function (a, b) {
          var pa = parseInt(a.offerPrice.replace(/[^0-9]/g, '')) || 0;
          var pb = parseInt(b.offerPrice.replace(/[^0-9]/g, '')) || 0;
          return pb - pa;
        })[0];
      }
      var cName = R.getCropDisplayName(cropId || 'tomato', lang);

      if (lang === 'mr') {
        return {
          html: '<p style="margin-bottom:10px;">🤝 <strong>' + cName + '</strong> साठी उपलब्ध खरेदीदारांपैकी <strong>' + bestBuyer.name + '</strong> हा सर्वोत्तम पर्याय आहे:</p>' +
            '<div class="ks-buyer-card">' +
            '<div class="ks-buyer-card__top"><div class="ks-buyer-card__avatar">🏢</div>' +
            '<div><div class="ks-buyer-card__name">' + bestBuyer.name + ' <span style="color:#2D6A4F;font-size:11px;">✓ सर्वोत्तम दर</span></div>' +
            '<div class="ks-buyer-card__verified">' + bestBuyer.rating + ' · ' + bestBuyer.deals + '</div></div></div>' +
            '<div class="ks-buyer-card__meta">' +
            '<span class="ks-buyer-card__meta-item">📍 ' + bestBuyer.distance + '</span>' +
            '<span class="ks-buyer-card__meta-item">📦 किमान: ' + bestBuyer.minQty + '</span>' +
            '<span class="ks-buyer-card__meta-item">💳 ' + bestBuyer.paymentDays + '</span></div>' +
            '<div class="ks-buyer-card__price">' + bestBuyer.offerPrice + '</div></div>' +
            '<p style="margin-top:10px;font-size:13px;color:#17221D;">हा खरेदीदार <strong>सर्वाधिक खरेदी भाव (' + bestBuyer.offerPrice + ')</strong> आणि <strong>सुरक्षित हमी पेमेंट (' + bestBuyer.paymentDays + ')</strong> देत असल्याने सर्वाधिक फायदेशीर ठरतो.</p>' +
            '<div class="ks-msg-actions"><a href="buyers.html" class="ks-msg-action-btn ks-msg-action-btn--primary">🤝 थेट संपर्क करा</a></div>'
        };
      } else if (lang === 'hi') {
        return {
          html: '<p style="margin-bottom:10px;">🤝 <strong>' + cName + '</strong> के लिए उपलब्ध खरीदारों में <strong>' + bestBuyer.name + '</strong> सबसे अच्छा विकल्प है:</p>' +
            '<div class="ks-buyer-card">' +
            '<div class="ks-buyer-card__top"><div class="ks-buyer-card__avatar">🏢</div>' +
            '<div><div class="ks-buyer-card__name">' + bestBuyer.name + ' <span style="color:#2D6A4F;font-size:11px;">✓ सर्वोत्तम भाव</span></div>' +
            '<div class="ks-buyer-card__verified">' + bestBuyer.rating + ' · ' + bestBuyer.deals + '</div></div></div>' +
            '<div class="ks-buyer-card__meta">' +
            '<span class="ks-buyer-card__meta-item">📍 ' + bestBuyer.distance + '</span>' +
            '<span class="ks-buyer-card__meta-item">📦 न्यूनतम: ' + bestBuyer.minQty + '</span>' +
            '<span class="ks-buyer-card__meta-item">💳 ' + bestBuyer.paymentDays + '</span></div>' +
            '<div class="ks-buyer-card__price">' + bestBuyer.offerPrice + '</div></div>' +
            '<p style="margin-top:10px;font-size:13px;color:#17221D;">यह खरीदार <strong>उच्चतम खरीद दर (' + bestBuyer.offerPrice + ')</strong> और <strong>' + bestBuyer.paymentDays + '</strong> का सुरक्षित भुगतान प्रदान करता है।</p>' +
            '<div class="ks-msg-actions"><a href="buyers.html" class="ks-msg-action-btn ks-msg-action-btn--primary">🤝 संपर्क करें</a></div>'
        };
      } else {
        return {
          html: '<p style="margin-bottom:10px;">🤝 Among the available buyers for your <strong>' + cName + '</strong>, <strong>' + bestBuyer.name + '</strong> is currently the best choice:</p>' +
            '<div class="ks-buyer-card">' +
            '<div class="ks-buyer-card__top"><div class="ks-buyer-card__avatar">🏢</div>' +
            '<div><div class="ks-buyer-card__name">' + bestBuyer.name + ' <span style="color:#2D6A4F;font-size:11px;">✓ Top Rate</span></div>' +
            '<div class="ks-buyer-card__verified">' + bestBuyer.rating + ' · ' + bestBuyer.deals + '</div></div></div>' +
            '<div class="ks-buyer-card__meta">' +
            '<span class="ks-buyer-card__meta-item">📍 ' + bestBuyer.distance + '</span>' +
            '<span class="ks-buyer-card__meta-item">📦 Min: ' + bestBuyer.minQty + '</span>' +
            '<span class="ks-buyer-card__meta-item">💳 ' + bestBuyer.paymentDays + '</span></div>' +
            '<div class="ks-buyer-card__price">' + bestBuyer.offerPrice + '</div></div>' +
            '<p style="margin-top:10px;font-size:13px;color:#17221D;">This buyer offers the <strong>highest price (' + bestBuyer.offerPrice + ')</strong> with <strong>' + bestBuyer.paymentDays + '</strong> and verified Escrow security.</p>' +
            '<div class="ks-msg-actions"><a href="buyers.html" class="ks-msg-action-btn ks-msg-action-btn--primary">🤝 Contact Buyer</a></div>'
        };
      }
    },

    whyRecommended: function (mandiName, cropId, quantityQ, lang) {
      lang = lang || 'mr';
      var rankings = KrishiSahayakData.getMandiRankings(cropId, quantityQ);
      var mandi = null;
      var qWord = (mandiName || '').toLowerCase().trim();
      for (var i = 0; i < rankings.length; i++) {
        var rName = rankings[i].name.toLowerCase();
        if (rName.indexOf(qWord.split(' ')[0]) !== -1 || (qWord.indexOf('vashi') !== -1 && (rName.indexOf('vashi') !== -1 || rName.indexOf('mumbai') !== -1))) {
          mandi = rankings[i]; break;
        }
      }
      if (!mandi) mandi = rankings[0];
      var crop = KrishiSahayakData.getCrop(cropId);
      if (!mandi || !crop) return R.generic(lang);
      var n = R._n;
      var cName = R.getCropDisplayName(cropId, lang);
      var demandLabel = mandi.demandLevel === 'High' ? (lang === 'mr' ? '🔥 जास्त' : '🔥 High') : '📊 ' + mandi.demandLevel;

      if (lang === 'mr') {
        return {
          html: '<p style="margin-bottom:10px;">तुमच्या <strong>' + cName + '</strong> साठी <strong>' + mandi.name + '</strong> का सर्वोत्तम आहे:</p>' +
            '<div class="ks-market-card ks-market-card--gold">' +
            '<div class="ks-market-card__header"><span class="ks-market-card__rank">⭐ ' + mandi.name + '</span><span class="ks-market-card__badge">सर्वोत्तम पर्याय</span></div>' +
            '<div class="ks-market-card__body">' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">💰 विक्री भाव</span><span class="ks-market-card__row-val">₹' + n(mandi.pricePerQ) + '/क्विंटल</span></div>' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">📍 अंतर</span><span class="ks-market-card__row-val">' + mandi.distKm + ' किमी</span></div>' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">🚚 वाहतूक खर्च</span><span class="ks-market-card__row-val">₹' + n(mandi.transportTotal) + '</span></div>' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">📈 खरेदीदार मागणी</span><span class="ks-market-card__row-val">' + demandLabel + '</span></div>' +
            '<div class="ks-market-card__net"><span class="ks-market-card__net-label">निव्वळ अंदाजे नफा</span><span class="ks-market-card__net-val">₹' + n(mandi.netReturn) + '</span></div>' +
            '</div></div>' +
            '<p style="margin-top:10px;font-size:13px;color:#17221D;">वाहतूक खर्च वजा जाता ही बाजारपेठ तुम्हाला <strong>सर्वाधिक निव्वळ परतावा (₹' + n(mandi.netReturn) + ')</strong> देते.</p>' +
            '<div class="ks-msg-actions"><a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">📊 सविस्तर तुलना पहा</a></div>'
        };
      } else if (lang === 'hi') {
        return {
          html: '<p style="margin-bottom:10px;">आपके <strong>' + cName + '</strong> के लिए <strong>' + mandi.name + '</strong> क्यों अनुशंसित है:</p>' +
            '<div class="ks-market-card ks-market-card--gold">' +
            '<div class="ks-market-card__header"><span class="ks-market-card__rank">⭐ ' + mandi.name + '</span><span class="ks-market-card__badge">अनुशंसित</span></div>' +
            '<div class="ks-market-card__body">' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">💰 मंडी भाव</span><span class="ks-market-card__row-val">₹' + n(mandi.pricePerQ) + '/क्विंटल</span></div>' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">📍 दूरी</span><span class="ks-market-card__row-val">' + mandi.distKm + ' किमी</span></div>' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">🚚 परिवहन लागत</span><span class="ks-market-card__row-val">₹' + n(mandi.transportTotal) + '</span></div>' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">📈 खरीदार मांग</span><span class="ks-market-card__row-val">' + demandLabel + '</span></div>' +
            '<div class="ks-market-card__net"><span class="ks-market-card__net-label">अनुमानित शुद्ध लाभ</span><span class="ks-market-card__net-val">₹' + n(mandi.netReturn) + '</span></div>' +
            '</div></div>' +
            '<p style="margin-top:10px;font-size:13px;color:#17221D;">परिवहन खर्च घटाने के बाद यह मंडी आपको <strong>सर्वाधिक शुद्ध मुनाफा</strong> प्रदान करती है।</p>' +
            '<div class="ks-msg-actions"><a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">📊 विस्तृत तुलना देखें</a></div>'
        };
      } else {
        return {
          html: '<p style="margin-bottom:10px;">Here\'s why <strong>' + mandi.name + '</strong> is recommended for your <strong>' + cName + '</strong>:</p>' +
            '<div class="ks-market-card ks-market-card--gold">' +
            '<div class="ks-market-card__header"><span class="ks-market-card__rank">⭐ ' + mandi.name + '</span><span class="ks-market-card__badge">Recommended</span></div>' +
            '<div class="ks-market-card__body">' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">💰 Selling Price</span><span class="ks-market-card__row-val">₹' + n(mandi.pricePerQ) + '/q</span></div>' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">📍 Distance</span><span class="ks-market-card__row-val">' + mandi.distKm + ' km</span></div>' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">🚚 Transport Cost</span><span class="ks-market-card__row-val">₹' + n(mandi.transportTotal) + '</span></div>' +
            '<div class="ks-market-card__row"><span class="ks-market-card__row-label">📈 Buyer Demand</span><span class="ks-market-card__row-val">' + demandLabel + '</span></div>' +
            '<div class="ks-market-card__net"><span class="ks-market-card__net-label">Estimated Net Return</span><span class="ks-market-card__net-val">₹' + n(mandi.netReturn) + '</span></div>' +
            '</div></div>' +
            '<p style="margin-top:10px;font-size:13px;color:#17221D;">This market provides the <strong>highest estimated net return</strong> after transport costs and buyer demand.</p>' +
            '<div class="ks-msg-actions"><a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">📊 View Detailed Comparison</a></div>'
        };
      }
    },

    priceCheck: function (cropId, quantityQ, lang) {
      lang = lang || 'mr';
      var n = R._n;
      var singleCrop = cropId ? KrishiSahayakData.getCrop(cropId) : null;

      if (singleCrop) {
        var cName = R.getCropDisplayName(cropId, lang);
        var basePrice = singleCrop.price;
        var col = singleCrop.dir === 'up' ? '#2D6A4F' : '#DC2626';
        var arrow = singleCrop.dir === 'up' ? '↑' : '↓';

        // Mandi breakdown from available KS_DATA.mandis
        var mandiRows = KS_DATA.mandis.map(function (m) {
          var p = Math.round(basePrice * m.priceMultiplier);
          return '<div class="ks-market-card__row">' +
            '<span class="ks-market-card__row-label">📍 ' + m.name + '</span>' +
            '<span class="ks-market-card__row-val">₹' + n(p) + '/q</span>' +
            '</div>';
        }).join('');

        var qInfo = quantityQ ? '<div class="ks-market-card__net" style="margin-top:8px;"><span class="ks-market-card__net-label">' + (lang === 'mr' ? 'एकूण अंदाजे मूल्य (' + quantityQ + ' क्विंटल)' : (lang === 'hi' ? 'अनुमानित कुल मूल्य (' + quantityQ + ' क्विंटल)' : 'Est. Gross Value (' + quantityQ + 'q)')) + '</span><span class="ks-market-card__net-val">₹' + n(basePrice * quantityQ) + '</span></div>' : '';

        if (lang === 'mr') {
          return {
            html: '<p style="margin-bottom:6px;">🧅 <strong>' + cName + 'चे बाजारभाव</strong></p>' +
              '<p style="font-size:12.5px;color:#6F7F75;margin-bottom:10px;">सध्या उपलब्ध बाजार डेटानुसार ' + cName + 'च्या किंमती बाजारानुसार बदलत आहेत:</p>' +
              '<div class="ks-market-card" style="padding:10px 12px;margin-bottom:10px;">' +
              '<div class="ks-market-card__row" style="font-weight:700;border-bottom:1px solid #E8EFE9;padding-bottom:6px;margin-bottom:6px;">' +
              '<span class="ks-market-card__row-label">सरासरी एपीएमसी दर</span>' +
              '<span class="ks-market-card__row-val" style="color:' + col + ';">₹' + n(basePrice) + '/q ' + arrow + ' ' + singleCrop.change + '%</span>' +
              '</div>' +
              mandiRows + qInfo +
              '</div>' +
              '<p style="font-size:12.5px;color:#17221D;margin-bottom:10px;">💡 तुम्हाला हवे असल्यास मी <strong>वाशी APMC</strong> सहित उपलब्ध बाजारांची तुलना करून कुठे चांगला भाव व निव्वळ नफा मिळू शकतो तेही सांगू शकतो.</p>' +
              '<div class="ks-msg-actions">' +
              '<button class="ks-quick-btn" data-query="माझा ' + cName + ' कुठे विकावा?">📍 कुठे विकावा?</button>' +
              '<button class="ks-quick-btn" data-query="' + cName + 'साठी खरेदीदार शोधा">🤝 खरेदीदार शोधा</button>' +
              '<a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">📊 सविस्तर तुलना पहा</a>' +
              '</div>'
          };
        } else if (lang === 'hi') {
          return {
            html: '<p style="margin-bottom:6px;">🧅 <strong>' + cName + ' के मंडी भाव</strong></p>' +
              '<p style="font-size:12.5px;color:#6F7F75;margin-bottom:10px;">उपलब्ध मंडी डेटा के अनुसार ' + cName + ' की कीमतें मंडियों के अनुसार इस प्रकार हैं:</p>' +
              '<div class="ks-market-card" style="padding:10px 12px;margin-bottom:10px;">' +
              '<div class="ks-market-card__row" style="font-weight:700;border-bottom:1px solid #E8EFE9;padding-bottom:6px;margin-bottom:6px;">' +
              '<span class="ks-market-card__row-label">औसत मंडी भाव</span>' +
              '<span class="ks-market-card__row-val" style="color:' + col + ';">₹' + n(basePrice) + '/q ' + arrow + ' ' + singleCrop.change + '%</span>' +
              '</div>' +
              mandiRows + qInfo +
              '</div>' +
              '<p style="font-size:12.5px;color:#17221D;margin-bottom:10px;">💡 यदि आप चाहें तो मैं <strong>वाशी APMC</strong> सहित उपलब्ध मंडियों की तुलना करके बता सकता हूँ कि कहाँ सबसे अच्छा भाव मिलेगा।</p>' +
              '<div class="ks-msg-actions">' +
              '<button class="ks-quick-btn" data-query="कहाँ बेचूं?">📍 कहाँ बेचें?</button>' +
              '<button class="ks-quick-btn" data-query="खरीदार ढूंढो">🤝 खरीदार ढूंढें</button>' +
              '<a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">📊 विस्तृत तुलना देखें</a>' +
              '</div>'
          };
        } else {
          return {
            html: '<p style="margin-bottom:6px;">🧅 <strong>Market Prices for ' + cName + '</strong></p>' +
              '<p style="font-size:12.5px;color:#6F7F75;margin-bottom:10px;">Based on available market data, current ' + cName.toLowerCase() + ' rates across mandis are:</p>' +
              '<div class="ks-market-card" style="padding:10px 12px;margin-bottom:10px;">' +
              '<div class="ks-market-card__row" style="font-weight:700;border-bottom:1px solid #E8EFE9;padding-bottom:6px;margin-bottom:6px;">' +
              '<span class="ks-market-card__row-label">Average APMC Price</span>' +
              '<span class="ks-market-card__row-val" style="color:' + col + ';">₹' + n(basePrice) + '/q ' + arrow + ' ' + singleCrop.change + '%</span>' +
              '</div>' +
              mandiRows + qInfo +
              '</div>' +
              '<p style="font-size:12.5px;color:#17221D;margin-bottom:10px;">💡 If you wish, I can compare available markets including <strong>Vashi APMC</strong> to show where you get the highest net return.</p>' +
              '<div class="ks-msg-actions">' +
              '<button class="ks-quick-btn" data-query="Where should I sell my crop?">📍 Where should I sell?</button>' +
              '<button class="ks-quick-btn" data-query="Find buyers for my crop">🤝 Find buyers</button>' +
              '<a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">📊 Full Comparison</a>' +
              '</div>'
          };
        }
      }

      // General market prices across crops
      var targets = KS_DATA.crops.slice(0, 6);
      var rows = targets.map(function (c) {
        var col = c.dir === 'up' ? '#2D6A4F' : '#DC2626';
        var arrow = c.dir === 'up' ? '↑' : '↓';
        var name = CROP_NAMES[c.id] && CROP_NAMES[c.id][lang] ? CROP_NAMES[c.id][lang] : c.name;
        return '<div class="ks-market-card__row"><span class="ks-market-card__row-label">' + name + '</span>' +
          '<span class="ks-market-card__row-val" style="display:flex;gap:8px;align-items:center;">₹' + n(c.price) + '/q ' +
          '<span style="font-size:11px;color:' + col + ';font-weight:700;">' + arrow + ' ' + c.change + '%</span></span></div>';
      }).join('');

      var title = lang === 'mr'
        ? '📊 <strong>आजचे प्रमुख बाजारभाव</strong><br><span style="font-size:12px;color:#6F7F75;">सध्या उपलब्ध बाजार समिती आकडेवारीनुसार:</span>'
        : (lang === 'hi'
          ? '📊 <strong>आज के प्रमुख मंडी भाव</strong><br><span style="font-size:12px;color:#6F7F75;">उपलब्ध मंडी आंकड़ों के अनुसार:</span>'
          : '📊 <strong>Today\'s Major Market Prices</strong><br><span style="font-size:12px;color:#6F7F75;">Based on available APMC market data:</span>');

      var subHint = lang === 'mr'
        ? '<p style="margin-top:10px;font-size:12.5px;color:#17221D;">विशिष्ट पिकाचा भाव जाणून घेण्यासाठी पिकाचे नाव सांगा (उदा. <em>"कांद्याचा भाव सांगा"</em> किंवा <em>"टोमॅटोचा भाव काय आहे"</em>).</p>'
        : (lang === 'hi'
          ? '<p style="margin-top:10px;font-size:12.5px;color:#17221D;">विशिष्ट फसल का भाव जानने के लिए फसल का नाम बताएं (जैसे: <em>"प्याज का भाव बताओ"</em>)।</p>'
          : '<p style="margin-top:10px;font-size:12.5px;color:#17221D;">To check a specific crop, ask with the crop name (e.g., <em>"What is the onion price?"</em>).</p>');

      return {
        html: '<p style="margin-bottom:8px;">' + title + '</p>' +
          '<div class="ks-market-card" style="padding:10px 12px;">' + rows + '</div>' +
          subHint +
          '<p class="ks-msg-note">* उपलब्ध एपीएमसी बाजारभाव माहितीवर आधारित. प्रत्यक्ष दरात फरक असू शकतो.</p>' +
          '<div class="ks-msg-actions"><a href="mandi-compare.html" class="ks-msg-action-btn ks-msg-action-btn--primary">📊 सविस्तर तुलना पहा</a><a href="market.html" class="ks-msg-action-btn">📈 सर्व बाजारभाव</a></div>'
      };
    },

    lotAcknowledged: function (cropId, quantityQ, lang) {
      lang = lang || 'mr';
      var cName = R.getCropDisplayName(cropId, lang);
      var qKg = quantityQ * 100;

      if (lang === 'mr') {
        return {
          html: '<p style="margin-bottom:8px;">मी नोंद घेतली आहे: <strong>' + cName + ' (' + quantityQ + ' क्विंटल / ' + qKg + ' किलो)</strong>. 🌾</p>' +
            '<p style="font-size:13px;color:#17221D;margin-bottom:12px;">तुम्हाला या पिकाबद्दल काय जाणून घ्यायचे आहे?</p>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="' + cName + 'चा भाव काय चालू आहे?">📊 ' + cName + 'चा भाव</button>' +
            '<button class="ks-quick-btn" data-query="कुठे विकावा?">📍 कुठे विकावा?</button>' +
            '<button class="ks-quick-btn" data-query="मला खरेदीदार शोधा">🤝 खरेदीदार शोधा</button>' +
            '<button class="ks-quick-btn" data-query="वाहतूक खर्च किती येईल?">🚚 वाहतूक खर्च</button>' +
            '</div>'
        };
      } else if (lang === 'hi') {
        return {
          html: '<p style="margin-bottom:8px;">मैंने नोट कर लिया है: <strong>' + cName + ' (' + quantityQ + ' क्विंटल / ' + qKg + ' किलो)</strong>। 🌾</p>' +
            '<p style="font-size:13px;color:#17221D;margin-bottom:12px;">आप इस फसल के बारे में क्या जानना चाहते हैं?</p>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="' + cName + ' का भाव क्या है?">📊 ' + cName + ' का भाव</button>' +
            '<button class="ks-quick-btn" data-query="कहाँ बेचूं?">📍 कहाँ बेचें?</button>' +
            '<button class="ks-quick-btn" data-query="खरीदार ढूंढो">🤝 खरीदार ढूंढें</button>' +
            '<button class="ks-quick-btn" data-query="परिवहन खर्च कितना आएगा?">🚚 परिवहन खर्च</button>' +
            '</div>'
        };
      } else {
        return {
          html: '<p style="margin-bottom:8px;">Noted: <strong>' + cName + ' (' + quantityQ + ' quintals / ' + qKg + ' kg)</strong>. 🌾</p>' +
            '<p style="font-size:13px;color:#17221D;margin-bottom:12px;">What would you like to know about this lot?</p>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="What is the price of ' + cName + '?">📊 ' + cName + ' Price</button>' +
            '<button class="ks-quick-btn" data-query="Where should I sell?">📍 Where should I sell?</button>' +
            '<button class="ks-quick-btn" data-query="Find buyers">🤝 Find buyers</button>' +
            '<button class="ks-quick-btn" data-query="How much for transport?">🚚 Transport cost</button>' +
            '</div>'
        };
      }
    },

    unknown: function (lang) {
      lang = lang || 'mr';
      if (lang === 'mr') {
        return {
          html: '<p style="margin-bottom:10px;">मला तुमचा प्रश्न समजला नाही. तुम्ही बाजारभाव, कुठे विकावे, खरेदीदार, वाहतूक किंवा निव्वळ नफ्याबद्दल विचारू शकता.</p>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="आजचे बाजारभाव सांगा">📊 बाजारभाव</button>' +
            '<button class="ks-quick-btn" data-query="कुठे विकावा?">📍 कुठे विकावा?</button>' +
            '<button class="ks-quick-btn" data-query="मला खरेदीदार शोधा">🤝 खरेदीदार शोधा</button>' +
            '<button class="ks-quick-btn" data-query="वाहतूक खर्च किती येईल?">🚚 वाहतूक खर्च</button>' +
            '<button class="ks-quick-btn" data-query="निव्वळ नफा किती मिळेल?">💰 निव्वळ नफा</button>' +
            '</div>'
        };
      } else if (lang === 'hi') {
        return {
          html: '<p style="margin-bottom:10px;">मुझे आपका सवाल समझ नहीं आया। आप मंडी भाव, कहाँ बेचें, खरीदार, परिवहन या शुद्ध मुनाफे के बारे में पूछ सकते हैं।</p>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="आज के मंडी भाव बताओ">📊 मंडी भाव</button>' +
            '<button class="ks-quick-btn" data-query="मेरी फसल कहाँ बेचूं?">📍 कहाँ बेचें?</button>' +
            '<button class="ks-quick-btn" data-query="मुझे खरीदार ढूंढो">🤝 खरीदार ढूंढें</button>' +
            '<button class="ks-quick-btn" data-query="परिवहन खर्च कितना आएगा?">🚚 परिवहन खर्च</button>' +
            '<button class="ks-quick-btn" data-query="शुद्ध मुनाफा कितना मिलेगा?">💰 शुद्ध मुनाफा</button>' +
            '</div>'
        };
      } else {
        return {
          html: '<p style="margin-bottom:10px;">I didn\'t quite understand your question. You can ask about market prices, where to sell, buyers, transport, or net return.</p>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="Compare today\'s mandi prices">📊 Compare mandi prices</button>' +
            '<button class="ks-quick-btn" data-query="Where should I sell my crop?">📍 Where should I sell?</button>' +
            '<button class="ks-quick-btn" data-query="Find buyers for my crop">🤝 Find buyers</button>' +
            '<button class="ks-quick-btn" data-query="Find transport options">🚚 Find transport</button>' +
            '<button class="ks-quick-btn" data-query="Calculate my expected net return">💰 Calculate net return</button>' +
            '</div>'
        };
      }
    },

    greeting: function (lang) {
      lang = lang || 'mr';
      if (lang === 'mr') {
        return {
          html: '<p style="margin-bottom:10px;">नमस्कार! 👋 मी <strong>कृषी सहायक</strong> आहे. मी तुम्हाला शेतमालाचे बाजारभाव, विक्रीसाठी सर्वोत्तम बाजार, खरेदीदार आणि वाहतूक खर्चाबाबत मदत करू शकतो. मी तुम्हाला काय मदत करू?</p>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="आजचे बाजारभाव सांगा">📊 बाजारभाव</button>' +
            '<button class="ks-quick-btn" data-query="माझे पीक कुठे विकावे?">📍 कुठे विकावे?</button>' +
            '<button class="ks-quick-btn" data-query="मला खरेदीदार शोधा">🤝 खरेदीदार शोधा</button>' +
            '<button class="ks-quick-btn" data-query="वाहतूक खर्च किती येईल?">🚚 वाहतूक खर्च</button>' +
            '</div>'
        };
      } else if (lang === 'hi') {
        return {
          html: '<p style="margin-bottom:10px;">नमस्ते! 👋 मैं <strong>कृषि सहायक</strong> हूँ। मैं मंडी भाव, बिक्री के लिए सर्वश्रेष्ठ मंडी, खरीदार और परिवहन लागत के बारे में आपकी सहायता कर सकता हूँ।</p>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="आज के मंडी भाव बताओ">📊 मंडी भाव</button>' +
            '<button class="ks-quick-btn" data-query="मेरी फसल कहाँ बेचूं?">📍 कहाँ बेचें?</button>' +
            '<button class="ks-quick-btn" data-query="मुझे खरीदार ढूंढो">🤝 खरीदार ढूंढें</button>' +
            '<button class="ks-quick-btn" data-query="परिवहन खर्च कितना आएगा?">🚚 परिवहन खर्च</button>' +
            '</div>'
        };
      } else {
        return {
          html: '<p style="margin-bottom:10px;">Hello! 👋 I\'m <strong>Krishi Sahayak</strong>. I can help you with market prices, the best place to sell, finding buyers, and transport costs. How can I help you today?</p>' +
            '<div class="ks-quick-actions">' +
            '<button class="ks-quick-btn" data-query="Compare today\'s mandi prices">📊 Compare mandi prices</button>' +
            '<button class="ks-quick-btn" data-query="Where should I sell my crop?">📍 Where should I sell?</button>' +
            '<button class="ks-quick-btn" data-query="Find buyers for my crop">🤝 Find buyers</button>' +
            '<button class="ks-quick-btn" data-query="Find transport options">🚚 Find transport</button>' +
            '</div>'
        };
      }
    },

    generic: function (lang) {
      return this.unknown(lang);
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // 7. VOICE INTERACTION CONTROLLER (SpeechRecognition & SpeechSynthesis)
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
      return LanguageDetector.currentLanguage || 'mr';
    },

    setLanguage: function (lang) {
      if (lang === 'en' || lang === 'hi' || lang === 'mr') {
        LanguageDetector.currentLanguage = lang;
        try { localStorage.setItem(this.LANG_KEY, lang); } catch (e) {}
        if (this.recognition) {
          this.recognition.lang = this.getRecognitionLocale(lang);
        }
      }
    },

    getRecognitionLocale: function (lang) {
      lang = lang || LanguageDetector.currentLanguage;
      if (lang === 'mr') return 'mr-IN';
      if (lang === 'hi') return 'hi-IN';
      return 'en-IN';
    },

    getSpeechLocale: function (lang) {
      lang = lang || LanguageDetector.currentLanguage;
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
        KrishiSahayakUI.showTemporaryNotice('Voice input is not supported in this browser. Please type your question.');
        return;
      }

      // If currently speaking, stop speech and switch to listening immediately
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
        KrishiSahayakUI.showTemporaryNotice('Voice input is not supported in this browser. Please type your question.');
        return;
      }

      // Ensure any active speech is completely stopped before listening
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

      // Sync language selector in UI
      var langSelect = document.getElementById('ks-voice-lang-select');
      if (langSelect) langSelect.value = detectedLang;

      // Update recognition lang for next turn
      if (this.recognition) {
        this.recognition.lang = this.getRecognitionLocale(detectedLang);
      }

      var input = document.getElementById('ks-chat-input');
      if (input) input.value = transcript;

      // Trigger continuous processing flow
      KrishiSahayakUI.sendUserMessage(transcript, true, detectedLang);
    },

    handleError: function (errorType) {
      var lang = LanguageDetector.currentLanguage || 'mr';
      var msg = '';
      switch (errorType) {
        case 'not-allowed':
        case 'permission-denied':
          msg = lang === 'mr'
            ? 'मायक्रोफोनची परवानगी आवश्यक आहे. कृपया ब्राउझर सेटिंग्जमध्ये मायक्रोफोनला परवानगी द्या.'
            : (lang === 'hi'
              ? 'माइक्रोफ़ोन की अनुमति आवश्यक है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।'
              : 'Microphone permission is required. Please allow microphone access in your browser.');
          break;
        case 'no-speech':
          msg = lang === 'mr' ? 'काहीही ऐकू आले नाही. कृपया पुन्हा बोला.' : (lang === 'hi' ? 'कोई आवाज़ नहीं सुनाई दी। कृपया दोबारा बोलें।' : 'No speech was detected. Please tap the microphone and speak again.');
          break;
        case 'audio-capture':
          msg = lang === 'mr' ? 'मायक्रोफोन आढळला नाही. कृपया ऑडिओ सेटिंग्ज तपासा.' : (lang === 'hi' ? 'माइक्रोफ़ोन नहीं मिला। कृपया सेटिंग्स जांचें।' : 'No microphone was detected. Please check your audio settings.');
          break;
        case 'network':
          msg = lang === 'mr' ? 'इंटरनेट नेटवर्क समस्या. कृपया पुन्हा प्रयत्न करा.' : (lang === 'hi' ? 'नेटवर्क समस्या। कृपया पुनः प्रयास करें।' : 'Voice network error. Please try again or type your question.');
          break;
        case 'aborted':
          KrishiSahayakUI.setVoiceState('READY');
          return;
        default:
          msg = lang === 'mr' ? 'कृपया पुन्हा बोला किंवा टाइप करा.' : 'Please speak again or type your question.';
      }
      KrishiSahayakUI.showTemporaryNotice(msg);
      KrishiSahayakUI.setVoiceState('READY');
    },

    sanitizeForSpeech: function (html, lang) {
      if (!html) return '';
      var temp = document.createElement('div');
      temp.innerHTML = html;

      var unwanted = temp.querySelectorAll('button, a, .ks-msg-actions, .ks-quick-actions, svg, script, style, .ks-msg-note, .ks-contextual-btn-wrap');
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

      // Strip emojis and non-speech symbols
      text = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]/g, '');
      text = text.replace(/[🌾📍💰🚚📈🔥📊📉🥇🥈🥉⭐💡⚠️🤝👋🎙️🔊🔇✓✕★·−↑↓|]/g, ' ');

      return text.replace(/\s+/g, ' ').trim();
    },

    speak: function (htmlOrText, lang, btnElement) {
      if (!this.isSynthesisSupported()) return;

      this.stopSpeaking();
      KrishiSahayakUI.setVoiceState('SPEAKING');

      var textLang = lang || LanguageDetector.currentLanguage || 'mr';
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
  // 8. CHAT UI CONTROLLER WITH VOICE STATE MACHINE
  // ══════════════════════════════════════════════════════════════════
  var KrishiSahayakUI = {
    isOpen: false,
    _pendingContextMsg: null,
    voiceState: 'IDLE',

    init: function () {
      this._injectHTML();
      this._bindEvents();
      this._updateContextBar();
      this.setVoiceState('IDLE');
      var self = this;
      setTimeout(function () { self._showWelcome(); }, 350);
    },

    setVoiceState: function (state) {
      this.voiceState = state;
      var statusEl = document.getElementById('ks-voice-status');
      var btn = document.getElementById('ks-voice-btn');
      var input = document.getElementById('ks-chat-input');
      var lang = LanguageDetector.currentLanguage || 'mr';

      var messages = {
        IDLE: {
          en: 'Tap microphone to speak',
          hi: 'बोलने के लिए माइक दबाएं',
          mr: 'बोलण्यासाठी माइक दाबा'
        },
        LISTENING: {
          en: '🎤 Listening...',
          hi: '🎤 सुन रहे हैं...',
          mr: '🎤 ऐकत आहे...'
        },
        PROCESSING: {
          en: 'Thinking...',
          hi: 'सोच रहे हैं...',
          mr: 'विचार करत आहे...'
        },
        SPEAKING: {
          en: '🔊 Speaking...',
          hi: '🔊 बोल रहे हैं...',
          mr: '🔊 बोलत आहे...'
        },
        READY: {
          en: 'Tap microphone for your next question',
          hi: 'अगले सवाल के लिए माइक दबाएं',
          mr: 'पुढील प्रश्नासाठी माइक दाबा'
        }
      };

      var msg = (messages[state] && messages[state][lang]) || messages[state]['mr'];

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
          var defaultPlaceholders = {
            en: 'Ask about prices, buyers, transport…',
            hi: 'भाव, खरीदार, परिवहन के बारे में पूछें…',
            mr: 'भाव, खरेदीदार, वाहतूक याबद्दल विचारा…'
          };
          input.setAttribute('placeholder', defaultPlaceholders[lang] || defaultPlaceholders.mr);
        }
      }
    },

    _injectHTML: function () {
      var html = '' +
        '<div class="ks-fab-wrap" id="ks-fab-wrap">' +
          '<button class="ks-fab ks-fab--idle" id="ks-fab-btn" aria-label="Open Krishi Sahayak AI Market Assistant" title="Krishi Sahayak — AI Market Assistant">' +
            '<span class="ks-fab__icon">🌾</span>' +
            '<span class="ks-fab__text"><span class="ks-fab__name">Krishi Sahayak</span><span class="ks-fab__subtitle">AI Market Assistant</span></span>' +
            '<span class="ks-fab__dot" aria-hidden="true"></span>' +
          '</button>' +
        '</div>' +
        '<div class="ks-chat" id="ks-chat" role="dialog" aria-modal="true" aria-label="Krishi Sahayak AI Market Assistant" aria-hidden="true">' +
          '<div class="ks-chat__header">' +
            '<div class="ks-chat__header-icon" aria-hidden="true">🌾</div>' +
            '<div class="ks-chat__header-info">' +
              '<div class="ks-chat__header-name">Krishi Sahayak</div>' +
              '<div class="ks-chat__header-sub"><span class="ks-chat__online-dot" aria-hidden="true"></span>AI Market Assistant · Online</div>' +
            '</div>' +
            '<div class="ks-chat__header-actions">' +
              '<button class="ks-chat__header-btn ks-voice-reply-btn" id="ks-voice-reply-toggle" aria-label="Toggle voice replies" title="Voice replies: ON">🔊</button>' +
              '<button class="ks-chat__header-btn" id="ks-chat-minimize" aria-label="Minimize chat" title="Minimize">—</button>' +
              '<button class="ks-chat__header-btn" id="ks-chat-close" aria-label="Close Krishi Sahayak">✕</button>' +
            '</div>' +
          '</div>' +
          '<div class="ks-chat__context-bar" id="ks-context-bar"></div>' +
          '<div class="ks-chat__messages" id="ks-messages" role="log" aria-live="polite"></div>' +
          '<div class="ks-voice-status" id="ks-voice-status" aria-live="polite">बोलण्यासाठी माइक दाबा</div>' +
          '<div class="ks-chat__input-area">' +
            '<div class="ks-chat__input-wrap">' +
              '<input type="text" id="ks-chat-input" class="ks-chat__input" placeholder="भाव, खरेदीदार, वाहतूक याबद्दल विचारा…" autocomplete="off" aria-label="Type your question" maxlength="300">' +
              '<div class="ks-chat__input-controls">' +
                '<select id="ks-voice-lang-select" class="ks-voice-lang-select" aria-label="Language" title="Language: मराठी / हिन्दी / English">' +
                  '<option value="mr">मराठी</option>' +
                  '<option value="hi">हिन्दी</option>' +
                  '<option value="en">English</option>' +
                '</select>' +
                '<button class="ks-chat__voice-btn" id="ks-voice-btn" aria-label="Start voice input" title="🎙️ Speak your question">🎙️</button>' +
              '</div>' +
            '</div>' +
            '<button class="ks-chat__send-btn" id="ks-send-btn" aria-label="Send message">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>' +
            '</button>' +
          '</div>' +
          '<div class="ks-chat__input-hint">🌾 KrishiShetra · AI-powered market decisions</div>' +
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
          KrishiSahayakVoice.setLanguage(this.value);
          self.setVoiceState(self.voiceState);
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
          var btn = e.target.closest('[data-query]');
          if (btn) {
            var q = btn.getAttribute('data-query');
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
      if (ctx && ctx.cropName) {
        var cDisplay = R.getCropDisplayName(ctx.cropId, LanguageDetector.currentLanguage);
        bar.innerHTML = '<span class="ks-chat__context-label">Context:</span>' +
          '<span class="ks-chat__context-pill">🌾 ' + cDisplay + '</span>' +
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

    _showWelcome: function () {
      var lang = LanguageDetector.currentLanguage || 'mr';
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

    sendUserMessage: function (text, isVoice, forceLang) {
      // 1. Stop any ongoing speech
      KrishiSahayakVoice.stopSpeaking();

      // 2. Detect language of the command
      var lang = forceLang || LanguageDetector.detect(text);
      var langSelect = document.getElementById('ks-voice-lang-select');
      if (langSelect) langSelect.value = lang;

      this._appendUserMessage(text);
      this._showTyping();
      this.setVoiceState('PROCESSING');

      var self = this;
      var delay = isVoice ? 450 : (750 + Math.random() * 400);

      setTimeout(function () {
        self._hideTyping();
        var response = self._processMessage(text, lang);
        var botDiv = self._appendBotMessage(response.html, '', lang);
        self._updateContextBar();

        if (isVoice && KrishiSahayakVoice.isVoiceReplyEnabled() && botDiv) {
          var speakBtn = botDiv.querySelector('.ks-msg__speak-btn');
          KrishiSahayakVoice.speak(response.html, lang, speakBtn);
        } else {
          self.setVoiceState('READY');
        }
      }, delay);
    },

    _processMessage: function (text, lang) {
      lang = lang || LanguageDetector.currentLanguage || 'mr';

      // 1. Extract entities
      var cropId = KrishiSahayakEngine.extractCropFromText(text);
      var qty = KrishiSahayakEngine.extractQuantity(text);
      var grade = KrishiSahayakEngine.extractGrade(text);
      var mandi = KrishiSahayakEngine.extractMandi(text);

      // 2. Update conversation memory with newly discovered entities
      KrishiSahayakMemory.update({
        cropId: cropId,
        quantityQ: qty,
        grade: grade,
        selectedMandi: mandi
      });

      // 3. Merge with conversation memory
      var mem = KrishiSahayakMemory.getContext();
      var farmerCtx = KrishiSahayakEngine.getFarmerContext();

      var finalCropId = cropId || mem.cropId || (farmerCtx && farmerCtx.cropId) || null;
      var finalQty = qty || mem.quantityQ || (farmerCtx && farmerCtx.quantityQ) || 10;
      var finalGrade = grade || mem.grade || (farmerCtx && farmerCtx.grade) || 'Standard';
      var targetMandi = mandi || mem.selectedMandi || 'Mumbai APMC (Vashi)';

      // 4. Detect Intent
      var intent = KrishiSahayakEngine.detectIntent(text);

      // Specific "why is X recommended" or "is Vashi better"
      if (/why.*recommend/i.test(text) || /का.*चांगला/i.test(text) || /का.*सर्वोत्तम/i.test(text) || /vashi.*better/i.test(text) || /वाशी.*चांग/i.test(text) || /वाशी.*बरे/i.test(text)) {
        return R.whyRecommended(targetMandi, finalCropId || 'tomato', finalQty, lang);
      }

      switch (intent) {
        case 'WHERE_SELL':
          return finalCropId ? R.whereSell(finalCropId, finalQty, finalGrade, lang) : R.askingCrop(lang);

        case 'PRICE_CHECK':
          return R.priceCheck(finalCropId, finalQty, lang);

        case 'PRICE_TREND':
          return R.priceTrend(finalCropId, lang);

        case 'WHICH_BUYER_BETTER':
          return R.whichBuyerBetter(finalCropId, lang);

        case 'FIND_BUYERS':
          return finalCropId ? R.findBuyers(finalCropId, lang) : R.askingCrop(lang);

        case 'TRANSPORT': {
          var distM = text.match(/(\d+)\s*km/i) || text.match(/(\d+)\s*किमी/i);
          var d = distM ? parseInt(distM[1]) : (targetMandi.indexOf('Vashi') !== -1 ? 165 : 45);
          return R.transport(d, finalQty, targetMandi, lang);
        }

        case 'NET_RETURN':
          return R.netReturn(finalCropId, finalQty, 42, finalGrade, lang);

        case 'LOT_REGISTRATION':
          return R.lotAcknowledged(finalCropId, finalQty, lang);

        case 'GREETING':
          return R.greeting(lang);

        default:
          if (cropId && !qty) return R.priceCheck(finalCropId, finalQty, lang);
          if (cropId && qty) return R.lotAcknowledged(finalCropId, finalQty, lang);
          return R.unknown(lang);
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
      if (extraClass !== 'notice') {
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
    },
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
          : ('Why is ' + mandiName + ' recommended for my ' + cleanCrop + '?');
        KrishiSahayakUI.openWithMessage(qText);
      });

      if (cropSel) {
        cropSel.addEventListener('change', function () {
          var existing = container.querySelector('.ks-contextual-btn-wrap');
          if (existing) existing.remove();
        });
      }
    },
  };

  // ══════════════════════════════════════════════════════════════════
  // 10. GLOBAL API EXPORTS
  // ══════════════════════════════════════════════════════════════════
  window.KrishiSahayak = {
    open:            function () { KrishiSahayakUI.open(); },
    close:           function () { KrishiSahayakUI.close(); },
    toggle:          function () { KrishiSahayakUI.toggle(); },
    openWithMessage: function (msg) { KrishiSahayakUI.openWithMessage(msg); },
    sendMessage:     function (text) { KrishiSahayakUI.sendUserMessage(text, false); },
  };

  window.KrishiSahayakVoice = {
    startListening: function () { KrishiSahayakVoice.startListening(); },
    stopListening:  function () { KrishiSahayakVoice.stopListening(); },
    speak:          function (text, lang) { KrishiSahayakVoice.speak(text, lang); },
    stopSpeaking:   function () { KrishiSahayakVoice.stopSpeaking(); },
    setLanguage:    function (lang) { KrishiSahayakVoice.setLanguage(lang); },
    getLanguage:    function () { return KrishiSahayakVoice.getLanguage(); }
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
