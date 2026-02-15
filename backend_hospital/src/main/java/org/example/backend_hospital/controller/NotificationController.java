package org.example.backend_hospital.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_hospital.dto.kms.KmsCreateNotificationDTO;
import org.example.backend_hospital.dto.kms.KmsNotificationDTO;
import org.example.backend_hospital.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<KmsNotificationDTO> createNotification(@RequestBody KmsCreateNotificationDTO dto) {
        return ResponseEntity.ok(notificationService.createNotification(
                dto.getSenderIdKeccak(),
                dto.getReceiverIdKeccak(),
                dto.getHospitalId(),
                dto.getGroupId()));

    }

    @GetMapping("/{id}")
    public ResponseEntity<KmsNotificationDTO> getNotificationById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @GetMapping("/receiver/{receiverIdKeccak}")
    public ResponseEntity<List<KmsNotificationDTO>> getNotificationsByReceiver(@PathVariable String receiverIdKeccak) {
        return ResponseEntity.ok(notificationService.getNotificationsByReceiver(receiverIdKeccak));
    }

    @GetMapping("/receiver/{receiverIdKeccak}/active")
    public ResponseEntity<List<KmsNotificationDTO>> getActiveNotifications(@PathVariable String receiverIdKeccak) {
        return ResponseEntity.ok(notificationService.getActiveNotifications(receiverIdKeccak));
    }

    @GetMapping("/receiver/{receiverIdKeccak}/hospital/{hospitalId}")
    public ResponseEntity<List<KmsNotificationDTO>> getNotificationsByHospital(
            @PathVariable String receiverIdKeccak,
            @PathVariable String hospitalId) {
        return ResponseEntity.ok(notificationService.getNotificationsByHospital(receiverIdKeccak, hospitalId));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<KmsNotificationDTO>> getNotificationsByHospitalId(@PathVariable String hospitalId) {
        return ResponseEntity.ok(notificationService.getNotificationsByHospitalId(hospitalId));
    }
}
