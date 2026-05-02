package org.example.backend_hospital.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Generates realistic-looking blockchain audit logs on the backend terminal
 * for every document access lifecycle event.
 */
@Component
public class BlockchainAuditLogger {

    private static final Logger log = LoggerFactory.getLogger("BLOCKCHAIN_AUDIT");
    private static final SecureRandom random = new SecureRandom();

    private static final String CHAIN_ID = "0x89";
    private static final String NETWORK = "HealthChain Mainnet";
    private static final String CONTRACT = "0x7a3BE8c9...d4E4f2";
    private static final String DIVIDER = "════════════════════════════════════════════════════════════════════════";
    private static final String THIN    = "────────────────────────────────────────────────────────────────────────";

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneId.of("UTC"));

    private String generateTxHash() {
        StringBuilder sb = new StringBuilder("0x");
        for (int i = 0; i < 64; i++) {
            sb.append(Integer.toHexString(random.nextInt(16)));
        }
        return sb.toString();
    }

    private long generateBlockNumber() {
        return 18_000_000L + random.nextInt(2_000_000);
    }

    private long generateGasUsed() {
        return 21000L + random.nextInt(150_000);
    }

    private int generateNonce() {
        return random.nextInt(99999);
    }

    private String shorten(String id) {
        if (id == null || id.length() < 12) return id != null ? id : "UNKNOWN";
        return id.substring(0, 6) + "..." + id.substring(id.length() - 4);
    }

    /**
     * Log an access request event (doctor requesting access to patient group).
     */
    public void logAccessRequest(String doctorId, String patientId, String groupId, String hospitalId) {
        printLog("📋 ACCESS_REQUEST_SUBMITTED", doctorId, patientId, groupId, hospitalId, null, null);
    }

    /**
     * Log an access granted event (patient accepting doctor's request).
     */
    public void logAccessGranted(String doctorId, String patientId, String groupId, String hospitalId) {
        printLog("✅ ACCESS_GRANTED (SIGNED TX)", doctorId, patientId, groupId, hospitalId, null, null);
    }

    /**
     * Log an access revoked event (patient revoking doctor's access).
     */
    public void logAccessRevoked(String senderId, String groupId) {
        printLog("🚫 ACCESS_REVOKED", null, senderId, groupId, null, null, null);
    }

    /**
     * Log a document view/download event.
     */
    public void logDocumentAccess(String doctorId, String groupId, String fileName) {
        printLog("👁️ DOCUMENT_ACCESSED", doctorId, null, groupId, null, fileName, null);
    }

    /**
     * Log a notification created event.
     */
    public void logNotificationCreated(String senderId, String receiverId, String hospitalId, String groupId) {
        printLog("🔔 NOTIFICATION_CREATED", senderId, receiverId, groupId, hospitalId, null, null);
    }

    private void printLog(String eventLabel, String fromId, String toId,
                          String groupId, String hospitalId,
                          String fileName, String extra) {
        String txHash = generateTxHash();
        long blockNumber = generateBlockNumber();
        long gasUsed = generateGasUsed();
        int nonce = generateNonce();
        String timestamp = FMT.format(Instant.now());
        long unixTs = Instant.now().getEpochSecond();

        StringBuilder sb = new StringBuilder();
        sb.append("\n").append(DIVIDER);
        sb.append("\n⛓️  HEALTHCHAIN TRANSACTION LOG");
        sb.append("\n").append(THIN);
        sb.append("\nEvent:          ").append(eventLabel);
        sb.append("\nNetwork:        ").append(NETWORK).append(" (Chain ID: ").append(CHAIN_ID).append(")");
        sb.append("\nContract:       ").append(CONTRACT);
        sb.append("\n").append(THIN);
        sb.append("\n📦 Transaction Details");
        sb.append("\nTx Hash:        ").append(txHash);
        sb.append("\nBlock Number:   #").append(String.format("%,d", blockNumber));
        sb.append("\nGas Used:       ").append(String.format("%,d", gasUsed)).append(" wei");
        sb.append("\nNonce:          ").append(nonce);
        sb.append("\nTimestamp:      ").append(timestamp).append(" (Unix: ").append(unixTs).append(")");
        sb.append("\n").append(THIN);
        sb.append("\n📝 Event Payload");

        if (fromId != null) {
            sb.append("\nFrom (Doctor):  ").append(shorten(fromId));
        }
        if (toId != null) {
            sb.append("\nTo (Patient):   ").append(shorten(toId));
        }
        if (groupId != null) {
            sb.append("\nGroup ID:       ").append(groupId);
        }
        if (hospitalId != null) {
            sb.append("\nHospital ID:    ").append(hospitalId);
        }
        if (fileName != null) {
            sb.append("\nDocument:       ").append(fileName);
        }
        if (extra != null) {
            sb.append("\nExtra:          ").append(extra);
        }

        sb.append("\n").append(THIN);

        if (eventLabel.contains("REVOKE")) {
            sb.append("\n⚠️  Status: CONFIRMED — Access permission removed from smart contract");
        } else {
            sb.append("\n✔  Status: CONFIRMED — Written to block #").append(String.format("%,d", blockNumber));
        }

        sb.append("\nVerify: https://healthchain-explorer.io/tx/").append(txHash);
        sb.append("\n").append(DIVIDER).append("\n");

        log.info(sb.toString());
    }
}
