package com.example.kms.controller;

import com.example.kms.dto.RegisterHospitalDTO;
import com.example.kms.entity.Hospital;
import com.example.kms.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kms/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    @PostMapping("/register")
    public ResponseEntity<Hospital> registerHospital(@RequestBody RegisterHospitalDTO dto) {
        Hospital hospital = hospitalService.registerHospital(dto);
        return ResponseEntity.ok(hospital);
    }

    @GetMapping("/{hospitalId}")
    public ResponseEntity<Hospital> getHospitalById(@PathVariable String hospitalId) {
        return ResponseEntity.ok(hospitalService.findById(hospitalId));
    }

}
