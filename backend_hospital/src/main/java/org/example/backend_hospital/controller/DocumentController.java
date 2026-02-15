package org.example.backend_hospital.controller;

import org.example.backend_hospital.dto.kms.KmsUploadFileDTO;
import org.example.backend_hospital.dto.kms.KmsUploadResponseDTO;
import org.example.backend_hospital.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.example.backend_hospital.dto.kms.KmsDownloadFileDTO;
import org.example.backend_hospital.dto.kms.KmsAllowAccessDTO;
import org.example.backend_hospital.dto.kms.KmsAllowAccessResponseDTO;
import org.example.backend_hospital.dto.kms.KmsRevokeAccessDTO;
import org.example.backend_hospital.dto.kms.KmsRevokeAccessResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping
    public ResponseEntity<KmsUploadResponseDTO> createDocument(@RequestBody KmsUploadFileDTO documentDTO) {
        return ResponseEntity.ok(documentService.createDocument(documentDTO));
    }

    // download document
    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadDocument(
            @RequestBody KmsDownloadFileDTO request) {
        log.info("[DocumentController] downloadDocument called with input: {}", request);
        return ResponseEntity.ok(documentService.downloadDocument(request));
    }

    @PostMapping("/access")
    public ResponseEntity<KmsAllowAccessResponseDTO> giveAccess(
            @RequestBody KmsAllowAccessDTO request) {
        log.info("[DocumentController] giveAccess called with input: {}", request);
        return ResponseEntity.ok(documentService.giveAccess(request));
    }

    @PostMapping("/revoke-access")
    public ResponseEntity<KmsRevokeAccessResponseDTO> revokeAccess(
            @RequestBody KmsRevokeAccessDTO request) {
        log.info("[DocumentController] revokeAccess called with input: {}", request);
        return ResponseEntity.ok(documentService.revokeAccess(request));
    }
}
