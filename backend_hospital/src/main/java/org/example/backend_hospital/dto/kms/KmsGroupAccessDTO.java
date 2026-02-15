package org.example.backend_hospital.dto.kms;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KmsGroupAccessDTO {
    private Long id;
    private String groupId;
    private String doctorKeccak;
    private String hospitalId;
    private String encGroupKey;
    private OffsetDateTime grantedAt;
    private OffsetDateTime revokedAt;
    private OffsetDateTime expiresAt;
    private String status;
    private OffsetDateTime lastModifiedAt;
    private String lastModifiedBy;
}
