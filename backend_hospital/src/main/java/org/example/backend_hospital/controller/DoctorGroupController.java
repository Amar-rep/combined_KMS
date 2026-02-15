package org.example.backend_hospital.controller;

import org.example.backend_hospital.dto.CreateDoctorGroupDTO;
import org.example.backend_hospital.entity.DoctorGroup;
import org.example.backend_hospital.service.DoctorGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital/doctor-groups")
@RequiredArgsConstructor
public class DoctorGroupController {

    private final DoctorGroupService doctorGroupService;

    @PostMapping
    public ResponseEntity<DoctorGroup> createDoctorGroup(@RequestBody CreateDoctorGroupDTO dto) {
        return ResponseEntity.ok(doctorGroupService.createDoctorGroup(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorGroup> getDoctorGroupById(@PathVariable Integer id) {
        return ResponseEntity.ok(doctorGroupService.findById(id));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<DoctorGroup>> getDoctorGroupsByGroupId(@PathVariable String groupId) {
        return ResponseEntity.ok(doctorGroupService.findByGroupId(groupId));
    }

    @GetMapping("/doctor/{doctorKeccak}")
    public ResponseEntity<List<DoctorGroup>> getDoctorGroupsByDoctor(@PathVariable String doctorKeccak) {
        return ResponseEntity.ok(doctorGroupService.findByDoctor(doctorKeccak));
    }
}
