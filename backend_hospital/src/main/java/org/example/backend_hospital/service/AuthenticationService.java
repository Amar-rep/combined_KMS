package org.example.backend_hospital.service;

import lombok.RequiredArgsConstructor;
import org.example.backend_hospital.entity.Doctor;
import org.example.backend_hospital.entity.DoctorCredential;
import org.example.backend_hospital.entity.Patient;
import org.example.backend_hospital.entity.PatientCredential;
import org.example.backend_hospital.repository.DoctorCredentialRepository;
import org.example.backend_hospital.repository.PatientCredentialRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final DoctorCredentialRepository doctorCredentialRepository;
    private final PatientCredentialRepository patientCredentialRepository;

    // ── Doctor ────────────────────────────────────────────────────────────────

    public DoctorCredential createDoctorCredential(Doctor doctor, String password) {
        DoctorCredential cred = new DoctorCredential();
        cred.setDoctor(doctor);
        cred.setEmail(doctor.getEmail());
        cred.setPassword(password);
        return doctorCredentialRepository.save(cred);
    }

    public Optional<DoctorCredential> loginDoctor(String email, String password) {
        return doctorCredentialRepository.findByEmail(email)
                .filter(cred -> cred.getPassword().equals(password));
    }

    // ── Patient ───────────────────────────────────────────────────────────────

    public PatientCredential createPatientCredential(Patient patient, String password) {
        PatientCredential cred = new PatientCredential();
        cred.setPatient(patient);
        cred.setEmail(patient.getEmail());
        cred.setPassword(password);
        return patientCredentialRepository.save(cred);
    }

    public Optional<PatientCredential> loginPatient(String email, String password) {
        return patientCredentialRepository.findByEmail(email)
                .filter(cred -> cred.getPassword().equals(password));
    }
}
