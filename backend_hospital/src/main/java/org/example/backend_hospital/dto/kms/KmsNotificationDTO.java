package org.example.backend_hospital.dto.kms;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class KmsNotificationDTO {
    private Long id;
    private String senderIdKeccak;
    private String receiverIdKeccak;
    private String hospitalId;
    private String groupId;
    private String status;
    private String encDocGroupKey;
    private OffsetDateTime createdAt;
}
