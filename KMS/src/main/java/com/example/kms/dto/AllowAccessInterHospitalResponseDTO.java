package com.example.kms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AllowAccessInterHospitalResponseDTO {
    private String groupId;
    private String encryptedGroupKey;
    private String groupKeyBase64;
    private String doctorUserId;
}
