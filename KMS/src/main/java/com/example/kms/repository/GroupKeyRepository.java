package com.example.kms.repository;

import com.example.kms.entity.GroupKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupKeyRepository extends JpaRepository<GroupKey, String> {
    List<GroupKey> findByUser_Id(Long userId);
}
