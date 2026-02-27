package org.example.backend_hospital.dto.kms;

import lombok.Data;

@Data
public class KmsAllowAccessInterHospitalDTO {
    private Long documentRequestId;
    private String receiverIdKeccak;
    private String nonce;
    private String signature;
}
