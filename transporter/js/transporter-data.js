/**
 * KrishiShetra Transporter Portal - Mock Data Store & State Engine
 */

const TransporterData = {
  profile: {
    name: "Kisan Express Logistics",
    owner: "Virendra Patil",
    tagline: "KrishiShetra Gold Tier Verified Agri-Fleet",
    id: "TR-MH-8902",
    gstin: "27AAECK1298P1Z8",
    pan: "AAECK1298P",
    phone: "+91 98230 45891",
    email: "ops@kisanexpress.in",
    city: "Nashik, Maharashtra",
    fleetSize: 14,
    activeDrivers: 12,
    rating: 4.9,
    tripsCompleted: 486,
    onTimeDelivery: "97.8%",
    kycStatus: "Verified",
    primaryRoutes: ["Nashik ➔ Mumbai APMC", "Pune ➔ Surat APMC", "Indore ➔ Ahmedabad", "Nagpur ➔ Hyderabad"],
    bankDetails: {
      accountName: "Kisan Express Logistics Pvt Ltd",
      accountNumber: "50200049281729",
      bankName: "HDFC Bank (Nashik City Branch)",
      ifsc: "HDFC0001048",
      upiId: "kisanlogistics@hdfcbank"
    }
  },

  verification: {
    dl: { status: "Verified", number: "MH-15-2016-003892", validity: "2031-08-14", docType: "Commercial HMV" },
    rc: { status: "Verified", totalRegistered: 14, pendingReview: 0 },
    permit: { status: "Verified", type: "All India National Goods Permit (Form 48)", validity: "2028-11-20" },
    fastag: { status: "Active", balance: "₹14,850", autoRecharge: true },
    insurance: { status: "Valid", activePolicies: 14, expiringSoon: 1 },
    panGst: { status: "Verified", verifiedOn: "12 May 2024" }
  },

  kpis: {
    activeTrips: 5,
    availableLoads: 18,
    fleetUtilization: "85.7%",
    monthlyEarnings: "₹4,82,400",
    pendingPayout: "₹92,500",
    fastagBalance: "₹14,850",
    onTimeRate: "97.8%",
    driverSafetyScore: "9.4 / 10"
  },

  availableLoads: [
    {
      id: "LD-8042",
      commodity: "Red Onions (Nashik Premium)",
      icon: "🧅",
      fpoName: "Pimpalgaon Farmer Producer Co.",
      origin: "Pimpalgaon Mandi, Nashik (MH)",
      destination: "Vashi APMC Market, Navi Mumbai (MH)",
      distance: "185 km",
      transitEst: "5.5 hrs",
      weightMT: 18.5,
      truckRequired: "10-Wheeler Open Body / Tarpaulin",
      ratePerMT: 1850,
      totalPayout: 34225,
      pickupDate: "Today, 06:30 PM",
      perishability: "Medium",
      tempRequired: "Ambient / Ventilated",
      urgency: "High Priority",
      notes: "Direct farm loading at Pimpalgaon. Labor provided by FPO for loading.",
      paymentTerms: "80% on loading, 20% on POD OTP submission"
    },
    {
      id: "LD-8043",
      commodity: "Alphonso & Kesar Mangoes",
      icon: "🥭",
      fpoName: "Ratnagiri Konkan Bagayatdar Sangh",
      origin: "Ratnagiri Mandi Yard (MH)",
      destination: "Azadpur Mandi, New Delhi (DL)",
      distance: "1,640 km",
      transitEst: "36 hrs",
      weightMT: 12.0,
      truckRequired: "32ft Cold-Chain Reefer (12°C - 15°C)",
      ratePerMT: 6800,
      totalPayout: 81600,
      pickupDate: "Tomorrow, 08:00 AM",
      perishability: "Critical Cold Chain",
      tempRequired: "+13°C ± 1°C Controlled",
      urgency: "Express",
      notes: "Export-grade mango crates. Continuous temperature telemetry required.",
      paymentTerms: "50% Advance via UPI, 50% immediately upon gate entry"
    },
    {
      id: "LD-8044",
      commodity: "Sharbati Wheat (Grade A)",
      icon: "🌾",
      fpoName: "Malwa Krishi Vikas FPC",
      origin: "Sehore Krishi Mandi, Bhopal (MP)",
      destination: "Surat Grain Market, Gujarat (GJ)",
      distance: "590 km",
      transitEst: "14 hrs",
      weightMT: 25.0,
      truckRequired: "22ft Multi-Axle / 12-Wheeler",
      ratePerMT: 2200,
      totalPayout: 55000,
      pickupDate: "02 Sep 2026",
      perishability: "Low (Dry Goods)",
      tempRequired: "Dry Waterproof Covered",
      urgency: "Standard",
      notes: "Moisture-sealed 50kg gunny bags. Weight bridge slips required at both ends.",
      paymentTerms: "100% Guaranteed Escrow by KrishiShetra"
    },
    {
      id: "LD-8045",
      commodity: "Fresh Table Potatoes",
      icon: "🥔",
      fpoName: "Deesa Cold Storage Agro FPO",
      origin: "Deesa Mandi Yard, Banaskantha (GJ)",
      destination: "Pune APMC Market (MH)",
      distance: "720 km",
      transitEst: "16 hrs",
      weightMT: 16.0,
      truckRequired: "14ft / 19ft Eicher Closed Body",
      ratePerMT: 2650,
      totalPayout: 42400,
      pickupDate: "Today, 10:00 PM",
      perishability: "Medium-High",
      tempRequired: "Well Ventilated",
      urgency: "Urgent",
      notes: "Pre-graded Jyoti potatoes. Fast gate pass ready at Deesa.",
      paymentTerms: "90% on dispatch, 10% on unloading POD"
    },
    {
      id: "LD-8046",
      commodity: "Bhagwa Pomegranates",
      icon: "🍎",
      fpoName: "Solapur Anar Utpadak Sangh",
      origin: "Solapur Mandi Terminal (MH)",
      destination: "Bengaluru KR Market (KA)",
      distance: "610 km",
      transitEst: "13.5 hrs",
      weightMT: 14.5,
      truckRequired: "20ft Insulated Container",
      ratePerMT: 3100,
      totalPayout: 44950,
      pickupDate: "Tomorrow, 02:00 PM",
      perishability: "High",
      tempRequired: "+8°C to +10°C",
      urgency: "Normal",
      notes: "Packed in corrugated export boxes. Handle with cushioned loading.",
      paymentTerms: "Direct NEFT settlement within 4 hours of delivery"
    }
  ],

  activeTrips: [
    {
      id: "TRIP-9021",
      loadId: "LD-7988",
      vehicleNo: "MH 15 EG 4820",
      vehicleModel: "Tata Signa 2823.K (10-Wheeler)",
      driverName: "Sanjay Shinde",
      driverPhone: "+91 94221 88471",
      driverAvatar: "SS",
      commodity: "Nashik Spring Onions (18 MT)",
      origin: "Lasalgaon Mandi (MH)",
      destination: "Vashi APMC (Navi Mumbai)",
      status: "In Transit",
      statusBadgeClass: "in-transit",
      progressPct: 68,
      currentLocation: "Kasara Ghat, NH-160",
      speedKmh: "48 km/h",
      eta: "Today, 09:45 PM (In 1 hr 20 min)",
      totalDistance: "192 km",
      completedDistance: "131 km",
      eWayBill: "EWB-9104-8821-0941",
      reeferTemp: "24°C (Normal)",
      tollCrossed: "Igatpuri Toll Plaza (₹215 paid via FASTag)",
      telemetry: {
        engineHealth: "Optimal (94%)",
        fuelLevel: "68%",
        driverStatus: "Active / Alert",
        geofence: "On Route / No Deviation"
      }
    },
    {
      id: "TRIP-9022",
      loadId: "LD-7992",
      vehicleNo: "MH 15 BX 1094",
      vehicleModel: "BharatBenz 32ft Cold Reefer",
      driverName: "Rameshwar Gavit",
      driverPhone: "+91 98902 33119",
      driverAvatar: "RG",
      commodity: "Kashmir Red Apples (14 MT)",
      origin: "Sopore Cold Hub (J&K)",
      destination: "Pune APMC Cold Chain Hub",
      status: "At Toll Plaza",
      statusBadgeClass: "toll-plaza",
      progressPct: 84,
      currentLocation: "Khed-Shivapur Toll Plaza (MH)",
      speedKmh: "0 km/h (At Toll)",
      eta: "Tonight, 11:15 PM",
      totalDistance: "2,140 km",
      completedDistance: "1,798 km",
      eWayBill: "EWB-4419-2091-8843",
      reeferTemp: "+2.8°C (Set: +3.0°C)",
      tollCrossed: "Shirwal Toll Plaza",
      telemetry: {
        engineHealth: "Optimal (91%)",
        fuelLevel: "42%",
        driverStatus: "Active",
        geofence: "On Route"
      }
    },
    {
      id: "TRIP-9023",
      loadId: "LD-8001",
      vehicleNo: "MH 15 DK 8812",
      vehicleModel: "Eicher Pro 2049 (14ft)",
      driverName: "Dnyaneshwar Jadhav",
      driverPhone: "+91 97632 10948",
      driverAvatar: "DJ",
      commodity: "Farm Fresh Green Chilles (7.5 MT)",
      origin: "Jalgaon Mandi Yard (MH)",
      destination: "Surat APMC (GJ)",
      status: "In Transit",
      statusBadgeClass: "in-transit",
      progressPct: 42,
      currentLocation: "Navapur Highway Border",
      speedKmh: "54 km/h",
      eta: "Tomorrow, 04:00 AM",
      totalDistance: "310 km",
      completedDistance: "130 km",
      eWayBill: "EWB-6638-1194-0012",
      reeferTemp: "Ventilated ambient",
      tollCrossed: "Songadh Tollway",
      telemetry: {
        engineHealth: "Good",
        fuelLevel: "80%",
        driverStatus: "Active",
        geofence: "On Route"
      }
    },
    {
      id: "TRIP-9024",
      loadId: "LD-8010",
      vehicleNo: "MH 15 CP 3391",
      vehicleModel: "Tata 407 LPT Open Body",
      driverName: "Ankush Borde",
      driverPhone: "+91 96570 99412",
      driverAvatar: "AB",
      commodity: "Organic Tomatoes (6 MT)",
      origin: "Narayangaon Tomato Hub (MH)",
      destination: "Dadar Market, Mumbai (MH)",
      status: "Loading at Farm",
      statusBadgeClass: "loading",
      progressPct: 15,
      currentLocation: "Narayangaon FPO Warehouse Dock #2",
      speedKmh: "0 km/h (Docked)",
      eta: "Tomorrow, 05:30 AM",
      totalDistance: "165 km",
      completedDistance: "0 km",
      eWayBill: "EWB-1109-8472-3321",
      reeferTemp: "Ambient",
      tollCrossed: "Pending Departure",
      telemetry: {
        engineHealth: "Good",
        fuelLevel: "95%",
        driverStatus: "Loading Supervised",
        geofence: "At Origin Dock"
      }
    }
  ],

  fleet: [
    { id: "VEH-01", regNo: "MH 15 EG 4820", type: "10-Wheeler Open Body", capacity: "18.5 MT", driver: "Sanjay Shinde", status: "Active (On Trip)", rcExpiry: "2029-04-12", fitnessExpiry: "2027-02-18", insuranceExpiry: "2027-01-20", gpsSignal: "Live" },
    { id: "VEH-02", regNo: "MH 15 BX 1094", type: "32ft Cold Reefer", capacity: "14.0 MT", driver: "Rameshwar Gavit", status: "Active (On Trip)", rcExpiry: "2030-08-10", fitnessExpiry: "2026-11-30", insuranceExpiry: "2026-10-15", gpsSignal: "Live" },
    { id: "VEH-03", regNo: "MH 15 DK 8812", type: "Eicher Pro 14ft", capacity: "8.0 MT", driver: "Dnyaneshwar Jadhav", status: "Active (On Trip)", rcExpiry: "2028-06-25", fitnessExpiry: "2027-08-14", insuranceExpiry: "2027-05-19", gpsSignal: "Live" },
    { id: "VEH-04", regNo: "MH 15 CP 3391", type: "Tata 407 LPT", capacity: "6.0 MT", driver: "Ankush Borde", status: "Loading", rcExpiry: "2027-09-18", fitnessExpiry: "2026-09-25", insuranceExpiry: "2026-09-30", gpsSignal: "Live" },
    { id: "VEH-05", regNo: "MH 15 AA 9921", type: "22ft Multi-Axle Heavy", capacity: "25.0 MT", driver: "Prakash More", status: "Available", rcExpiry: "2031-01-14", fitnessExpiry: "2027-10-11", insuranceExpiry: "2027-03-24", gpsSignal: "Standby" },
    { id: "VEH-06", regNo: "MH 15 KL 5042", type: "20ft Insulated Container", capacity: "12.0 MT", driver: "Sachin Gaikwad", status: "Available", rcExpiry: "2029-12-05", fitnessExpiry: "2027-04-20", insuranceExpiry: "2027-08-11", gpsSignal: "Standby" },
    { id: "VEH-07", regNo: "MH 15 FT 7731", type: "Tata 1109 Heavy Duty", capacity: "10.5 MT", driver: "Balasaheb Shirole", status: "Maintenance", rcExpiry: "2028-03-19", fitnessExpiry: "2026-09-10", insuranceExpiry: "2026-12-05", gpsSignal: "Workshop" }
  ],

  drivers: [
    { id: "DRV-01", name: "Sanjay Shinde", phone: "+91 94221 88471", dlNumber: "MH15-2012004819", dlType: "Commercial Heavy (HMV)", assignedTruck: "MH 15 EG 4820", experience: "14 yrs", safetyRating: 4.95, trips: 142, status: "On Duty" },
    { id: "DRV-02", name: "Rameshwar Gavit", phone: "+91 98902 33119", dlNumber: "MH15-2015009124", dlType: "Commercial Cold Chain / HMV", assignedTruck: "MH 15 BX 1094", experience: "11 yrs", safetyRating: 4.88, trips: 118, status: "On Duty" },
    { id: "DRV-03", name: "Dnyaneshwar Jadhav", phone: "+91 97632 10948", dlNumber: "MH15-2017003411", dlType: "Commercial Medium (LMV/HMV)", assignedTruck: "MH 15 DK 8812", experience: "8 yrs", safetyRating: 4.90, trips: 94, status: "On Duty" },
    { id: "DRV-04", name: "Ankush Borde", phone: "+91 96570 99412", dlNumber: "MH15-2019001994", dlType: "Commercial LMV", assignedTruck: "MH 15 CP 3391", experience: "6 yrs", safetyRating: 4.82, trips: 72, status: "On Duty" },
    { id: "DRV-05", name: "Prakash More", phone: "+91 91580 44219", dlNumber: "MH15-2010008812", dlType: "Commercial Heavy (Trailer / HMV)", assignedTruck: "MH 15 AA 9921", experience: "16 yrs", safetyRating: 4.98, trips: 180, status: "Available" },
    { id: "DRV-06", name: "Sachin Gaikwad", phone: "+91 98229 11094", dlNumber: "MH15-2018005523", dlType: "Commercial HMV", assignedTruck: "MH 15 KL 5042", experience: "7 yrs", safetyRating: 4.85, trips: 65, status: "Available" }
  ],

  earnings: {
    monthlyGross: 482400,
    fuelExpenses: 164000,
    tollExpenses: 34800,
    driverBata: 48000,
    platformFee: 9600,
    netProfit: 226000,
    walletBalance: 92500,
    fastagWallet: 14850,
    monthlyBreakdown: [
      { month: "Mar", gross: 380000, net: 178000 },
      { month: "Apr", gross: 420000, net: 195000 },
      { month: "May", gross: 460000, net: 215000 },
      { month: "Jun", gross: 410000, net: 189000 },
      { month: "Jul", gross: 445000, net: 208000 },
      { month: "Aug", gross: 482400, net: 226000 }
    ],
    recentInvoices: [
      { id: "INV-2026-881", date: "28 Aug 2026", fpo: "Nashik Onion FPO", amount: "₹34,225", status: "Paid", route: "Pimpalgaon ➔ Mumbai" },
      { id: "INV-2026-880", date: "24 Aug 2026", fpo: "Malwa Krishi FPC", amount: "₹55,000", status: "Paid", route: "Sehore ➔ Surat" },
      { id: "INV-2026-879", date: "21 Aug 2026", fpo: "Konkan Bagayatdar Sangh", amount: "₹81,600", status: "Settled", route: "Ratnagiri ➔ Delhi" },
      { id: "INV-2026-878", date: "18 Aug 2026", fpo: "Deesa Potato Agro", amount: "₹42,400", status: "Paid", route: "Deesa ➔ Pune" }
    ]
  }
};

window.TransporterData = TransporterData;
