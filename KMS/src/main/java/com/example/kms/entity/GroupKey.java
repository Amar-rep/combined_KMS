package com.example.kms.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "group_keys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupKey {

    @Id
    @Column(name = "group_id", length = 10)
    private String groupId;

    @Column(name = "group_name", nullable = false)
    private String groupName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "dek_base64", nullable = false, columnDefinition = "TEXT")
    private String dekBase64;

    @Column(name = "group_key_base64", nullable = false, columnDefinition = "TEXT")
    private String groupKeyBase64;

    @Column(name = "enc_dek_user", columnDefinition = "TEXT")
    private String encDekUser;

    @Column(name = "enc_dek_group", nullable = false, columnDefinition = "TEXT")
    private String encDekGroup;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "groupKey", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Record> records;
}