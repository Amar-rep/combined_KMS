package com.example.kms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDTO {
    private String userIdKeccak;
    private String publicKeyBase64;
    private String name;
    private String physicalAddress;
    private String phoneNumber;
}
