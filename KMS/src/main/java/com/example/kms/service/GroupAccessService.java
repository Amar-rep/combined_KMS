package com.example.kms.service;

import com.example.kms.dto.GroupAccessResponseDTO;
import com.example.kms.entity.AppUser;
import com.example.kms.entity.GroupAccess;
import com.example.kms.entity.GroupKey;
import com.example.kms.entity.Hospital;
import com.example.kms.repository.GroupAccessRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupAccessService {

    private final GroupAccessRepository groupAccessRepository;

    @Transactional
    public void createGroupAccess(GroupKey groupKey, AppUser doctor, Hospital hospital, String encGroupKey) {
        Optional<GroupAccess> existingAccess = groupAccessRepository
                .findByGroupKey_GroupIdAndDoctor_UserIdKeccakAndHospital_HospitalId(
                        groupKey.getGroupId(),
                        doctor.getUserIdKeccak(),
                        hospital.getHospitalId());

        if (existingAccess.isPresent()) {
            GroupAccess groupAccess = existingAccess.get();
            groupAccess.setStatus("ACTIVE");
            groupAccess.setEncGroupKey(encGroupKey);
            groupAccess.setExpiresAt(OffsetDateTime.now().plusDays(30));
            groupAccess.setRevokedAt(null);
            groupAccessRepository.save(groupAccess);
        } else {

            GroupAccess groupAccess = GroupAccess.builder()
                    .groupKey(groupKey)
                    .doctor(doctor)
                    .hospital(hospital)
                    .encGroupKey(encGroupKey)
                    .expiresAt(OffsetDateTime.now().plusDays(30))
                    .status("ACTIVE")
                    .build();

            groupAccessRepository.save(groupAccess);
        }
    }

    @Transactional(readOnly = true)
    public List<GroupAccessResponseDTO> getGroupAccesses(String hospitalId, String doctorId) {
        return groupAccessRepository.findByHospital_HospitalIdAndDoctor_UserIdKeccak(hospitalId, doctorId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GroupAccessResponseDTO> getGroupAccessesHospitalId(String hospitalId) {
        return groupAccessRepository.findByHospital_HospitalId(hospitalId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private GroupAccessResponseDTO toDTO(GroupAccess ga) {
        return GroupAccessResponseDTO.builder()
                .id(ga.getId())
                .groupId(ga.getGroupKey().getGroupId())
                .doctorKeccak(ga.getDoctor().getUserIdKeccak())
                .hospitalId(ga.getHospital().getHospitalId())
                .encGroupKey(ga.getEncGroupKey())
                .grantedAt(ga.getGrantedAt())
                .revokedAt(ga.getRevokedAt())
                .expiresAt(ga.getExpiresAt())
                .status(ga.getStatus())
                .lastModifiedAt(ga.getLastModifiedAt())
                .lastModifiedBy(ga.getLastModifiedBy())
                .build();
    }
}
