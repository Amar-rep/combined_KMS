package com.example.kms.controller;

import com.example.kms.dto.CreateDocumentRequestDTO;
import com.example.kms.entity.DocumentRequest;
import com.example.kms.service.DocumentRequestService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<DocumentRequest> createDocumentRequest(@RequestBody CreateDocumentRequestDTO dto) {
        DocumentRequest createdRequest = documentRequestService.createDocumentRequest(dto);
        return new ResponseEntity<>(createdRequest, HttpStatus.CREATED);
    }

    @GetMapping("/receiver/{receiverIdKeccak}")
    public ResponseEntity<List<DocumentRequest>> getRequestsByReceiver(@PathVariable String receiverIdKeccak) {
        return ResponseEntity.ok(documentRequestService.getRequestsByReceiver(receiverIdKeccak));
    }

    @GetMapping("/receiver/{receiverIdKeccak}/status/{status}")
    public ResponseEntity<List<DocumentRequest>> getRequestsByReceiverAndStatus(
            @PathVariable String receiverIdKeccak,
            @PathVariable String status) {
        return ResponseEntity.ok(documentRequestService.getRequestsByReceiverAndStatus(receiverIdKeccak, status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DocumentRequest> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates) {
        String status = updates.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(documentRequestService.updateStatus(id, status));
    }
}
