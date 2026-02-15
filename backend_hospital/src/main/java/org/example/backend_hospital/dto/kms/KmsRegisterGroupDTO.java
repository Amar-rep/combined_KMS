package org.example.backend_hospital.dto.kms;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KmsRegisterGroupDTO {
    private String groupName;

    @JsonProperty("user_keccak")
    private String userKeccak;
}
