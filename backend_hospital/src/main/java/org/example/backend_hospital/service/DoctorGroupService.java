package org.example.backend_hospital.service;

import org.example.backend_hospital.dto.CreateDoctorGroupDTO;
import org.example.backend_hospital.entity.Doctor;
import org.example.backend_hospital.entity.DoctorGroup;
import org.example.backend_hospital.entity.Group;
import org.example.backend_hospital.exception.ResourceNotFoundException;
import org.example.backend_hospital.repository.DoctorGroupRepository;
import org.example.backend_hospital.repository.DoctorRepository;
import org.example.backend_hospital.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorGroupService {

    private final DoctorGroupRepository doctorGroupRepository;
    private final GroupRepository groupRepository;
    private final DoctorRepository doctorRepository;

    public DoctorGroup createDoctorGroup(CreateDoctorGroupDTO dto) {
        Group group = groupRepository.findByGroupId(dto.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with group ID: " + dto.getGroupId()));

        Doctor doctor = doctorRepository.findByDoctorIdKeccak(dto.getDoctorKeccak())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor not found with keccak ID: " + dto.getDoctorKeccak()));

        if (doctorGroupRepository.findByGroupGroupIdAndDoctorDoctorIdKeccak(dto.getGroupId(), dto.getDoctorKeccak())
                .isPresent()) {
            throw new IllegalArgumentException("Doctor is already assigned to this group");
        }

        DoctorGroup doctorGroup = new DoctorGroup();
        doctorGroup.setGroup(group);
        doctorGroup.setDoctor(doctor);
        doctorGroup.setGroupKeyBase64(dto.getGroupKeyBase64());
        doctorGroup.setGroupKeyBase64Enc(dto.getGroupKeyBase64Enc());
        return doctorGroupRepository.save(doctorGroup);
    }

    public DoctorGroup findById(Integer id) {
        return doctorGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorGroup not found with ID: " + id));
    }

    public List<DoctorGroup> findByGroupId(String groupId) {
        return doctorGroupRepository.findByGroupGroupId(groupId);
    }

    public List<DoctorGroup> findByDoctor(String doctorKeccak) {
        return doctorGroupRepository.findByDoctorDoctorIdKeccak(doctorKeccak);
    }
}
