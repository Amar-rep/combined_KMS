package org.example.backend_hospital.repository;

import org.example.backend_hospital.entity.PatientCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientCredentialRepository extends JpaRepository<PatientCredential, Long> {
    Optional<PatientCredential> findByEmail(String email);
}
