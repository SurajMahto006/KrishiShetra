const fs = require('fs');
const path = require('path');

const storageHtmlPath = path.join(__dirname, '..', 'storage.html');
let html = fs.readFileSync(storageHtmlPath, 'utf8');

// Replacements in storage.html
const replacements = [
  // Option A breakdown
  {
    from: '<span>Current Mandi Price:</span>',
    to: '<span data-i18n="storage.currentMandiPrice">Current Mandi Price:</span>'
  },
  {
    from: '<span>Storage & Handling Cost:</span>',
    to: '<span data-i18n="storage.handlingCharges">Storage & Handling Cost:</span>'
  },
  {
    from: '<span>Holding Shrinkage Risk:</span>',
    to: '<span data-i18n="storage.weightLossRisk">Holding Shrinkage Risk:</span>'
  },
  // Sort by toolbar
  {
    from: '<span style="font-size: 11px; color: #777; font-weight: 600;">SORT BY:</span>',
    to: '<span style="font-size: 11px; color: #777; font-weight: 600;" data-i18n="buyer.sortBy">SORT BY:</span>'
  },
  {
    from: '<button class="btn btn--sm btn--secondary" onclick="sortCropOptions(\'profit\')" id="btn-sort-profit" style="font-size: 11.5px; padding: 4px 10px; background: #E8F5E9; border-color: #C8E6C9; color: #2E7D32; font-weight: 700;">\n                  🏆 Max Profit\n                </button>',
    to: '<button class="btn btn--sm btn--secondary" onclick="sortCropOptions(\'profit\')" id="btn-sort-profit" style="font-size: 11.5px; padding: 4px 10px; background: #E8F5E9; border-color: #C8E6C9; color: #2E7D32; font-weight: 700;" data-i18n="storage.highestProfit">\n                  🏆 Max Profit\n                </button>'
  },
  {
    from: '<button class="btn btn--sm btn--secondary" onclick="sortCropOptions(\'distance\')" id="btn-sort-dist" style="font-size: 11.5px; padding: 4px 10px;">\n                  ⚡ Nearest\n                </button>',
    to: '<button class="btn btn--sm btn--secondary" onclick="sortCropOptions(\'distance\')" id="btn-sort-dist" style="font-size: 11.5px; padding: 4px 10px;" data-i18n="storage.nearest">\n                  ⚡ Nearest\n                </button>'
  },
  {
    from: '<button class="btn btn--sm btn--secondary" onclick="sortCropOptions(\'cost\')" id="btn-sort-cost" style="font-size: 11.5px; padding: 4px 10px;">\n                  💰 Lowest Cost\n                </button>',
    to: '<button class="btn btn--sm btn--secondary" onclick="sortCropOptions(\'cost\')" id="btn-sort-cost" style="font-size: 11.5px; padding: 4px 10px;" data-i18n="storage.lowestCost">\n                  💰 Lowest Cost\n                </button>'
  },
  // Bookings Panel
  {
    from: '<p style="font-size: 12.5px; color: var(--ks-text-muted); margin: 2px 0 0;">Track your deposit status, monthly rent accruals, and e-NWR numbers.</p>',
    to: '<p style="font-size: 12.5px; color: var(--ks-text-muted); margin: 2px 0 0;" data-i18n="storage.activeBookingsSubtitle">Track your deposit status, monthly rent accruals, and e-NWR numbers.</p>'
  },
  {
    from: '<button class="btn btn--primary btn--sm" onclick="switchStorageSubTab(\'discovery\')">\n              <i data-lucide="plus"></i> Request New Storage Space\n            </button>',
    to: '<button class="btn btn--primary btn--sm" onclick="switchStorageSubTab(\'discovery\')">\n              <i data-lucide="plus"></i> <span data-i18n="storage.bookStorageSpace">Request New Storage Space</span>\n            </button>'
  },
  // Pledge Panel
  {
    from: '<p style="font-size: 12.5px; color: var(--ks-text-muted); margin: 2px 0 0;">Apply for short-term working capital up to 75% LTV against your stored produce instead of distress selling.</p>',
    to: '<p style="font-size: 12.5px; color: var(--ks-text-muted); margin: 2px 0 0;" data-i18n="storage.pledgeFinancingSubtitle">Apply for short-term working capital up to 75% LTV against your stored produce instead of distress selling.</p>'
  },
  {
    from: '<button class="btn btn--primary btn--sm" style="background: #1565C0; border-color: #1565C0;" onclick="openPledgeModal(\'WH-MH-PUN-001\')">\n              <i data-lucide="plus"></i> New Pledge Loan Request\n            </button>',
    to: '<button class="btn btn--primary btn--sm" style="background: #1565C0; border-color: #1565C0;" onclick="openPledgeModal(\'WH-MH-PUN-001\')">\n              <i data-lucide="plus"></i> <span data-i18n="storage.applyPledgeLoan">New Pledge Loan Request</span>\n            </button>'
  },
  // Booking modal
  {
    from: '<label for="book-crop-select" style="font-size: 12px; font-weight: 700; color: #444;">Crop</label>',
    to: '<label for="book-crop-select" style="font-size: 12px; font-weight: 700; color: #444;" data-i18n="storage.cropCommodity">Crop</label>'
  },
  {
    from: '<label for="book-qty-input" style="font-size: 12px; font-weight: 700; color: #444;">Quantity (Quintals)</label>',
    to: '<label for="book-qty-input" style="font-size: 12px; font-weight: 700; color: #444;" data-i18n="storage.quantityQuintals">Quantity (Quintals)</label>'
  },
  {
    from: '<label for="book-days-input" style="font-size: 12px; font-weight: 700; color: #444;">Duration (Days)</label>',
    to: '<label for="book-days-input" style="font-size: 12px; font-weight: 700; color: #444;" data-i18n="storage.storageDuration">Duration (Days)</label>'
  },
  {
    from: '<span>Storage Rent:</span>',
    to: '<span data-i18n="storage.storageRent">Storage Rent:</span>'
  },
  {
    from: '<span>Handling & Unloading:</span>',
    to: '<span data-i18n="storage.inOutHandling">Handling & Unloading:</span>'
  },
  {
    from: '<button type="button" class="btn btn--secondary" style="flex: 1;" onclick="closeBookingModal()">Cancel</button>',
    to: '<button type="button" class="btn btn--secondary" style="flex: 1;" onclick="closeBookingModal()" data-i18n="common.cancel">Cancel</button>'
  },
  {
    from: '<button type="button" class="btn btn--secondary" style="flex: 1;" onclick="closePledgeModal()">Cancel</button>',
    to: '<button type="button" class="btn btn--secondary" style="flex: 1;" onclick="closePledgeModal()" data-i18n="common.cancel">Cancel</button>'
  },
  // My Location
  {
    from: '<button class="btn btn--secondary btn--sm" id="storage-my-loc-btn" style="height: 38px; display: flex; align-items: center; gap: 6px;">\n                <i data-lucide="crosshair"></i> <span>My Location</span>\n              </button>',
    to: '<button class="btn btn--secondary btn--sm" id="storage-my-loc-btn" style="height: 38px; display: flex; align-items: center; gap: 6px;">\n                <i data-lucide="crosshair"></i> <span data-i18n="storage.useCurrentLocation">My Location</span>\n              </button>'
  },
  // Helpline modal
  {
    from: '<h3>Kisan Support & Warehouse Helpline</h3>',
    to: '<h3 data-i18n="common.kisanHelpline">Kisan Support & Warehouse Helpline</h3>'
  }
];

replacements.forEach(r => {
  html = html.replace(r.from, r.to);
});

fs.writeFileSync(storageHtmlPath, html, 'utf8');
console.log('Successfully patched all storage.html tags!');
