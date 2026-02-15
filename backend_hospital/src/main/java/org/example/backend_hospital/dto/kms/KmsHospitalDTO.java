package org.example.backend_hospital.dto.kms;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class KmsHospitalDTO {
    private String hospitalId;
    private String name;
    private String location;
    private OffsetDateTime createdAt;
    private String hospitalKeybase64;
}
