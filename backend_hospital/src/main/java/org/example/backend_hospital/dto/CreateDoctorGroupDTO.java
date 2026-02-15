package org.example.backend_hospital.dto;

import lombok.Data;

@Data
public class CreateDoctorGroupDTO {
    private String groupId;
    private String doctorKeccak;
    private String groupKeyBase64;
    private String groupKeyBase64Enc;
}
