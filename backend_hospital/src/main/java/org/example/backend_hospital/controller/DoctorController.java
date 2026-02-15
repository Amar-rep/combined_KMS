package org.example.backend_hospital.controller;

import org.example.backend_hospital.dto.RegisterDoctorDTO;
import org.example.backend_hospital.dto.DoctorDTO;
import org.example.backend_hospital.entity.Doctor;
import org.example.backend_hospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/register")
    public ResponseEntity<DoctorDTO> registerDoctor(@RequestBody RegisterDoctorDTO dto) {
        Doctor doctor = doctorService.registerDoctor(dto);
        return ResponseEntity.ok(DoctorDTO.fromEntity(doctor));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable Long id) {
        Doctor doctor = doctorService.findById(id);
        return ResponseEntity.ok(DoctorDTO.fromEntity(doctor));
    }

    @GetMapping("/keccak/{doctorIdKeccak}")
    public ResponseEntity<DoctorDTO> getDoctorByKeccakId(@PathVariable String doctorIdKeccak) {
        Doctor doctor = doctorService.findByKeccakId(doctorIdKeccak);
        return ResponseEntity.ok(DoctorDTO.fromEntity(doctor));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<DoctorDTO>> getDoctorsByDepartment(@PathVariable Long departmentId) {
        List<Doctor> doctors = doctorService.findByDepartment(departmentId);
        List<DoctorDTO> doctorDTOs = doctors.stream()
                .map(DoctorDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(doctorDTOs);
    }

    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        List<DoctorDTO> doctorDTOs = doctors.stream()
                .map(DoctorDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(doctorDTOs);
    }
}
