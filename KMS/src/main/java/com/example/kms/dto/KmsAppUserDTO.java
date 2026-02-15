package com.example.kms.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KmsAppUserDTO {
    private Long id;
    private String userIdKeccak;
    private byte[] publicKey;
    private String name;

}
