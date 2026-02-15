package org.example.backend_hospital.dto.kms;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class KmsGroupKeyDTO {
    private String groupId;
    private String groupName;
    private KmsAppUserDTO user;
    private String dekBase64;
    private String groupKeyBase64;
    private String encDekUser;
    private String encDekGroup;
    private OffsetDateTime createdAt;
}
