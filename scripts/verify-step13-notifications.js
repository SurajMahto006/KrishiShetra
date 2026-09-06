const assert = require('assert');
const i18next = require('../src/i18n.js');

console.log('================================================================');
console.log('   STEP 13 VERIFICATION: NOTIFICATIONS & SYSTEM MESSAGES i18n   ');
console.log('================================================================\n');

let passCount = 0;
let totalCount = 0;

function test(description, fn) {
  totalCount++;
  try {
    fn();
    console.log(`[PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${description}`);
    console.error(`       Error: ${err.message}`);
  }
}

// 1. Core Interpolation Engine Tests
test('Interpolation replaces {{variable}} in English', () => {
  i18next.changeLanguage('en');
  const result = i18next.t('notifications.offerReceived', { buyerName: 'Kisan Agro Traders' });
  assert.strictEqual(result, 'You received a new offer from Kisan Agro Traders');
});

test('Interpolation replaces {{variable}} in Hindi without translating variable value', () => {
  i18next.changeLanguage('hi');
  const result = i18next.t('notifications.offerReceived', { buyerName: 'Kisan Agro Traders' });
  assert.strictEqual(result, 'आपको Kisan Agro Traders से एक नया प्रस्ताव प्राप्त हुआ है');
  assert.ok(result.includes('Kisan Agro Traders'), 'Should contain exact untranslated buyerName');
  assert.ok(/[\u0900-\u097F]/.test(result), 'Should contain Hindi Devanagari characters');
});

test('Interpolation replaces {{variable}} in Marathi without translating variable value', () => {
  i18next.changeLanguage('mr');
  const result = i18next.t('notifications.offerReceived', { buyerName: 'Kisan Agro Traders' });
  assert.strictEqual(result, 'तुम्हाला Kisan Agro Traders कडून नवीन ऑफर प्राप्त झाली आहे');
  assert.ok(result.includes('Kisan Agro Traders'), 'Should contain exact untranslated buyerName');
  assert.ok(/[\u0900-\u097F]/.test(result), 'Should contain Marathi Devanagari characters');
});

// 2. Comprehensive Test for All 14 Notification Categories in en, hi, mr
const scenarios = [
  {
    category: '1. Offer Received',
    key: 'notifications.offerReceived',
    titleKey: 'notifications.offerReceivedTitle',
    params: { buyerName: 'ITC Agri Foods' },
    expected: {
      en: 'You received a new offer from ITC Agri Foods',
      hi: 'आपको ITC Agri Foods से एक नया प्रस्ताव प्राप्त हुआ है',
      mr: 'तुम्हाला ITC Agri Foods कडून नवीन ऑफर प्राप्त झाली आहे'
    },
    expectedTitle: {
      en: 'New Offer Received',
      hi: 'नया प्रस्ताव प्राप्त हुआ',
      mr: 'नवीन ऑफर प्राप्त'
    }
  },
  {
    category: '2. Offer Accepted',
    key: 'notifications.offerAccepted',
    titleKey: 'notifications.offerAcceptedTitle',
    params: { cropName: 'Wheat', farmerName: 'Rajesh Patil' },
    expected: {
      en: 'Your offer for Wheat has been accepted by Rajesh Patil',
      hi: 'Wheat के लिए आपका प्रस्ताव Rajesh Patil द्वारा स्वीकार कर लिया गया है',
      mr: 'Wheat साठी तुमची ऑफर Rajesh Patil यांनी स्वीकारली आहे'
    },
    expectedTitle: {
      en: 'Offer Accepted',
      hi: 'प्रस्ताव स्वीकृत',
      mr: 'ऑफर स्वीकारली'
    }
  },
  {
    category: '3. Offer Rejected',
    key: 'notifications.offerRejected',
    titleKey: 'notifications.offerRejectedTitle',
    params: { cropName: 'Onion', farmerName: 'Suresh More' },
    expected: {
      en: 'Your offer for Onion was rejected by Suresh More',
      hi: 'Onion के लिए आपका प्रस्ताव Suresh More द्वारा अस्वीकार कर दिया गया',
      mr: 'Onion साठी तुमची ऑफर Suresh More यांनी नाकारली आहे'
    },
    expectedTitle: {
      en: 'Offer Rejected',
      hi: 'प्रस्ताव अस्वीकृत',
      mr: 'ऑफर नाकारली'
    }
  },
  {
    category: '4. Order Created',
    key: 'notifications.orderCreated',
    titleKey: 'notifications.orderCreatedTitle',
    params: { orderId: 'ord-88321', quantity: 150, cropName: 'Soybean' },
    expected: {
      en: 'Order #ord-88321 has been created for 150 quintals of Soybean',
      hi: 'Soybean के 150 क्विंटल के लिए ऑर्डर #ord-88321 बनाया गया है',
      mr: 'Soybean च्या 150 क्विंटलसाठी ऑर्डर #ord-88321 तयार केली गेली आहे'
    },
    expectedTitle: {
      en: 'Order Created',
      hi: 'ऑर्डर बनाया गया',
      mr: 'ऑर्डर तयार केली'
    }
  },
  {
    category: '5. Order Confirmed',
    key: 'notifications.orderConfirmed',
    titleKey: 'notifications.orderConfirmedTitle',
    params: { orderId: 'ord-88321' },
    expected: {
      en: 'Order #ord-88321 has been confirmed and escrow payment secured',
      hi: 'ऑर्डर #ord-88321 की पुष्टि हो गई है और एस्क्रो भुगतान सुरक्षित है',
      mr: 'ऑर्डर #ord-88321 निश्चित झाली आहे आणि एस्क्रो पेमेंट सुरक्षित केले आहे'
    },
    expectedTitle: {
      en: 'Order Confirmed',
      hi: 'ऑर्डर पुष्ट',
      mr: 'ऑर्डर निश्चित झाली'
    }
  },
  {
    category: '6. Pickup Scheduled',
    key: 'notifications.pickupScheduled',
    titleKey: 'notifications.pickupScheduledTitle',
    params: { orderId: 'ord-88321', transporterName: 'KrishiLogistics MH-12', date: '10 Sept 2026' },
    expected: {
      en: 'Pickup for order #ord-88321 has been scheduled with KrishiLogistics MH-12 on 10 Sept 2026',
      hi: 'ऑर्डर #ord-88321 का पिकअप 10 Sept 2026 को KrishiLogistics MH-12 के साथ निर्धारित किया गया है',
      mr: 'ऑर्डर #ord-88321 चा पिकअप 10 Sept 2026 रोजी KrishiLogistics MH-12 सोबत नियोजित केला आहे'
    },
    expectedTitle: {
      en: 'Pickup Scheduled',
      hi: 'पिकअप निर्धारित',
      mr: 'पिकअप नियोजित'
    }
  },
  {
    category: '7. Delivery Update',
    key: 'notifications.deliveryUpdate',
    titleKey: 'notifications.deliveryUpdateTitle',
    params: { orderId: 'ord-88321', status: 'In Transit' },
    expected: {
      en: 'Delivery update for order #ord-88321: In Transit',
      hi: 'ऑर्डर #ord-88321 के लिए डिलीवरी अपडेट: In Transit',
      mr: 'ऑर्डर #ord-88321 साठी डिलिव्हरी अपडेट: In Transit'
    },
    expectedTitle: {
      en: 'Delivery Update',
      hi: 'डिलीवरी अपडेट',
      mr: 'डिलिव्हरी अपडेट'
    }
  },
  {
    category: '8. Payment Update',
    key: 'notifications.paymentUpdate',
    titleKey: 'notifications.paymentUpdateTitle',
    params: { amount: '4,50,000', orderId: 'ord-88321', status: 'Released' },
    expected: {
      en: 'Payment of ₹4,50,000 for order #ord-88321 has been Released',
      hi: 'ऑर्डर #ord-88321 के लिए ₹4,50,000 का भुगतान Released हो गया है',
      mr: 'ऑर्डर #ord-88321 साठी ₹4,50,000 चे पेमेंट Released झाले आहे'
    },
    expectedTitle: {
      en: 'Payment Update',
      hi: 'भुगतान अपडेट',
      mr: 'पेमेंट अपडेट'
    }
  },
  {
    category: '9. Storage Request Received',
    key: 'notifications.storageRequestReceived',
    titleKey: 'notifications.storageRequestReceivedTitle',
    params: { quantity: 200, cropName: 'Maize', farmerName: 'Anand Shinde' },
    expected: {
      en: 'New storage request received for 200 quintals of Maize from Anand Shinde',
      hi: 'Anand Shinde से Maize के 200 क्विंटल के लिए नया भंडारण अनुरोध प्राप्त हुआ',
      mr: 'Anand Shinde कडून Maize च्या 200 क्विंटलसाठी नवीन साठवणूक विनंती प्राप्त झाली'
    },
    expectedTitle: {
      en: 'Storage Request Received',
      hi: 'भंडारण अनुरोध प्राप्त',
      mr: 'साठवणूक विनंती प्राप्त'
    }
  },
  {
    category: '10. Storage Request Accepted',
    key: 'notifications.storageRequestAccepted',
    titleKey: 'notifications.storageRequestAcceptedTitle',
    params: { cropName: 'Maize', facilityName: 'Baramati Agro Cold Storage' },
    expected: {
      en: 'Your storage request for Maize at Baramati Agro Cold Storage has been accepted',
      hi: 'Baramati Agro Cold Storage में Maize के लिए आपका भंडारण अनुरोध स्वीकार कर लिया गया है',
      mr: 'Baramati Agro Cold Storage येथे Maize साठी तुमची साठवणूक विनंती मंजूर झाली आहे'
    },
    expectedTitle: {
      en: 'Storage Request Accepted',
      hi: 'भंडारण अनुरोध स्वीकृत',
      mr: 'साठवणूक विनंती मंजूर'
    }
  },
  {
    category: '11. Storage Request Rejected',
    key: 'notifications.storageRequestRejected',
    titleKey: 'notifications.storageRequestRejectedTitle',
    params: { cropName: 'Maize', facilityName: 'Baramati Agro Cold Storage' },
    expected: {
      en: 'Your storage request for Maize at Baramati Agro Cold Storage was rejected',
      hi: 'Baramati Agro Cold Storage में Maize के लिए आपका भंडारण अनुरोध अस्वीकार कर दिया गया',
      mr: 'Baramati Agro Cold Storage येथे Maize साठी तुमची साठवणूक विनंती नाकारली गेली'
    },
    expectedTitle: {
      en: 'Storage Request Rejected',
      hi: 'भंडारण अनुरोध अस्वीकृत',
      mr: 'साठवणूक विनंती नाकारली'
    }
  },
  {
    category: '12. Verification Status',
    key: 'notifications.verificationStatus',
    titleKey: 'notifications.verificationStatusTitle',
    params: { status: 'Verified' },
    expected: {
      en: 'Your verification status has been updated to Verified',
      hi: 'आपकी सत्यापन स्थिति अपडेट होकर Verified हो गई है',
      mr: 'तुमची पडताळणी स्थिती अपडेट होऊन Verified झाली आहे'
    },
    expectedTitle: {
      en: 'Verification Status Update',
      hi: 'सत्यापन स्थिति अपडेट',
      mr: 'पडताळणी स्थिती अपडेट'
    }
  },
  {
    category: '13. Market Alerts',
    key: 'notifications.marketAlert',
    titleKey: 'notifications.marketAlertTitle',
    params: { cropName: 'Tomato', mandiName: 'Nashik APMC', price: 2400, change: '+12%' },
    expected: {
      en: 'Market alert: Tomato price at Nashik APMC is ₹2400/q (+12%)',
      hi: 'बाजार अलर्ट: Nashik APMC में Tomato का भाव ₹2400/क्विंटल है (+12%)',
      mr: 'बाजार अलर्ट: Nashik APMC मध्ये Tomato चा दर ₹2400/क्विंटल आहे (+12%)'
    },
    expectedTitle: {
      en: 'Market Price Alert',
      hi: 'बाजार भाव अलर्ट',
      mr: 'बाजार भाव अलर्ट'
    }
  },
  {
    category: '14. AI Recommendation Alerts',
    key: 'notifications.aiRecommendationAlert',
    titleKey: 'notifications.aiRecommendationAlertTitle',
    params: { recommendation: 'STORE_HOLD', cropName: 'Wheat', projectedPrice: 2800 },
    expected: {
      en: 'AI recommendation: STORE_HOLD suggested for Wheat with projected price ₹2800/q',
      hi: 'एआई अनुशंसा: ₹2800/क्विंटल के अनुमानित मूल्य के साथ Wheat के लिए STORE_HOLD की सलाह दी गई है',
      mr: 'एआई शिफारस: ₹2800/क्विंटल अंदाजित दरासह Wheat साठी STORE_HOLD चा सल्ला देण्यात आला आहे'
    },
    expectedTitle: {
      en: 'AI Recommendation Alert',
      hi: 'एआई अनुशंसा अलर्ट',
      mr: 'एआई शिफारस अलर्ट'
    }
  }
];

scenarios.forEach((s) => {
  ['en', 'hi', 'mr'].forEach((lang) => {
    test(`${s.category} [${lang.toUpperCase()}] template rendering & title`, () => {
      i18next.changeLanguage(lang);
      const msg = i18next.t(s.key, s.params);
      const title = i18next.t(s.titleKey);

      assert.strictEqual(msg, s.expected[lang], `Message mismatch for ${s.key} in ${lang}`);
      assert.strictEqual(title, s.expectedTitle[lang], `Title mismatch for ${s.titleKey} in ${lang}`);

      if (lang === 'hi' || lang === 'mr') {
        assert.ok(/[\u0900-\u097F]/.test(msg), `Expected Devanagari in ${lang} message`);
        assert.ok(/[\u0900-\u097F]/.test(title), `Expected Devanagari in ${lang} title`);
      }
    });
  });
});

// 3. Detailed templates verification
test('Detailed notification templates with multi-variable interpolation', () => {
  i18next.changeLanguage('en');
  const enDetailed = i18next.t('notifications.offerReceivedDetailed', {
    buyerName: 'Patanjali Agro',
    price: 3100,
    quantity: 50,
    cropName: 'Cotton'
  });
  assert.strictEqual(enDetailed, 'Patanjali Agro offered ₹3100/q for 50q Cotton.');

  i18next.changeLanguage('hi');
  const hiDetailed = i18next.t('notifications.offerReceivedDetailed', {
    buyerName: 'Patanjali Agro',
    price: 3100,
    quantity: 50,
    cropName: 'Cotton'
  });
  assert.strictEqual(hiDetailed, 'Patanjali Agro ने 50 क्विंटल Cotton के लिए ₹3100/क्विंटल का प्रस्ताव दिया।');

  i18next.changeLanguage('mr');
  const mrDetailed = i18next.t('notifications.offerReceivedDetailed', {
    buyerName: 'Patanjali Agro',
    price: 3100,
    quantity: 50,
    cropName: 'Cotton'
  });
  assert.strictEqual(mrDetailed, 'Patanjali Agro यांनी 50 क्विंटल Cotton साठी ₹3100/क्विंटलची ऑफर दिली.');
});

// 4. Fallback behavior test
test('Fallback when variable is missing retains template key smoothly', () => {
  i18next.changeLanguage('en');
  const result = i18next.t('notifications.offerReceived', {});
  assert.strictEqual(result, 'You received a new offer from {{buyerName}}');
});

// 5. Simulate dashboard modal rendering in all 3 languages
test('Dashboard notification list simulation in en, hi, mr', () => {
  const sampleNotifications = [
    {
      id: 'n1',
      titleKey: 'notifications.offerReceivedTitle',
      templateKey: 'notifications.offerReceivedDetailed',
      params: { buyerName: 'ABC Foods', price: 2950, quantity: 20, cropName: 'Rice' },
      title: 'New Buyer Offer Received',
      desc: 'ABC Foods offered ₹2,950/q for 20q Rice.',
      time: '10 mins ago',
      unread: true
    },
    {
      id: 'n2',
      titleKey: 'notifications.marketAlertTitle',
      templateKey: 'notifications.marketAlertDetailed',
      params: { cropName: 'Rice', mandiName: 'Pune APMC', changePercent: 5.2, price: 3000 },
      title: 'Price Spike Alert · Pune',
      desc: 'Rice APMC rate surged +5.2% today.',
      time: '2 hours ago',
      unread: true
    }
  ];

  ['en', 'hi', 'mr'].forEach((lang) => {
    i18next.changeLanguage(lang);
    const rendered = sampleNotifications.map(n => ({
      title: n.titleKey ? i18next.t(n.titleKey, n.title) : n.title,
      desc: n.templateKey ? i18next.t(n.templateKey, n.params, n.desc) : n.desc
    }));

    assert.ok(rendered[0].title.length > 0);
    assert.ok(rendered[0].desc.includes('ABC Foods'));
    assert.ok(rendered[1].desc.includes('Pune APMC'));

    if (lang === 'hi' || lang === 'mr') {
      assert.ok(/[\u0900-\u097F]/.test(rendered[0].title));
      assert.ok(/[\u0900-\u097F]/.test(rendered[0].desc));
    }
  });
});

console.log('\n================================================================');
console.log(`VERIFICATION COMPLETE: ${passCount} / ${totalCount} TESTS PASSED`);
console.log('================================================================');

if (passCount !== totalCount) {
  process.exit(1);
}
