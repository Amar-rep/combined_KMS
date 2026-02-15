package com.example.kms.service;

import com.example.kms.exception.DecryptionException;
import com.example.kms.exception.EncryptionException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Slf4j
@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int KEY_SIZE = 128;
    private static final int IV_SIZE = 12;
    private static final int TAG_LENGTH_BITS = 128;
    private static final int TAG_LENGTH_BYTES = 16;


    public record EncryptionResult(byte[] encryptedPayload, String keyBase64) {
    }


    public EncryptionResult encrypt(byte[] data) {
        try {

            // Generate  key
            KeyGenerator keyGen = KeyGenerator.getInstance(ALGORITHM);
            keyGen.init(KEY_SIZE);
            SecretKey secretKey = keyGen.generateKey();

            // Generate random IV
            byte[] iv = new byte[IV_SIZE];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);

            // Encrypt
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmSpec);
            byte[] ciphertextWithTag = cipher.doFinal(data);

            byte[] payload = new byte[IV_SIZE + ciphertextWithTag.length];
            System.arraycopy(iv, 0, payload, 0, IV_SIZE);
            System.arraycopy(ciphertextWithTag, 0, payload, IV_SIZE, ciphertextWithTag.length);

            String keyBase64 = Base64.getEncoder().encodeToString(secretKey.getEncoded());

            log.info("Successfully encrypted data, payload size: {} bytes", payload.length);
            return new EncryptionResult(payload, keyBase64);
        } catch (Exception e) {
            throw new EncryptionException("Failed to encrypt data: " + e.getMessage(), e);
        }
    }


    public byte[] encryptWithDEK(byte[] data, SecretKey dek) {
        try {
            log.debug("Encrypting {} bytes of data with provided DEK", data.length);

            byte[] iv = new byte[IV_SIZE];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, dek, gcmSpec);
            byte[] ciphertextWithTag = cipher.doFinal(data);

            byte[] payload = new byte[IV_SIZE + ciphertextWithTag.length];
            System.arraycopy(iv, 0, payload, 0, IV_SIZE);
            System.arraycopy(ciphertextWithTag, 0, payload, IV_SIZE, ciphertextWithTag.length);

            log.info("Successfully encrypted data with DEK, payload size: {} bytes", payload.length);
            return payload;
        } catch (Exception e) {
            log.error("Encryption with DEK failed", e);
            throw new EncryptionException("Failed to encrypt data with DEK: " + e.getMessage(), e);
        }
    }


    public byte[] decrypt(byte[] payload, String keyBase64) {
        try {
            log.debug("Decrypting {} bytes of payload", payload.length);

            byte[] keyBytes = Base64.getDecoder().decode(keyBase64);
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, ALGORITHM);

            byte[] iv = Arrays.copyOfRange(payload, 0, IV_SIZE);

            byte[] ciphertextWithTag = Arrays.copyOfRange(payload, IV_SIZE, payload.length);

            // Decrypt
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec);

            byte[] decryptedData = cipher.doFinal(ciphertextWithTag);
            log.info("Successfully decrypted data, size: {} bytes", decryptedData.length);
            return decryptedData;
        } catch (Exception e) {
            log.error("Decryption failed", e);
            throw new DecryptionException("Failed to decrypt data: " + e.getMessage(), e);
        }
    }


    public byte[] decryptWithDEK(byte[] payload, SecretKey dek) {
        try {
            log.debug("Decrypting {} bytes of payload with provided DEK", payload.length);

            byte[] iv = Arrays.copyOfRange(payload, 0, IV_SIZE);

            byte[] ciphertextWithTag = Arrays.copyOfRange(payload, IV_SIZE, payload.length);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, dek, gcmSpec);

            byte[] decryptedData = cipher.doFinal(ciphertextWithTag);
            log.info("Successfully decrypted data with DEK, size: {} bytes", decryptedData.length);
            return decryptedData;
        } catch (Exception e) {
            log.error("Decryption with DEK failed", e);
            throw new DecryptionException("Failed to decrypt data with DEK: " + e.getMessage(), e);
        }
    }
}
