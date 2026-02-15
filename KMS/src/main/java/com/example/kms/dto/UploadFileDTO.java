package com.example.kms.dto;

import java.util.Map;

import lombok.Data;

@Data
public class UploadFileDTO {
    private String sender_keccak;
    private String group_id;
    private String group_key_base64;
    private String nonce;
    private String signature;
    private Map<String, Object> metadata;
    private String fileDataBase64; // Base64-encoded file data
    private String filename; // Original filename
}
