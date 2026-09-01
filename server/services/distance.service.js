/**
 * KRISHISHETRA — DISTANCE SERVICE
 * 
 * Calculates distance between farmer location and mandi.
 * 
 * Hierarchy:
 * 1. Road distance API (if DISTANCE_API_KEY configured) — labeled "Road Distance"
 * 2. Haversine formula (fallback) — labeled "Estimated (straight-line)"
 * 
 * Haversine result is NOT multiplied by a magic number and presented as road distance.
 * A configurable ROAD_DISTANCE_MULTIPLIER can be set in env for estimated adjustment,
 * but the result is always labeled as "Estimated".
 */

'use strict';

/**
 * Convert degrees to radians
 */
function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Calculate Haversine distance between two lat/lng points.
 * 
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate distance between farmer location and mandi.
 * 
 * @param {number} farmLat - Farmer latitude
 * @param {number} farmLon - Farmer longitude
 * @param {number} mandiLat - Mandi latitude
 * @param {number} mandiLon - Mandi longitude
 * @returns {{ distanceKm: number, distanceType: string, label: string }}
 */
function calculateDistance(farmLat, farmLon, mandiLat, mandiLon) {
  // Validate coordinates
  if (
    farmLat == null || farmLon == null || mandiLat == null || mandiLon == null ||
    Math.abs(farmLat) > 90 || Math.abs(mandiLat) > 90 ||
    Math.abs(farmLon) > 180 || Math.abs(mandiLon) > 180
  ) {
    return {
      distanceKm: 0,
      distanceType: 'invalid',
      label: 'Invalid coordinates'
    };
  }

  // TODO: If DISTANCE_API_KEY is configured, call road distance API here
  // const apiKey = process.env.DISTANCE_API_KEY;
  // if (apiKey) { ... return { distanceKm, distanceType: 'road_api', label: 'Road Distance' } }

  // Fallback: Haversine formula
  const haversineKm = haversineDistance(farmLat, farmLon, mandiLat, mandiLon);

  // Optional: configurable road multiplier for estimated road adjustment
  const multiplier = parseFloat(process.env.ROAD_DISTANCE_MULTIPLIER) || 1.0;

  if (multiplier !== 1.0) {
    return {
      distanceKm: Math.round(haversineKm * multiplier * 10) / 10,
      distanceType: 'haversine_adjusted',
      label: `Estimated (adjusted ×${multiplier})`
    };
  }

  return {
    distanceKm: Math.round(haversineKm * 10) / 10,
    distanceType: 'haversine_estimate',
    label: 'Estimated (straight-line)'
  };
}

module.exports = {
  calculateDistance,
  haversineDistance
};
