/**
 * KRISHISHETRA — MANDI PROFITABILITY & DECISION SYSTEM TEST SUITE
 * 
 * Tests:
 * 1. Test Case 1: Mandi with higher selling price is recommended when Net Profit is higher
 * 2. Test Case 2: Mandi with LOWER selling price is recommended when Net Profit is higher
 *    (Proves optimization target is Net Profit, NOT selling price)
 * 3. Test Case 3: Nearby buyer beats all mandis -> Decision is "STAY WITH NEARBY BUYER"
 * 4. Test Case 4: Break-even selling price calculation with percentage-based commission
 * 5. Test Case 5: Accurate distance calculation using Haversine formula
 */

'use strict';

const assert = require('assert');
const { calculateMandiProfit, calculateNearbyBuyerProfit, calculateBreakEven } = require('../services/profit.calculator');
const { calculateDistance } = require('../services/distance.service');
const { calculateTrips } = require('../services/transport.calculator');
const { analyzeAllMandis } = require('../services/mandi.ranker');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

console.log('\n=============================================================');
console.log('🌾 RUNNING KRISHISHETRA PROFIT ENGINE AUTOMATED TESTS');
console.log('=============================================================\n');

// ── TEST 1: Higher Price Mandi Wins when Net Profit is Higher ──
runTest('Test 1: Mandi B (higher price & profit) is recommended over Mandi A', () => {
  const quantity = 100; // quintals

  // Mandi A: Price = ₹2,900, Total Cost = ₹15,000
  // Revenue = 100 * 2900 = ₹2,90,000; Profit = 290000 - 15000 = ₹2,75,000
  const mandiA_rev = 2900 * quantity;
  const mandiA_cost = 15000;
  const mandiA_profit = mandiA_rev - mandiA_cost;

  // Mandi B: Price = ₹3,500, Total Cost = ₹40,000
  // Revenue = 100 * 3500 = ₹3,50,000; Profit = 350000 - 40000 = ₹3,10,000
  const mandiB_rev = 3500 * quantity;
  const mandiB_cost = 40000;
  const mandiB_profit = mandiB_rev - mandiB_cost;

  assert.strictEqual(mandiA_profit, 275000, 'Mandi A profit should be ₹2,75,000');
  assert.strictEqual(mandiB_profit, 310000, 'Mandi B profit should be ₹3,10,000');

  const additionalProfit = mandiB_profit - mandiA_profit;
  assert.strictEqual(additionalProfit, 35000, 'Additional profit should be ₹35,000');

  // Test through ranker
  const mandis = [
    { id: 'mandi_a', name: 'Mandi A', district: 'Pune', state: 'MH', latitude: 18.5, longitude: 73.8, expenseConfig: { transportRate: 0, labourRate: 15000, commissionRate: 0, fixedMandiCharge: 0, loadingRate: 0, unloadingRate: 0 } },
    { id: 'mandi_b', name: 'Mandi B', district: 'Nashik', state: 'MH', latitude: 20.0, longitude: 73.8, expenseConfig: { transportRate: 0, labourRate: 40000, commissionRate: 0, fixedMandiCharge: 0, loadingRate: 0, unloadingRate: 0 } }
  ];

  const prices = {
    mandi_a: { predictedPrice: 2900, dataSource: 'ml_prediction', dataSourceLabel: 'ML' },
    mandi_b: { predictedPrice: 3500, dataSource: 'ml_prediction', dataSourceLabel: 'ML' }
  };

  const result = analyzeAllMandis({
    mandis,
    prices,
    quantity,
    farmLocation: { latitude: 18.5, longitude: 73.8 },
    nearbyBuyerPrice: null,
    farmerOverrides: {}
  });

  assert.strictEqual(result.recommended.name, 'Mandi B', 'Recommended mandi must be Mandi B');
  assert.strictEqual(result.recommended.netProfit, 310000, 'Mandi B profit must be ₹3,10,000');
  assert.strictEqual(result.comparison[0].name, 'Mandi B', 'Rank 1 must be Mandi B');
  assert.strictEqual(result.comparison[1].name, 'Mandi A', 'Rank 2 must be Mandi A');
});

// ── TEST 2: Lower Price Mandi Wins when Net Profit is Higher ──
runTest('Test 2: Mandi A (LOWER price ₹3,000) beats Mandi B (HIGHER price ₹3,600) due to lower expenses', () => {
  const quantity = 100; // quintals

  // Mandi A: Price = ₹3,000, Total Cost = ₹10,000 -> Revenue = ₹3,00,000, Profit = ₹2,90,000
  // Mandi B: Price = ₹3,600, Total Cost = ₹80,000 -> Revenue = ₹3,60,000, Profit = ₹2,80,000

  const mandis = [
    { id: 'mandi_a', name: 'Mandi A', district: 'Pune', state: 'MH', latitude: 18.5, longitude: 73.8, expenseConfig: { transportRate: 0, labourRate: 10000, commissionRate: 0, fixedMandiCharge: 0, loadingRate: 0, unloadingRate: 0 } },
    { id: 'mandi_b', name: 'Mandi B', district: 'Nagpur', state: 'MH', latitude: 21.1, longitude: 79.0, expenseConfig: { transportRate: 0, labourRate: 80000, commissionRate: 0, fixedMandiCharge: 0, loadingRate: 0, unloadingRate: 0 } }
  ];

  const prices = {
    mandi_a: { predictedPrice: 3000, dataSource: 'ml_prediction', dataSourceLabel: 'ML' },
    mandi_b: { predictedPrice: 3600, dataSource: 'ml_prediction', dataSourceLabel: 'ML' }
  };

  const result = analyzeAllMandis({
    mandis,
    prices,
    quantity,
    farmLocation: { latitude: 18.5, longitude: 73.8 },
    nearbyBuyerPrice: null,
    farmerOverrides: {}
  });

  // System MUST recommend Mandi A (Profit ₹2,90,000 > ₹2,80,000) even though Mandi B has higher selling price
  assert.strictEqual(result.recommended.name, 'Mandi A', 'System must recommend Mandi A because net profit is higher');
  assert.strictEqual(result.recommended.netProfit, 290000, 'Recommended profit must be ₹2,90,000');
  assert.strictEqual(result.comparison[0].name, 'Mandi A', 'Rank 1 must be Mandi A');
  assert.strictEqual(result.comparison[1].name, 'Mandi B', 'Rank 2 must be Mandi B');
});

// ── TEST 3: Nearby Buyer Beats All Mandis (STAY Decision) ──
runTest('Test 3: Nearby Buyer beats distant mandis -> Decision is STAY WITH NEARBY BUYER', () => {
  const quantity = 100;
  const nearbyBuyerPrice = 3200; // Revenue: 3,20,000 - 2,000 (loading) = 3,18,000 profit

  const mandis = [
    { id: 'distant_mandi', name: 'Distant Mandi', district: 'Nagpur', state: 'MH', latitude: 21.1, longitude: 79.0, expenseConfig: { transportRate: 0, labourRate: 50000, commissionRate: 0, fixedMandiCharge: 0, loadingRate: 0, unloadingRate: 0 } }
  ];

  const prices = {
    distant_mandi: { predictedPrice: 3500, dataSource: 'ml_prediction', dataSourceLabel: 'ML' } // Revenue: 3,50,000 - 50,000 = 3,00,000 profit
  };

  const result = analyzeAllMandis({
    mandis,
    prices,
    quantity,
    farmLocation: { latitude: 18.5, longitude: 73.8 },
    nearbyBuyerPrice,
    farmerOverrides: {}
  });

  assert.strictEqual(result.decision, 'STAY_WITH_BUYER', 'Decision must be STAY_WITH_BUYER');
  assert.strictEqual(result.recommended.isNearbyBuyer, true, 'Recommended option must be the nearby buyer');
  assert.strictEqual(result.recommended.netProfit, 318000, 'Nearby buyer profit must be ₹3,18,000');
  assert.strictEqual(result.comparison[0].name, 'Nearby Buyer', 'Rank 1 must be Nearby Buyer');
  assert.strictEqual(result.comparison[1].name, 'Distant Mandi', 'Rank 2 must be Distant Mandi');
});

// ── TEST 4: Break-Even Selling Price with Percentage Commission ──
runTest('Test 4: Break-even selling price calculated algebraically with percentage commission', () => {
  const comparisonProfit = 288000;
  const quantity = 100;
  const commissionRate = 0.02; // 2%
  const fixedCosts = 33440;

  // Formula: breakEvenPrice = (comparisonProfit + fixedCosts) / (quantity * (1 - commissionRate))
  // (288000 + 33440) / (100 * 0.98) = 321440 / 98 = 3280.00
  const breakdown = {
    transport: { value: 25440 },
    labour: { value: 4000 },
    loading: { value: 2000 },
    unloading: { value: 1500 },
    mandiCharge: { value: 500 },
    packaging: { value: 0 },
    otherExpenses: { value: 0 },
    commission: { value: 7100, type: 'percentage' }
  };

  const result = calculateBreakEven({
    comparisonProfit,
    breakdown,
    quantity,
    commissionType: 'percentage',
    commissionRate
  });

  assert.strictEqual(result.breakEvenPrice, 3280, 'Break-even price must be exactly ₹3,280/qtl');

  // Verify that selling at breakEvenPrice yields exactly the comparisonProfit
  const revenueAtBreakEven = 3280 * quantity; // 3,28,000
  const commAtBreakEven = revenueAtBreakEven * commissionRate; // 6,560
  const totalCostAtBreakEven = fixedCosts + commAtBreakEven; // 40,000
  const profitAtBreakEven = revenueAtBreakEven - totalCostAtBreakEven; // 2,88,000
  assert.strictEqual(profitAtBreakEven, comparisonProfit, 'Profit at break-even price must equal comparison profit');
});

// ── TEST 5: Accurate Distance Calculation (Haversine) ──
runTest('Test 5: Haversine distance between Pune and Nashik APMC is ~167 km', () => {
  const puneLat = 18.4975, puneLon = 73.8682;
  const nashikLat = 20.0110, nashikLon = 73.7903;

  const result = calculateDistance(puneLat, puneLon, nashikLat, nashikLon);

  assert.ok(result.distanceKm >= 160 && result.distanceKm <= 175, `Distance (${result.distanceKm} km) should be between 160 and 175 km`);
  assert.strictEqual(result.distanceType, 'haversine_estimate', 'Distance type must be labeled haversine_estimate');
  assert.ok(result.label.includes('Estimated'), 'Label must clearly state Estimated');
});

// ── TEST 6: Vehicle Trip Calculation ──
runTest('Test 6: Trip calculation uses CEILING correctly', () => {
  assert.strictEqual(calculateTrips(100, 50), 2, '100 quintals in 50 capacity vehicle = 2 trips');
  assert.strictEqual(calculateTrips(105, 50), 3, '105 quintals in 50 capacity vehicle = 3 trips');
  assert.strictEqual(calculateTrips(50, 50), 1, '50 quintals in 50 capacity vehicle = 1 trip');
  assert.strictEqual(calculateTrips(1, 50), 1, '1 quintal in 50 capacity vehicle = 1 trip');
});

console.log('\n=============================================================');
console.log(`🎉 TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('=============================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
