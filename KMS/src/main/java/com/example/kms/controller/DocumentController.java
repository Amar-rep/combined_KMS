package com.example.kms.controller;

import com.example.kms.dto.*;
import com.example.kms.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class DocumentController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<UploadResponseDTO> uploadFile(@RequestBody UploadFileDTO uploadFileDTO) {
        try {

            UploadResponseDTO response = fileService.uploadFile(uploadFileDTO);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("File upload failed", e);
            throw e;
        }
    }

    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadFile(@RequestBody DownloadFileDTO downloadFileDTO) {
        try {

            DownloadResponseDTO response = fileService.downloadFile(downloadFileDTO);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "file_" + response.getRecordId());
            headers.setContentLength(response.getFileData().length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(response.getFileData());

        } catch (Exception e) {
            log.error("File download failed", e);
            throw e;
        }
    }

    @PostMapping("/allow-access")
    public ResponseEntity<AllowAccessResponseDTO> allowAccess(@RequestBody AllowAccessDTO allowAccessDTO) {
        try {

            AllowAccessResponseDTO response = fileService.allowAccess(allowAccessDTO);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Allow access failed", e);
            throw e;
        }
    }

    @PostMapping("/revoke-access")
    public ResponseEntity<RevokeAccessResponseDTO> revokeAccess(@RequestBody RevokeAccessDTO revokeAccessDTO) {
        try {

            RevokeAccessResponseDTO response = fileService.revokeAccess(revokeAccessDTO);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Revoke access failed", e);
            throw e;
        }
    }
}
