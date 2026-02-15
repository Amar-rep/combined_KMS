package org.example.backend_hospital.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

import org.example.backend_hospital.dto.kms.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
@RequiredArgsConstructor
public class KmsClientService {

    private final RestClient restClient;
    private final ParameterizedTypeReference<List<KmsNotificationDTO>> listNotificationType = new ParameterizedTypeReference<>() {
    };
    private final ParameterizedTypeReference<List<KmsGroupAccessDTO>> listGroupAccessType = new ParameterizedTypeReference<>() {
    };

    public KmsAppUserDTO getUserByKeccak(String keccakId) {
        try {
            return restClient.get()
                    .uri("/api/kms/users/{keccakId}", keccakId)
                    .retrieve()
                    .body(KmsAppUserDTO.class);
        } catch (HttpClientErrorException.NotFound e) {
            return null; // Return null if 404 Not Found
        } catch (Exception e) {

            throw new RuntimeException("KMS Connection Failed", e);
        }
    }

    public KmsCreateGroupResponseDTO createGroup(KmsRegisterGroupDTO request) {
        try {
            return restClient.post()
                    .uri("/api/groups/create")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error creating group: " + errorBody);
                    })
                    .body(KmsCreateGroupResponseDTO.class);
        } catch (Exception e) {

            throw new RuntimeException("KMS Group Creation Failed", e);
        }
    }

    public KmsUploadResponseDTO uploadFile(KmsUploadFileDTO request) {
        try {
            return restClient.post()
                    .uri("/api/files/upload")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error uploading file: " + errorBody);
                    })
                    .body(KmsUploadResponseDTO.class);
        } catch (Exception e) {

            throw new RuntimeException("KMS File Upload Failed", e);
        }
    }

    public byte[] downloadFile(KmsDownloadFileDTO request) {
        try {
            return restClient.post()
                    .uri("/api/files/download")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error downloading file: " + errorBody);
                    })
                    .body(byte[].class);
        } catch (Exception e) {
            // Log and rethrow

            throw new RuntimeException("KMS File Download Failed", e);
        }
    }

    public KmsAllowAccessResponseDTO allowAccess(KmsAllowAccessDTO request) {
        try {
            return restClient.post()
                    .uri("/api/files/allow-access")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error allowing access: " + errorBody);
                    })
                    .body(KmsAllowAccessResponseDTO.class);
        } catch (Exception e) {

            throw new RuntimeException("KMS Allow Access Failed", e);
        }
    }

    public KmsRevokeAccessResponseDTO revokeAccess(KmsRevokeAccessDTO request) {
        try {
            return restClient.post()
                    .uri("/api/files/revoke-access")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error revoking access: " + errorBody);
                    })
                    .body(KmsRevokeAccessResponseDTO.class);
        } catch (Exception e) {

            throw new RuntimeException("KMS Revoke Access Failed", e);
        }
    }

    // notification points
    //////////////////////////////////////////////////////////////////////
    ///
    public KmsNotificationDTO createNotification(KmsCreateNotificationDTO request) {
        try {
            return restClient.post()
                    .uri("/api/kms/notifications")
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error creating notification: " + errorBody);
                    })
                    .body(KmsNotificationDTO.class);
        } catch (Exception e) {

            throw new RuntimeException("KMS Create Notification Failed", e);
        }
    }

    public KmsNotificationDTO getNotificationById(Long id) {
        try {
            return restClient.get()
                    .uri("/api/kms/notifications/{id}", id)
                    .retrieve()
                    .body(KmsNotificationDTO.class);
        } catch (HttpClientErrorException.NotFound e) {
            return null;
        } catch (Exception e) {

            throw new RuntimeException("KMS Get Notification Failed", e);
        }
    }

    public List<KmsNotificationDTO> getNotificationsByReceiver(String receiverIdKeccak) {
        try {
            return restClient.get()
                    .uri("/api/kms/notifications/receiver/{receiverIdKeccak}", receiverIdKeccak)
                    .retrieve()
                    .body(listNotificationType);
        } catch (Exception e) {

            throw new RuntimeException("KMS Get Notifications By Receiver Failed", e);
        }
    }

    public List<KmsNotificationDTO> getActiveNotifications(String receiverIdKeccak) {
        try {
            return restClient.get()
                    .uri("/api/kms/notifications/receiver/{receiverIdKeccak}/active", receiverIdKeccak)
                    .retrieve()
                    .body(listNotificationType);
        } catch (Exception e) {

            throw new RuntimeException("KMS Get Active Notifications Failed", e);
        }
    }

    public List<KmsNotificationDTO> getNotificationsByHospital(String receiverIdKeccak, String hospitalId) {
        try {
            return restClient.get()
                    .uri("/api/kms/notifications/receiver/{receiverIdKeccak}/hospital/{hospitalId}", receiverIdKeccak,
                            hospitalId)
                    .retrieve()
                    .body(listNotificationType);
        } catch (Exception e) {
            log.error("Failed to get notifications by hospital from KMS", e);
            throw new RuntimeException("KMS Get Notifications By Hospital Failed", e);
        }
    }

    public List<KmsNotificationDTO> getNotificationsByHospitalId(String hospitalId) {
        try {
            return restClient.get()
                    .uri("/api/kms/notifications/hospital/{hospitalId}", hospitalId)
                    .retrieve()
                    .body(listNotificationType);
        } catch (Exception e) {
            log.error("Failed to get notifications by hospital ID from KMS", e);
            throw new RuntimeException("KMS Get Notifications By Hospital ID Failed", e);
        }
    }

    // group-access points
    //////////////////////////////////////////////////////////////////////
    ///
    public List<KmsGroupAccessDTO> getGroupAccessesByHospitalId(String hospitalId) {
        try {
            Map<String, String> requestBody = Map.of("hospitalId", hospitalId);
            return restClient.post()
                    .uri("/api/group-access/hospital")
                    .body(requestBody)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error fetching group accesses: " + errorBody);
                    })
                    .body(listGroupAccessType);
        } catch (Exception e) {
            log.error("Failed to fetch group accesses from KMS for hospitalId {}", hospitalId, e);
            throw new RuntimeException("KMS Get Group Accesses Failed", e);
        }
    }

    // record points
    //////////////////////////////////////////////////////////////////////
    ///
    private final ParameterizedTypeReference<List<KmsRecordDTO>> listRecordType = new ParameterizedTypeReference<>() {
    };

    public List<KmsRecordDTO> getRecordsByGroupId(String groupId) {
        try {
            return restClient.get()
                    .uri("/api/records/group/{groupId}", groupId)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        String errorBody = new String(res.getBody().readAllBytes());
                        throw new RuntimeException("Error fetching records: " + errorBody);
                    })
                    .body(listRecordType);
        } catch (Exception e) {
            log.error("Failed to fetch records from KMS for groupId {}", groupId, e);
            throw new RuntimeException("KMS Get Records Failed", e);
        }
    }

    public record KmsAppUser(
            Long id,
            String userIdKeccak,
            byte[] publicKey,
            String name,
            String physicalAddress,
            String phone) {
    }
}
