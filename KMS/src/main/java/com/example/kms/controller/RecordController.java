package com.example.kms.controller;

import com.example.kms.dto.RecordResponseDTO;
import com.example.kms.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<RecordResponseDTO>> getRecordsByGroupId(@PathVariable String groupId) {
        return ResponseEntity.ok(recordService.getRecordsByGroupId(groupId));
    }
}
