package com.example.kms.dto;

import lombok.Data;

@Data
public class RegisterHospitalDTO {

    private String name;
    private String location;
    private String hospitalKeyBase64;
}
