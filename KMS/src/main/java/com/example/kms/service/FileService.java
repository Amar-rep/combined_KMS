package com.example.kms.service;

import com.example.kms.dto.AllowAccessDTO;
import com.example.kms.dto.AllowAccessResponseDTO;
import com.example.kms.dto.DownloadFileDTO;
import com.example.kms.dto.DownloadResponseDTO;
import com.example.kms.dto.RevokeAccessDTO;
import com.example.kms.dto.UploadFileDTO;
import com.example.kms.dto.UploadResponseDTO;
import com.example.kms.entity.AppUser;
import com.example.kms.entity.GroupKey;

import com.example.kms.entity.Record;
import com.example.kms.exception.InvalidFileException;
import com.example.kms.repository.GroupKeyRepository;
import com.example.kms.repository.HospitalRepository;
import com.example.kms.repository.RecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Base64;
import javax.crypto.SecretKey;
import java.security.PublicKey;
import java.util.List;
import com.example.kms.dto.RevokeAccessResponseDTO;
import com.example.kms.entity.GroupAccess;
import java.time.OffsetDateTime;
import com.example.kms.entity.Hospital;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final UserService userService;
    private final KeyService keyService;
    private final EncryptionService encryptionService;
    private final IpfsService ipfsService;
    private final GroupKeyRepository groupKeyRepository;
    private final RecordRepository recordRepository;
    private final GroupAccessService groupAccessService;
    private final HospitalService hospitalService;
    private final NotificationService notificationService;
    private final HospitalRepository hospitalRepository;
    private final com.example.kms.repository.GroupAccessRepository groupAccessRepository;

    @Transactional
    public UploadResponseDTO uploadFile(UploadFileDTO uploadFileDTO) {
        try {

            AppUser sender = userService.findByKeccak(uploadFileDTO.getSender_keccak());
            log.debug("Found sender user: {}", sender.getUserIdKeccak());

            GroupKey groupKey = groupKeyRepository.findById(uploadFileDTO.getGroup_id())
                    .orElseThrow(() -> new RuntimeException(
                            "Group not found with ID: " + uploadFileDTO.getGroup_id()));
            log.debug("Found group: {}", groupKey.getGroupId());

            boolean isSignatureValid = keyService.verifySignature(
                    uploadFileDTO.getNonce(),
                    uploadFileDTO.getSignature(),
                    uploadFileDTO.getSender_keccak());

            if (!isSignatureValid) {
                throw new RuntimeException("Invalid signature for user: " + uploadFileDTO.getSender_keccak());
            }
            log.debug("Signature verified successfully");

            SecretKey dek = keyService.decryptDEKWithGroupKey(
                    groupKey.getEncDekGroup(),
                    uploadFileDTO.getGroup_key_base64());
            log.debug("DEK decrypted successfully");

            if (uploadFileDTO.getFileDataBase64() == null || uploadFileDTO.getFileDataBase64().isEmpty()) {
                throw new InvalidFileException("File data is required ");
            }

            // Decode Base64 file data
            byte[] fileBytes = Base64.getDecoder().decode(uploadFileDTO.getFileDataBase64());
            log.debug("File size: {} bytes", fileBytes.length);

            byte[] encryptedFileData = encryptionService.encryptWithDEK(fileBytes, dek);

            log.debug("File encrypted successfully, encrypted size: {} bytes", encryptedFileData.length);

            String cid = ipfsService.upload(encryptedFileData);

            String recordId = keyService.generateRecordID();

            Record record = new Record();
            record.setRecordId(recordId);
            record.setGroupKey(groupKey);
            record.setCid(cid);
            record.setMetadata(uploadFileDTO.getMetadata());

            recordRepository.save(record);
            log.info("Record created and saved with ID: {}", recordId);

            return new UploadResponseDTO(cid, recordId, groupKey.getGroupId());

        } catch (Exception e) {
            log.error("File upload failed", e);
            throw new RuntimeException("File upload failed: " + e.getMessage(), e);
        }
    }

    // service for docter to download a file
    @Transactional
    public DownloadResponseDTO downloadFile(DownloadFileDTO downloadFileDTO) {
        try {

            AppUser sender = userService.findByKeccak(downloadFileDTO.getSender_keccak());
            log.debug("Found sender user: {}", sender.getUserIdKeccak());

            GroupKey groupKey = groupKeyRepository.findById(downloadFileDTO.getGroupId())
                    .orElseThrow(() -> new RuntimeException(
                            "Group not found with ID: " + downloadFileDTO.getGroupId()));
            log.debug("Found group: {}", groupKey.getGroupId());

            boolean isSignatureValid = keyService.verifySignature(
                    downloadFileDTO.getNonce(),
                    downloadFileDTO.getSignature(),
                    downloadFileDTO.getSender_keccak());

            if (!isSignatureValid) {
                throw new RuntimeException("Invalid signature for user: " + downloadFileDTO.getSender_keccak());
            }
            log.debug("Signature verified successfully");

            // 4. Fetch the record using recordId
            Record record = recordRepository.findById(downloadFileDTO.getRecordId())
                    .orElseThrow(() -> new RuntimeException(
                            "Record not found with ID: " + downloadFileDTO.getRecordId()));
            log.debug("Found record with CID: {}", record.getCid());

            if (!record.getGroupKey().getGroupId().equals(downloadFileDTO.getGroupId())) {
                throw new RuntimeException("Record does not belong to the  group");
            }

            SecretKey dek = keyService.decryptDEKWithGroupKey(
                    groupKey.getEncDekGroup(),
                    downloadFileDTO.getGroup_key_base64());
            log.debug("DEK decrypted successfully");

            byte[] encryptedFileData = ipfsService.fetch(record.getCid());

            byte[] decryptedFileData = encryptionService.decryptWithDEK(encryptedFileData, dek);
            log.info("File decrypted successfully, size: {} bytes", decryptedFileData.length);

            return new DownloadResponseDTO(decryptedFileData, record.getCid(), record.getRecordId());

        } catch (Exception e) {

            throw new RuntimeException("File download failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public AllowAccessResponseDTO allowAccess(AllowAccessDTO allowAccessDTO) {
        try {
            log.info("Processing access grant from {} to {} for group {}",
                    allowAccessDTO.getSender_keccak(), allowAccessDTO.getReceiver_keccak(),
                    allowAccessDTO.getGroupId());

            AppUser sender = userService.findByKeccak(allowAccessDTO.getSender_keccak());
            log.debug("Found sender user: {}", sender.getUserIdKeccak());

            notificationService.updateStatus(allowAccessDTO.getNotificationId(), "accept");

            boolean isSignatureValid = keyService.verifySignature(
                    allowAccessDTO.getNonce(),
                    allowAccessDTO.getSignature(),
                    allowAccessDTO.getSender_keccak());

            if (!isSignatureValid) {
                throw new RuntimeException("Invalid signature for user: " + allowAccessDTO.getSender_keccak());
            }
            log.debug("Signature verified successfully");

            GroupKey groupKey = groupKeyRepository.findById(allowAccessDTO.getGroupId())
                    .orElseThrow(() -> new RuntimeException(
                            "Group not found with ID: " + allowAccessDTO.getGroupId()));
            log.debug("Found group: {}", groupKey.getGroupId());

            Hospital hospital = hospitalRepository.findById(allowAccessDTO.getHospital_id())
                    .orElseThrow(() -> new RuntimeException(
                            "Hospital not found with ID: " + allowAccessDTO.getHospital_id()));

            if (!groupKey.getUser().getId().equals(sender.getId())) {
                throw new RuntimeException("User " + allowAccessDTO.getSender_keccak() +
                        " is not the owner of group " + allowAccessDTO.getGroupId());
            }
            log.debug("Verified sender is the group owner");

            AppUser receiver = userService.findByKeccak(allowAccessDTO.getReceiver_keccak());
            log.debug("Found receiver user: {}", receiver.getUserIdKeccak());
            hospitalService.findById(allowAccessDTO.getHospital_id());
            String groupKeyBase64 = groupKey.getGroupKeyBase64();
            SecretKey groupSecretKey = keyService.base64ToSecretKey(groupKeyBase64, "AES");
            log.debug("Retrieved group key");

            PublicKey receiverPublicKey = keyService.convertToECPublicKey(receiver.getPublicKey());
            log.debug("Converted receiver's public key");

            String encryptedGroupKey = keyService.encryptKeyWithPublicKey(groupSecretKey, receiverPublicKey);
            log.info("Successfully encrypted group key for receiver: {}", receiver.getUserIdKeccak());
            groupAccessService.createGroupAccess(groupKey, receiver, hospital, encryptedGroupKey);
            return new AllowAccessResponseDTO(
                    groupKey.getGroupId(),
                    encryptedGroupKey,
                    groupKeyBase64,
                    receiver.getUserIdKeccak());

        } catch (Exception e) {
            log.error("Allow access failed", e);
            throw new RuntimeException("Allow access failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public RevokeAccessResponseDTO revokeAccess(RevokeAccessDTO revokeAccessDTO) {
        try {
            log.info("Processing access revocation for group {}", revokeAccessDTO.getGroupId());

            AppUser sender = userService.findByKeccak(revokeAccessDTO.getSender_keccak());
            log.debug("Found sender user: {}", sender.getUserIdKeccak());

            boolean isSignatureValid = keyService.verifySignature(
                    revokeAccessDTO.getNonce(),
                    revokeAccessDTO.getSignature(),
                    revokeAccessDTO.getSender_keccak());

            if (!isSignatureValid) {
                throw new RuntimeException("Invalid signature for user: " + revokeAccessDTO.getSender_keccak());
            }

            GroupKey groupKey = groupKeyRepository.findById(revokeAccessDTO.getGroupId())
                    .orElseThrow(
                            () -> new RuntimeException("Group not found with ID: " + revokeAccessDTO.getGroupId()));

            if (!groupKey.getUser().getId().equals(sender.getId())) {
                throw new RuntimeException("User " + revokeAccessDTO.getSender_keccak() +
                        " is not the owner of group " + revokeAccessDTO.getGroupId());
            }

            // Revoke all access
            List<GroupAccess> accesses = groupAccessRepository
                    .findByGroupKey_GroupId(revokeAccessDTO.getGroupId());

            for (GroupAccess access : accesses) {
                access.setStatus("REVOKED");
                access.setRevokedAt(OffsetDateTime.now());
                groupAccessRepository.save(access);
            }

            // Group Key
            String oldGroupKeyBase64 = groupKey.getGroupKeyBase64();

            // Decrypt DEK using old Group Key
            SecretKey dek = keyService.decryptDEKWithGroupKey(groupKey.getEncDekGroup(), oldGroupKeyBase64);

            // Generate new Group Key
            SecretKey newGroupKey = keyService.generateGroupKey();
            String newGroupKeyBase64 = keyService.secretKeyToBase64(newGroupKey);

            // Re do encrypt DEK with new Group Key
            String newEncDekGroup = keyService.encryptDEKWithGroupKey(dek, newGroupKey);

            // Update GroupKey
            groupKey.setGroupKeyBase64(newGroupKeyBase64);
            groupKey.setEncDekGroup(newEncDekGroup);
            groupKeyRepository.save(groupKey);

            return new RevokeAccessResponseDTO("SUCCESS", groupKey.getGroupId());

        } catch (Exception e) {
            log.error("Revoke access failed", e);
            throw new RuntimeException("Revoke access failed: " + e.getMessage(), e);
        }
    }

}
