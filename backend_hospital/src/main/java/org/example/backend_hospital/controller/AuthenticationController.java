package org.example.backend_hospital.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_hospital.dto.AuthorityLoginRequestDTO;
import org.example.backend_hospital.dto.LoginRequestDTO;
import org.example.backend_hospital.entity.AuthorityCredential;
import org.example.backend_hospital.entity.DoctorCredential;
import org.example.backend_hospital.entity.PatientCredential;
import org.example.backend_hospital.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
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

    @PostMapping("/authority/login")
    public ResponseEntity<?> loginAuthority(@RequestBody AuthorityLoginRequestDTO dto) {
        Optional<AuthorityCredential> cred = authenticationService.loginAuthority(dto.getUsername(), dto.getPassword());
        if (cred.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
        AuthorityCredential authority = cred.get();
        return ResponseEntity.ok(Map.of(
                "id", authority.getId(),
                "username", authority.getUsername(),
                "name", authority.getName()
        ));
    }
}
