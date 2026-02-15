package com.example.kms.dto;

import lombok.Data;

@Data
public class RegisterUserDTO {

    private String publicKeyBase64;
    private String name;
    private String physicalAddress;
    private String phoneNumber;

}
