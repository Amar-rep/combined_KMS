package com.example.kms.dto;

import lombok.Data;

@Data
public class RevokeAccessDTO {
    private String sender_keccak;// user
    private String groupId;
    private String nonce;
    private String signature;
}
