package org.example.backend_hospital.service;

import org.example.backend_hospital.dto.RegisterPatientDTO;
import org.example.backend_hospital.dto.CreateGroupDTO;
import org.example.backend_hospital.entity.Patient;
import org.example.backend_hospital.exception.ResourceNotFoundException;
import org.example.backend_hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.backend_hospital.dto.kms.KmsAppUserDTO;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final KmsClientService kmsClientService;
    @Lazy
    private final GroupService groupService;

    @Transactional
    public Patient registerPatient(RegisterPatientDTO dto) {
        if (patientRepository.findByPatientIdKeccak(dto.getPatientIdKeccak()).isPresent()) {
            throw new IllegalArgumentException(
                    "Patient with keccak ID " + dto.getPatientIdKeccak() + " already exists");
        }

        KmsAppUserDTO kmsUser = kmsClientService.getUserByKeccak(dto.getPatientIdKeccak());
        if (kmsUser == null) {
            throw new IllegalArgumentException("User data not found in KMS");
        }

        // send the hospital id to kms later
        Patient patient = new Patient();
        patient.setPatientIdKeccak(dto.getPatientIdKeccak());
        patient.setName(dto.getName());
        patient.setEmail(dto.getEmail());
        patient.setPhone(dto.getPhone());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setAddress(dto.getAddress());
        Patient savedPatient = patientRepository.save(patient);

        CreateGroupDTO createGroupDTO = new CreateGroupDTO();
        createGroupDTO.setName("Default Group");
        createGroupDTO.setUserIdKeccak(savedPatient.getPatientIdKeccak());
        groupService.createGroup(createGroupDTO);
        return savedPatient;
    }

    public Patient findById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
    }

    public Patient findByKeccakId(String patientIdKeccak) {
        return patientRepository.findByPatientIdKeccak(patientIdKeccak)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Patient not found with keccak ID: " + patientIdKeccak));
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

}
