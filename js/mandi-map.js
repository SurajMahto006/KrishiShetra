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
  { id:'mandi-pune',      name:'Pune APMC',               state:'Maharashtra',   district:'Pune',         lat:18.4901, lng:73.8679, status:'open', arrivals:1420, buyersCount:84,  prices:{rice:2850,wheat:2620,onion:2850,tomato:2400,maize:2280,soybean:4550,potato:1800,chilli:8350,groundnut:6450,cotton:6750,sugarcane:3150,mango:5500,banana:1850,grapes:6200,pulses:7400}, demand:{rice:'high',wheat:'medium',onion:'high',tomato:'medium',maize:'medium',soybean:'medium',potato:'low',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'medium',grapes:'high',pulses:'medium'} },
  { id:'mandi-mumbai',    name:'Mumbai APMC (Vashi)',      state:'Maharashtra',   district:'Navi Mumbai',  lat:19.0734, lng:73.0039, status:'open', arrivals:2650, buyersCount:142, prices:{rice:2920,wheat:2700,onion:2950,tomato:2550,maize:2350,soybean:4700,potato:1900,chilli:8600,groundnut:6600,cotton:6900,sugarcane:3200,mango:6200,banana:1950,grapes:6600,pulses:7650}, demand:{rice:'high',wheat:'high',onion:'high',tomato:'high',maize:'medium',soybean:'high',potato:'medium',chilli:'high',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'mandi-nashik',    name:'Nashik APMC',              state:'Maharashtra',   district:'Nashik',       lat:20.0125, lng:73.7915, status:'open', arrivals:1850, buyersCount:96,  prices:{rice:2760,wheat:2580,onion:2980,tomato:2300,maize:2250,soybean:4480,potato:1750,chilli:8200,groundnut:6350,cotton:6680,sugarcane:3100,mango:5100,banana:1750,grapes:6800,pulses:7250}, demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'low',maize:'low',soybean:'medium',potato:'low',chilli:'medium',groundnut:'medium',cotton:'low',sugarcane:'medium',mango:'medium',banana:'low',grapes:'high',pulses:'medium'} },
  { id:'mandi-nagpur',    name:'Nagpur APMC',              state:'Maharashtra',   district:'Nagpur',       lat:21.1685, lng:79.1288, status:'open', arrivals:1620, buyersCount:78,  prices:{rice:2800,wheat:2660,onion:2720,tomato:2380,maize:2320,soybean:4620,potato:1820,chilli:8450,groundnut:6500,cotton:6820,sugarcane:3080,mango:4900,banana:1800,grapes:5900,pulses:7550}, demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'medium',maize:'high',soybean:'high',potato:'medium',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'mandi-solapur',   name:'Solapur APMC',             state:'Maharashtra',   district:'Solapur',      lat:17.6715, lng:75.9104, status:'open', arrivals:980,  buyersCount:52,  prices:{rice:2780,wheat:2590,onion:2800,tomato:2450,maize:2260,soybean:4500,potato:1780,chilli:8300,groundnut:6420,cotton:6700,sugarcane:3250,mango:4800,banana:1900,grapes:6300,pulses:7450}, demand:{rice:'medium',wheat:'medium',onion:'medium',tomato:'high',maize:'medium',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'medium',cotton:'medium',sugarcane:'high',mango:'low',banana:'high',grapes:'high',pulses:'high'} },
  { id:'mandi-kolhapur',  name:'Kolhapur APMC',            state:'Maharashtra',   district:'Kolhapur',     lat:16.6956, lng:74.2317, status:'open', arrivals:890,  buyersCount:46,  prices:{rice:2810,wheat:2600,onion:2830,tomato:2420,maize:2270,soybean:4520,potato:1790,chilli:8280,groundnut:6400,cotton:6720,sugarcane:3400,mango:5200,banana:1820,grapes:6100,pulses:7350}, demand:{rice:'medium',wheat:'low',onion:'medium',tomato:'medium',maize:'low',soybean:'low',potato:'low',chilli:'low',groundnut:'medium',cotton:'low',sugarcane:'high',mango:'medium',banana:'medium',grapes:'medium',pulses:'medium'} },
  { id:'mandi-aurangabad',name:'Chhatrapati Sambhajinagar APMC',state:'Maharashtra',district:'Sambhajinagar',lat:19.8824,lng:75.3522,status:'open',arrivals:1140,buyersCount:64,prices:{rice:2790,wheat:2640,onion:2770,tomato:2360,maize:2300,soybean:4580,potato:1810,chilli:8380,groundnut:6480,cotton:6780,sugarcane:3120,mango:5300,banana:1840,grapes:6050,pulses:7480},demand:{rice:'medium',wheat:'medium',onion:'medium',tomato:'low',maize:'medium',soybean:'medium',potato:'low',chilli:'medium',groundnut:'medium',cotton:'medium',sugarcane:'medium',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'mandi-latur',     name:'Latur APMC',               state:'Maharashtra',   district:'Latur',        lat:18.4088, lng:76.5604, status:'open', arrivals:1560, buyersCount:88,  prices:{rice:2770,wheat:2630,onion:2740,tomato:2380,maize:2290,soybean:4720,potato:1790,chilli:8460,groundnut:6540,cotton:6800,sugarcane:3180,mango:5100,banana:1830,grapes:5900,pulses:7750}, demand:{rice:'medium',wheat:'medium',onion:'low',tomato:'low',maize:'medium',soybean:'high',potato:'low',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'medium',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'mandi-jalgaon',   name:'Jalgaon APMC',             state:'Maharashtra',   district:'Jalgaon',      lat:21.0077, lng:75.5626, status:'open', arrivals:1480, buyersCount:82,  prices:{rice:2750,wheat:2620,onion:2760,tomato:2370,maize:2310,soybean:4590,potato:1790,chilli:8360,groundnut:6520,cotton:6920,sugarcane:3100,mango:5200,banana:2100,grapes:5800,pulses:7450}, demand:{rice:'low',wheat:'medium',onion:'medium',tomato:'low',maize:'high',soybean:'high',potato:'low',chilli:'medium',groundnut:'high',cotton:'high',sugarcane:'low',mango:'low',banana:'high',grapes:'low',pulses:'high'} },
  // MADHYA PRADESH
  { id:'mandi-indore',    name:'Indore Mandi',             state:'Madhya Pradesh',district:'Indore',       lat:22.7196, lng:75.8577, status:'open', arrivals:2850, buyersCount:135, prices:{rice:2750,wheat:2680,onion:2790,tomato:2320,maize:2340,soybean:4780,potato:1780,chilli:8400,groundnut:6560,cotton:6850,sugarcane:2950,mango:5300,banana:1840,grapes:6100,pulses:7600}, demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'low',maize:'high',soybean:'high',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'high'} },
  { id:'mandi-bhopal',    name:'Bhopal Mandi',             state:'Madhya Pradesh',district:'Bhopal',       lat:23.2599, lng:77.4126, status:'open', arrivals:1750, buyersCount:82,  prices:{rice:2730,wheat:2650,onion:2760,tomato:2350,maize:2310,soybean:4680,potato:1760,chilli:8320,groundnut:6490,cotton:6790,sugarcane:2980,mango:5200,banana:1820,grapes:6000,pulses:7540}, demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'medium',maize:'medium',soybean:'high',potato:'medium',chilli:'medium',groundnut:'medium',cotton:'medium',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'mandi-ujjain',    name:'Ujjain Mandi',             state:'Madhya Pradesh',district:'Ujjain',       lat:23.1765, lng:75.7885, status:'open', arrivals:1420, buyersCount:68,  prices:{rice:2720,wheat:2670,onion:2780,tomato:2300,maize:2300,soybean:4730,potato:1740,chilli:8300,groundnut:6510,cotton:6810,sugarcane:2920,mango:5150,banana:1800,grapes:5950,pulses:7510}, demand:{rice:'low',wheat:'high',onion:'medium',tomato:'low',maize:'medium',soybean:'high',potato:'low',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'low',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'mandi-gwalior',   name:'Gwalior Mandi',            state:'Madhya Pradesh',district:'Gwalior',      lat:26.2183, lng:78.1828, status:'open', arrivals:1380, buyersCount:66,  prices:{rice:2790,wheat:2710,onion:2730,tomato:2370,maize:2300,soybean:4620,potato:1880,chilli:8290,groundnut:6460,cotton:6770,sugarcane:3050,mango:5250,banana:1830,grapes:5900,pulses:7520}, demand:{rice:'medium',wheat:'high',onion:'low',tomato:'medium',maize:'medium',soybean:'medium',potato:'high',chilli:'low',groundnut:'medium',cotton:'low',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  // GUJARAT
  { id:'mandi-ahmedabad', name:'Ahmedabad APMC',           state:'Gujarat',       district:'Ahmedabad',    lat:23.0225, lng:72.5714, status:'open', arrivals:2350, buyersCount:118, prices:{rice:2870,wheat:2660,onion:2880,tomato:2470,maize:2320,soybean:4630,potato:1860,chilli:8500,groundnut:6680,cotton:7040,sugarcane:3120,mango:5900,banana:1910,grapes:6450,pulses:7520}, demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'medium',potato:'high',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'medium',mango:'high',banana:'high',grapes:'high',pulses:'medium'} },
  { id:'mandi-rajkot',    name:'Rajkot APMC',              state:'Gujarat',       district:'Rajkot',       lat:22.3039, lng:70.8022, status:'open', arrivals:2150, buyersCount:112, prices:{rice:2740,wheat:2630,onion:2840,tomato:2410,maize:2290,soybean:4610,potato:1830,chilli:8520,groundnut:6780,cotton:7180,sugarcane:3000,mango:5600,banana:1840,grapes:6100,pulses:7460}, demand:{rice:'low',wheat:'medium',onion:'high',tomato:'medium',maize:'medium',soybean:'medium',potato:'medium',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'medium'} },
  { id:'mandi-surat',     name:'Surat APMC',               state:'Gujarat',       district:'Surat',        lat:21.1702, lng:72.8311, status:'open', arrivals:1880, buyersCount:94,  prices:{rice:2860,wheat:2670,onion:2890,tomato:2480,maize:2330,soybean:4640,potato:1870,chilli:8480,groundnut:6640,cotton:7010,sugarcane:3280,mango:6100,banana:1940,grapes:6500,pulses:7550}, demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'medium'} },
  // PUNJAB & HARYANA
  { id:'mandi-khanna',    name:'Khanna Mandi',             state:'Punjab',        district:'Ludhiana',     lat:30.7071, lng:76.2167, status:'open', arrivals:4200, buyersCount:186, prices:{rice:2980,wheat:2750,onion:2710,tomato:2340,maize:2380,soybean:4510,potato:1790,chilli:8250,groundnut:6380,cotton:7050,sugarcane:3380,mango:5100,banana:1800,grapes:5900,pulses:7580}, demand:{rice:'high',wheat:'high',onion:'low',tomato:'low',maize:'high',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'high',sugarcane:'high',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'mandi-ludhiana',  name:'Ludhiana Mandi',           state:'Punjab',        district:'Ludhiana',     lat:30.9010, lng:75.8573, status:'open', arrivals:3100, buyersCount:145, prices:{rice:2960,wheat:2740,onion:2730,tomato:2360,maize:2370,soybean:4520,potato:1810,chilli:8280,groundnut:6400,cotton:7020,sugarcane:3350,mango:5200,banana:1820,grapes:6000,pulses:7560}, demand:{rice:'high',wheat:'high',onion:'medium',tomato:'low',maize:'high',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'high',sugarcane:'high',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'mandi-amritsar',  name:'Amritsar Mandi',           state:'Punjab',        district:'Amritsar',     lat:31.6340, lng:74.8723, status:'open', arrivals:2750, buyersCount:120, prices:{rice:3020,wheat:2730,onion:2700,tomato:2350,maize:2350,soybean:4490,potato:1800,chilli:8220,groundnut:6360,cotton:6980,sugarcane:3320,mango:5150,banana:1790,grapes:5950,pulses:7520}, demand:{rice:'high',wheat:'high',onion:'low',tomato:'low',maize:'medium',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'medium',sugarcane:'high',mango:'low',banana:'low',grapes:'low',pulses:'medium'} },
  { id:'mandi-karnal',    name:'Karnal APMC',              state:'Haryana',       district:'Karnal',       lat:29.6857, lng:76.9905, status:'open', arrivals:3200, buyersCount:148, prices:{rice:3050,wheat:2730,onion:2740,tomato:2370,maize:2360,soybean:4540,potato:1830,chilli:8310,groundnut:6420,cotton:6990,sugarcane:3370,mango:5250,banana:1830,grapes:6050,pulses:7570}, demand:{rice:'high',wheat:'high',onion:'medium',tomato:'low',maize:'medium',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'medium',sugarcane:'high',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'mandi-hisar',     name:'Hisar Mandi',              state:'Haryana',       district:'Hisar',        lat:29.1492, lng:75.7217, status:'open', arrivals:2150, buyersCount:96,  prices:{rice:2890,wheat:2710,onion:2710,tomato:2330,maize:2330,soybean:4490,potato:1790,chilli:8250,groundnut:6390,cotton:7140,sugarcane:3280,mango:5050,banana:1800,grapes:5850,pulses:7510}, demand:{rice:'medium',wheat:'high',onion:'low',tomato:'low',maize:'medium',soybean:'low',potato:'low',chilli:'low',groundnut:'low',cotton:'high',sugarcane:'medium',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  // UTTAR PRADESH & BIHAR
  { id:'mandi-lucknow',   name:'Lucknow Mandi',            state:'Uttar Pradesh', district:'Lucknow',      lat:26.8467, lng:80.9462, status:'open', arrivals:2550, buyersCount:124, prices:{rice:2860,wheat:2710,onion:2790,tomato:2440,maize:2320,soybean:4580,potato:1910,chilli:8410,groundnut:6490,cotton:6820,sugarcane:3300,mango:6400,banana:1890,grapes:6350,pulses:7620}, demand:{rice:'high',wheat:'high',onion:'medium',tomato:'medium',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'medium',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'mandi-kanpur',    name:'Kanpur APMC',              state:'Uttar Pradesh', district:'Kanpur',       lat:26.4499, lng:80.3319, status:'open', arrivals:2420, buyersCount:115, prices:{rice:2840,wheat:2700,onion:2780,tomato:2430,maize:2330,soybean:4580,potato:1930,chilli:8390,groundnut:6480,cotton:6840,sugarcane:3260,mango:5600,banana:1870,grapes:6250,pulses:7600}, demand:{rice:'high',wheat:'high',onion:'medium',tomato:'medium',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'medium',cotton:'low',sugarcane:'medium',mango:'high',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'mandi-agra',      name:'Agra Mandi',               state:'Uttar Pradesh', district:'Agra',         lat:27.1767, lng:78.0081, status:'open', arrivals:2950, buyersCount:138, prices:{rice:2820,wheat:2690,onion:2760,tomato:2410,maize:2310,soybean:4560,potato:1980,chilli:8340,groundnut:6460,cotton:6810,sugarcane:3240,mango:5400,banana:1850,grapes:6150,pulses:7570}, demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'medium',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'low',cotton:'low',sugarcane:'medium',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'mandi-varanasi',  name:'Varanasi Mandi',           state:'Uttar Pradesh', district:'Varanasi',     lat:25.3176, lng:82.9739, status:'open', arrivals:1850, buyersCount:88,  prices:{rice:2880,wheat:2680,onion:2810,tomato:2460,maize:2310,soybean:4540,potato:1890,chilli:8450,groundnut:6440,cotton:6780,sugarcane:3280,mango:5800,banana:1920,grapes:6300,pulses:7640}, demand:{rice:'high',wheat:'medium',onion:'medium',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'low',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'mandi-patna',     name:'Patna Mandi',              state:'Bihar',         district:'Patna',        lat:25.5941, lng:85.1376, status:'open', arrivals:2150, buyersCount:96,  prices:{rice:2890,wheat:2660,onion:2840,tomato:2490,maize:2350,soybean:4500,potato:1900,chilli:8550,groundnut:6420,cotton:6720,sugarcane:3200,mango:5800,banana:1980,grapes:6300,pulses:7650}, demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'low',cotton:'low',sugarcane:'medium',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  // RAJASTHAN
  { id:'mandi-jaipur',    name:'Jaipur Mandi',             state:'Rajasthan',     district:'Jaipur',       lat:26.9124, lng:75.7873, status:'open', arrivals:2480, buyersCount:122, prices:{rice:2810,wheat:2680,onion:2820,tomato:2460,maize:2320,soybean:4620,potato:1840,chilli:8420,groundnut:6590,cotton:6890,sugarcane:3050,mango:5500,banana:1870,grapes:6300,pulses:7560}, demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'high'} },
  { id:'mandi-kota',      name:'Kota Mandi',               state:'Rajasthan',     district:'Kota',         lat:25.2138, lng:75.8648, status:'open', arrivals:2650, buyersCount:130, prices:{rice:2790,wheat:2670,onion:2750,tomato:2330,maize:2360,soybean:4740,potato:1770,chilli:8370,groundnut:6520,cotton:6920,sugarcane:3120,mango:5200,banana:1810,grapes:5950,pulses:7620}, demand:{rice:'low',wheat:'high',onion:'low',tomato:'low',maize:'high',soybean:'high',potato:'low',chilli:'medium',groundnut:'high',cotton:'high',sugarcane:'low',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'mandi-jodhpur',   name:'Jodhpur Mandi',            state:'Rajasthan',     district:'Jodhpur',      lat:26.2389, lng:73.0243, status:'open', arrivals:1520, buyersCount:74,  prices:{rice:2750,wheat:2660,onion:2810,tomato:2380,maize:2280,soybean:4560,potato:1810,chilli:8650,groundnut:6680,cotton:6940,sugarcane:2900,mango:5300,banana:1830,grapes:6100,pulses:7680}, demand:{rice:'low',wheat:'medium',onion:'medium',tomato:'low',maize:'low',soybean:'medium',potato:'low',chilli:'high',groundnut:'high',cotton:'medium',sugarcane:'low',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  // KARNATAKA
  { id:'mandi-bengaluru', name:'Bengaluru APMC',           state:'Karnataka',     district:'Bengaluru',    lat:13.0189, lng:77.5456, status:'open', arrivals:2890, buyersCount:146, prices:{rice:2940,wheat:2690,onion:2910,tomato:2580,maize:2380,soybean:4620,potato:1890,chilli:8590,groundnut:6640,cotton:6860,sugarcane:3250,mango:6500,banana:1980,grapes:6800,pulses:7680}, demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'medium',potato:'high',chilli:'high',groundnut:'high',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'mandi-hubballi',  name:'Hubballi APMC',            state:'Karnataka',     district:'Dharwad',      lat:15.3647, lng:75.1240, status:'open', arrivals:1840, buyersCount:92,  prices:{rice:2850,wheat:2640,onion:2870,tomato:2460,maize:2350,soybean:4590,potato:1820,chilli:8640,groundnut:6580,cotton:7010,sugarcane:3310,mango:5700,banana:1870,grapes:6300,pulses:7540}, demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'medium',maize:'high',soybean:'medium',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'medium',banana:'medium',grapes:'high',pulses:'medium'} },
  { id:'mandi-raichur',   name:'Raichur APMC',             state:'Karnataka',     district:'Raichur',      lat:16.2120, lng:77.3439, status:'open', arrivals:1820, buyersCount:90,  prices:{rice:2950,wheat:2610,onion:2800,tomato:2420,maize:2350,soybean:4520,potato:1780,chilli:8680,groundnut:6620,cotton:7150,sugarcane:3180,mango:5300,banana:1850,grapes:5900,pulses:7650}, demand:{rice:'high',wheat:'low',onion:'medium',tomato:'medium',maize:'high',soybean:'low',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  // TELANGANA & ANDHRA PRADESH
  { id:'mandi-hyderabad', name:'Hyderabad APMC',           state:'Telangana',     district:'Hyderabad',    lat:17.3850, lng:78.4867, status:'open', arrivals:2750, buyersCount:140, prices:{rice:2920,wheat:2680,onion:2890,tomato:2540,maize:2380,soybean:4610,potato:1880,chilli:8750,groundnut:6650,cotton:7020,sugarcane:3200,mango:6300,banana:1950,grapes:6600,pulses:7680}, demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'medium',potato:'high',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'medium',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'mandi-warangal',  name:'Warangal APMC',            state:'Telangana',     district:'Warangal',     lat:17.9689, lng:79.5941, status:'open', arrivals:2450, buyersCount:118, prices:{rice:2890,wheat:2600,onion:2820,tomato:2460,maize:2390,soybean:4560,potato:1810,chilli:8820,groundnut:6610,cotton:7120,sugarcane:3150,mango:5800,banana:1880,grapes:6100,pulses:7620}, demand:{rice:'high',wheat:'low',onion:'medium',tomato:'medium',maize:'high',soybean:'medium',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'mandi-guntur',    name:'Guntur APMC',              state:'Andhra Pradesh',district:'Guntur',       lat:16.3067, lng:80.4365, status:'open', arrivals:3600, buyersCount:175, prices:{rice:2900,wheat:2600,onion:2840,tomato:2480,maize:2390,soybean:4530,potato:1820,chilli:8950,groundnut:6650,cotton:7150,sugarcane:3300,mango:6100,banana:1920,grapes:6200,pulses:7650}, demand:{rice:'high',wheat:'low',onion:'medium',tomato:'high',maize:'high',soybean:'low',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'high',banana:'high',grapes:'low',pulses:'high'} },
  { id:'mandi-vijayawada',name:'Vijayawada APMC',          state:'Andhra Pradesh',district:'Krishna',      lat:16.5062, lng:80.6480, status:'open', arrivals:2200, buyersCount:110, prices:{rice:2930,wheat:2620,onion:2860,tomato:2510,maize:2380,soybean:4540,potato:1850,chilli:8780,groundnut:6620,cotton:7040,sugarcane:3350,mango:6400,banana:1960,grapes:6400,pulses:7660}, demand:{rice:'high',wheat:'low',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'medium',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  // TAMIL NADU
  { id:'mandi-chennai',   name:'Chennai Koyambedu Mandi',  state:'Tamil Nadu',    district:'Chennai',      lat:13.0694, lng:80.1948, status:'open', arrivals:3400, buyersCount:165, prices:{rice:2970,wheat:2710,onion:2960,tomato:2620,maize:2410,soybean:4620,potato:1940,chilli:8720,groundnut:6720,cotton:6950,sugarcane:3400,mango:6600,banana:2050,grapes:6700,pulses:7720}, demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'mandi-coimbatore',name:'Coimbatore Mandi',         state:'Tamil Nadu',    district:'Coimbatore',   lat:11.0168, lng:76.9558, status:'open', arrivals:2150, buyersCount:104, prices:{rice:2940,wheat:2670,onion:2920,tomato:2560,maize:2400,soybean:4570,potato:1910,chilli:8680,groundnut:6680,cotton:7020,sugarcane:3420,mango:6300,banana:2020,grapes:6600,pulses:7670}, demand:{rice:'high',wheat:'low',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'mandi-madurai',   name:'Madurai Mandi',            state:'Tamil Nadu',    district:'Madurai',      lat:9.9252,  lng:78.1198, status:'open', arrivals:1890, buyersCount:92,  prices:{rice:2950,wheat:2640,onion:2910,tomato:2550,maize:2380,soybean:4520,potato:1900,chilli:8690,groundnut:6670,cotton:6980,sugarcane:3380,mango:6200,banana:2010,grapes:6550,pulses:7660}, demand:{rice:'high',wheat:'low',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  // WEST BENGAL & ODISHA
  { id:'mandi-kolkata',   name:'Kolkata Mandi',            state:'West Bengal',   district:'Kolkata',      lat:22.5726, lng:88.3639, status:'open', arrivals:2950, buyersCount:148, prices:{rice:2940,wheat:2720,onion:2930,tomato:2520,maize:2360,soybean:4590,potato:1960,chilli:8620,groundnut:6580,cotton:6780,sugarcane:3150,mango:6300,banana:1940,grapes:6500,pulses:7700}, demand:{rice:'high',wheat:'high',onion:'high',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'high',groundnut:'medium',cotton:'low',sugarcane:'medium',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'mandi-bhubaneswar',name:'Bhubaneswar Mandi',       state:'Odisha',        district:'Khurda',       lat:20.2961, lng:85.8245, status:'open', arrivals:1850, buyersCount:88,  prices:{rice:2900,wheat:2680,onion:2880,tomato:2480,maize:2340,soybean:4540,potato:1920,chilli:8550,groundnut:6560,cotton:6750,sugarcane:3200,mango:5900,banana:1920,grapes:6350,pulses:7620}, demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'high',groundnut:'medium',cotton:'low',sugarcane:'medium',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  // CHHATTISGARH & JHARKHAND
  { id:'mandi-raipur',    name:'Raipur Mandi',             state:'Chhattisgarh',  district:'Raipur',       lat:21.2514, lng:81.6296, status:'open', arrivals:2450, buyersCount:120, prices:{rice:2960,wheat:2660,onion:2840,tomato:2440,maize:2360,soybean:4580,potato:1890,chilli:8480,groundnut:6540,cotton:6760,sugarcane:3250,mango:5700,banana:1890,grapes:6250,pulses:7600}, demand:{rice:'high',wheat:'medium',onion:'medium',tomato:'medium',maize:'high',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'medium',cotton:'low',sugarcane:'high',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  // KERALA & GOA
  { id:'mandi-kochi',     name:'Kochi Mandi',              state:'Kerala',        district:'Ernakulam',    lat:9.9312,  lng:76.2673, status:'open', arrivals:1820, buyersCount:94,  prices:{rice:2980,wheat:2750,onion:2980,tomato:2650,maize:2420,soybean:4620,potato:1970,chilli:8790,groundnut:6720,cotton:6850,sugarcane:3400,mango:6700,banana:2150,grapes:6850,pulses:7750}, demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  // ASSAM & NORTH EAST
  { id:'mandi-guwahati',  name:'Guwahati Mandi',           state:'Assam',         district:'Kamrup',       lat:26.1445, lng:91.7362, status:'open', arrivals:1520, buyersCount:78,  prices:{rice:2950,wheat:2740,onion:2920,tomato:2540,maize:2390,soybean:4560,potato:1950,chilli:8650,groundnut:6550,cotton:6710,sugarcane:3150,mango:6200,banana:2050,grapes:6450,pulses:7680}, demand:{rice:'high',wheat:'high',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'low',cotton:'low',sugarcane:'low',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  // HIMACHAL & J&K
  { id:'mandi-shimla',    name:'Shimla Mandi',             state:'Himachal Pradesh',district:'Shimla',     lat:31.1048, lng:77.1734, status:'open', arrivals:1250, buyersCount:68,  prices:{rice:2920,wheat:2760,onion:2880,tomato:2580,maize:2370,soybean:4520,potato:1990,chilli:8450,groundnut:6480,cotton:6820,sugarcane:3200,mango:5900,banana:1920,grapes:6400,pulses:7650}, demand:{rice:'medium',wheat:'high',onion:'high',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'low',cotton:'low',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'high'} },
  { id:'mandi-jammu',     name:'Jammu Mandi',              state:'Jammu & Kashmir',district:'Jammu',       lat:32.7266, lng:74.8570, status:'open', arrivals:1650, buyersCount:84,  prices:{rice:3020,wheat:2780,onion:2890,tomato:2540,maize:2380,soybean:4540,potato:1960,chilli:8420,groundnut:6500,cotton:6850,sugarcane:3220,mango:5850,banana:1910,grapes:6450,pulses:7680}, demand:{rice:'high',wheat:'high',onion:'high',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'low',cotton:'low',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'high'} }
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
  this.bestNearby = null;
  this.bestPrice = null;
}

MandiMapEngine.prototype.init = function() {
  this.calcDistances();
  this.refreshBest();
  this.bindControls();
  this.renderList();
  this.updateAI();
  this.initMap();
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
  if (!list.length) { this.bestNearby = null; this.bestPrice = null; return; }
  this.bestPrice = list.reduce(function(best,m){ return (m.prices[crop]||0)>(best.prices[crop]||0)?m:best; }, list[0]);
  if (!this.userName) { this.bestNearby = this.bestPrice; return; }
  var prices = list.map(function(m){ return m.prices[crop]||0; });
  var dists = list.map(function(m){ return self.distances[m.id]; });
  var maxP = Math.max.apply(null,prices), minP = Math.min.apply(null,prices), rP = maxP-minP||1;
  var maxD = Math.max.apply(null,dists), minD = Math.min.apply(null,dists), rD = maxD-minD||1;
  var ds = {high:1,medium:0.6,low:0.2};
  var best = null, bestScore = -Infinity;
  list.forEach(function(m){
    var pn = ((m.prices[crop]||0)-minP)/rP;
    var dn = 1-((self.distances[m.id]-minD)/rD);
    var dmn = ds[m.demand[crop]||'medium']||0.5;
    var score = pn*0.5+dn*0.35+dmn*0.15;
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

  // Use OpenStreetMap tiles as primary â€” always works, zero key needed
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: ['a','b','c']
  }).addTo(self.map);

  // Setup clustering
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

  list.forEach(function(mandi) {
    var price = mandi.prices[crop]; if (!price) return;
    var isBest = self.bestNearby && mandi.id === self.bestNearby.id;
    var short = mandi.name.replace(' APMC','').replace(' Mandi','');

    var html;
    if (compact && !isBest) {
      html = '<div style="width:10px;height:10px;background:'+(isBest?'#d4a843':'#12372A')+';border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);" title="'+mandi.name+' \u00b7 '+fmtPrice(price)+'"></div>';
    } else {
      var bg = isBest ? '#fffdf0' : '#ffffff';
      var border = isBest ? '#d4a843' : '#5B9A72';
      html = '<div style="background:'+bg+';border:1.5px solid '+border+';border-radius:8px;padding:3px 8px;box-shadow:0 3px 8px rgba(0,0,0,0.18);white-space:nowrap;display:flex;align-items:center;gap:4px;">'
           + (isBest ? '<span style="font-size:11px;">\uD83C\uDFC5</span>' : '')
           + '<div><div style="font-size:11px;font-weight:700;color:#12372A;">'+(isBest?'<b>'+short+'</b>':short)+'</div>'
           + '<div style="font-size:10px;font-weight:700;color:#5B9A72;">'+fmtPrice(price)+'</div></div>'
           + '</div>'
           + '<div style="width:8px;height:8px;background:'+border+';transform:rotate(45deg);margin:-4px auto 0;border-radius:1px;"></div>';
    }

    var w = compact&&!isBest ? 14 : isBest ? 130 : 110;
    var h = compact&&!isBest ? 14 : 44;

    var icon = L.divIcon({ className:'', html:html, iconSize:[w,h], iconAnchor:[w/2,h] });
    var mk = L.marker([mandi.lat, mandi.lng], { icon:icon, zIndexOffset: isBest?800:100, title:mandi.name+' \u2013 '+fmtPrice(price) });
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
  var crop = self.crop, price = mandi.prices[crop]||0;
  var dist = self.userName ? fmtDist(self.distances[mandi.id]) : null;
  var chg = CROP_CHANGE_PCT[crop]||0, dir = chg>=0?'up':'down', arrow = chg>=0?'\u2197':'\u2198';
  var isBest = self.bestNearby && mandi.id === self.bestNearby.id;
  var dem = demandLabel(mandi.demand[crop]||'medium');

  var html = '<div class="mandi-popup mandi-popup--visible" id="mandi-popup-active">'
    + '<button class="mandi-popup__close" onclick="mandiMapEngine.closePopup()">\u00d7</button>'
    + (isBest ? '<div style="font-size:11px;font-weight:700;color:#d4a843;margin-bottom:6px;">\uD83C\uDFC5 Best Nearby Option</div>' : '')
    + '<h3 class="mandi-popup__title">'+mandi.name+'</h3>'
    + '<p style="font-size:12px;color:#6F7F75;margin:2px 0 8px;">'+(dist?dist+' away \u00b7 ':'')+mandi.district+', '+mandi.state+'</p>'
    + '<div style="border-top:1px solid #E2E0D5;padding-top:10px;margin-top:4px;">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
    + '<span style="font-size:18px;font-weight:800;color:#5B9A72;">'+fmtPrice(price)+'</span>'
    + '<span style="font-size:12px;font-weight:600;padding:3px 8px;border-radius:6px;background:'+(dir==='up'?'#ECFDF5':'#FEF2F2')+';color:'+(dir==='up'?'#059669':'#DC2626')+';">'+arrow+' '+Math.abs(chg)+'% (7D)</span>'
    + '</div>'
    + '<div style="display:flex;gap:12px;font-size:12px;color:#6F7F75;">'
    + '<span><b style="color:#17221D;">'+dem+'</b></span>'
    + '<span>'+mandi.arrivals.toLocaleString('en-IN')+' t arrivals</span>'
    + '</div></div>'
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

  var rows = '';
  Object.keys(mandi.prices).forEach(function(k) {
    var p = mandi.prices[k], chg = CROP_CHANGE_PCT[k]||0, dir = chg>=0?'up':'down', arrow = chg>=0?'\u2197':'\u2198';
    var active = k === crop;
    rows += '<tr style="'+(active?'background:#EAF6ED;':'')+'"><td><b>'+k.charAt(0).toUpperCase()+k.slice(1)+'</b>'+(active?' <span style="font-size:10px;background:#5B9A72;color:#fff;padding:1px 6px;border-radius:4px;">Selected</span>':'')+'</td>'
      + '<td><b style="color:#5B9A72;">'+fmtPrice(p)+'</b></td>'
      + '<td><span style="color:'+(dir==='up'?'#059669':'#DC2626')+';">'+arrow+' '+Math.abs(chg)+'%</span></td>'
      + '<td>'+demandLabel(mandi.demand[k]||'medium')+'</td></tr>';
  });

  bodyEl.innerHTML = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">'
    + '<div style="background:#F5F4ED;padding:12px;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#6F7F75;">Daily Arrivals</div><div style="font-size:18px;font-weight:800;color:#12372A;">'+mandi.arrivals.toLocaleString('en-IN')+' t</div></div>'
    + '<div style="background:#F5F4ED;padding:12px;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#6F7F75;">Registered Buyers</div><div style="font-size:18px;font-weight:800;color:#12372A;">'+mandi.buyersCount+'</div></div>'
    + '<div style="background:#EAF6ED;padding:12px;border-radius:8px;text-align:center;"><div style="font-size:11px;color:#6F7F75;">Status</div><div style="font-size:14px;font-weight:700;color:#5B9A72;">\uD83D\uDFE2 Open</div></div>'
    + '</div>'
    + '<h4 style="font-size:14px;font-weight:700;color:#12372A;margin-bottom:12px;">All Commodity Prices at '+mandi.name+'</h4>'
    + '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">'
    + '<thead><tr style="background:#F5F4ED;"><th style="padding:8px 12px;text-align:left;">Crop</th><th style="padding:8px 12px;text-align:left;">Price</th><th style="padding:8px 12px;text-align:left;">7D Trend</th><th style="padding:8px 12px;text-align:left;">Demand</th></tr></thead>'
    + '<tbody>'+rows+'</tbody></table></div>'
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
  if (!best) { msgEl.textContent = 'No mandis found. Try expanding the radius or selecting All India.'; return; }

  var price = best.prices[crop]||0, chg = CROP_CHANGE_PCT[crop]||0;
  var dist = this.userName ? ' (' + fmtDist(this.distances[best.id]) + ' from you)' : '';
  var trend = chg > 0 ? 'rising \u2197 '+chg+'%' : chg < 0 ? 'falling \u2198 '+Math.abs(chg)+'%' : 'stable';

  msgEl.innerHTML = 'For <strong>'+cropName+'</strong>, <strong>'+best.name+'</strong>'+dist+' is your best option at <strong>'+fmtPrice(price)+'</strong>. Prices are <strong>'+trend+'</strong> this week. '+(this.userName?'':'Set your location for personalised advice.');

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

  if (!list.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#6F7F75;">'
      + '<div style="font-size:32px;margin-bottom:8px;">\uD83D\uDDFA\uFE0F</div>'
      + '<p style="font-weight:600;">No mandis found</p>'
      + '<button class="btn btn--secondary btn--sm" onclick="mandiMapEngine.setDist(0)" style="margin-top:8px;">View All India</button>'
      + '</div>'; return;
  }

  var html = '<div style="font-size:13px;font-weight:600;color:#6F7F75;padding:4px 0 12px;border-bottom:1px solid #E2E0D5;margin-bottom:12px;">'
    + list.length+' mandis'+(self.distFilter>0?' within '+self.distFilter+'km':' across India')+' \u00b7 sorted by best option</div>';

  var show = list.slice(0, 12);
  show.forEach(function(mandi) {
    var price = mandi.prices[crop]||0;
    var dist = self.distances[mandi.id];
    var chg = CROP_CHANGE_PCT[crop]||0, dir = chg>=0?'up':'down', arrow = chg>=0?'\u2197':'\u2198';
    var isBest = self.bestNearby && mandi.id === self.bestNearby.id;
    var dem = demandLabel(mandi.demand[crop]||'medium');

    html += '<div onclick="mandiMapEngine.showPopup(MANDI_MAP_DATA.find(function(m){return m.id===\''+mandi.id+'\'}))" style="border:1px solid '+(isBest?'#5B9A72':'#E2E0D5')+';border-radius:10px;padding:12px 14px;margin-bottom:10px;cursor:pointer;background:'+(isBest?'#EAF6ED':'#fff')+';transition:all 0.15s;" onmouseover="this.style.borderColor=\'#5B9A72\'" onmouseout="this.style.borderColor=\''+(isBest?'#5B9A72':'#E2E0D5')+'\'">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">'
      + '<div><div style="font-size:13px;font-weight:700;color:#12372A;">'+(isBest?'\uD83C\uDFC5 ':'')+mandi.name+'</div>'
      + '<div style="font-size:11px;color:#6F7F75;margin-top:2px;">\uD83D\uDCCD '+fmtDist(dist)+' \u00b7 '+mandi.state+'</div></div>'
      + '<div style="text-align:right;"><div style="font-size:15px;font-weight:800;color:#5B9A72;">'+fmtPrice(price)+'</div>'
      + '<div style="font-size:11px;color:'+(dir==='up'?'#059669':'#DC2626')+';">'+arrow+' '+Math.abs(chg)+'%</div></div>'
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;">'
      + '<span style="font-size:11px;color:#12372A;background:'+(mandi.demand[crop]==='high'?'#FDE68A':'#F5F4ED')+';padding:2px 8px;border-radius:999px;font-weight:600;">'+dem+'</span>'
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

MandiMapEngine.prototype.setCrop = function(c) { this.crop = c; this.refresh(); };
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



