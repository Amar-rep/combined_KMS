package com.example.kms.service;

import com.example.kms.dto.CreateNotificationDTO;
import com.example.kms.entity.AppUser;
import com.example.kms.entity.GroupKey;
import com.example.kms.entity.Hospital;
import com.example.kms.entity.Notification;
import com.example.kms.exception.ResourceNotFoundException;
import com.example.kms.repository.AppUserRepository;
import com.example.kms.repository.GroupKeyRepository;
import com.example.kms.repository.HospitalRepository;
import com.example.kms.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;
    private final HospitalRepository hospitalRepository;
    private final GroupKeyRepository groupKeyRepository;

    public Notification createNotification(CreateNotificationDTO dto) {
        AppUser sender = appUserRepository.findByUserIdKeccak(dto.getSenderIdKeccak())
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found: " + dto.getSenderIdKeccak()));

        AppUser receiver = appUserRepository.findByUserIdKeccak(dto.getReceiverIdKeccak())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found: " + dto.getReceiverIdKeccak()));

        Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found: " + dto.getHospitalId()));

        GroupKey groupKey = groupKeyRepository.findById(dto.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + dto.getGroupId()));

        Notification notification = new Notification();
        notification.setSenderIdKeccak(sender);
        notification.setReceiverIdKeccak(receiver);
        notification.setHospital(hospital);
        notification.setGroup(groupKey);

        notification.setEncDocGroupKey("null temp");
        notification.setStatus("active");
        notification.setCreatedAt(OffsetDateTime.now());

        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByReceiver(String receiverIdKeccak) {
        return notificationRepository.findByReceiverIdKeccak_UserIdKeccak(receiverIdKeccak);
    }

    public List<Notification> getActiveNotificationsByReceiver(String receiverIdKeccak) {
        return notificationRepository.findByReceiverIdKeccak_UserIdKeccakAndStatus(receiverIdKeccak, "active");
    }

    public List<Notification> getNotificationsByReceiverAndHospital(String receiverIdKeccak, String hospitalId) {
        return notificationRepository.findByReceiverIdKeccak_UserIdKeccakAndHospital_HospitalId(receiverIdKeccak,
                hospitalId);
    }

    public List<Notification> getNotificationsByHospitalId(String hospitalId) {
        return notificationRepository.findByHospital_HospitalId(hospitalId);
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
    }

    @Transactional
    public Notification updateStatus(Long id, String status) {

        Notification notification = getNotificationById(id);
        notification.setStatus(status);
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification updateEncDocGroupKey(Long id, String encDocGroupKey) {
        Notification notification = getNotificationById(id);
        notification.setEncDocGroupKey(encDocGroupKey);
        return notificationRepository.save(notification);
    }
}
