package org.example.backend_hospital.dto.kms;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KmsUploadFileDTO {
    private String sender_keccak;
    private String group_id;
    private String group_key_base64;
    private String nonce;
    private String signature;
    private Map<String, Object> metadata;
    private String fileDataBase64;
    private String filename;
}
