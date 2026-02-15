package com.example.kms.service;

import com.example.kms.dto.RecordDTO;
import com.example.kms.dto.RecordResponseDTO;
import com.example.kms.entity.GroupKey;
import com.example.kms.entity.Record;
import com.example.kms.repository.GroupKeyRepository;
import com.example.kms.repository.RecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final RecordRepository recordRepository;
    private final GroupKeyRepository groupKeyRepository;
    private final KeyService keyService;

    @Transactional
    public RecordDTO createRecord(RecordDTO recordDTO) {
        GroupKey groupKey = groupKeyRepository.findById(recordDTO.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + recordDTO.getGroupId()));

        String recordId = keyService.generateRecordID();

        Record record = new Record();
        record.setRecordId(recordId);
        record.setGroupKey(groupKey);
        record.setMetadata(recordDTO.getMetadata());

        Record savedRecord = recordRepository.save(record);

        return new RecordDTO(
                savedRecord.getRecordId(),
                savedRecord.getGroupKey().getGroupId(),
                savedRecord.getMetadata());
    }

    @Transactional(readOnly = true)
    public List<RecordResponseDTO> getRecordsByGroupId(String groupId) {
        return recordRepository.findByGroupKey_GroupId(groupId)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    private RecordResponseDTO toResponseDTO(Record record) {
        return RecordResponseDTO.builder()
                .recordId(record.getRecordId())
                .groupId(record.getGroupKey().getGroupId())
                .cid(record.getCid())
                .metadata(record.getMetadata())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
