package com.example.kms.controller;

import com.example.kms.dto.GroupAccessRequestDTO;
import com.example.kms.dto.GroupAccessResponseDTO;
import com.example.kms.service.GroupAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/group-access")
@RequiredArgsConstructor
public class GroupAccessController {

    private final GroupAccessService groupAccessService;

    @PostMapping("/hospital-doctor")
    public ResponseEntity<List<GroupAccessResponseDTO>> getGroupAccesses(@RequestBody GroupAccessRequestDTO request) {
        return ResponseEntity.ok(groupAccessService.getGroupAccesses(request.getHospitalId(), request.getDoctorId()));
    }

    @PostMapping("/hospital")
    public ResponseEntity<List<GroupAccessResponseDTO>> getGroupAccessesHospitalId(
            @RequestBody GroupAccessRequestDTO request) {
        return ResponseEntity.ok(groupAccessService.getGroupAccessesHospitalId(request.getHospitalId()));
    }
}
