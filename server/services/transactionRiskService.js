const crypto = require('crypto');

/**
 * @title TransactionRiskService
 * @notice Baseline heuristic risk evaluation and explainability engine for KrishiShetra orders.
 * @dev NOTE: This engine employs a transparent, rules-based heuristic scoring model with
 * factor attribution. It is explicitly NOT a black-box or trained ML model.
 * Missing data or unverified features are treated neutrally and NEVER automatically labeled as fraudulent.
 */

// Canonical baseline pricing guide (INR per quintal estimate for heuristic checks)
const BASELINE_PRICE_RANGES_PER_QUINTAL = {
  tomato: { min: 800, max: 6000 },
  onion: { min: 1000, max: 5000 },
  potato: { min: 800, max: 3500 },
  wheat: { min: 2000, max: 4000 },
  rice: { min: 2200, max: 5500 },
  soybean: { min: 3500, max: 7000 },
  cotton: { min: 5500, max: 9500 }
};

/**
 * Convert quantity and price to quintal standard for heuristic normalization
 */
function normalizeToQuintal(price, priceUnit) {
  const unit = String(priceUnit || 'quintal').toLowerCase().trim();
  if (unit === 'kg') return price * 100;
  if (unit === 'ton' || unit === 'tonne') return price / 10;
  return price; // default quintal
}

/**
 * Generate canonical non-sensitive payload object from an Order document
 */
function extractCanonicalPayload(order) {
  return {
    orderId: String(order.orderId || '').trim(),
    cropName: String(order.cropName || '').trim(),
    variety: String(order.variety || '').trim(),
    quantity: Number(order.quantity || 0),
    quantityUnit: String(order.quantityUnit || '').trim(),
    agreedPrice: Number(order.agreedPrice || 0),
    priceUnit: String(order.priceUnit || '').trim(),
    totalAmount: Number(order.totalAmount || 0),
    status: String(order.status || 'pending').trim(),
    paymentStatus: String(order.paymentStatus || 'pending').trim(),
    paymentMethod: String(order.paymentMethod || 'cod').trim(),
    eventTimestamp: order.updatedAt ? new Date(order.updatedAt) : new Date(order.createdAt || Date.now())
  };
}

/**
 * Compute SHA-256 hash of canonical payload as a 0x-prefixed 32-byte hex string
 */
function computeCanonicalHash(payload) {
  // Deterministic JSON serialization with sorted keys
  const sortedKeys = Object.keys(payload).sort();
  const canonicalObj = {};
  for (const key of sortedKeys) {
    const val = payload[key];
    canonicalObj[key] = val instanceof Date ? val.toISOString() : val;
  }
  const serialized = JSON.stringify(canonicalObj);
  const hash = crypto.createHash('sha256').update(serialized).digest('hex');
  return `0x${hash}`;
}

/**
 * Evaluate order transaction risk and provide human-readable factor attribution
 * @param {Object} order The Order document or raw object
 * @param {String} eventType Contextual event (ORDER_CREATED, STATUS_UPDATED, etc.)
 * @returns {Object} { score, level, factors, riskHash, assessedAt, engine }
 */
function evaluateTransactionRisk(order, eventType = 'ORDER_CREATED') {
  const factors = [];
  let score = 20; // Baseline neutral confidence score

  const cropKey = String(order.cropName || '').toLowerCase().trim();
  const normalizedQuintalPrice = normalizeToQuintal(order.agreedPrice, order.priceUnit);
  const totalAmount = Number(order.totalAmount || 0);
  const paymentMethod = String(order.paymentMethod || 'cod').toLowerCase();
  const paymentStatus = String(order.paymentStatus || 'pending').toLowerCase();
  const status = String(order.status || 'pending').toLowerCase();

  // 1. Commodity Price Sanity & Deviation Factor
  if (BASELINE_PRICE_RANGES_PER_QUINTAL[cropKey]) {
    const range = BASELINE_PRICE_RANGES_PER_QUINTAL[cropKey];
    if (normalizedQuintalPrice < range.min * 0.4) {
      score += 25;
      factors.push({
        code: 'PRICE_DEVIATION_EXTREME_LOW',
        weight: 25,
        impact: 'INCREASES_RISK',
        description: `Agreed price (₹${normalizedQuintalPrice}/qtl) is significantly below historical baseline for ${order.cropName} (Min ₹${range.min}). Potential distress sale or misquoted unit.`
      });
    } else if (normalizedQuintalPrice > range.max * 2.2) {
      score += 25;
      factors.push({
        code: 'PRICE_DEVIATION_EXTREME_HIGH',
        weight: 25,
        impact: 'INCREASES_RISK',
        description: `Agreed price (₹${normalizedQuintalPrice}/qtl) is over 120% above standard baseline for ${order.cropName} (Max ₹${range.max}). Potential collateral inflation or misquoted unit.`
      });
    } else {
      score -= 10;
      factors.push({
        code: 'PRICE_WITHIN_EXPECTED_BENCHMARK',
        weight: -10,
        impact: 'DECREASES_RISK',
        description: `Agreed unit price aligns with historical market ranges for ${order.cropName}.`
      });
    }
  } else {
    factors.push({
      code: 'UNBENCHMARKED_COMMODITY',
      weight: 0,
      impact: 'NEUTRAL',
      description: `Specific historical baseline for '${order.cropName || 'Unspecified'}' is not cached; evaluated neutrally.`
    });
  }

  // 2. High Financial Value vs Uncollateralized Payment Method
  if (totalAmount > 100000 && (paymentMethod === 'cod' || paymentMethod === 'offline')) {
    score += 20;
    factors.push({
      code: 'HIGH_VALUE_UNCOLLATERALIZED',
      weight: 20,
      impact: 'INCREASES_RISK',
      description: `High financial order value (₹${totalAmount.toLocaleString('en-IN')}) using '${paymentMethod.toUpperCase()}' payment terms without digital escrow commitment.`
    });
  } else if (paymentMethod === 'online' || paymentStatus === 'paid') {
    score -= 10;
    factors.push({
      code: 'SECURED_PAYMENT_METHOD',
      weight: -10,
      impact: 'DECREASES_RISK',
      description: `Payment modality is digital/pre-authorized or already paid.`
    });
  }

  // 3. Mathematical Consistency (Quantity x Agreed Price vs Total Amount)
  const expectedTotal = Number((order.agreedPrice * order.quantity).toFixed(2));
  const diff = Math.abs(expectedTotal - totalAmount);
  if (diff > 5) {
    score += 35;
    factors.push({
      code: 'ARITHMETIC_INCONSISTENCY',
      weight: 35,
      impact: 'INCREASES_RISK',
      description: `Total amount (₹${totalAmount}) deviates from calculated product of quantity and agreed price (₹${expectedTotal}).`
    });
  } else {
    factors.push({
      code: 'ARITHMETIC_VALIDATED',
      weight: 0,
      impact: 'NEUTRAL',
      description: 'Order price and quantity arithmetic strictly reconciles.'
    });
  }

  // 4. Lifecycle Transition & Cancellation Risk Indicators
  if (eventType === 'CANCELLED' || status === 'cancelled') {
    score += 15;
    factors.push({
      code: 'ORDER_LIFECYCLE_CANCELLED',
      weight: 15,
      impact: 'INCREASES_RISK',
      description: 'Order was marked as cancelled during lifecycle execution.'
    });
  } else if (status === 'delivered' && paymentStatus === 'paid') {
    score -= 15;
    factors.push({
      code: 'FULFILLED_AND_SETTLED',
      weight: -15,
      impact: 'DECREASES_RISK',
      description: 'Order successfully delivered and settled.'
    });
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine categorical level
  let level = 'LOW';
  if (score >= 70) {
    level = 'HIGH';
  } else if (score >= 40) {
    level = 'MEDIUM';
  }

  // Compute deterministic riskHash
  const riskFingerprint = JSON.stringify({
    orderId: order.orderId,
    eventType,
    score,
    level,
    factors: factors.map(f => ({ c: f.code, w: f.weight }))
  });
  const riskHash = `0x${crypto.createHash('sha256').update(riskFingerprint).digest('hex')}`;

  return {
    engine: 'EXPLAINABLE_HEURISTIC_BASELINE_V1',
    score,
    level,
    factors,
    riskHash,
    assessedAt: new Date()
  };
}

module.exports = {
  extractCanonicalPayload,
  computeCanonicalHash,
  evaluateTransactionRisk
};
