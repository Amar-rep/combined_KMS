package org.example.backend_hospital.dto.kms;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class KmsDocumentRequestDTO {
    private Long id;
    private KmsAppUserDTO senderIdKeccak;
    private KmsAppUserDTO receiverIdKeccak;
    private KmsHospitalDTO senderHospital;
    private KmsHospitalDTO receiverHospital;
    private KmsGroupKeyDTO group;
    private String status;
    private OffsetDateTime createdAt;
}
