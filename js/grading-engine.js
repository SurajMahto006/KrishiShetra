/**
 * KRISHISHETRA — BROWSER AGMARK & e-NAM GRADING ENGINE
 * Client-side calculation, interactive benchmark scorecards, and parameter standardization.
 */

window.GradingEngine = (function () {
  const CROP_STANDARDS = {
    grains: {
      wheat: {
        moistureMax: { gradeA: 12.0, gradeB: 14.0 },
        foreignMatterMax: { gradeA: 1.0, gradeB: 2.0 },
        brokenGrainsMax: { gradeA: 2.0, gradeB: 4.0 },
        damagedGrainsMax: { gradeA: 1.5, gradeB: 3.0 }
      },
      paddy: {
        moistureMax: { gradeA: 13.0, gradeB: 15.0 },
        foreignMatterMax: { gradeA: 1.0, gradeB: 2.5 },
        brokenGrainsMax: { gradeA: 4.0, gradeB: 8.0 },
        damagedGrainsMax: { gradeA: 1.5, gradeB: 3.5 }
      },
      default: {
        moistureMax: { gradeA: 12.5, gradeB: 14.5 },
        foreignMatterMax: { gradeA: 1.0, gradeB: 2.0 },
        brokenGrainsMax: { gradeA: 3.0, gradeB: 6.0 },
        damagedGrainsMax: { gradeA: 2.0, gradeB: 4.0 }
      }
    },
    horticulture: {
      onion: {
        blemishMax: { gradeA: 3.0, gradeB: 7.0 },
        uniformityMin: { gradeA: 90, gradeB: 75 },
        ripenessMin: { gradeA: 85, gradeB: 70 }
      },
      tomato: {
        blemishMax: { gradeA: 2.5, gradeB: 6.0 },
        uniformityMin: { gradeA: 92, gradeB: 80 },
        ripenessMin: { gradeA: 85, gradeB: 70 }
      },
      default: {
        blemishMax: { gradeA: 3.0, gradeB: 7.0 },
        uniformityMin: { gradeA: 90, gradeB: 75 },
        ripenessMin: { gradeA: 85, gradeB: 70 }
      }
    }
  };

  function getCropCategory(cropName = '') {
    const norm = String(cropName).trim().toLowerCase();
    const grainKeywords = ['wheat', 'paddy', 'rice', 'maize', 'corn', 'barley', 'jowar', 'bajra', 'millet', 'dal', 'pulse', 'gram', 'soybean', 'moong', 'urad', 'chana'];
    if (grainKeywords.some(kw => norm.includes(kw))) return 'cereals_grains';

    const hortiKeywords = ['onion', 'tomato', 'potato', 'banana', 'mango', 'apple', 'grape', 'citrus', 'orange', 'chilli', 'garlic', 'ginger', 'brinjal', 'cabbage', 'cauliflower'];
    if (hortiKeywords.some(kw => norm.includes(kw))) return 'fruits_vegetables';

    return 'cereals_grains';
  }

  function evaluate(cropName, params = {}) {
    const category = getCropCategory(cropName);
    const cropKey = String(cropName).trim().toLowerCase();
    const rationales = [];
    let evaluatedGrade = 'A';

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
          benchmarkA: `≤ ${std.moistureMax.gradeA}%`,
          benchmarkB: `≤ ${std.moistureMax.gradeB}%`,
          status: 'PENDING'
        },
        foreignMatter: {
          value: foreign,
          unit: '%',
          benchmarkA: `≤ ${std.foreignMatterMax.gradeA}%`,
          benchmarkB: `≤ ${std.foreignMatterMax.gradeB}%`,
          status: 'PENDING'
        },
        brokenGrains: {
          value: broken,
          unit: '%',
          benchmarkA: `≤ ${std.brokenGrainsMax.gradeA}%`,
          benchmarkB: `≤ ${std.brokenGrainsMax.gradeB}%`,
          status: 'PENDING'
        },
        damagedGrains: {
          value: damaged,
          unit: '%',
          benchmarkA: `≤ ${std.damagedGrainsMax.gradeA}%`,
          benchmarkB: `≤ ${std.damagedGrainsMax.gradeB}%`,
          status: 'PENDING'
        }
      };

      if (moisture !== null && !isNaN(moisture)) {
        if (moisture <= std.moistureMax.gradeA) {
          evalParams.moistureContent.status = 'PASS';
        } else if (moisture <= std.moistureMax.gradeB) {
          evalParams.moistureContent.status = 'FAQ_STANDARD';
          if (evaluatedGrade === 'A') evaluatedGrade = 'B';
          rationales.push(`Moisture (${moisture}%) exceeds Grade A max (${std.moistureMax.gradeA}%), within FAQ limit.`);
        } else {
          evalParams.moistureContent.status = 'FAIL';
          evaluatedGrade = 'C';
          rationales.push(`Moisture (${moisture}%) exceeds safe storage threshold (${std.moistureMax.gradeB}%). Spoilage risk.`);
        }
      }

      if (foreign !== null && !isNaN(foreign)) {
        if (foreign <= std.foreignMatterMax.gradeA) {
          evalParams.foreignMatter.status = 'PASS';
        } else if (foreign <= std.foreignMatterMax.gradeB) {
          evalParams.foreignMatter.status = 'FAQ_STANDARD';
          if (evaluatedGrade === 'A') evaluatedGrade = 'B';
          rationales.push(`Foreign matter (${foreign}%) exceeds Grade A standard.`);
        } else {
          evalParams.foreignMatter.status = 'FAIL';
          evaluatedGrade = 'C';
          rationales.push(`Foreign matter (${foreign}%) exceeds Grade B threshold.`);
        }
      }

      if (broken !== null && !isNaN(broken)) {
        if (broken <= std.brokenGrainsMax.gradeA) {
          evalParams.brokenGrains.status = 'PASS';
        } else if (broken <= std.brokenGrainsMax.gradeB) {
          evalParams.brokenGrains.status = 'FAQ_STANDARD';
          if (evaluatedGrade === 'A') evaluatedGrade = 'B';
          rationales.push(`Broken grains (${broken}%) exceeds Grade A standard.`);
        } else {
          evalParams.brokenGrains.status = 'FAIL';
          evaluatedGrade = 'C';
          rationales.push(`Broken grains (${broken}%) exceeds FAQ allowable tolerance.`);
        }
      }

      if (damaged !== null && !isNaN(damaged)) {
        if (damaged <= std.damagedGrainsMax.gradeA) {
          evalParams.damagedGrains.status = 'PASS';
        } else if (damaged <= std.damagedGrainsMax.gradeB) {
          evalParams.damagedGrains.status = 'FAQ_STANDARD';
          if (evaluatedGrade === 'A') evaluatedGrade = 'B';
          rationales.push(`Damaged grains (${damaged}%) exceeds Grade A standard.`);
        } else {
          evalParams.damagedGrains.status = 'FAIL';
          evaluatedGrade = 'C';
          rationales.push(`Damaged/discolored grains (${damaged}%) exceeds allowable limit.`);
        }
      }

      const gradeLabels = {
        A: 'Grade A (Agmark Premium FAQ)',
        B: 'Grade B (Standard FAQ)',
        C: 'Grade C (Under-grade)'
      };

      return {
        category,
        grade: evaluatedGrade,
        gradeLabel: gradeLabels[evaluatedGrade],
        standard: 'Agmark / e-NAM Standards (IS:14811)',
        parameters: evalParams,
        rationales: rationales.length > 0 ? rationales : ['All grain specifications satisfy Grade A Agmark export benchmarks.'],
        isAgmarkCompliant: evaluatedGrade !== 'C'
      };
    } else {
      const std = CROP_STANDARDS.horticulture[cropKey] || CROP_STANDARDS.horticulture.default;
      const blemish = params.blemishPercentage !== undefined && params.blemishPercentage !== '' && params.blemishPercentage !== null ? Number(params.blemishPercentage) : null;
      const uniformity = params.uniformity !== undefined && params.uniformity !== '' && params.uniformity !== null ? Number(params.uniformity) : null;
      const ripeness = params.ripenessIndex !== undefined && params.ripenessIndex !== '' && params.ripenessIndex !== null ? Number(params.ripenessIndex) : null;

      const evalParams = {
        blemishPercentage: {
          value: blemish,
          unit: '%',
          benchmarkA: `≤ ${std.blemishMax.gradeA}%`,
          benchmarkB: `≤ ${std.blemishMax.gradeB}%`,
          status: 'PENDING'
        },
        uniformity: {
          value: uniformity,
          unit: '%',
          benchmarkA: `≥ ${std.uniformityMin.gradeA}%`,
          benchmarkB: `≥ ${std.uniformityMin.gradeB}%`,
          status: 'PENDING'
        },
        ripenessIndex: {
          value: ripeness,
          unit: '%',
          benchmarkA: `≥ ${std.ripenessMin.gradeA}%`,
          benchmarkB: `≥ ${std.ripenessMin.gradeB}%`,
          status: 'PENDING'
        }
      };

      if (blemish !== null && !isNaN(blemish)) {
        if (blemish <= std.blemishMax.gradeA) {
          evalParams.blemishPercentage.status = 'PASS';
        } else if (blemish <= std.blemishMax.gradeB) {
          evalParams.blemishPercentage.status = 'FAQ_STANDARD';
          if (evaluatedGrade === 'A') evaluatedGrade = 'B';
          rationales.push(`Surface blemish (${blemish}%) exceeds Grade A max (${std.blemishMax.gradeA}%).`);
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
          rationales.push(`Uniformity index (${uniformity}%) is standard commercial grade.`);
        } else {
          evalParams.uniformity.status = 'FAIL';
          evaluatedGrade = 'C';
          rationales.push(`Size variance exceeds acceptable grade (Uniformity ${uniformity}%).`);
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
        A: 'Grade A (Horticultural Premium)',
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

  return {
    evaluate,
    getCropCategory,
    CROP_STANDARDS
  };
})();
