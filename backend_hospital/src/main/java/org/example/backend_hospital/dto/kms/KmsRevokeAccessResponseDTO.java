package org.example.backend_hospital.dto.kms;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KmsRevokeAccessResponseDTO {
    private String status;
    private String groupId;
}
