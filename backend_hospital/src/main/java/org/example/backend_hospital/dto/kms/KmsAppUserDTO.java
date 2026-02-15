package org.example.backend_hospital.dto.kms;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KmsAppUserDTO {
    private Long id;
    private String userIdKeccak;
    private byte[] publicKey;
    private String name;

}
