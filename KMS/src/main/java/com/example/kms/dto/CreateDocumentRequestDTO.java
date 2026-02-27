package com.example.kms.dto;

import lombok.Data;

@Data
public class CreateDocumentRequestDTO {
    private String senderIdKeccak;
    private String receiverIdKeccak;
    private String senderHospitalId;
    private String receiverHospitalId;
    private String groupId;
}
