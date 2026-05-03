package org.example.backend_hospital.service;

import org.bouncycastle.jcajce.provider.digest.Keccak;
import org.bouncycastle.util.encoders.Hex;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class UserIdKeccakService {

    public String deriveFromPublicKeyBase64(String publicKeyBase64) {
        if (publicKeyBase64 == null || publicKeyBase64.trim().isEmpty()) {
            throw new IllegalArgumentException("Public key is required");
        }

        try {
            byte[] publicKeyBytes = Base64.getDecoder().decode(publicKeyBase64);

            Keccak.Digest256 digest256 = new Keccak.Digest256();
            byte[] hashBytes = digest256.digest(publicKeyBytes);

            return Hex.toHexString(hashBytes);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Illegal base64")) {
                throw new IllegalArgumentException("Invalid Base64 encoding in public key", e);
            }
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to derive userIdKeccak: " + e.getMessage(), e);
        }
    }
}
