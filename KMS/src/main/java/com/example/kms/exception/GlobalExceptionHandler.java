package com.example.kms.exception;

import com.example.kms.dto.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;


@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        @Value("${kms.debug-mode:true}")
        private boolean debugMode;


        @ExceptionHandler(KmsException.class)
        public ResponseEntity<ErrorResponseDTO> handleKmsException(
                        KmsException ex, HttpServletRequest request) {

                log.error("KMS Exception [{}]: {}", ex.getErrorCode(), ex.getDeveloperMessage(), ex);

                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                LocalDateTime.now(),
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Internal Server Error",
                                ex.getUserMessage(),
                                ex.getErrorCode(),
                                request.getRequestURI());

                if (debugMode) {
                        errorResponse.setDeveloperMessage(ex.getDeveloperMessage());
                }

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(errorResponse);
        }



        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(
                        IllegalArgumentException ex, HttpServletRequest request) {

                log.warn("Invalid argument: {}", ex.getMessage());

                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                LocalDateTime.now(),
                                HttpStatus.BAD_REQUEST.value(),
                                "Bad Request",
                                ex.getMessage() != null ? ex.getMessage() : "Invalid request parameters.",
                                "INVALID_ARGUMENT",
                                request.getRequestURI());

                if (debugMode) {
                        errorResponse.setDeveloperMessage(ex.getMessage());
                }

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(errorResponse);
        }


        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponseDTO> handleResourceNotFoundException(
                        ResourceNotFoundException ex, HttpServletRequest request) {

                log.warn("Resource not found: {}", ex.getMessage());

                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                LocalDateTime.now(),
                                HttpStatus.NOT_FOUND.value(),
                                "Not Found",
                                ex.getMessage(),
                                "RESOURCE_NOT_FOUND",
                                request.getRequestURI());

                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(errorResponse);
        }


        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ErrorResponseDTO> handleRuntimeException(
                        RuntimeException ex, HttpServletRequest request) {

                log.error("Runtime exception: {}", ex.getMessage(), ex);

                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                LocalDateTime.now(),
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Internal Server Error",
                                "An error occurred while processing your request.",
                                "RUNTIME_ERROR",
                                request.getRequestURI());

                if (debugMode) {
                        errorResponse.setDeveloperMessage(ex.getMessage());
                }

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(errorResponse);
        }

        /**
         * Catch-all handler for any unhandled exceptions.
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponseDTO> handleGenericException(
                        Exception ex, HttpServletRequest request) {

                log.error("Unhandled exception: {}", ex.getMessage(), ex);

                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                LocalDateTime.now(),
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Internal Server Error",
                                "An unexpected error occurred. Please try again later.",
                                "INTERNAL_ERROR",
                                request.getRequestURI());

                if (debugMode) {
                        errorResponse.setDeveloperMessage(ex.getMessage());
                }

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(errorResponse);
        }
}
