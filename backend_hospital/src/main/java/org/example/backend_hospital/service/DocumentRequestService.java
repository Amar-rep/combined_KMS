package org.example.backend_hospital.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend_hospital.dto.kms.KmsCreateDocumentRequestDTO;
import org.example.backend_hospital.dto.kms.KmsDocumentRequestDTO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class DocumentRequestService {

    private final KmsClientService kmsClientService;

    public KmsDocumentRequestDTO createDocumentRequest(KmsCreateDocumentRequestDTO request) {
        log.info("Creating document request from sender {} to receiver {}", request.getSenderIdKeccak(),
                request.getReceiverIdKeccak());
        return kmsClientService.createDocumentRequest(request);
    }

    public List<KmsDocumentRequestDTO> getDocumentRequestsByReceiver(String receiverIdKeccak) {
        return kmsClientService.getDocumentRequestsByReceiver(receiverIdKeccak);
    }

    public List<KmsDocumentRequestDTO> getDocumentRequestsByReceiverAndStatus(String receiverIdKeccak, String status) {
        return kmsClientService.getDocumentRequestsByReceiverAndStatus(receiverIdKeccak, status);
    }

}
