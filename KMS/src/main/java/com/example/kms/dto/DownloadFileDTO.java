package com.example.kms.dto;

import lombok.Data;

@Data
public class DownloadFileDTO {
    private String sender_keccak;
    private String groupId;
    private String recordId;
    private String group_key_base64;
    private String nonce;
    private String signature;
}
