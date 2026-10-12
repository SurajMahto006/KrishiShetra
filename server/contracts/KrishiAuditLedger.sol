// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KrishiAuditLedger
 * @notice Tamper-evident, idempotent audit trail for KrishiShetra agricultural transactions.
 * @dev Anchors canonical transaction hashes, risk-assessment hashes, and audit metadata on-chain.
 *      Zero personal information (PII), addresses, or plain order documents are stored.
 */
contract KrishiAuditLedger {
    // Contract deployer / authorized relayer
    address public immutable owner;

    // Expected network verification identifier (Sepolia chainId: 11155111)
    uint256 public constant EXPECTED_CHAIN_ID = 11155111;

    struct AuditRecord {
        string orderId;
        string eventType;
        bytes32 payloadHash;
        bytes32 riskHash;
        uint8 riskScore;
        uint256 timestamp;
        uint256 blockNumber;
        address recordedBy;
        bool exists;
    }

    // recordKey = keccak256(abi.encodePacked(orderId, eventType, payloadHash))
    mapping(bytes32 => AuditRecord) private _records;

    // Ordered list of record keys for chronological audit queries
    bytes32[] private _recordKeys;

    // Order ID to list of record keys
    mapping(string => bytes32[]) private _orderRecordKeys;

    // Events
    event AuditRecordCommitted(
        bytes32 indexed recordKey,
        string indexed orderId,
        string eventType,
        bytes32 payloadHash,
        bytes32 riskHash,
        uint8 riskScore,
        uint256 timestamp
    );

    event AuditRecordDuplicateIgnored(
        bytes32 indexed recordKey,
        string indexed orderId,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "KrishiAuditLedger: Caller not authorized owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Records an immutable audit entry idempotently.
     * @param orderId KrishiShetra business order ID (e.g. KS-ORD-2026-000001)
     * @param eventType Transaction event type (ORDER_CREATED, STATUS_UPDATED, CANCELLED, PAYMENT_UPDATED, AUDIT_REVIEW)
     * @param payloadHash SHA-256 canonical hash of the non-sensitive order data
     * @param riskHash SHA-256 hash of the explainable risk assessment
     * @param riskScore Normalized risk score (0 - 100)
     */
    function recordAuditEntry(
        string calldata orderId,
        string calldata eventType,
        bytes32 payloadHash,
        bytes32 riskHash,
        uint8 riskScore
    ) external onlyOwner returns (bytes32 recordKey) {
        require(bytes(orderId).length > 0, "KrishiAuditLedger: orderId required");
        require(bytes(eventType).length > 0, "KrishiAuditLedger: eventType required");
        require(payloadHash != bytes32(0), "KrishiAuditLedger: payloadHash required");
        require(riskScore <= 100, "KrishiAuditLedger: riskScore must be <= 100");

        recordKey = keccak256(abi.encodePacked(orderId, eventType, payloadHash));

        // Idempotency: If this exact logical event is already anchored, do not duplicate
        if (_records[recordKey].exists) {
            emit AuditRecordDuplicateIgnored(recordKey, orderId, block.timestamp);
            return recordKey;
        }

        _records[recordKey] = AuditRecord({
            orderId: orderId,
            eventType: eventType,
            payloadHash: payloadHash,
            riskHash: riskHash,
            riskScore: riskScore,
            timestamp: block.timestamp,
            blockNumber: block.number,
            recordedBy: msg.sender,
            exists: true
        });

        _recordKeys.push(recordKey);
        _orderRecordKeys[orderId].push(recordKey);

        emit AuditRecordCommitted(
            recordKey,
            orderId,
            eventType,
            payloadHash,
            riskHash,
            riskScore,
            block.timestamp
        );

        return recordKey;
    }

    /**
     * @notice Retrieves an audit record by its deterministic record key.
     */
    function getAuditRecord(bytes32 recordKey)
        external
        view
        returns (
            string memory orderId,
            string memory eventType,
            bytes32 payloadHash,
            bytes32 riskHash,
            uint8 riskScore,
            uint256 timestamp,
            uint256 blockNumber,
            address recordedBy,
            bool exists
        )
    {
        AuditRecord storage rec = _records[recordKey];
        return (
            rec.orderId,
            rec.eventType,
            rec.payloadHash,
            rec.riskHash,
            rec.riskScore,
            rec.timestamp,
            rec.blockNumber,
            rec.recordedBy,
            rec.exists
        );
    }

    /**
     * @notice Returns all record keys associated with a specific order ID.
     */
    function getOrderRecordKeys(string calldata orderId)
        external
        view
        returns (bytes32[] memory)
    {
        return _orderRecordKeys[orderId];
    }

    /**
     * @notice Returns total number of recorded audit events.
     */
    function totalRecords() external view returns (uint256) {
        return _recordKeys.length;
    }
}
