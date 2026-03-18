package org.example.backend_hospital.dto;

import lombok.Data;

@Data
public class AuthorityLoginRequestDTO {
    private String username;
    private String password;
}
