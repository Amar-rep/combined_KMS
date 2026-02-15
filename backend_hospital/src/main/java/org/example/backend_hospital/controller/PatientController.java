package org.example.backend_hospital.controller;

import org.example.backend_hospital.dto.RegisterPatientDTO;
import org.example.backend_hospital.entity.Patient;
import org.example.backend_hospital.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/register")
    public ResponseEntity<Patient> registerPatient(@RequestBody RegisterPatientDTO dto) {
        return ResponseEntity.ok(patientService.registerPatient(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.findById(id));
    }

    @GetMapping("/keccak/{patientIdKeccak}")
    public ResponseEntity<Patient> getPatientByKeccakId(@PathVariable String patientIdKeccak) {
        return ResponseEntity.ok(patientService.findByKeccakId(patientIdKeccak));
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }
}
