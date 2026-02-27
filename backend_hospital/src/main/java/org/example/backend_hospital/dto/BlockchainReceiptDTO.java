package org.example.backend_hospital.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigInteger;
import java.util.Map;

/**
 * Rich response returned by all blockchain write endpoints.
 * Includes tx receipt details and decoded Solidity event fields.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BlockchainReceiptDTO {

    /** 0x-prefixed transaction hash */
    private String txHash;

    /** Block number in which the tx was mined */
    private BigInteger blockNumber;

    /** Actual gas consumed */
    private BigInteger gasUsed;

    /** "SUCCESS" or "FAILED" */
    private String status;

    /**
     * Decoded Solidity event emitted by this transaction.
     * Key = field name (e.g. "userId", "role"), Value = human-readable string.
     * Null for failed transactions.
     */
    private Map<String, String> event;
}
