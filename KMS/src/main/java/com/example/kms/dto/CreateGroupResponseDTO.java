package com.example.kms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateGroupResponseDTO {
    private String groupId;
    private String groupName;
    private String encDekUser; // DEK encrypted with user's public key
    private String userKeccak;
    private String group_key_temp;
}
