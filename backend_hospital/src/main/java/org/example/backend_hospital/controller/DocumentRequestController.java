package org.example.backend_hospital.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_hospital.dto.kms.KmsCreateDocumentRequestDTO;
import org.example.backend_hospital.dto.kms.KmsDocumentRequestDTO;
import org.example.backend_hospital.service.DocumentRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/document-requests")
@RequiredArgsConstructor
public class DocumentRequestController {

    private final DocumentRequestService documentRequestService;

    @PostMapping
    public ResponseEntity<KmsDocumentRequestDTO> createDocumentRequest(@RequestBody KmsCreateDocumentRequestDTO dto) {
        return new ResponseEntity<>(documentRequestService.createDocumentRequest(dto), HttpStatus.CREATED);
    }

    @GetMapping("/receiver/{receiverIdKeccak}")
    public ResponseEntity<List<KmsDocumentRequestDTO>> getRequestsByReceiver(@PathVariable String receiverIdKeccak) {
        return ResponseEntity.ok(documentRequestService.getDocumentRequestsByReceiver(receiverIdKeccak));
    }

    @GetMapping("/receiver/{receiverIdKeccak}/status/{status}")
    public ResponseEntity<List<KmsDocumentRequestDTO>> getRequestsByReceiverAndStatus(
            @PathVariable String receiverIdKeccak,
            @PathVariable String status) {
        return ResponseEntity
                .ok(documentRequestService.getDocumentRequestsByReceiverAndStatus(receiverIdKeccak, status));
    }

}
