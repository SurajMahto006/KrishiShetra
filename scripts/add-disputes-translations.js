const fs = require('fs');
const path = require('path');

const disputesEn = {
  centerTitle: 'Dispute & Grievance Redressal Center',
  centerSubtitle: 'Fair, transparent conflict resolution for trade orders. Protect your payments and resolve quality or delivery issues through certified FPO and Admin mediation.',
  raiseDispute: 'Raise a Dispute',
  paymentProtectionActive: 'KrishiShetra Payment Protection Active',
  paymentProtectionDesc: 'When an order is disputed, transaction funds are automatically held in simulated protection. No funds are cleared until both parties agree or a mediation settlement is recorded.',
  neutralProtection: '100% Neutral Protection',
  filterAll: 'All',
  filterActive: 'Active',
  filterReview: 'Review / Mediation',
  filterResolved: 'Resolved',
  myDisputes: 'My Disputes',
  mediationCases: 'Mediation Cases',
  platformDisputes: 'Platform Disputes',
  selectDispute: 'Select a Dispute',
  selectDisputeDesc: 'Click on any dispute card from the left panel to inspect the full timeline, evidence documents, simulated payment protection status, and mediation options.',
  loadingDisputes: 'Loading disputes...'
};

const disputesHi = {
  centerTitle: 'विवाद एवं शिकायत निवारण केंद्र',
  centerSubtitle: 'व्यापार आदेशों के लिए निष्पक्ष, पारदर्शी समाधान। अपने भुगतान को सुरक्षित रखें और एफपीओ एवं एडमिन मध्यस्थता से गुणवत्ता या वितरण समस्याओं का समाधान करें।',
  raiseDispute: 'विवाद दर्ज करें',
  paymentProtectionActive: 'कृषिक्षेत्र भुगतान सुरक्षा सक्रिय',
  paymentProtectionDesc: 'जब किसी आदेश पर विवाद होता है, तो लेन-देन राशि सुरक्षा में रखी जाती है। दोनों पक्षों की सहमति या मध्यस्थता निर्णय तक कोई राशि जारी नहीं की जाती।',
  neutralProtection: '100% निष्पक्ष सुरक्षा',
  filterAll: 'सभी',
  filterActive: 'सक्रिय',
  filterReview: 'समीक्षा / मध्यस्थता',
  filterResolved: 'हल किए गए',
  myDisputes: 'मेरे विवाद',
  mediationCases: 'मध्यस्थता मामले',
  platformDisputes: 'प्लेटफ़ॉर्म विवाद',
  selectDispute: 'विवाद चुनें',
  selectDisputeDesc: 'समयरेखा, साक्ष्य दस्तावेज़, भुगतान सुरक्षा स्थिति और मध्यस्थता विकल्प देखने के लिए बाईं ओर से किसी विवाद कार्ड पर क्लिक करें।',
  loadingDisputes: 'विवाद लोड हो रहे हैं...'
};

const disputesMr = {
  centerTitle: 'तक्रार व विवाद निवारण केंद्र',
  centerSubtitle: 'व्यापार ऑर्डर्ससाठी निष्पक्ष व पारदर्शक निवारण. पेमेंट सुरक्षित ठेवा आणि प्रमाणित एफपीओ व ॲडमिन मध्यस्थीद्वारे गुणवत्ता किंवा वाहतूक समस्या सोडवा.',
  raiseDispute: 'तक्रार नोंदवा',
  paymentProtectionActive: 'कृषिक्षेत्र पेमेंट सुरक्षा सक्रिय',
  paymentProtectionDesc: 'ऑर्डरवर विवाद असल्यास रक्कम सुरक्षित ठेवली जाते. दोन्ही बाजूंची सहमती किंवा मध्यस्थी निर्णय होईपर्यंत रक्कम वर्ग केली जात नाही.',
  neutralProtection: '100% निष्पक्ष सुरक्षा',
  filterAll: 'सर्व',
  filterActive: 'सक्रिय',
  filterReview: 'पुनरावलोकन / मध्यस्थी',
  filterResolved: 'निवारण झालेले',
  myDisputes: 'माझे विवाद',
  mediationCases: 'मध्यस्थी प्रकरणे',
  platformDisputes: 'प्लॅटफॉर्म विवाद',
  selectDispute: 'तक्रार निवडा',
  selectDisputeDesc: 'टाईमलाइन, पुरावे, पेमेंट सुरक्षा स्थिती व मध्यस्थी पर्याय पाहण्यासाठी डावीकडील कार्डवर क्लिक करा.',
  loadingDisputes: 'विवाद लोड होत आहेत...'
};

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add into en translation
  if (!content.includes('"disputes":')) {
    const enBlock = ',\n  "disputes": ' + JSON.stringify(disputesEn, null, 4);
    content = content.replace(
      /("demand":\s*\{[\s\S]*?\n\s*\})/,
      '$1' + enBlock
    );
  }

  // Check hi
  const hiBlock = ',\n  "disputes": ' + JSON.stringify(disputesHi, null, 4);
  const parts = content.split(/(\b(?:en|hi|mr):\s*\{\s*translation:\s*\{)/);

  for (let i = 1; i < parts.length; i += 2) {
    const header = parts[i];
    let lang = 'en';
    if (header.startsWith('hi:')) lang = 'hi';
    else if (header.startsWith('mr:')) lang = 'mr';

    let sec = parts[i + 1];
    if (lang === 'hi' && !sec.includes('"disputes":')) {
      sec = sec.replace(/("demand":\s*\{[\s\S]*?\n\s*\})/, '$1' + ',\n  "disputes": ' + JSON.stringify(disputesHi, null, 4));
    } else if (lang === 'mr' && !sec.includes('"disputes":')) {
      sec = sec.replace(/("demand":\s*\{[\s\S]*?\n\s*\})/, '$1' + ',\n  "disputes": ' + JSON.stringify(disputesMr, null, 4));
    }
    parts[i + 1] = sec;
  }

  content = parts.join('');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added disputes translations to', path.basename(filePath));
}

patchFile(path.join(__dirname, '..', 'js', 'i18n.js'));
patchFile(path.join(__dirname, '..', 'src', 'i18n.js'));
