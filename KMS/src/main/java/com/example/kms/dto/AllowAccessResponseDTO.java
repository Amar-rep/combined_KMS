package com.example.kms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllowAccessResponseDTO {
    private String groupId;
    private String encryptedGroupKey;
    private String groupKeyBase64;
    private String receiverKeccak;
}
