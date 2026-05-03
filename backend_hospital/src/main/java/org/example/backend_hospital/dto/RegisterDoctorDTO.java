package org.example.backend_hospital.dto;

import lombok.Data;

@Data
public class RegisterDoctorDTO {
    private String publicKeyBase64;
    private String name;
    private String specialization;
    private String email;
    private String phone;
    private Long departmentId;
    private String password;
}
