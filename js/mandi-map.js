/**
 * KRISHISHETRA - INDIA MANDI MAP (GPS System)
 * Leaflet + OpenStreetMap tiles (zero API key required)
 * 45+ APMC mandis with real GPS coordinates (lat/lng)
 * Features: GPS geolocation, marker clustering, AI selling assistant,
 *           crop/state/radius filters, Google Maps directions
 */

// --- MANDI DATASET: 45 mandis with GPS coordinates ---

const MANDI_MAP_DATA = [
  // MAHARASHTRA
  { id:'mandi-chandwad',  name:'Chandwad APMC',            state:'Maharashtra',   district:'Nashik',       lat:20.3276, lng:74.2415, status:'open', arrivals:1250, buyersCount:62 },
  { id:'mandi-lasalgaon', name:'Lasalgaon APMC',           state:'Maharashtra',   district:'Nashik',       lat:20.1472, lng:74.2269, status:'open', arrivals:3200, buyersCount:164 },
  { id:'mandi-chandrapur',name:'Chandrapur Mandi',         state:'Maharashtra',   district:'Chandrapur',  lat:19.9615, lng:79.2961, status:'open', arrivals:880,  buyersCount:44 },
  { id:'mandi-pune',      name:'Pune APMC',               state:'Maharashtra',   district:'Pune',         lat:18.4901, lng:73.8679, status:'open', arrivals:1420, buyersCount:84 },
  { id:'mandi-mumbai',    name:'Mumbai APMC (Vashi)',      state:'Maharashtra',   district:'Navi Mumbai',  lat:19.0734, lng:73.0039, status:'open', arrivals:2650, buyersCount:142 },
  { id:'mandi-nashik',    name:'Nashik APMC',              state:'Maharashtra',   district:'Nashik',       lat:20.0125, lng:73.7915, status:'open', arrivals:1850, buyersCount:96 },
  { id:'mandi-nagpur',    name:'Nagpur APMC',              state:'Maharashtra',   district:'Nagpur',       lat:21.1685, lng:79.1288, status:'open', arrivals:1620, buyersCount:78 },
  { id:'mandi-solapur',   name:'Solapur APMC',             state:'Maharashtra',   district:'Solapur',      lat:17.6715, lng:75.9104, status:'open', arrivals:980,  buyersCount:52 },
  { id:'mandi-kolhapur',  name:'Kolhapur APMC',            state:'Maharashtra',   district:'Kolhapur',     lat:16.6956, lng:74.2317, status:'open', arrivals:890,  buyersCount:46 },
  { id:'mandi-aurangabad',name:'Chhatrapati Sambhajinagar APMC',state:'Maharashtra',district:'Sambhajinagar',lat:19.8824,lng:75.3522,status:'open',arrivals:1140,buyersCount:64 },
  { id:'mandi-latur',     name:'Latur APMC',               state:'Maharashtra',   district:'Latur',        lat:18.4088, lng:76.5604, status:'open', arrivals:1560, buyersCount:88 },
  { id:'mandi-jalgaon',   name:'Jalgaon APMC',             state:'Maharashtra',   district:'Jalgaon',      lat:21.0077, lng:75.5626, status:'open', arrivals:1480, buyersCount:82 },
  // PUNJAB & CHANDIGARH & HARYANA
  { id:'mandi-chandigarh',name:'Chandigarh Mandi',         state:'Chandigarh',    district:'Chandigarh',   lat:30.7333, lng:76.7794, status:'open', arrivals:2100, buyersCount:108 },
  { id:'mandi-khanna',    name:'Khanna Mandi',             state:'Punjab',        district:'Ludhiana',     lat:30.7071, lng:76.2167, status:'open', arrivals:4200, buyersCount:186 },
  { id:'mandi-ludhiana',  name:'Ludhiana Mandi',           state:'Punjab',        district:'Ludhiana',     lat:30.9010, lng:75.8573, status:'open', arrivals:3100, buyersCount:145 },
  { id:'mandi-amritsar',  name:'Amritsar Mandi',           state:'Punjab',        district:'Amritsar',     lat:31.6340, lng:74.8723, status:'open', arrivals:2750, buyersCount:120 },
  { id:'mandi-karnal',    name:'Karnal APMC',              state:'Haryana',       district:'Karnal',       lat:29.6857, lng:76.9905, status:'open', arrivals:3200, buyersCount:148 },
  { id:'mandi-hisar',     name:'Hisar Mandi',              state:'Haryana',       district:'Hisar',        lat:29.1492, lng:75.7217, status:'open', arrivals:2150, buyersCount:96 },
  // MADHYA PRADESH
  { id:'mandi-indore',    name:'Indore Mandi',             state:'Madhya Pradesh',district:'Indore',       lat:22.7196, lng:75.8577, status:'open', arrivals:2850, buyersCount:135 },
  { id:'mandi-bhopal',    name:'Bhopal Mandi',             state:'Madhya Pradesh',district:'Bhopal',       lat:23.2599, lng:77.4126, status:'open', arrivals:1750, buyersCount:82 },
  { id:'mandi-ujjain',    name:'Ujjain Mandi',             state:'Madhya Pradesh',district:'Ujjain',       lat:23.1765, lng:75.7885, status:'open', arrivals:1420, buyersCount:68 },
  { id:'mandi-gwalior',   name:'Gwalior Mandi',            state:'Madhya Pradesh',district:'Gwalior',      lat:26.2183, lng:78.1828, status:'open', arrivals:1380, buyersCount:66 },
  // GUJARAT
  { id:'mandi-ahmedabad', name:'Ahmedabad APMC',           state:'Gujarat',       district:'Ahmedabad',    lat:23.0225, lng:72.5714, status:'open', arrivals:2350, buyersCount:118 },
  { id:'mandi-rajkot',    name:'Rajkot APMC',              state:'Gujarat',       district:'Rajkot',       lat:22.3039, lng:70.8022, status:'open', arrivals:2150, buyersCount:112 },
  { id:'mandi-surat',     name:'Surat APMC',               state:'Gujarat',       district:'Surat',        lat:21.1702, lng:72.8311, status:'open', arrivals:1880, buyersCount:94 },
  // UTTAR PRADESH & BIHAR
  { id:'mandi-lucknow',   name:'Lucknow Mandi',            state:'Uttar Pradesh', district:'Lucknow',      lat:26.8467, lng:80.9462, status:'open', arrivals:2550, buyersCount:124 },
  { id:'mandi-kanpur',    name:'Kanpur APMC',              state:'Uttar Pradesh', district:'Kanpur',       lat:26.4499, lng:80.3319, status:'open', arrivals:2420, buyersCount:115 },
  { id:'mandi-agra',      name:'Agra Mandi',               state:'Uttar Pradesh', district:'Agra',         lat:27.1767, lng:78.0081, status:'open', arrivals:2950, buyersCount:138 },
  { id:'mandi-varanasi',  name:'Varanasi Mandi',           state:'Uttar Pradesh', district:'Varanasi',     lat:25.3176, lng:82.9739, status:'open', arrivals:1850, buyersCount:88 },
  { id:'mandi-patna',     name:'Patna Mandi',              state:'Bihar',         district:'Patna',        lat:25.5941, lng:85.1376, status:'open', arrivals:2150, buyersCount:96 },
  // RAJASTHAN
  { id:'mandi-jaipur',    name:'Jaipur Mandi',             state:'Rajasthan',     district:'Jaipur',       lat:26.9124, lng:75.7873, status:'open', arrivals:2480, buyersCount:122 },
  { id:'mandi-kota',      name:'Kota Mandi',               state:'Rajasthan',     district:'Kota',         lat:25.2138, lng:75.8648, status:'open', arrivals:2650, buyersCount:130 },
  { id:'mandi-jodhpur',   name:'Jodhpur Mandi',            state:'Rajasthan',     district:'Jodhpur',      lat:26.2389, lng:73.0243, status:'open', arrivals:1520, buyersCount:74 },
  // KARNATAKA
  { id:'mandi-bengaluru', name:'Bengaluru APMC',           state:'Karnataka',     district:'Bengaluru',    lat:13.0189, lng:77.5456, status:'open', arrivals:2890, buyersCount:146 },
  { id:'mandi-hubballi',  name:'Hubballi APMC',            state:'Karnataka',     district:'Dharwad',      lat:15.3647, lng:75.1240, status:'open', arrivals:1840, buyersCount:92 },
  { id:'mandi-raichur',   name:'Raichur APMC',             state:'Karnataka',     district:'Raichur',      lat:16.2120, lng:77.3439, status:'open', arrivals:1820, buyersCount:90 },
  // TELANGANA & ANDHRA PRADESH
  { id:'mandi-hyderabad', name:'Hyderabad APMC',           state:'Telangana',     district:'Hyderabad',    lat:17.3850, lng:78.4867, status:'open', arrivals:2750, buyersCount:140 },
  { id:'mandi-warangal',  name:'Warangal APMC',            state:'Telangana',     district:'Warangal',     lat:17.9689, lng:79.5941, status:'open', arrivals:2450, buyersCount:118 },
  { id:'mandi-guntur',    name:'Guntur APMC',              state:'Andhra Pradesh',district:'Guntur',       lat:16.3067, lng:80.4365, status:'open', arrivals:3600, buyersCount:175 },
  { id:'mandi-vijayawada',name:'Vijayawada APMC',          state:'Andhra Pradesh',district:'Krishna',      lat:16.5062, lng:80.6480, status:'open', arrivals:2200, buyersCount:110 },
  // TAMIL NADU
  { id:'mandi-chennai',   name:'Chennai Koyambedu Mandi',  state:'Tamil Nadu',    district:'Chennai',      lat:13.0694, lng:80.1948, status:'open', arrivals:3400, buyersCount:165 },
  { id:'mandi-coimbatore',name:'Coimbatore Mandi',         state:'Tamil Nadu',    district:'Coimbatore',   lat:11.0168, lng:76.9558, status:'open', arrivals:2150, buyersCount:104 },
  { id:'mandi-madurai',   name:'Madurai Mandi',            state:'Tamil Nadu',    district:'Madurai',      lat:9.9252,  lng:78.1198, status:'open', arrivals:1890, buyersCount:92 },
  // WEST BENGAL & ODISHA
  { id:'mandi-kolkata',   name:'Kolkata Mandi',            state:'West Bengal',   district:'Kolkata',      lat:22.5726, lng:88.3639, status:'open', arrivals:2950, buyersCount:148 },
  { id:'mandi-bhubaneswar',name:'Bhubaneswar Mandi',       state:'Odisha',        district:'Khurda',       lat:20.2961, lng:85.8245, status:'open', arrivals:1850, buyersCount:88 },
  // CHHATTISGARH, KERALA, ASSAM
  { id:'mandi-raipur',    name:'Raipur Mandi',             state:'Chhattisgarh',  district:'Raipur',       lat:21.2514, lng:81.6296, status:'open', arrivals:2450, buyersCount:120 },
  { id:'mandi-kochi',     name:'Kochi Mandi',              state:'Kerala',        district:'Ernakulam',    lat:9.9312,  lng:76.2673, status:'open', arrivals:1820, buyersCount:94 },
  { id:'mandi-guwahati',  name:'Guwahati Mandi',           state:'Assam',         district:'Kamrup',       lat:26.1445, lng:91.7362, status:'open', arrivals:1520, buyersCount:78 },
  { id:'mandi-shimla',    name:'Shimla Mandi',             state:'Himachal Pradesh',district:'Shimla',     lat:31.1048, lng:77.1734, status:'open', arrivals:1250, buyersCount:68 },
  { id:'mandi-jammu',     name:'Jammu Mandi',              state:'Jammu & Kashmir',district:'Jammu',       lat:32.7266, lng:74.8570, status:'open', arrivals:1650, buyersCount:84 }
];

const CROP_CHANGE_PCT = { rice:5.2, wheat:6.2, onion:3.8, tomato:-1.4, maize:2.1, soybean:4.8, potato:0.8, chilli:7.2, groundnut:3.4, cotton:-0.6, sugarcane:1.8, mango:6.5, banana:2.2, grapes:4.1, pulses:3.9 };

// â”€â”€â”€ 2. UTILITIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, d2r = Math.PI / 180;
  const dLat = (lat2 - lat1) * d2r, dLng = (lng2 - lng1) * d2r;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*d2r)*Math.cos(lat2*d2r)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function fmtDist(km) { return km < 1 ? Math.round(km*1000)+'m' : km < 10 ? km.toFixed(1)+'km' : Math.round(km)+'km'; }
function fmtPrice(p) { return p ? '\u20B9'+p.toLocaleString('en-IN')+'/q' : 'N/A'; }
function demandLabel(d) { return d==='high' ? '\uD83D\uDD25 High Demand' : d==='low' ? 'Low Demand' : 'Medium Demand'; }

// â”€â”€â”€ 3. MAP ENGINE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

var mandiMapEngine = null;

function MandiMapEngine() {
  this.map = null;
  this.cluster = null;
  this.markers = [];
  this.locMarker = null;
  this.userLat = 20.5937;
  this.userLng = 78.9629;
  this.userName = null;
  this.crop = 'rice';
  this.distFilter = 0;
  this.stateFilter = 'all';
  this.searchQ = '';
  this.distances = {};
  this.mandiGovPrices = {};
  this.bestNearby = null;
  this.bestPrice = null;
}

MandiMapEngine.prototype.fetchGovPrices = function(crop) {
  var self = this;
  self.mandiGovPrices = self.mandiGovPrices || {};
  self.mandiGovPrices[crop] = self.mandiGovPrices[crop] || {};

  var apiPromise = (window.api && window.api.market && typeof window.api.market.getMandiPrices === 'function')
    ? window.api.market.getMandiPrices({ commodity: crop, limit: 250 })
    : fetch('/api/market/mandi-prices?commodity=' + encodeURIComponent(crop) + '&limit=250').then(function(r){ return r.json(); });

  return apiPromise.then(function(res) {
    if (res && res.success && Array.isArray(res.data)) {
      res.data.forEach(function(rec) {
        var recMkt = (rec.market || '').toLowerCase();
        var recDist = (rec.district || '').toLowerCase();
        var recState = (rec.state || '').toLowerCase();

        MANDI_MAP_DATA.forEach(function(m) {
          var mName = m.name.toLowerCase();
          var mDist = m.district.toLowerCase();
          var mState = m.state.toLowerCase();

          // Strict anti-collision for Chandigarh, Chandwad, and Chandrapur
          if (m.id === 'mandi-chandigarh' && (recMkt.includes('chandwad') || recMkt.includes('chandrapur'))) return;
          if (m.id === 'mandi-chandwad' && (recMkt.includes('chandigarh') || recMkt.includes('chandrapur'))) return;
          if (m.id === 'mandi-chandrapur' && (recMkt.includes('chandigarh') || recMkt.includes('chandwad'))) return;

          var matches = (mName.includes(recMkt) || recMkt.includes(mName.replace(' apmc','').replace(' mandi','')) || (mDist && recMkt.includes(mDist))) &&
                        (!recState || mState.includes(recState) || recState.includes(mState));

          if (matches && rec.modalPrice > 0) {
            self.mandiGovPrices[crop][m.id] = {
              modalPrice: rec.modalPrice,
              minPrice: rec.minPrice,
              maxPrice: rec.maxPrice,
              reportDate: rec.reportDate || rec.arrivalDate || 'Recent',
              status: rec.status || (res.sourceStatus === 'live' ? 'LIVE' : 'CACHED'),
              source: rec.source || 'Government of India / AGMARKNET'
            };
          }
        });
      });
    }
  }).catch(function() {
    // Government data temporarily unavailable
  });
};

MandiMapEngine.prototype.init = function() {
  var self = this;
  this.calcDistances();
  this.bindControls();
  this.initMap();
  this.fetchGovPrices(this.crop).then(function() {
    self.refreshBest();
    self.renderMarkers();
    self.renderList();
    self.updateAI();
  });
};

MandiMapEngine.prototype.calcDistances = function() {
  var self = this;
  MANDI_MAP_DATA.forEach(function(m) {
    self.distances[m.id] = haversine(self.userLat, self.userLng, m.lat, m.lng);
  });
};

MandiMapEngine.prototype.filtered = function() {
  var self = this, list = MANDI_MAP_DATA.slice();
  if (self.stateFilter !== 'all') list = list.filter(function(m){ return m.state === self.stateFilter; });
  if (self.searchQ) { var q = self.searchQ.toLowerCase(); list = list.filter(function(m){ return m.name.toLowerCase().includes(q)||m.district.toLowerCase().includes(q)||m.state.toLowerCase().includes(q); }); }
  if (self.distFilter > 0 && self.userName) list = list.filter(function(m){ return self.distances[m.id] <= self.distFilter; });
  list.sort(function(a,b){ return self.distances[a.id]-self.distances[b.id]; });
  return list;
};

MandiMapEngine.prototype.refreshBest = function() {
  var list = this.filtered(), crop = this.crop, self = this;
  var govMap = (self.mandiGovPrices && self.mandiGovPrices[crop]) || {};
  var withGovPrices = list.filter(function(m) { return govMap[m.id] && govMap[m.id].modalPrice > 0; });

  if (!withGovPrices.length) { this.bestNearby = null; this.bestPrice = null; return; }
  this.bestPrice = withGovPrices.reduce(function(best,m){
    var pM = govMap[m.id].modalPrice;
    var pB = govMap[best.id].modalPrice;
    return pM > pB ? m : best;
  }, withGovPrices[0]);

  if (!this.userName) { this.bestNearby = this.bestPrice; return; }
  var dists = withGovPrices.map(function(m){ return self.distances[m.id]; });
  var prices = withGovPrices.map(function(m){ return govMap[m.id].modalPrice; });
  var maxP = Math.max.apply(null,prices), minP = Math.min.apply(null,prices), rP = maxP-minP||1;
  var maxD = Math.max.apply(null,dists), minD = Math.min.apply(null,dists), rD = maxD-minD||1;
  var best = null, bestScore = -Infinity;
  withGovPrices.forEach(function(m){
    var pn = (govMap[m.id].modalPrice - minP)/rP;
    var dn = 1-((self.distances[m.id]-minD)/rD);
    var score = pn*0.6+dn*0.4;
    if (score > bestScore) { bestScore = score; best = m; }
  });
  this.bestNearby = best;
};

MandiMapEngine.prototype.initMap = function() {
  var self = this;
  var el = document.getElementById('mandi-map');
  if (!el) return;
  if (el._leaflet_id) { setTimeout(function(){ if(self.map) self.map.invalidateSize(); }, 200); return; }

  var indiaBounds = L.latLngBounds(L.latLng(6.5, 68.0), L.latLng(36.0, 97.5));

  self.map = L.map('mandi-map', {
    center: [22.5, 80.0],
    zoom: 5,
    minZoom: 4,
    maxZoom: 18,
    maxBounds: indiaBounds,
    maxBoundsViscosity: 0.9,
    zoomControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: ['a','b','c']
  }).addTo(self.map);

  if (typeof L.markerClusterGroup === 'function') {
    self.cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: function(c) {
        var n = c.getChildCount();
        var sz = n<=10?36:n<=30?44:52;
        return L.divIcon({
          html: '<div style="width:'+sz+'px;height:'+sz+'px;background:#12372A;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:3px solid rgba(255,255,255,0.85);box-shadow:0 3px 10px rgba(0,0,0,0.3);flex-direction:column;line-height:1.1;"><span>'+n+'</span><span style="font-size:9px;opacity:0.8;">mandis</span></div>',
          className: '',
          iconSize: [sz, sz],
          iconAnchor: [sz/2, sz/2]
        });
      }
    });
    self.map.addLayer(self.cluster);
  }

  self.map.on('click', function(){ self.closePopup(); });
  self.map.on('zoomend', function(){ self.renderMarkers(); });

  var loadEl = document.getElementById('mandi-map-loading');
  if (loadEl) loadEl.style.display = 'none';

  self.renderMarkers();

  setTimeout(function(){ if(self.map) self.map.invalidateSize(); }, 300);
  setTimeout(function(){ if(self.map) self.map.invalidateSize(); }, 1000);
};

MandiMapEngine.prototype.renderMarkers = function() {
  var self = this;
  if (!self.map) return;
  if (self.cluster) self.cluster.clearLayers(); else self.markers.forEach(function(m){ self.map.removeLayer(m); });
  self.markers = [];

  var list = self.filtered(), crop = self.crop, zoom = self.map.getZoom(), compact = zoom < 7;
  var govMap = (self.mandiGovPrices && self.mandiGovPrices[crop]) || {};

  list.forEach(function(mandi) {
    var gov = govMap[mandi.id];
    var isBest = self.bestNearby && mandi.id === self.bestNearby.id;
    var short = mandi.name.replace(' APMC','').replace(' Mandi','');
    var priceStr = gov && gov.modalPrice > 0 ? ('₹' + gov.modalPrice.toLocaleString('en-IN') + '/q') : 'Unavailable';
    var priceColor = gov && gov.modalPrice > 0 ? '#5B9A72' : '#92400E';

    var html;
    if (compact && !isBest) {
      html = '<div style="width:10px;height:10px;background:'+(isBest?'#d4a843':'#12372A')+';border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);" title="'+mandi.name+' \u00b7 '+priceStr+'"></div>';
    } else {
      var bg = isBest ? '#fffdf0' : '#ffffff';
      var border = isBest ? '#d4a843' : (gov && gov.modalPrice > 0 ? '#5B9A72' : '#D1D5DB');
      html = '<div style="background:'+bg+';border:1.5px solid '+border+';border-radius:8px;padding:3px 8px;box-shadow:0 3px 8px rgba(0,0,0,0.18);white-space:nowrap;display:flex;align-items:center;gap:4px;">'
           + (isBest ? '<span style="font-size:11px;">\uD83C\uDFC5</span>' : '')
           + '<div><div style="font-size:11px;font-weight:700;color:#12372A;">'+(isBest?'<b>'+short+'</b>':short)+'</div>'
           + '<div style="font-size:10px;font-weight:700;color:'+priceColor+';">'+priceStr+'</div></div>'
           + '</div>'
           + '<div style="width:8px;height:8px;background:'+border+';transform:rotate(45deg);margin:-4px auto 0;border-radius:1px;"></div>';
    }

    var w = compact&&!isBest ? 14 : isBest ? 130 : 110;
    var h = compact&&!isBest ? 14 : 44;

    var icon = L.divIcon({ className:'', html:html, iconSize:[w,h], iconAnchor:[w/2,h] });
    var mk = L.marker([mandi.lat, mandi.lng], { icon:icon, zIndexOffset: isBest?800:100, title:mandi.name+' \u2013 '+priceStr });
    mk.on('click', function(e){ L.DomEvent.stopPropagation(e); self.showPopup(mandi); });
    if (self.cluster) self.cluster.addLayer(mk); else mk.addTo(self.map);
    self.markers.push(mk);
  });

  // User location marker
  if (self.locMarker) { self.map.removeLayer(self.locMarker); self.locMarker = null; }
  if (self.userName) {
    var locIcon = L.divIcon({
      className: '',
      html: '<div style="width:20px;height:20px;position:relative;"><div style="position:absolute;inset:0;background:#4285F4;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(66,133,244,0.5);"></div><div style="position:absolute;inset:-8px;background:rgba(66,133,244,0.2);border-radius:50%;animation:locPulse 2s infinite;"></div></div>',
      iconSize:[20,20], iconAnchor:[10,10]
    });
    self.locMarker = L.marker([self.userLat, self.userLng], { icon:locIcon, zIndexOffset:1200, interactive:false }).addTo(self.map);
  }
};

MandiMapEngine.prototype.showPopup = function(mandi) {
  var self = this;
  self.closePopup();
  var crop = self.crop;
  var govMap = (self.mandiGovPrices && self.mandiGovPrices[crop]) || {};
  var gov = govMap[mandi.id];
  var dist = self.userName ? fmtDist(self.distances[mandi.id]) : null;
  var isBest = self.bestNearby && mandi.id === self.bestNearby.id;
  var cropCapitalized = crop.charAt(0).toUpperCase() + crop.slice(1);

  var priceHtml = '';
  if (gov && gov.modalPrice > 0) {
    var minMaxText = (gov.minPrice && gov.maxPrice) ? ('Min ₹' + gov.minPrice.toLocaleString('en-IN') + ' · Max ₹' + gov.maxPrice.toLocaleString('en-IN')) : '';
    priceHtml = '<div style="border-top:1px solid #E2E0D5;padding-top:10px;margin-top:4px;">'
      + '<div style="font-size:12px;font-weight:700;color:#12372A;margin-bottom:2px;">' + cropCapitalized + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">'
      + '<span style="font-size:18px;font-weight:800;color:#5B9A72;">₹' + gov.modalPrice.toLocaleString('en-IN') + '/qtl</span>'
      + '</div>'
      + (minMaxText ? '<div style="font-size:11px;color:#6F7F75;margin-bottom:4px;">' + minMaxText + '</div>' : '')
      + '<div style="font-size:11px;color:#065F46;font-weight:600;margin-top:4px;">'
      + '<span>📅 Reported: ' + (gov.reportDate || 'Recent') + '</span><br>'
      + '<span>🏛️ ' + (gov.status === 'LIVE' ? 'Government live price' : 'Government-reported price') + '</span>'
      + '</div>'
      + '</div>';
  } else {
    priceHtml = '<div style="border-top:1px solid #E2E0D5;padding-top:10px;margin-top:4px;">'
      + '<div style="font-size:12px;font-weight:700;color:#12372A;margin-bottom:2px;">' + cropCapitalized + '</div>'
      + '<div style="font-size:14px;font-weight:700;color:#92400E;margin-bottom:2px;">Price unavailable</div>'
      + '<div style="font-size:11.5px;color:#6F7F75;">No recent government report available</div>'
      + '</div>';
  }

  var html = '<div class="mandi-popup mandi-popup--visible" id="mandi-popup-active">'
    + '<button class="mandi-popup__close" onclick="mandiMapEngine.closePopup()">\u00d7</button>'
    + (isBest ? '<div style="font-size:11px;font-weight:700;color:#d4a843;margin-bottom:6px;">\uD83C\uDFC5 Top Option</div>' : '')
    + '<h3 class="mandi-popup__title">'+mandi.name+'</h3>'
    + '<p style="font-size:12px;color:#6F7F75;margin:2px 0 8px;">'+(dist?dist+' away \u00b7 ':'')+mandi.district+', '+mandi.state+'</p>'
    + priceHtml
    + '<div style="display:flex;gap:8px;margin-top:12px;">'
    + '<button class="btn btn--primary btn--sm" onclick="mandiMapEngine.openDetails(\''+mandi.id+'\')">View Details</button>'
    + '<button class="btn btn--secondary btn--sm" onclick="mandiMapEngine.getNav('+mandi.lat+','+mandi.lng+',\''+mandi.name.replace(/'/g,"\\'")+'\')" >Directions</button>'
    + '</div></div>';

  var c = document.getElementById('mandi-popup-container');
  if (c) { c.innerHTML = html; c.style.display = 'block'; }
  if (self.map) self.map.flyTo([mandi.lat, mandi.lng], Math.max(self.map.getZoom(), 9), { animate:true, duration:0.5 });
};

MandiMapEngine.prototype.closePopup = function() {
  var c = document.getElementById('mandi-popup-container');
  if (c) { c.style.display = 'none'; c.innerHTML = ''; }
};

MandiMapEngine.prototype.openDetails = function(id) {
  var mandi = MANDI_MAP_DATA.find(function(m){ return m.id===id; });
  if (!mandi) return;
  var self = this, crop = self.crop;
  var dist = self.userName ? ' \u00b7 '+fmtDist(self.distances[id])+' from you' : '';
  var nameEl = document.getElementById('mandi-modal-name');
  var locEl = document.getElementById('mandi-modal-location');
  var bodyEl = document.getElementById('mandi-details-modal-body');
  var overlay = document.getElementById('mandi-details-modal-overlay');
  if (!overlay || !bodyEl) return;
  if (nameEl) nameEl.textContent = mandi.name;
  if (locEl) locEl.textContent = mandi.district+', '+mandi.state+dist;

  var govMap = (self.mandiGovPrices && self.mandiGovPrices[crop]) || {};
  var gov = govMap[mandi.id];
  var cropCapitalized = crop.charAt(0).toUpperCase() + crop.slice(1);

  var priceDetailHtml = '';
  if (gov && gov.modalPrice > 0) {
    priceDetailHtml = '<div style="background:#F5F4ED;border-radius:10px;padding:16px;margin-bottom:20px;">'
      + '<div style="font-size:12px;font-weight:700;color:#6F7F75;text-transform:uppercase;letter-spacing:0.5px;">Current Commodity: ' + cropCapitalized + '</div>'
      + '<div style="font-size:26px;font-weight:800;color:#12372A;margin:6px 0;">₹' + gov.modalPrice.toLocaleString('en-IN') + '<span style="font-size:14px;font-weight:500;color:#6F7F75;"> /qtl</span></div>'
      + '<div style="display:flex;gap:16px;font-size:13px;color:#12372A;margin-bottom:8px;">'
      + '<span>Min: <b>₹' + (gov.minPrice ? gov.minPrice.toLocaleString('en-IN') : 'N/A') + '</b></span>'
      + '<span>Max: <b>₹' + (gov.maxPrice ? gov.maxPrice.toLocaleString('en-IN') : 'N/A') + '</b></span>'
      + '</div>'
      + '<div style="font-size:12px;color:#065F46;font-weight:600;display:flex;align-items:center;gap:6px;">'
      + '<span>🏛️ ' + (gov.source || 'Government of India / AGMARKNET') + '</span>'
      + '<span>\u00b7</span>'
      + '<span>📅 Reported: ' + (gov.reportDate || 'Recent') + '</span>'
      + '</div>'
      + '</div>';
  } else {
    priceDetailHtml = '<div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:10px;padding:16px;margin-bottom:20px;">'
      + '<div style="font-size:14px;font-weight:700;color:#92400E;margin-bottom:4px;">Price currently unavailable for ' + cropCapitalized + '</div>'
      + '<div style="font-size:12px;color:#78350F;">No recent government report is available for this commodity at this mandi.</div>'
      + '</div>';
  }

  bodyEl.innerHTML = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">'
    + '<div style="background:#F5F4ED;padding:12px;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#6F7F75;">Daily Arrivals</div><div style="font-size:18px;font-weight:800;color:#12372A;">'+mandi.arrivals.toLocaleString('en-IN')+' t</div></div>'
    + '<div style="background:#F5F4ED;padding:12px;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#6F7F75;">Registered Buyers</div><div style="font-size:18px;font-weight:800;color:#12372A;">'+mandi.buyersCount+'</div></div>'
    + '<div style="background:#EAF6ED;padding:12px;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#6F7F75;">Status</div><div style="font-size:14px;font-weight:700;color:#5B9A72;">\uD83D\uDFE2 Open</div></div>'
    + '</div>'
    + priceDetailHtml
    + '<div style="display:flex;gap:10px;margin-top:20px;">'
    + '<button class="btn btn--primary" onclick="mandiMapEngine.getNav('+mandi.lat+','+mandi.lng+',\''+mandi.name.replace(/'/g,"\\'")+'\')">\uD83D\uDCCD Start Navigation (Google Maps)</button>'
    + '<button class="btn btn--secondary" onclick="document.getElementById(\'mandi-details-modal-overlay\').classList.remove(\'active\')">Close</button>'
    + '</div>';

  overlay.classList.add('active');
};

MandiMapEngine.prototype.getNav = function(lat, lng, name) {
  window.open('https://www.google.com/maps/dir/?api=1&destination='+lat+','+lng+'&travelmode=driving', '_blank');
};

MandiMapEngine.prototype.updateAI = function() {
  var msgEl = document.getElementById('mandi-ai-msg');
  var actEl = document.getElementById('mandi-ai-actions');
  var tagEl = document.getElementById('mandi-ai-crop-tag');
  if (!msgEl) return;

  var crop = this.crop, cropName = crop.charAt(0).toUpperCase()+crop.slice(1);
  var emojis = { rice:'\uD83C\uDF3E', wheat:'\uD83C\uDF3E', onion:'\uD83E\uDDC5', tomato:'\uD83C\uDF45', maize:'\uD83C\uDF3D', soybean:'\uD83E\uDEB8', potato:'\uD83E\uDD54', chilli:'\uD83C\uDF36', groundnut:'\uD83E\uDD5C', cotton:'\u2601\uFE0F', sugarcane:'\uD83C\uDF8B', mango:'\uD83E\uDD6D', banana:'\uD83C\uDF4C', grapes:'\uD83C\uDF47', pulses:'\uD83E\uDD63' };
  if (tagEl) tagEl.textContent = (emojis[crop]||'\uD83C\uDF3E')+' '+cropName+' Analysis';

  var best = this.bestNearby;
  if (!best) { msgEl.textContent = 'No mandis with recent government data found for this selection.'; return; }

  var govMap = (this.mandiGovPrices && this.mandiGovPrices[crop]) || {};
  var gov = govMap[best.id];
  var dist = this.userName ? ' (' + fmtDist(this.distances[best.id]) + ' from you)' : '';

  if (gov && gov.modalPrice > 0) {
    msgEl.innerHTML = 'For <strong>'+cropName+'</strong>, <strong>'+best.name+'</strong>'+dist+' has the best government-reported modal price at <strong>₹'+gov.modalPrice.toLocaleString('en-IN')+'/qtl</strong> (Reported: '+ (gov.reportDate || 'Recent') +'). '+(this.userName?'':'Set your location for personalised advice.');
  } else {
    msgEl.innerHTML = 'Government price report for <strong>'+cropName+'</strong> is currently unavailable for nearby mandis.';
  }

  if (actEl) {
    actEl.innerHTML = '<button class="btn btn--primary btn--sm" onclick="mandiMapEngine.showPopup(MANDI_MAP_DATA.find(function(m){return m.id===\''+best.id+'\'}))">\uD83D\uDC41 View on Map</button>'
      + '<button class="btn btn--secondary btn--sm" onclick="mandiMapEngine.openDetails(\''+best.id+'\')">\uD83D\uDCC4 Full Details</button>'
      + '<button class="btn btn--secondary btn--sm" onclick="mandiMapEngine.getNav('+best.lat+','+best.lng+',\''+best.name.replace(/'/g,"\\'")+'\')">\uD83D\uDCCD Directions</button>';
  }
};

MandiMapEngine.prototype.renderList = function() {
  var self = this, container = document.getElementById('mandi-list-panel');
  if (!container) return;

  var list = self.filtered(), crop = self.crop;
  var govMap = (self.mandiGovPrices && self.mandiGovPrices[crop]) || {};

  if (!list.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#6F7F75;">'
      + '<div style="font-size:32px;margin-bottom:8px;">\uD83D\uDDFA\uFE0F</div>'
      + '<p style="font-weight:600;">No mandis found</p>'
      + '<button class="btn btn--secondary btn--sm" onclick="mandiMapEngine.setDist(0)" style="margin-top:8px;">View All India</button>'
      + '</div>'; return;
  }

  var html = '<div style="font-size:13px;font-weight:600;color:#6F7F75;padding:4px 0 12px;border-bottom:1px solid #E2E0D5;margin-bottom:12px;">'
    + list.length+' mandis'+(self.distFilter>0?' within '+self.distFilter+'km':' across India')+' \u00b7 Official AGMARKNET prices</div>';

  var show = list.slice(0, 12);
  show.forEach(function(mandi) {
    var gov = govMap[mandi.id];
    var hasGov = gov && gov.modalPrice > 0;
    var dist = self.distances[mandi.id];
    var isBest = self.bestNearby && mandi.id === self.bestNearby.id;
    var priceStr = hasGov ? ('₹' + gov.modalPrice.toLocaleString('en-IN') + '<span style="font-size:11px;font-weight:normal;color:#6F7F75;">/qtl</span>') : '<span style="font-size:12px;color:#92400E;font-weight:600;">Price unavailable</span>';
    var dateStr = hasGov ? ('Reported: ' + (gov.reportDate || 'Recent')) : 'No recent report';

    html += '<div onclick="mandiMapEngine.showPopup(MANDI_MAP_DATA.find(function(m){return m.id===\''+mandi.id+'\'}))" style="border:1px solid '+(isBest?'#5B9A72':'#E2E0D5')+';border-radius:10px;padding:12px 14px;margin-bottom:10px;cursor:pointer;background:'+(isBest?'#EAF6ED':'#fff')+';transition:all 0.15s;" onmouseover="this.style.borderColor=\'#5B9A72\'" onmouseout="this.style.borderColor=\''+(isBest?'#5B9A72':'#E2E0D5')+'\'">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">'
      + '<div><div style="font-size:13px;font-weight:700;color:#12372A;">'+(isBest?'\uD83C\uDFC5 ':'')+mandi.name+'</div>'
      + '<div style="font-size:11px;color:#6F7F75;margin-top:2px;">\uD83D\uDCCD '+fmtDist(dist)+' \u00b7 '+mandi.state+'</div></div>'
      + '<div style="text-align:right;"><div style="font-size:15px;font-weight:800;color:#5B9A72;">'+priceStr+'</div>'
      + '<div style="font-size:10px;color:#6F7F75;margin-top:2px;">'+dateStr+'</div></div>'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;">'
      + '<span style="font-size:10px;color:#065F46;background:#EAF6ED;padding:2px 8px;border-radius:999px;font-weight:600;">Government-reported</span>'
      + '<div style="display:flex;gap:6px;">'
      + '<button class="btn btn--secondary btn--sm" style="padding:3px 10px;font-size:11px;" onclick="event.stopPropagation();mandiMapEngine.openDetails(\''+mandi.id+'\')">Details</button>'
      + '<button class="btn btn--secondary btn--sm" style="padding:3px 10px;font-size:11px;" onclick="event.stopPropagation();mandiMapEngine.getNav('+mandi.lat+','+mandi.lng+',\''+mandi.name.replace(/'/g,"\\'")+'\')">\uD83D\uDCCD</button>'
      + '</div></div></div>';
  });

  if (list.length > 12) {
    html += '<button class="btn btn--secondary btn--sm" style="width:100%;margin-top:4px;" onclick="mandiMapEngine.viewAll()">View all '+list.length+' mandis \u2193</button>';
  }

  container.innerHTML = html;
};

MandiMapEngine.prototype.viewAll = function() {
  this.setDist(0);
  if (this.map) this.map.flyTo([22.5, 80.0], 5, { animate:true });
};

MandiMapEngine.prototype.requestGPS = function() {
  var self = this;
  if (!navigator.geolocation) { alert('Geolocation not supported. Choose a city from the dropdown.'); return; }
  var btns = document.querySelectorAll('#mandi-btn-my-loc-hdr, #mandi-my-location');
  btns.forEach(function(b){ b.disabled = true; });

  navigator.geolocation.getCurrentPosition(function(pos) {
    var lat = pos.coords.latitude, lng = pos.coords.longitude;
    if (lat < 6.5 || lat > 36 || lng < 68 || lng > 97.5) {
      alert('Location appears to be outside India. Please select your city manually.'); 
      btns.forEach(function(b){ b.disabled=false; }); return;
    }
    self.userLat = lat; self.userLng = lng; self.userName = 'Your Location';
    self.calcDistances(); self.setDist(50); self.refresh();
    if (self.map) self.map.flyTo([lat,lng], 9, { animate:true });
    btns.forEach(function(b){ b.disabled=false; });
    if (typeof showToast === 'function') showToast('\uD83D\uDCCD Located! Showing nearest mandis.');
  }, function(err) {
    btns.forEach(function(b){ b.disabled=false; });
    var msg = err.code===1 ? 'Location permission denied.' : 'Could not get location.';
    alert(msg+' Please select your city from the dropdown.');
  }, { enableHighAccuracy:true, timeout:10000 });
};

MandiMapEngine.prototype.setCity = function(name) {
  var cities = [
    {name:'Pune',lat:18.5204,lng:73.8567},{name:'Mumbai',lat:19.0760,lng:72.8777},{name:'Delhi',lat:28.6139,lng:77.2090},
    {name:'Bangalore',lat:12.9716,lng:77.5946},{name:'Chennai',lat:13.0827,lng:80.2707},{name:'Hyderabad',lat:17.3850,lng:78.4867},
    {name:'Kolkata',lat:22.5726,lng:88.3639},{name:'Ahmedabad',lat:23.0225,lng:72.5714},{name:'Indore',lat:22.7196,lng:75.8577},
    {name:'Nagpur',lat:21.1458,lng:79.0882},{name:'Nashik',lat:20.0063,lng:73.7900},{name:'Ludhiana',lat:30.9010,lng:75.8573},
    {name:'Amritsar',lat:31.6340,lng:74.8723},{name:'Jaipur',lat:26.9124,lng:75.7873},{name:'Lucknow',lat:26.8467,lng:80.9462},
    {name:'Varanasi',lat:25.3176,lng:82.9739},{name:'Patna',lat:25.5941,lng:85.1376},{name:'Bhopal',lat:23.2599,lng:77.4126},
    {name:'Guntur',lat:16.3067,lng:80.4365},{name:'Rajkot',lat:22.3039,lng:70.8022},{name:'Surat',lat:21.1702,lng:72.8311},
    {name:'Kochi',lat:9.9312,lng:76.2673},{name:'Guwahati',lat:26.1445,lng:91.7362},{name:'Bhubaneswar',lat:20.2961,lng:85.8245},
    {name:'Raipur',lat:21.2514,lng:81.6296},{name:'Coimbatore',lat:11.0168,lng:76.9558},{name:'Madurai',lat:9.9252,lng:78.1198},
    {name:'Chandigarh',lat:30.7333,lng:76.7794},{name:'Jalandhar',lat:31.3260,lng:75.5762},{name:'Karnal',lat:29.6857,lng:76.9905}
  ];
  var found = cities.find(function(c){ return c.name.toLowerCase()===name.toLowerCase(); });
  if (!found) return;
  this.userLat = found.lat; this.userLng = found.lng; this.userName = found.name;
  this.calcDistances(); this.setDist(50); this.refresh();
  if (this.map) this.map.flyTo([found.lat, found.lng], 9, { animate:true });
};

MandiMapEngine.prototype.refresh = function() {
  this.refreshBest();
  this.renderMarkers();
  this.renderList();
  this.updateAI();
};

MandiMapEngine.prototype.setCrop = function(c) {
  var self = this;
  this.crop = c;
  this.fetchGovPrices(c).then(function() {
    self.refresh();
  });
};
MandiMapEngine.prototype.setState = function(s) {
  this.stateFilter = s;
  this.refresh();
  if (s !== 'all' && this.map) {
    var pts = MANDI_MAP_DATA.filter(function(m){ return m.state===s; });
    if (pts.length) this.map.fitBounds(L.latLngBounds(pts.map(function(m){ return [m.lat,m.lng]; })), { padding:[40,40], maxZoom:9 });
  }
};
MandiMapEngine.prototype.setDist = function(d) {
  this.distFilter = d;
  document.querySelectorAll('.mandi-dist-btn').forEach(function(b){ b.classList.toggle('mandi-dist-btn--active', parseInt(b.dataset.dist)===d); });
  this.refresh();
};
MandiMapEngine.prototype.setSearch = function(q) {
  this.searchQ = q;
  var clearBtn = document.getElementById('mandi-search-clear');
  if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';
  this.refresh();
  if (q.length >= 3 && this.map) {
    var matches = this.filtered();
    if (matches.length===1) this.map.flyTo([matches[0].lat, matches[0].lng], 11, { animate:true });
    else if (matches.length > 1 && matches.length <= 10) {
      var bounds = L.latLngBounds(matches.map(function(m){ return [m.lat,m.lng]; }));
      this.map.fitBounds(bounds, { padding:[50,50], maxZoom:10 });
    }
  }
};
MandiMapEngine.prototype.zoomIn  = function() { if (this.map) this.map.zoomIn(); };
MandiMapEngine.prototype.zoomOut = function() { if (this.map) this.map.zoomOut(); };
MandiMapEngine.prototype.viewIndia = function() { if (this.map) this.map.flyTo([22.5,80.0], 5, { animate:true }); this.setDist(0); };

MandiMapEngine.prototype.bindControls = function() {
  var self = this;

  var cropSel = document.getElementById('mandi-crop-filter');
  if (cropSel) cropSel.addEventListener('change', function(e){ self.setCrop(e.target.value); });

  var stateSel = document.getElementById('mandi-state-filter');
  if (stateSel) stateSel.addEventListener('change', function(e){ self.setState(e.target.value); });

  var searchIn = document.getElementById('mandi-search-input');
  if (searchIn) { var t; searchIn.addEventListener('input', function(e){ clearTimeout(t); t = setTimeout(function(){ self.setSearch(e.target.value); }, 200); }); }

  var clearBtn = document.getElementById('mandi-search-clear');
  if (clearBtn && searchIn) clearBtn.addEventListener('click', function(){ searchIn.value=''; self.setSearch(''); searchIn.focus(); });

  document.querySelectorAll('.mandi-dist-btn').forEach(function(b){ b.addEventListener('click', function(){ self.setDist(parseInt(b.dataset.dist)); }); });
  document.querySelectorAll('.mandi-toggle-btn').forEach(function(b){ b.addEventListener('click', function(){ self.setView(b.dataset.view); }); });

  ['mandi-btn-my-loc-hdr','mandi-my-location','mandi-use-location-btn'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function(){ self.requestGPS(); });
  });

  ['mandi-btn-view-india','mandi-ctrl-india'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function(){ self.viewIndia(); });
  });

  var manualSel = document.getElementById('mandi-manual-location');
  if (manualSel) manualSel.addEventListener('change', function(e){ if(e.target.value) self.setCity(e.target.value); });

  var zIn = document.getElementById('mandi-zoom-in');   if (zIn)  zIn.addEventListener('click',  function(){ self.zoomIn(); });
  var zOut = document.getElementById('mandi-zoom-out'); if (zOut) zOut.addEventListener('click', function(){ self.zoomOut(); });

  var modalClose = document.getElementById('mandi-details-modal-close');
  var modalOvl   = document.getElementById('mandi-details-modal-overlay');
  if (modalClose && modalOvl) {
    modalClose.addEventListener('click', function(){ modalOvl.classList.remove('active'); });
    modalOvl.addEventListener('click', function(e){ if(e.target===modalOvl) modalOvl.classList.remove('active'); });
  }
};

MandiMapEngine.prototype.setView = function(mode) {
  document.querySelectorAll('.mandi-toggle-btn').forEach(function(b){ b.classList.toggle('mandi-toggle-btn--active', b.dataset.view===mode); });
  var mapWrap  = document.getElementById('mandi-map-wrap');
  var listWrap = document.getElementById('mandi-list-wrap');
  if (!mapWrap || !listWrap) return;
  if (mode==='map') { mapWrap.style.display='block'; }
  else if (window.innerWidth < 768) { mapWrap.style.display='none'; }
  if (this.map && mode==='map') setTimeout(function(){ if(mandiMapEngine&&mandiMapEngine.map) mandiMapEngine.map.invalidateSize(); }, 150);
};

// â”€â”€â”€ 4. INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function initMandiMap() {
  if (mandiMapEngine) {
    if (mandiMapEngine.map) setTimeout(function(){ mandiMapEngine.map.invalidateSize(); }, 200);
    return;
  }
  if (typeof L === 'undefined') { setTimeout(initMandiMap, 200); return; }

  var loadEl = document.getElementById('mandi-map-loading');
  if (loadEl) { loadEl.style.display = 'flex'; }

  mandiMapEngine = new MandiMapEngine();
  mandiMapEngine.init();
}

// Add CSS for location pulse animation
(function() {
  var style = document.createElement('style');
  style.textContent = '@keyframes locPulse{0%{transform:scale(1);opacity:0.6;}100%{transform:scale(2.5);opacity:0;}}';
  document.head.appendChild(style);
})();

// Lazy-load when section enters viewport
(function() {
  var section = document.getElementById('dash-mandi-map');
  if (!section) { if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initMandiMap); else initMandiMap(); return; }
  if (!('IntersectionObserver' in window)) { initMandiMap(); return; }
  var obs = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) { initMandiMap(); obs.disconnect(); }
  }, { rootMargin: '300px' });
  obs.observe(section);
  // Also trigger if already in view
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ obs.observe(section); });
})();



