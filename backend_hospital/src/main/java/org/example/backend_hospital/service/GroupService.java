package org.example.backend_hospital.service;

import org.example.backend_hospital.dto.CreateGroupDTO;
import org.example.backend_hospital.dto.kms.KmsCreateGroupResponseDTO;
import org.example.backend_hospital.dto.kms.KmsRegisterGroupDTO;
import org.example.backend_hospital.entity.Group;
import org.example.backend_hospital.entity.Patient;
import org.example.backend_hospital.exception.ResourceNotFoundException;
import org.example.backend_hospital.repository.GroupRepository;
import org.example.backend_hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final PatientRepository patientRepository;
    private final KmsClientService kmsClientService;

    public Group createGroup(CreateGroupDTO dto) {

        Patient user = patientRepository.findByPatientIdKeccak(dto.getUserIdKeccak())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found with keccak ID: " + dto.getUserIdKeccak()));

        KmsCreateGroupResponseDTO kmsResponse = kmsClientService.createGroup(new KmsRegisterGroupDTO(
                dto.getName(),
                dto.getUserIdKeccak()));

        Group group = new Group();
        group.setGroupId(kmsResponse.getGroupId());
        group.setName(kmsResponse.getGroupName());
        group.setUser(user);
        return groupRepository.save(group);
    }

    public Group findById(Integer id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + id));
    }

    public Group findByGroupId(String groupId) {
        return groupRepository.findByGroupId(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with group ID: " + groupId));
    }

    public List<Group> findByUser(String userIdKeccak) {
        return groupRepository.findByUserPatientIdKeccak(userIdKeccak);
    }

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }
}
