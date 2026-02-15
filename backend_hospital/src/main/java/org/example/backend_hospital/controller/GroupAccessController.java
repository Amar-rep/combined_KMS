package org.example.backend_hospital.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend_hospital.entity.GroupAccess;
import org.example.backend_hospital.service.GroupAccessService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/group-access")
@RequiredArgsConstructor
public class GroupAccessController {

    private final GroupAccessService groupAccessService;

    @PostMapping("/sync")
    public ResponseEntity<List<GroupAccess>> syncFromKms(@RequestBody Map<String, String> request) {
        String hospitalId = request.get("hospitalId");
        List<GroupAccess> synced = groupAccessService.syncGroupAccessFromKms(hospitalId);
        return ResponseEntity.ok(synced);
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<GroupAccess>> getByHospitalId(@PathVariable String hospitalId) {
        return ResponseEntity.ok(groupAccessService.getByHospitalId(hospitalId));
    }
    // get by groupid docter id
}
