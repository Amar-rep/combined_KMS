package org.example.backend_hospital.exception;

/**
 * Domain-specific exception for blockchain interaction errors.
 * Carries an ErrorCode to allow fine-grained handling in
 * GlobalExceptionHandler.
 */
public class BlockchainException extends RuntimeException {

    public enum ErrorCode {
        TX_FAILED, // Transaction mined but reverted on-chain
        NODE_ERROR, // RPC/network level failure
        RECEIPT_TIMEOUT, // Receipt not available after polling
        CONFIG_ERROR // Blockchain misconfigured (no credentials etc.)
    }

    private final ErrorCode errorCode;

    public BlockchainException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public BlockchainException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
