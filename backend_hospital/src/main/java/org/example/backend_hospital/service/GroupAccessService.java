package org.example.backend_hospital.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend_hospital.dto.kms.KmsGroupAccessDTO;
import org.example.backend_hospital.entity.Doctor;
import org.example.backend_hospital.entity.Group;
import org.example.backend_hospital.entity.GroupAccess;
import org.example.backend_hospital.repository.DoctorRepository;
import org.example.backend_hospital.repository.GroupAccessRepository;
import org.example.backend_hospital.repository.GroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class GroupAccessService {

    private final GroupAccessRepository groupAccessRepository;
    private final GroupRepository groupRepository;
    private final DoctorRepository doctorRepository;
    private final KmsClientService kmsClientService;

    public List<GroupAccess> getByHospitalId(String hospitalId) {
        return groupAccessRepository.findByHospitalId(hospitalId);
    }

    @Transactional
    public List<GroupAccess> syncGroupAccessFromKms(String hospitalId) {
        List<KmsGroupAccessDTO> kmsRows = kmsClientService.getGroupAccessesByHospitalId(hospitalId);
        List<GroupAccess> synced = new ArrayList<>();

        for (KmsGroupAccessDTO dto : kmsRows) {
            Optional<GroupAccess> existing = groupAccessRepository
                    .findByGroup_GroupIdAndDoctor_DoctorIdKeccakAndHospitalId(
                            dto.getGroupId(), dto.getDoctorKeccak(), dto.getHospitalId());

            if (existing.isPresent()) {
                // Update mutable fields
                GroupAccess ga = existing.get();
                ga.setEncGroupKey(dto.getEncGroupKey());
                ga.setStatus(dto.getStatus());
                ga.setRevokedAt(dto.getRevokedAt());
                ga.setExpiresAt(dto.getExpiresAt());
                ga.setLastModifiedBy(dto.getLastModifiedBy());
                synced.add(groupAccessRepository.save(ga));
            } else {
                Optional<Group> group = groupRepository.findByGroupId(dto.getGroupId());
                Optional<Doctor> doctor = doctorRepository.findByDoctorIdKeccak(dto.getDoctorKeccak());

                if (group.isEmpty() || doctor.isEmpty()) {

                    continue;
                }

                GroupAccess ga = GroupAccess.builder()
                        .group(group.get())
                        .doctor(doctor.get())
                        .hospitalId(dto.getHospitalId())
                        .encGroupKey(dto.getEncGroupKey())
                        .expiresAt(dto.getExpiresAt())
                        .status(dto.getStatus())
                        .lastModifiedBy(dto.getLastModifiedBy())
                        .build();
                synced.add(groupAccessRepository.save(ga));
            }
        }

        log.info("Synced {} group access records for hospitalId={}", synced.size(), hospitalId);
        return synced;
    }

    @Transactional
    public void syncGroupAccess(String groupId, String doctorKeccak, String hospitalId) {
        // we can optmize later
        syncGroupAccessFromKms(hospitalId);
    }
}
