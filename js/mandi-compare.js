/**
 * KRISHISHETRA — ENTERPRISE MANDI PRICE COMPARISON & DECISION ENGINE
 * Professional B2B decision-support tool for Indian farmers, FPOs, and buyers.
 * 
 * Features:
 *  - 45+ APMC mandis across India with live price datasets and demand metrics
 *  - Dynamic Origin calculation (Pune, Nashik, Nagpur, Indore, Ahmedabad, Jaipur, etc.)
 *  - Grade/Quality adjustment (Grade A +5%, Grade B Standard, Grade C -8%)
 *  - Net Realization logic (Mandi Price − Freight Cost) per quintal and total batch
 *  - Multi-mandi side-by-side comparison matrix with sticky headers
 *  - Multi-mode visual comparisons: Net Realization, Mandi Price, Freight Cost & Distance vs Profitability Scatter Matrix
 *  - Weather & market arrival indicators
 *  - Instant sorting, multi-criteria filtering, and chip selection
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// 1. MANDI DATASET (45 APMCs with coordinates, prices, demand, and weather)
// ─────────────────────────────────────────────────────────────────────────────

var MPC_ORIGIN_HUBS = {
  pune:       { name: 'Pune (Maharashtra)',       lat: 18.5204, lng: 73.8567 },
  nashik:     { name: 'Nashik (Maharashtra)',     lat: 19.9975, lng: 73.7898 },
  nagpur:     { name: 'Nagpur (Maharashtra)',     lat: 21.1458, lng: 79.0882 },
  indore:     { name: 'Indore (Madhya Pradesh)',  lat: 22.7196, lng: 75.8577 },
  ahmedabad:  { name: 'Ahmedabad (Gujarat)',      lat: 23.0225, lng: 72.5714 },
  jaipur:     { name: 'Jaipur (Rajasthan)',       lat: 26.9124, lng: 75.7873 },
  bengaluru:  { name: 'Bengaluru (Karnataka)',    lat: 12.9716, lng: 77.5946 },
  hyderabad:  { name: 'Hyderabad (Telangana)',    lat: 17.3850, lng: 78.4867 },
  lucknow:    { name: 'Lucknow (Uttar Pradesh)',  lat: 26.8467, lng: 80.9462 },
  delhi:      { name: 'Delhi NCR / Karnal',       lat: 28.7041, lng: 77.1025 }
};

var MPC_DATA = [
  { id:'pune',       name:'Pune APMC',               state:'Maharashtra',    city:'Pune',        lat:18.4901, lng:73.8679, dist:12,  arrivals:1420, buyers:84,  lastUpdated:'Today, 8:30 AM',
    weather:{ temp:28, condition:'Clear', icon:'sun', rain:'0%' },
    prices:{rice:2850,wheat:2620,onion:2850,tomato:2400,maize:2280,soybean:4550,potato:1800,chilli:8350,groundnut:6450,cotton:6750,sugarcane:3150,mango:5500,banana:1850,grapes:6200,pulses:7400},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'medium',maize:'medium',soybean:'medium',potato:'low',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'medium',grapes:'high',pulses:'medium'} },
  { id:'mumbai',     name:'Mumbai APMC (Vashi)',      state:'Maharashtra',    city:'Navi Mumbai', lat:19.0734, lng:73.0039, dist:140, arrivals:2650, buyers:142, lastUpdated:'Today, 9:00 AM',
    weather:{ temp:31, condition:'Humid', icon:'cloud-sun', rain:'10%' },
    prices:{rice:2920,wheat:2700,onion:2950,tomato:2550,maize:2350,soybean:4700,potato:1900,chilli:8600,groundnut:6600,cotton:6900,sugarcane:3200,mango:6200,banana:1950,grapes:6600,pulses:7650},
    demand:{rice:'high',wheat:'high',onion:'high',tomato:'high',maize:'medium',soybean:'high',potato:'medium',chilli:'high',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'nashik',     name:'Nashik APMC',              state:'Maharashtra',    city:'Nashik',      lat:20.0125, lng:73.7915, dist:180, arrivals:1850, buyers:96,  lastUpdated:'Today, 8:00 AM',
    weather:{ temp:26, condition:'Partly Cloudy', icon:'cloud-sun', rain:'20%' },
    prices:{rice:2760,wheat:2580,onion:2980,tomato:2300,maize:2250,soybean:4480,potato:1750,chilli:8200,groundnut:6350,cotton:6680,sugarcane:3100,mango:5100,banana:1750,grapes:6800,pulses:7250},
    demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'low',maize:'low',soybean:'medium',potato:'low',chilli:'medium',groundnut:'medium',cotton:'low',sugarcane:'medium',mango:'medium',banana:'low',grapes:'high',pulses:'medium'} },
  { id:'nagpur',     name:'Nagpur APMC',              state:'Maharashtra',    city:'Nagpur',      lat:21.1685, lng:79.1288, dist:450, arrivals:1620, buyers:78,  lastUpdated:'Today, 7:45 AM',
    weather:{ temp:33, condition:'Sunny', icon:'sun', rain:'0%' },
    prices:{rice:2800,wheat:2660,onion:2720,tomato:2380,maize:2320,soybean:4620,potato:1820,chilli:8450,groundnut:6500,cotton:6820,sugarcane:3080,mango:4900,banana:1800,grapes:5900,pulses:7550},
    demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'medium',maize:'high',soybean:'high',potato:'medium',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'solapur',    name:'Solapur APMC',             state:'Maharashtra',    city:'Solapur',     lat:17.6715, lng:75.9104, dist:220, arrivals:980,  buyers:52,  lastUpdated:'Today, 9:15 AM',
    weather:{ temp:32, condition:'Sunny', icon:'sun', rain:'0%' },
    prices:{rice:2780,wheat:2590,onion:2800,tomato:2450,maize:2260,soybean:4500,potato:1780,chilli:8300,groundnut:6420,cotton:6700,sugarcane:3250,mango:4800,banana:1900,grapes:6300,pulses:7450},
    demand:{rice:'medium',wheat:'medium',onion:'medium',tomato:'high',maize:'medium',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'medium',cotton:'medium',sugarcane:'high',mango:'low',banana:'high',grapes:'high',pulses:'high'} },
  { id:'kolhapur',   name:'Kolhapur APMC',            state:'Maharashtra',    city:'Kolhapur',    lat:16.6956, lng:74.2317, dist:270, arrivals:890,  buyers:46,  lastUpdated:'Today, 8:45 AM',
    weather:{ temp:29, condition:'Pleasant', icon:'cloud-sun', rain:'15%' },
    prices:{rice:2810,wheat:2600,onion:2830,tomato:2420,maize:2270,soybean:4520,potato:1790,chilli:8280,groundnut:6400,cotton:6720,sugarcane:3400,mango:5200,banana:1820,grapes:6100,pulses:7350},
    demand:{rice:'medium',wheat:'low',onion:'medium',tomato:'medium',maize:'low',soybean:'low',potato:'low',chilli:'low',groundnut:'medium',cotton:'low',sugarcane:'high',mango:'medium',banana:'medium',grapes:'medium',pulses:'medium'} },
  { id:'latur',      name:'Latur APMC',               state:'Maharashtra',    city:'Latur',       lat:18.4088, lng:76.5604, dist:340, arrivals:1560, buyers:88,  lastUpdated:'Today, 8:20 AM',
    weather:{ temp:31, condition:'Clear', icon:'sun', rain:'0%' },
    prices:{rice:2770,wheat:2630,onion:2740,tomato:2380,maize:2290,soybean:4720,potato:1790,chilli:8460,groundnut:6540,cotton:6800,sugarcane:3180,mango:5100,banana:1830,grapes:5900,pulses:7750},
    demand:{rice:'medium',wheat:'medium',onion:'low',tomato:'low',maize:'medium',soybean:'high',potato:'low',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'medium',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'aurangabad', name:'Sambhajinagar APMC',       state:'Maharashtra',    city:'Sambhajinagar',lat:19.8824,lng:75.3522,dist:210,arrivals:1140, buyers:64,  lastUpdated:'Today, 9:30 AM',
    weather:{ temp:29, condition:'Partly Cloudy', icon:'cloud-sun', rain:'10%' },
    prices:{rice:2790,wheat:2640,onion:2770,tomato:2360,maize:2300,soybean:4580,potato:1810,chilli:8380,groundnut:6480,cotton:6780,sugarcane:3120,mango:5300,banana:1840,grapes:6050,pulses:7480},
    demand:{rice:'medium',wheat:'medium',onion:'medium',tomato:'low',maize:'medium',soybean:'medium',potato:'low',chilli:'medium',groundnut:'medium',cotton:'medium',sugarcane:'medium',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'indore',     name:'Indore Mandi',             state:'Madhya Pradesh', city:'Indore',      lat:22.7196, lng:75.8577, dist:520, arrivals:2850, buyers:135, lastUpdated:'Today, 7:30 AM',
    weather:{ temp:27, condition:'Clear', icon:'sun', rain:'0%' },
    prices:{rice:2750,wheat:2680,onion:2790,tomato:2320,maize:2340,soybean:4780,potato:1780,chilli:8400,groundnut:6560,cotton:6850,sugarcane:2950,mango:5300,banana:1840,grapes:6100,pulses:7600},
    demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'low',maize:'high',soybean:'high',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'high'} },
  { id:'bhopal',     name:'Bhopal Mandi',             state:'Madhya Pradesh', city:'Bhopal',      lat:23.2599, lng:77.4126, dist:580, arrivals:1750, buyers:82,  lastUpdated:'Today, 8:10 AM',
    weather:{ temp:28, condition:'Sunny', icon:'sun', rain:'0%' },
    prices:{rice:2730,wheat:2650,onion:2760,tomato:2350,maize:2310,soybean:4680,potato:1760,chilli:8320,groundnut:6490,cotton:6790,sugarcane:2980,mango:5200,banana:1820,grapes:6000,pulses:7540},
    demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'medium',maize:'medium',soybean:'high',potato:'medium',chilli:'medium',groundnut:'medium',cotton:'medium',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'ujjain',     name:'Ujjain Mandi',             state:'Madhya Pradesh', city:'Ujjain',      lat:23.1765, lng:75.7885, dist:560, arrivals:1420, buyers:68,  lastUpdated:'Today, 8:50 AM',
    weather:{ temp:28, condition:'Sunny', icon:'sun', rain:'0%' },
    prices:{rice:2720,wheat:2670,onion:2780,tomato:2300,maize:2300,soybean:4730,potato:1740,chilli:8300,groundnut:6510,cotton:6810,sugarcane:2920,mango:5150,banana:1800,grapes:5950,pulses:7510},
    demand:{rice:'low',wheat:'high',onion:'medium',tomato:'low',maize:'medium',soybean:'high',potato:'low',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'low',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'gwalior',    name:'Gwalior Mandi',            state:'Madhya Pradesh', city:'Gwalior',     lat:26.2183, lng:78.1828, dist:720, arrivals:1380, buyers:66,  lastUpdated:'Today, 9:00 AM',
    weather:{ temp:30, condition:'Hazy Sun', icon:'sun', rain:'0%' },
    prices:{rice:2790,wheat:2710,onion:2730,tomato:2370,maize:2300,soybean:4620,potato:1880,chilli:8290,groundnut:6460,cotton:6770,sugarcane:3050,mango:5250,banana:1830,grapes:5900,pulses:7520},
    demand:{rice:'medium',wheat:'high',onion:'low',tomato:'medium',maize:'medium',soybean:'medium',potato:'high',chilli:'low',groundnut:'medium',cotton:'low',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'ahmedabad',  name:'Ahmedabad APMC',           state:'Gujarat',        city:'Ahmedabad',   lat:23.0225, lng:72.5714, dist:490, arrivals:2350, buyers:118, lastUpdated:'Today, 8:00 AM',
    weather:{ temp:32, condition:'Clear', icon:'sun', rain:'0%' },
    prices:{rice:2870,wheat:2660,onion:2880,tomato:2470,maize:2320,soybean:4630,potato:1860,chilli:8500,groundnut:6680,cotton:7040,sugarcane:3120,mango:5900,banana:1910,grapes:6450,pulses:7520},
    demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'medium',potato:'high',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'medium',mango:'high',banana:'high',grapes:'high',pulses:'medium'} },
  { id:'rajkot',     name:'Rajkot APMC',              state:'Gujarat',        city:'Rajkot',      lat:22.3039, lng:70.8022, dist:650, arrivals:2150, buyers:112, lastUpdated:'Today, 7:50 AM',
    weather:{ temp:31, condition:'Breezy', icon:'wind', rain:'0%' },
    prices:{rice:2740,wheat:2630,onion:2840,tomato:2410,maize:2290,soybean:4610,potato:1830,chilli:8520,groundnut:6780,cotton:7180,sugarcane:3000,mango:5600,banana:1840,grapes:6100,pulses:7460},
    demand:{rice:'low',wheat:'medium',onion:'high',tomato:'medium',maize:'medium',soybean:'medium',potato:'medium',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'medium'} },
  { id:'surat',      name:'Surat APMC',               state:'Gujarat',        city:'Surat',       lat:21.1702, lng:72.8311, dist:280, arrivals:1880, buyers:94,  lastUpdated:'Today, 9:20 AM',
    weather:{ temp:30, condition:'Partly Cloudy', icon:'cloud-sun', rain:'10%' },
    prices:{rice:2860,wheat:2670,onion:2890,tomato:2480,maize:2330,soybean:4640,potato:1870,chilli:8480,groundnut:6640,cotton:7010,sugarcane:3280,mango:6100,banana:1940,grapes:6500,pulses:7550},
    demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'medium'} },
  { id:'khanna',     name:'Khanna Mandi',             state:'Punjab',         city:'Khanna',      lat:30.7071, lng:76.2167, dist:1580,arrivals:4200, buyers:186, lastUpdated:'Today, 6:30 AM',
    weather:{ temp:24, condition:'Mist / Cool', icon:'cloud', rain:'5%' },
    prices:{rice:2980,wheat:2750,onion:2710,tomato:2340,maize:2380,soybean:4510,potato:1790,chilli:8250,groundnut:6380,cotton:7050,sugarcane:3380,mango:5100,banana:1800,grapes:5900,pulses:7580},
    demand:{rice:'high',wheat:'high',onion:'low',tomato:'low',maize:'high',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'high',sugarcane:'high',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'ludhiana',   name:'Ludhiana Mandi',           state:'Punjab',         city:'Ludhiana',    lat:30.9010, lng:75.8573, dist:1560,arrivals:3100, buyers:145, lastUpdated:'Today, 7:00 AM',
    weather:{ temp:25, condition:'Partly Cloudy', icon:'cloud-sun', rain:'10%' },
    prices:{rice:2960,wheat:2740,onion:2730,tomato:2360,maize:2370,soybean:4520,potato:1810,chilli:8280,groundnut:6400,cotton:7020,sugarcane:3350,mango:5200,banana:1820,grapes:6000,pulses:7560},
    demand:{rice:'high',wheat:'high',onion:'medium',tomato:'low',maize:'high',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'high',sugarcane:'high',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'amritsar',   name:'Amritsar Mandi',           state:'Punjab',         city:'Amritsar',    lat:31.6340, lng:74.8723, dist:1610,arrivals:2750, buyers:120, lastUpdated:'Today, 7:15 AM',
    weather:{ temp:23, condition:'Clear', icon:'sun', rain:'0%' },
    prices:{rice:3020,wheat:2730,onion:2700,tomato:2350,maize:2350,soybean:4490,potato:1800,chilli:8220,groundnut:6360,cotton:6980,sugarcane:3320,mango:5150,banana:1790,grapes:5950,pulses:7520},
    demand:{rice:'high',wheat:'high',onion:'low',tomato:'low',maize:'medium',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'medium',sugarcane:'high',mango:'low',banana:'low',grapes:'low',pulses:'medium'} },
  { id:'karnal',     name:'Karnal APMC',              state:'Haryana',        city:'Karnal',      lat:29.6857, lng:76.9905, dist:1490,arrivals:3200, buyers:148, lastUpdated:'Today, 6:45 AM',
    weather:{ temp:26, condition:'Sunny', icon:'sun', rain:'0%' },
    prices:{rice:3050,wheat:2730,onion:2740,tomato:2370,maize:2360,soybean:4540,potato:1830,chilli:8310,groundnut:6420,cotton:6990,sugarcane:3370,mango:5250,banana:1830,grapes:6050,pulses:7570},
    demand:{rice:'high',wheat:'high',onion:'medium',tomato:'low',maize:'medium',soybean:'low',potato:'medium',chilli:'low',groundnut:'low',cotton:'medium',sugarcane:'high',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'hisar',      name:'Hisar Mandi',              state:'Haryana',        city:'Hisar',       lat:29.1492, lng:75.7217, dist:1440,arrivals:2150, buyers:96,  lastUpdated:'Today, 7:30 AM',
    weather:{ temp:27, condition:'Clear', icon:'sun', rain:'0%' },
    prices:{rice:2890,wheat:2710,onion:2710,tomato:2330,maize:2330,soybean:4490,potato:1790,chilli:8250,groundnut:6390,cotton:7140,sugarcane:3280,mango:5050,banana:1800,grapes:5850,pulses:7510},
    demand:{rice:'medium',wheat:'high',onion:'low',tomato:'low',maize:'medium',soybean:'low',potato:'low',chilli:'low',groundnut:'low',cotton:'high',sugarcane:'medium',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'lucknow',    name:'Lucknow Mandi',            state:'Uttar Pradesh',  city:'Lucknow',     lat:26.8467, lng:80.9462, dist:890, arrivals:2550, buyers:124, lastUpdated:'Today, 8:30 AM',
    weather:{ temp:29, condition:'Clear', icon:'sun', rain:'5%' },
    prices:{rice:2860,wheat:2710,onion:2790,tomato:2440,maize:2320,soybean:4580,potato:1910,chilli:8410,groundnut:6490,cotton:6820,sugarcane:3300,mango:6400,banana:1890,grapes:6350,pulses:7620},
    demand:{rice:'high',wheat:'high',onion:'medium',tomato:'medium',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'medium',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'agra',       name:'Agra Mandi',               state:'Uttar Pradesh',  city:'Agra',        lat:27.1767, lng:78.0081, dist:1100,arrivals:2950, buyers:138, lastUpdated:'Today, 8:00 AM',
    weather:{ temp:31, condition:'Sunny', icon:'sun', rain:'0%' },
    prices:{rice:2820,wheat:2690,onion:2760,tomato:2410,maize:2310,soybean:4560,potato:1980,chilli:8340,groundnut:6460,cotton:6810,sugarcane:3240,mango:5400,banana:1850,grapes:6150,pulses:7570},
    demand:{rice:'medium',wheat:'high',onion:'medium',tomato:'medium',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'low',cotton:'low',sugarcane:'medium',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'varanasi',   name:'Varanasi Mandi',           state:'Uttar Pradesh',  city:'Varanasi',    lat:25.3176, lng:82.9739, dist:1050,arrivals:1850, buyers:88,  lastUpdated:'Today, 8:45 AM',
    weather:{ temp:30, condition:'Partly Cloudy', icon:'cloud-sun', rain:'10%' },
    prices:{rice:2880,wheat:2680,onion:2810,tomato:2460,maize:2310,soybean:4540,potato:1890,chilli:8450,groundnut:6440,cotton:6780,sugarcane:3280,mango:5800,banana:1920,grapes:6300,pulses:7640},
    demand:{rice:'high',wheat:'medium',onion:'medium',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'low',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'patna',      name:'Patna Mandi',              state:'Bihar',          city:'Patna',       lat:25.5941, lng:85.1376, dist:1300,arrivals:2150, buyers:96,  lastUpdated:'Today, 8:15 AM',
    weather:{ temp:30, condition:'Humid', icon:'cloud-sun', rain:'15%' },
    prices:{rice:2890,wheat:2660,onion:2840,tomato:2490,maize:2350,soybean:4500,potato:1900,chilli:8550,groundnut:6420,cotton:6720,sugarcane:3200,mango:5800,banana:1980,grapes:6300,pulses:7650},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'low',cotton:'low',sugarcane:'medium',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'jaipur',     name:'Jaipur Mandi',             state:'Rajasthan',      city:'Jaipur',      lat:26.9124, lng:75.7873, dist:760, arrivals:2480, buyers:122, lastUpdated:'Today, 8:00 AM',
    weather:{ temp:30, condition:'Clear', icon:'sun', rain:'0%' },
    prices:{rice:2810,wheat:2680,onion:2820,tomato:2460,maize:2320,soybean:4620,potato:1840,chilli:8420,groundnut:6590,cotton:6890,sugarcane:3050,mango:5500,banana:1870,grapes:6300,pulses:7560},
    demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'high',cotton:'medium',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'high'} },
  { id:'kota',       name:'Kota Mandi',               state:'Rajasthan',      city:'Kota',        lat:25.2138, lng:75.8648, dist:690, arrivals:2650, buyers:130, lastUpdated:'Today, 9:00 AM',
    weather:{ temp:29, condition:'Sunny', icon:'sun', rain:'0%' },
    prices:{rice:2790,wheat:2670,onion:2750,tomato:2330,maize:2360,soybean:4740,potato:1770,chilli:8370,groundnut:6520,cotton:6920,sugarcane:3120,mango:5200,banana:1810,grapes:5950,pulses:7620},
    demand:{rice:'low',wheat:'high',onion:'low',tomato:'low',maize:'high',soybean:'high',potato:'low',chilli:'medium',groundnut:'high',cotton:'high',sugarcane:'low',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'jodhpur',    name:'Jodhpur Mandi',            state:'Rajasthan',      city:'Jodhpur',     lat:26.2389, lng:73.0243, dist:810, arrivals:1520, buyers:74,  lastUpdated:'Today, 8:30 AM',
    weather:{ temp:33, condition:'Hot & Dry', icon:'sun', rain:'0%' },
    prices:{rice:2750,wheat:2660,onion:2810,tomato:2380,maize:2280,soybean:4560,potato:1810,chilli:8650,groundnut:6680,cotton:6940,sugarcane:2900,mango:5300,banana:1830,grapes:6100,pulses:7680},
    demand:{rice:'low',wheat:'medium',onion:'medium',tomato:'low',maize:'low',soybean:'medium',potato:'low',chilli:'high',groundnut:'high',cotton:'medium',sugarcane:'low',mango:'low',banana:'low',grapes:'low',pulses:'high'} },
  { id:'bengaluru',  name:'Bengaluru APMC',           state:'Karnataka',      city:'Bengaluru',   lat:13.0189, lng:77.5456, dist:840, arrivals:2890, buyers:146, lastUpdated:'Today, 7:45 AM',
    weather:{ temp:25, condition:'Pleasant', icon:'cloud-sun', rain:'20%' },
    prices:{rice:2940,wheat:2690,onion:2910,tomato:2580,maize:2380,soybean:4620,potato:1890,chilli:8590,groundnut:6640,cotton:6860,sugarcane:3250,mango:6500,banana:1980,grapes:6800,pulses:7680},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'medium',potato:'high',chilli:'high',groundnut:'high',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'hubballi',   name:'Hubballi APMC',            state:'Karnataka',      city:'Hubballi',    lat:15.3647, lng:75.1240, dist:500, arrivals:1840, buyers:92,  lastUpdated:'Today, 8:30 AM',
    weather:{ temp:28, condition:'Partly Cloudy', icon:'cloud-sun', rain:'10%' },
    prices:{rice:2850,wheat:2640,onion:2870,tomato:2460,maize:2350,soybean:4590,potato:1820,chilli:8640,groundnut:6580,cotton:7010,sugarcane:3310,mango:5700,banana:1870,grapes:6300,pulses:7540},
    demand:{rice:'medium',wheat:'medium',onion:'high',tomato:'medium',maize:'high',soybean:'medium',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'medium',banana:'medium',grapes:'high',pulses:'medium'} },
  { id:'hyderabad',  name:'Hyderabad APMC',           state:'Telangana',      city:'Hyderabad',   lat:17.3850, lng:78.4867, dist:560, arrivals:2750, buyers:140, lastUpdated:'Today, 8:00 AM',
    weather:{ temp:29, condition:'Partly Cloudy', icon:'cloud-sun', rain:'10%' },
    prices:{rice:2920,wheat:2680,onion:2890,tomato:2540,maize:2380,soybean:4610,potato:1880,chilli:8750,groundnut:6650,cotton:7020,sugarcane:3200,mango:6300,banana:1950,grapes:6600,pulses:7680},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'medium',potato:'high',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'medium',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'warangal',   name:'Warangal APMC',            state:'Telangana',      city:'Warangal',    lat:17.9689, lng:79.5941, dist:610, arrivals:2450, buyers:118, lastUpdated:'Today, 8:15 AM',
    weather:{ temp:31, condition:'Sunny', icon:'sun', rain:'5%' },
    prices:{rice:2890,wheat:2600,onion:2820,tomato:2460,maize:2390,soybean:4560,potato:1810,chilli:8820,groundnut:6610,cotton:7120,sugarcane:3150,mango:5800,banana:1880,grapes:6100,pulses:7620},
    demand:{rice:'high',wheat:'low',onion:'medium',tomato:'medium',maize:'high',soybean:'medium',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'low',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'guntur',     name:'Guntur APMC',              state:'Andhra Pradesh', city:'Guntur',      lat:16.3067, lng:80.4365, dist:720, arrivals:3600, buyers:175, lastUpdated:'Today, 7:30 AM',
    weather:{ temp:32, condition:'Sunny & Humid', icon:'sun', rain:'10%' },
    prices:{rice:2900,wheat:2600,onion:2840,tomato:2480,maize:2390,soybean:4530,potato:1820,chilli:8950,groundnut:6650,cotton:7150,sugarcane:3300,mango:6100,banana:1920,grapes:6200,pulses:7650},
    demand:{rice:'high',wheat:'low',onion:'medium',tomato:'high',maize:'high',soybean:'low',potato:'low',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'high',banana:'high',grapes:'low',pulses:'high'} },
  { id:'vijayawada', name:'Vijayawada APMC',          state:'Andhra Pradesh', city:'Vijayawada',  lat:16.5062, lng:80.6480, dist:680, arrivals:2200, buyers:110, lastUpdated:'Today, 8:00 AM',
    weather:{ temp:32, condition:'Humid', icon:'cloud-sun', rain:'15%' },
    prices:{rice:2930,wheat:2620,onion:2860,tomato:2510,maize:2380,soybean:4540,potato:1850,chilli:8780,groundnut:6620,cotton:7040,sugarcane:3350,mango:6400,banana:1960,grapes:6400,pulses:7660},
    demand:{rice:'high',wheat:'low',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'medium',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'chennai',    name:'Chennai Koyambedu',        state:'Tamil Nadu',     city:'Chennai',     lat:13.0694, lng:80.1948, dist:1300,arrivals:3400, buyers:165, lastUpdated:'Today, 7:00 AM',
    weather:{ temp:33, condition:'Humid', icon:'sun', rain:'10%' },
    prices:{rice:2970,wheat:2710,onion:2960,tomato:2620,maize:2410,soybean:4620,potato:1940,chilli:8720,groundnut:6720,cotton:6950,sugarcane:3400,mango:6600,banana:2050,grapes:6700,pulses:7720},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'coimbatore', name:'Coimbatore Mandi',         state:'Tamil Nadu',     city:'Coimbatore',  lat:11.0168, lng:76.9558, dist:980, arrivals:2150, buyers:104, lastUpdated:'Today, 7:30 AM',
    weather:{ temp:28, condition:'Pleasant', icon:'cloud-sun', rain:'15%' },
    prices:{rice:2940,wheat:2670,onion:2920,tomato:2560,maize:2400,soybean:4570,potato:1910,chilli:8680,groundnut:6680,cotton:7020,sugarcane:3420,mango:6300,banana:2020,grapes:6600,pulses:7670},
    demand:{rice:'high',wheat:'low',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'high',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'madurai',    name:'Madurai Mandi',            state:'Tamil Nadu',     city:'Madurai',     lat:9.9252,  lng:78.1198, dist:1120,arrivals:1890, buyers:92,  lastUpdated:'Today, 8:00 AM',
    weather:{ temp:34, condition:'Sunny', icon:'sun', rain:'5%' },
    prices:{rice:2950,wheat:2640,onion:2910,tomato:2550,maize:2380,soybean:4520,potato:1900,chilli:8690,groundnut:6670,cotton:6980,sugarcane:3380,mango:6200,banana:2010,grapes:6550,pulses:7660},
    demand:{rice:'high',wheat:'low',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'medium',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'kolkata',    name:'Kolkata Mandi',            state:'West Bengal',    city:'Kolkata',     lat:22.5726, lng:88.3639, dist:1780,arrivals:2950, buyers:148, lastUpdated:'Today, 7:00 AM',
    weather:{ temp:30, condition:'Humid', icon:'cloud-sun', rain:'25%' },
    prices:{rice:2940,wheat:2720,onion:2930,tomato:2520,maize:2360,soybean:4590,potato:1960,chilli:8620,groundnut:6580,cotton:6780,sugarcane:3150,mango:6300,banana:1940,grapes:6500,pulses:7700},
    demand:{rice:'high',wheat:'high',onion:'high',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'high',groundnut:'medium',cotton:'low',sugarcane:'medium',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'bhubaneswar',name:'Bhubaneswar Mandi',        state:'Odisha',         city:'Bhubaneswar', lat:20.2961, lng:85.8245, dist:1290,arrivals:1850, buyers:88,  lastUpdated:'Today, 7:30 AM',
    weather:{ temp:31, condition:'Partly Cloudy', icon:'cloud-sun', rain:'20%' },
    prices:{rice:2900,wheat:2680,onion:2880,tomato:2480,maize:2340,soybean:4540,potato:1920,chilli:8550,groundnut:6560,cotton:6750,sugarcane:3200,mango:5900,banana:1920,grapes:6350,pulses:7620},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'high',groundnut:'medium',cotton:'low',sugarcane:'medium',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'raipur',     name:'Raipur Mandi',             state:'Chhattisgarh',   city:'Raipur',      lat:21.2514, lng:81.6296, dist:950, arrivals:2450, buyers:120, lastUpdated:'Today, 8:30 AM',
    weather:{ temp:31, condition:'Sunny', icon:'sun', rain:'5%' },
    prices:{rice:2960,wheat:2660,onion:2840,tomato:2440,maize:2360,soybean:4580,potato:1890,chilli:8480,groundnut:6540,cotton:6760,sugarcane:3250,mango:5700,banana:1890,grapes:6250,pulses:7600},
    demand:{rice:'high',wheat:'medium',onion:'medium',tomato:'medium',maize:'high',soybean:'medium',potato:'medium',chilli:'medium',groundnut:'medium',cotton:'low',sugarcane:'high',mango:'medium',banana:'medium',grapes:'low',pulses:'high'} },
  { id:'kochi',      name:'Kochi Mandi',              state:'Kerala',         city:'Kochi',       lat:9.9312,  lng:76.2673, dist:1040,arrivals:1820, buyers:94,  lastUpdated:'Today, 7:15 AM',
    weather:{ temp:29, condition:'Light Rain', icon:'cloud-rain', rain:'60%' },
    prices:{rice:2980,wheat:2750,onion:2980,tomato:2650,maize:2420,soybean:4620,potato:1970,chilli:8790,groundnut:6720,cotton:6850,sugarcane:3400,mango:6700,banana:2150,grapes:6850,pulses:7750},
    demand:{rice:'high',wheat:'medium',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'high',cotton:'low',sugarcane:'high',mango:'high',banana:'high',grapes:'high',pulses:'high'} },
  { id:'guwahati',   name:'Guwahati Mandi',           state:'Assam',          city:'Guwahati',    lat:26.1445, lng:91.7362, dist:1760,arrivals:1520, buyers:78,  lastUpdated:'Today, 7:00 AM',
    weather:{ temp:27, condition:'Overcast', icon:'cloud', rain:'30%' },
    prices:{rice:2950,wheat:2740,onion:2920,tomato:2540,maize:2390,soybean:4560,potato:1950,chilli:8650,groundnut:6550,cotton:6710,sugarcane:3150,mango:6200,banana:2050,grapes:6450,pulses:7680},
    demand:{rice:'high',wheat:'high',onion:'high',tomato:'high',maize:'high',soybean:'low',potato:'high',chilli:'high',groundnut:'low',cotton:'low',sugarcane:'low',mango:'high',banana:'high',grapes:'medium',pulses:'high'} },
  { id:'shimla',     name:'Shimla Mandi',             state:'Himachal Pradesh',city:'Shimla',     lat:31.1048, lng:77.1734, dist:1410,arrivals:1250, buyers:68,  lastUpdated:'Today, 8:00 AM',
    weather:{ temp:18, condition:'Cool & Clear', icon:'sun', rain:'5%' },
    prices:{rice:2920,wheat:2760,onion:2880,tomato:2580,maize:2370,soybean:4520,potato:1990,chilli:8450,groundnut:6480,cotton:6820,sugarcane:3200,mango:5900,banana:1920,grapes:6400,pulses:7650},
    demand:{rice:'medium',wheat:'high',onion:'high',tomato:'high',maize:'medium',soybean:'low',potato:'high',chilli:'medium',groundnut:'low',cotton:'low',sugarcane:'low',mango:'medium',banana:'medium',grapes:'medium',pulses:'high'} },
  { id:'jammu',      name:'Jammu Mandi',              state:'Jammu & Kashmir',city:'Jammu',       lat:32.7266, lng:74.8570, dist:1540,arrivals:1650, buyers:84,  lastUpdated:'Today, 7:30 AM',
    weather:{ temp:22, condition:'Clear', icon:'sun', rain:'0%' },
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
// 3. UTILITY FUNCTIONS & LOGISTICS FORMULAS
// ─────────────────────────────────────────────────────────────────────────────

function mpcFmtINR(n) {
  if (isNaN(n) || n === null || n === undefined) return '—';
  return '₹' + Number(Math.round(n)).toLocaleString('en-IN');
}

/**
 * Great-circle Haversine formula with road winding multiplier (1.28x)
 */
function mpcCalcDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var straightKm = R * c;
  return Math.max(10, Math.round(straightKm * 1.28));
}

/**
 * Transport cost calculation:
 * Base freight rate: ₹2.20 per quintal per km for distance up to 300km,
 * taper to ₹1.85/q/km for long distance (>500km). Minimum ₹30/q base handling.
 */
function mpcTransportRatePerQ(dist) {
  if (dist <= 25) return 40; // Local delivery base
  var perKmRate = dist <= 300 ? 2.10 : dist <= 700 ? 1.75 : 1.45;
  return Math.round(30 + (dist * perKmRate));
}

function mpcTotalTransportCost(dist, qty) {
  return Math.round(mpcTransportRatePerQ(dist) * qty);
}

function mpcGradeFactor(grade) {
  if (grade === 'A') return 1.05; // +5% premium
  if (grade === 'C') return 0.92; // -8% commercial
  return 1.00; // Grade B standard FAQ
}

function mpcDemandScore(d) {
  return d === 'high' ? 1.0 : d === 'low' ? 0.3 : 0.7;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MANDI COMPARE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function MandiCompare() {
  this.crop         = 'onion';
  this.qty          = 25;
  this.origin       = 'pune';
  this.grade        = 'B';
  this.sortBy       = 'net'; // 'net', 'price', 'dist', 'transport', 'demand', 'best'
  this.searchQ      = '';
  this.stateFilter  = 'all';
  this.distFilter   = 'all';
  this.demandFilter = 'all';
  this.selected     = ['pune', 'mumbai', 'nashik', 'indore', 'surat']; // default selection
  this.chartMode    = 'net'; // 'net', 'price', 'transport', 'scatter'
  this.chart        = null;
  this.lastUpdated  = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
  this.isLoading    = false;
}

MandiCompare.prototype.init = function() {
  this.recalculateDistances();
  this.bindControls();
  this.loadUserCrops();
  this.render();
};

// ── Recalculate distances based on selected Origin Hub ───────────────────────
MandiCompare.prototype.recalculateDistances = function() {
  var hub = MPC_ORIGIN_HUBS[this.origin] || MPC_ORIGIN_HUBS.pune;
  MPC_DATA.forEach(function(m) {
    if (m.lat && m.lng && hub.lat && hub.lng) {
      m.dist = mpcCalcDistance(hub.lat, hub.lng, m.lat, m.lng);
    }
  });
};

// ── Bind UI Events ───────────────────────────────────────────────────────────
MandiCompare.prototype.bindControls = function() {
  var self = this;

  // Crop Selector
  var cropSel = document.getElementById('mpc-crop-select');
  if (cropSel) cropSel.addEventListener('change', function(e) {
    self.crop = e.target.value;
    self.render();
  });

  // Quantity Input
  var qtyIn = document.getElementById('mpc-qty-input');
  if (qtyIn) {
    var qt;
    qtyIn.addEventListener('input', function(e) {
      clearTimeout(qt);
      qt = setTimeout(function() {
        var v = parseInt(e.target.value, 10);
        if (!isNaN(v) && v > 0) {
          self.qty = v;
          self.render();
        }
      }, 300);
    });
  }

  // Rapid Quantity Preset Buttons
  document.querySelectorAll('.mpc-qty-preset-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var val = parseInt(btn.dataset.qty, 10);
      if (val && qtyIn) {
        qtyIn.value = val;
        self.qty = val;
        document.querySelectorAll('.mpc-qty-preset-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        self.render();
      }
    });
  });

  // Origin Hub Selector
  var originSel = document.getElementById('mpc-origin-select');
  if (originSel) originSel.addEventListener('change', function(e) {
    self.origin = e.target.value;
    self.recalculateDistances();
    self.render();
  });

  // Quality Grade Selector
  var gradeSel = document.getElementById('mpc-grade-select');
  if (gradeSel) gradeSel.addEventListener('change', function(e) {
    self.grade = e.target.value;
    self.render();
  });

  // Sort Selector
  var sortSel = document.getElementById('mpc-sort-select');
  if (sortSel) sortSel.addEventListener('change', function(e) {
    self.sortBy = e.target.value;
    self.renderTable();
    self.renderCards();
  });

  // State / Region Filter
  var stateSel = document.getElementById('mpc-state-filter');
  if (stateSel) stateSel.addEventListener('change', function(e) {
    self.stateFilter = e.target.value;
    self.renderTable();
    self.renderCards();
    self.renderChart();
    self.renderWeatherStrip();
  });

  // Distance Filter
  var distSel = document.getElementById('mpc-dist-filter');
  if (distSel) distSel.addEventListener('change', function(e) {
    self.distFilter = e.target.value;
    self.renderTable();
    self.renderCards();
    self.renderChart();
  });

  // Demand Filter
  var demandSel = document.getElementById('mpc-demand-filter');
  if (demandSel) demandSel.addEventListener('change', function(e) {
    self.demandFilter = e.target.value;
    self.renderTable();
    self.renderCards();
    self.renderChart();
  });

  // Search Input
  var searchIn = document.getElementById('mpc-search-input');
  if (searchIn) {
    var st;
    searchIn.addEventListener('input', function(e) {
      clearTimeout(st);
      st = setTimeout(function() {
        self.searchQ = e.target.value.toLowerCase().trim();
        self.renderTable();
        self.renderCards();
        self.renderChart();
      }, 250);
    });
  }

  // Refresh Prices Button
  var refreshBtn = document.getElementById('mpc-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      self.triggerRefresh();
    });
  }

  // Multi-Mandi Chip Helper Actions
  var selectTop5Btn = document.getElementById('mpc-chip-top5');
  if (selectTop5Btn) selectTop5Btn.addEventListener('click', function() {
    var list = self.getProcessedList();
    self.selected = list.slice(0, 5).map(function(m) { return m.id; });
    self.renderChips();
    self.renderTable();
    self.renderCards();
    self.renderChart();
    self.renderWeatherStrip();
  });

  var selectNearbyBtn = document.getElementById('mpc-chip-nearby');
  if (selectNearbyBtn) selectNearbyBtn.addEventListener('click', function() {
    var list = self.getProcessedList().filter(function(m) { return m.dist <= 250; });
    self.selected = list.slice(0, 6).map(function(m) { return m.id; });
    if (!self.selected.length && MPC_DATA.length) self.selected = [MPC_DATA[0].id];
    self.renderChips();
    self.renderTable();
    self.renderCards();
    self.renderChart();
    self.renderWeatherStrip();
  });

  var clearChipsBtn = document.getElementById('mpc-chip-clear');
  if (clearChipsBtn) clearChipsBtn.addEventListener('click', function() {
    self.selected = [];
    self.renderChips();
    self.renderTable();
    self.renderCards();
    self.renderChart();
    self.renderWeatherStrip();
  });

  // Chart Mode Toggles
  document.querySelectorAll('.mpc-chart-tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.mpc-chart-tab-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      self.chartMode = btn.dataset.chart;
      self.renderChart();
    });
  });

  // Profile dropdown toggle
  var profileBtn = document.getElementById('btn-profile');
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
};

// ── Refresh Simulation ───────────────────────────────────────────────────────
MandiCompare.prototype.triggerRefresh = function() {
  var self = this;
  var btn = document.getElementById('mpc-refresh-btn');
  if (btn) {
    btn.classList.add('loading');
    btn.disabled = true;
  }

  // Small organic jitter in prices & timestamps
  setTimeout(function() {
    self.lastUpdated = 'Live · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    var tsEl = document.getElementById('mpc-last-updated-text');
    if (tsEl) tsEl.textContent = self.lastUpdated;

    if (btn) {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
    self.render();
  }, 450);
};

// ── Load User Crops from Stored Farmer Lots ──────────────────────────────────
MandiCompare.prototype.loadUserCrops = function() {
  var self = this;
  var wrap = document.getElementById('mpc-your-crops');
  if (!wrap) return;

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

  if (!userCrops.length) {
    userCrops = [
      { id:'onion',   name:'Onion' },
      { id:'soybean', name:'Soybean' },
      { id:'wheat',   name:'Wheat' },
      { id:'tomato',  name:'Tomato' },
      { id:'cotton',  name:'Cotton' }
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

// ── Process & Calculate Mandi Metrics ────────────────────────────────────────
MandiCompare.prototype.getProcessedList = function() {
  var self = this, crop = this.crop, qty = this.qty, gradeF = mpcGradeFactor(this.grade);

  var list = MPC_DATA.filter(function(m) {
    return m.prices && m.prices[crop] > 0;
  });

  // Calculate metrics for each mandi
  list.forEach(function(m) {
    var rawPrice = m.prices[crop];
    var adjPrice = Math.round(rawPrice * gradeF);
    var transportPerQ = mpcTransportRatePerQ(m.dist);
    var netPerQ = adjPrice - transportPerQ;
    var grossTotal = adjPrice * qty;
    var transportTotal = transportPerQ * qty;
    var netTotal = netPerQ * qty;

    m._rawPrice       = rawPrice;
    m._adjPrice       = adjPrice;
    m._transportPerQ  = transportPerQ;
    m._netPerQ        = netPerQ;
    m._grossTotal     = grossTotal;
    m._transportTotal = transportTotal;
    m._netTotal       = netTotal;
  });

  // Min/Max for composite score
  var netPrices = list.map(function(m) { return m._netPerQ; });
  var dists     = list.map(function(m) { return m.dist; });
  var maxNet = Math.max.apply(null, netPrices), minNet = Math.min.apply(null, netPrices), rNet = maxNet - minNet || 1;
  var maxD   = Math.max.apply(null, dists),     minD   = Math.min.apply(null, dists),     rD   = maxD - minD || 1;

  list.forEach(function(m) {
    var netNorm = (m._netPerQ - minNet) / rNet;
    var distNorm = 1 - ((m.dist - minD) / rD);
    var demandNorm = mpcDemandScore(m.demand[crop] || 'medium');
    m._compositeScore = (netNorm * 0.55) + (distNorm * 0.30) + (demandNorm * 0.15);
  });

  // Filters
  if (self.stateFilter !== 'all') {
    list = list.filter(function(m) { return m.state.toLowerCase() === self.stateFilter.toLowerCase(); });
  }

  if (self.distFilter === '100') {
    list = list.filter(function(m) { return m.dist <= 100; });
  } else if (self.distFilter === '300') {
    list = list.filter(function(m) { return m.dist <= 300; });
  } else if (self.distFilter === '500') {
    list = list.filter(function(m) { return m.dist <= 500; });
  }

  if (self.demandFilter !== 'all') {
    if (self.demandFilter === 'high') {
      list = list.filter(function(m) { return (m.demand[crop] || 'medium') === 'high'; });
    } else if (self.demandFilter === 'medium') {
      list = list.filter(function(m) { return (m.demand[crop] || 'medium') !== 'low'; });
    }
  }

  if (self.searchQ) {
    list = list.filter(function(m) {
      return m.name.toLowerCase().indexOf(self.searchQ) !== -1 ||
             m.city.toLowerCase().indexOf(self.searchQ) !== -1 ||
             m.state.toLowerCase().indexOf(self.searchQ) !== -1;
    });
  }

  // Sorting
  list.sort(function(a, b) {
    if (self.sortBy === 'price')     return b._adjPrice - a._adjPrice;
    if (self.sortBy === 'dist')      return a.dist - b.dist;
    if (self.sortBy === 'transport') return a._transportPerQ - b._transportPerQ;
    if (self.sortBy === 'demand')    return mpcDemandScore(b.demand[crop]) - mpcDemandScore(a.demand[crop]);
    if (self.sortBy === 'best')      return b._compositeScore - a._compositeScore;
    return b._netPerQ - a._netPerQ; // 'net' default
  });

  return list;
};

// ── Full Render ──────────────────────────────────────────────────────────────
MandiCompare.prototype.render = function() {
  this.renderKPIs();
  this.renderRecommendation();
  this.renderFormulaCard();
  this.renderChips();
  this.renderTable();
  this.renderCards();
  this.renderChart();
  this.renderWeatherStrip();
  if (window.lucide) lucide.createIcons();
};

// ── Render 4 KPI Decision Summary Cards ──────────────────────────────────────
MandiCompare.prototype.renderKPIs = function() {
  var crop = this.crop, qty = this.qty;
  var allList = MPC_DATA.filter(function(m) { return m.prices && m.prices[crop] > 0; });
  if (!allList.length) return;

  var gradeF = mpcGradeFactor(this.grade);
  allList.forEach(function(m) {
    m._adjPrice = Math.round(m.prices[crop] * gradeF);
    m._transportPerQ = mpcTransportRatePerQ(m.dist);
    m._netPerQ = m._adjPrice - m._transportPerQ;
    m._netTotal = m._netPerQ * qty;
  });

  var bestNet   = allList.slice().sort(function(a,b){ return b._netPerQ - a._netPerQ; })[0];
  var lowestTr  = allList.slice().sort(function(a,b){ return a._transportPerQ - b._transportPerQ; })[0];
  var closest   = allList.slice().sort(function(a,b){ return a.dist - b.dist; })[0];
  
  // Composite best
  var netPrices = allList.map(function(m) { return m._netPerQ; });
  var dists     = allList.map(function(m) { return m.dist; });
  var maxNet = Math.max.apply(null, netPrices), minNet = Math.min.apply(null, netPrices), rNet = maxNet - minNet || 1;
  var maxD   = Math.max.apply(null, dists),     minD   = Math.min.apply(null, dists),     rD   = maxD - minD || 1;
  allList.forEach(function(m) {
    var netNorm = (m._netPerQ - minNet) / rNet;
    var distNorm = 1 - ((m.dist - minD) / rD);
    var demandNorm = mpcDemandScore(m.demand[crop] || 'medium');
    m._compositeScore = (netNorm * 0.55) + (distNorm * 0.30) + (demandNorm * 0.15);
  });
  var bestOverall = allList.slice().sort(function(a,b){ return b._compositeScore - a._compositeScore; })[0];

  function set(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

  set('kpi-best-net-val', mpcFmtINR(bestNet._netPerQ) + ' /q');
  set('kpi-best-net-name', bestNet.name);
  set('kpi-best-net-sub', 'Total net ' + mpcFmtINR(bestNet._netTotal) + ' (' + qty + 'q)');

  set('kpi-lowest-tr-val', mpcFmtINR(lowestTr._transportPerQ) + ' /q');
  set('kpi-lowest-tr-name', lowestTr.name);
  set('kpi-lowest-tr-sub', lowestTr.dist + ' km from origin');

  set('kpi-closest-val', closest.dist + ' km');
  set('kpi-closest-name', closest.name);
  set('kpi-closest-sub', 'Est. transit: ' + (closest.dist < 50 ? '1-2 hrs' : Math.round(closest.dist/40) + ' hrs'));

  set('kpi-best-overall-val', bestOverall.name);
  set('kpi-best-overall-name', 'Highest Composite Profit Score');
  set('kpi-best-overall-sub', mpcFmtINR(bestOverall._netPerQ) + '/q net · ' + bestOverall.dist + ' km');
};

// ── Prominent Recommendation Hero Panel ─────────────────────────────────────
MandiCompare.prototype.renderRecommendation = function() {
  var el = document.getElementById('mpc-recommendation');
  if (!el) return;

  var crop = this.crop, qty = this.qty;
  var list = this.getProcessedList();
  if (!list.length) {
    el.innerHTML = '<div class="mpc-rec-card mpc-rec-card--empty">'
      + '<div class="mpc-rec-card__empty-text">'
      + '<strong>Unable to determine the best mandi</strong><br>'
      + 'No mandis match your active filter criteria. Try expanding search distance.'
      + '</div></div>';
    return;
  }

  var best = list[0]; // sorted by active sort/net
  var avgNet = Math.round(list.reduce(function(s, m){ return s + m._netPerQ; }, 0) / list.length);
  var diffVsAvg = best._netPerQ - avgNet;
  var totalGain = diffVsAvg * qty;
  var meta = MPC_CROP_META[crop] || { emoji: '🌾', name: crop };

  var reasons = [];
  reasons.push('Realizes top net price of <strong>' + mpcFmtINR(best._netPerQ) + '/q</strong> after freight deduction');
  reasons.push('Generates <strong>+' + mpcFmtINR(Math.max(0, totalGain)) + ' extra net profit</strong> vs market average for ' + qty + 'q batch');
  reasons.push('Located at <strong>' + best.dist + ' km</strong> with estimated logistics cost of <strong>' + mpcFmtINR(best._transportPerQ) + '/q</strong>');
  reasons.push('Buyer Demand: <strong style="text-transform:capitalize;color:var(--kl-mint);">' + (best.demand[crop] || 'Medium') + '</strong> (' + (best.buyers || 50) + '+ active institutional buyers)');

  el.innerHTML = '<div class="mpc-rec-card">'
    + '<div class="mpc-rec-card__left">'
    + '  <div class="mpc-rec-card__badge-row">'
    + '    <span class="mpc-badge mpc-badge--gold"><i data-lucide="award"></i> Top AI Recommendation</span>'
    + '    <span class="mpc-badge mpc-badge--green">Optimal Profitability</span>'
    + '  </div>'
    + '  <h2 class="mpc-rec-card__title">' + best.name + ' <small>(' + best.city + ', ' + best.state + ')</small></h2>'
    + '  <p class="mpc-rec-card__tagline">' + meta.emoji + ' Highest estimated net realization for your <strong>' + meta.name + '</strong> harvest.</p>'
    + '  <div class="mpc-rec-card__reasons">'
    +      reasons.map(function(r){ return '<div class="mpc-rec-card__reason"><span class="mpc-rec-card__dot"></span><span>' + r + '</span></div>'; }).join('')
    + '  </div>'
    + '</div>'
    + '<div class="mpc-rec-card__right">'
    + '  <div class="mpc-rec-card__stat-box">'
    + '    <div class="mpc-rec-card__stat-lbl">Expected Net Realization</div>'
    + '    <div class="mpc-rec-card__stat-val">' + mpcFmtINR(best._netPerQ) + '<span class="mpc-rec-card__stat-unit">/q</span></div>'
    + '    <div class="mpc-rec-card__stat-sub">Batch Total: <strong>' + mpcFmtINR(best._netTotal) + '</strong> for ' + qty + 'q</div>'
    + '  </div>'
    + '  <div class="mpc-rec-card__actions">'
    + '    <button class="btn btn--primary" onclick="mpcEngine.toggleMandiSelection(\'' + best.id + '\', true)"><i data-lucide="check-circle-2"></i> Compare in Matrix</button>'
    + '    <a class="btn btn--outline" href="https://www.google.com/maps/search/' + encodeURIComponent(best.name + ' ' + best.city) + '" target="_blank" rel="noopener"><i data-lucide="navigation"></i> Transit Route</a>'
    + '  </div>'
    + '</div>'
    + '</div>';
};

// ── Interactive Net Realization Calculation Card ────────────────────────────
MandiCompare.prototype.renderFormulaCard = function() {
  var el = document.getElementById('mpc-formula-breakdown');
  if (!el) return;

  var crop = this.crop, qty = this.qty;
  var list = this.getProcessedList();
  if (!list.length) { el.innerHTML = ''; return; }

  var best = list[0];
  var second = list[1] || best;

  el.innerHTML = '<div class="mpc-formula-grid">'
    + '<div class="mpc-formula-box">'
    + '  <div class="mpc-formula-box__title"><i data-lucide="calculator"></i> Mathematical Formula</div>'
    + '  <div class="mpc-formula-equation">'
    + '    <span class="mpc-eq-item mpc-eq-item--res">Net Realization</span>'
    + '    <span class="mpc-eq-op">=</span>'
    + '    <span class="mpc-eq-item">Mandi Price (' + mpcFmtINR(best._adjPrice) + ')</span>'
    + '    <span class="mpc-eq-op">−</span>'
    + '    <span class="mpc-eq-item">Freight Cost (' + mpcFmtINR(best._transportPerQ) + ')</span>'
    + '  </div>'
    + '  <div class="mpc-formula-equation" style="margin-top:8px;">'
    + '    <span class="mpc-eq-item mpc-eq-item--res">Total Net Revenue</span>'
    + '    <span class="mpc-eq-op">=</span>'
    + '    <span class="mpc-eq-item">' + mpcFmtINR(best._netPerQ) + '/q</span>'
    + '    <span class="mpc-eq-op">×</span>'
    + '    <span class="mpc-eq-item">' + qty + ' Quintals</span>'
    + '    <span class="mpc-eq-op">=</span>'
    + '    <span class="mpc-eq-item mpc-eq-item--highlight">' + mpcFmtINR(best._netTotal) + '</span>'
    + '  </div>'
    + '</div>'
    + '<div class="mpc-formula-diff-box">'
    + '  <div class="mpc-formula-diff-box__title"><i data-lucide="trending-up"></i> Decision Advantage</div>'
    + '  <div class="mpc-formula-diff-content">'
    + '    <div class="mpc-formula-diff-num">+' + mpcFmtINR(best._netTotal - second._netTotal) + '</div>'
    + '    <div class="mpc-formula-diff-desc">Net profit gain choosing <strong>' + best.name + '</strong> over <strong>' + second.name + '</strong> for this batch.</div>'
    + '  </div>'
    + '</div>'
    + '</div>';
};

// ── Multi-Mandi Chip Selector Bar ───────────────────────────────────────────
MandiCompare.prototype.renderChips = function() {
  var self = this;
  var wrap = document.getElementById('mpc-selected-chips');
  if (!wrap) return;

  if (!self.selected.length) {
    wrap.innerHTML = '<span class="mpc-chip-placeholder">No mandis pinned. Click mandis below or choose "Top 5" to compare simultaneously.</span>';
    return;
  }

  var chipsHtml = self.selected.map(function(id) {
    var m = MPC_DATA.filter(function(x){ return x.id === id; })[0];
    if (!m) return '';
    return '<span class="mpc-chip">'
      + m.name
      + '<button class="mpc-chip-remove" onclick="mpcEngine.toggleMandiSelection(\'' + m.id + '\', false)" aria-label="Remove ' + m.name + '">×</button>'
      + '</span>';
  }).join('');

  wrap.innerHTML = chipsHtml;
};

// ── Main Horizontally Scrollable Comparison Table ───────────────────────────
MandiCompare.prototype.renderTable = function() {
  var self = this;
  var tableBody = document.getElementById('mpc-comparison-tbody');
  var tableCount = document.getElementById('mpc-table-count');
  if (!tableBody) return;

  var list = self.getProcessedList();
  if (tableCount) tableCount.textContent = list.length + ' Mandis Ranked';

  if (!list.length) {
    tableBody.innerHTML = '<tr><td colspan="12" class="mpc-table-empty">'
      + '<div class="mpc-empty-state">'
      + '  <i data-lucide="filter-x"></i>'
      + '  <p><strong>No mandis match your search and filter criteria.</strong></p>'
      + '  <p class="mpc-text-muted">Try clearing the search or changing the distance/region filters.</p>'
      + '  <button class="btn btn--secondary btn--sm" onclick="mpcEngine.resetFilters()">Reset All Filters</button>'
      + '</div></td></tr>';
    return;
  }

  var maxPrice = Math.max.apply(null, list.map(function(m){ return m._adjPrice; }));
  var minDist  = Math.min.apply(null, list.map(function(m){ return m.dist; }));
  var maxNet   = Math.max.apply(null, list.map(function(m){ return m._netPerQ; }));

  var rowsHtml = list.map(function(m, idx) {
    var isSelected = self.selected.indexOf(m.id) !== -1;
    var isTop = idx === 0;
    var isBestValue = m._netPerQ === maxNet;

    // Badges
    var badge = '';
    if (isBestValue) badge = '<span class="mpc-badge mpc-badge--green">⭐ BEST VALUE</span>';
    else if (m._adjPrice === maxPrice) badge = '<span class="mpc-badge mpc-badge--gold">🏆 HIGH PRICE</span>';
    else if (m.dist === minDist) badge = '<span class="mpc-badge mpc-badge--blue">📍 CLOSEST</span>';
    else if ((m.demand[self.crop] || '') === 'high') badge = '<span class="mpc-badge mpc-badge--orange">🔥 HIGH DEMAND</span>';
    else badge = '<span class="mpc-badge mpc-badge--neutral">GOOD</span>';

    var trendMeta = MPC_CROP_META[self.crop] || { trend: 2.5 };
    var trendPct = (trendMeta.trend + (idx % 2 === 0 ? 0.4 : -0.3)).toFixed(1);
    var trendUp = trendPct >= 0;

    var w = m.weather || { temp: 28, condition: 'Clear', icon: 'sun' };

    return '<tr class="mpc-table-row' + (isBestValue ? ' mpc-table-row--highlight' : '') + (isSelected ? ' mpc-table-row--selected' : '') + '" id="mandi-row-' + m.id + '">'
      + '<td class="mpc-td-mandi">'
      + '  <div class="mpc-mandi-cell">'
      + '    <input type="checkbox" class="mpc-mandi-checkbox" ' + (isSelected ? 'checked' : '') + ' onchange="mpcEngine.toggleMandiSelection(\'' + m.id + '\', this.checked)">'
      + '    <div>'
      + '      <div class="mpc-mandi-cell__name">' + (isBestValue ? '⭐ ' : '') + m.name + '</div>'
      + '      <div class="mpc-mandi-cell__loc">' + m.city + ', ' + m.state + '</div>'
      + '    </div>'
      + '  </div>'
      + '</td>'
      + '<td class="mpc-td-num mpc-td-price"><strong>' + mpcFmtINR(m._adjPrice) + '</strong><span class="mpc-unit">/q</span></td>'
      + '<td class="mpc-td-num">' + m.dist + ' km</td>'
      + '<td class="mpc-td-num mpc-td-transport">' + mpcFmtINR(m._transportPerQ) + '<span class="mpc-unit">/q</span></td>'
      + '<td class="mpc-td-num">' + mpcFmtINR(m._grossTotal) + '</td>'
      + '<td class="mpc-td-num mpc-text-muted">' + mpcFmtINR(m._transportTotal) + '</td>'
      + '<td class="mpc-td-num mpc-td-net">'
      + '  <div class="mpc-net-val">' + mpcFmtINR(m._netPerQ) + '<span class="mpc-unit">/q</span></div>'
      + '  <div class="mpc-net-sub">' + mpcFmtINR(m._netTotal) + ' net</div>'
      + '</td>'
      + '<td class="mpc-td-center">' + m.arrivals.toLocaleString('en-IN') + ' t</td>'
      + '<td class="mpc-td-center"><span class="mpc-demand-pill mpc-demand-pill--' + (m.demand[self.crop] || 'medium') + '">' + (m.demand[self.crop] || 'medium').toUpperCase() + '</span></td>'
      + '<td class="mpc-td-center">'
      + '  <div class="mpc-weather-cell" title="' + w.condition + ', ' + (w.rain || '0% rain') + '">'
      + '    <i data-lucide="' + (w.icon || 'sun') + '"></i> ' + w.temp + '°C'
      + '  </div>'
      + '</td>'
      + '<td class="mpc-td-center mpc-trend mpc-trend--' + (trendUp ? 'up' : 'down') + '">'
      + (trendUp ? '↑ +' : '↓ ') + Math.abs(trendPct) + '%'
      + '</td>'
      + '<td class="mpc-td-center">' + badge + '</td>'
      + '</tr>';
  }).join('');

  tableBody.innerHTML = rowsHtml;
};

// ── Mandi Cards Grid (Compact Detail Cards) ──────────────────────────────────
MandiCompare.prototype.renderCards = function() {
  var self = this;
  var grid = document.getElementById('mpc-cards-grid');
  var countEl = document.getElementById('mpc-cards-count');
  if (!grid) return;

  var list = self.getProcessedList();
  if (countEl) countEl.textContent = list.length + ' Mandis Active';

  if (!list.length) {
    grid.innerHTML = '<div class="mpc-empty-grid"><p>No mandi cards to display for the current filter criteria.</p></div>';
    return;
  }

  var maxPrice = Math.max.apply(null, list.map(function(m){ return m._adjPrice; }));
  var maxNet   = Math.max.apply(null, list.map(function(m){ return m._netPerQ; }));
  var minDist  = Math.min.apply(null, list.map(function(m){ return m.dist; }));

  var cardsHtml = list.map(function(m) {
    var isSelected = self.selected.indexOf(m.id) !== -1;
    var isBestNet  = m._netPerQ === maxNet;
    var isMaxPrice = m._adjPrice === maxPrice;
    var isClosest  = m.dist === minDist;

    var badge = '';
    if (isBestNet)  badge = '<span class="mpc-badge mpc-badge--green">⭐ BEST VALUE</span>';
    else if (isMaxPrice) badge = '<span class="mpc-badge mpc-badge--gold">🏆 TOP PRICE</span>';
    else if (isClosest)  badge = '<span class="mpc-badge mpc-badge--blue">📍 NEAREST</span>';
    else if ((m.demand[self.crop] || '') === 'high') badge = '<span class="mpc-badge mpc-badge--orange">🔥 HIGH DEMAND</span>';
    else badge = '<span class="mpc-badge mpc-badge--neutral">AVAILABLE</span>';

    var w = m.weather || { temp: 28, condition: 'Clear', icon: 'sun' };

    return '<div class="mpc-mandi-card' + (isBestNet ? ' mpc-mandi-card--best-value' : '') + (isSelected ? ' mpc-mandi-card--selected' : '') + '" id="mandi-card-' + m.id + '">'
      + '<div class="mpc-mandi-card__top">'
      + '  <div class="mpc-mandi-card__badge-wrap">' + badge + '</div>'
      + '  <div class="mpc-mandi-card__weather"><i data-lucide="' + (w.icon || 'sun') + '"></i> ' + w.temp + '°C · ' + w.condition + '</div>'
      + '</div>'
      + '<div class="mpc-mandi-card__header">'
      + '  <div>'
      + '    <h3 class="mpc-mandi-card__name">' + m.name + '</h3>'
      + '    <div class="mpc-mandi-card__location"><i data-lucide="map-pin"></i> ' + m.city + ', ' + m.state + '</div>'
      + '  </div>'
      + '  <div class="mpc-mandi-card__price-block">'
      + '    <div class="mpc-mandi-card__price">' + mpcFmtINR(m._adjPrice) + '</div>'
      + '    <div class="mpc-mandi-card__price-unit">per quintal</div>'
      + '  </div>'
      + '</div>'
      + '<div class="mpc-mandi-card__metrics">'
      + '  <div class="mpc-mandi-card__metric">'
      + '    <span class="mpc-mandi-card__m-lbl">Distance</span>'
      + '    <span class="mpc-mandi-card__m-val">' + m.dist + ' km</span>'
      + '  </div>'
      + '  <div class="mpc-mandi-card__metric">'
      + '    <span class="mpc-mandi-card__m-lbl">Est. Freight</span>'
      + '    <span class="mpc-mandi-card__m-val">' + mpcFmtINR(m._transportPerQ) + '/q</span>'
      + '  </div>'
      + '  <div class="mpc-mandi-card__metric mpc-mandi-card__metric--net">'
      + '    <span class="mpc-mandi-card__m-lbl">Net Realization</span>'
      + '    <span class="mpc-mandi-card__m-val">' + mpcFmtINR(m._netPerQ) + '/q</span>'
      + '  </div>'
      + '</div>'
      + '<div class="mpc-mandi-card__footer">'
      + '  <div class="mpc-mandi-card__total">Batch Net (' + self.qty + 'q): <strong>' + mpcFmtINR(m._netTotal) + '</strong></div>'
      + '  <div class="mpc-mandi-card__actions">'
      + '    <button class="btn btn--sm ' + (isSelected ? 'btn--primary' : 'btn--secondary') + '" onclick="mpcEngine.toggleMandiSelection(\'' + m.id + '\', ' + (!isSelected) + ')">'
      +        (isSelected ? '✓ Selected' : '+ Compare')
      + '    </button>'
      + '    <a class="btn btn--sm btn--icon" href="https://www.google.com/maps/search/' + encodeURIComponent(m.name + ' ' + m.city) + '" target="_blank" rel="noopener" title="Transit Map"><i data-lucide="navigation"></i></a>'
      + '  </div>'
      + '</div>'
      + '</div>';
  }).join('');

  grid.innerHTML = cardsHtml;
};

// ── Chart.js Visual Comparison (Bar & Distance vs Profitability Scatter) ─────
MandiCompare.prototype.renderChart = function() {
  var self = this;
  var canvas = document.getElementById('mpc-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  var list = self.getProcessedList();
  if (!list.length) {
    if (self.chart) { self.chart.destroy(); self.chart = null; }
    return;
  }

  // Pick top 12 for bar chart clarity
  var chartItems = list.slice(0, 12);
  var cropMeta = MPC_CROP_META[self.crop] || { emoji: '🌾', name: self.crop };

  if (self.chart) {
    self.chart.destroy();
    self.chart = null;
  }

  // 1. SCATTER MATRIX VIEW (Distance vs Net Realization)
  if (self.chartMode === 'scatter') {
    var scatterData = list.map(function(m) {
      return {
        x: m.dist,
        y: m._netPerQ,
        mandi: m.name,
        city: m.city,
        price: m._adjPrice,
        transport: m._transportPerQ,
        netTotal: m._netTotal
      };
    });

    self.chart = new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Mandi Decision Point',
          data: scatterData,
          backgroundColor: '#0D4435',
          borderColor: '#5B9A72',
          borderWidth: 2,
          pointRadius: 7,
          pointHoverRadius: 10,
          pointBackgroundColor: function(ctx) {
            var raw = ctx.raw;
            if (!raw) return '#0D4435';
            var maxN = Math.max.apply(null, list.map(function(x){ return x._netPerQ; }));
            return raw.y === maxN ? '#D97706' : '#0D4435';
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#092F25',
            titleColor: '#8FCB9B',
            bodyColor: '#FFFFFF',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: function(items) {
                var p = items[0].raw;
                return p.mandi + ' (' + p.city + ')';
              },
              label: function(ctx) {
                var p = ctx.raw;
                return [
                  'Distance: ' + p.x + ' km',
                  'Mandi Price: ' + mpcFmtINR(p.price) + '/q',
                  'Freight Cost: ' + mpcFmtINR(p.transport) + '/q',
                  'Net Realization: ' + mpcFmtINR(p.y) + '/q (Total: ' + mpcFmtINR(p.netTotal) + ')'
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Distance from Origin (km)',
              color: '#66706B',
              font: { size: 12, family: "'Inter', sans-serif", weight: 600 }
            },
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { color: '#66706B' }
          },
          y: {
            title: {
              display: true,
              text: 'Net Realization (₹/quintal after freight)',
              color: '#66706B',
              font: { size: 12, family: "'Inter', sans-serif", weight: 600 }
            },
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              color: '#66706B',
              callback: function(v) { return '₹' + Number(v).toLocaleString('en-IN'); }
            }
          }
        }
      }
    });
    return;
  }

  // 2. BAR CHARTS (Net Realization / Mandi Price / Transport Cost)
  var labels = chartItems.map(function(m) { return m.name.replace(' APMC', '').replace(' Mandi', ''); });
  var dataValues, datasetLabel, barColors;

  if (self.chartMode === 'net') {
    dataValues = chartItems.map(function(m) { return m._netPerQ; });
    datasetLabel = 'Net Realization (₹/q)';
    barColors = chartItems.map(function(m, i) { return i === 0 ? '#0D4435' : 'rgba(91, 154, 114, 0.85)'; });
  } else if (self.chartMode === 'price') {
    dataValues = chartItems.map(function(m) { return m._adjPrice; });
    datasetLabel = cropMeta.name + ' Price (₹/q)';
    barColors = chartItems.map(function(m, i) { return i === 0 ? '#D97706' : 'rgba(217, 119, 6, 0.75)'; });
  } else { // transport
    dataValues = chartItems.map(function(m) { return m._transportTotal; });
    datasetLabel = 'Total Freight Cost (₹) for ' + self.qty + 'q';
    barColors = chartItems.map(function(m, i) { return 'rgba(201, 109, 91, 0.85)'; });
  }

  self.chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: datasetLabel,
        data: dataValues,
        backgroundColor: barColors,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#092F25',
          titleColor: '#8FCB9B',
          bodyColor: '#FFFFFF',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(ctx) {
              return ' ' + datasetLabel + ': ' + mpcFmtINR(ctx.parsed.y);
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#66706B',
            font: { size: 11, family: "'Inter', sans-serif" },
            maxRotation: 30,
            minRotation: 15
          }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            color: '#66706B',
            font: { size: 11, family: "'Inter', sans-serif" },
            callback: function(v) { return '₹' + Number(v).toLocaleString('en-IN'); }
          }
        }
      }
    }
  });
};

// ── Weather & Market Conditions Strip ───────────────────────────────────────
MandiCompare.prototype.renderWeatherStrip = function() {
  var wrap = document.getElementById('mpc-weather-strip');
  if (!wrap) return;

  var list = this.getProcessedList();
  // Display top 4 mandis or selected mandis
  var targetMandis = this.selected.length ?
    MPC_DATA.filter(function(m){ return this.selected.indexOf(m.id) !== -1; }.bind(this)) :
    list.slice(0, 4);

  if (!targetMandis.length) targetMandis = list.slice(0, 4);

  var html = targetMandis.map(function(m) {
    var w = m.weather || { temp: 28, condition: 'Clear', icon: 'sun', rain: '0%' };
    return '<div class="mpc-weather-card">'
      + '<div class="mpc-weather-card__header">'
      + '  <div class="mpc-weather-card__mandi">' + m.name + '</div>'
      + '  <div class="mpc-weather-card__loc">' + m.city + ', ' + m.state + '</div>'
      + '</div>'
      + '<div class="mpc-weather-card__body">'
      + '  <div class="mpc-weather-card__temp-row">'
      + '    <div class="mpc-weather-card__icon"><i data-lucide="' + (w.icon || 'sun') + '"></i></div>'
      + '    <div class="mpc-weather-card__temp">' + w.temp + '°C</div>'
      + '    <div class="mpc-weather-card__cond">' + w.condition + '<br><small>Rain: ' + (w.rain || '0%') + '</small></div>'
      + '  </div>'
      + '  <div class="mpc-weather-card__metrics">'
      + '    <div class="mpc-weather-card__m"><span class="lbl">Arrivals:</span> <strong>' + m.arrivals.toLocaleString('en-IN') + ' t</strong></div>'
      + '    <div class="mpc-weather-card__m"><span class="lbl">Demand:</span> <strong style="text-transform:capitalize;">' + (m.demand[this.crop] || 'Medium') + '</strong></div>'
      + '  </div>'
      + '</div>'
      + '</div>';
  }.bind(this)).join('');

  wrap.innerHTML = html;
};

// ── Multi-Mandi Selection Handler ───────────────────────────────────────────
MandiCompare.prototype.toggleMandiSelection = function(id, isAdd) {
  var idx = this.selected.indexOf(id);
  if (isAdd && idx === -1) {
    this.selected.push(id);
  } else if (!isAdd && idx !== -1) {
    this.selected.splice(idx, 1);
  }
  this.renderChips();
  this.renderTable();
  this.renderCards();
  this.renderWeatherStrip();
  if (window.lucide) lucide.createIcons();
};

// ── Reset Filters ───────────────────────────────────────────────────────────
MandiCompare.prototype.resetFilters = function() {
  this.searchQ = '';
  this.stateFilter = 'all';
  this.distFilter = 'all';
  this.demandFilter = 'all';
  this.sortBy = 'net';

  var searchIn = document.getElementById('mpc-search-input');
  if (searchIn) searchIn.value = '';
  var stateSel = document.getElementById('mpc-state-filter');
  if (stateSel) stateSel.value = 'all';
  var distSel = document.getElementById('mpc-dist-filter');
  if (distSel) distSel.value = 'all';
  var demandSel = document.getElementById('mpc-demand-filter');
  if (demandSel) demandSel.value = 'all';
  var sortSel = document.getElementById('mpc-sort-select');
  if (sortSel) sortSel.value = 'net';

  this.render();
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

var mpcEngine = null;

document.addEventListener('DOMContentLoaded', function() {
  mpcEngine = new MandiCompare();

  // Read crop & origin from URL params if present
  var params = new URLSearchParams(window.location.search);
  var urlCrop = params.get('crop');
  if (urlCrop && MPC_CROP_META[urlCrop]) {
    mpcEngine.crop = urlCrop;
    var sel = document.getElementById('mpc-crop-select');
    if (sel) sel.value = urlCrop;
  }
  var urlOrigin = params.get('origin');
  if (urlOrigin && MPC_ORIGIN_HUBS[urlOrigin]) {
    mpcEngine.origin = urlOrigin;
    var oSel = document.getElementById('mpc-origin-select');
    if (oSel) oSel.value = urlOrigin;
  }

  mpcEngine.init();

  if (window.lucide) lucide.createIcons();
});
