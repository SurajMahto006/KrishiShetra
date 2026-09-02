/**
 * KRISHISHETRA — MANDI PRICE COMPARISON ENGINE
 * Fully self-contained. Reuses MANDI_MAP_DATA from mandi-map.js
 * if available, otherwise falls back to built-in dataset.
 *
 * Architecture:
 *  1. MPC_DATA        — mock data (45 mandis × 15 crops)
 *  2. MPC_CROP_META   — crop display info
 *  3. MandiCompare    — main engine class
 *     - calcBestValue()   — weighted scoring (price 50%, proximity 35%, demand 15%)
 *     - renderSummary()   — 4-stat strip
 *     - renderRecommendation() — AI-style "Best Choice for You" card
 *     - renderCalc()      — price difference calculator
 *     - renderCards()     — mandi card grid
 *     - renderCompareTable() — side-by-side comparison
 *     - renderChart()     — Chart.js bar chart
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// 1. MOCK MANDI DATA (45 mandis, modular — swap with real API later)
//    Transport cost = distance × 20 ₹/km (avg truck rate per quintal)
// ─────────────────────────────────────────────────────────────────────────────

var MPC_DATA = [
  { id:'pune',       name:'Pune APMC',               state:'Maharashtra',    city:'Pune',        dist:12,  arrivals:1420, buyers:84,  lastUpdated:'Today, 8:30 AM',
    prices:{rice:2850,wheat:2620,onion:2850,tomato:2400,maize:2280,soybean:4550,potato:1800,chilli:8350,groundnut:6450,cotton:6750,sugarcane:3150,mango:5500,banana:1850,grapes:6200,pulses:7400},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'medium',maize:'medium',soybean:'medium',potato:'low',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'medium',grapes:'high',pulses:'medium'} },
  { id:'mumbai',     name:'Mumbai APMC (Vashi)',      state:'Maharashtra',    city:'Navi Mumbai', dist:140, arrivals:2650, buyers:142, lastUpdated:'Today, 9:00 AM',
    prices:{rice:2920,wheat:2700,onion:2950,tomato:2550,maize:2350,soybean:4700,potato:1900,chilli:8600,groundnut:6600,cotton:6900,sugarcane:3200,mango:6200,banana:1950,grapes:6600,pulses:7650},
    demand:{rice:'high',wheat:'high',onion:'high',tomato:'high',maize:'medium',soybean:'high',potato:'medium',chilli:'high',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'nashik',     name:'Nashik APMC',              state:'Maharashtra',    city:'Nashik',      dist:180, arrivals:1850, buyers:96,  lastUpdated:'Today, 8:00 AM',
    prices:{rice:2760,wheat:2580,onion:2980,tomato:2300,maize:2250,soybean:4480,potato:1750,chilli:8200,groundnut:6350,cotton:6680,sugarcane:3100,mango:5100,banana:1750,grapes:6800,pulses:7250},
    demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'low',maize:'low',soybean:'medium',potato:'low',chilli:'medium',groundnut:'medium',cotton:'low',sugarcane:'medium',mango:'medium',banana:'low',grapes:'high',pulses:'medium'} },
  { id:'nagpur',     name:'Nagpur APMC',              state:'Maharashtra',    city:'Nagpur',      dist:450, arrivals:1620, buyers:78,  lastUpdated:'Today, 7:45 AM',
    prices:{rice:2800,wheat:2660,onion:2720,tomato:2380,maize:2320,soybean:4620,potato:1820,chilli:8450,groundnut:6500,cotton:6820,sugarcane:3080,mango:4900,banana:1800,grapes:5900,pulses:7550},
    demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'medium',maize:'high',soybean:'high',potato:'medium',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'solapur',    name:'Solapur APMC',             state:'Maharashtra',    city:'Solapur',     dist:220, arrivals:980,  buyers:52,  lastUpdated:'Today, 9:15 AM',
    prices:{rice:2780,wheat:2590,onion:2800,tomato:2450,maize:2260,soybean:4500,potato:1780,chilli:8300,groundnut:6420,cotton:6700,sugarcane:3250,mango:4800,banana:1900,grapes:6300,pulses:7450},
    demand:{rice:'medium',wheat:'medium',onion:'medium',tomato:'high',maize:'medium',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'medium',cotton:'medium',sugarcane:'high',mango:'low',banana:'high',grapes:'high',pulses:'high'} },
  { id:'kolhapur',   name:'Kolhapur APMC',            state:'Maharashtra',    city:'Kolhapur',    dist:270, arrivals:890,  buyers:46,  lastUpdated:'Today, 8:45 AM',
    prices:{rice:2810,wheat:2600,onion:2830,tomato:2420,maize:2270,soybean:4520,potato:1790,chilli:8280,groundnut:6400,cotton:6720,sugarcane:3400,mango:5200,banana:1820,grapes:6100,pulses:7350},
    demand:{rice:'medium',wheat:'low',onion:'medium',tomato:'medium',maize:'low',soybean:'low',potato:'low',chilli:'low',groundnut:'medium',cotton:'low',sugarcane:'high',mango:'medium',banana:'medium',grapes:'medium',pulses:'medium'} },
  { id:'latur',      name:'Latur APMC',               state:'Maharashtra',    city:'Latur',       dist:340, arrivals:1560, buyers:88,  lastUpdated:'Today, 8:20 AM',
    prices:{rice:2770,wheat:2630,onion:2740,tomato:2380,maize:2290,soybean:4720,potato:1790,chilli:8460,groundnut:6540,cotton:6800,sugarcane:3180,mango:5100,banana:1830,grapes:5900,pulses:7750},
    demand:{rice:'medium',wheat:'medium',onion:'low',tomato:'low',maize:'medium',soybean:'high',potato:'low',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'medium',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'aurangabad', name:'Sambhajinagar APMC',       state:'Maharashtra',    city:'Sambhajinagar',dist:210,arrivals:1140, buyers:64,  lastUpdated:'Today, 9:30 AM',
    prices:{rice:2790,wheat:2640,onion:2770,tomato:2360,maize:2300,soybean:4580,potato:1810,chilli:8380,groundnut:6480,cotton:6780,sugarcane:3120,mango:5300,banana:1840,grapes:6050,pulses:7480},
    demand:{rice:'medium',wheat:'medium',onion:'medium',tomato:'low',maize:'medium',soybean:'medium',potato:'low',chilli:'medium',groundnut:'medium',cotton:'medium',sugarcane:'medium',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'indore',     name:'Indore Mandi',             state:'Madhya Pradesh', city:'Indore',      dist:520, arrivals:2850, buyers:135, lastUpdated:'Today, 7:30 AM',
    prices:{rice:2750,wheat:2680,onion:2790,tomato:2320,maize:2340,soybean:4780,potato:1780,chilli:8400,groundnut:6560,cotton:6850,sugarcane:2950,mango:5300,banana:1840,grapes:6100,pulses:7600},
    demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'low',maize:'high',soybean:'high',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'high'} },
  { id:'bhopal',     name:'Bhopal Mandi',             state:'Madhya Pradesh', city:'Bhopal',      dist:580, arrivals:1750, buyers:82,  lastUpdated:'Today, 8:10 AM',
    prices:{rice:2730,wheat:2650,onion:2760,tomato:2350,maize:2310,soybean:4680,potato:1760,chilli:8320,groundnut:6490,cotton:6790,sugarcane:2980,mango:5200,banana:1820,grapes:6000,pulses:7540},
    demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'medium',maize:'medium',soybean:'high',potato:'medium',chilli:'medium',groundnut:'medium',cotton:'medium',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'ujjain',     name:'Ujjain Mandi',             state:'Madhya Pradesh', city:'Ujjain',      dist:560, arrivals:1420, buyers:68,  lastUpdated:'Today, 8:50 AM',
    prices:{rice:2720,wheat:2670,onion:2780,tomato:2300,maize:2300,soybean:4730,potato:1740,chilli:8300,groundnut:6510,cotton:6810,sugarcane:2920,mango:5150,banana:1800,grapes:5950,pulses:7510},
    demand:{rice:'low',wheat:'high',onion:'medium',tomato:'low',maize:'medium',soybean:'high',potato:'low',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'low',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'gwalior',    name:'Gwalior Mandi',            state:'Madhya Pradesh', city:'Gwalior',     dist:720, arrivals:1380, buyers:66,  lastUpdated:'Today, 9:00 AM',
    prices:{rice:2790,wheat:2710,onion:2730,tomato:2370,maize:2300,soybean:4620,potato:1880,chilli:8290,groundnut:6460,cotton:6770,sugarcane:3050,mango:5250,banana:1830,grapes:5900,pulses:7520},
    demand:{rice:'medium',wheat:'high',onion:'low',tomato:'medium',maize:'medium',soybean:'medium',potato:'high',chilli:'low',groundnut:'medium',cotton:'low',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'ahmedabad',  name:'Ahmedabad APMC',           state:'Gujarat',        city:'Ahmedabad',   dist:490, arrivals:2350, buyers:118, lastUpdated:'Today, 8:00 AM',
    prices:{rice:2870,wheat:2660,onion:2880,tomato:2470,maize:2320,soybean:4630,potato:1860,chilli:8500,groundnut:6680,cotton:7040,sugarcane:3120,mango:5900,banana:1910,grapes:6450,pulses:7520},
    demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'medium',potato:'high',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'medium',mango:'high',banana:'high',grapes:'high',pulses:'medium'} },
  { id:'rajkot',     name:'Rajkot APMC',              state:'Gujarat',        city:'Rajkot',      dist:650, arrivals:2150, buyers:112, lastUpdated:'Today, 7:50 AM',
    prices:{rice:2740,wheat:2630,onion:2840,tomato:2410,maize:2290,soybean:4610,potato:1830,chilli:8520,groundnut:6780,cotton:7180,sugarcane:3000,mango:5600,banana:1840,grapes:6100,pulses:7460},
    demand:{rice:'low',wheat:'medium',onion:'high',tomato:'medium',maize:'medium',soybean:'medium',potato:'medium',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'medium'} },
  { id:'surat',      name:'Surat APMC',               state:'Gujarat',        city:'Surat',       dist:280, arrivals:1880, buyers:94,  lastUpdated:'Today, 9:20 AM',
    prices:{rice:2860,wheat:2670,onion:2890,tomato:2480,maize:2330,soybean:4640,potato:1870,chilli:8480,groundnut:6640,cotton:7010,sugarcane:3280,mango:6100,banana:1940,grapes:6500,pulses:7550},
    demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'medium'} },
  { id:'khanna',     name:'Khanna Mandi',             state:'Punjab',         city:'Khanna',      dist:1580,arrivals:4200, buyers:186, lastUpdated:'Today, 6:30 AM',
    prices:{rice:2980,wheat:2750,onion:2710,tomato:2340,maize:2380,soybean:4510,potato:1790,chilli:8250,groundnut:6380,cotton:7050,sugarcane:3380,mango:5100,banana:1800,grapes:5900,pulses:7580},
    demand:{rice:'high',wheat:'high',onion:'low',tomato:'low',maize:'high',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'high',sugarcane:'high',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'ludhiana',   name:'Ludhiana Mandi',           state:'Punjab',         city:'Ludhiana',    dist:1560,arrivals:3100, buyers:145, lastUpdated:'Today, 7:00 AM',
    prices:{rice:2960,wheat:2740,onion:2730,tomato:2360,maize:2370,soybean:4520,potato:1810,chilli:8280,groundnut:6400,cotton:7020,sugarcane:3350,mango:5200,banana:1820,grapes:6000,pulses:7560},
    demand:{rice:'high',wheat:'high',onion:'medium',tomato:'low',maize:'high',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'high',sugarcane:'high',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'amritsar',   name:'Amritsar Mandi',           state:'Punjab',         city:'Amritsar',    dist:1610,arrivals:2750, buyers:120, lastUpdated:'Today, 7:15 AM',
    prices:{rice:3020,wheat:2730,onion:2700,tomato:2350,maize:2350,soybean:4490,potato:1800,chilli:8220,groundnut:6360,cotton:6980,sugarcane:3320,mango:5150,banana:1790,grapes:5950,pulses:7520},
    demand:{rice:'high',wheat:'high',onion:'low',tomato:'low',maize:'medium',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'medium',sugarcane:'high',mango:'low',banana:'low',grapes:'low',pulses:'medium'} },
  { id:'karnal',     name:'Karnal APMC',              state:'Haryana',        city:'Karnal',      dist:1490,arrivals:3200, buyers:148, lastUpdated:'Today, 6:45 AM',
    prices:{rice:3050,wheat:2730,onion:2740,tomato:2370,maize:2360,soybean:4540,potato:1830,chilli:8310,groundnut:6420,cotton:6990,sugarcane:3370,mango:5250,banana:1830,grapes:6050,pulses:7570},
    demand:{rice:'high',wheat:'high',onion:'medium',tomato:'low',maize:'medium',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'medium',sugarcane:'high',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'hisar',      name:'Hisar Mandi',              state:'Haryana',        city:'Hisar',       dist:1440,arrivals:2150, buyers:96,  lastUpdated:'Today, 7:30 AM',
    prices:{rice:2890,wheat:2710,onion:2710,tomato:2330,maize:2330,soybean:4490,potato:1790,chilli:8250,groundnut:6390,cotton:7140,sugarcane:3280,mango:5050,banana:1800,grapes:5850,pulses:7510},
    demand:{rice:'medium',wheat:'high',onion:'low',tomato:'low',maize:'medium',soybean:'low',potato:'low',chilli:'low',groundnut:'low',cotton:'high',sugarcane:'medium',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'lucknow',    name:'Lucknow Mandi',            state:'Uttar Pradesh',  city:'Lucknow',     dist:890, arrivals:2550, buyers:124, lastUpdated:'Today, 8:30 AM',
    prices:{rice:2860,wheat:2710,onion:2790,tomato:2440,maize:2320,soybean:4580,potato:1910,chilli:8410,groundnut:6490,cotton:6820,sugarcane:3300,mango:6400,banana:1890,grapes:6350,pulses:7620},
    demand:{rice:'high',wheat:'high',onion:'medium',tomato:'medium',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'medium',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'agra',       name:'Agra Mandi',               state:'Uttar Pradesh',  city:'Agra',        dist:1100,arrivals:2950, buyers:138, lastUpdated:'Today, 8:00 AM',
    prices:{rice:2820,wheat:2690,onion:2760,tomato:2410,maize:2310,soybean:4560,potato:1980,chilli:8340,groundnut:6460,cotton:6810,sugarcane:3240,mango:5400,banana:1850,grapes:6150,pulses:7570},
    demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'medium',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'low',cotton:'low',sugarcane:'medium',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'varanasi',   name:'Varanasi Mandi',           state:'Uttar Pradesh',  city:'Varanasi',    dist:1050,arrivals:1850, buyers:88,  lastUpdated:'Today, 8:45 AM',
    prices:{rice:2880,wheat:2680,onion:2810,tomato:2460,maize:2310,soybean:4540,potato:1890,chilli:8450,groundnut:6440,cotton:6780,sugarcane:3280,mango:5800,banana:1920,grapes:6300,pulses:7640},
    demand:{rice:'high',wheat:'medium',onion:'medium',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'low',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'patna',      name:'Patna Mandi',              state:'Bihar',          city:'Patna',       dist:1300,arrivals:2150, buyers:96,  lastUpdated:'Today, 8:15 AM',
    prices:{rice:2890,wheat:2660,onion:2840,tomato:2490,maize:2350,soybean:4500,potato:1900,chilli:8550,groundnut:6420,cotton:6720,sugarcane:3200,mango:5800,banana:1980,grapes:6300,pulses:7650},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'low',cotton:'low',sugarcane:'medium',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'jaipur',     name:'Jaipur Mandi',             state:'Rajasthan',      city:'Jaipur',      dist:760, arrivals:2480, buyers:122, lastUpdated:'Today, 8:00 AM',
    prices:{rice:2810,wheat:2680,onion:2820,tomato:2460,maize:2320,soybean:4620,potato:1840,chilli:8420,groundnut:6590,cotton:6890,sugarcane:3050,mango:5500,banana:1870,grapes:6300,pulses:7560},
    demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'high'} },
  { id:'kota',       name:'Kota Mandi',               state:'Rajasthan',      city:'Kota',        dist:690, arrivals:2650, buyers:130, lastUpdated:'Today, 9:00 AM',
    prices:{rice:2790,wheat:2670,onion:2750,tomato:2330,maize:2360,soybean:4740,potato:1770,chilli:8370,groundnut:6520,cotton:6920,sugarcane:3120,mango:5200,banana:1810,grapes:5950,pulses:7620},
    demand:{rice:'low',wheat:'high',onion:'low',tomato:'low',maize:'high',soybean:'high',potato:'low',chilli:'medium',groundnut:'high',cotton:'high',sugarcane:'low',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'jodhpur',    name:'Jodhpur Mandi',            state:'Rajasthan',      city:'Jodhpur',     dist:810, arrivals:1520, buyers:74,  lastUpdated:'Today, 8:30 AM',
    prices:{rice:2750,wheat:2660,onion:2810,tomato:2380,maize:2280,soybean:4560,potato:1810,chilli:8650,groundnut:6680,cotton:6940,sugarcane:2900,mango:5300,banana:1830,grapes:6100,pulses:7680},
    demand:{rice:'low',wheat:'medium',onion:'medium',tomato:'low',maize:'low',soybean:'medium',potato:'low',chilli:'high',groundnut:'high',cotton:'medium',sugarcane:'low',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'bengaluru',  name:'Bengaluru APMC',           state:'Karnataka',      city:'Bengaluru',   dist:840, arrivals:2890, buyers:146, lastUpdated:'Today, 7:45 AM',
    prices:{rice:2940,wheat:2690,onion:2910,tomato:2580,maize:2380,soybean:4620,potato:1890,chilli:8590,groundnut:6640,cotton:6860,sugarcane:3250,mango:6500,banana:1980,grapes:6800,pulses:7680},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'medium',potato:'high',chilli:'high',groundnut:'high',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'hubballi',   name:'Hubballi APMC',            state:'Karnataka',      city:'Hubballi',    dist:500, arrivals:1840, buyers:92,  lastUpdated:'Today, 8:30 AM',
    prices:{rice:2850,wheat:2640,onion:2870,tomato:2460,maize:2350,soybean:4590,potato:1820,chilli:8640,groundnut:6580,cotton:7010,sugarcane:3310,mango:5700,banana:1870,grapes:6300,pulses:7540},
    demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'medium',maize:'high',soybean:'medium',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'medium',banana:'medium',grapes:'high',pulses:'medium'} },
  { id:'hyderabad',  name:'Hyderabad APMC',           state:'Telangana',      city:'Hyderabad',   dist:560, arrivals:2750, buyers:140, lastUpdated:'Today, 8:00 AM',
    prices:{rice:2920,wheat:2680,onion:2890,tomato:2540,maize:2380,soybean:4610,potato:1880,chilli:8750,groundnut:6650,cotton:7020,sugarcane:3200,mango:6300,banana:1950,grapes:6600,pulses:7680},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'medium',potato:'high',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'medium',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'warangal',   name:'Warangal APMC',            state:'Telangana',      city:'Warangal',    dist:610, arrivals:2450, buyers:118, lastUpdated:'Today, 8:15 AM',
    prices:{rice:2890,wheat:2600,onion:2820,tomato:2460,maize:2390,soybean:4560,potato:1810,chilli:8820,groundnut:6610,cotton:7120,sugarcane:3150,mango:5800,banana:1880,grapes:6100,pulses:7620},
    demand:{rice:'high',wheat:'low',onion:'medium',tomato:'medium',maize:'high',soybean:'medium',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'guntur',     name:'Guntur APMC',              state:'Andhra Pradesh', city:'Guntur',      dist:720, arrivals:3600, buyers:175, lastUpdated:'Today, 7:30 AM',
    prices:{rice:2900,wheat:2600,onion:2840,tomato:2480,maize:2390,soybean:4530,potato:1820,chilli:8950,groundnut:6650,cotton:7150,sugarcane:3300,mango:6100,banana:1920,grapes:6200,pulses:7650},
    demand:{rice:'high',wheat:'low',onion:'medium',tomato:'high',maize:'high',soybean:'low',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'high',banana:'high',grapes:'low',pulses:'high'} },
  { id:'vijayawada', name:'Vijayawada APMC',          state:'Andhra Pradesh', city:'Vijayawada',  dist:680, arrivals:2200, buyers:110, lastUpdated:'Today, 8:00 AM',
    prices:{rice:2930,wheat:2620,onion:2860,tomato:2510,maize:2380,soybean:4540,potato:1850,chilli:8780,groundnut:6620,cotton:7040,sugarcane:3350,mango:6400,banana:1960,grapes:6400,pulses:7660},
    demand:{rice:'high',wheat:'low',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'medium',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'chennai',    name:'Chennai Koyambedu',        state:'Tamil Nadu',     city:'Chennai',     dist:1300,arrivals:3400, buyers:165, lastUpdated:'Today, 7:00 AM',
    prices:{rice:2970,wheat:2710,onion:2960,tomato:2620,maize:2410,soybean:4620,potato:1940,chilli:8720,groundnut:6720,cotton:6950,sugarcane:3400,mango:6600,banana:2050,grapes:6700,pulses:7720},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'coimbatore', name:'Coimbatore Mandi',         state:'Tamil Nadu',     city:'Coimbatore',  dist:980, arrivals:2150, buyers:104, lastUpdated:'Today, 7:30 AM',
    prices:{rice:2940,wheat:2670,onion:2920,tomato:2560,maize:2400,soybean:4570,potato:1910,chilli:8680,groundnut:6680,cotton:7020,sugarcane:3420,mango:6300,banana:2020,grapes:6600,pulses:7670},
    demand:{rice:'high',wheat:'low',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'madurai',    name:'Madurai Mandi',            state:'Tamil Nadu',     city:'Madurai',     dist:1120,arrivals:1890, buyers:92,  lastUpdated:'Today, 8:00 AM',
    prices:{rice:2950,wheat:2640,onion:2910,tomato:2550,maize:2380,soybean:4520,potato:1900,chilli:8690,groundnut:6670,cotton:6980,sugarcane:3380,mango:6200,banana:2010,grapes:6550,pulses:7660},
    demand:{rice:'high',wheat:'low',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'kolkata',    name:'Kolkata Mandi',            state:'West Bengal',    city:'Kolkata',     dist:1780,arrivals:2950, buyers:148, lastUpdated:'Today, 7:00 AM',
    prices:{rice:2940,wheat:2720,onion:2930,tomato:2520,maize:2360,soybean:4590,potato:1960,chilli:8620,groundnut:6580,cotton:6780,sugarcane:3150,mango:6300,banana:1940,grapes:6500,pulses:7700},
    demand:{rice:'high',wheat:'high',onion:'high',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'high',groundnut:'medium',cotton:'low',sugarcane:'medium',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'bhubaneswar',name:'Bhubaneswar Mandi',        state:'Odisha',         city:'Bhubaneswar', dist:1290,arrivals:1850, buyers:88,  lastUpdated:'Today, 7:30 AM',
    prices:{rice:2900,wheat:2680,onion:2880,tomato:2480,maize:2340,soybean:4540,potato:1920,chilli:8550,groundnut:6560,cotton:6750,sugarcane:3200,mango:5900,banana:1920,grapes:6350,pulses:7620},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'high',groundnut:'medium',cotton:'low',sugarcane:'medium',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'raipur',     name:'Raipur Mandi',             state:'Chhattisgarh',   city:'Raipur',      dist:950, arrivals:2450, buyers:120, lastUpdated:'Today, 8:30 AM',
    prices:{rice:2960,wheat:2660,onion:2840,tomato:2440,maize:2360,soybean:4580,potato:1890,chilli:8480,groundnut:6540,cotton:6760,sugarcane:3250,mango:5700,banana:1890,grapes:6250,pulses:7600},
    demand:{rice:'high',wheat:'medium',onion:'medium',tomato:'medium',maize:'high',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'medium',cotton:'low',sugarcane:'high',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'kochi',      name:'Kochi Mandi',              state:'Kerala',         city:'Kochi',       dist:1040,arrivals:1820, buyers:94,  lastUpdated:'Today, 7:15 AM',
    prices:{rice:2980,wheat:2750,onion:2980,tomato:2650,maize:2420,soybean:4620,potato:1970,chilli:8790,groundnut:6720,cotton:6850,sugarcane:3400,mango:6700,banana:2150,grapes:6850,pulses:7750},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'guwahati',   name:'Guwahati Mandi',           state:'Assam',          city:'Guwahati',    dist:1760,arrivals:1520, buyers:78,  lastUpdated:'Today, 7:00 AM',
    prices:{rice:2950,wheat:2740,onion:2920,tomato:2540,maize:2390,soybean:4560,potato:1950,chilli:8650,groundnut:6550,cotton:6710,sugarcane:3150,mango:6200,banana:2050,grapes:6450,pulses:7680},
    demand:{rice:'high',wheat:'high',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'low',cotton:'low',sugarcane:'low',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'shimla',     name:'Shimla Mandi',             state:'Himachal Pradesh',city:'Shimla',     dist:1410,arrivals:1250, buyers:68,  lastUpdated:'Today, 8:00 AM',
    prices:{rice:2920,wheat:2760,onion:2880,tomato:2580,maize:2370,soybean:4520,potato:1990,chilli:8450,groundnut:6480,cotton:6820,sugarcane:3200,mango:5900,banana:1920,grapes:6400,pulses:7650},
    demand:{rice:'medium',wheat:'high',onion:'high',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'low',cotton:'low',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'high'} },
  { id:'jammu',      name:'Jammu Mandi',              state:'Jammu & Kashmir',city:'Jammu',       dist:1540,arrivals:1650, buyers:84,  lastUpdated:'Today, 7:30 AM',
    prices:{rice:3020,wheat:2780,onion:2890,tomato:2540,maize:2380,soybean:4540,potato:1960,chilli:8420,groundnut:6500,cotton:6850,sugarcane:3220,mango:5850,banana:1910,grapes:6450,pulses:7680},
    demand:{rice:'high',wheat:'high',onion:'high',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'low',cotton:'low',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'high'} }
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. CROP METADATA
// ─────────────────────────────────────────────────────────────────────────────

var MPC_CROP_META = {
  rice:       { emoji:'🌾', name:'Rice',       unit:'₹/q', trend:5.2 },
  wheat:      { emoji:'🌾', name:'Wheat',      unit:'₹/q', trend:6.2 },
  onion:      { emoji:'🧅', name:'Onion',      unit:'₹/q', trend:3.8 },
  tomato:     { emoji:'🍅', name:'Tomato',     unit:'₹/q', trend:-1.4 },
  maize:      { emoji:'🌽', name:'Maize',      unit:'₹/q', trend:2.1 },
  soybean:    { emoji:'🫘', name:'Soybean',    unit:'₹/q', trend:4.8 },
  potato:     { emoji:'🥔', name:'Potato',     unit:'₹/q', trend:0.8 },
  chilli:     { emoji:'🌶️', name:'Chilli',     unit:'₹/q', trend:7.2 },
  groundnut:  { emoji:'🥜', name:'Groundnut',  unit:'₹/q', trend:3.4 },
  cotton:     { emoji:'☁️', name:'Cotton',     unit:'₹/q', trend:-0.6 },
  sugarcane:  { emoji:'🎋', name:'Sugarcane',  unit:'₹/q', trend:1.8 },
  mango:      { emoji:'🥭', name:'Mango',      unit:'₹/q', trend:6.5 },
  banana:     { emoji:'🍌', name:'Banana',     unit:'₹/q', trend:2.2 },
  grapes:     { emoji:'🍇', name:'Grapes',     unit:'₹/q', trend:4.1 },
  pulses:     { emoji:'🥣', name:'Pulses',     unit:'₹/q', trend:3.9 }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function mpcFmtINR(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function mpcTransportCost(dist, qty) {
  // ₹20 per quintal per km (market rate for truck transport in India)
  return Math.round(dist * qty * 20);
}

function mpcNetEarnings(price, dist, qty) {
  return price * qty - mpcTransportCost(dist, qty);
}

function mpcDemandScore(d) {
  return d === 'high' ? 1 : d === 'low' ? 0.2 : 0.6;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MAIN ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────

function MandiCompare() {
  this.crop       = 'rice';
  this.qty        = 20;
  this.sortBy     = 'best';
  this.searchQ    = '';
  this.nearbyOnly = false;
  this.selected   = [];   // up to 3 mandi IDs for side-by-side compare
  this.chart      = null;
  this.chartMode  = 'price';
}

MandiCompare.prototype.init = function() {
  this.bindControls();
  this.loadUserCrops();
  this.render();
};

// ── Bind UI controls ────────────────────────────────────────────────────────

MandiCompare.prototype.bindControls = function() {
  var self = this;

  var cropSel = document.getElementById('mpc-crop-select');
  if (cropSel) cropSel.addEventListener('change', function(e) {
    self.crop = e.target.value;
    self.render();
  });

  var qtyIn = document.getElementById('mpc-qty-input');
  if (qtyIn) {
    var t;
    qtyIn.addEventListener('input', function(e) {
      clearTimeout(t);
      t = setTimeout(function() {
        var v = parseInt(e.target.value, 10);
        if (!isNaN(v) && v > 0) { self.qty = v; self.render(); }
      }, 350);
    });
  }

  var sortSel = document.getElementById('mpc-sort-select');
  if (sortSel) sortSel.addEventListener('change', function(e) {
    self.sortBy = e.target.value;
    self.renderCards();
    self.renderCalc();
  });

  var searchIn = document.getElementById('mpc-search-input');
  if (searchIn) {
    var st;
    searchIn.addEventListener('input', function(e) {
      clearTimeout(st);
      st = setTimeout(function() { self.searchQ = e.target.value.toLowerCase().trim(); self.renderCards(); }, 250);
    });
  }

  var nearbyChk = document.getElementById('mpc-nearby-only');
  if (nearbyChk) nearbyChk.addEventListener('change', function(e) {
    self.nearbyOnly = e.target.checked;
    self.renderCards();
  });

  var clearBtn = document.getElementById('mpc-clear-compare');
  if (clearBtn) clearBtn.addEventListener('click', function() {
    self.selected = [];
    self.renderCompareTable();
    self.renderCards();
  });

  // Profile dropdown (simple toggle for this page)
  var profileBtn = document.getElementById('btn-profile');
  var profileDd  = document.getElementById('dash-profile-dropdown');
  var profileWrap = document.getElementById('dash-profile-wrap');
  if (profileBtn && profileWrap) {
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      profileWrap.classList.toggle('open');
    });
    document.addEventListener('click', function() { profileWrap.classList.remove('open'); });
  }

  // Mobile nav toggle
  var navToggle = document.getElementById('dash-nav-toggle');
  var mobileNav = document.getElementById('dash-mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });
  }

  // Chart mode toggle
  document.querySelectorAll('.mpc-chart-toggle-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.mpc-chart-toggle-btn').forEach(function(b) { b.classList.remove('mpc-chart-toggle-btn--active'); });
      btn.classList.add('mpc-chart-toggle-btn--active');
      self.chartMode = btn.dataset.chart;
      self.renderChart();
    });
  });
};

// ── Load user's listed crops as quick-select pills ──────────────────────────

MandiCompare.prototype.loadUserCrops = function() {
  var self = this;
  var wrap = document.getElementById('mpc-your-crops');
  if (!wrap) return;

  // Try to load from localStorage (krishishetra_state_v1)
  var userCrops = [];
  try {
    var state = JSON.parse(localStorage.getItem('krishishetra_state_v1') || '{}');
    if (state.lots && state.lots.length) {
      var seen = {};
      state.lots.forEach(function(lot) {
        if (lot.cropId && !seen[lot.cropId]) {
          seen[lot.cropId] = true;
          userCrops.push({ id: lot.cropId, name: lot.crop });
        }
      });
    }
  } catch(e) {}

  // Fallback sample if no stored lots
  if (!userCrops.length) {
    userCrops = [
      { id:'wheat', name:'Wheat' },
      { id:'onion', name:'Onion' },
      { id:'rice',  name:'Rice'  }
    ];
  }

  wrap.innerHTML = userCrops.map(function(c) {
    var meta = MPC_CROP_META[c.id] || { emoji: '🌾' };
    return '<button class="mpc-quick-crop-btn' + (c.id === self.crop ? ' active' : '') + '" data-crop="' + c.id + '">'
      + meta.emoji + ' ' + c.name + '</button>';
  }).join('');

  wrap.querySelectorAll('.mpc-quick-crop-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      self.crop = btn.dataset.crop;
      var sel = document.getElementById('mpc-crop-select');
      if (sel) sel.value = self.crop;
      wrap.querySelectorAll('.mpc-quick-crop-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      self.render();
    });
  });
};

// ── Full render ──────────────────────────────────────────────────────────────

MandiCompare.prototype.render = function() {
  this.renderSummary();
  this.renderRecommendation();
  this.renderCalc();
  this.renderCards();
  this.renderCompareTable();
  this.renderChart();
  if (window.lucide) lucide.createIcons();
};

// ── Get sorted/filtered list ─────────────────────────────────────────────────

MandiCompare.prototype.getList = function() {
  var self = this, crop = this.crop;
  var list = MPC_DATA.filter(function(m) { return m.prices[crop] > 0; });

  if (self.nearbyOnly) list = list.filter(function(m) { return m.dist <= 200; });
  if (self.searchQ) list = list.filter(function(m) {
    return m.name.toLowerCase().indexOf(self.searchQ) !== -1
        || m.city.toLowerCase().indexOf(self.searchQ) !== -1
        || m.state.toLowerCase().indexOf(self.searchQ) !== -1;
  });

  // Scoring for "best" sort
  var prices = list.map(function(m) { return m.prices[crop]; });
  var dists  = list.map(function(m) { return m.dist; });
  var maxP = Math.max.apply(null, prices), minP = Math.min.apply(null, prices), rP = maxP - minP || 1;
  var maxD = Math.max.apply(null, dists),  minD = Math.min.apply(null, dists),  rD = maxD - minD || 1;

  list.forEach(function(m) {
    var pn = (m.prices[crop] - minP) / rP;
    var dn = 1 - ((m.dist - minD) / rD);
    var dm = mpcDemandScore(m.demand[crop] || 'medium');
    m._score    = pn * 0.50 + dn * 0.35 + dm * 0.15;
    m._earnings = mpcNetEarnings(m.prices[crop], m.dist, self.qty);
  });

  list.sort(function(a, b) {
    if (self.sortBy === 'price')    return b.prices[crop] - a.prices[crop];
    if (self.sortBy === 'nearest')  return a.dist - b.dist;
    if (self.sortBy === 'earnings') return b._earnings - a._earnings;
    return b._score - a._score;   // 'best' default
  });

  return list;
};

// ── Summary strip ────────────────────────────────────────────────────────────

MandiCompare.prototype.renderSummary = function() {
  var crop = this.crop, qty = this.qty;
  var list = MPC_DATA.filter(function(m) { return m.prices[crop] > 0; });
  if (!list.length) return;

  var byPrice   = list.slice().sort(function(a,b){ return b.prices[crop] - a.prices[crop]; })[0];
  var byDist    = list.slice().sort(function(a,b){ return a.dist - b.dist; })[0];
  var avgPrice  = Math.round(list.reduce(function(s,m){ return s + m.prices[crop]; }, 0) / list.length);

  // Best value after transport
  list.forEach(function(m) { m._earnings = mpcNetEarnings(m.prices[crop], m.dist, qty); });
  var byValue   = list.slice().sort(function(a,b){ return b._earnings - a._earnings; })[0];

  var meta = MPC_CROP_META[crop] || { name: crop };

  function set(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

  set('sum-best-name',  byPrice.name);
  set('sum-best-price', mpcFmtINR(byPrice.prices[crop]) + '/q');
  set('sum-near-name',  byDist.name);
  set('sum-near-dist',  byDist.dist + ' km from Pune');
  set('sum-bv-name',    byValue.name);
  set('sum-bv-earn',    mpcFmtINR(byValue._earnings) + ' net for ' + qty + 'q');
  set('sum-avg-price',  mpcFmtINR(avgPrice) + '/q');
  set('sum-avg-sub',    'Average across ' + list.length + ' mandis');
};

// ── Recommendation card ──────────────────────────────────────────────────────

MandiCompare.prototype.renderRecommendation = function() {
  var el = document.getElementById('mpc-recommendation');
  if (!el) return;

  var crop = this.crop, qty = this.qty;
  var list = MPC_DATA.filter(function(m) { return m.prices[crop] > 0; });
  if (!list.length) { el.innerHTML = ''; return; }

  // Calc scores
  var prices = list.map(function(m) { return m.prices[crop]; });
  var dists  = list.map(function(m) { return m.dist; });
  var maxP = Math.max.apply(null, prices), minP = Math.min.apply(null, prices), rP = maxP - minP || 1;
  var maxD = Math.max.apply(null, dists),  minD = Math.min.apply(null, dists),  rD = maxD - minD || 1;
  list.forEach(function(m) {
    var pn = (m.prices[crop] - minP) / rP;
    var dn = 1 - ((m.dist - minD) / rD);
    var dm = mpcDemandScore(m.demand[crop] || 'medium');
    m._score = pn * 0.50 + dn * 0.35 + dm * 0.15;
    m._earnings = mpcNetEarnings(m.prices[crop], m.dist, qty);
  });

  var best = list.slice().sort(function(a,b){ return b._score - a._score; })[0];
  var byPrice  = list.slice().sort(function(a,b){ return b.prices[crop] - a.prices[crop]; })[0];
  var byDist   = list.slice().sort(function(a,b){ return a.dist - b.dist; })[0];
  var avgPrice = Math.round(prices.reduce(function(s,p){ return s+p; }, 0) / prices.length);
  var priceDiff = best.prices[crop] - avgPrice;
  var extraEarn = priceDiff * qty;
  var transport = mpcTransportCost(best.dist, qty);
  var netEarn   = best._earnings;

  var reasons = [];
  if (best.prices[crop] >= byPrice.prices[crop] * 0.98) {
    reasons.push('Offers the <strong>highest crop price</strong> — ' + mpcFmtINR(best.prices[crop]) + '/q');
  } else {
    reasons.push('Strong price at <strong>' + mpcFmtINR(best.prices[crop]) + '/q</strong> — ' + (priceDiff >= 0 ? '+' : '') + mpcFmtINR(priceDiff) + ' vs average');
  }
  if (best.dist < 250) {
    reasons.push('Relatively <strong>close distance</strong> — ' + best.dist + ' km, manageable transport cost');
  } else {
    reasons.push('<strong>Higher price covers</strong> longer distance — net earnings still best in class');
  }
  if ((best.demand[crop] || '') === 'high') {
    reasons.push('<strong>High buyer demand</strong> — faster sales, less waiting time at mandi');
  }
  reasons.push('Estimated net earnings: <strong>' + mpcFmtINR(netEarn) + '</strong> for ' + qty + ' quintals');

  var meta = MPC_CROP_META[crop] || { emoji: '🌾', name: crop };

  el.innerHTML = '<div class="mpc-rec__inner">'
    + '<div class="mpc-rec__badge-wrap">'
    + '<div class="mpc-rec__badge">⭐</div>'
    + '<span class="mpc-rec__badge-label">Best Choice</span>'
    + '</div>'
    + '<div class="mpc-rec__content">'
    + '<h3 class="mpc-rec__title">' + best.name + '</h3>'
    + '<p class="mpc-rec__subtitle">' + meta.emoji + ' Best mandi to sell your <strong style="color:var(--ks-mint);">' + meta.name + '</strong> today</p>'
    + '<div class="mpc-rec__reasons">'
    + reasons.map(function(r) {
        return '<div class="mpc-rec__reason"><div class="mpc-rec__reason-dot"></div><span>' + r + '</span></div>';
      }).join('')
    + '</div>'
    + '</div>'
    + '<div class="mpc-rec__actions">'
    + '<button class="btn btn--primary" onclick="mpcEngine.addToCompare(\'' + best.id + '\')">'
    + '<i data-lucide="bar-chart-2"></i> Compare This</button>'
    + '<button class="btn btn--secondary" style="border-color:rgba(255,255,255,0.3);color:#fff;" '
    + 'onclick="window.open(\'https://www.google.com/maps/search/' + encodeURIComponent(best.name + ' ' + best.city) + '\',\'_blank\')">'
    + '<i data-lucide="navigation"></i> Navigate</button>'
    + '</div>'
    + '</div>';

  if (window.lucide) lucide.createIcons();
};

// ── Price diff calculator ─────────────────────────────────────────────────────

MandiCompare.prototype.renderCalc = function() {
  var el = document.getElementById('mpc-calc-body');
  if (!el) return;

  var crop = this.crop, qty = this.qty;
  var list = MPC_DATA.filter(function(m) { return m.prices[crop] > 0; });
  if (!list.length) { el.innerHTML = '<p style="color:var(--ks-text-muted);font-size:13px;">No data available.</p>'; return; }

  // Top 5 by earnings
  list.forEach(function(m) { m._earnings = mpcNetEarnings(m.prices[crop], m.dist, qty); });
  var top5 = list.slice().sort(function(a,b){ return b._earnings - a._earnings; }).slice(0, 5);
  var best = top5[0];
  var baselineEarn = best._earnings;

  var rows = top5.map(function(m, i) {
    var transport = mpcTransportCost(m.dist, qty);
    var earn      = m._earnings;
    var diff      = earn - (i > 0 ? baselineEarn : earn);  // diff vs best
    var diffVsBest = earn - baselineEarn;
    var isBest = i === 0;

    return '<div class="mpc-calc-row' + (isBest ? ' mpc-calc-row--highlight' : '') + '">'
      + '<div class="mpc-calc-row__mandi">'
      + '<div class="mpc-calc-row__name">' + (isBest ? '⭐ ' : '') + m.name + '</div>'
      + '<div class="mpc-calc-row__dist">📍 ' + m.dist + ' km · Transport: ' + mpcFmtINR(transport) + '</div>'
      + '</div>'
      + '<div class="mpc-calc-row__price">'
      + '<div class="mpc-calc-row__price-val">' + mpcFmtINR(m.prices[crop]) + '/q</div>'
      + '<div class="mpc-calc-row__price-sub">Gross: ' + mpcFmtINR(m.prices[crop] * qty) + '</div>'
      + '</div>'
      + '<div class="mpc-calc-row__diff">'
      + (isBest
          ? '<div class="mpc-calc-row__diff-val mpc-calc-row__diff-val--best">Best Value</div>'
          : '<div class="mpc-calc-row__diff-val mpc-calc-row__diff-val--neutral">Net: ' + mpcFmtINR(earn) + '</div>')
      + '</div>'
      + '</div>';
  }).join('');

  // Potential gain: best vs second
  var second = top5[1];
  var potentialGain = second ? best.prices[crop] - second.prices[crop] : 0;
  var potentialEarnGain = second ? best._earnings - second._earnings : 0;

  var potential = '';
  if (second && potentialEarnGain > 0) {
    potential = '<div class="mpc-calc-potential">'
      + '<div class="mpc-calc-potential__icon">💰</div>'
      + '<div class="mpc-calc-potential__text">'
      + '<div class="mpc-calc-potential__headline">' + best.name + ' gives the best net return</div>'
      + '<div class="mpc-calc-potential__sub">Earns ' + mpcFmtINR(potentialEarnGain) + ' more than ' + second.name + ' after transport for ' + qty + ' quintals</div>'
      + '</div>'
      + '<div class="mpc-calc-potential__amount">+' + mpcFmtINR(potentialEarnGain) + '</div>'
      + '</div>';
  }

  el.innerHTML = '<div class="mpc-calc-rows">' + rows + '</div>' + potential;
};

// ── Mandi cards grid ──────────────────────────────────────────────────────────

MandiCompare.prototype.renderCards = function() {
  var self = this;
  var grid = document.getElementById('mpc-cards-grid');
  var countEl = document.getElementById('mpc-cards-count');
  if (!grid) return;

  var list = self.getList();
  var crop = self.crop;

  if (countEl) {
    countEl.textContent = list.length + ' mandis found'
      + (self.nearbyOnly ? ' within 200 km' : ' across India')
      + (self.searchQ ? ' matching "' + self.searchQ + '"' : '');
  }

  if (!list.length) {
    grid.innerHTML = '<div class="mpc-loading">'
      + '<p style="font-size:28px;margin-bottom:8px;">🔍</p>'
      + '<p>No mandis found. Try clearing the search or toggle nearby off.</p>'
      + '</div>';
    return;
  }

  var prices     = list.map(function(m){ return m.prices[crop]; });
  var maxPrice   = Math.max.apply(null, prices);
  var minDist    = list.reduce(function(mn, m){ return Math.min(mn, m.dist); }, Infinity);
  var meta       = MPC_CROP_META[crop] || { trend: 0 };
  var trend      = meta.trend || 0;
  var trendUp    = trend >= 0;

  // Compute best-value mandi
  var withEarn = list.slice();
  withEarn.forEach(function(m){ m._earnings = mpcNetEarnings(m.prices[crop], m.dist, self.qty); });
  var bestValue = withEarn.slice().sort(function(a,b){ return b._earnings - a._earnings; })[0];

  grid.innerHTML = list.map(function(m) {
    var price     = m.prices[crop];
    var transport = mpcTransportCost(m.dist, self.qty);
    var earn      = mpcNetEarnings(price, m.dist, self.qty);
    var demand    = m.demand[crop] || 'medium';
    var isAdded   = self.selected.indexOf(m.id) !== -1;

    // Badges
    var badges = '';
    if (price >= maxPrice * 0.999)     badges += '<span class="mpc-badge mpc-badge--gold">🏆 Highest Price</span>';
    if (m.dist <= minDist * 1.2)       badges += '<span class="mpc-badge mpc-badge--blue">📍 Nearest</span>';
    if (bestValue && m.id === bestValue.id) badges += '<span class="mpc-badge mpc-badge--green">⭐ Best Value</span>';
    if (demand === 'high')             badges += '<span class="mpc-badge mpc-badge--orange">🔥 High Demand</span>';
    if (!badges)                       badges  = '<span class="mpc-badge mpc-badge--neutral">🟡 Available</span>';

    var cardClass = 'mpc-mandi-card';
    if (price >= maxPrice * 0.999)   cardClass += ' mpc-mandi-card--best-price';
    else if (m.dist <= minDist * 1.2) cardClass += ' mpc-mandi-card--nearest';
    if (bestValue && m.id === bestValue.id) cardClass = cardClass.replace('mpc-mandi-card--nearest','') + ' mpc-mandi-card--best-value';
    if (isAdded) cardClass += ' mpc-mandi-card--selected';

    return '<div class="' + cardClass + '" id="mpc-card-' + m.id + '">'
      + '<div class="mpc-mandi-card__badges">' + badges + '</div>'
      + '<div class="mpc-mandi-card__header">'
      + '<div>'
      + '<div class="mpc-mandi-card__name">' + m.name + '</div>'
      + '<div class="mpc-mandi-card__location">📍 ' + m.city + ', ' + m.state + '</div>'
      + '</div>'
      + '<div class="mpc-mandi-card__price-block">'
      + '<div class="mpc-mandi-card__price">' + mpcFmtINR(price) + '</div>'
      + '<div class="mpc-mandi-card__price-unit">/quintal</div>'
      + '<div class="mpc-mandi-card__price-trend mpc-mandi-card__price-trend--' + (trendUp?'up':'down') + '">'
      + (trendUp ? '↑' : '↓') + ' ' + Math.abs(trend) + '% (7D)</div>'
      + '</div>'
      + '</div>'
      + '<div class="mpc-mandi-card__stats">'
      + '<div class="mpc-mandi-card__stat"><span class="mpc-mandi-card__stat-val">' + m.dist + ' km</span><span class="mpc-mandi-card__stat-lbl">Distance</span></div>'
      + '<div class="mpc-mandi-card__stat"><span class="mpc-mandi-card__stat-val">' + mpcFmtINR(transport) + '</span><span class="mpc-mandi-card__stat-lbl">Transport (' + self.qty + 'q)</span></div>'
      + '<div class="mpc-mandi-card__stat"><span class="mpc-mandi-card__stat-val">' + m.arrivals.toLocaleString('en-IN') + ' t</span><span class="mpc-mandi-card__stat-lbl">Daily Arrivals</span></div>'
      + '</div>'
      + '<div class="mpc-mandi-card__footer">'
      + '<div class="mpc-mandi-card__earnings">Net for ' + self.qty + 'q: <strong>' + mpcFmtINR(earn) + '</strong></div>'
      + '<div class="mpc-mandi-card__updated">🟢 ' + m.lastUpdated + '</div>'
      + '</div>'
      + '<div class="mpc-mandi-card__footer">'
      + '<div class="mpc-mandi-card__actions">'
      + '<button class="mpc-compare-add-btn' + (isAdded ? ' added' : '') + '" onclick="mpcEngine.addToCompare(\'' + m.id + '\')">'
      + (isAdded ? '✓ Added' : '+ Compare') + '</button>'
      + '<a class="mpc-nav-btn" href="https://www.google.com/maps/search/' + encodeURIComponent(m.name + ' ' + m.city) + '" target="_blank" rel="noopener">🗺️ Map</a>'
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');
};

// ── Add / remove from side-by-side compare ───────────────────────────────────

MandiCompare.prototype.addToCompare = function(id) {
  var idx = this.selected.indexOf(id);
  if (idx !== -1) {
    this.selected.splice(idx, 1);
  } else {
    if (this.selected.length >= 3) {
      this.selected.shift(); // remove oldest
    }
    this.selected.push(id);
  }
  this.renderCards();
  this.renderCompareTable();
  if (window.lucide) lucide.createIcons();

  // Auto-scroll to compare section if adding
  if (idx === -1) {
    var sec = document.getElementById('mpc-compare-section');
    if (sec) setTimeout(function(){ sec.scrollIntoView({ behavior:'smooth', block:'start' }); }, 200);
  }
};

// ── Side-by-side comparison table ────────────────────────────────────────────

MandiCompare.prototype.renderCompareTable = function() {
  var self = this;
  var empty   = document.getElementById('mpc-compare-empty');
  var wrapper = document.getElementById('mpc-compare-table-wrap');
  var clearBtn = document.getElementById('mpc-clear-compare');
  var table   = document.getElementById('mpc-compare-table');

  if (!table) return;

  if (!self.selected.length) {
    if (empty)   empty.style.display   = 'block';
    if (wrapper) wrapper.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';
    return;
  }

  if (empty)   empty.style.display   = 'none';
  if (wrapper) wrapper.style.display = 'block';
  if (clearBtn) clearBtn.style.display = 'inline-flex';

  var crop = self.crop, qty = self.qty;
  var mandis = self.selected.map(function(id) {
    return MPC_DATA.filter(function(m){ return m.id === id; })[0];
  }).filter(Boolean);

  if (!mandis.length) return;

  // Find best by net earnings
  mandis.forEach(function(m) { m._earnings = mpcNetEarnings(m.prices[crop], m.dist, qty); });
  var bestM = mandis.slice().sort(function(a,b){ return b._earnings - a._earnings; })[0];

  var rows = [
    { label:'Price per Quintal',     key:'price',     fmt: function(m){ return '<span class="mpc-ct-price">' + mpcFmtINR(m.prices[crop]) + '</span>'; } },
    { label:'Distance from you',     key:'dist',      fmt: function(m){ return m.dist + ' km'; } },
    { label:'Transport Cost (' + qty + 'q)', key:'transport', fmt: function(m){ return mpcFmtINR(mpcTransportCost(m.dist, qty)); } },
    { label:'Gross Earnings',        key:'gross',     fmt: function(m){ return mpcFmtINR(m.prices[crop] * qty); } },
    { label:'Net Earnings (after transport)', key:'net', fmt: function(m){ return '<span class="mpc-ct-earn">' + mpcFmtINR(m._earnings) + '</span>'; } },
    { label:'Buyer Demand',          key:'demand',    fmt: function(m){
      var d = m.demand[crop] || 'medium';
      var icons = { high:'🔥 High', medium:'🟡 Medium', low:'⬇️ Low' };
      return icons[d] || d;
    }},
    { label:'Daily Arrivals',        key:'arrivals',  fmt: function(m){ return m.arrivals.toLocaleString('en-IN') + ' tonnes'; } },
    { label:'Registered Buyers',     key:'buyers',    fmt: function(m){ return m.buyers + ' buyers'; } },
    { label:'Diff vs Best Value',    key:'diff',      fmt: function(m){
      if (m.id === bestM.id) return '<span class="mpc-ct-badge">⭐ Best Value</span>';
      var diff = m._earnings - bestM._earnings;
      return '<span class="mpc-ct-diff-neg">' + mpcFmtINR(diff) + '</span>';
    }}
  ];

  var headerCols = '<th class="mpc-ct-label">Detail</th>'
    + mandis.map(function(m) {
        return '<th>' + (m.id === bestM.id ? '⭐ ' : '') + m.name + '<br>'
          + '<small style="font-weight:400;opacity:0.8;">' + m.city + '</small></th>';
      }).join('');

  var bodyRows = rows.map(function(row) {
    var isBestRow = row.key === 'net';
    var tdClass = isBestRow ? ' style="font-weight:700;"' : '';
    var tds = mandis.map(function(m) {
      var isWinner = m.id === bestM.id && (row.key === 'net' || row.key === 'diff');
      return '<td' + (isWinner ? ' style="background:var(--ks-mint-light);"' : '') + '>'
        + row.fmt(m) + '</td>';
    }).join('');
    return '<tr class="' + (isBestRow ? 'mpc-ct-best-row' : '') + '">'
      + '<td class="mpc-ct-label"' + tdClass + '>' + row.label + '</td>'
      + tds + '</tr>';
  }).join('');

  table.innerHTML = '<thead><tr>' + headerCols + '</tr></thead><tbody>' + bodyRows + '</tbody>';
};

// ── Chart ────────────────────────────────────────────────────────────────────

MandiCompare.prototype.renderChart = function() {
  var self   = this;
  var canvas = document.getElementById('mpc-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  var crop = self.crop, qty = self.qty;
  var meta = MPC_CROP_META[crop] || { name: crop, emoji: '🌾' };

  // Show top 12 by price for chart clarity
  var list = MPC_DATA.filter(function(m){ return m.prices[crop] > 0; })
    .sort(function(a,b){ return b.prices[crop] - a.prices[crop]; })
    .slice(0, 12);

  var labels = list.map(function(m){ return m.name.replace(' APMC','').replace(' Mandi',''); });

  var chartData, chartLabel, chartColor;
  if (self.chartMode === 'earnings') {
    chartData  = list.map(function(m){ return mpcNetEarnings(m.prices[crop], m.dist, qty); });
    chartLabel = 'Net Earnings (₹) for ' + qty + 'q';
    chartColor = list.map(function(m, i){ return i === 0 ? '#12372A' : 'rgba(91,154,114,0.75)'; });
  } else {
    chartData  = list.map(function(m){ return m.prices[crop]; });
    chartLabel = meta.emoji + ' ' + meta.name + ' Price (₹/q)';
    chartColor = list.map(function(m, i){ return i === 0 ? '#D6A84F' : 'rgba(91,154,114,0.75)'; });
  }

  if (self.chart) { self.chart.destroy(); self.chart = null; }

  self.chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: chartLabel,
        data:  chartData,
        backgroundColor: chartColor,
        borderColor:     chartColor.map(function(c){ return c; }),
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return ' ' + mpcFmtINR(ctx.parsed.y) + (self.chartMode === 'price' ? '/q' : ' net');
            }
          },
          backgroundColor: '#12372A',
          titleColor: '#8FCB9B',
          bodyColor: '#fff',
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#6F7F75',
            font: { size: 11, family: "'Inter', sans-serif" },
            maxRotation: 35,
            minRotation: 20
          }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            color: '#6F7F75',
            font: { size: 11, family: "'Inter', sans-serif" },
            callback: function(v) { return '₹' + (v >= 100000 ? (v/100000).toFixed(1)+'L' : v.toLocaleString('en-IN')); }
          }
        }
      }
    }
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. BOOTSTRAP
// ─────────────────────────────────────────────────────────────────────────────

var mpcEngine = null;

document.addEventListener('DOMContentLoaded', function() {
  mpcEngine = new MandiCompare();
  mpcEngine.init();

  // Read crop from URL param (e.g., mandi-compare.html?crop=onion)
  var params = new URLSearchParams(window.location.search);
  var urlCrop = params.get('crop');
  if (urlCrop && MPC_CROP_META[urlCrop]) {
    mpcEngine.crop = urlCrop;
    var sel = document.getElementById('mpc-crop-select');
    if (sel) sel.value = urlCrop;
    mpcEngine.render();
  }

  // Lucide icons
  if (window.lucide) lucide.createIcons();
});
