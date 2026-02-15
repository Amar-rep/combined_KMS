package org.example.backend_hospital.repository;

import org.example.backend_hospital.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientIdKeccak(String patientIdKeccak);

    Optional<Patient> findByEmail(String email);
}
