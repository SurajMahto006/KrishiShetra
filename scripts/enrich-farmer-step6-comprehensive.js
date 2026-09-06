const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'src', 'locales', 'en.json');
const hiPath = path.join(__dirname, '..', 'src', 'locales', 'hi.json');
const mrPath = path.join(__dirname, '..', 'src', 'locales', 'mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

const newKeys = {
  mandiCompare: {
    selectTop5: { en: 'Select Top 5', hi: 'शीर्ष 5 चुनें', mr: 'शीर्ष ५ निवडा' },
    nearbyUnder250: { en: 'Nearby (<250km)', hi: 'नजदीकी (<250 किमी)', mr: 'जवळचे (<२५० किमी)' }
  },
  ai: {
    smartSellingOpportunity: { en: 'Smart Selling Opportunity', hi: 'स्मार्ट बिक्री अवसर', mr: 'स्मार्ट विक्री संधी' }
  },
  storage: {
    storageTariffRate: { en: 'Storage Tariff Rate', hi: 'गोदाम शुल्क दर', mr: 'साठवणूक दर' },
    depositStartDate: { en: 'Deposit Start Date', hi: 'जमा करने की तिथि', mr: 'साठवणूक सुरू होण्याची तारीख' },
    totalEstimatedCost: { en: 'Total Estimated Cost', hi: 'कुल अनुमानित लागत', mr: 'एकूण अंदाजित खर्च' },
    additionalNotes: { en: 'Additional Notes for Facility Manager', hi: 'गोदाम प्रबंधक के लिए अतिरिक्त निर्देश', mr: 'गोदाम व्यवस्थापकासाठी अतिरिक्त सूचना' },
    submitStorageRequest: { en: 'Submit Storage Request', hi: 'भंडारण अनुरोध सबमिट करें', mr: 'साठवणूक विनंती सबमिट करा' },
    storedQuantityQuintals: { en: 'Stored Quantity (q)', hi: 'संग्रहीत मात्रा (क्विंटल)', mr: 'साठवलेले प्रमाण (क्विंटल)' },
    mandiBenchmarkRate: { en: 'Mandi Benchmark (₹/q)', hi: 'मंडी बेंचमार्क दर (₹/क्विंटल)', mr: 'बाजारभाव संदर्भ (₹/क्विंटल)' },
    produceValuation: { en: 'Total Produce Valuation', hi: 'कुल फसल मूल्यांकन', mr: 'एकूण पिकाचे मूल्यांकन' },
    maxPermissibleLoan: { en: 'Max Permissible Loan (75% LTV)', hi: 'अधिकतम अनुमत ऋण (75% LTV)', mr: 'कमाल मंजूर कर्ज (७५% LTV)' },
    requestedLoanAmount: { en: 'Requested Loan Amount (₹)', hi: 'ऋण राशि का अनुरोध (₹)', mr: 'आवश्यक कर्ज रक्कम (₹)' },
    partnerLender: { en: 'Partner Lending Institution', hi: 'साझेदार ऋणदाता बैंक/संस्थान', mr: 'भागीदार वित्तीय संस्था / बँक' },
    submitLoanRequest: { en: 'Submit Loan Request', hi: 'ऋण अनुरोध सबमिट करें', mr: 'कर्ज विनंती सबमिट करा' }
  }
};

Object.keys(newKeys).forEach(cat => {
  if (!en[cat]) en[cat] = {};
  if (!hi[cat]) hi[cat] = {};
  if (!mr[cat]) mr[cat] = {};

  Object.keys(newKeys[cat]).forEach(k => {
    en[cat][k] = newKeys[cat][k].en;
    hi[cat][k] = newKeys[cat][k].hi;
    mr[cat][k] = newKeys[cat][k].mr;
  });
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2), 'utf8');

console.log('Comprehensive farmer keys added!');
