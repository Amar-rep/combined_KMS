package com.example.kms.exception;

public class EncryptionException extends KmsException {

    public EncryptionException(String developerMessage, Throwable cause) {
        super(
                "Failed to encrypt document.",
                developerMessage,
                "ENCRYPTION_ERROR",
                cause);
    }
}
