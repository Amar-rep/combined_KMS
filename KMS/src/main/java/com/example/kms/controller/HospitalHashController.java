package com.example.kms.controller;

import com.example.kms.entity.HospitalHash;
import com.example.kms.service.HospitalHashService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/kms/hospital-hashes")
@RequiredArgsConstructor
public class HospitalHashController {

    private final HospitalHashService hospitalHashService;

    @GetMapping
    public ResponseEntity<List<HospitalHash>> getAllHospitalHashes() {
        return ResponseEntity.ok(hospitalHashService.getAllHospitalHashes());
    }

    @GetMapping("/{hospitalId}")
    public ResponseEntity<HospitalHash> getHospitalHash(@PathVariable String hospitalId) {
        return ResponseEntity.ok(hospitalHashService.getHospitalHash(hospitalId));
    }
}
