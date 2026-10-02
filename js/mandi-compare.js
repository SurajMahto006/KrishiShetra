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
  pune: { name: 'Pune (Maharashtra)', lat: 18.5204, lng: 73.8567 },
  nashik: { name: 'Nashik (Maharashtra)', lat: 19.9975, lng: 73.7898 },
  nagpur: { name: 'Nagpur (Maharashtra)', lat: 21.1458, lng: 79.0882 },
  indore: { name: 'Indore (Madhya Pradesh)', lat: 22.7196, lng: 75.8577 },
  ahmedabad: { name: 'Ahmedabad (Gujarat)', lat: 23.0225, lng: 72.5714 },
  jaipur: { name: 'Jaipur (Rajasthan)', lat: 26.9124, lng: 75.7873 },
  bengaluru: { name: 'Bengaluru (Karnataka)', lat: 12.9716, lng: 77.5946 },
  hyderabad: { name: 'Hyderabad (Telangana)', lat: 17.3850, lng: 78.4867 },
  lucknow: { name: 'Lucknow (Uttar Pradesh)', lat: 26.8467, lng: 80.9462 },
  delhi: { name: 'Delhi NCR / Karnal', lat: 28.7041, lng: 77.1025 }
};

var MPC_DATA = [
  {
    id: 'pune', name: 'Pune APMC', state: 'Maharashtra', city: 'Pune', lat: 18.4901, lng: 73.8679, dist: 12, arrivals: 1420, buyers: 84, lastUpdated: 'Today, 8:30 AM',
    weather: { temp: 28, condition: 'Clear', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'high', wheat: 'medium', onion: 'high', tomato: 'medium', maize: 'medium', soybean: 'medium', potato: 'low', chilli: 'medium', groundnut: 'high', cotton: 'medium', sugarcane: 'high', mango: 'high', banana: 'medium', grapes: 'high', pulses: 'medium' }
  },
  {
    id: 'mumbai', name: 'Mumbai APMC (Vashi)', state: 'Maharashtra', city: 'Navi Mumbai', lat: 19.0734, lng: 73.0039, dist: 140, arrivals: 2650, buyers: 142, lastUpdated: 'Today, 9:00 AM',
    weather: { temp: 31, condition: 'Humid', icon: 'cloud-sun', rain: '10%' },
    prices: {},
    demand: { rice: 'high', wheat: 'high', onion: 'high', tomato: 'high', maize: 'medium', soybean: 'high', potato: 'medium', chilli: 'high', groundnut: 'high', cotton: 'medium', sugarcane: 'high', mango: 'high', banana: 'high', grapes: 'high', pulses: 'high' }
  },
  {
    id: 'nashik', name: 'Nashik APMC', state: 'Maharashtra', city: 'Nashik', lat: 20.0125, lng: 73.7915, dist: 180, arrivals: 1850, buyers: 96, lastUpdated: 'Today, 8:00 AM',
    weather: { temp: 26, condition: 'Partly Cloudy', icon: 'cloud-sun', rain: '20%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'medium', onion: 'high', tomato: 'low', maize: 'low', soybean: 'medium', potato: 'low', chilli: 'medium', groundnut: 'medium', cotton: 'low', sugarcane: 'medium', mango: 'medium', banana: 'low', grapes: 'high', pulses: 'medium' }
  },
  {
    id: 'nagpur', name: 'Nagpur APMC', state: 'Maharashtra', city: 'Nagpur', lat: 21.1685, lng: 79.1288, dist: 450, arrivals: 1620, buyers: 78, lastUpdated: 'Today, 7:45 AM',
    weather: { temp: 33, condition: 'Sunny', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'high', onion: 'medium', tomato: 'medium', maize: 'high', soybean: 'high', potato: 'medium', chilli: 'high', groundnut: 'high', cotton: 'high', sugarcane: 'low', mango: 'medium', banana: 'medium', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'solapur', name: 'Solapur APMC', state: 'Maharashtra', city: 'Solapur', lat: 17.6715, lng: 75.9104, dist: 220, arrivals: 980, buyers: 52, lastUpdated: 'Today, 9:15 AM',
    weather: { temp: 32, condition: 'Sunny', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'medium', onion: 'medium', tomato: 'high', maize: 'medium', soybean: 'medium', potato: 'medium', chilli: 'medium', groundnut: 'medium', cotton: 'medium', sugarcane: 'high', mango: 'low', banana: 'high', grapes: 'high', pulses: 'high' }
  },
  {
    id: 'kolhapur', name: 'Kolhapur APMC', state: 'Maharashtra', city: 'Kolhapur', lat: 16.6956, lng: 74.2317, dist: 270, arrivals: 890, buyers: 46, lastUpdated: 'Today, 8:45 AM',
    weather: { temp: 29, condition: 'Pleasant', icon: 'cloud-sun', rain: '15%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'low', onion: 'medium', tomato: 'medium', maize: 'low', soybean: 'low', potato: 'low', chilli: 'low', groundnut: 'medium', cotton: 'low', sugarcane: 'high', mango: 'medium', banana: 'medium', grapes: 'medium', pulses: 'medium' }
  },
  {
    id: 'latur', name: 'Latur APMC', state: 'Maharashtra', city: 'Latur', lat: 18.4088, lng: 76.5604, dist: 340, arrivals: 1560, buyers: 88, lastUpdated: 'Today, 8:20 AM',
    weather: { temp: 31, condition: 'Clear', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'medium', onion: 'low', tomato: 'low', maize: 'medium', soybean: 'high', potato: 'low', chilli: 'medium', groundnut: 'high', cotton: 'medium', sugarcane: 'medium', mango: 'low', banana: 'low', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'aurangabad', name: 'Sambhajinagar APMC', state: 'Maharashtra', city: 'Sambhajinagar', lat: 19.8824, lng: 75.3522, dist: 210, arrivals: 1140, buyers: 64, lastUpdated: 'Today, 9:30 AM',
    weather: { temp: 29, condition: 'Partly Cloudy', icon: 'cloud-sun', rain: '10%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'medium', onion: 'medium', tomato: 'low', maize: 'medium', soybean: 'medium', potato: 'low', chilli: 'medium', groundnut: 'medium', cotton: 'medium', sugarcane: 'medium', mango: 'medium', banana: 'medium', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'indore', name: 'Indore Mandi', state: 'Madhya Pradesh', city: 'Indore', lat: 22.7196, lng: 75.8577, dist: 520, arrivals: 2850, buyers: 135, lastUpdated: 'Today, 7:30 AM',
    weather: { temp: 27, condition: 'Clear', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'high', onion: 'medium', tomato: 'low', maize: 'high', soybean: 'high', potato: 'low', chilli: 'high', groundnut: 'high', cotton: 'high', sugarcane: 'low', mango: 'medium', banana: 'medium', grapes: 'medium', pulses: 'high' }
  },
  {
    id: 'bhopal', name: 'Bhopal Mandi', state: 'Madhya Pradesh', city: 'Bhopal', lat: 23.2599, lng: 77.4126, dist: 580, arrivals: 1750, buyers: 82, lastUpdated: 'Today, 8:10 AM',
    weather: { temp: 28, condition: 'Sunny', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'high', onion: 'medium', tomato: 'medium', maize: 'medium', soybean: 'high', potato: 'medium', chilli: 'medium', groundnut: 'medium', cotton: 'medium', sugarcane: 'low', mango: 'medium', banana: 'medium', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'ujjain', name: 'Ujjain Mandi', state: 'Madhya Pradesh', city: 'Ujjain', lat: 23.1765, lng: 75.7885, dist: 560, arrivals: 1420, buyers: 68, lastUpdated: 'Today, 8:50 AM',
    weather: { temp: 28, condition: 'Sunny', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'low', wheat: 'high', onion: 'medium', tomato: 'low', maize: 'medium', soybean: 'high', potato: 'low', chilli: 'medium', groundnut: 'high', cotton: 'medium', sugarcane: 'low', mango: 'low', banana: 'low', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'gwalior', name: 'Gwalior Mandi', state: 'Madhya Pradesh', city: 'Gwalior', lat: 26.2183, lng: 78.1828, dist: 720, arrivals: 1380, buyers: 66, lastUpdated: 'Today, 9:00 AM',
    weather: { temp: 30, condition: 'Hazy Sun', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'high', onion: 'low', tomato: 'medium', maize: 'medium', soybean: 'medium', potato: 'high', chilli: 'low', groundnut: 'medium', cotton: 'low', sugarcane: 'low', mango: 'medium', banana: 'medium', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'ahmedabad', name: 'Ahmedabad APMC', state: 'Gujarat', city: 'Ahmedabad', lat: 23.0225, lng: 72.5714, dist: 490, arrivals: 2350, buyers: 118, lastUpdated: 'Today, 8:00 AM',
    weather: { temp: 32, condition: 'Clear', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'medium', onion: 'high', tomato: 'high', maize: 'medium', soybean: 'medium', potato: 'high', chilli: 'high', groundnut: 'high', cotton: 'high', sugarcane: 'medium', mango: 'high', banana: 'high', grapes: 'high', pulses: 'medium' }
  },
  {
    id: 'rajkot', name: 'Rajkot APMC', state: 'Gujarat', city: 'Rajkot', lat: 22.3039, lng: 70.8022, dist: 650, arrivals: 2150, buyers: 112, lastUpdated: 'Today, 7:50 AM',
    weather: { temp: 31, condition: 'Breezy', icon: 'wind', rain: '0%' },
    prices: {},
    demand: { rice: 'low', wheat: 'medium', onion: 'high', tomato: 'medium', maize: 'medium', soybean: 'medium', potato: 'medium', chilli: 'high', groundnut: 'high', cotton: 'high', sugarcane: 'low', mango: 'medium', banana: 'medium', grapes: 'medium', pulses: 'medium' }
  },
  {
    id: 'surat', name: 'Surat APMC', state: 'Gujarat', city: 'Surat', lat: 21.1702, lng: 72.8311, dist: 280, arrivals: 1880, buyers: 94, lastUpdated: 'Today, 9:20 AM',
    weather: { temp: 30, condition: 'Partly Cloudy', icon: 'cloud-sun', rain: '10%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'medium', onion: 'high', tomato: 'high', maize: 'medium', soybean: 'medium', potato: 'medium', chilli: 'medium', groundnut: 'high', cotton: 'medium', sugarcane: 'high', mango: 'high', banana: 'high', grapes: 'high', pulses: 'medium' }
  },
  {
    id: 'khanna', name: 'Khanna Mandi', state: 'Punjab', city: 'Khanna', lat: 30.7071, lng: 76.2167, dist: 1580, arrivals: 4200, buyers: 186, lastUpdated: 'Today, 6:30 AM',
    weather: { temp: 24, condition: 'Mist / Cool', icon: 'cloud', rain: '5%' },
    prices: {},
    demand: { rice: 'high', wheat: 'high', onion: 'low', tomato: 'low', maize: 'high', soybean: 'low', potato: 'medium', chilli: 'low', groundnut: 'low', cotton: 'high', sugarcane: 'high', mango: 'low', banana: 'low', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'ludhiana', name: 'Ludhiana Mandi', state: 'Punjab', city: 'Ludhiana', lat: 30.9010, lng: 75.8573, dist: 1560, arrivals: 3100, buyers: 145, lastUpdated: 'Today, 7:00 AM',
    weather: { temp: 25, condition: 'Partly Cloudy', icon: 'cloud-sun', rain: '10%' },
    prices: {},
    demand: { rice: 'high', wheat: 'high', onion: 'medium', tomato: 'low', maize: 'high', soybean: 'low', potato: 'medium', chilli: 'low', groundnut: 'low', cotton: 'high', sugarcane: 'high', mango: 'medium', banana: 'medium', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'amritsar', name: 'Amritsar Mandi', state: 'Punjab', city: 'Amritsar', lat: 31.6340, lng: 74.8723, dist: 1610, arrivals: 2750, buyers: 120, lastUpdated: 'Today, 7:15 AM',
    weather: { temp: 23, condition: 'Clear', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'high', wheat: 'high', onion: 'low', tomato: 'low', maize: 'medium', soybean: 'low', potato: 'medium', chilli: 'low', groundnut: 'low', cotton: 'medium', sugarcane: 'high', mango: 'low', banana: 'low', grapes: 'low', pulses: 'medium' }
  },
  {
    id: 'karnal', name: 'Karnal APMC', state: 'Haryana', city: 'Karnal', lat: 29.6857, lng: 76.9905, dist: 1490, arrivals: 3200, buyers: 148, lastUpdated: 'Today, 6:45 AM',
    weather: { temp: 26, condition: 'Sunny', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'high', wheat: 'high', onion: 'medium', tomato: 'low', maize: 'medium', soybean: 'low', potato: 'medium', chilli: 'low', groundnut: 'low', cotton: 'medium', sugarcane: 'high', mango: 'medium', banana: 'medium', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'hisar', name: 'Hisar Mandi', state: 'Haryana', city: 'Hisar', lat: 29.1492, lng: 75.7217, dist: 1440, arrivals: 2150, buyers: 96, lastUpdated: 'Today, 7:30 AM',
    weather: { temp: 27, condition: 'Clear', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'high', onion: 'low', tomato: 'low', maize: 'medium', soybean: 'low', potato: 'low', chilli: 'low', groundnut: 'low', cotton: 'high', sugarcane: 'medium', mango: 'low', banana: 'low', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'lucknow', name: 'Lucknow Mandi', state: 'Uttar Pradesh', city: 'Lucknow', lat: 26.8467, lng: 80.9462, dist: 890, arrivals: 2550, buyers: 124, lastUpdated: 'Today, 8:30 AM',
    weather: { temp: 29, condition: 'Clear', icon: 'sun', rain: '5%' },
    prices: {},
    demand: { rice: 'high', wheat: 'high', onion: 'medium', tomato: 'medium', maize: 'medium', soybean: 'low', potato: 'high', chilli: 'medium', groundnut: 'medium', cotton: 'low', sugarcane: 'high', mango: 'high', banana: 'high', grapes: 'medium', pulses: 'high' }
  },
  {
    id: 'agra', name: 'Agra Mandi', state: 'Uttar Pradesh', city: 'Agra', lat: 27.1767, lng: 78.0081, dist: 1100, arrivals: 2950, buyers: 138, lastUpdated: 'Today, 8:00 AM',
    weather: { temp: 31, condition: 'Sunny', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'high', onion: 'medium', tomato: 'medium', maize: 'medium', soybean: 'low', potato: 'high', chilli: 'medium', groundnut: 'low', cotton: 'low', sugarcane: 'medium', mango: 'medium', banana: 'medium', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'varanasi', name: 'Varanasi Mandi', state: 'Uttar Pradesh', city: 'Varanasi', lat: 25.3176, lng: 82.9739, dist: 1050, arrivals: 1850, buyers: 88, lastUpdated: 'Today, 8:45 AM',
    weather: { temp: 30, condition: 'Partly Cloudy', icon: 'cloud-sun', rain: '10%' },
    prices: {},
    demand: { rice: 'high', wheat: 'medium', onion: 'medium', tomato: 'high', maize: 'medium', soybean: 'low', potato: 'high', chilli: 'medium', groundnut: 'low', cotton: 'low', sugarcane: 'high', mango: 'high', banana: 'high', grapes: 'medium', pulses: 'high' }
  },
  {
    id: 'patna', name: 'Patna Mandi', state: 'Bihar', city: 'Patna', lat: 25.5941, lng: 85.1376, dist: 1300, arrivals: 2150, buyers: 96, lastUpdated: 'Today, 8:15 AM',
    weather: { temp: 30, condition: 'Humid', icon: 'cloud-sun', rain: '15%' },
    prices: {},
    demand: { rice: 'high', wheat: 'medium', onion: 'high', tomato: 'high', maize: 'high', soybean: 'low', potato: 'high', chilli: 'high', groundnut: 'low', cotton: 'low', sugarcane: 'medium', mango: 'high', banana: 'high', grapes: 'medium', pulses: 'high' }
  },
  {
    id: 'jaipur', name: 'Jaipur Mandi', state: 'Rajasthan', city: 'Jaipur', lat: 26.9124, lng: 75.7873, dist: 760, arrivals: 2480, buyers: 122, lastUpdated: 'Today, 8:00 AM',
    weather: { temp: 30, condition: 'Clear', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'medium', onion: 'high', tomato: 'high', maize: 'medium', soybean: 'medium', potato: 'medium', chilli: 'medium', groundnut: 'high', cotton: 'medium', sugarcane: 'low', mango: 'medium', banana: 'medium', grapes: 'medium', pulses: 'high' }
  },
  {
    id: 'kota', name: 'Kota Mandi', state: 'Rajasthan', city: 'Kota', lat: 25.2138, lng: 75.8648, dist: 690, arrivals: 2650, buyers: 130, lastUpdated: 'Today, 9:00 AM',
    weather: { temp: 29, condition: 'Sunny', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'low', wheat: 'high', onion: 'low', tomato: 'low', maize: 'high', soybean: 'high', potato: 'low', chilli: 'medium', groundnut: 'high', cotton: 'high', sugarcane: 'low', mango: 'low', banana: 'low', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'jodhpur', name: 'Jodhpur Mandi', state: 'Rajasthan', city: 'Jodhpur', lat: 26.2389, lng: 73.0243, dist: 810, arrivals: 1520, buyers: 74, lastUpdated: 'Today, 8:30 AM',
    weather: { temp: 33, condition: 'Hot & Dry', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'low', wheat: 'medium', onion: 'medium', tomato: 'low', maize: 'low', soybean: 'medium', potato: 'low', chilli: 'high', groundnut: 'high', cotton: 'medium', sugarcane: 'low', mango: 'low', banana: 'low', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'bengaluru', name: 'Bengaluru APMC', state: 'Karnataka', city: 'Bengaluru', lat: 13.0189, lng: 77.5456, dist: 840, arrivals: 2890, buyers: 146, lastUpdated: 'Today, 7:45 AM',
    weather: { temp: 25, condition: 'Pleasant', icon: 'cloud-sun', rain: '20%' },
    prices: {},
    demand: { rice: 'high', wheat: 'medium', onion: 'high', tomato: 'high', maize: 'high', soybean: 'medium', potato: 'high', chilli: 'high', groundnut: 'high', cotton: 'low', sugarcane: 'high', mango: 'high', banana: 'high', grapes: 'high', pulses: 'high' }
  },
  {
    id: 'hubballi', name: 'Hubballi APMC', state: 'Karnataka', city: 'Hubballi', lat: 15.3647, lng: 75.1240, dist: 500, arrivals: 1840, buyers: 92, lastUpdated: 'Today, 8:30 AM',
    weather: { temp: 28, condition: 'Partly Cloudy', icon: 'cloud-sun', rain: '10%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'medium', onion: 'high', tomato: 'medium', maize: 'high', soybean: 'medium', potato: 'low', chilli: 'high', groundnut: 'high', cotton: 'high', sugarcane: 'high', mango: 'medium', banana: 'medium', grapes: 'high', pulses: 'medium' }
  },
  {
    id: 'hyderabad', name: 'Hyderabad APMC', state: 'Telangana', city: 'Hyderabad', lat: 17.3850, lng: 78.4867, dist: 560, arrivals: 2750, buyers: 140, lastUpdated: 'Today, 8:00 AM',
    weather: { temp: 29, condition: 'Partly Cloudy', icon: 'cloud-sun', rain: '10%' },
    prices: {},
    demand: { rice: 'high', wheat: 'medium', onion: 'high', tomato: 'high', maize: 'high', soybean: 'medium', potato: 'high', chilli: 'high', groundnut: 'high', cotton: 'high', sugarcane: 'medium', mango: 'high', banana: 'high', grapes: 'high', pulses: 'high' }
  },
  {
    id: 'warangal', name: 'Warangal APMC', state: 'Telangana', city: 'Warangal', lat: 17.9689, lng: 79.5941, dist: 610, arrivals: 2450, buyers: 118, lastUpdated: 'Today, 8:15 AM',
    weather: { temp: 31, condition: 'Sunny', icon: 'sun', rain: '5%' },
    prices: {},
    demand: { rice: 'high', wheat: 'low', onion: 'medium', tomato: 'medium', maize: 'high', soybean: 'medium', potato: 'low', chilli: 'high', groundnut: 'high', cotton: 'high', sugarcane: 'low', mango: 'medium', banana: 'medium', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'guntur', name: 'Guntur APMC', state: 'Andhra Pradesh', city: 'Guntur', lat: 16.3067, lng: 80.4365, dist: 720, arrivals: 3600, buyers: 175, lastUpdated: 'Today, 7:30 AM',
    weather: { temp: 32, condition: 'Sunny & Humid', icon: 'sun', rain: '10%' },
    prices: {},
    demand: { rice: 'high', wheat: 'low', onion: 'medium', tomato: 'high', maize: 'high', soybean: 'low', potato: 'low', chilli: 'high', groundnut: 'high', cotton: 'high', sugarcane: 'high', mango: 'high', banana: 'high', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'vijayawada', name: 'Vijayawada APMC', state: 'Andhra Pradesh', city: 'Vijayawada', lat: 16.5062, lng: 80.6480, dist: 680, arrivals: 2200, buyers: 110, lastUpdated: 'Today, 8:00 AM',
    weather: { temp: 32, condition: 'Humid', icon: 'cloud-sun', rain: '15%' },
    prices: {},
    demand: { rice: 'high', wheat: 'low', onion: 'high', tomato: 'high', maize: 'high', soybean: 'low', potato: 'medium', chilli: 'high', groundnut: 'high', cotton: 'high', sugarcane: 'high', mango: 'high', banana: 'high', grapes: 'medium', pulses: 'high' }
  },
  {
    id: 'chennai', name: 'Chennai Koyambedu', state: 'Tamil Nadu', city: 'Chennai', lat: 13.0694, lng: 80.1948, dist: 1300, arrivals: 3400, buyers: 165, lastUpdated: 'Today, 7:00 AM',
    weather: { temp: 33, condition: 'Humid', icon: 'sun', rain: '10%' },
    prices: {},
    demand: { rice: 'high', wheat: 'medium', onion: 'high', tomato: 'high', maize: 'high', soybean: 'low', potato: 'high', chilli: 'high', groundnut: 'high', cotton: 'low', sugarcane: 'high', mango: 'high', banana: 'high', grapes: 'high', pulses: 'high' }
  },
  {
    id: 'coimbatore', name: 'Coimbatore Mandi', state: 'Tamil Nadu', city: 'Coimbatore', lat: 11.0168, lng: 76.9558, dist: 980, arrivals: 2150, buyers: 104, lastUpdated: 'Today, 7:30 AM',
    weather: { temp: 28, condition: 'Pleasant', icon: 'cloud-sun', rain: '15%' },
    prices: {},
    demand: { rice: 'high', wheat: 'low', onion: 'high', tomato: 'high', maize: 'high', soybean: 'low', potato: 'high', chilli: 'high', groundnut: 'high', cotton: 'high', sugarcane: 'high', mango: 'high', banana: 'high', grapes: 'high', pulses: 'high' }
  },
  {
    id: 'madurai', name: 'Madurai Mandi', state: 'Tamil Nadu', city: 'Madurai', lat: 9.9252, lng: 78.1198, dist: 1120, arrivals: 1890, buyers: 92, lastUpdated: 'Today, 8:00 AM',
    weather: { temp: 34, condition: 'Sunny', icon: 'sun', rain: '5%' },
    prices: {},
    demand: { rice: 'high', wheat: 'low', onion: 'high', tomato: 'high', maize: 'high', soybean: 'low', potato: 'high', chilli: 'high', groundnut: 'high', cotton: 'medium', sugarcane: 'high', mango: 'high', banana: 'high', grapes: 'high', pulses: 'high' }
  },
  {
    id: 'kolkata', name: 'Kolkata Mandi', state: 'West Bengal', city: 'Kolkata', lat: 22.5726, lng: 88.3639, dist: 1780, arrivals: 2950, buyers: 148, lastUpdated: 'Today, 7:00 AM',
    weather: { temp: 30, condition: 'Humid', icon: 'cloud-sun', rain: '25%' },
    prices: {},
    demand: { rice: 'high', wheat: 'high', onion: 'high', tomato: 'high', maize: 'medium', soybean: 'low', potato: 'high', chilli: 'high', groundnut: 'medium', cotton: 'low', sugarcane: 'medium', mango: 'high', banana: 'high', grapes: 'high', pulses: 'high' }
  },
  {
    id: 'bhubaneswar', name: 'Bhubaneswar Mandi', state: 'Odisha', city: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, dist: 1290, arrivals: 1850, buyers: 88, lastUpdated: 'Today, 7:30 AM',
    weather: { temp: 31, condition: 'Partly Cloudy', icon: 'cloud-sun', rain: '20%' },
    prices: {},
    demand: { rice: 'high', wheat: 'medium', onion: 'high', tomato: 'high', maize: 'medium', soybean: 'low', potato: 'high', chilli: 'high', groundnut: 'medium', cotton: 'low', sugarcane: 'medium', mango: 'high', banana: 'high', grapes: 'medium', pulses: 'high' }
  },
  {
    id: 'raipur', name: 'Raipur Mandi', state: 'Chhattisgarh', city: 'Raipur', lat: 21.2514, lng: 81.6296, dist: 950, arrivals: 2450, buyers: 120, lastUpdated: 'Today, 8:30 AM',
    weather: { temp: 31, condition: 'Sunny', icon: 'sun', rain: '5%' },
    prices: {},
    demand: { rice: 'high', wheat: 'medium', onion: 'medium', tomato: 'medium', maize: 'high', soybean: 'medium', potato: 'medium', chilli: 'medium', groundnut: 'medium', cotton: 'low', sugarcane: 'high', mango: 'medium', banana: 'medium', grapes: 'low', pulses: 'high' }
  },
  {
    id: 'kochi', name: 'Kochi Mandi', state: 'Kerala', city: 'Kochi', lat: 9.9312, lng: 76.2673, dist: 1040, arrivals: 1820, buyers: 94, lastUpdated: 'Today, 7:15 AM',
    weather: { temp: 29, condition: 'Light Rain', icon: 'cloud-rain', rain: '60%' },
    prices: {},
    demand: { rice: 'high', wheat: 'medium', onion: 'high', tomato: 'high', maize: 'high', soybean: 'low', potato: 'high', chilli: 'high', groundnut: 'high', cotton: 'low', sugarcane: 'high', mango: 'high', banana: 'high', grapes: 'high', pulses: 'high' }
  },
  {
    id: 'guwahati', name: 'Guwahati Mandi', state: 'Assam', city: 'Guwahati', lat: 26.1445, lng: 91.7362, dist: 1760, arrivals: 1520, buyers: 78, lastUpdated: 'Today, 7:00 AM',
    weather: { temp: 27, condition: 'Overcast', icon: 'cloud', rain: '30%' },
    prices: {},
    demand: { rice: 'high', wheat: 'high', onion: 'high', tomato: 'high', maize: 'high', soybean: 'low', potato: 'high', chilli: 'high', groundnut: 'low', cotton: 'low', sugarcane: 'low', mango: 'high', banana: 'high', grapes: 'medium', pulses: 'high' }
  },
  {
    id: 'shimla', name: 'Shimla Mandi', state: 'Himachal Pradesh', city: 'Shimla', lat: 31.1048, lng: 77.1734, dist: 1410, arrivals: 1250, buyers: 68, lastUpdated: 'Today, 8:00 AM',
    weather: { temp: 18, condition: 'Cool & Clear', icon: 'sun', rain: '5%' },
    prices: {},
    demand: { rice: 'medium', wheat: 'high', onion: 'high', tomato: 'high', maize: 'medium', soybean: 'low', potato: 'high', chilli: 'medium', groundnut: 'low', cotton: 'low', sugarcane: 'low', mango: 'medium', banana: 'medium', grapes: 'medium', pulses: 'high' }
  },
  {
    id: 'jammu', name: 'Jammu Mandi', state: 'Jammu & Kashmir', city: 'Jammu', lat: 32.7266, lng: 74.8570, dist: 1540, arrivals: 1650, buyers: 84, lastUpdated: 'Today, 7:30 AM',
    weather: { temp: 22, condition: 'Clear', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { rice: 'high', wheat: 'high', onion: 'high', tomato: 'high', maize: 'medium', soybean: 'low', potato: 'high', chilli: 'medium', groundnut: 'low', cotton: 'low', sugarcane: 'low', mango: 'medium', banana: 'medium', grapes: 'medium', pulses: 'high' }
  },
  {
    id: 'chandigarh', name: 'Chandigarh APMC', state: 'Punjab', city: 'Chandigarh', lat: 30.7333, lng: 76.7794, dist: 1520, arrivals: 1800, buyers: 95, lastUpdated: 'Today',
    weather: { temp: 26, condition: 'Clear', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { onion: 'high', wheat: 'high', rice: 'high', tomato: 'medium' }
  },
  {
    id: 'chandwad', name: 'APMC Chandwad', state: 'Maharashtra', city: 'Chandwad', lat: 20.3283, lng: 74.2422, dist: 220, arrivals: 1200, buyers: 72, lastUpdated: 'Today',
    weather: { temp: 26, condition: 'Clear', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { onion: 'high', tomato: 'medium', soybean: 'medium', maize: 'medium' }
  },
  {
    id: 'lasalgaon', name: 'Lasalgaon APMC', state: 'Maharashtra', city: 'Lasalgaon', lat: 20.1472, lng: 74.2253, dist: 205, arrivals: 3100, buyers: 160, lastUpdated: 'Today',
    weather: { temp: 26, condition: 'Partly Cloudy', icon: 'cloud-sun', rain: '0%' },
    prices: {},
    demand: { onion: 'high', tomato: 'medium', soybean: 'medium', maize: 'medium' }
  },
  {
    id: 'chandrapur', name: 'Chandrapur APMC', state: 'Maharashtra', city: 'Chandrapur', lat: 19.9615, lng: 79.2961, dist: 710, arrivals: 1100, buyers: 58, lastUpdated: 'Today',
    weather: { temp: 31, condition: 'Sunny', icon: 'sun', rain: '0%' },
    prices: {},
    demand: { onion: 'medium', cotton: 'high', soybean: 'high', rice: 'medium' }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. CROP METADATA
// ─────────────────────────────────────────────────────────────────────────────

var MPC_CROP_META = {
  rice: { emoji: '🌾', name: 'Rice', hindi: 'धान', unit: '₹/q', trend: 5.2 },
  wheat: { emoji: '🌾', name: 'Wheat', hindi: 'गेहूं', unit: '₹/q', trend: 6.2 },
  onion: { emoji: '🧅', name: 'Onion', hindi: 'प्याज', unit: '₹/q', trend: 3.8 },
  tomato: { emoji: '🍅', name: 'Tomato', hindi: 'टमाटर', unit: '₹/q', trend: -1.4 },
  maize: { emoji: '🌽', name: 'Maize', hindi: 'मक्का', unit: '₹/q', trend: 2.1 },
  soybean: { emoji: '🫘', name: 'Soybean', hindi: 'सोयाबीन', unit: '₹/q', trend: 4.8 },
  potato: { emoji: '🥔', name: 'Potato', hindi: 'आलू', unit: '₹/q', trend: 0.8 },
  chilli: { emoji: '🌶️', name: 'Chilli', hindi: 'मिर्च', unit: '₹/q', trend: 7.2 },
  groundnut: { emoji: '🥜', name: 'Groundnut', hindi: 'मूंगफली', unit: '₹/q', trend: 3.4 },
  cotton: { emoji: '☁️', name: 'Cotton', hindi: 'कपास', unit: '₹/q', trend: -0.6 },
  sugarcane: { emoji: '🎋', name: 'Sugarcane', hindi: 'गन्ना', unit: '₹/q', trend: 1.8 },
  mango: { emoji: '🥭', name: 'Mango', hindi: 'आम', unit: '₹/q', trend: 6.5 },
  banana: { emoji: '🍌', name: 'Banana', hindi: 'केला', unit: '₹/q', trend: 2.2 },
  grapes: { emoji: '🍇', name: 'Grapes', hindi: 'अंगूर', unit: '₹/q', trend: 4.1 },
  pulses: { emoji: '🥣', name: 'Pulses', hindi: 'दालें', unit: '₹/q', trend: 3.9 }
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
  this.crop = 'onion';
  this.qty = 25;
  this.origin = 'pune';
  this.grade = 'B';
  this.sortBy = 'net'; // 'net', 'price', 'dist', 'transport', 'demand', 'best'
  this.searchQ = '';
  this.stateFilter = 'all';
  this.distFilter = 'all';
  this.demandFilter = 'all';
  this.selected = []; // user-driven selection; no stale hardcoded mandis
  this.chartMode = 'net'; // 'net', 'price', 'transport', 'scatter'
  this.chart = null;
  this.lastUpdated = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
  this.isLoading = false;
  this.govDataStatus = 'idle'; // 'idle', 'loading', 'success', 'unavailable', 'stale'
  this.govDataMessage = '';
  this.govUpdatedAt = '';
}

MandiCompare.prototype.init = function () {
  this.recalculateDistances();
  this.bindControls();
  this.loadUserCrops();
  this.fetchGovernmentPrices();
};

// ── Recalculate distances based on selected Origin Hub ───────────────────────
MandiCompare.prototype.recalculateDistances = function () {
  var hub = MPC_ORIGIN_HUBS[this.origin] || MPC_ORIGIN_HUBS.pune;
  MPC_DATA.forEach(function (m) {
    if (m.lat && m.lng && hub.lat && hub.lng) {
      m.dist = mpcCalcDistance(hub.lat, hub.lng, m.lat, m.lng);
    }
  });
};

// ── Bind UI Events ───────────────────────────────────────────────────────────
MandiCompare.prototype.bindControls = function () {
  var self = this;

  // Crop Selector
  var cropSel = document.getElementById('mpc-crop-select');
  if (cropSel) cropSel.addEventListener('change', function (e) {
    self.crop = e.target.value;
    self.fetchGovernmentPrices();
  });

  // Quantity Input
  var qtyIn = document.getElementById('mpc-qty-input');
  if (qtyIn) {
    var qt;
    qtyIn.addEventListener('input', function (e) {
      clearTimeout(qt);
      qt = setTimeout(function () {
        var v = parseInt(e.target.value, 10);
        if (!isNaN(v) && v > 0) {
          self.qty = v;
          self.render();
        }
      }, 300);
    });
  }

  // Rapid Quantity Preset Buttons
  document.querySelectorAll('.mpc-qty-preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = parseInt(btn.dataset.qty, 10);
      if (val && qtyIn) {
        qtyIn.value = val;
        self.qty = val;
        document.querySelectorAll('.mpc-qty-preset-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        self.render();
      }
    });
  });

  // Origin Hub Selector
  var originSel = document.getElementById('mpc-origin-select');
  if (originSel) originSel.addEventListener('change', function (e) {
    self.origin = e.target.value;
    self.recalculateDistances();
    self.render();
  });

  // Quality Grade Selector
  var gradeSel = document.getElementById('mpc-grade-select');
  if (gradeSel) gradeSel.addEventListener('change', function (e) {
    self.grade = e.target.value;
    self.render();
  });

  // Sort Selector
  var sortSel = document.getElementById('mpc-sort-select');
  if (sortSel) sortSel.addEventListener('change', function (e) {
    self.sortBy = e.target.value;
    self.render();
  });

  // State / Region Filter
  var stateSel = document.getElementById('mpc-state-filter');
  if (stateSel) stateSel.addEventListener('change', function (e) {
    self.stateFilter = e.target.value;
    self.fetchGovernmentPrices();
  });

  // Distance Filter
  var distSel = document.getElementById('mpc-dist-filter');
  if (distSel) distSel.addEventListener('change', function (e) {
    self.distFilter = e.target.value;
    self.render();
  });

  // Demand Filter
  var demandSel = document.getElementById('mpc-demand-filter');
  if (demandSel) demandSel.addEventListener('change', function (e) {
    self.demandFilter = e.target.value;
    self.render();
  });

  // Search Input
  var searchIn = document.getElementById('mpc-search-input');
  if (searchIn) {
    var st;
    searchIn.addEventListener('input', function (e) {
      clearTimeout(st);
      st = setTimeout(function () {
        self.searchQ = e.target.value.toLowerCase().trim();
        self.render();
      }, 250);
    });
  }

  // Refresh Prices Button
  var refreshBtn = document.getElementById('mpc-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function () {
      self.triggerRefresh();
    });
  }

  // Multi-Mandi Chip Helper Actions
  var selectTop5Btn = document.getElementById('mpc-chip-top5');
  if (selectTop5Btn) selectTop5Btn.addEventListener('click', function () {
    var list = self.getProcessedList();
    self.selected = list.slice(0, 5).map(function (m) { return m.id; });
    self.renderChips();
    self.renderTable();
    self.renderCards();
    self.renderChart();
    self.renderWeatherStrip();
  });

  var selectNearbyBtn = document.getElementById('mpc-chip-nearby');
  if (selectNearbyBtn) selectNearbyBtn.addEventListener('click', function () {
    var list = self.getProcessedList().filter(function (m) { return m.dist <= 250; });
    self.selected = list.slice(0, 6).map(function (m) { return m.id; });
    if (!self.selected.length && MPC_DATA.length) self.selected = [MPC_DATA[0].id];
    self.renderChips();
    self.renderTable();
    self.renderCards();
    self.renderChart();
    self.renderWeatherStrip();
  });

  var clearChipsBtn = document.getElementById('mpc-chip-clear');
  if (clearChipsBtn) clearChipsBtn.addEventListener('click', function () {
    self.selected = [];
    self.renderChips();
    self.renderTable();
    self.renderCards();
    self.renderChart();
    self.renderWeatherStrip();
  });

  // Chart Mode Toggles
  document.querySelectorAll('.mpc-chart-tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.mpc-chart-tab-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      self.chartMode = btn.dataset.chart;
      self.renderChart();
    });
  });

  // Profile dropdown toggle
  var profileBtn = document.getElementById('btn-profile');
  var profileWrap = document.getElementById('dash-profile-wrap');
  if (profileBtn && profileWrap) {
    profileBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      profileWrap.classList.toggle('open');
    });
    document.addEventListener('click', function () { profileWrap.classList.remove('open'); });
  }

  // Mobile nav toggle
  var navToggle = document.getElementById('dash-nav-toggle');
  var mobileNav = document.getElementById('dash-mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });
  }

  // Language changed synchronization
  window.addEventListener('languageChanged', function () {
    self.loadUserCrops();
    self.render();
  });
};

// ── Government Mandi Data Integration (data.gov.in) ────────────────────────
MandiCompare.prototype.fetchGovernmentPrices = function (isRefresh) {
  var self = this;
  var crop = self.crop;
  var state = self.stateFilter !== 'all' ? self.stateFilter : '';

  var btn = document.getElementById('mpc-refresh-btn');
  if (btn) {
    btn.classList.add('loading');
    btn.disabled = true;
  }

  var statusTitle = document.getElementById('mpc-gov-status-title');
  var statusDesc = document.getElementById('mpc-gov-status-desc');
  var statusBadge = document.getElementById('mpc-gov-status-badge');
  var tsEl = document.getElementById('mpc-last-updated-text');

  var t = function (k, fb) { return window.KrishiI18n ? window.KrishiI18n.t(k, fb) : fb; };
  var getCropName = function (id) { return window.KrishiI18n ? window.KrishiI18n.getCropName(id) : id; };
  var cropDisplay = getCropName(crop);
  var stateDisplay = state ? (state.charAt(0).toUpperCase() + state.slice(1)) : '';

  if (statusBadge) {
    statusBadge.textContent = t('market.fetchingGovData', 'Fetching live Government of India (data.gov.in) mandi prices...');
    statusBadge.className = 'ks-badge';
  }

  var params = { commodity: crop };
  if (state) params.state = state;

  var apiPromise = (window.api && window.api.market && typeof window.api.market.getMandiPrices === 'function')
    ? window.api.market.getMandiPrices(params)
    : fetch('/api/market/mandi-prices?' + new URLSearchParams(params).toString()).then(function (r) { return r.json(); });

  apiPromise
    .then(function (res) {
      if (btn) {
        btn.classList.remove('loading');
        btn.disabled = false;
      }

      // Reset existing price states
      MPC_DATA.forEach(function (m) {
        m.prices = {};
        delete m._govData;
      });

      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        var isLive = res.sourceStatus === 'live' || (!res.stale && !res.cached);
        self.govDataStatus = isLive ? 'success' : 'stale';
        self.govUpdatedAt = res.fetchedAt || res.updatedAt || '';
        var updateLabel = self.govUpdatedAt ? new Date(self.govUpdatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Latest';

        if (statusTitle) statusTitle.textContent = t('market.marketMandi', 'Government Mandi Data');
        if (statusDesc) {
          statusDesc.textContent = isLive
            ? ('· ' + t('market.liveDataGov', 'Live data from data.gov.in'))
            : ('· ' + t('market.staleDataGov', 'Showing latest retrieved data from data.gov.in.'));
        }
        if (statusBadge) {
          statusBadge.textContent = isLive ? ('✓ ' + t('market.liveDataGov', 'Live data from data.gov.in')) : t('market.cachedDataGov', 'Cached data.gov.in');
          statusBadge.className = isLive ? 'ks-badge ks-badge-protected' : 'ks-badge ks-badge-dispute';
        }
        if (tsEl) {
          tsEl.textContent = 'Last updated: ' + updateLabel;
        }

        // Match records strictly against MPC_DATA with exact disambiguation
        res.data.forEach(function (rec) {
          var recMkt = (rec.market || '').toLowerCase().trim();
          var recDist = (rec.district || '').toLowerCase().trim();
          var recState = (rec.state || '').toLowerCase().trim();

          MPC_DATA.forEach(function (m) {
            var mName = m.name.toLowerCase().trim();
            var mCity = m.city.toLowerCase().trim();
            var mState = m.state.toLowerCase().trim();

            // Strict anti-collision for Chandigarh vs Chandwad vs Chandrapur vs Lasalgaon
            var isMChandigarh = m.id === 'chandigarh' || mCity === 'chandigarh' || mName.indexOf('chandigarh') !== -1;
            var isRecChandigarh = recMkt.indexOf('chandigarh') !== -1;
            if (isMChandigarh !== isRecChandigarh) return;

            var isMChandwad = m.id === 'chandwad' || mCity === 'chandwad' || mName.indexOf('chandwad') !== -1;
            var isRecChandwad = recMkt.indexOf('chandwad') !== -1;
            if (isMChandwad !== isRecChandwad) return;

            var isMChandrapur = m.id === 'chandrapur' || mCity === 'chandrapur' || mName.indexOf('chandrapur') !== -1;
            var isRecChandrapur = recMkt.indexOf('chandrapur') !== -1;
            if (isMChandrapur !== isRecChandrapur) return;

            var isMLasalgaon = m.id === 'lasalgaon' || mCity === 'lasalgaon' || mName.indexOf('lasalgaon') !== -1;
            var isRecLasalgaon = recMkt.indexOf('lasalgaon') !== -1;
            if (isMLasalgaon !== isRecLasalgaon) return;

            if (recState && mState && mState !== recState && mState.indexOf(recState) === -1 && recState.indexOf(mState) === -1) {
              return;
            }

            var matches = (mCity === recMkt || mName.indexOf(recMkt) !== -1 || recMkt.indexOf(mCity) !== -1 || (recDist && (mCity === recDist || mName.indexOf(recDist) !== -1)));

            if (matches && rec.modalPrice > 0) {
              m.prices[crop] = rec.modalPrice;
              m._govData = {
                minPrice: rec.minPrice,
                maxPrice: rec.maxPrice,
                modalPrice: rec.modalPrice,
                arrivalDate: rec.reportDate || rec.arrivalDate,
                reportDate: rec.reportDate || rec.arrivalDate,
                arrivalVolume: rec.arrivalVolume,
                commodity: rec.commodity,
                market: rec.market,
                state: rec.state,
                isGov: true,
                stale: !isLive,
                source: rec.source || 'Government of India / AGMARKNET',
                status: rec.status || (isLive ? 'LIVE' : 'CACHED')
              };
              m.lastUpdated = 'Reported: ' + (rec.reportDate || rec.arrivalDate || updateLabel);
            }
          });
        });

        self.render();
      } else {
        self.govDataStatus = 'empty';
        var emptyMsg = stateDisplay
          ? t('market.noArrivalsState', 'No market arrival records found for ' + cropDisplay + ' in ' + stateDisplay + ' today.')
          : t('market.noArrivalsToday', 'No market arrival records found for ' + cropDisplay + ' today.');
        if (statusTitle) statusTitle.textContent = t('market.marketMandi', 'Government Mandi Data');
        if (statusDesc) statusDesc.textContent = emptyMsg;
        if (statusBadge) {
          statusBadge.textContent = t('common.noData', 'No Data Available');
          statusBadge.className = 'ks-badge ks-badge-dispute';
        }
        if (tsEl) {
          tsEl.textContent = emptyMsg;
        }
        MPC_DATA.forEach(function (m) {
          delete m._govData;
        });
        self.render();
      }
    })
    .catch(function () {
      if (btn) {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
      self.govDataStatus = 'error';
      var errMsg = t('market.connectionError', 'Unable to connect to live market price server. Please check your connection.');
      if (statusTitle) statusTitle.textContent = t('market.marketMandi', 'Government Mandi Data');
      if (statusDesc) statusDesc.textContent = errMsg;
      if (statusBadge) {
        statusBadge.textContent = t('market.serverUnavailable', 'Server Unavailable');
        statusBadge.className = 'ks-badge ks-badge-dispute';
      }
      if (tsEl) {
        tsEl.textContent = errMsg;
      }
      MPC_DATA.forEach(function (m) {
        delete m._govData;
      });
      self.render();
    });
};

MandiCompare.prototype.triggerRefresh = function () {
  this.fetchGovernmentPrices(true);
};

// ── Load User Crops from Stored Farmer Lots ──────────────────────────────────
MandiCompare.prototype.loadUserCrops = function () {
  var self = this;
  var wrap = document.getElementById('mpc-your-crops');
  if (!wrap) return;

  var userCrops = [];
  try {
    var state = JSON.parse(localStorage.getItem('krishishetra_state_v1') || '{}');
    if (state.lots && state.lots.length) {
      var seen = {};
      state.lots.forEach(function (lot) {
        if (lot.cropId && !seen[lot.cropId]) {
          seen[lot.cropId] = true;
          userCrops.push({ id: lot.cropId, name: lot.crop });
        }
      });
    }
  } catch (e) { }

  if (!userCrops.length) {
    userCrops = [
      { id: 'onion', name: 'Onion' },
      { id: 'soybean', name: 'Soybean' },
      { id: 'wheat', name: 'Wheat' },
      { id: 'tomato', name: 'Tomato' },
      { id: 'cotton', name: 'Cotton' }
    ];
  }

  wrap.innerHTML = userCrops.map(function (c) {
    var meta = MPC_CROP_META[c.id] || { emoji: '🌾' };
    var cropName = window.KrishiI18n ? window.KrishiI18n.getCropName(c.id) : c.name;
    return '<button class="mpc-quick-crop-btn' + (c.id === self.crop ? ' active' : '') + '" data-crop="' + c.id + '">'
      + meta.emoji + ' ' + cropName + '</button>';
  }).join('');

  wrap.querySelectorAll('.mpc-quick-crop-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      self.crop = btn.dataset.crop;
      var sel = document.getElementById('mpc-crop-select');
      if (sel) sel.value = self.crop;
      wrap.querySelectorAll('.mpc-quick-crop-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      self.fetchGovernmentPrices();
    });
  });
};

// ── Process & Calculate Mandi Metrics ────────────────────────────────────────
MandiCompare.prototype.getProcessedList = function () {
  var self = this, crop = this.crop, qty = this.qty, gradeF = mpcGradeFactor(this.grade);

  var list;
  if (self.selected && self.selected.length > 0) {
    // When specific mandis are selected/pinned (e.g. Compare Chandigarh, Nashik, Lasalgaon),
    // ALWAYS preserve those exact mandis without substituting, even if price is unavailable!
    list = MPC_DATA.filter(function (m) {
      return self.selected.indexOf(m.id) !== -1;
    });
  } else if (self.searchQ) {
    var q = self.searchQ.toLowerCase();
    list = MPC_DATA.filter(function (m) {
      return m.name.toLowerCase().indexOf(q) !== -1 ||
        m.city.toLowerCase().indexOf(q) !== -1 ||
        m.state.toLowerCase().indexOf(q) !== -1;
    });
  } else {
    // Normal ranking: only mandis with valid government reported prices
    list = MPC_DATA.filter(function (m) {
      return m.prices && m.prices[crop] > 0;
    });
  }

  // Calculate metrics for each mandi
  list.forEach(function (m) {
    var rawPrice = (m.prices && m.prices[crop] > 0) ? m.prices[crop] : null;
    var hasPrice = (typeof rawPrice === 'number' && rawPrice > 0);
    m._hasPrice = hasPrice;

    var transportPerQ = mpcTransportRatePerQ(m.dist);
    m._transportPerQ = transportPerQ;
    m._transportTotal = transportPerQ * qty;

    if (hasPrice) {
      var adjPrice = Math.round(rawPrice * gradeF);
      var netPerQ = adjPrice - transportPerQ;
      var grossTotal = adjPrice * qty;
      var netTotal = netPerQ * qty;

      m._rawPrice = rawPrice;
      m._adjPrice = adjPrice;
      m._netPerQ = netPerQ;
      m._grossTotal = grossTotal;
      m._netTotal = netTotal;
    } else {
      m._rawPrice = null;
      m._adjPrice = null;
      m._netPerQ = -999999;
      m._grossTotal = null;
      m._netTotal = null;
    }
  });

  // Min/Max for composite score (only considering mandis with prices)
  var pricedList = list.filter(function(m){ return m._hasPrice; });
  if (pricedList.length > 0) {
    var netPrices = pricedList.map(function (m) { return m._netPerQ; });
    var dists = pricedList.map(function (m) { return m.dist; });
    var maxNet = Math.max.apply(null, netPrices), minNet = Math.min.apply(null, netPrices), rNet = maxNet - minNet || 1;
    var maxD = Math.max.apply(null, dists), minD = Math.min.apply(null, dists), rD = maxD - minD || 1;

    list.forEach(function (m) {
      if (m._hasPrice) {
        var netNorm = (m._netPerQ - minNet) / rNet;
        var distNorm = 1 - ((m.dist - minD) / rD);
        var demandNorm = mpcDemandScore(m.demand[crop] || 'medium');
        m._compositeScore = (netNorm * 0.55) + (distNorm * 0.30) + (demandNorm * 0.15);
      } else {
        m._compositeScore = -1;
      }
    });
  } else {
    list.forEach(function(m) { m._compositeScore = -1; });
  }

  // Filters (if not explicitly pinned)
  if (!self.selected || !self.selected.length) {
    if (self.stateFilter !== 'all') {
      list = list.filter(function (m) { return m.state.toLowerCase() === self.stateFilter.toLowerCase(); });
    }

    if (self.distFilter === '100') {
      list = list.filter(function (m) { return m.dist <= 100; });
    } else if (self.distFilter === '300') {
      list = list.filter(function (m) { return m.dist <= 300; });
    } else if (self.distFilter === '500') {
      list = list.filter(function (m) { return m.dist <= 500; });
    }

    if (self.demandFilter !== 'all') {
      if (self.demandFilter === 'high') {
        list = list.filter(function (m) { return (m.demand[crop] || 'medium') === 'high'; });
      } else if (self.demandFilter === 'medium') {
        list = list.filter(function (m) { return (m.demand[crop] || 'medium') !== 'low'; });
      }
    }
  }

  // Sorting: mandis with government prices always rank above unavailable ones
  list.sort(function (a, b) {
    if (a._hasPrice && !b._hasPrice) return -1;
    if (!a._hasPrice && b._hasPrice) return 1;
    if (!a._hasPrice && !b._hasPrice) return a.dist - b.dist;

    if (self.sortBy === 'price') return b._adjPrice - a._adjPrice;
    if (self.sortBy === 'dist') return a.dist - b.dist;
    if (self.sortBy === 'transport') return a._transportPerQ - b._transportPerQ;
    if (self.sortBy === 'demand') return mpcDemandScore(b.demand[crop]) - mpcDemandScore(a.demand[crop]);
    if (self.sortBy === 'best') return b._compositeScore - a._compositeScore;
    return b._netPerQ - a._netPerQ; // 'net' default
  });

  return list;
};

MandiCompare.prototype.render = function () {
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
MandiCompare.prototype.renderKPIs = function () {
  var crop = this.crop, qty = this.qty;
  var allList = this.getProcessedList().slice();
  var pricedList = allList.filter(function(m){ return m._hasPrice; });
  function set(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

  if (!pricedList.length) {
    set('kpi-best-net-val', 'Price unavailable');
    set('kpi-best-net-name', 'No report');
    set('kpi-best-net-sub', 'No government report');
    set('kpi-lowest-tr-val', '—');
    set('kpi-lowest-tr-name', '—');
    set('kpi-lowest-tr-sub', '—');
    set('kpi-closest-val', '—');
    set('kpi-closest-name', '—');
    set('kpi-closest-sub', '—');
    set('kpi-best-overall-val', 'Price unavailable');
    set('kpi-best-overall-name', 'No recent government data');
    set('kpi-best-overall-sub', '—');
    return;
  }

  var bestNet = pricedList.slice().sort(function (a, b) { return b._netPerQ - a._netPerQ; })[0];
  var lowestTr = pricedList.slice().sort(function (a, b) { return a._transportPerQ - b._transportPerQ; })[0];
  var closest = pricedList.slice().sort(function (a, b) { return a.dist - b.dist; })[0];
  var bestOverall = pricedList.slice().sort(function (a, b) { return b._compositeScore - a._compositeScore; })[0];

  set('kpi-best-net-val', mpcFmtINR(bestNet._netPerQ) + ' /q');
  set('kpi-best-net-name', bestNet.name);
  set('kpi-best-net-sub', 'Total net ' + mpcFmtINR(bestNet._netTotal) + ' (' + qty + 'q)');

  set('kpi-lowest-tr-val', mpcFmtINR(lowestTr._transportPerQ) + ' /q');
  set('kpi-lowest-tr-name', lowestTr.name);
  set('kpi-lowest-tr-sub', lowestTr.dist + ' km from origin');

  set('kpi-closest-val', closest.dist + ' km');
  set('kpi-closest-name', closest.name);
  set('kpi-closest-sub', 'Est. transit: ' + (closest.dist < 50 ? '1-2 hrs' : Math.round(closest.dist / 40) + ' hrs'));

  set('kpi-best-overall-val', bestOverall.name);
  set('kpi-best-overall-name', 'Highest Composite Profit Score');
  set('kpi-best-overall-sub', mpcFmtINR(bestOverall._netPerQ) + '/q net · ' + bestOverall.dist + ' km');
};

MandiCompare.prototype.renderRecommendation = function () {
  var el = document.getElementById('mpc-recommendation');
  if (!el) return;

  var crop = this.crop, qty = this.qty;
  var list = this.getProcessedList();
  var pricedList = list.filter(function(m){ return m._hasPrice; });

  if (!pricedList.length) {
    el.innerHTML = '<div class="mpc-rec-card mpc-rec-card--empty">'
      + '<div class="mpc-rec-card__empty-text">'
      + '<strong>Government price report currently unavailable</strong><br>'
      + 'No recent Government of India / AGMARKNET reports available for ' + (crop.charAt(0).toUpperCase() + crop.slice(1)) + '.'
      + '</div></div>';
    return;
  }

  var best = pricedList[0];
  var avgNet = Math.round(pricedList.reduce(function (s, m) { return s + m._netPerQ; }, 0) / pricedList.length);
  var diffVsAvg = best._netPerQ - avgNet;
  var totalGain = diffVsAvg * qty;

  var reasons = [];
  reasons.push('Realizes top net price of <strong>' + mpcFmtINR(best._netPerQ) + '/q</strong> after freight deduction');
  reasons.push('Generates <strong>+' + mpcFmtINR(Math.max(0, totalGain)) + ' extra net profit</strong> vs market average for ' + qty + 'q batch');
  reasons.push('Located at <strong>' + best.dist + ' km</strong> with estimated logistics cost of <strong>' + mpcFmtINR(best._transportPerQ) + '/q</strong>');
  reasons.push('Source: <strong>' + (best._govData ? best._govData.source : 'Government of India / AGMARKNET') + '</strong> (Reported: ' + (best._govData ? (best._govData.reportDate || best._govData.arrivalDate || 'Recent') : 'Recent') + ')');

  el.innerHTML = '<div class="mpc-rec-card">'
    + '<div class="mpc-rec-card__badge"><i data-lucide="award"></i> Recommended Optimal Mandi</div>'
    + '<div class="mpc-rec-card__title">' + best.name + ' (' + best.city + ', ' + best.state + ')</div>'
    + '<div class="mpc-rec-card__metrics">'
    + '  <div><span class="lbl">Reported Price:</span> <strong>' + mpcFmtINR(best._adjPrice) + '/q</strong></div>'
    + '  <div><span class="lbl">Net Realization:</span> <strong style="color:var(--kl-mint);">' + mpcFmtINR(best._netPerQ) + '/q</strong></div>'
    + '  <div><span class="lbl">Est. Freight:</span> <strong>' + mpcFmtINR(best._transportPerQ) + '/q</strong></div>'
    + '  <div><span class="lbl">Distance:</span> <strong>' + best.dist + ' km</strong></div>'
    + '</div>'
    + '<ul class="mpc-rec-card__reasons">'
    + reasons.map(function (r) { return '<li><i data-lucide="check-circle-2"></i> ' + r + '</li>'; }).join('')
    + '</ul>'
    + '</div>';
};

MandiCompare.prototype.renderFormulaCard = function () {
  var el = document.getElementById('mpc-formula-card');
  if (!el) return;

  var crop = this.crop, qty = this.qty;
  var pricedList = this.getProcessedList().filter(function(m){ return m._hasPrice; });
  if (!pricedList.length) { el.innerHTML = ''; return; }

  var best = pricedList[0];
  var second = pricedList[1] || best;

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

MandiCompare.prototype.renderChips = function () {
  var self = this;
  var wrap = document.getElementById('mpc-selected-chips');
  if (!wrap) return;

  if (!self.selected.length) {
    wrap.innerHTML = '<span class="mpc-chip-placeholder">No mandis pinned. Click mandis below or choose "Top 5" to compare simultaneously.</span>';
    return;
  }

  var chipsHtml = self.selected.map(function (id) {
    var m = MPC_DATA.filter(function (x) { return x.id === id; })[0];
    if (!m) return '';
    return '<span class="mpc-chip">'
      + m.name
      + '<button class="mpc-chip-remove" onclick="mpcEngine.toggleMandiSelection(\'' + m.id + '\', false)" aria-label="Remove ' + m.name + '">×</button>'
      + '</span>';
  }).join('');

  wrap.innerHTML = chipsHtml;
};

// ── Main Horizontally Scrollable Comparison Table ───────────────────────────
MandiCompare.prototype.renderTable = function () {
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

  var pricedList = list.filter(function(m){ return m._hasPrice; });
  var maxPrice = pricedList.length ? Math.max.apply(null, pricedList.map(function (m) { return m._adjPrice; })) : 0;
  var minDist = Math.min.apply(null, list.map(function (m) { return m.dist; }));
  var maxNet = pricedList.length ? Math.max.apply(null, pricedList.map(function (m) { return m._netPerQ; })) : 0;

  var rowsHtml = list.map(function (m, idx) {
    var isSelected = self.selected.indexOf(m.id) !== -1;
    var isTop = idx === 0 && m._hasPrice;
    var isBestValue = m._hasPrice && m._netPerQ === maxNet;

    // Badges
    var badge = '';
    if (!m._hasPrice) {
      badge = '<span class="mpc-badge mpc-badge--neutral">UNAVAILABLE</span>';
    } else if (isBestValue) {
      badge = '<span class="mpc-badge mpc-badge--green">⭐ BEST VALUE</span>';
    } else if (m._adjPrice === maxPrice) {
      badge = '<span class="mpc-badge mpc-badge--gold">🏆 HIGH PRICE</span>';
    } else if (m.dist === minDist) {
      badge = '<span class="mpc-badge mpc-badge--blue">📍 CLOSEST</span>';
    } else if ((m.demand[self.crop] || '') === 'high') {
      badge = '<span class="mpc-badge mpc-badge--orange">🔥 HIGH DEMAND</span>';
    } else {
      badge = '<span class="mpc-badge mpc-badge--neutral">GOOD</span>';
    }

    var w = m.weather || { temp: 28, condition: 'Clear', icon: 'sun' };

    var priceCellHtml = '';
    var grossCellHtml = '';
    var netCellHtml = '';
    var dateCellHtml = '';

    if (m._hasPrice) {
      priceCellHtml = '  <strong>' + mpcFmtINR(m._adjPrice) + '</strong><span class="mpc-unit">/q</span>'
        + (m._govData ? '  <div style="font-size:10px; color:#5B9A72; font-weight:600;">₹' + (m._govData.minPrice ? m._govData.minPrice.toLocaleString('en-IN') : '') + ' – ₹' + (m._govData.maxPrice ? m._govData.maxPrice.toLocaleString('en-IN') : '') + '</div>' : '');
      grossCellHtml = mpcFmtINR(m._grossTotal);
      netCellHtml = '  <div class="mpc-net-val">' + mpcFmtINR(m._netPerQ) + '<span class="mpc-unit">/q</span></div>'
        + '  <div class="mpc-net-sub">' + mpcFmtINR(m._netTotal) + ' net</div>';
      dateCellHtml = (m._govData ? 'Reported: ' + (m._govData.reportDate || m._govData.arrivalDate || 'Recent') : 'Latest available');
    } else {
      priceCellHtml = '  <strong style="color:#92400E; font-size:12px;">Price unavailable</strong>'
        + '  <div style="font-size:10px; color:#78350F;">No recent report</div>';
      grossCellHtml = '—';
      netCellHtml = '  <div class="mpc-net-val" style="color:#888;">—</div>'
        + '  <div class="mpc-net-sub">Unavailable</div>';
      dateCellHtml = '<span style="color:#888;">No recent report</span>';
    }

    return '<tr class="mpc-table-row' + (isBestValue ? ' mpc-table-row--highlight' : '') + (isSelected ? ' mpc-table-row--selected' : '') + '" id="mandi-row-' + m.id + '">'
      + '<td class="mpc-td-mandi">'
      + '  <div class="mpc-mandi-cell">'
      + '    <input type="checkbox" class="mpc-mandi-checkbox" ' + (isSelected ? 'checked' : '') + ' onchange="mpcEngine.toggleMandiSelection(\'' + m.id + '\', this.checked)">'
      + '    <div>'
      + '      <div class="mpc-mandi-cell__name">' + (isBestValue ? '⭐ ' : '') + m.name + '</div>'
      + '      <div class="mpc-mandi-cell__loc">' + m.city + ', ' + m.state + '</div>'
      + (m._govData ? '      <div><span class="ks-badge ks-badge-protected" style="font-size:9.5px; margin-top:2px;">✓ Gov Data</span></div>' : '')
      + '    </div>'
      + '  </div>'
      + '</td>'
      + '<td class="mpc-td-num mpc-td-price">' + priceCellHtml + '</td>'
      + '<td class="mpc-td-num">' + m.dist + ' km</td>'
      + '<td class="mpc-td-num mpc-td-transport">' + mpcFmtINR(m._transportPerQ) + '<span class="mpc-unit">/q</span></td>'
      + '<td class="mpc-td-num">' + grossCellHtml + '</td>'
      + '<td class="mpc-td-num mpc-text-muted">' + mpcFmtINR(m._transportTotal) + '</td>'
      + '<td class="mpc-td-num mpc-td-net">' + netCellHtml + '</td>'
      + '<td class="mpc-td-center">' + (m._govData ? (m._govData.arrivalVolume ? m._govData.arrivalVolume.toLocaleString('en-IN') + ' t' : '<span style="color:#888; font-size:11px;">Unavailable</span>') : m.arrivals.toLocaleString('en-IN') + ' t') + '</td>'
      + '<td class="mpc-td-center"><span class="mpc-demand-pill mpc-demand-pill--' + (m.demand[self.crop] || 'medium') + '">' + (m.demand[self.crop] || 'medium').toUpperCase() + '</span></td>'
      + '<td class="mpc-td-center">'
      + '  <div class="mpc-weather-cell" title="' + w.condition + ', ' + (w.rain || '0% rain') + '">'
      + '    <i data-lucide="' + (w.icon || 'sun') + '"></i> ' + w.temp + '°C'
      + '  </div>'
      + '</td>'
      + '<td class="mpc-td-center" style="font-size:11.5px; color:#555;">' + dateCellHtml + '</td>'
      + '<td class="mpc-td-center">' + badge + '</td>'
      + '</tr>';
  }).join('');

  tableBody.innerHTML = rowsHtml;
};

MandiCompare.prototype.renderCards = function () {
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

  var pricedList = list.filter(function(m){ return m._hasPrice; });
  var maxPrice = pricedList.length ? Math.max.apply(null, pricedList.map(function (m) { return m._adjPrice; })) : 0;
  var maxNet = pricedList.length ? Math.max.apply(null, pricedList.map(function (m) { return m._netPerQ; })) : 0;
  var minDist = Math.min.apply(null, list.map(function (m) { return m.dist; }));

  var cardsHtml = list.map(function (m) {
    var isSelected = self.selected.indexOf(m.id) !== -1;
    var isBestNet = m._hasPrice && m._netPerQ === maxNet;
    var isMaxPrice = m._hasPrice && m._adjPrice === maxPrice;
    var isClosest = m.dist === minDist;

    var badge = '';
    if (!m._hasPrice) {
      badge = '<span class="mpc-badge mpc-badge--neutral">UNAVAILABLE</span>';
    } else if (isBestNet) {
      badge = '<span class="mpc-badge mpc-badge--green">⭐ BEST VALUE</span>';
    } else if (isMaxPrice) {
      badge = '<span class="mpc-badge mpc-badge--gold">🏆 TOP PRICE</span>';
    } else if (isClosest) {
      badge = '<span class="mpc-badge mpc-badge--blue">📍 NEAREST</span>';
    } else if ((m.demand[self.crop] || '') === 'high') {
      badge = '<span class="mpc-badge mpc-badge--orange">🔥 HIGH DEMAND</span>';
    } else {
      badge = '<span class="mpc-badge mpc-badge--neutral">AVAILABLE</span>';
    }

    var w = m.weather || { temp: 28, condition: 'Clear', icon: 'sun' };

    var priceBlockHtml = '';
    if (m._hasPrice) {
      priceBlockHtml = '    <div class="mpc-mandi-card__price">' + mpcFmtINR(m._adjPrice) + '</div>'
        + '    <div class="mpc-mandi-card__price-unit">Modal Price / quintal</div>'
        + (m._govData ? '    <div style="font-size:11px; color:#5B9A72; font-weight:600; margin-top:2px;">Range: ₹' + (m._govData.minPrice ? m._govData.minPrice.toLocaleString('en-IN') : '') + ' – ₹' + (m._govData.maxPrice ? m._govData.maxPrice.toLocaleString('en-IN') : '') + '/q</div><div style="font-size:10.5px; color:#6F7F75; margin-top:1px;">Reported: ' + (m._govData.reportDate || m._govData.arrivalDate || 'Recent') + '</div>' : '');
    } else {
      priceBlockHtml = '    <div class="mpc-mandi-card__price" style="font-size:16px; color:#92400E;">Price unavailable</div>'
        + '    <div class="mpc-mandi-card__price-unit" style="color:#78350F;">No recent government report</div>';
    }

    return '<div class="mpc-mandi-card' + (isBestNet ? ' mpc-mandi-card--best-value' : '') + (isSelected ? ' mpc-mandi-card--selected' : '') + '" id="mandi-card-' + m.id + '">'
      + '<div class="mpc-mandi-card__top">'
      + '  <div class="mpc-mandi-card__badge-wrap">'
      + badge
      + (m._govData ? ' <span class="mpc-badge" style="background:#E5F0E7; color:#12372A; border:1px solid #8FCB9B;">✓ GOV DATA</span>' : '')
      + '  </div>'
      + '  <div class="mpc-mandi-card__weather"><i data-lucide="' + (w.icon || 'sun') + '"></i> ' + w.temp + '°C · ' + w.condition + '</div>'
      + '</div>'
      + '<div class="mpc-mandi-card__header">'
      + '  <div>'
      + '    <h3 class="mpc-mandi-card__name">' + m.name + '</h3>'
      + '    <div class="mpc-mandi-card__location"><i data-lucide="map-pin"></i> ' + m.city + ', ' + m.state + '</div>'
      + '  </div>'
      + '  <div class="mpc-mandi-card__price-block">'
      + priceBlockHtml
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
      + '    <span class="mpc-mandi-card__m-val">' + (m._hasPrice ? (mpcFmtINR(m._netPerQ) + '/q') : '—') + '</span>'
      + '  </div>'
      + '</div>'
      + '<div class="mpc-mandi-card__actions">'
      + '  <button class="btn btn--sm ' + (isSelected ? 'btn--secondary' : 'btn--primary') + '" onclick="mpcEngine.toggleMandiSelection(\'' + m.id + '\', ' + (!isSelected) + ')">'
      + (isSelected ? 'Remove Comparison' : 'Pin to Compare')
      + '  </button>'
      + '  <a href="https://www.google.com/maps/dir/?api=1&destination=' + m.lat + ',' + m.lng + '" target="_blank" class="btn btn--outline btn--sm" rel="noopener">'
      + '    <i data-lucide="navigation"></i> Route'
      + '  </a>'
      + '</div>'
      + '</div>';
  }).join('');

  grid.innerHTML = cardsHtml;
};

MandiCompare.prototype.renderChart = function () {
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
    var scatterData = list.map(function (m) {
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
          pointBackgroundColor: function (ctx) {
            var raw = ctx.raw;
            if (!raw) return '#0D4435';
            var maxN = Math.max.apply(null, list.map(function (x) { return x._netPerQ; }));
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
              title: function (items) {
                var p = items[0].raw;
                return p.mandi + ' (' + p.city + ')';
              },
              label: function (ctx) {
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
              callback: function (v) { return '₹' + Number(v).toLocaleString('en-IN'); }
            }
          }
        }
      }
    });
    return;
  }

  // 2. BAR CHARTS (Net Realization / Mandi Price / Transport Cost)
  var labels = chartItems.map(function (m) { return m.name.replace(' APMC', '').replace(' Mandi', ''); });
  var dataValues, datasetLabel, barColors;

  if (self.chartMode === 'net') {
    dataValues = chartItems.map(function (m) { return m._netPerQ; });
    datasetLabel = 'Net Realization (₹/q)';
    barColors = chartItems.map(function (m, i) { return i === 0 ? '#0D4435' : 'rgba(91, 154, 114, 0.85)'; });
  } else if (self.chartMode === 'price') {
    dataValues = chartItems.map(function (m) { return m._adjPrice; });
    datasetLabel = cropMeta.name + ' Price (₹/q)';
    barColors = chartItems.map(function (m, i) { return i === 0 ? '#D97706' : 'rgba(217, 119, 6, 0.75)'; });
  } else { // transport
    dataValues = chartItems.map(function (m) { return m._transportTotal; });
    datasetLabel = 'Total Freight Cost (₹) for ' + self.qty + 'q';
    barColors = chartItems.map(function (m, i) { return 'rgba(201, 109, 91, 0.85)'; });
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
            label: function (ctx) {
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
            callback: function (v) { return '₹' + Number(v).toLocaleString('en-IN'); }
          }
        }
      }
    }
  });
};

// ── Weather & Market Conditions Strip ───────────────────────────────────────
MandiCompare.prototype.renderWeatherStrip = function () {
  var wrap = document.getElementById('mpc-weather-strip');
  if (!wrap) return;

  var list = this.getProcessedList();
  // Display top 4 mandis or selected mandis
  var targetMandis = this.selected.length ?
    MPC_DATA.filter(function (m) { return this.selected.indexOf(m.id) !== -1; }.bind(this)) :
    list.slice(0, 4);

  if (!targetMandis.length) targetMandis = list.slice(0, 4);

  var html = targetMandis.map(function (m) {
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
MandiCompare.prototype.toggleMandiSelection = function (id, isAdd) {
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
MandiCompare.prototype.resetFilters = function () {
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

document.addEventListener('DOMContentLoaded', function () {
  mpcEngine = new MandiCompare();

  // Read mandis from URL params if present (e.g. Compare Chandigarh, Nashik and Lasalgaon)
  var params = new URLSearchParams(window.location.search);
  var urlMandis = params.get('mandis') || params.get('mandi');
  if (urlMandis) {
    var rawList = urlMandis.split(',').map(function(s){ return s.trim().toLowerCase(); });
    var matched = [];
    rawList.forEach(function(req) {
      var found = MPC_DATA.find(function(m) {
        return m.id.toLowerCase() === req || m.name.toLowerCase().indexOf(req) !== -1 || m.city.toLowerCase() === req;
      });
      if (found && matched.indexOf(found.id) === -1) {
        matched.push(found.id);
      }
    });
    if (matched.length) {
      mpcEngine.selected = matched;
    }
  }

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
