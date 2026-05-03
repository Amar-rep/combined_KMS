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

    @GetMapping("/doctor/{doctorKeccak}/hospital/{hospitalId}")
    public ResponseEntity<List<GroupAccess>> getByDoctorAndHospital(
            @PathVariable String doctorKeccak,
            @PathVariable String hospitalId) {
        return ResponseEntity.ok(groupAccessService.getByDoctorKeccakAndHospitalId(doctorKeccak, hospitalId));
    }

    @GetMapping("/patient/{patientKeccak}/hospital/{hospitalId}")
    public ResponseEntity<List<GroupAccess>> getByPatientAndHospital(
            @PathVariable String patientKeccak,
            @PathVariable String hospitalId) {
        return ResponseEntity.ok(groupAccessService.getByPatientKeccakAndHospitalId(patientKeccak, hospitalId));
    }

    @GetMapping("/key")
    public ResponseEntity<String> getEncryptedGroupKey(
            @RequestParam String groupId,
            @RequestParam String doctorId) {
        String encKey = groupAccessService.getEncryptedGroupKey(groupId, doctorId);
        return ResponseEntity.ok(encKey);
    }
}
