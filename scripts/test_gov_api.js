const https = require('https');

function request(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

async function inspectCeda() {
  require('dotenv').config();
  const CEDAMarketPriceProvider = require('../server/services/providers/cedaMarketPriceProvider');
  const provider = new CEDAMarketPriceProvider();
  const rawGeo = await provider._request('/agmarknet/geographies');
  const list = rawGeo.output.data.filter(g => g.census_state_id === 27);
  console.log('Maharashtra districts:');
  list.forEach(d => console.log(`  { id: ${d.census_district_id}, name: '${d.census_district_name}' },`));
}

inspectCeda();
