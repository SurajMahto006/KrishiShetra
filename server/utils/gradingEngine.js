/**
 * KRISHISHETRA — AGMARK & e-NAM OBJECTIVE QUALITY GRADING ENGINE
 * Standards based on Directorate of Marketing & Inspection (DMI), Ministry of Agriculture & Farmers Welfare,
 * Government of India & e-NAM (National Agriculture Market) Assaying Rules.
 */

// Agmark & e-NAM Standard Thresholds per crop type
const CROP_STANDARDS = {
  // Grains & Cereals (Wheat, Paddy, Rice, Maize, Barley, Millets, Pulses)
  grains: {
    // Standard limits for Wheat (Triticum aestivum)
    wheat: {
      moistureMax: { gradeA: 12.0, gradeB: 14.0 },      // % by weight
      foreignMatterMax: { gradeA: 1.0, gradeB: 2.0 },   // % by weight (organic + inorganic)
      brokenGrainsMax: { gradeA: 2.0, gradeB: 4.0 },    // % by weight
      damagedGrainsMax: { gradeA: 1.5, gradeB: 3.0 },   // % by weight (discolored, weeviled, immature)
      minimumHectolitreWeight: 76                       // kg/hL (standard bold)
    },
    // Standard limits for Paddy / Rice (Oryza sativa)
    paddy: {
      moistureMax: { gradeA: 13.0, gradeB: 15.0 },
      foreignMatterMax: { gradeA: 1.0, gradeB: 2.5 },
      brokenGrainsMax: { gradeA: 4.0, gradeB: 8.0 },
      damagedGrainsMax: { gradeA: 1.5, gradeB: 3.5 }
    },
    // Default fallback for any cereal / grain / pulse
    default: {
      moistureMax: { gradeA: 12.5, gradeB: 14.5 },
      foreignMatterMax: { gradeA: 1.0, gradeB: 2.0 },
      brokenGrainsMax: { gradeA: 3.0, gradeB: 6.0 },
      damagedGrainsMax: { gradeA: 2.0, gradeB: 4.0 }
    }
  },

  // Fruits & Vegetables (Horticulture)
  horticulture: {
    // Standard limits for Onions (Allium cepa)
    onion: {
      blemishMax: { gradeA: 3.0, gradeB: 7.0 },         // % surface defects / bottlenecks / sun-scald
      uniformityMin: { gradeA: 90, gradeB: 75 },        // % size consistency
      ripenessMin: { gradeA: 85, gradeB: 70 },          // % curing & dryness index
      optimumDiameterMm: { min: 45, max: 75 }           // standard export/FAQ grade
    },
    // Standard limits for Tomatoes (Solanum lycopersicum)
    tomato: {
      blemishMax: { gradeA: 2.5, gradeB: 6.0 },         // % skin cracks, cat-facing, blotch
      uniformityMin: { gradeA: 92, gradeB: 80 },        // % uniform shape & weight
      ripenessMin: { gradeA: 85, gradeB: 70 },          // Color/Firmness index
      optimumDiameterMm: { min: 50, max: 80 }
    },
    // Default fallback for fruits & vegetables
    default: {
      blemishMax: { gradeA: 3.0, gradeB: 7.0 },
      uniformityMin: { gradeA: 90, gradeB: 75 },
      ripenessMin: { gradeA: 85, gradeB: 70 }
    }
  }
};

/**
 * Determine whether a crop belongs to Grains/Cereals/Pulses or Horticulture (Fruits/Vegetables)
 */
function getCropCategory(cropName = '') {
  const norm = String(cropName).trim().toLowerCase();
  const grainKeywords = ['wheat', 'paddy', 'rice', 'maize', 'corn', 'barley', 'jowar', 'bajra', 'millet', 'dal', 'pulse', 'gram', 'soybean', 'moong', 'urad', 'chana'];
  const isGrain = grainKeywords.some(kw => norm.includes(kw));
  if (isGrain) return 'cereals_grains';

  const hortiKeywords = ['onion', 'tomato', 'potato', 'banana', 'mango', 'apple', 'grape', 'citrus', 'orange', 'chilli', 'garlic', 'ginger', 'brinjal', 'cabbage', 'cauliflower'];
  const isHorti = hortiKeywords.some(kw => norm.includes(kw));
  if (isHorti) return 'fruits_vegetables';

  return 'cereals_grains';
}

/**
 * Calculate Agmark / e-NAM Quality Grade and detailed parametric evaluation
 * @param {string} cropName - Name of the crop (e.g., 'Wheat', 'Onion')
 * @param {object} params - Parametric measurements
 * @returns {object} { grade: 'A'|'B'|'C', gradeLabel: string, parameters: object, rationales: string[], isAgmarkCompliant: boolean }
 */
function evaluateAgmarkGrade(cropName, params = {}) {
  const category = getCropCategory(cropName);
  const cropKey = String(cropName).trim().toLowerCase();

  const rationales = [];
  let evaluatedGrade = 'A'; // Start optimistic and demote if parameters exceed limits

  if (category === 'cereals_grains') {
    const std = CROP_STANDARDS.grains[cropKey] || CROP_STANDARDS.grains.default;

    const moisture = params.moistureContent !== undefined && params.moistureContent !== '' && params.moistureContent !== null ? Number(params.moistureContent) : null;
    const foreign = params.foreignMatter !== undefined && params.foreignMatter !== '' && params.foreignMatter !== null ? Number(params.foreignMatter) : null;
    const broken = params.brokenGrains !== undefined && params.brokenGrains !== '' && params.brokenGrains !== null ? Number(params.brokenGrains) : null;
    const damaged = params.damagedGrains !== undefined && params.damagedGrains !== '' && params.damagedGrains !== null ? Number(params.damagedGrains) : null;

    const evalParams = {
      moistureContent: {
        value: moisture,
        unit: '%',
        benchmarkA: `<= ${std.moistureMax.gradeA}%`,
        benchmarkB: `<= ${std.moistureMax.gradeB}%`,
        status: 'N/A'
      },
      foreignMatter: {
        value: foreign,
        unit: '%',
        benchmarkA: `<= ${std.foreignMatterMax.gradeA}%`,
        benchmarkB: `<= ${std.foreignMatterMax.gradeB}%`,
        status: 'N/A'
      },
      brokenGrains: {
        value: broken,
        unit: '%',
        benchmarkA: `<= ${std.brokenGrainsMax.gradeA}%`,
        benchmarkB: `<= ${std.brokenGrainsMax.gradeB}%`,
        status: 'N/A'
      },
      damagedGrains: {
        value: damaged,
        unit: '%',
        benchmarkA: `<= ${std.damagedGrainsMax.gradeA}%`,
        benchmarkB: `<= ${std.damagedGrainsMax.gradeB}%`,
        status: 'N/A'
      }
    };

    // Evaluate Moisture
    if (moisture !== null && !isNaN(moisture)) {
      if (moisture <= std.moistureMax.gradeA) {
        evalParams.moistureContent.status = 'PASS';
      } else if (moisture <= std.moistureMax.gradeB) {
        evalParams.moistureContent.status = 'FAQ_STANDARD';
        if (evaluatedGrade === 'A') evaluatedGrade = 'B';
        rationales.push(`Moisture (${moisture}%) exceeds Grade A max (${std.moistureMax.gradeA}%), within Grade B limit.`);
      } else {
        evalParams.moistureContent.status = 'FAIL';
        evaluatedGrade = 'C';
        rationales.push(`Moisture (${moisture}%) exceeds safe Grade B threshold (${std.moistureMax.gradeB}%). High risk of spoilage.`);
      }
    }

    // Evaluate Foreign Matter
    if (foreign !== null && !isNaN(foreign)) {
      if (foreign <= std.foreignMatterMax.gradeA) {
        evalParams.foreignMatter.status = 'PASS';
      } else if (foreign <= std.foreignMatterMax.gradeB) {
        evalParams.foreignMatter.status = 'FAQ_STANDARD';
        if (evaluatedGrade === 'A') evaluatedGrade = 'B';
        rationales.push(`Foreign matter (${foreign}%) exceeds Grade A max (${std.foreignMatterMax.gradeA}%).`);
      } else {
        evalParams.foreignMatter.status = 'FAIL';
        evaluatedGrade = 'C';
        rationales.push(`Foreign matter (${foreign}%) exceeds Grade B threshold (${std.foreignMatterMax.gradeB}%). Machine cleaning required.`);
      }
    }

    // Evaluate Broken Grains
    if (broken !== null && !isNaN(broken)) {
      if (broken <= std.brokenGrainsMax.gradeA) {
        evalParams.brokenGrains.status = 'PASS';
      } else if (broken <= std.brokenGrainsMax.gradeB) {
        evalParams.brokenGrains.status = 'FAQ_STANDARD';
        if (evaluatedGrade === 'A') evaluatedGrade = 'B';
        rationales.push(`Broken grains (${broken}%) exceeds Grade A max (${std.brokenGrainsMax.gradeA}%).`);
      } else {
        evalParams.brokenGrains.status = 'FAIL';
        evaluatedGrade = 'C';
        rationales.push(`Broken grains (${broken}%) exceeds FAQ Grade B limit.`);
      }
    }

    // Evaluate Damaged Grains
    if (damaged !== null && !isNaN(damaged)) {
      if (damaged <= std.damagedGrainsMax.gradeA) {
        evalParams.damagedGrains.status = 'PASS';
      } else if (damaged <= std.damagedGrainsMax.gradeB) {
        evalParams.damagedGrains.status = 'FAQ_STANDARD';
        if (evaluatedGrade === 'A') evaluatedGrade = 'B';
        rationales.push(`Damaged grains (${damaged}%) exceeds Grade A max (${std.damagedGrainsMax.gradeA}%).`);
      } else {
        evalParams.damagedGrains.status = 'FAIL';
        evaluatedGrade = 'C';
        rationales.push(`Damaged grains (${damaged}%) exceeds Grade B threshold.`);
      }
    }

    const gradeLabels = {
      A: 'Grade A (Agmark Premium FAQ)',
      B: 'Grade B (Fair Average Quality - FAQ)',
      C: 'Grade C (Under-grade / Distressed)'
    };

    return {
      category,
      grade: evaluatedGrade,
      gradeLabel: gradeLabels[evaluatedGrade],
      standard: 'Agmark / e-NAM Grain Standards (IS:14811)',
      parameters: evalParams,
      rationales: rationales.length > 0 ? rationales : ['All physical parameters meet Grade A Agmark export/milled benchmarks.'],
      isAgmarkCompliant: evaluatedGrade !== 'C'
    };
  } else {
    // Fruits & Vegetables (Horticulture)
    const std = CROP_STANDARDS.horticulture[cropKey] || CROP_STANDARDS.horticulture.default;

    const blemish = params.blemishPercentage !== undefined && params.blemishPercentage !== '' && params.blemishPercentage !== null ? Number(params.blemishPercentage) : null;
    const uniformity = params.uniformity !== undefined && params.uniformity !== '' && params.uniformity !== null ? Number(params.uniformity) : null;
    const ripeness = params.ripenessIndex !== undefined && params.ripenessIndex !== '' && params.ripenessIndex !== null ? Number(params.ripenessIndex) : null;

    const evalParams = {
      blemishPercentage: {
        value: blemish,
        unit: '%',
        benchmarkA: `<= ${std.blemishMax.gradeA}%`,
        benchmarkB: `<= ${std.blemishMax.gradeB}%`,
        status: 'N/A'
      },
      uniformity: {
        value: uniformity,
        unit: '%',
        benchmarkA: `>= ${std.uniformityMin.gradeA}%`,
        benchmarkB: `>= ${std.uniformityMin.gradeB}%`,
        status: 'N/A'
      },
      ripenessIndex: {
        value: ripeness,
        unit: '%',
        benchmarkA: `>= ${std.ripenessMin.gradeA}%`,
        benchmarkB: `>= ${std.ripenessMin.gradeB}%`,
        status: 'N/A'
      }
    };

    if (blemish !== null && !isNaN(blemish)) {
      if (blemish <= std.blemishMax.gradeA) {
        evalParams.blemishPercentage.status = 'PASS';
      } else if (blemish <= std.blemishMax.gradeB) {
        evalParams.blemishPercentage.status = 'FAQ_STANDARD';
        if (evaluatedGrade === 'A') evaluatedGrade = 'B';
        rationales.push(`Blemish percentage (${blemish}%) exceeds Grade A max (${std.blemishMax.gradeA}%).`);
      } else {
        evalParams.blemishPercentage.status = 'FAIL';
        evaluatedGrade = 'C';
        rationales.push(`Surface blemish (${blemish}%) exceeds Grade B allowable tolerance.`);
      }
    }

    if (uniformity !== null && !isNaN(uniformity)) {
      if (uniformity >= std.uniformityMin.gradeA) {
        evalParams.uniformity.status = 'PASS';
      } else if (uniformity >= std.uniformityMin.gradeB) {
        evalParams.uniformity.status = 'FAQ_STANDARD';
        if (evaluatedGrade === 'A') evaluatedGrade = 'B';
        rationales.push(`Uniformity index (${uniformity}%) is standard FAQ grade.`);
      } else {
        evalParams.uniformity.status = 'FAIL';
        evaluatedGrade = 'C';
        rationales.push(`Lot has high size variance (Uniformity ${uniformity}% < ${std.uniformityMin.gradeB}%).`);
      }
    }

    if (ripeness !== null && !isNaN(ripeness)) {
      if (ripeness >= std.ripenessMin.gradeA && ripeness <= 98) {
        evalParams.ripenessIndex.status = 'PASS';
      } else if (ripeness >= std.ripenessMin.gradeB) {
        evalParams.ripenessIndex.status = 'FAQ_STANDARD';
        if (evaluatedGrade === 'A') evaluatedGrade = 'B';
        rationales.push(`Ripeness index (${ripeness}%) is within Grade B marketing tolerance.`);
      } else {
        evalParams.ripenessIndex.status = 'FAIL';
        evaluatedGrade = 'C';
        rationales.push(`Ripeness index (${ripeness}%) indicates under-ripe or over-mature produce.`);
      }
    }

    const gradeLabels = {
      A: 'Grade A (Agmark Horticultural Premium)',
      B: 'Grade B (Standard Commercial Grade)',
      C: 'Grade C (Secondary / Processing Grade)'
    };

    return {
      category,
      grade: evaluatedGrade,
      gradeLabel: gradeLabels[evaluatedGrade],
      standard: 'Agmark Horticultural Grading & Marking Rules',
      parameters: evalParams,
      rationales: rationales.length > 0 ? rationales : ['Produce satisfies premium Agmark freshness, color, and size uniformity specifications.'],
      isAgmarkCompliant: evaluatedGrade !== 'C'
    };
  }
}

module.exports = {
  CROP_STANDARDS,
  getCropCategory,
  evaluateAgmarkGrade
};
