package com.example.kms.dto;

import lombok.Data;

@Data
public class AllowAccessInterHospitalDTO {
    private Long documentRequestId;
    private String receiverIdKeccak;
    private String nonce;
    private String signature;
}
