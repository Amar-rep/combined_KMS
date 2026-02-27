package org.example.backend_hospital.repository;

import org.example.backend_hospital.entity.DoctorCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorCredentialRepository extends JpaRepository<DoctorCredential, Long> {
    Optional<DoctorCredential> findByEmail(String email);
}
