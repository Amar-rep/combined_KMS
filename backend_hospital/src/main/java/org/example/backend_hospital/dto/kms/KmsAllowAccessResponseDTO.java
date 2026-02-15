package org.example.backend_hospital.dto.kms;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KmsAllowAccessResponseDTO {
    private String groupId;
    private String encryptedGroupKey;
    private String groupKeyBase64;
    private String receiverKeccak;
}
