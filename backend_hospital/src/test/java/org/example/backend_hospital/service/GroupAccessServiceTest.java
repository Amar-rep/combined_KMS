package org.example.backend_hospital.service;

import org.example.backend_hospital.config.AppConfig;
import org.example.backend_hospital.entity.GroupAccess;
import org.example.backend_hospital.exception.ResourceNotFoundException;
import org.example.backend_hospital.repository.GroupAccessRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupAccessServiceTest {

    @Mock
    private GroupAccessRepository groupAccessRepository;

    @Mock
    private AppConfig appConfig;

    @InjectMocks
    private GroupAccessService groupAccessService;

    @Test
    void getEncryptedGroupKey_Success() {
        String groupId = "group1";
        String doctorKeccak = "doctor1";
        String hospitalId = "hospital1";
        String expectedKey = "encryptedKey";

        when(appConfig.getId()).thenReturn(hospitalId);

        GroupAccess groupAccess = new GroupAccess();
        groupAccess.setEncGroupKey(expectedKey);

        when(groupAccessRepository.findByGroup_GroupIdAndDoctor_DoctorIdKeccakAndHospitalId(groupId, doctorKeccak,
                hospitalId))
                .thenReturn(Optional.of(groupAccess));

        String actualKey = groupAccessService.getEncryptedGroupKey(groupId, doctorKeccak);

        assertEquals(expectedKey, actualKey);
    }

    @Test
    void getEncryptedGroupKey_NotFound() {
        String groupId = "group1";
        String doctorKeccak = "doctor1";
        String hospitalId = "hospital1";

        when(appConfig.getId()).thenReturn(hospitalId);
        when(groupAccessRepository.findByGroup_GroupIdAndDoctor_DoctorIdKeccakAndHospitalId(groupId, doctorKeccak,
                hospitalId))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> groupAccessService.getEncryptedGroupKey(groupId, doctorKeccak));
    }
}
