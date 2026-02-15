package org.example.backend_hospital.dto.kms;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KmsDownloadFileDTO {
    private String sender_keccak;
    private String groupId;
    private String recordId;
    private String group_key_base64;
    private String nonce;
    private String signature;
}
