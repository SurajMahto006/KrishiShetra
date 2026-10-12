const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');
const {
  extractCanonicalPayload,
  computeCanonicalHash,
  evaluateTransactionRisk
} = require('./transactionRiskService');

/**
 * @title EVMAuditService
 * @notice Durable outbox worker and Ethereum Sepolia verification client for KrishiShetra.
 * @dev Strict Safeguards:
 * 1. Network: Ethereum Sepolia ONLY (Chain ID: 11155111 / 0xaa36a7). NEVER MAINNET.
 * 2. Privacy: ZERO personal data or order addresses on-chain. Anchors only cryptographic hashes.
 * 3. Non-blocking: Order execution path is fully isolated from RPC latency and gas fluctuations.
 * 4. Resilient: If blockchain environment variables are unconfigured, logs and proceeds gracefully.
 */

const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;
const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';
const MAX_OUTBOX_RETRIES = 5;

// Pure JS Keccak-256 implementation conforming to Ethereum standard (FIPS-202 with 0x01 pad)
function keccak256(data) {
  const RC = [
    0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
    0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
    0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
    0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
    0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
    0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n
  ];
  const RHO = [
     0,  1, 62, 28, 27,
    36, 44,  6, 55, 20,
     3, 10, 43, 25, 39,
    41, 45, 15, 21,  8,
    18,  2, 61, 56, 14
  ];
  const PI = [
     0, 10, 20,  5, 15,
    16,  1, 11, 21,  6,
     7, 17,  2, 12, 22,
    23,  8, 18,  3, 13,
    14, 24,  9, 19,  4
  ];

  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, typeof data === 'string' ? 'utf8' : undefined);
  const rate = 136;
  const len = buf.length;
  const padLen = rate - (len % rate);
  const padded = Buffer.alloc(len + padLen);
  buf.copy(padded);
  padded[len] = 0x01;
  padded[padded.length - 1] |= 0x80;

  const state = new BigUint64Array(25);
  for (let offset = 0; offset < padded.length; offset += rate) {
    for (let i = 0; i < rate / 8; i++) {
      state[i] ^= padded.readBigUInt64LE(offset + i * 8);
    }
    for (let round = 0; round < 24; round++) {
      const C = new BigUint64Array(5);
      for (let x = 0; x < 5; x++) C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
      const D = new BigUint64Array(5);
      for (let x = 0; x < 5; x++) {
        const left = C[(x + 1) % 5];
        const rot = (left << 1n) | (left >> 63n);
        D[x] = C[(x + 4) % 5] ^ rot;
      }
      for (let i = 0; i < 25; i++) state[i] ^= D[i % 5];
      const B = new BigUint64Array(25);
      for (let i = 0; i < 25; i++) {
        const shift = BigInt(RHO[i]);
        B[PI[i]] = (state[i] << shift) | (state[i] >> (64n - shift));
      }
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const idx = y * 5 + x;
          state[idx] = B[idx] ^ ((~B[y * 5 + ((x + 1) % 5)]) & B[y * 5 + ((x + 2) % 5)]);
        }
      }
      state[0] ^= RC[round];
    }
  }
  const out = Buffer.alloc(32);
  for (let i = 0; i < 4; i++) out.writeBigUInt64LE(state[i], i * 8);
  return `0x${out.toString('hex')}`;
}

/**
 * Compute deterministic recordKey = keccak256(abi.encodePacked(orderId, eventType, payloadHash))
 */
function computeRecordKey(orderId, eventType, payloadHash) {
  const cleanHash = String(payloadHash).replace(/^0x/, '');
  const hashBuf = Buffer.from(cleanHash, 'hex');
  const packed = Buffer.concat([
    Buffer.from(String(orderId), 'utf8'),
    Buffer.from(String(eventType), 'utf8'),
    hashBuf
  ]);
  return keccak256(packed);
}

/**
 * Environment configuration loader
 */
function getConfig() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.EVM_RPC_URL || '';
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY || process.env.EVM_PRIVATE_KEY || '';
  const contractAddress = process.env.SEPOLIA_AUDIT_CONTRACT_ADDRESS || process.env.AUDIT_CONTRACT_ADDRESS || '';

  const isConfigured = Boolean(rpcUrl && contractAddress);

  return {
    rpcUrl,
    privateKey,
    contractAddress,
    isConfigured
  };
}

/**
 * Send standard JSON-RPC HTTP request
 */
async function sendJsonRpc(method, params = []) {
  const { rpcUrl } = getConfig();
  if (!rpcUrl) {
    throw new Error('SEPOLIA_RPC_URL is not configured');
  }

  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`RPC HTTP error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`RPC call error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data.result;
}

/**
 * Verify network chain ID is Sepolia (11155111 / 0xaa36a7)
 */
async function verifyNetworkIsSepolia() {
  const chainIdHex = await sendJsonRpc('eth_chainId');
  const chainIdDec = parseInt(chainIdHex, 16);
  if (chainIdDec !== SEPOLIA_CHAIN_ID_DECIMAL) {
    throw new Error(
      `Chain ID mismatch! Connected to ${chainIdDec} (${chainIdHex}), but Sepolia requires ${SEPOLIA_CHAIN_ID_DECIMAL} (${SEPOLIA_CHAIN_ID_HEX}). Execution halted for safety.`
    );
  }
  return true;
}

/**
 * Queue an audit event into the durable outbox
 * Called asynchronously from Order lifecycle transitions.
 */
async function queueAuditJob(order, eventType) {
  try {
    if (!order || !order.orderId) return null;

    const canonicalPayload = extractCanonicalPayload(order);
    const canonicalPayloadHash = computeCanonicalHash(canonicalPayload);
    const riskAssessment = evaluateTransactionRisk(order, eventType);

    const idempotencyKey = `${order.orderId}:${eventType}:${canonicalPayloadHash}`;

    // Check if an audit log for this exact event hash already exists
    const existing = await AuditLog.findOne({ idempotencyKey });
    if (existing) {
      return existing;
    }

    const { contractAddress, isConfigured } = getConfig();
    const recordKey = computeRecordKey(order.orderId, eventType, canonicalPayloadHash);

    const auditLog = await AuditLog.create({
      orderId: order.orderId,
      orderObjectId: order._id,
      eventType,
      idempotencyKey,
      canonicalPayloadHash,
      canonicalPayload,
      riskAssessment,
      outboxStatus: isConfigured ? 'PENDING' : 'SKIPPED_UNCONFIGURED',
      onChainDetails: {
        network: 'Ethereum Sepolia',
        chainId: SEPOLIA_CHAIN_ID_DECIMAL,
        contractAddress,
        recordKey,
        lastError: isConfigured ? '' : 'Sepolia testnet credentials not configured in environment.'
      }
    });

    // If configured, trigger asynchronous worker
    if (isConfigured) {
      setImmediate(() => {
        processOutboxJob(auditLog._id).catch(err => {
          console.warn(`[AuditOutbox] Background worker notice for order ${order.orderId}:`, err.message);
        });
      });
    }

    return auditLog;
  } catch (error) {
    // Audit failure must NEVER crash or block the primary order execution
    console.error(`[AuditOutbox] Failed to queue audit job for order ${order ? order.orderId : 'unknown'}:`, error.message);
    return null;
  }
}

/**
 * Decode the ABI-encoded return data for getAuditRecord(bytes32)
 * Tuple signature: (string orderId, string eventType, bytes32 payloadHash, bytes32 riskHash, uint8 riskScore, uint256 timestamp, uint256 blockNumber, address recordedBy, bool exists)
 * Static head has 9 words (9 * 64 = 576 hex characters).
 */
function decodeGetAuditRecord(rawHex) {
  if (!rawHex || typeof rawHex !== 'string') return null;
  const hex = rawHex.replace(/^0x/, '');
  if (hex.length < 576) return null;

  const getWord = (idx) => hex.slice(idx * 64, (idx + 1) * 64);

  const payloadHashWord = getWord(2);
  const riskHashWord = getWord(3);
  const riskScoreWord = getWord(4);
  const timestampWord = getWord(5);
  const blockNumberWord = getWord(6);
  const recordedByWord = getWord(7);
  const existsWord = getWord(8);

  const exists = parseInt(existsWord, 16) === 1;
  const payloadHash = `0x${payloadHashWord}`;
  const riskHash = `0x${riskHashWord}`;
  const riskScore = parseInt(riskScoreWord, 16);
  const timestamp = parseInt(timestampWord, 16);
  const blockNumber = parseInt(blockNumberWord, 16);
  const recordedBy = `0x${recordedByWord.slice(24)}`;

  return {
    exists,
    payloadHash,
    riskHash,
    riskScore,
    timestamp,
    blockNumber,
    recordedBy
  };
}

/**
 * Process a single outbox entry with durable retry, atomic claiming, and exponential backoff
 */
async function processOutboxJob(auditLogId) {
  // Atomically claim the job to prevent overlapping execution
  const auditLog = await AuditLog.findOneAndUpdate(
    {
      _id: auditLogId,
      outboxStatus: { $in: ['PENDING', 'PROCESSING'] }
    },
    {
      $set: {
        outboxStatus: 'PROCESSING',
        updatedAt: new Date()
      }
    },
    { new: true }
  );

  if (!auditLog) {
    return;
  }

  const { isConfigured, privateKey, contractAddress } = getConfig();
  if (!isConfigured) {
    auditLog.outboxStatus = 'SKIPPED_UNCONFIGURED';
    auditLog.onChainDetails.lastError = 'Sepolia testnet credentials unconfigured.';
    await auditLog.save();
    return;
  }

  try {
    // Verify network is strictly Sepolia before proceeding
    await verifyNetworkIsSepolia();

    // Check if ethers is available for transaction signing
    let ethersModule = null;
    try {
      ethersModule = require('ethers');
    } catch (_) {
      ethersModule = null;
    }

    if (!privateKey || !ethersModule) {
      // If private key or ethers is not available, cannot sign raw transaction
      auditLog.outboxStatus = 'SKIPPED_UNCONFIGURED';
      auditLog.onChainDetails.lastError = !privateKey
        ? 'SEPOLIA_PRIVATE_KEY missing in environment variables.'
        : 'EVM transaction signing module not installed. Outbox ready for submission once relayer connects.';
      await auditLog.save();
      return;
    }

    // Submit transaction via ethers wallet on Sepolia
    const provider = new ethersModule.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || process.env.EVM_RPC_URL);
    const wallet = new ethersModule.Wallet(privateKey, provider);

    const abi = [
      'function recordAuditEntry(string orderId, string eventType, bytes32 payloadHash, bytes32 riskHash, uint8 riskScore) external returns (bytes32)'
    ];

    const contract = new ethersModule.Contract(contractAddress, abi, wallet);

    const tx = await contract.recordAuditEntry(
      auditLog.orderId,
      auditLog.eventType,
      auditLog.canonicalPayloadHash,
      auditLog.riskAssessment.riskHash,
      auditLog.riskAssessment.score
    );

    const receipt = await tx.wait(1);

    auditLog.outboxStatus = 'CONFIRMED_ON_CHAIN';
    auditLog.onChainDetails.txHash = receipt.hash;
    auditLog.onChainDetails.blockNumber = receipt.blockNumber;
    auditLog.onChainDetails.confirmedAt = new Date();
    auditLog.onChainDetails.lastError = '';
    await auditLog.save();
  } catch (err) {
    const nextRetry = (auditLog.onChainDetails.retryCount || 0) + 1;
    auditLog.onChainDetails.retryCount = nextRetry;
    auditLog.onChainDetails.lastError = err.message || String(err);

    if (nextRetry >= MAX_OUTBOX_RETRIES) {
      auditLog.outboxStatus = 'FAILED';
    } else {
      auditLog.outboxStatus = 'PENDING';
      // Exponential backoff: 5s, 10s, 20s, 40s...
      const delayMs = Math.min(300000, Math.pow(2, nextRetry) * 5000);
      auditLog.onChainDetails.nextRetryAt = new Date(Date.now() + delayMs);
    }
    await auditLog.save();
  }
}

/**
 * Concurrency-guarded sweep worker for outbox recovery across server restarts
 */
let isWorkerRunning = false;
let outboxIntervalTimer = null;
const STALE_PROCESSING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

async function sweepOutbox() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;

  try {
    const { isConfigured } = getConfig();
    if (!isConfigured) return;

    // 1. Recover stale PROCESSING jobs
    const staleThreshold = new Date(Date.now() - STALE_PROCESSING_TIMEOUT_MS);
    await AuditLog.updateMany(
      {
        outboxStatus: 'PROCESSING',
        updatedAt: { $lt: staleThreshold }
      },
      {
        $set: {
          outboxStatus: 'PENDING',
          'onChainDetails.lastError': 'Recovered from interrupted processing state.'
        }
      }
    );

    // 2. Find eligible PENDING jobs respecting retry time and max retries
    const eligibleJobs = await AuditLog.find({
      outboxStatus: 'PENDING',
      'onChainDetails.nextRetryAt': { $lte: new Date() },
      'onChainDetails.retryCount': { $lt: MAX_OUTBOX_RETRIES }
    })
      .sort({ createdAt: 1 })
      .limit(10);

    for (const job of eligibleJobs) {
      try {
        await processOutboxJob(job._id);
      } catch (jobErr) {
        console.warn(`[AuditOutboxWorker] Error processing job ${job._id}:`, jobErr.message);
      }
    }
  } catch (err) {
    console.warn('[AuditOutboxWorker] Sweep encountered error:', err.message);
  } finally {
    isWorkerRunning = false;
  }
}

/**
 * Start background recovery worker for outbox resilience across server restarts
 */
function startOutboxWorker(intervalMs = 30000) {
  if (outboxIntervalTimer) return;

  console.log('✓ KrishiShetra Audit Outbox recovery worker initialized');
  // Initial sweep after brief startup delay
  setTimeout(() => {
    sweepOutbox().catch(() => {});
  }, 2000);

  // Periodic recurring sweep
  outboxIntervalTimer = setInterval(() => {
    sweepOutbox().catch(() => {});
  }, intervalMs);

  if (outboxIntervalTimer.unref) {
    outboxIntervalTimer.unref();
  }
}

/**
 * Verify order audit trail on-chain against Ethereum Sepolia
 * @param {String} orderId
 * @returns {Object} Cryptographic verification report
 */
async function verifyOrderOnChain(orderId) {
  const auditLogs = await AuditLog.find({ orderId }).sort({ createdAt: 1 });

  if (!auditLogs || auditLogs.length === 0) {
    return {
      orderId,
      status: 'INSUFFICIENT_DATA',
      message: 'No audit records registered for this order.',
      records: []
    };
  }

  const { isConfigured, contractAddress } = getConfig();

  if (!isConfigured) {
    return {
      orderId,
      status: 'UNAVAILABLE',
      message: 'Sepolia testnet is not configured in environment. Displaying local tamper-evident hash trail.',
      records: auditLogs.map(log => ({
        eventType: log.eventType,
        idempotencyKey: log.idempotencyKey,
        canonicalPayloadHash: log.canonicalPayloadHash,
        riskScore: log.riskAssessment.score,
        riskLevel: log.riskAssessment.level,
        riskHash: log.riskAssessment.riskHash,
        outboxStatus: log.outboxStatus,
        createdAt: log.createdAt
      }))
    };
  }

  const verifiedRecords = [];
  let overallStatus = 'CONFIRMED_ON_CHAIN';

  for (const log of auditLogs) {
    const recordKey = log.onChainDetails.recordKey || computeRecordKey(log.orderId, log.eventType, log.canonicalPayloadHash);

    let onChainResult = null;
    let recordStatus = log.outboxStatus;

    try {
      // Function selector for getAuditRecord(bytes32): 0x1f4b1c9e
      const cleanKey = recordKey.replace(/^0x/, '').padStart(64, '0');
      const callData = `0x1f4b1c9e${cleanKey}`;

      const rawHex = await sendJsonRpc('eth_call', [
        { to: contractAddress, data: callData },
        'latest'
      ]);

      const decoded = decodeGetAuditRecord(rawHex);

      if (decoded && decoded.exists) {
        const localHash = String(log.canonicalPayloadHash || '').toLowerCase();
        const onChainHash = String(decoded.payloadHash || '').toLowerCase();

        if (localHash === onChainHash) {
          recordStatus = 'CONFIRMED_ON_CHAIN';
          onChainResult = {
            verifiedOnChain: true,
            existsOnChain: true,
            contractAddress,
            recordKey,
            onChainPayloadHash: decoded.payloadHash,
            localPayloadHash: log.canonicalPayloadHash,
            riskScoreOnChain: decoded.riskScore,
            txHash: log.onChainDetails.txHash || null,
            blockNumber: log.onChainDetails.blockNumber || decoded.blockNumber || null,
            hashMatched: true
          };
        } else {
          // On-chain record exists, but hashes deviate -> Tamper detected!
          recordStatus = 'MISMATCH';
          overallStatus = 'MISMATCH';
          onChainResult = {
            verifiedOnChain: false,
            existsOnChain: true,
            contractAddress,
            recordKey,
            onChainPayloadHash: decoded.payloadHash,
            localPayloadHash: log.canonicalPayloadHash,
            riskScoreOnChain: decoded.riskScore,
            hashMatched: false,
            warning: 'Tamper detected: on-chain payload hash does not match local canonical payload hash!'
          };
        }
      } else {
        // Record does not exist on-chain yet
        recordStatus = log.outboxStatus === 'FAILED' ? 'FAILED' : 'PENDING';
        if (overallStatus !== 'MISMATCH') {
          overallStatus = recordStatus;
        }
        onChainResult = {
          verifiedOnChain: false,
          existsOnChain: false,
          recordKey,
          message: 'Record not found on Sepolia ledger yet.'
        };
      }
    } catch (err) {
      recordStatus = log.outboxStatus === 'FAILED' ? 'FAILED' : 'PENDING';
      if (overallStatus !== 'MISMATCH') overallStatus = 'PENDING';
      onChainResult = {
        verifiedOnChain: false,
        rpcError: err.message || 'RPC communication failure'
      };
    }

    verifiedRecords.push({
      eventType: log.eventType,
      canonicalPayloadHash: log.canonicalPayloadHash,
      riskScore: log.riskAssessment.score,
      riskLevel: log.riskAssessment.level,
      recordKey,
      status: recordStatus,
      onChainProof: onChainResult
    });
  }

  return {
    orderId,
    status: overallStatus,
    network: 'Ethereum Sepolia (Chain ID: 11155111)',
    contractAddress,
    recordsCount: verifiedRecords.length,
    records: verifiedRecords
  };
}

module.exports = {
  queueAuditJob,
  processOutboxJob,
  sweepOutbox,
  startOutboxWorker,
  verifyOrderOnChain,
  decodeGetAuditRecord,
  computeRecordKey,
  keccak256,
  getConfig
};
