package com.example.kms.dto;

import lombok.Data;

@Data
public class AllowAccessDTO {

    private String sender_keccak;// user
    private String hospital_id;
    private String receiver_keccak; // docter
    private Long notificationId;
    private String groupId;
    private String nonce;
    private String signature;

}
