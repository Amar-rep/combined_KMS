package com.example.kms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordDTO {
    private String recordId;
    private String groupId;
    private Map<String, Object> metadata;
}
