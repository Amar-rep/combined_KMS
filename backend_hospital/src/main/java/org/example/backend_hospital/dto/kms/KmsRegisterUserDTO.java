package org.example.backend_hospital.dto.kms;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KmsRegisterUserDTO {
    private String publicKeyBase64;
    private String name;
    private String physicalAddress;
    private String phoneNumber;
}
