package org.example.backend_hospital.service;

import org.example.backend_hospital.dto.RegisterDoctorDTO;
import org.example.backend_hospital.dto.kms.KmsAppUserDTO;
import org.example.backend_hospital.entity.Department;
import org.example.backend_hospital.entity.Doctor;
import org.example.backend_hospital.exception.ResourceNotFoundException;
import org.example.backend_hospital.repository.DepartmentRepository;
import org.example.backend_hospital.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final KmsClientService kmsClientService;

    public Doctor registerDoctor(RegisterDoctorDTO dto) {
        if (doctorRepository.findByDoctorIdKeccak(dto.getDoctorIdKeccak()).isPresent()) {
            throw new IllegalArgumentException("Doctor with keccak ID " + dto.getDoctorIdKeccak() + " already exists");
        }
        KmsAppUserDTO kmsUser = kmsClientService.getUserByKeccak(dto.getDoctorIdKeccak());
        if (kmsUser == null) {
            throw new IllegalArgumentException("User data not found in KMS");
        }
        Doctor doctor = new Doctor();
        doctor.setDoctorIdKeccak(dto.getDoctorIdKeccak());
        doctor.setName(dto.getName());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getPhone());

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department not found with ID: " + dto.getDepartmentId()));
            doctor.setDepartment(department);
        }

        return doctorRepository.save(doctor);
    }

    public Doctor findById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
    }

    public Doctor findByKeccakId(String doctorIdKeccak) {
        return doctorRepository.findByDoctorIdKeccak(doctorIdKeccak)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with keccak ID: " + doctorIdKeccak));
    }

    public List<Doctor> findByDepartment(Long departmentId) {
        return doctorRepository.findByDepartmentId(departmentId);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
}
