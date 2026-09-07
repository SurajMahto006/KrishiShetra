const fs = require('fs');
const path = require('path');

function patchFile(fileName, replacements) {
  const filePath = path.join(__dirname, '..', fileName);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  replacements.forEach(r => {
    content = content.replaceAll(r.from, r.to);
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${fileName}`);
}

// 1. lots.html
patchFile('lots.html', [
  { from: '<label for="edit-lot-qty">Quantity (Quintals)</label>', to: '<label for="edit-lot-qty" data-i18n="cropLotModal.quantityAvailable">Quantity (Quintals)</label>' },
  { from: '<label for="edit-lot-price">Expected Price (₹/q)</label>', to: '<label for="edit-lot-price" data-i18n="cropLotModal.expectedPricePerUnit">Expected Price (₹/q)</label>' },
  { from: '<label for="edit-lot-grade">Quality / Grade</label>', to: '<label for="edit-lot-grade" data-i18n="cropLotModal.gradeSelection">Quality / Grade</label>' },
  { from: '<label for="edit-lot-location">Location</label>', to: '<label for="edit-lot-location" data-i18n="cropLotModal.locationHarvestOrigin">Location</label>' },
  { from: '<label for="edit-lot-desc">Description</label>', to: '<label for="edit-lot-desc" data-i18n="cropLotModal.qualityMoistureNotes">Description</label>' },
  { from: '<button class="btn btn--secondary" id="btn-cancel-pause">Cancel</button>', to: '<button class="btn btn--secondary" id="btn-cancel-pause" data-i18n="common.cancel">Cancel</button>' },
  { from: '<button class="btn btn--primary" id="btn-confirm-pause">Confirm Pause</button>', to: '<button class="btn btn--primary" id="btn-confirm-pause" data-i18n="cropLot.pauseProduceLot">Confirm Pause</button>' },
  { from: '<button class="btn btn--secondary" id="btn-cancel-delete">Cancel</button>', to: '<button class="btn btn--secondary" id="btn-cancel-delete" data-i18n="common.cancel">Cancel</button>' },
  { from: '<label>Buyer Offer Details</label>', to: '<label data-i18n="offers.receivedInquiries">Buyer Offer Details</label>' },
  { from: '<label for="negotiate-price-input">Your Counter Offer Price (₹/q)</label>', to: '<label for="negotiate-price-input" data-i18n="offers.counterOffer">Your Counter Offer Price (₹/q)</label>' }
]);

// 2. market.html
patchFile('market.html', [
  { from: '<button class="btn btn--secondary" id="btn-clear-search">Clear Filters</button>', to: '<button class="btn btn--secondary" id="btn-clear-search" data-i18n="market.clearFilters">Clear Filters</button>' },
  { from: '<label class="dash-checkbox"><input type="checkbox" id="alert-ch-app" checked> In-App</label>', to: '<label class="dash-checkbox"><input type="checkbox" id="alert-ch-app" checked> <span data-i18n="market.inApp">In-App</span></label>' },
  { from: '<label class="dash-checkbox"><input type="checkbox" id="alert-ch-sms" checked> SMS</label>', to: '<label class="dash-checkbox"><input type="checkbox" id="alert-ch-sms" checked> <span data-i18n="market.sms">SMS</span></label>' },
  { from: '<label class="dash-checkbox"><input type="checkbox" id="alert-ch-wa"> WhatsApp</label>', to: '<label class="dash-checkbox"><input type="checkbox" id="alert-ch-wa"> <span data-i18n="market.whatsapp">WhatsApp</span></label>' }
]);

// 3. mandi-compare.html
patchFile('mandi-compare.html', [
  { from: '<button class="mpc-chip-quick-btn" id="mpc-chip-top5">Select Top 5</button>', to: '<button class="mpc-chip-quick-btn" id="mpc-chip-top5" data-i18n="mandiCompare.selectTop5">Select Top 5</button>' },
  { from: '<button class="mpc-chip-quick-btn" id="mpc-chip-nearby">Nearby (&lt;250km)</button>', to: '<button class="mpc-chip-quick-btn" id="mpc-chip-nearby" data-i18n="mandiCompare.nearbyUnder250">Nearby (&lt;250km)</button>' },
  { from: '<button class="mpc-chip-quick-btn" id="mpc-chip-clear" style="color:var(--mpc-muted);">Clear</button>', to: '<button class="mpc-chip-quick-btn" id="mpc-chip-clear" style="color:var(--mpc-muted);" data-i18n="common.reset">Clear</button>' }
]);

// 4. ai-forecast.html
patchFile('ai-forecast.html', [
  { from: '<h4>Analyzing market data across 42 mandis...</h4>', to: '<h4 data-i18n="ai.analyzingMarketData">Analyzing market data across 42 mandis...</h4>' },
  { from: '<h3 class="dash-opp-card__title">Smart Selling Opportunity</h3>', to: '<h3 class="dash-opp-card__title" data-i18n="ai.smartSellingOpportunity">Smart Selling Opportunity</h3>' },
  { from: '<h3>Create Price Alert</h3>', to: '<h3 data-i18n="market.createPriceAlert">Create Price Alert</h3>' },
  { from: '<label for="alert-crop-input">Crop</label>', to: '<label for="alert-crop-input" data-i18n="storage.cropCommodity">Crop</label>' },
  { from: '<label for="alert-price-input">Target Price (₹/quintal)</label>', to: '<label for="alert-price-input" data-i18n="market.targetPrice">Target Price (₹/quintal)</label>' }
]);

// 5. storage.html
patchFile('storage.html', [
  { from: '<h3 style="font-size: 18px; font-weight: 800; color: var(--ks-evergreen); margin: 0;">📋 My Storage Bookings & Warehouse Receipts</h3>', to: '<h3 style="font-size: 18px; font-weight: 800; color: var(--ks-evergreen); margin: 0;" data-i18n="storage.myStorageBookingsTab">📋 My Storage Bookings & Warehouse Receipts</h3>' },
  { from: '<h3 style="font-size: 18px; font-weight: 800; color: #1565C0; margin: 0;">💰 Pledge Financing & Short-Term Liquidity (e-NWR)</h3>', to: '<h3 style="font-size: 18px; font-weight: 800; color: #1565C0; margin: 0;" data-i18n="storage.pledgeFinancingTitle">💰 Pledge Financing & Short-Term Liquidity (e-NWR)</h3>' },
  { from: '<label style="font-size: 12px; font-weight: 700; color: #444;">Storage Tariff Rate</label>', to: '<label style="font-size: 12px; font-weight: 700; color: #444;" data-i18n="storage.storageTariffRate">Storage Tariff Rate</label>' },
  { from: '<label for="book-start-date" style="font-size: 12px; font-weight: 700; color: #444;">Deposit Start Date</label>', to: '<label for="book-start-date" style="font-size: 12px; font-weight: 700; color: #444;" data-i18n="storage.depositStartDate">Deposit Start Date</label>' },
  { from: '<span style="font-size: 14px;">Total Estimated Cost:</span>', to: '<span style="font-size: 14px;" data-i18n="storage.totalEstimatedCost">Total Estimated Cost:</span>' },
  { from: '<label for="book-notes-input" style="font-size: 12px; font-weight: 700; color: #444;">Additional Notes for Facility Manager</label>', to: '<label for="book-notes-input" style="font-size: 12px; font-weight: 700; color: #444;" data-i18n="storage.additionalNotes">Additional Notes for Facility Manager</label>' },
  { from: '<span>Submit Storage Request</span>', to: '<span data-i18n="storage.submitStorageRequest">Submit Storage Request</span>' },
  { from: '<label for="pledge-qty-input" style="font-size: 12px; font-weight: 700; color: #444;">Stored Quantity (q)</label>', to: '<label for="pledge-qty-input" style="font-size: 12px; font-weight: 700; color: #444;" data-i18n="storage.storedQuantityQuintals">Stored Quantity (q)</label>' },
  { from: '<label for="pledge-price-input" style="font-size: 12px; font-weight: 700; color: #444;">Mandi Benchmark (₹/q)</label>', to: '<label for="pledge-price-input" style="font-size: 12px; font-weight: 700; color: #444;" data-i18n="storage.mandiBenchmarkRate">Mandi Benchmark (₹/q)</label>' },
  { from: '<span>Total Produce Valuation:</span>', to: '<span data-i18n="storage.produceValuation">Total Produce Valuation:</span>' },
  { from: '<span>Max Permissible Loan (75% LTV):</span>', to: '<span data-i18n="storage.maxPermissibleLoan">Max Permissible Loan (75% LTV):</span>' },
  { from: '<label for="pledge-loan-input" style="font-size: 12px; font-weight: 700; color: #444;">Requested Loan Amount (₹)</label>', to: '<label for="pledge-loan-input" style="font-size: 12px; font-weight: 700; color: #444;" data-i18n="storage.requestedLoanAmount">Requested Loan Amount (₹)</label>' },
  { from: '<label for="pledge-lender-select" style="font-size: 12px; font-weight: 700; color: #444;">Partner Lending Institution</label>', to: '<label for="pledge-lender-select" style="font-size: 12px; font-weight: 700; color: #444;" data-i18n="storage.partnerLender">Partner Lending Institution</label>' },
  { from: '<span>Submit Loan Request</span>', to: '<span data-i18n="storage.submitLoanRequest">Submit Loan Request</span>' }
]);
