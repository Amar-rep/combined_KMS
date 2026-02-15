package com.example.kms.dto;

import lombok.Data;

@Data
public class CreateNotificationDTO {
    private String senderIdKeccak;
    private String receiverIdKeccak;
    private String hospitalId;
    private String groupId;

}
