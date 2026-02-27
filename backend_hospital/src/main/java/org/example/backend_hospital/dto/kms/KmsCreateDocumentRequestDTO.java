package org.example.backend_hospital.dto.kms;

import lombok.Data;

@Data
public class KmsCreateDocumentRequestDTO {
    private String senderIdKeccak;
    private String receiverIdKeccak;
    private String senderHospitalId;
    private String receiverHospitalId;
    private String groupId;
}
