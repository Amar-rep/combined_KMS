package com.example.kms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordResponseDTO {
    private String recordId;
    private String groupId;
    private String cid;
    private Map<String, Object> metadata;
    private OffsetDateTime createdAt;
}
