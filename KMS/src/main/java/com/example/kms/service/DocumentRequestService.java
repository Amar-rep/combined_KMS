package com.example.kms.service;

import com.example.kms.dto.CreateDocumentRequestDTO;
import com.example.kms.entity.AppUser;
import com.example.kms.entity.DocumentRequest;
import com.example.kms.entity.GroupKey;
import com.example.kms.entity.Hospital;
import com.example.kms.exception.ResourceNotFoundException;
import com.example.kms.repository.AppUserRepository;
import com.example.kms.repository.DocumentRequestRepository;
import com.example.kms.repository.GroupKeyRepository;
import com.example.kms.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentRequestService {

    private final DocumentRequestRepository documentRequestRepository;
    private final AppUserRepository appUserRepository;
    private final HospitalRepository hospitalRepository;
    private final GroupKeyRepository groupKeyRepository;

    public DocumentRequest createDocumentRequest(CreateDocumentRequestDTO dto) {
        AppUser sender = appUserRepository.findByUserIdKeccak(dto.getSenderIdKeccak())
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found: " + dto.getSenderIdKeccak()));

        AppUser receiver = appUserRepository.findByUserIdKeccak(dto.getReceiverIdKeccak())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found: " + dto.getReceiverIdKeccak()));

        Hospital senderHospital = hospitalRepository.findById(dto.getSenderHospitalId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Sender Hospital not found: " + dto.getSenderHospitalId()));

        Hospital receiverHospital = hospitalRepository.findById(dto.getReceiverHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Receiver Hospital not found: " + dto.getReceiverHospitalId()));

        GroupKey groupKey = groupKeyRepository.findById(dto.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + dto.getGroupId()));

        DocumentRequest request = new DocumentRequest();
        request.setSenderIdKeccak(sender);
        request.setReceiverIdKeccak(receiver);
        request.setSenderHospital(senderHospital);
        request.setReceiverHospital(receiverHospital);
        request.setGroup(groupKey);

        request.setStatus("PENDING");
        request.setCreatedAt(OffsetDateTime.now());

        return documentRequestRepository.save(request);
    }

    public List<DocumentRequest> getRequestsByReceiver(String receiverIdKeccak) {
        return documentRequestRepository.findByReceiverIdKeccak_UserIdKeccak(receiverIdKeccak);
    }

    public List<DocumentRequest> getRequestsByReceiverAndStatus(String receiverIdKeccak, String status) {
        return documentRequestRepository.findByReceiverIdKeccak_UserIdKeccakAndStatus(receiverIdKeccak, status);
    }

    public DocumentRequest getDocumentRequestById(Long id) {
        return documentRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document request not found with ID: " + id));
    }

    @Transactional
    public DocumentRequest updateStatus(Long id, String status) {
        DocumentRequest request = getDocumentRequestById(id);
        request.setStatus(status);
        return documentRequestRepository.save(request);
    }

}
