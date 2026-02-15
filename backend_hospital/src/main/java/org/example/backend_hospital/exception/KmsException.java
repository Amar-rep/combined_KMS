package org.example.backend_hospital.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class KmsException extends RuntimeException {
    public KmsException(String message) {
        super(message);
    }

    public KmsException(String message, Throwable cause) {
        super(message, cause);
    }
}
