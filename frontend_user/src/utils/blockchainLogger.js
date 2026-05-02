/**
 * Fake Blockchain Logger
 * Generates realistic-looking blockchain transaction logs for
 * document access events (request, accept, revoke, view).
 */

const CHAIN_ID = '0x89'; // Polygon-like chain ID
const NETWORK = 'HealthChain Mainnet';
const CONTRACT_ADDRESS = '0x7a3B...E4f2';

// Generate a fake transaction hash (64 hex chars)
const generateTxHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
};

// Generate a fake block number
const generateBlockNumber = () => {
    return Math.floor(18_000_000 + Math.random() * 2_000_000);
};

// Generate a fake gas value
const generateGasUsed = () => {
    return Math.floor(21000 + Math.random() * 150000);
};

// Generate a nonce
const generateNonce = () => {
    return Math.floor(Math.random() * 99999);
};

// Shorten a keccak ID for display
const shortenId = (id) => {
    if (!id || id.length < 12) return id || 'UNKNOWN';
    return id.slice(0, 6) + '...' + id.slice(-4);
};

// Styled console helpers
const STYLES = {
    header:    'color: #00ff88; font-weight: bold; font-size: 13px; text-shadow: 0 0 5px #00ff8855;',
    subheader: 'color: #00ccff; font-weight: bold; font-size: 11px;',
    label:     'color: #888; font-size: 11px;',
    value:     'color: #fff; font-size: 11px;',
    hash:      'color: #ffaa00; font-size: 11px; font-family: monospace;',
    success:   'color: #00ff88; font-weight: bold; font-size: 11px;',
    warning:   'color: #ff6b6b; font-weight: bold; font-size: 11px;',
    divider:   'color: #333; font-size: 10px;',
    block:     'color: #aa88ff; font-size: 11px; font-family: monospace;',
    timestamp: 'color: #666; font-size: 10px; font-style: italic;',
    actionTime:'color: #e0e0e0; font-weight: bold; font-size: 11px; background: #1a1a2e; padding: 2px 6px; border-radius: 3px;',
    confirmTime:'color: #00ff88; font-size: 10px; font-style: italic; font-weight: bold;',
};

const DIVIDER = '═══════════════════════════════════════════════════════════════';
const THIN_DIVIDER = '───────────────────────────────────────────────────────────────';

/**
 * Log a blockchain transaction for an access event.
 * @param {'ACCESS_REQUEST' | 'ACCESS_GRANTED' | 'ACCESS_REVOKED' | 'DOCUMENT_VIEWED'} eventType
 * @param {Object} params
 * @param {string} params.doctorId   - Doctor keccak ID
 * @param {string} params.patientId  - Patient keccak ID
 * @param {string} params.groupId    - Group ID
 * @param {string} [params.hospitalId] - Hospital ID
 * @param {string} [params.fileName]   - File name (for DOCUMENT_VIEWED)
 * @param {string} [params.notificationId] - Notification ID
 */
// Format a Date as a readable local string: "02 May 2026, 11:44:33 PM"
const formatReadableTime = (date) => {
    return date.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true,
    });
};

export const logBlockchainEvent = (eventType, params = {}) => {
    const txHash = generateTxHash();
    const blockNumber = generateBlockNumber();
    const gasUsed = generateGasUsed();
    const nonce = generateNonce();
    const now = new Date();
    const timestamp = now.toISOString();
    const unixTs = Math.floor(now.getTime() / 1000);
    const readableTime = formatReadableTime(now);

    const eventLabels = {
        ACCESS_REQUEST:  '📋 ACCESS REQUEST SUBMITTED',
        ACCESS_GRANTED:  '✅ ACCESS GRANTED (SIGNED)',
        ACCESS_REVOKED:  '🚫 ACCESS REVOKED',
        DOCUMENT_VIEWED: '👁️ DOCUMENT ACCESSED',
    };

    const eventColors = {
        ACCESS_REQUEST:  '#00ccff',
        ACCESS_GRANTED:  '#00ff88',
        ACCESS_REVOKED:  '#ff6b6b',
        DOCUMENT_VIEWED: '#ffaa00',
    };

    const label = eventLabels[eventType] || eventType;
    const color = eventColors[eventType] || '#fff';

    console.log('%c' + DIVIDER, STYLES.divider);
    console.log(
        `%c⛓️  HEALTHCHAIN TRANSACTION LOG`,
        STYLES.header
    );
    console.log(
        '%c🕐 Action Time:  %c' + readableTime,
        STYLES.label,
        STYLES.actionTime
    );
    console.log('%c' + THIN_DIVIDER, STYLES.divider);
    console.log(
        `%cEvent:          %c${label}`,
        STYLES.label,
        `color: ${color}; font-weight: bold; font-size: 12px;`
    );
    console.log(
        '%cNetwork:        %c' + NETWORK + ' (Chain ID: ' + CHAIN_ID + ')',
        STYLES.label,
        STYLES.value
    );
    console.log(
        '%cContract:       %c' + CONTRACT_ADDRESS,
        STYLES.label,
        STYLES.hash
    );
    console.log('%c' + THIN_DIVIDER, STYLES.divider);

    // Transaction details
    console.log('%c📦 Transaction Details', STYLES.subheader);
    console.log('%cTx Hash:        %c' + txHash, STYLES.label, STYLES.hash);
    console.log('%cBlock Number:   %c#' + blockNumber.toLocaleString(), STYLES.label, STYLES.block);
    console.log('%cGas Used:       %c' + gasUsed.toLocaleString() + ' wei', STYLES.label, STYLES.value);
    console.log('%cNonce:          %c' + nonce, STYLES.label, STYLES.value);
    console.log('%cTimestamp:      %c' + timestamp + ' (Unix: ' + unixTs + ')', STYLES.label, STYLES.timestamp);

    console.log('%c' + THIN_DIVIDER, STYLES.divider);

    // Event-specific data
    console.log('%c📝 Event Payload', STYLES.subheader);
    console.log(
        '%cDoctor (from):  %c' + shortenId(params.doctorId),
        STYLES.label,
        STYLES.hash
    );
    console.log(
        '%cPatient (to):   %c' + shortenId(params.patientId),
        STYLES.label,
        STYLES.hash
    );
    if (params.groupId) {
        console.log(
            '%cGroup ID:       %c' + params.groupId,
            STYLES.label,
            STYLES.value
        );
    }
    if (params.hospitalId) {
        console.log(
            '%cHospital ID:    %c' + params.hospitalId,
            STYLES.label,
            STYLES.value
        );
    }
    if (params.notificationId) {
        console.log(
            '%cNotification:   %c#' + params.notificationId,
            STYLES.label,
            STYLES.value
        );
    }
    if (params.fileName) {
        console.log(
            '%cDocument:       %c' + params.fileName,
            STYLES.label,
            STYLES.value
        );
    }

    console.log('%c' + THIN_DIVIDER, STYLES.divider);

    // Status
    if (eventType === 'ACCESS_REVOKED') {
        console.log('%c⚠️  Status: CONFIRMED — Access permission removed from smart contract', STYLES.warning);
    } else {
        console.log('%c✔  Status: CONFIRMED — Written to block #' + blockNumber.toLocaleString(), STYLES.success);
    }

    // Confirmation timestamp
    const confirmTime = formatReadableTime(new Date());
    console.log(
        '%c⏱️  Confirmed at: %c' + confirmTime + '  %c(latency: ' + (Date.now() - now.getTime()) + 'ms)',
        STYLES.label,
        STYLES.confirmTime,
        STYLES.timestamp
    );

    console.log(
        '%cVerify: %chttps://healthchain-explorer.io/tx/' + txHash,
        STYLES.label,
        'color: #4488ff; font-size: 10px; text-decoration: underline;'
    );
    console.log('%c' + DIVIDER, STYLES.divider);
    console.log(''); // spacing
};

export default logBlockchainEvent;
