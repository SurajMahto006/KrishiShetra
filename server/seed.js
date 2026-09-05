require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const FarmerProfile = require('./models/FarmerProfile');
const BuyerProfile = require('./models/BuyerProfile');
const TransportProfile = require('./models/TransportProfile');
const ProduceLot = require('./models/ProduceLot');
const Inquiry = require('./models/Inquiry');
const Order = require('./models/Order');
const TransportRequest = require('./models/TransportRequest');

const seedDatabase = async (externalMongoose = null) => {
  const isDirectRun = !externalMongoose;
  const db = externalMongoose || mongoose;

  try {
    if (isDirectRun) {
      const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishishetra';
      console.log(`Connecting to MongoDB at ${primaryUri}...`);
      await db.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to MongoDB.');
    }

    const userCount = await User.countDocuments();
    if (!isDirectRun && userCount > 0) {
      console.log(`ℹ️ Database already contains ${userCount} users. Skipping auto-seed.`);
      return;
    }

    console.log('🌱 Seeding initial demo data...');
    // Clear existing data only on explicit direct seed runs
    if (isDirectRun) {
      await Promise.all([
        User.deleteMany({}),
        FarmerProfile.deleteMany({}),
        BuyerProfile.deleteMany({}),
        TransportProfile.deleteMany({}),
        ProduceLot.deleteMany({}),
        Inquiry.deleteMany({}),
        Order.deleteMany({}),
        TransportRequest.deleteMany({})
      ]);
    }

    console.log('Seeding Users...');
    // Create Users
    const farmerUser = await User.create({
      name: 'Ramesh Patel',
      email: 'farmer@krishishetra.com',
      password: 'Farmer@123',
      phone: '9876543210',
      role: 'farmer',
      location: 'Nashik, Maharashtra',
      emailVerified: true
    });

    const buyerUser = await User.create({
      name: 'Priya Sharma',
      email: 'buyer@krishishetra.com',
      password: 'Buyer@123',
      phone: '9812345678',
      role: 'buyer',
      location: 'Pune, Maharashtra',
      emailVerified: true
    });

    const transporterUser = await User.create({
      name: 'Gurpreet Singh',
      email: 'transporter@krishishetra.com',
      password: 'Transporter@123',
      phone: '9823456789',
      role: 'transporter',
      location: 'Nagpur, Maharashtra',
      emailVerified: true
    });

    const fpoUser = await User.create({
      name: 'Sahyadri Farmers Producer Co',
      email: 'fpo@krishishetra.com',
      password: 'Fpo@123',
      phone: '9834567890',
      role: 'fpo',
      location: 'Nashik, Maharashtra',
      emailVerified: true
    });

    const adminUser = await User.create({
      name: 'Platform Administrator',
      email: 'admin@krishishetra.com',
      password: 'Admin@123',
      phone: '9800000000',
      role: 'admin',
      location: 'Mumbai, Maharashtra',
      emailVerified: true
    });

    console.log('Seeding Profiles...');
    const farmerProfile = await FarmerProfile.create({
      user: farmerUser._id,
      farmName: 'Patel Organic Farms',
      farmerType: 'individual',
      farmSize: 12.5,
      farmSizeUnit: 'acre',
      ownershipType: 'owned',
      cropsGrown: [
        { name: 'Wheat', season: 'Rabi' },
        { name: 'Onion', season: 'Kharif' },
        { name: 'Tomato', season: 'All-Season' }
      ],
      state: 'Maharashtra',
      district: 'Nashik',
      taluka: 'Dindori',
      village: 'Vani',
      pincode: '422202',
      primaryLanguage: 'mr'
    });

    await BuyerProfile.create({
      user: buyerUser._id,
      companyName: 'MahaAgro Retail & Foods Ltd',
      buyerType: 'business',
      gstNumber: '27AABCM8899K1Z5',
      businessAddress: 'Plot 42, APMC Market Yard, Gultekdi',
      state: 'Maharashtra',
      district: 'Pune',
      taluka: 'Haveli',
      village: 'Gultekdi',
      pincode: '411037',
      interestedCrops: ['Wheat', 'Onion', 'Rice', 'Tomato']
    });

    await TransportProfile.create({
      user: transporterUser._id,
      driverName: 'Gurpreet Singh',
      phone: '9823456789',
      vehicleType: 'truck',
      vehicleNumber: 'MH15AB9876',
      vehicleCapacity: 10,
      capacityUnit: 'ton',
      operatingState: 'Maharashtra',
      operatingDistrict: 'Nashik',
      isAvailable: true,
      verificationStatus: 'verified'
    });

    console.log('Seeding Produce Lots...');
    const lot1 = await ProduceLot.create({
      farmer: farmerProfile._id,
      createdBy: farmerUser._id,
      lotId: 'KS-2026-WHT001',
      cropName: 'Wheat',
      cropCategory: 'cereals_grains',
      variety: 'Sharbati Gold',
      quantity: 150,
      availableQuantity: 150,
      quantityUnit: 'quintal',
      harvestDate: new Date('2026-03-01'),
      qualityGrade: 'A',
      qualityNotes: 'Naturally grown, sorted and cleaned grain with uniform size.',
      qualityParameters: {
        moistureContent: 11.4,
        foreignMatter: 0.6,
        brokenGrains: 1.5,
        damagedGrains: 0.8,
        standard: 'Agmark / e-NAM Grain Standards (IS:14811)',
        gradeCalculationRationale: 'All physical parameters meet Grade A Agmark export/milled benchmarks.'
      },
      assaying: {
        isAssayed: true,
        verificationStatus: 'verified',
        assayerName: 'Dr. Vivek Deshmukh',
        assayerOrganization: 'NABL Accredited Quality Laboratory #MH-44',
        assayerRole: 'Senior Agricultural Assayer',
        certificateNumber: 'AGM-2026-QC-48912',
        certifiedAt: new Date('2026-03-02'),
        digitalSignature: {
          signedBy: 'Dr. Vivek Deshmukh',
          signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          timestamp: new Date('2026-03-02T10:30:00Z'),
          certId: 'CERT-AGM-2026-QC-48912'
        },
        certificateDocument: {
          fileName: 'Agmark_Certificate_48912.pdf',
          fileUrl: '',
          fileType: 'application/pdf'
        },
        labRemarks: 'Purity 99.4%, Moisture 11.4%. Grade A Premium Sharbati FAQ certified.'
      },
      aiQualityScan: {
        scannedAt: new Date('2026-03-01T14:20:00Z'),
        confidenceScore: 97.8,
        detectedDefects: [
          { defectType: 'Foreign Matter', count: 1, severity: 'Negligible', percentage: 0.6 },
          { defectType: 'Broken Grain Kernel', count: 2, severity: 'Low', percentage: 1.5 }
        ],
        summary: 'AI scan verified Grade A grain density and minimal kernel defects.'
      },
      storageType: 'warehouse',
      storageLocation: 'Nashik Warehouse Bay #4',
      askingPrice: 2850,
      priceUnit: 'quintal',
      state: 'Maharashtra',
      district: 'Nashik',
      taluka: 'Dindori',
      village: 'Vani',
      pincode: '422202',
      status: 'active'
    });

    await ProduceLot.create({
      farmer: farmerProfile._id,
      createdBy: farmerUser._id,
      lotId: 'KS-2026-ONN002',
      cropName: 'Onion',
      cropCategory: 'fruits_vegetables',
      variety: 'Red Garwa',
      quantity: 300,
      availableQuantity: 300,
      quantityUnit: 'quintal',
      harvestDate: new Date('2026-02-20'),
      qualityGrade: 'A',
      qualityNotes: 'Cured and dried red onions, suitable for long-distance transport and export.',
      qualityParameters: {
        uniformity: 93,
        ripenessIndex: 91,
        blemishPercentage: 2.1,
        avgDiameter: 58,
        standard: 'Agmark Horticultural Grading & Marking Rules',
        gradeCalculationRationale: 'Produce satisfies premium Agmark freshness, color, and size uniformity specifications.'
      },
      assaying: {
        isAssayed: true,
        verificationStatus: 'verified',
        assayerName: 'Sanjay Shinde',
        assayerOrganization: 'MahaAgri FPO Quality Assurance Cell',
        assayerRole: 'FPO Quality In-charge',
        certificateNumber: 'FPO-QC-2026-8812',
        certifiedAt: new Date('2026-02-21'),
        digitalSignature: {
          signedBy: 'Sanjay Shinde',
          signatureHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          timestamp: new Date('2026-02-21T11:00:00Z'),
          certId: 'CERT-FPO-QC-8812'
        },
        labRemarks: 'Double skin tight, dry cured necks, zero rot, export caliber.'
      },
      storageType: 'farm',
      storageLocation: 'Farm Storage Shed',
      askingPrice: 1650,
      priceUnit: 'quintal',
      state: 'Maharashtra',
      district: 'Nashik',
      taluka: 'Lasalgaon',
      village: 'Niphad',
      pincode: '422303',
      status: 'active'
    });

    await ProduceLot.create({
      farmer: farmerProfile._id,
      createdBy: farmerUser._id,
      lotId: 'KS-2026-TMT003',
      cropName: 'Tomato',
      cropCategory: 'fruits_vegetables',
      variety: 'Vaishali Hybrid',
      quantity: 80,
      availableQuantity: 80,
      quantityUnit: 'quintal',
      harvestDate: new Date('2026-03-05'),
      qualityGrade: 'B',
      qualityNotes: 'Firm red tomatoes harvested fresh, packaged in standard crates.',
      qualityParameters: {
        uniformity: 82,
        ripenessIndex: 78,
        blemishPercentage: 5.2,
        avgDiameter: 62,
        standard: 'Agmark Horticultural Grading & Marking Rules',
        gradeCalculationRationale: 'Blemish percentage (5.2%) within Grade B marketing tolerance.'
      },
      assaying: {
        isAssayed: false,
        verificationStatus: 'uninspected'
      },
      storageType: 'farm',
      storageLocation: 'Cold Storage Room',
      askingPrice: 1200,
      priceUnit: 'quintal',
      state: 'Maharashtra',
      district: 'Pune',
      taluka: 'Junnar',
      village: 'Narayangaon',
      pincode: '410504',
      status: 'active'
    });

    console.log('Seeding Inquiries, Orders, and Transport Requests...');
    const inquiry1 = await Inquiry.create({
      lot: lot1._id,
      buyer: buyerUser._id,
      farmer: farmerUser._id,
      inquiryId: 'KS-INQ-2026-001',
      offeredPrice: 2800,
      quantityRequired: 50,
      status: 'accepted',
      message: 'Interested in purchasing 50 quintals of Sharbati Gold Wheat for delivery to Pune.'
    });

    const order1 = await Order.create({
      orderId: 'KS-ORD-2026-001',
      inquiry: inquiry1._id,
      lot: lot1._id,
      buyer: buyerUser._id,
      farmer: farmerUser._id,
      cropName: 'Wheat',
      variety: 'Sharbati Gold',
      quantity: 50,
      quantityUnit: 'quintal',
      agreedPrice: 2800,
      priceUnit: 'quintal',
      totalAmount: 140000,
      deliveryAddress: {
        name: 'MahaAgro Retail & Foods Ltd',
        phone: '9812345678',
        addressLine1: 'Plot 42, APMC Market Yard',
        village: 'Gultekdi',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411037'
      },
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'online'
    });

    await TransportRequest.create({
      requestId: 'KS-TR-2026-001',
      order: order1._id,
      lot: lot1._id,
      buyer: buyerUser._id,
      farmer: farmerUser._id,
      transporter: transporterUser._id,
      pickupAddress: {
        name: 'Patel Organic Farms',
        phone: '9876543210',
        addressLine1: 'Nashik Warehouse Bay #4',
        village: 'Vani',
        district: 'Nashik',
        state: 'Maharashtra',
        pincode: '422202'
      },
      deliveryAddress: {
        name: 'MahaAgro Retail & Foods Ltd',
        phone: '9812345678',
        addressLine1: 'Plot 42, APMC Market Yard',
        village: 'Gultekdi',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411037'
      },
      cargoQuantity: 50,
      cargoUnit: 'quintal',
      vehicleType: 'truck',
      transportFee: 8500,
      status: 'requested'
    });

    console.log('\n======================================================');
    console.log('✅ KrishiShetra Demo Data Ready!');
    console.log('======================================================');
    console.log('Credentials for immediate login:');
    console.log('  👨‍🌾 Farmer:      farmer@krishishetra.com      / Farmer@123');
    console.log('  🏢 Buyer:       buyer@krishishetra.com       / Buyer@123');
    console.log('  🚚 Transporter: transporter@krishishetra.com / Transporter@123');
    console.log('  🌾 FPO:         fpo@krishishetra.com         / Fpo@123');
    console.log('  👑 Admin:       admin@krishishetra.com       / Admin@123');
    console.log('======================================================\n');

    if (isDirectRun) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (isDirectRun) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
