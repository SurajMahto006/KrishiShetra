# KrishiShetra — GPS & Maps System

## Overview
The GPS system in KrishiShetra helps farmers locate the nearest APMC mandis across India, get real-time crop prices, and navigate to the best market for their crops.

---

## Files

| File | Purpose |
|------|---------|
| `js/mandi-map.js` | Core GPS map engine (Leaflet + OpenStreetMap) |
| `css/mandi-map.css` | Map UI styles — markers, popups, filter bar |
| `dashboard.html` | Farmer dashboard with embedded GPS map section |
| `js/mandi-compare.js` | Price comparison using mandi GPS distances |
| `mandi-compare.html` | Mandi Price Comparison page |

---

## GPS Features

### 1. Live Location Detection
- Browser GPS via `navigator.geolocation`
- Validates coordinates are within India (6.5°N–36°N, 68°E–97.5°E)
- Falls back to manual city picker if GPS is denied
- Blue pulsing dot shows user's location on map

### 2. Mandi Map (Leaflet + OpenStreetMap)
- 45+ APMC mandis plotted with real GPS coordinates
- OpenStreetMap tiles — zero API key, always works
- Marker clustering at zoom-out (groups nearby mandis)
- Click any marker → popup with price, demand, arrivals
- "Best nearby" mandi shown with 🏆 gold marker

### 3. Radius Filtering
- 10 km / 25 km / 50 km / 100 km / 250 km / All India
- Auto-switches to 50 km radius once GPS location is set
- Haversine formula for accurate distance calculation

### 4. Distance-Based Price Comparison
- Transport cost = `distance × quantity × ₹20/km`
- Net earnings = gross price × qty − transport cost
- Shows which mandi is actually most profitable after travel

### 5. Google Maps Navigation
- "Directions" button on every mandi card
- Opens Google Maps with driving directions to selected mandi

---

## GPS Coordinates — Sample Mandis

| Mandi | Lat | Lng |
|-------|-----|-----|
| Pune APMC | 18.4901 | 73.8679 |
| Mumbai APMC (Vashi) | 19.0734 | 73.0039 |
| Nashik APMC | 20.0125 | 73.7915 |
| Indore Mandi | 22.7196 | 75.8577 |
| Bengaluru APMC | 13.0189 | 77.5456 |
| Hyderabad APMC | 17.3850 | 78.4867 |
| Chennai Koyambedu | 13.0694 | 80.1948 |
| Kolkata Mandi | 22.5726 | 88.3639 |

---

## How Haversine Distance Works

```js
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2
          + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180)
          * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

---

## How to Use

1. Open `http://localhost:3000/dashboard.html`
2. Scroll to **"Nearby Mandis (India)"** section
3. Click **"My Location"** button → allow browser GPS
4. Map zooms to your location, shows nearest mandis
5. Use radius buttons (10/25/50/100 km) to filter
6. Click any mandi marker → see prices + get directions
7. For price comparison → click **"Compare Now"** card

---

## Connecting Real GPS/Mandi Price API

Replace the `MANDI_MAP_DATA` array in `js/mandi-map.js` with:

```js
fetch('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070')
  .then(res => res.json())
  .then(data => {
    MANDI_MAP_DATA = data.records.map(r => ({
      id: r.state + '-' + r.district,
      name: r.market,
      state: r.state,
      district: r.district,
      lat: r.latitude,   // add GPS coords from geocoding API
      lng: r.longitude,
      prices: { [r.commodity.toLowerCase()]: parseFloat(r.modal_price) },
      demand: { [r.commodity.toLowerCase()]: 'medium' }
    }));
    mandiMapEngine.refresh();
  });
```

> **API Source**: [data.gov.in — Agmarknet Daily Mandi Prices](https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi)
