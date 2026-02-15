package org.example.backend_hospital.dto.kms;

import lombok.Data;

@Data
public class KmsCreateNotificationDTO {
    private String senderIdKeccak;
    private String receiverIdKeccak;
    private String hospitalId;
    private String groupId;
}
