package org.example.backend_hospital.service;

import org.example.backend_hospital.dto.kms.KmsAllowAccessDTO;
import org.example.backend_hospital.dto.kms.KmsAllowAccessResponseDTO;
import org.example.backend_hospital.dto.kms.KmsDownloadFileDTO;
import org.example.backend_hospital.dto.kms.KmsUploadFileDTO;
import org.example.backend_hospital.dto.kms.KmsUploadResponseDTO;
import org.example.backend_hospital.dto.kms.KmsRevokeAccessDTO;
import org.example.backend_hospital.dto.kms.KmsRevokeAccessResponseDTO;

import org.example.backend_hospital.repository.DoctorRepository;
import org.example.backend_hospital.repository.GroupRepository;
import org.example.backend_hospital.repository.GroupAccessRepository;
import org.example.backend_hospital.config.AppConfig;
import org.example.backend_hospital.exception.AccessDeniedException;
import org.example.backend_hospital.entity.GroupAccess;
import java.util.Optional;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final KmsClientService kmsClientService;
    private final DoctorRepository doctorRepository;
    private final GroupRepository groupRepository;
    private final GroupAccessService groupAccessService;
    private final GroupAccessRepository groupAccessRepository;
    private final AppConfig appConfig;

    public KmsUploadResponseDTO createDocument(KmsUploadFileDTO documentDTO) {
        // check if senderkeccak user exist in the hospital table as docter if not
        // exception
        System.out.println("Document Sender" + documentDTO.getSender_keccak());
        if (doctorRepository.findByDoctorIdKeccak(documentDTO.getSender_keccak()).isEmpty()) {
            throw new org.example.backend_hospital.exception.ResourceNotFoundException(
                    "Doctor not found with keccak id: " + documentDTO.getSender_keccak());
        }

        // check if group_id exist in the gropp table if not exception
        if (groupRepository.findByGroupId(documentDTO.getGroup_id()).isEmpty()) {
            throw new org.example.backend_hospital.exception.ResourceNotFoundException(
                    "Group not found with id: " + documentDTO.getGroup_id());
        }

        //
        
        return kmsClientService.uploadFile(documentDTO);
    }

    public byte[] downloadDocument(KmsDownloadFileDTO request) {
        String hospitalId = appConfig.getId();

        groupAccessService.syncGroupAccessFromKms(hospitalId);

        String doctorKeccak = request.getSender_keccak();
        String groupId = request.getGroupId(); // Fixed method name

        Optional<GroupAccess> access = groupAccessRepository.findByGroup_GroupIdAndDoctor_DoctorIdKeccakAndHospitalId(
                groupId, doctorKeccak, hospitalId);

        if (access.isEmpty()) {
            throw new AccessDeniedException(
                    "Access denied: No access record found for doctor " + doctorKeccak + " in group " + groupId);
        }

        GroupAccess groupAccess = access.get();
        if ("REVOKED".equalsIgnoreCase(groupAccess.getStatus())) { // Assuming status is String
            throw new AccessDeniedException(
                    "Access denied: Access revoked for doctor " + doctorKeccak + " in group " + groupId);
        }

        return kmsClientService.downloadFile(request);
    }

    public KmsAllowAccessResponseDTO giveAccess(KmsAllowAccessDTO request) {
        KmsAllowAccessResponseDTO response = kmsClientService.allowAccess(request);
        String hospitalId = appConfig.getId();
        groupAccessService.syncGroupAccessFromKms(hospitalId);
        return response;
    }

    public KmsRevokeAccessResponseDTO revokeAccess(KmsRevokeAccessDTO request) {
        KmsRevokeAccessResponseDTO response = kmsClientService.revokeAccess(request);
        String hospitalId = appConfig.getId();
        groupAccessService.syncGroupAccessFromKms(hospitalId);
        return response;
    }
}
