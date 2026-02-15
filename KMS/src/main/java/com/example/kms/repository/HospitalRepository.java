package com.example.kms.repository;

import com.example.kms.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, String> {
    Optional<Hospital> findByHospitalKeybase64(String hospitalKeybase64);
}
