const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const enPath = path.join(localesDir, 'en.json');
const hiPath = path.join(localesDir, 'hi.json');
const mrPath = path.join(localesDir, 'mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

// Step 13: Notification Templates & Titles with Variable Interpolation
const notificationsEn = {
  notificationsTitle: "Notifications & Real-Time Alerts",
  markAllRead: "Mark All as Read",
  noNotifications: "No unread notifications",
  viewAllNotifications: "View All Notifications",
  clearAll: "Clear All",
  unread: "Unread",
  read: "Read",
  justNow: "Just now",
  minsAgo: "{{count}} mins ago",
  hoursAgo: "{{count}} hours ago",
  yesterday: "Yesterday",
  daysAgo: "{{count}} days ago",

  // 1. Offer Received
  offerReceived: "You received a new offer from {{buyerName}}",
  offerReceivedDetailed: "{{buyerName}} offered ₹{{price}}/q for {{quantity}}q {{cropName}}.",
  offerReceivedTitle: "New Offer Received",

  // 2. Offer Accepted
  offerAccepted: "Your offer for {{cropName}} has been accepted by {{farmerName}}",
  offerAcceptedDetailed: "Offer #{{offerId}} for {{cropName}} has been accepted at ₹{{price}}/q.",
  offerAcceptedTitle: "Offer Accepted",

  // 3. Offer Rejected
  offerRejected: "Your offer for {{cropName}} was rejected by {{farmerName}}",
  offerRejectedDetailed: "Offer #{{offerId}} for {{cropName}} was declined: {{reason}}",
  offerRejectedTitle: "Offer Rejected",

  // 4. Order Created
  orderCreated: "Order #{{orderId}} has been created for {{quantity}} quintals of {{cropName}}",
  orderCreatedDetailed: "Order #{{orderId}} created successfully with total value ₹{{amount}}.",
  orderCreatedTitle: "Order Created",

  // 5. Order Confirmed
  orderConfirmed: "Order #{{orderId}} has been confirmed and escrow payment secured",
  orderConfirmedDetailed: "Order #{{orderId}} confirmed. ₹{{amount}} held in secure escrow.",
  orderConfirmedTitle: "Order Confirmed",

  // 6. Pickup Scheduled
  pickupScheduled: "Pickup for order #{{orderId}} has been scheduled with {{transporterName}} on {{date}}",
  pickupScheduledDetailed: "Vehicle {{vehicleNumber}} scheduled for pickup of {{quantity}}q {{cropName}} on {{date}}.",
  pickupScheduledTitle: "Pickup Scheduled",

  // 7. Delivery Update
  deliveryUpdate: "Delivery update for order #{{orderId}}: {{status}}",
  deliveryUpdateDetailed: "Shipment for order #{{orderId}} is now {{status}} at {{location}} with ETA {{eta}}.",
  deliveryUpdateTitle: "Delivery Update",

  // 8. Payment Update
  paymentUpdate: "Payment of ₹{{amount}} for order #{{orderId}} has been {{status}}",
  paymentUpdateDetailed: "₹{{amount}} payment for order #{{orderId}} transferred to account {{accountNumber}}.",
  paymentUpdateTitle: "Payment Update",

  // 9. Storage Request Received
  storageRequestReceived: "New storage request received for {{quantity}} quintals of {{cropName}} from {{farmerName}}",
  storageRequestReceivedDetailed: "Farmer {{farmerName}} requested {{duration}} days storage for {{quantity}}q {{cropName}} at {{facilityName}}.",
  storageRequestReceivedTitle: "Storage Request Received",

  // 10. Storage Request Accepted
  storageRequestAccepted: "Your storage request for {{cropName}} at {{facilityName}} has been accepted",
  storageRequestAcceptedDetailed: "Storage approved at {{facilityName}} for {{quantity}}q {{cropName}} at rate ₹{{rate}}/q/month.",
  storageRequestAcceptedTitle: "Storage Request Accepted",

  // 11. Storage Request Rejected
  storageRequestRejected: "Your storage request for {{cropName}} at {{facilityName}} was rejected",
  storageRequestRejectedDetailed: "Storage request at {{facilityName}} for {{cropName}} was rejected: {{reason}}",
  storageRequestRejectedTitle: "Storage Request Rejected",

  // 12. Verification Status
  verificationStatus: "Your verification status has been updated to {{status}}",
  verificationStatusDetailed: "Facility {{facilityName}} verification status is now {{status}}. {{comments}}",
  verificationStatusTitle: "Verification Status Update",

  // 13. Market Alerts
  marketAlert: "Market alert: {{cropName}} price at {{mandiName}} is ₹{{price}}/q ({{change}})",
  marketAlertDetailed: "Price spike alert: {{cropName}} rate at {{mandiName}} increased by {{changePercent}}% to ₹{{price}}/q.",
  marketAlertTitle: "Market Price Alert",

  // 14. AI Recommendation Alerts
  aiRecommendationAlert: "AI recommendation: {{recommendation}} suggested for {{cropName}} with projected price ₹{{projectedPrice}}/q",
  aiRecommendationAlertDetailed: "AI Advisory: For {{cropName}}, we recommend {{recommendation}}. Projected gain is ₹{{expectedGain}} with net benefit ₹{{netBenefit}}.",
  aiRecommendationAlertTitle: "AI Recommendation Alert",

  // Backward compatible fixed system notifications
  inquiryReceived: "New purchase inquiry received on your produce lot.",
  inquiryAccepted: "Your purchase inquiry was accepted by the farmer!",
  inquiryRejected: "Your purchase inquiry was declined.",
  counterOfferReceived: "A new counter-offer was proposed.",
  orderStatusUpdated: "Order fulfillment status was updated.",
  shipmentDispatched: "Shipment has been dispatched for transit.",
  shipmentDelivered: "Consignment delivered successfully."
};

const notificationsHi = {
  notificationsTitle: "सूचनाएं व रियल-टाइम अलर्ट",
  markAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
  noNotifications: "कोई अपठित सूचना नहीं",
  viewAllNotifications: "सभी सूचनाएं देखें",
  clearAll: "सभी हटाएं",
  unread: "अपठित",
  read: "पढ़ा हुआ",
  justNow: "अभी",
  minsAgo: "{{count}} मिनट पहले",
  hoursAgo: "{{count}} घंटे पहले",
  yesterday: "कल",
  daysAgo: "{{count}} दिन पहले",

  // 1. Offer Received
  offerReceived: "आपको {{buyerName}} से एक नया प्रस्ताव प्राप्त हुआ है",
  offerReceivedDetailed: "{{buyerName}} ने {{quantity}} क्विंटल {{cropName}} के लिए ₹{{price}}/क्विंटल का प्रस्ताव दिया।",
  offerReceivedTitle: "नया प्रस्ताव प्राप्त हुआ",

  // 2. Offer Accepted
  offerAccepted: "{{cropName}} के लिए आपका प्रस्ताव {{farmerName}} द्वारा स्वीकार कर लिया गया है",
  offerAcceptedDetailed: "{{cropName}} के लिए प्रस्ताव #{{offerId}} ₹{{price}}/क्विंटल पर स्वीकार कर लिया गया है।",
  offerAcceptedTitle: "प्रस्ताव स्वीकृत",

  // 3. Offer Rejected
  offerRejected: "{{cropName}} के लिए आपका प्रस्ताव {{farmerName}} द्वारा अस्वीकार कर दिया गया",
  offerRejectedDetailed: "{{cropName}} के लिए प्रस्ताव #{{offerId}} अस्वीकार कर दिया गया: {{reason}}",
  offerRejectedTitle: "प्रस्ताव अस्वीकृत",

  // 4. Order Created
  orderCreated: "{{cropName}} के {{quantity}} क्विंटल के लिए ऑर्डर #{{orderId}} बनाया गया है",
  orderCreatedDetailed: "कुल मूल्य ₹{{amount}} के साथ ऑर्डर #{{orderId}} सफलतापूर्वक बनाया गया।",
  orderCreatedTitle: "ऑर्डर बनाया गया",

  // 5. Order Confirmed
  orderConfirmed: "ऑर्डर #{{orderId}} की पुष्टि हो गई है और एस्क्रो भुगतान सुरक्षित है",
  orderConfirmedDetailed: "ऑर्डर #{{orderId}} की पुष्टि हो गई। ₹{{amount}} सुरक्षित एस्क्रो में जमा है।",
  orderConfirmedTitle: "ऑर्डर पुष्ट",

  // 6. Pickup Scheduled
  pickupScheduled: "ऑर्डर #{{orderId}} का पिकअप {{date}} को {{transporterName}} के साथ निर्धारित किया गया है",
  pickupScheduledDetailed: "वाहन {{vehicleNumber}} को {{date}} को {{quantity}} क्विंटल {{cropName}} के पिकअप के लिए निर्धारित किया गया है।",
  pickupScheduledTitle: "पिकअप निर्धारित",

  // 7. Delivery Update
  deliveryUpdate: "ऑर्डर #{{orderId}} के लिए डिलीवरी अपडेट: {{status}}",
  deliveryUpdateDetailed: "ऑर्डर #{{orderId}} की खेप अब {{location}} पर {{status}} है, आगमन समय {{eta}}।",
  deliveryUpdateTitle: "डिलीवरी अपडेट",

  // 8. Payment Update
  paymentUpdate: "ऑर्डर #{{orderId}} के लिए ₹{{amount}} का भुगतान {{status}} हो गया है",
  paymentUpdateDetailed: "ऑर्डर #{{orderId}} के लिए ₹{{amount}} का भुगतान खाता {{accountNumber}} में स्थानांतरित किया गया।",
  paymentUpdateTitle: "भुगतान अपडेट",

  // 9. Storage Request Received
  storageRequestReceived: "{{farmerName}} से {{cropName}} के {{quantity}} क्विंटल के लिए नया भंडारण अनुरोध प्राप्त हुआ",
  storageRequestReceivedDetailed: "किसान {{farmerName}} ने {{facilityName}} में {{quantity}} क्विंटल {{cropName}} के लिए {{duration}} दिनों के भंडारण का अनुरोध किया।",
  storageRequestReceivedTitle: "भंडारण अनुरोध प्राप्त",

  // 10. Storage Request Accepted
  storageRequestAccepted: "{{facilityName}} में {{cropName}} के लिए आपका भंडारण अनुरोध स्वीकार कर लिया गया है",
  storageRequestAcceptedDetailed: "{{facilityName}} में {{quantity}} क्विंटल {{cropName}} के लिए ₹{{rate}}/क्विंटल/माह की दर से भंडारण स्वीकृत।",
  storageRequestAcceptedTitle: "भंडारण अनुरोध स्वीकृत",

  // 11. Storage Request Rejected
  storageRequestRejected: "{{facilityName}} में {{cropName}} के लिए आपका भंडारण अनुरोध अस्वीकार कर दिया गया",
  storageRequestRejectedDetailed: "{{cropName}} के लिए {{facilityName}} में भंडारण अनुरोध अस्वीकार कर दिया गया: {{reason}}",
  storageRequestRejectedTitle: "भंडारण अनुरोध अस्वीकृत",

  // 12. Verification Status
  verificationStatus: "आपकी सत्यापन स्थिति अपडेट होकर {{status}} हो गई है",
  verificationStatusDetailed: "सुविधा {{facilityName}} की सत्यापन स्थिति अब {{status}} है। {{comments}}",
  verificationStatusTitle: "सत्यापन स्थिति अपडेट",

  // 13. Market Alerts
  marketAlert: "बाजार अलर्ट: {{mandiName}} में {{cropName}} का भाव ₹{{price}}/क्विंटल है ({{change}})",
  marketAlertDetailed: "मूल्य वृद्धि अलर्ट: {{mandiName}} में {{cropName}} का भाव {{changePercent}}% बढ़कर ₹{{price}}/क्विंटल हो गया।",
  marketAlertTitle: "बाजार भाव अलर्ट",

  // 14. AI Recommendation Alerts
  aiRecommendationAlert: "एआई अनुशंसा: ₹{{projectedPrice}}/क्विंटल के अनुमानित मूल्य के साथ {{cropName}} के लिए {{recommendation}} की सलाह दी गई है",
  aiRecommendationAlertDetailed: "एआई सलाह: {{cropName}} के लिए, हम {{recommendation}} की सलाह देते हैं। अनुमानित लाभ ₹{{expectedGain}} और शुद्ध लाभ ₹{{netBenefit}} है।",
  aiRecommendationAlertTitle: "एआई अनुशंसा अलर्ट",

  // Backward compatible fixed system notifications
  inquiryReceived: "आपकी उपज लॉट पर नई खरीद पूछताछ प्राप्त हुई।",
  inquiryAccepted: "आपकी खरीद पूछताछ किसान द्वारा स्वीकार कर ली गई!",
  inquiryRejected: "आपकी खरीद पूछताछ अस्वीकार कर दी गई।",
  counterOfferReceived: "एक नया काउंटर-ऑफर प्रस्तावित किया गया।",
  orderStatusUpdated: "ऑर्डर पूर्ति स्थिति अपडेट की गई।",
  shipmentDispatched: "खेप परिवहन के लिए रवाना कर दी गई है।",
  shipmentDelivered: "खेप सफलतापूर्वक डिलीवर हो गई।"
};

const notificationsMr = {
  notificationsTitle: "सूचना व तत्काळ संदेश",
  markAllRead: "सर्व वाचलेले म्हणून चिन्हांकित करा",
  noNotifications: "कोणतीही न वाचलेली सूचना नाही",
  viewAllNotifications: "सर्व सूचना पहा",
  clearAll: "सर्व साफ करा",
  unread: "न वाचलेले",
  read: "वाचलेले",
  justNow: "आत्ताच",
  minsAgo: "{{count}} मिनिटांपूर्वी",
  hoursAgo: "{{count}} तासांपूर्वी",
  yesterday: "काल",
  daysAgo: "{{count}} दिवसांपूर्वी",

  // 1. Offer Received
  offerReceived: "तुम्हाला {{buyerName}} कडून नवीन ऑफर प्राप्त झाली आहे",
  offerReceivedDetailed: "{{buyerName}} यांनी {{quantity}} क्विंटल {{cropName}} साठी ₹{{price}}/क्विंटलची ऑफर दिली.",
  offerReceivedTitle: "नवीन ऑफर प्राप्त",

  // 2. Offer Accepted
  offerAccepted: "{{cropName}} साठी तुमची ऑफर {{farmerName}} यांनी स्वीकारली आहे",
  offerAcceptedDetailed: "{{cropName}} साठी ऑफर #{{offerId}} ₹{{price}}/क्विंटल दराने मंजूर करण्यात आली आहे.",
  offerAcceptedTitle: "ऑफर स्वीकारली",

  // 3. Offer Rejected
  offerRejected: "{{cropName}} साठी तुमची ऑफर {{farmerName}} यांनी नाकारली आहे",
  offerRejectedDetailed: "{{cropName}} साठी ऑफर #{{offerId}} नाकारण्यात आली: {{reason}}",
  offerRejectedTitle: "ऑफर नाकारली",

  // 4. Order Created
  orderCreated: "{{cropName}} च्या {{quantity}} क्विंटलसाठी ऑर्डर #{{orderId}} तयार केली गेली आहे",
  orderCreatedDetailed: "एकूण मूल्य ₹{{amount}} सह ऑर्डर #{{orderId}} यशस्वीरित्या तयार केली.",
  orderCreatedTitle: "ऑर्डर तयार केली",

  // 5. Order Confirmed
  orderConfirmed: "ऑर्डर #{{orderId}} निश्चित झाली आहे आणि एस्क्रो पेमेंट सुरक्षित केले आहे",
  orderConfirmedDetailed: "ऑर्डर #{{orderId}} निश्चित झाली. ₹{{amount}} सुरक्षित एस्क्रोमध्ये जमा आहे.",
  orderConfirmedTitle: "ऑर्डर निश्चित झाली",

  // 6. Pickup Scheduled
  pickupScheduled: "ऑर्डर #{{orderId}} चा पिकअप {{date}} रोजी {{transporterName}} सोबत नियोजित केला आहे",
  pickupScheduledDetailed: "वाहन {{vehicleNumber}} हे {{date}} रोजी {{quantity}} क्विंटल {{cropName}} च्या पिकअपसाठी नियोजित केले आहे.",
  pickupScheduledTitle: "पिकअप नियोजित",

  // 7. Delivery Update
  deliveryUpdate: "ऑर्डर #{{orderId}} साठी डिलिव्हरी अपडेट: {{status}}",
  deliveryUpdateDetailed: "ऑर्डर #{{orderId}} ची खेप आता {{location}} येथे {{status}} आहे, अंदाजित वेळ {{eta}}.",
  deliveryUpdateTitle: "डिलिव्हरी अपडेट",

  // 8. Payment Update
  paymentUpdate: "ऑर्डर #{{orderId}} साठी ₹{{amount}} चे पेमेंट {{status}} झाले आहे",
  paymentUpdateDetailed: "ऑर्डर #{{orderId}} साठी ₹{{amount}} चे पेमेंट खाते {{accountNumber}} मध्ये वर्ग करण्यात आले.",
  paymentUpdateTitle: "पेमेंट अपडेट",

  // 9. Storage Request Received
  storageRequestReceived: "{{farmerName}} कडून {{cropName}} च्या {{quantity}} क्विंटलसाठी नवीन साठवणूक विनंती प्राप्त झाली",
  storageRequestReceivedDetailed: "शेतकरी {{farmerName}} यांनी {{facilityName}} येथे {{quantity}} क्विंटल {{cropName}} साठी {{duration}} दिवसांच्या साठवणुकीची विनंती केली.",
  storageRequestReceivedTitle: "साठवणूक विनंती प्राप्त",

  // 10. Storage Request Accepted
  storageRequestAccepted: "{{facilityName}} येथे {{cropName}} साठी तुमची साठवणूक विनंती मंजूर झाली आहे",
  storageRequestAcceptedDetailed: "{{facilityName}} येथे {{quantity}} क्विंटल {{cropName}} साठी ₹{{rate}}/क्विंटल/महिना दराने साठवणूक मंजूर.",
  storageRequestAcceptedTitle: "साठवणूक विनंती मंजूर",

  // 11. Storage Request Rejected
  storageRequestRejected: "{{facilityName}} येथे {{cropName}} साठी तुमची साठवणूक विनंती नाकारली गेली",
  storageRequestRejectedDetailed: "{{facilityName}} येथे {{cropName}} साठी साठवणूक विनंती नाकारण्यात आली: {{reason}}",
  storageRequestRejectedTitle: "साठवणूक विनंती नाकारली",

  // 12. Verification Status
  verificationStatus: "तुमची पडताळणी स्थिती अपडेट होऊन {{status}} झाली आहे",
  verificationStatusDetailed: "सुविधा {{facilityName}} ची पडताळणी स्थिती आता {{status}} झाली आहे. {{comments}}",
  verificationStatusTitle: "पडताळणी स्थिती अपडेट",

  // 13. Market Alerts
  marketAlert: "बाजार अलर्ट: {{mandiName}} मध्ये {{cropName}} चा दर ₹{{price}}/क्विंटल आहे ({{change}})",
  marketAlertDetailed: "दर वाढ अलर्ट: {{mandiName}} मध्ये {{cropName}} चा दर {{changePercent}}% वाढून ₹{{price}}/क्विंटल झाला.",
  marketAlertTitle: "बाजार भाव अलर्ट",

  // 14. AI Recommendation Alerts
  aiRecommendationAlert: "एआई शिफारस: ₹{{projectedPrice}}/क्विंटल अंदाजित दरासह {{cropName}} साठी {{recommendation}} चा सल्ला देण्यात आला आहे",
  aiRecommendationAlertDetailed: "एआई सल्ला: {{cropName}} साठी, आम्ही {{recommendation}} चा सल्ला देतो. अंदाजित नफा ₹{{expectedGain}} आणि निव्वळ फायदा ₹{{netBenefit}} आहे.",
  aiRecommendationAlertTitle: "एआई शिफारस अलर्ट",

  // Backward compatible fixed system notifications
  inquiryReceived: "तुमच्या शेतमालावर नवीन खरेदी विचारणा प्राप्त झाली.",
  inquiryAccepted: "तुमची खरेदी विचारणा शेतकऱ्याने स्वीकारली आहे!",
  inquiryRejected: "तुमची खरेदी विचारणा नाकारण्यात आली.",
  counterOfferReceived: "नवीन प्रति-प्रस्ताव सादर करण्यात आला.",
  orderStatusUpdated: "ऑर्डर पूर्तता स्थिती अपडेट केली गेली.",
  shipmentDispatched: "माल वाहतुकीसाठी रवाना करण्यात आला आहे.",
  shipmentDelivered: "माल यशस्वीरित्या पोहोचवला गेला."
};

en.notifications = notificationsEn;
hi.notifications = notificationsHi;
mr.notifications = notificationsMr;

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2) + '\n', 'utf8');
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2) + '\n', 'utf8');

console.log('Successfully enriched notifications category in en.json, hi.json, and mr.json!');
