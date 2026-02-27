package org.example.backend_hospital.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_hospital.dto.LoginRequestDTO;
import org.example.backend_hospital.entity.DoctorCredential;
import org.example.backend_hospital.entity.PatientCredential;
import org.example.backend_hospital.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/doctor/login")
    public ResponseEntity<?> loginDoctor(@RequestBody LoginRequestDTO dto) {
        Optional<DoctorCredential> cred = authenticationService.loginDoctor(dto.getEmail(), dto.getPassword());
        if (cred.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
        return ResponseEntity.ok(cred.get().getDoctor());
    }

    @PostMapping("/patient/login")
    public ResponseEntity<?> loginPatient(@RequestBody LoginRequestDTO dto) {
        Optional<PatientCredential> cred = authenticationService.loginPatient(dto.getEmail(), dto.getPassword());
        if (cred.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
        return ResponseEntity.ok(cred.get().getPatient());
    }
}
