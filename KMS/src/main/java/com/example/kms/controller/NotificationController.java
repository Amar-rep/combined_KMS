package com.example.kms.controller;

import com.example.kms.dto.CreateNotificationDTO;
import com.example.kms.dto.NotificationResponseDTO;
import com.example.kms.entity.Notification;
import com.example.kms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/kms/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private List<NotificationResponseDTO> mapToDTOList(List<Notification> notifications) {
        return notifications.stream()
                .map(NotificationResponseDTO::new)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<NotificationResponseDTO> createNotification(@RequestBody CreateNotificationDTO dto) {
        Notification notification = notificationService.createNotification(dto);
        return ResponseEntity.ok(new NotificationResponseDTO(notification));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponseDTO> getNotificationById(@PathVariable Long id) {
        Notification notification = notificationService.getNotificationById(id);
        return ResponseEntity.ok(new NotificationResponseDTO(notification));
    }

    @GetMapping("/receiver/{receiverIdKeccak}")
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsByReceiver(
            @PathVariable String receiverIdKeccak) {
        List<Notification> notifications = notificationService.getNotificationsByReceiver(receiverIdKeccak);
        return ResponseEntity.ok(mapToDTOList(notifications));
    }

    @GetMapping("/receiver/{receiverIdKeccak}/active")
    public ResponseEntity<List<NotificationResponseDTO>> getActiveNotifications(@PathVariable String receiverIdKeccak) {
        List<Notification> notifications = notificationService.getActiveNotificationsByReceiver(receiverIdKeccak);
        return ResponseEntity.ok(mapToDTOList(notifications));
    }

    @GetMapping("/receiver/{receiverIdKeccak}/hospital/{hospitalId}")
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsByReceiverAndHospital(
            @PathVariable String receiverIdKeccak,
            @PathVariable String hospitalId) {
        List<Notification> notifications = notificationService.getNotificationsByReceiverAndHospital(receiverIdKeccak,
                hospitalId);
        return ResponseEntity.ok(mapToDTOList(notifications));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsByHospital(@PathVariable String hospitalId) {
        List<Notification> notifications = notificationService.getNotificationsByHospitalId(hospitalId);
        return ResponseEntity.ok(mapToDTOList(notifications));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<NotificationResponseDTO> updateNotificationStatus(@PathVariable Long id,
            @RequestBody String status) {
        Notification notification = notificationService.updateStatus(id, status);
        return ResponseEntity.ok(new NotificationResponseDTO(notification));
    }

    @GetMapping("/sender/{senderIdKeccak}/hospital/{hospitalId}")
    public ResponseEntity<List<NotificationResponseDTO>> getNotificationsBySenderAndHospital(
            @PathVariable String senderIdKeccak,
            @PathVariable String hospitalId) {
        List<Notification> notifications = notificationService.getNotificationsBySenderAndHospital(senderIdKeccak,
                hospitalId);
        return ResponseEntity.ok(mapToDTOList(notifications));
    }

}
