package com.example.kms.service;

import com.example.kms.entity.Hospital;
import com.example.kms.entity.HospitalHash;
import com.example.kms.exception.ResourceNotFoundException;
import com.example.kms.repository.HospitalHashRepository;
import com.example.kms.repository.HospitalRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalHashService {

    private final HospitalHashRepository hospitalHashRepository;
    private final HospitalRepository hospitalRepository;
    private final ObjectMapper objectMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public HospitalHash createInitialHash(Hospital hospital) {
        HospitalHash hospitalHash = new HospitalHash();
        hospitalHash.setHospitalId(hospital.getHospitalId());
        hospitalHash.setHospitalHash(generateRandomHashSeed());
        hospitalHash.setCreatedAt(OffsetDateTime.now());
        hospitalHash.setUpdatedAt(OffsetDateTime.now());
        return hospitalHashRepository.save(hospitalHash);
    }

    @Transactional
    public HospitalHash updateHospitalHash(String hospitalId, Object requestData) {
        HospitalHash hospitalHash = hospitalHashRepository.findById(hospitalId)
                .orElseGet(() -> createInitialHash(findHospital(hospitalId)));

        String requestHash = sha256Hex(toStableJson(requestData));
        String nextHash = sha256Hex(hospitalHash.getHospitalHash() + requestHash);
        hospitalHash.setHospitalHash(nextHash);
        hospitalHash.setUpdatedAt(OffsetDateTime.now());
        return hospitalHashRepository.save(hospitalHash);
    }

    @Transactional
    public void updateHospitalHashes(List<String> hospitalIds, Object requestData) {
        hospitalIds.stream()
                .filter(hospitalId -> hospitalId != null && !hospitalId.isBlank())
                .distinct()
                .forEach(hospitalId -> updateHospitalHash(hospitalId, requestData));
    }

    public HospitalHash getHospitalHash(String hospitalId) {
        return hospitalHashRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital hash not found with ID: " + hospitalId));
    }

    public List<HospitalHash> getAllHospitalHashes() {
        return hospitalHashRepository.findAll();
    }

    private Hospital findHospital(String hospitalId) {
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with ID: " + hospitalId));
    }

    private String generateRandomHashSeed() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    private String toStableJson(Object data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Unable to hash request data", e);
        }
    }

    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
}
