package com.example.kms.dto.GroupAccesdto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GroupAccessRequestDTO {
    private String groupId;
    private String doctorKeccak;
    private String hospitalId;
    private String encGroupKey;
}
