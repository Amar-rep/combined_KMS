package org.example.backend_hospital.service;

import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.interfaces.ECPublicKey;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;
import org.bouncycastle.jce.spec.ECPublicKeySpec;
import org.bouncycastle.math.ec.ECPoint;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;
import org.example.backend_hospital.entity.Patient;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.Security;
import java.util.Base64;
import java.util.Arrays;
import org.web3j.crypto.Hash;

@Service
public class KeyService {

    private static final String AES_ALGORITHM = "AES";
    private static final String ECIES_ALGORITHM = "ECIES";
    private static final String BOUNCY_CASTLE_PROVIDER = "BC";
    private static final String EC_ALGORITHM = "EC";
    private static final String SECP256K1_CURVE = "secp256k1";
    private static final String AES_GCM_ALGORITHM = "AES/GCM/NoPadding";

    private static final int DEK_KEY_SIZE = 128;
    private static final int GROUP_KEY_SIZE = 256;
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private static final String BASE62_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int GROUP_ID_LENGTH = 10;
    private static final int RECORD_ID_LENGTH = 12;

    private final SecureRandom secureRandom;
    private final PatientService userService;

    public KeyService(PatientService userService) {

        Security.addProvider(new BouncyCastleProvider());
        this.secureRandom = new SecureRandom();
        this.userService = userService;
    }

    public SecretKey generateDEK() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(AES_ALGORITHM);
            keyGenerator.init(DEK_KEY_SIZE, secureRandom);
            return keyGenerator.generateKey();
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("Failed to generate DEK", e);
        }
    }

    public SecretKey generateGroupKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(AES_ALGORITHM);
            keyGenerator.init(GROUP_KEY_SIZE, secureRandom);
            return keyGenerator.generateKey();
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("Failed to generate Group Key", e);
        }
    }

    public String encryptKeyWithPublicKey(SecretKey keyToEncrypt, PublicKey publicKey) {
        try {
            // 1. Generate ephemeral key pair
            ECNamedCurveParameterSpec ecSpec = ECNamedCurveTable.getParameterSpec(SECP256K1_CURVE);
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(EC_ALGORITHM, BOUNCY_CASTLE_PROVIDER);
            keyPairGenerator.initialize(ecSpec, secureRandom);
            KeyPair ephemeralKeyPair = keyPairGenerator.generateKeyPair();

            // 2. Get ephemeral public key bytes (65 bytes, uncompressed with 0x04 prefix)
            ECPublicKey ephemeralPubKey = (ECPublicKey) ephemeralKeyPair.getPublic();
            byte[] ephemeralPubKeyBytes = ephemeralPubKey.getQ().getEncoded(false); // false = uncompressed

            // 3. Perform ECDH to derive shared secret.
            // CRITICAL: eccrypto uses the full uncompressed point (65 bytes) for the hash,
            // not just the X coordinate which standard KeyAgreement returns!
            ECPublicKey recipientPubKey = (ECPublicKey) publicKey;
            ECPoint sharedPoint = recipientPubKey.getQ()
                    .multiply(((org.bouncycastle.jce.interfaces.ECPrivateKey) ephemeralKeyPair.getPrivate()).getD())
                    .normalize();
            byte[] sharedSecretFullPoint = sharedPoint.getEncoded(false); // 65 bytes: 0x04 || X || Y

            // 4. Derive encryption key and MAC key from shared secret using SHA-512
            // eccrypto uses SHA-512 hash of the full shared secret point, split into two
            // 32-byte keys
            MessageDigest sha512 = MessageDigest.getInstance("SHA-512");
            byte[] derivedKey = sha512.digest(sharedSecretFullPoint);
            byte[] encryptionKey = Arrays.copyOfRange(derivedKey, 0, 32); // First 32 bytes for AES-256
            byte[] macKey = Arrays.copyOfRange(derivedKey, 32, 64); // Last 32 bytes for HMAC

            // 5. Generate random IV (16 bytes for AES-CBC)
            byte[] iv = new byte[16];
            secureRandom.nextBytes(iv);

            // 6. Encrypt with AES-256-CBC
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            SecretKeySpec aesKey = new SecretKeySpec(encryptionKey, AES_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, aesKey, new IvParameterSpec(iv));
            byte[] ciphertext = cipher.doFinal(keyToEncrypt.getEncoded());

            // 7. Calculate HMAC-SHA256 over (macKey)
            // eccrypto order: hmac.update(iv + ephemeralPubKey + ciphertext)
            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(macKey, "HmacSHA256"));
            hmac.update(iv);
            hmac.update(ephemeralPubKeyBytes);
            hmac.update(ciphertext);
            byte[] mac = hmac.doFinal();

            // 8. Construct a JSON string representing the exact object eccrypto expects
            // eccrypto.decrypt expects: { iv: Buffer, ephemPublicKey: Buffer, ciphertext:
            // Buffer, mac: Buffer }
            // We return a JSON string where the values are Base64 encoded. The frontend
            // must parse
            // the JSON and convert the base64 strings back to Buffers before passing to
            // eccrypto.decrypt().
            String jsonFormat = String.format(
                    "{\"iv\":\"%s\",\"ephemPublicKey\":\"%s\",\"ciphertext\":\"%s\",\"mac\":\"%s\"}",
                    Base64.getEncoder().encodeToString(iv),
                    Base64.getEncoder().encodeToString(ephemeralPubKeyBytes),
                    Base64.getEncoder().encodeToString(ciphertext),
                    Base64.getEncoder().encodeToString(mac));

            // We encode the JSON string itself into Base64 so it remains a single String
            // output
            // for the rest of your Java application, just like before.
            return Base64.getEncoder().encodeToString(jsonFormat.getBytes(StandardCharsets.UTF_8));

        } catch (GeneralSecurityException e) {
            throw new RuntimeException("Failed to encrypt key with EC public key", e);
        }
    }

    public PublicKey convertToECPublicKey(byte[] publicKeyBytes) {
        try {
            ECNamedCurveParameterSpec ecSpec = ECNamedCurveTable.getParameterSpec(SECP256K1_CURVE);

            // Handle both formats: with 0x04 prefix (65 bytes) or without (64 bytes)
            byte[] keyBytes = publicKeyBytes;
            if (publicKeyBytes.length == 64) {
                // Add the uncompressed point prefix
                keyBytes = new byte[65];
                keyBytes[0] = 0x04;
                System.arraycopy(publicKeyBytes, 0, keyBytes, 1, 64);
            }

            ECPoint ecPoint = ecSpec.getCurve().decodePoint(keyBytes);
            ECPublicKeySpec pubKeySpec = new ECPublicKeySpec(ecPoint, ecSpec);

            KeyFactory keyFactory = KeyFactory.getInstance(EC_ALGORITHM, BOUNCY_CASTLE_PROVIDER);
            return keyFactory.generatePublic(pubKeySpec);
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("Failed to convert bytes to EC PublicKey", e);
        }
    }

    public PublicKey convertToECPublicKey(BigInteger publicKeyBigInt) {
        byte[] publicKeyBytes = publicKeyBigInt.toByteArray();

        byte[] adjustedBytes = new byte[64];
        if (publicKeyBytes.length >= 64) {
            System.arraycopy(publicKeyBytes, publicKeyBytes.length - 64, adjustedBytes, 0, 64);
        } else {
            System.arraycopy(publicKeyBytes, 0, adjustedBytes, 64 - publicKeyBytes.length, publicKeyBytes.length);
        }

        return convertToECPublicKey(adjustedBytes);
    }

    public String encryptDEKWithGroupKey(SecretKey dek, SecretKey groupKey) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(AES_GCM_ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, groupKey, gcmSpec);

            byte[] encryptedDEK = cipher.doFinal(dek.getEncoded());

            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + encryptedDEK.length);
            byteBuffer.put(iv);
            byteBuffer.put(encryptedDEK);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("Failed to encrypt DEK with Group Key", e);
        }
    }

    public SecretKey decryptDEKWithGroupKey(String encDekGroupBase64, String groupKeyBase64) {
        try {
            SecretKey groupKey = base64ToSecretKey(groupKeyBase64, AES_ALGORITHM);

            byte[] docBytes = Base64.getDecoder().decode(encDekGroupBase64);

            ByteBuffer byteBuffer = ByteBuffer.wrap(docBytes);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);

            byte[] ciphertext = new byte[byteBuffer.remaining()];
            byteBuffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance(AES_GCM_ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, groupKey, gcmSpec);

            // Decrypt
            byte[] dekBytes = cipher.doFinal(ciphertext);

            // Reconstruct DEK
            return new SecretKeySpec(dekBytes, AES_ALGORITHM);
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("Failed to decrypt DEK with Group Key", e);
        }
    }

    public String generateGroupID() {
        return generateRandomString(GROUP_ID_LENGTH);
    }

    public String generateRecordID() {
        return generateRandomString(RECORD_ID_LENGTH);
    }

    public SecretKey base64ToSecretKey(String base64Key, String algorithm) {
        byte[] decodedKey = Base64.getDecoder().decode(base64Key);
        return new SecretKeySpec(decodedKey, 0, decodedKey.length, algorithm);
    }

    public String secretKeyToBase64(SecretKey secretKey) {
        if (secretKey == null) {
            throw new IllegalArgumentException("Key cannot be null");
        }
        // .getEncoded() returns the raw byte[] of the AES key
        byte[] rawKeyBytes = secretKey.getEncoded();

        // Encode those bytes to a Base64 string
        return Base64.getEncoder().encodeToString(rawKeyBytes);
    }

    private String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int randomIndex = secureRandom.nextInt(BASE62_ALPHABET.length());
            sb.append(BASE62_ALPHABET.charAt(randomIndex));
        }
        return sb.toString();
    }

    public boolean verifySignature(String nonce, String signatureBase64, String userIdKeccak) {
        try {
            Patient user = userService.findByKeccakId(userIdKeccak);
            if (user == null)
                return false;
            // byte[] storedPublicKey = user.getPublicKey();// will fix later

            byte[] storedPublicKey = new byte[56];
            byte[] signatureBytes = Base64.getDecoder().decode(signatureBase64);

            if (signatureBytes.length != 65) {
                throw new IllegalArgumentException("Invalid signature length");
            }

            byte[] r = Arrays.copyOfRange(signatureBytes, 0, 32);
            byte[] s = Arrays.copyOfRange(signatureBytes, 32, 64);
            byte v = signatureBytes[64];

            if (v < 27) {
                v = (byte) (v + 27);
            }

            byte[] messagePrefixHash = Sign.getEthereumMessageHash(nonce.getBytes(StandardCharsets.UTF_8));

            Sign.SignatureData signatureData = new Sign.SignatureData(v, r, s);
            BigInteger recoveredPublicKey = Sign.signedMessageHashToKey(messagePrefixHash, signatureData);

            byte[] recoveredPublicKeyBytes = Numeric.toBytesPadded(recoveredPublicKey, 64);

            byte[] storedKeyToCompare = storedPublicKey;
            if (storedPublicKey.length == 65 && storedPublicKey[0] == 0x04) {
                storedKeyToCompare = Arrays.copyOfRange(storedPublicKey, 1, 65);
            }

            return Arrays.equals(recoveredPublicKeyBytes, storedKeyToCompare);

        } catch (Exception e) {

            return false;
        }
    }
}
