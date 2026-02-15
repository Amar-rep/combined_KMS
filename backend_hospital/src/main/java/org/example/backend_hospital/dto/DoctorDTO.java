package org.example.backend_hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend_hospital.entity.Doctor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {
    private Long id;
    private String doctorIdKeccak;
    private String name;
    private String specialization;
    private String email;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private OffsetDateTime createdAt;

    public static DoctorDTO fromEntity(Doctor doctor) {
        return DoctorDTO.builder()
                .id(doctor.getId())
                .doctorIdKeccak(doctor.getDoctorIdKeccak())
                .name(doctor.getName())
                .specialization(doctor.getSpecialization())
                .email(doctor.getEmail())
                .phone(doctor.getPhone())
                .departmentId(doctor.getDepartment() != null ? doctor.getDepartment().getId() : null)
                .departmentName(doctor.getDepartment() != null ? doctor.getDepartment().getName() : null)
                .createdAt(doctor.getCreatedAt())
                .build();
    }
}
