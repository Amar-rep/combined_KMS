package org.example.backend_hospital.exception;

import org.example.backend_hospital.dto.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        @Value("${hospital.debug-mode:true}")
        private boolean debugMode;

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(
                        IllegalArgumentException ex, HttpServletRequest request) {

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

        @ExceptionHandler(BlockchainException.class)
        public ResponseEntity<ErrorResponseDTO> handleBlockchainException(
                        BlockchainException ex, HttpServletRequest request) {

                log.error("Blockchain error [{}]: {}", ex.getErrorCode(), ex.getMessage());

                // TX_FAILED is a client-side logic error (bad input / contract condition not
                // met)
                HttpStatus httpStatus = ex.getErrorCode() == BlockchainException.ErrorCode.TX_FAILED
                                ? HttpStatus.valueOf(422) // 422 Unprocessable Entity
                                : HttpStatus.BAD_GATEWAY; // 502 for node/config/timeout

                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                LocalDateTime.now(),
                                httpStatus.value(),
                                "Blockchain Error",
                                friendlyBlockchainMessage(ex),
                                "BLOCKCHAIN_" + ex.getErrorCode().name(),
                                request.getRequestURI());

                // Always include developer detail for blockchain errors — hard to debug
                // otherwise
                errorResponse.setDeveloperMessage(ex.getMessage());

                return ResponseEntity.status(httpStatus).body(errorResponse);
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ErrorResponseDTO> handleRuntimeException(
                        RuntimeException ex, HttpServletRequest request) {

                log.error("Unhandled RuntimeException at {}: {}", request.getRequestURI(), ex.getMessage(), ex);

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

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponseDTO> handleGenericException(
                        Exception ex, HttpServletRequest request) {

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

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorResponseDTO> handleAccessDeniedException(
                        AccessDeniedException ex, HttpServletRequest request) {

                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                LocalDateTime.now(),
                                HttpStatus.FORBIDDEN.value(),
                                "Access Denied",
                                ex.getMessage(),
                                "ACCESS_DENIED",
                                request.getRequestURI());

                return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(errorResponse);
        }

        @ExceptionHandler(KmsException.class)
        public ResponseEntity<ErrorResponseDTO> handleKmsException(
                        KmsException ex, HttpServletRequest request) {

                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                LocalDateTime.now(),
                                HttpStatus.BAD_GATEWAY.value(),
                                "KMS Error",
                                ex.getMessage(),
                                "KMS_ERROR",
                                request.getRequestURI());

                if (debugMode) {
                        errorResponse.setDeveloperMessage(ex.getMessage());
                }

                return ResponseEntity
                                .status(HttpStatus.BAD_GATEWAY)
                                .body(errorResponse);
        }

        // ── Helpers ──────────────────────────────────────────────────────────────

        private String friendlyBlockchainMessage(BlockchainException ex) {
                return switch (ex.getErrorCode()) {
                        case TX_FAILED -> "The transaction was rejected by the smart contract. " +
                                        "Check that all referenced users/records exist and are active.";
                        case NODE_ERROR -> "Could not communicate with the blockchain node. " +
                                        "Ensure the node is running and the RPC URL is correct.";
                        case RECEIPT_TIMEOUT -> "The transaction was submitted but the confirmation " +
                                        "receipt timed out. It may still be pending on-chain.";
                        case CONFIG_ERROR -> "Blockchain integration is not configured correctly. " +
                                        "Check hospital.blockchain.* properties.";
                };
        }
}
