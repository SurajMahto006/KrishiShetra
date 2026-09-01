/**
 * KRISHISHETRA — MANDI PROFITABILITY & SELLING DECISION CONTROLLER (Frontend)
 */

'use strict';

// Indian currency formatter
function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const isNeg = val < 0;
  const abs = Math.abs(Math.round(val));
  const s = abs.toString();
  let result = '';
  if (s.length > 3) {
    const last3 = s.slice(-3);
    const rem = s.slice(0, -3);
    const groups = [];
    for (let i = rem.length; i > 0; i -= 2) {
      groups.unshift(rem.slice(Math.max(0, i - 2), i));
    }
    result = groups.join(',') + ',' + last3;
  } else {
    result = s;
  }
  return (isNeg ? '-₹' : '₹') + result;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const form = document.getElementById('mandi-analysis-form');
  const cropSelect = document.getElementById('input-crop');
  const qtyInput = document.getElementById('input-quantity');
  const dateInput = document.getElementById('input-date');
  const latInput = document.getElementById('input-lat');
  const lonInput = document.getElementById('input-lon');
  const nearbyPriceInput = document.getElementById('input-nearby-price');
  const btnGeo = document.getElementById('btn-get-location');
  const btnSubmit = document.getElementById('btn-analyze-submit');

  const advancedToggle = document.getElementById('toggle-advanced');
  const advancedContent = document.getElementById('advanced-content');

  const resultsPlaceholder = document.getElementById('results-placeholder');
  const resultsContainer = document.getElementById('results-deck');

  // Initialize Default Date to Tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.value = tomorrow.toISOString().split('T')[0];

  // 1. Fetch available crops
  try {
    const cropsRes = await window.api.mandi.crops();
    if (cropsRes.success && cropsRes.data) {
      cropSelect.innerHTML = cropsRes.data
        .map(c => `<option value="${c.key}" ${c.key === 'onion' ? 'selected' : ''}>${c.icon} ${c.localName}</option>`)
        .join('');
    }
  } catch (e) {
    console.warn('Could not load crops list:', e);
  }

  // 2. Geolocation button
  btnGeo.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    btnGeo.innerHTML = '<span>⏳ Locating...</span>';
    navigator.geolocation.getCurrentPosition(
      pos => {
        latInput.value = pos.coords.latitude.toFixed(4);
        lonInput.value = pos.coords.longitude.toFixed(4);
        btnGeo.innerHTML = '<i data-lucide="map-pin"></i> <span>Auto-Detected!</span>';
        if (window.lucide) window.lucide.createIcons();
      },
      err => {
        btnGeo.innerHTML = '<i data-lucide="map-pin"></i> <span>Use GPS</span>';
        alert('Could not retrieve GPS location. Using default Pune coordinates.');
        latInput.value = '18.5204';
        lonInput.value = '73.8567';
        if (window.lucide) window.lucide.createIcons();
      }
    );
  });

  // 3. Toggle advanced cost overrides
  advancedToggle.addEventListener('click', () => {
    const isOpen = advancedContent.classList.toggle('active');
    advancedToggle.querySelector('.mandi-accordion__arrow').style.transform = isOpen ? 'rotate(180deg)' : 'none';
  });

  // 4. Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const crop = cropSelect.value;
    const quantity = parseFloat(qtyInput.value);
    const sellingDate = dateInput.value;
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);
    const nearbyPrice = nearbyPriceInput.value ? parseFloat(nearbyPriceInput.value) : null;

    if (!crop || isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid crop and quantity.');
      return;
    }

    if (isNaN(lat) || isNaN(lon)) {
      alert('Please provide valid latitude and longitude coordinates.');
      return;
    }

    // Build payload
    const payload = {
      crop,
      quantity,
      farmLocation: { latitude: lat, longitude: lon },
      sellingDate,
      nearbyBuyerPrice: nearbyPrice,
      vehicleType: document.getElementById('input-vehicle-type').value,
      vehicleCapacity: document.getElementById('input-vehicle-capacity').value || null,
      transportRate: document.getElementById('input-transport-rate').value || null,
      labourCost: document.getElementById('input-labour-cost').value || null,
      loadingCost: document.getElementById('input-loading-cost').value || null,
      unloadingCost: document.getElementById('input-unloading-cost').value || null,
      packagingCost: document.getElementById('input-packaging-cost').value || null,
      otherExpenses: document.getElementById('input-other-cost').value || null
    };

    // UI Loading state
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>⏳ Analyzing All Mandis with ML & Cost Engine...</span>';

    try {
      const response = await window.api.mandi.analyze(payload);

      if (!response.success) {
        alert(response.message || 'Failed to analyze mandis.');
        return;
      }

      renderResults(response, payload);
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Network error while connecting to KrishiShetra server.');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<i data-lucide="sparkles"></i> <span>Find Most Profitable Option</span>';
      if (window.lucide) window.lucide.createIcons();
    }
  });

  // 5. Render Results Deck
  function renderResults(data, inputPayload) {
    resultsPlaceholder.style.display = 'none';
    resultsContainer.style.display = 'block';

    const { decision, decisionLabel, recommended, nearbyBuyer, additionalProfit, breakEvenPrice, breakEvenExplanation, scenarioAnalysis, comparison, explanation, isDemo, dataDisclaimer } = data;

    const isGo = decision === 'GO_TO_MANDI';
    const isNearbyWinner = decision === 'STAY_WITH_BUYER';

    // ── 1. Decision Banner ──
    const bannerHtml = `
      <div class="mandi-decision-banner ${isGo ? 'mandi-decision-banner--go' : 'mandi-decision-banner--stay'}">
        <div class="mandi-decision-banner__icon">
          ${isGo ? '🚛' : '🏠'}
        </div>
        <div class="mandi-decision-banner__body">
          <div class="mandi-decision-banner__kicker">${isGo ? 'AI Selling Recommendation' : 'Cost Alert Recommendation'}</div>
          <div class="mandi-decision-banner__headline">${decisionLabel}</div>
          <div class="mandi-decision-banner__extra">
            ${additionalProfit != null
              ? (isGo
                  ? `Expected <strong>${formatINR(additionalProfit)} MORE net profit</strong> after transport & mandi fees than selling nearby.`
                  : `Travelling to mandi is <strong>not worth the expense</strong>. Selling nearby saves <strong>${formatINR(Math.abs(additionalProfit))}</strong>.`)
              : `Optimized for maximum expected net profit.`}
          </div>
        </div>
        <div class="mandi-decision-banner__badge">
          Expected Profit<br>
          <span style="font-size:20px; font-weight:900;">${formatINR(recommended.netProfit)}</span>
        </div>
      </div>
    `;

    // ── 2. Recommended Mandi / Buyer Card ──
    const recomHtml = `
      <div class="mandi-recom-card">
        <div class="mandi-recom-badge">
          <span>🥇</span> Rank #1 Choice
        </div>
        <div class="mandi-recom-header">
          <div class="mandi-recom-name">${recommended.name}</div>
          <div class="mandi-recom-sub">
            <span><strong>Crop:</strong> ${inputPayload.crop.toUpperCase()} (${inputPayload.quantity} Quintals)</span>
            <span>•</span>
            <span><strong>Expected Price:</strong> ${formatINR(recommended.expectedPrice)}/qtl</span>
            <span>•</span>
            <span><strong>Price Basis:</strong> ${recommended.priceSourceLabel || 'Estimate'}</span>
            ${recommended.distance && recommended.distance.distanceKm > 0
              ? `<span>•</span><span><strong>Distance:</strong> ${recommended.distance.distanceKm} km (${recommended.distance.label})</span>`
              : ''}
          </div>
        </div>

        <!-- Profit Callout Metrics -->
        <div class="mandi-profit-callout">
          <div class="mandi-profit-stat">
            <span class="mandi-profit-stat__label">Gross Revenue</span>
            <span class="mandi-profit-stat__val">${formatINR(recommended.breakdown.grossRevenue.value)}</span>
            <span class="mandi-profit-stat__sub">${inputPayload.quantity} qtl × ${formatINR(recommended.expectedPrice)}</span>
          </div>
          <div class="mandi-profit-stat">
            <span class="mandi-profit-stat__label">Total Expenses</span>
            <span class="mandi-profit-stat__val" style="color: var(--ks-terracotta);">${formatINR(recommended.totalCost)}</span>
            <span class="mandi-profit-stat__sub">Transport, labour, fees</span>
          </div>
          <div class="mandi-profit-stat">
            <span class="mandi-profit-stat__label">Expected Net Profit</span>
            <span class="mandi-profit-stat__val mandi-profit-stat__val--hero">${formatINR(recommended.netProfit)}</span>
            <span class="mandi-profit-stat__sub">Revenue − Total Expenses</span>
          </div>
          <div class="mandi-profit-stat">
            <span class="mandi-profit-stat__label">Net Profit / Quintal</span>
            <span class="mandi-profit-stat__val" style="color: var(--ks-sage);">${formatINR(recommended.profitPerQuintal)}</span>
            <span class="mandi-profit-stat__sub">Per 100 kg bag</span>
          </div>
        </div>

        <!-- Explainable Calculation Table -->
        <div style="font-weight:700; font-size:14px; margin-bottom:8px; color:var(--ks-evergreen);">
          📊 Complete Step-by-Step Cost & Profit Breakdown
        </div>
        <div class="mandi-calc-table-wrap">
          <table class="mandi-calc-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Formula / Calculation Basis</th>
                <th class="num">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>(+) Gross Revenue</strong></td>
                <td class="formula-cell">${recommended.breakdown.grossRevenue.formula}</td>
                <td class="num" style="color: #1e7040;">${formatINR(recommended.breakdown.grossRevenue.value)}</td>
              </tr>
              <tr>
                <td>(−) Transportation</td>
                <td class="formula-cell">${recommended.breakdown.transport.formula}</td>
                <td class="num">${formatINR(recommended.breakdown.transport.value)}</td>
              </tr>
              <tr>
                <td>(−) Labour & Farm Assistance</td>
                <td class="formula-cell">${recommended.breakdown.labour.formula}</td>
                <td class="num">${formatINR(recommended.breakdown.labour.value)}</td>
              </tr>
              <tr>
                <td>(−) Loading Cost</td>
                <td class="formula-cell">${recommended.breakdown.loading.formula}</td>
                <td class="num">${formatINR(recommended.breakdown.loading.value)}</td>
              </tr>
              <tr>
                <td>(−) Unloading Cost</td>
                <td class="formula-cell">${recommended.breakdown.unloading.formula}</td>
                <td class="num">${formatINR(recommended.breakdown.unloading.value)}</td>
              </tr>
              <tr>
                <td>(−) Mandi Commission</td>
                <td class="formula-cell">${recommended.breakdown.commission.formula}</td>
                <td class="num">${formatINR(recommended.breakdown.commission.value)}</td>
              </tr>
              <tr>
                <td>(−) Mandi Entry / User Charge</td>
                <td class="formula-cell">${recommended.breakdown.mandiCharge.formula}</td>
                <td class="num">${formatINR(recommended.breakdown.mandiCharge.value)}</td>
              </tr>
              ${recommended.breakdown.packaging.value > 0 ? `
              <tr>
                <td>(−) Packaging Material</td>
                <td class="formula-cell">${recommended.breakdown.packaging.formula}</td>
                <td class="num">${formatINR(recommended.breakdown.packaging.value)}</td>
              </tr>` : ''}
              ${recommended.breakdown.otherExpenses.value > 0 ? `
              <tr>
                <td>(−) Other Incidental Expenses</td>
                <td class="formula-cell">${recommended.breakdown.otherExpenses.formula}</td>
                <td class="num">${formatINR(recommended.breakdown.otherExpenses.value)}</td>
              </tr>` : ''}
              <tr class="total-row">
                <td><strong>(=) Total Selling Expenses</strong></td>
                <td class="formula-cell">Sum of transport, labour, handling & mandi fees</td>
                <td class="num" style="color: var(--ks-terracotta);">${formatINR(recommended.totalCost)}</td>
              </tr>
              <tr class="net-profit-row">
                <td><strong>(🏆) EXPECTED NET PROFIT</strong></td>
                <td class="formula-cell">Gross Revenue (${formatINR(recommended.breakdown.grossRevenue.value)}) − Total Expenses (${formatINR(recommended.totalCost)})</td>
                <td class="num">${formatINR(recommended.netProfit)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${scenarioAnalysis ? `
        <!-- Scenario Analysis (Worst / Expected / Best Case) -->
        <div style="font-weight:700; font-size:14px; margin-bottom:8px; color:var(--ks-evergreen);">
          🎯 Risk & Scenario Analysis (Price Volatility Range)
        </div>
        <div class="mandi-scenario-deck">
          <div class="mandi-scenario-card mandi-scenario-card--worst">
            <div class="mandi-scenario-card__title">Worst Case Scenario</div>
            <div class="mandi-scenario-card__price">Price: ${formatINR(scenarioAnalysis.worstCase.price)}/qtl</div>
            <div class="mandi-scenario-card__profit">${formatINR(scenarioAnalysis.worstCase.netProfit)}</div>
            <div style="font-size:11.5px; color:var(--ks-text-muted); margin-top:2px;">Net: ${formatINR(scenarioAnalysis.worstCase.profitPerQuintal)}/qtl</div>
          </div>
          <div class="mandi-scenario-card mandi-scenario-card--expected">
            <div class="mandi-scenario-card__title">Expected Case (Central ML)</div>
            <div class="mandi-scenario-card__price">Price: ${formatINR(scenarioAnalysis.expectedCase.price)}/qtl</div>
            <div class="mandi-scenario-card__profit" style="color:#1e7040;">${formatINR(scenarioAnalysis.expectedCase.netProfit)}</div>
            <div style="font-size:11.5px; color:var(--ks-text-muted); margin-top:2px;">Net: ${formatINR(scenarioAnalysis.expectedCase.profitPerQuintal)}/qtl</div>
          </div>
          <div class="mandi-scenario-card mandi-scenario-card--best">
            <div class="mandi-scenario-card__title">Best Case Scenario</div>
            <div class="mandi-scenario-card__price">Price: ${formatINR(scenarioAnalysis.bestCase.price)}/qtl</div>
            <div class="mandi-scenario-card__profit">${formatINR(scenarioAnalysis.bestCase.netProfit)}</div>
            <div style="font-size:11.5px; color:var(--ks-text-muted); margin-top:2px;">Net: ${formatINR(scenarioAnalysis.bestCase.profitPerQuintal)}/qtl</div>
          </div>
        </div>
        ` : ''}

        ${breakEvenPrice ? `
        <!-- Break-Even Price Card -->
        <div class="mandi-info-box">
          <div class="mandi-info-box__icon">⚖️</div>
          <div class="mandi-info-box__body">
            <div class="mandi-info-box__title">Break-Even Price Analysis</div>
            <div>${breakEvenExplanation}</div>
            <div style="font-size:12px; color:var(--ks-text-muted); margin-top:4px;">
              Formula: <code>${data.breakEvenFormula}</code>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Structured Explanation -->
        <div class="mandi-info-box" style="background:#F6FAF7; border-color:#BCE0C7;">
          <div class="mandi-info-box__icon" style="color:#20633B;">💡</div>
          <div class="mandi-info-box__body" style="color:#163C25;">
            <div class="mandi-info-box__title" style="color:#12372A;">Decision Summary & Explanation</div>
            <div>${explanation}</div>
          </div>
        </div>

      </div>
    `;

    // ── 3. Complete Comparison Matrix ──
    const comparisonRows = comparison.map(item => {
      const isRec = item.isRecommended;
      return `
        <tr class="${isRec ? 'row-recommended' : ''}">
          <td>
            <span class="rank-badge">${item.rank}</span>
            ${isRec ? ' ⭐' : ''}
          </td>
          <td>
            <strong>${item.name}</strong>
            ${item.isNearbyBuyer ? ' <span style="font-size:11px; padding:2px 6px; background:#FDF7EA; color:#8C6212; border-radius:4px;">Farmgate</span>' : ''}
            <div style="font-size:11px; color:var(--ks-text-muted);">${item.district ? item.district + ', ' + item.state : 'Local Pick-up'}</div>
          </td>
          <td class="num">${formatINR(item.expectedPrice)}/qtl</td>
          <td>${item.distance ? item.distance.distanceKm + ' km' : '0 km'}</td>
          <td class="num" style="color:var(--ks-terracotta);">${formatINR(item.totalCost)}</td>
          <td class="num" style="font-size:15px; font-weight:800; color:${isRec ? '#1e7040' : 'var(--ks-evergreen)'};">${formatINR(item.netProfit)}</td>
          <td class="num">${formatINR(item.profitPerQuintal)}</td>
          <td>
            ${isRec
              ? '<span style="color:#1e7040; font-weight:800;">🥇 Recommended</span>'
              : (item.netProfit < recommended.netProfit
                  ? `<span style="color:var(--ks-text-muted); font-size:12px;">−${formatINR(recommended.netProfit - item.netProfit)}</span>`
                  : '—')}
          </td>
        </tr>
      `;
    }).join('');

    const matrixHtml = `
      <div class="mandi-card" style="margin-top:24px;">
        <div class="mandi-card__header">
          <div class="mandi-card__title">
            <span class="mandi-card__icon"><i data-lucide="arrow-up-down"></i></span>
            All Mandis & Buyer Comparison Matrix (Ranked by Expected Net Profit)
          </div>
        </div>
        <div class="mandi-matrix-table-wrap">
          <table class="mandi-matrix-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Selling Option</th>
                <th class="num">Expected Price</th>
                <th>Distance</th>
                <th class="num">Total Expenses</th>
                <th class="num">Expected Net Profit</th>
                <th class="num">Net / Qtl</th>
                <th>Profit Difference</th>
              </tr>
            </thead>
            <tbody>
              ${comparisonRows}
            </tbody>
          </table>
        </div>

        ${dataDisclaimer ? `
        <div class="mandi-disclaimer-banner">
          <span>⚠️</span>
          <span><strong>Data Provenance Notice:</strong> ${dataDisclaimer}</span>
        </div>
        ` : ''}
      </div>
    `;

    resultsContainer.innerHTML = bannerHtml + recomHtml + matrixHtml;

    if (window.lucide) window.lucide.createIcons();

    // Scroll to results smoothly
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
