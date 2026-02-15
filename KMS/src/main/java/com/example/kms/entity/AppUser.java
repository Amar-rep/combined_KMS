package com.example.kms.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id_keccak", unique = true, nullable = false, length = 64)
    private String userIdKeccak;

    @Column(name = "public_key", unique = true, nullable = false)
    private byte[] publicKey;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String physicalAddress;

    @Column(length = 20)
    private String phone;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<GroupKey> groupKeys;
}