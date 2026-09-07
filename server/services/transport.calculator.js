/**
 * KRISHISHETRA — TRANSPORT CALCULATOR
 * 
 * Calculates number of trips and transport cost based on
 * quantity, vehicle capacity, distance, and configurable rate type.
 */

'use strict';

const { calculateExpense, formatINR } = require('./expense.calculator');

// Default vehicle configurations
const VEHICLE_DEFAULTS = {
  tractor_trolley: { capacity: 25, label: 'Tractor Trolley' },
  mini_truck: { capacity: 35, label: 'Mini Truck' },
  truck: { capacity: 50, label: 'Truck (Standard)' },
  large_truck: { capacity: 100, label: 'Large Truck' }
};

/**
 * Calculate number of trips required.
 * 
 * @param {number} quantity - Total quantity in quintals
 * @param {number} vehicleCapacity - Vehicle capacity in quintals
 * @returns {number} Number of trips (ceiling)
 */
function calculateTrips(quantity, vehicleCapacity) {
  if (!quantity || quantity <= 0) return 0;
  if (!vehicleCapacity || vehicleCapacity <= 0) return 1;
  return Math.ceil(quantity / vehicleCapacity);
}

/**
 * Calculate full transport cost with breakdown.
 * 
 * @param {object} params
 * @param {number} params.quantity - Quantity in quintals
 * @param {number} params.distance - Distance in km
 * @param {string} params.vehicleType - Vehicle type key
 * @param {number} [params.vehicleCapacity] - Override vehicle capacity
 * @param {number} [params.transportRate] - Override transport rate
 * @param {string} [params.transportRateType] - Rate type from mandi config
 * @param {number} [params.defaultRate] - Default rate from mandi config
 * @param {string} [params.defaultRateType] - Default rate type from mandi config
 * @returns {{ trips: number, cost: object, vehicleType: string, vehicleCapacity: number }}
 */
function calculateTransport(params) {
  const {
    quantity,
    distance,
    vehicleType = 'truck',
    vehicleCapacity: overrideCapacity,
    transportRate: overrideRate,
    transportRateType: overrideRateType,
    defaultRate = 60,
    defaultRateType = 'per_km_per_trip'
  } = params;

  // Determine vehicle capacity
  const vehicleConfig = VEHICLE_DEFAULTS[vehicleType] || VEHICLE_DEFAULTS.truck;
  const capacity = overrideCapacity || vehicleConfig.capacity;

  // Calculate trips
  const trips = calculateTrips(quantity, capacity);

  // Determine rate and type
  const rate = overrideRate != null ? overrideRate : defaultRate;
  const rateType = overrideRateType || defaultRateType;

  // Calculate cost using the expense calculator
  const isDefault = overrideRate == null;
  const cost = calculateExpense(rateType, rate, {
    quantity,
    distance,
    trips
  }, isDefault ? 'default' : undefined);

  return {
    trips,
    cost,
    vehicleType,
    vehicleCapacity: capacity,
    vehicleLabel: vehicleConfig.label
  };
}

/**
 * Get available vehicle types.
 */
function getVehicleTypes() {
  return Object.entries(VEHICLE_DEFAULTS).map(([key, config]) => ({
    value: key,
    label: config.label,
    capacity: config.capacity
  }));
}

module.exports = {
  calculateTrips,
  calculateTransport,
  getVehicleTypes,
  VEHICLE_DEFAULTS
};
