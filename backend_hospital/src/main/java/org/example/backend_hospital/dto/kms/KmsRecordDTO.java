package org.example.backend_hospital.dto.kms;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KmsRecordDTO {
    private String recordId;
    private String groupId;
    private String cid;
    private Map<String, Object> metadata;
    private OffsetDateTime createdAt;
}
