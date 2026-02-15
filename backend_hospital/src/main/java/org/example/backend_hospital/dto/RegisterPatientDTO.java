package org.example.backend_hospital.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterPatientDTO {
    private String patientIdKeccak;
    private String name;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String address;
}
