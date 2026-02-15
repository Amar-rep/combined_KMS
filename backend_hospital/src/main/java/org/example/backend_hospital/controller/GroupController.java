package org.example.backend_hospital.controller;

import org.example.backend_hospital.dto.CreateGroupDTO;
import org.example.backend_hospital.entity.Group;
import org.example.backend_hospital.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody CreateGroupDTO dto) {
        return ResponseEntity.ok(groupService.createGroup(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable Integer id) {
        return ResponseEntity.ok(groupService.findById(id));
    }

    @GetMapping("/group-id/{groupId}")
    public ResponseEntity<Group> getGroupByGroupId(@PathVariable String groupId) {
        return ResponseEntity.ok(groupService.findByGroupId(groupId));
    }

    @GetMapping("/user/{userIdKeccak}")
    public ResponseEntity<List<Group>> getGroupsByUser(@PathVariable String userIdKeccak) {
        return ResponseEntity.ok(groupService.findByUser(userIdKeccak));
    }

    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }
}
