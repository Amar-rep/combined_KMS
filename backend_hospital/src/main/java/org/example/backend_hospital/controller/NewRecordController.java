package org.example.backend_hospital.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_hospital.entity.NewRecord;
import org.example.backend_hospital.repository.NewRecordRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/new-records")
@RequiredArgsConstructor
public class NewRecordController {

    private final NewRecordRepository newRecordRepository;

    @PostMapping
    public ResponseEntity<NewRecord> createRecord(@RequestBody NewRecord record) {
        return ResponseEntity.ok(newRecordRepository.save(record));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<NewRecord>> getRecordsByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(newRecordRepository.findByGroupIdOrderByUploadedAtDesc(groupId));
    }

    @GetMapping("/patient/{patientKeccak}")
    public ResponseEntity<List<NewRecord>> getRecordsByPatient(@PathVariable String patientKeccak) {
        return ResponseEntity.ok(newRecordRepository.findByPatientKeccakOrderByUploadedAtDesc(patientKeccak));
    }
}
