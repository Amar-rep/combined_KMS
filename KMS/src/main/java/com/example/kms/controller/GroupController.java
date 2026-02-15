package com.example.kms.controller;

import com.example.kms.dto.CreateGroupResponseDTO;
import com.example.kms.dto.RegisterGroupDTO;
import com.example.kms.service.GroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;


    @PostMapping("/create")
    public ResponseEntity<CreateGroupResponseDTO> createGroup(@RequestBody RegisterGroupDTO registerGroupDTO) {
        try {

            CreateGroupResponseDTO response = groupService.createGroup(registerGroupDTO);

            log.info("Group created successfully: GroupID={}, Name={}",
                    response.getGroupId(), response.getGroupName());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Group creation failed", e);
            throw e;
        }
    }
}
