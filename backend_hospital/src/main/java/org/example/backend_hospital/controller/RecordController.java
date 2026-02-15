package org.example.backend_hospital.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_hospital.dto.kms.KmsRecordDTO;
import org.example.backend_hospital.service.KmsClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital/records")
@RequiredArgsConstructor
public class RecordController {

    private final KmsClientService kmsClientService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<KmsRecordDTO>> getRecordsByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(kmsClientService.getRecordsByGroupId(groupId));
    }
}
