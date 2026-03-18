package org.example.backend_hospital.repository;

import org.example.backend_hospital.entity.AuthorityCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthorityCredentialRepository extends JpaRepository<AuthorityCredential, Long> {
    Optional<AuthorityCredential> findByUsername(String username);
}
