package org.example.backend_hospital.dto.kms;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KmsAllowAccessInterHospitalResponseDTO {
    private String groupId;
    private String encryptedGroupKey;
    private String groupKeyBase64;
    private String doctorUserId;
}
