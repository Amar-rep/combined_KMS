package com.example.kms.controller;

import com.example.kms.entity.GroupKey;
import com.example.kms.entity.Record;
import com.example.kms.repository.RecordRepository;
import com.example.kms.service.EncryptionService;
import com.example.kms.service.IpfsService;
import com.example.kms.service.KeyService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.SecretKey;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final RecordRepository recordRepository;
    private final KeyService keyService;
    private final IpfsService ipfsService;
    private final EncryptionService encryptionService;

    @GetMapping("/health")
    public String health() {
        return "KMS is running";
    }

    @PostMapping("/health/fetch-ipfs")
    public ResponseEntity<byte[]> fetchFromIpfs(@RequestBody FetchIpfsDTO request) {
        try {
            Record record = recordRepository.findById(request.getRecordId())
                    .orElseThrow(() -> new RuntimeException("Record not found"));

            if (!record.getGroupKey().getGroupId().equals(request.getGroupId())) {
                throw new RuntimeException("Record does not belong to group");
            }

            GroupKey groupKey = record.getGroupKey();

            SecretKey dek = keyService.base64ToSecretKey(groupKey.getDekBase64(), "AES");

            byte[] encryptedFileData = ipfsService.fetch(record.getCid());
            byte[] decryptedFileData = encryptionService.decryptWithDEK(encryptedFileData, dek);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "file_" + record.getRecordId());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(decryptedFileData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch/decode from IPFS: " + e.getMessage(), e);
        }
    }

    @Data
    public static class FetchIpfsDTO {
        private String groupId;
        private String recordId;
    }
}
