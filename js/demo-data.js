/**
 * KRISHISHETRA — PRESENTATION DEMO FLOW & SEED ARCHITECTURE
 * Isolated strictly to local development demo mode.
 * Production on Render will NEVER automatically consume this data.
 */
const KrishiDemo = (function () {
  function isDevDemo() {
    if (typeof window === 'undefined') return false;
    const h = window.location.hostname;
    // Strictly local development: localhost or 127.0.0.1 or file:
    return (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h === '0.0.0.0' ||
      window.location.protocol === 'file:'
    ) && !h.includes('onrender.com');
  }

  // Key participants
  const participants = {
    farmer: {
      name: 'Ramesh Patil',
      role: 'farmer',
      location: 'Navi Mumbai / nearby farm',
      phone: '+91 98201 44521',
      crop: 'Tomato',
      grade: 'Grade A',
      quantityKg: 850,
      quantityQtl: 8.5,
      harvestDate: 'Today',
      status: 'Ready for market dispatch',
      notes: 'Harvested early morning; sorted and crated into 42 standard crates.'
    },
    fpo: {
      name: 'Suresh Jadhav',
      role: 'fpo',
      org: 'Vashi Kisan Samriddhi FPC',
      cin: 'U01111MH2022PTC123456',
      location: 'Vashi Collection Hub, Navi Mumbai',
      phone: '+91 98332 10982',
      status: 'Verified & Lot Consolidated'
    },
    buyer: {
      name: 'Amit Shah',
      role: 'buyer',
      company: 'Shah Agro Trading Co.',
      location: 'Vashi APMC Market, Sector 19, Navi Mumbai',
      phone: '+91 98204 88712',
      demandCrop: 'Tomato',
      demandGrade: 'Grade A',
      demandQtyRange: '800–1,000 kg',
      offeredRatePerQ: 2920,
      status: 'Matched & Highly Interested'
    },
    transporter: {
      name: 'Vijay More',
      role: 'transporter',
      fleet: 'Vijay More Logistics / Kisan Express',
      vehicleNumber: 'MH-43-AK-2914',
      vehicleType: 'Tata 407 Agri-Carrier (Insulated)',
      pickupPoint: 'FPO Collection Hub, Navi Mumbai',
      destination: 'Vashi APMC Gate 4 Dock, Navi Mumbai',
      phone: '+91 98199 67204',
      pickupTime: '06:30 AM',
      cargo: '850 kg Grade A Tomato',
      status: 'Pickup confirmed ➔ In Transit ➔ Delivered'
    }
  };

  // Vashi market context
  const vashiMarket = {
    marketName: 'Vashi APMC (Navi Mumbai)',
    location: 'Sector 19, Vashi, Navi Mumbai',
    commodity: 'Tomato (Grade A Hybrid)',
    modalPricePerQ: 2920,
    priceRangePerQ: '₹2,700 – ₹3,100',
    todayArrivalsQtl: 1420,
    demandTrend: '+4.8% (High Demand)',
    lastUpdated: 'Today, 06:00 AM'
  };

  // Activity timeline across the whole story
  const timeline = [
    {
      time: '08:15 AM',
      title: 'Tomato Harvest Lot Created',
      actor: 'Ramesh Patil',
      role: 'farmer',
      desc: 'Ramesh Patil recorded 850 kg Grade A tomato harvest ready for market dispatch.',
      badge: 'Harvest Ready',
      badgeColor: '#2E7D32'
    },
    {
      time: '09:05 AM',
      title: 'Produce Submitted & Accepted by FPO',
      actor: 'Suresh Jadhav',
      role: 'fpo',
      desc: 'Suresh Jadhav (Vashi FPC) verified quality parameters, weighment, and accepted the lot.',
      badge: 'FPO Verified',
      badgeColor: '#1565C0'
    },
    {
      time: '09:30 AM',
      title: 'Institutional Buyer Demand Matched',
      actor: 'KrishiShetra Match Engine',
      role: 'system',
      desc: 'Demand matched with Shah Agro Trading Co. (800–1,000 kg Grade A requirement).',
      badge: 'Demand Matched',
      badgeColor: '#7B1FA2'
    },
    {
      time: '10:10 AM',
      title: 'Buyer Expressed Purchase Interest',
      actor: 'Amit Shah',
      role: 'buyer',
      desc: 'Amit Shah: "I can accept the Grade A tomato lot at the agreed Vashi market-linked price (₹2,920/q)."',
      badge: 'Offer Confirmed',
      badgeColor: '#D6A84F'
    },
    {
      time: '10:25 AM',
      title: 'FPO Consolidation Confirmed',
      actor: 'Suresh Jadhav',
      role: 'fpo',
      desc: 'Suresh Jadhav: "Received, Ramesh. We have consolidated your lot with today\'s Vashi requirement."',
      badge: 'Consolidated',
      badgeColor: '#1565C0'
    },
    {
      time: '11:00 AM',
      title: 'Transport Logistics Confirmed',
      actor: 'Vijay More',
      role: 'transporter',
      desc: 'Vijay More: "Pickup confirmed from the FPO collection point at 6:30 AM."',
      badge: 'Logistics Assigned',
      badgeColor: '#E65100'
    },
    {
      time: '11:20 AM',
      title: 'Dispatched in Transit to Vashi',
      actor: 'Vijay More (MH-43-AK-2914)',
      role: 'transporter',
      desc: 'Insulated Agri-Carrier loaded with 850 kg Tomato, GPS telemetry active.',
      badge: 'In Transit',
      badgeColor: '#1565C0'
    },
    {
      time: '12:45 PM',
      title: 'Delivery & Escrow Settlement Completed',
      actor: 'Vashi APMC Receiving Dock',
      role: 'system',
      desc: 'Full 850 kg lot received by Amit Shah at Vashi APMC. Direct payout initiated to Ramesh Patil.',
      badge: 'Completed ✓',
      badgeColor: '#2E7D32'
    }
  ];

  // Dispute #KS-1024
  const demoDispute = {
    disputeId: 'KS-1024',
    orderId: 'KS-ORD-VASHI-1024',
    cropName: 'Tomato',
    quantity: 8.5,
    quantityUnit: 'Qtl (850 kg)',
    orderAmount: 24820,
    reason: 'Quantity received differs from dispatched quantity.',
    description: 'Quantity received differs from dispatched quantity.',
    status: 'Under Review',
    farmer: 'Ramesh Patil',
    buyer: 'Amit Shah',
    fpo: 'Suresh Jadhav',
    timeline: [
      {
        speaker: 'Ramesh Patil',
        note: '850 kg dispatched from FPO collection point.',
        role: 'farmer',
        time: 'Today, 11:30 AM'
      },
      {
        speaker: 'Amit Shah',
        note: 'Delivery received with 820 kg recorded at unloading dock scale.',
        role: 'buyer',
        time: 'Today, 01:15 PM'
      },
      {
        speaker: 'Suresh Jadhav (FPO)',
        note: 'Verifying weighment records and digital scale tare at collection scale.',
        role: 'fpo',
        time: 'Today, 02:00 PM'
      }
    ],
    resolution: 'Under review'
  };

  const STATE_STORAGE_KEY = 'krishi_demo_flow_state';

  function getFlowState() {
    if (!isDevDemo()) return null;
    try {
      const saved = localStorage.getItem(STATE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default initial presentation flow state
    return {
      stage: 'ready', // 'ready' | 'submitted_fpo' | 'fpo_accepted' | 'buyer_matched' | 'in_transit' | 'delivered'
      farmerSentToFpo: false,
      fpoAccepted: false,
      buyerAccepted: false,
      transporterDelivered: false
    };
  }

  function setFlowState(patch) {
    if (!isDevDemo()) return;
    const current = getFlowState();
    const updated = { ...current, ...patch };
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  function resetDemo() {
    if (!isDevDemo()) return;
    localStorage.removeItem(STATE_STORAGE_KEY);
    sessionStorage.removeItem('krishi_dismiss_profile_card');
    return getFlowState();
  }

  return {
    isDevDemo,
    participants,
    vashiMarket,
    timeline,
    demoDispute,
    getFlowState,
    setFlowState,
    resetDemo
  };
})();

if (typeof window !== 'undefined') {
  window.KrishiDemo = KrishiDemo;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KrishiDemo;
}
