package com.example.kms.service;

import com.example.kms.dto.RegisterHospitalDTO;
import com.example.kms.entity.Hospital;
import com.example.kms.exception.ResourceNotFoundException;
import com.example.kms.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final KeyService keyService;

    public Hospital registerHospital(RegisterHospitalDTO dto) {
        if (!hospitalRepository.findByHospitalKeybase64(dto.getHospitalKeyBase64()).isEmpty()) {
            throw new IllegalArgumentException("Hospital with this key already exists");
        }
        Hospital hospital = new Hospital();
        hospital.setHospitalId(keyService.generateGroupID());
        hospital.setName(dto.getName());
        hospital.setLocation(dto.getLocation());
        hospital.setHospitalKeybase64(dto.getHospitalKeyBase64());
        hospital.setCreatedAt(OffsetDateTime.now());

        return hospitalRepository.save(hospital);
    }

    public Hospital findById(String hospitalId) {
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with ID: " + hospitalId));
    }

    public Hospital findByPublicKey(String hospitalKeyBase64) {
        return hospitalRepository.findByHospitalKeybase64(hospitalKeyBase64)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with the given public key"));
    }
}
