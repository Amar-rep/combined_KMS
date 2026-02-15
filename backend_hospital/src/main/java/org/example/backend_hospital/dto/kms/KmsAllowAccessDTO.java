package org.example.backend_hospital.dto.kms;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KmsAllowAccessDTO {

    private String sender_keccak;// user
    private String hospital_id;
    private String receiver_keccak; // docter
    private Long notificationId;
    private String groupId;
    private String nonce;
    private String signature;

}
