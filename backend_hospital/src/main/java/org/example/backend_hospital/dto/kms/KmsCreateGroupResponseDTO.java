package org.example.backend_hospital.dto.kms;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KmsCreateGroupResponseDTO {
    private String groupId;
    private String groupName;
    private String encDekUser;
    private String userKeccak;

    @JsonProperty("group_key_temp")
    private String groupKeyTemp;
}
