package org.example.backend_hospital.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend_hospital.dto.kms.KmsCreateNotificationDTO;
import org.example.backend_hospital.dto.kms.KmsNotificationDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final KmsClientService kmsClientService;

    public KmsNotificationDTO createNotification(String senderIdKeccak, String receiverIdKeccak,
            String hospitalId, String groupId) {
        KmsCreateNotificationDTO request = new KmsCreateNotificationDTO();
        request.setSenderIdKeccak(senderIdKeccak);
        request.setReceiverIdKeccak(receiverIdKeccak);
        request.setHospitalId(hospitalId);
        request.setGroupId(groupId);

        log.info("Creating notification: sender={}, receiver={}, hospital={}, group={}",
                senderIdKeccak, receiverIdKeccak, hospitalId, groupId);
        return kmsClientService.createNotification(request);
    }

    public KmsNotificationDTO getNotificationById(Long id) {
        return kmsClientService.getNotificationById(id);
    }

    public List<KmsNotificationDTO> getNotificationsByReceiver(String receiverIdKeccak) {
        return kmsClientService.getNotificationsByReceiver(receiverIdKeccak);
    }

    public List<KmsNotificationDTO> getActiveNotifications(String receiverIdKeccak) {
        return kmsClientService.getActiveNotifications(receiverIdKeccak);
    }

    public List<KmsNotificationDTO> getNotificationsByHospital(String receiverIdKeccak, String hospitalId) {
        return kmsClientService.getNotificationsByHospital(receiverIdKeccak, hospitalId);
    }

    public List<KmsNotificationDTO> getNotificationsByHospitalId(String hospitalId) {
        return kmsClientService.getNotificationsByHospitalId(hospitalId);
    }
}
