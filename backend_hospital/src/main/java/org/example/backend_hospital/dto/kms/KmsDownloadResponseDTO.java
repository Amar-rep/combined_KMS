package org.example.backend_hospital.dto.kms;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KmsDownloadResponseDTO {
    private byte[] fileData;
    private String cid;
    private String recordId;
}
