package com.example.kms.exception;

import lombok.Getter;

@Getter
public class KmsException extends RuntimeException {

    private final String userMessage;
    private final String developerMessage;
    private final String errorCode;

    public KmsException(String userMessage, String developerMessage, String errorCode) {
        super(developerMessage);
        this.userMessage = userMessage;
        this.developerMessage = developerMessage;
        this.errorCode = errorCode;
    }

    public KmsException(String userMessage, String developerMessage, String errorCode, Throwable cause) {
        super(developerMessage, cause);
        this.userMessage = userMessage;
        this.developerMessage = developerMessage;
        this.errorCode = errorCode;
    }
}
