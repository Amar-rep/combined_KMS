package com.example.kms.exception;

public class IpfsConnectionException extends KmsException {

    public IpfsConnectionException(String developerMessage, Throwable cause) {
        super(
                "Unable to connect to storage service.",
                developerMessage,
                "IPFS_CONNECTION_ERROR",
                cause);
    }

    public IpfsConnectionException(String developerMessage) {
        super(
                "Unable to connect to storage service.",
                developerMessage,
                "IPFS_CONNECTION_ERROR");
    }
}
