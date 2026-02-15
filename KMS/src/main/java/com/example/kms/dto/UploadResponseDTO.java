package com.example.kms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UploadResponseDTO {

    private String cid;
    private String recordId;
    private String groupId;
}
