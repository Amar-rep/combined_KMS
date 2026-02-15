package org.example.backend_hospital.dto.kms;

import lombok.Data;

@Data
public class KmsRevokeAccessDTO {
    private String sender_keccak;// user
    private String groupId;
    private String nonce;
    private String signature;
}
