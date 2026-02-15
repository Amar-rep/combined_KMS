package com.example.kms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupAccessResponseDTO {
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
