package com.example.kms.dto;

import com.example.kms.entity.Notification;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class NotificationResponseDTO {
    private Long id;
    private String senderIdKeccak;
    private String receiverIdKeccak;
    private String hospitalId;
    private String groupId;
    private String status;
    private String encDocGroupKey;
    private OffsetDateTime createdAt;

    public NotificationResponseDTO(Notification notification) {
        this.id = notification.getId();
        this.senderIdKeccak = notification.getSenderIdKeccak() != null
                ? notification.getSenderIdKeccak().getUserIdKeccak()
                : null;
        this.receiverIdKeccak = notification.getReceiverIdKeccak() != null
                ? notification.getReceiverIdKeccak().getUserIdKeccak()
                : null;
        this.hospitalId = notification.getHospital() != null ? notification.getHospital().getHospitalId() : null;
        this.groupId = notification.getGroup() != null ? notification.getGroup().getGroupId() : null;
        this.status = notification.getStatus();
        this.encDocGroupKey = notification.getEncDocGroupKey();
        this.createdAt = notification.getCreatedAt();
    }
}
