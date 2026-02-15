package com.example.kms.exception;

public class InvalidFileException extends KmsException {

    public InvalidFileException(String reason) {
        super(
                "Invalid file upload. " + reason,
                "File validation failed: " + reason,
                "INVALID_FILE");
    }
}
