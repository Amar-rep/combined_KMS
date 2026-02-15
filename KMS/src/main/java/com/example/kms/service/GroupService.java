package com.example.kms.service;

import com.example.kms.dto.CreateGroupResponseDTO;
import com.example.kms.dto.RegisterGroupDTO;
import com.example.kms.entity.AppUser;
import com.example.kms.entity.GroupKey;
import com.example.kms.repository.GroupKeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.PublicKey;

@Service
@RequiredArgsConstructor
public class GroupService {
        private final KeyService keyService;
        private final UserService userService;
        private final GroupKeyRepository groupKeyRepository;

        public CreateGroupResponseDTO createGroup(RegisterGroupDTO registerGroupDTO) {
                try {
                        GroupKey groupKey = new GroupKey();
                        String user_keccak = registerGroupDTO.getUser_keccak();
                        AppUser user = userService.findByKeccak(user_keccak);

                        // set group id
                        groupKey.setGroupId(keyService.generateGroupID());
                        // set group name
                        groupKey.setGroupName(registerGroupDTO.getGroupName());
                        groupKey.setUser(user);

                        // Creating DEK
                        SecretKey secretKey_dek = keyService.generateDEK();
                        String dek_base64 = keyService.secretKeyToBase64(secretKey_dek);
                        groupKey.setDekBase64(dek_base64);
                        // creating group key
                        SecretKey secretKey_group = keyService.generateGroupKey();
                        String groupkey_base64 = keyService.secretKeyToBase64(secretKey_group);
                        groupKey.setGroupKeyBase64(groupkey_base64);

                        // get user public key
                        byte[] public_user = user.getPublicKey();
                        PublicKey publicKey = keyService.convertToECPublicKey(public_user);

                        // encrypt dek with public key
                        String encrypted_dek_string = keyService.encryptKeyWithPublicKey(secretKey_dek, publicKey);
                        groupKey.setEncDekUser(encrypted_dek_string);

                        // encrypt dek with group key
                        encrypted_dek_string = keyService.encryptDEKWithGroupKey(secretKey_dek, secretKey_group);
                        groupKey.setEncDekGroup(encrypted_dek_string);
                        groupKeyRepository.save(groupKey);

                        // Build and return response DTO
                        return new CreateGroupResponseDTO(
                                        groupKey.getGroupId(),
                                        groupKey.getGroupName(),
                                        groupKey.getEncDekUser(),
                                        user_keccak,
                                        groupkey_base64);
                } catch (Exception e) {
                        throw new RuntimeException("Group creation failed:" + e.getMessage());
                }

        }

}
