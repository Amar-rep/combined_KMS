package org.example.backend_hospital.dto.kms;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class KmsNotificationDTO {
    private Long id;
    private KmsAppUserDTO senderIdKeccak;
    private KmsAppUserDTO receiverIdKeccak;
    private KmsHospitalDTO hospital;
    private KmsGroupKeyDTO group;
    private String status;
    private String encDocGroupKey;
    private OffsetDateTime createdAt;
}
