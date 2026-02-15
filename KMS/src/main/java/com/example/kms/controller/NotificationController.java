package com.example.kms.controller;

import com.example.kms.dto.CreateNotificationDTO;
import com.example.kms.entity.Notification;
import com.example.kms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kms/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody CreateNotificationDTO dto) {
        Notification notification = notificationService.createNotification(dto);
        return ResponseEntity.ok(notification);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @GetMapping("/receiver/{receiverIdKeccak}")
    public ResponseEntity<List<Notification>> getNotificationsByReceiver(@PathVariable String receiverIdKeccak) {
        return ResponseEntity.ok(notificationService.getNotificationsByReceiver(receiverIdKeccak));
    }

    @GetMapping("/receiver/{receiverIdKeccak}/active")
    public ResponseEntity<List<Notification>> getActiveNotifications(@PathVariable String receiverIdKeccak) {
        return ResponseEntity.ok(notificationService.getActiveNotificationsByReceiver(receiverIdKeccak));
    }

    @GetMapping("/receiver/{receiverIdKeccak}/hospital/{hospitalId}")
    public ResponseEntity<List<Notification>> getNotificationsByReceiverAndHospital(
            @PathVariable String receiverIdKeccak,
            @PathVariable String hospitalId) {
        return ResponseEntity
                .ok(notificationService.getNotificationsByReceiverAndHospital(receiverIdKeccak, hospitalId));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<Notification>> getNotificationsByHospital(@PathVariable String hospitalId) {
        return ResponseEntity.ok(notificationService.getNotificationsByHospitalId(hospitalId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Notification> updateNotificationStatus(@PathVariable Long id, @RequestBody String status) {
        return ResponseEntity.ok(notificationService.updateStatus(id, status));
    }

}
