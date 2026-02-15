package org.example.backend_hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "group_access", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "group_id", "doctor_keccak", "hospital_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupAccess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", referencedColumnName = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_keccak", referencedColumnName = "doctor_id_keccak", nullable = false)
    private Doctor doctor;

    @Column(name = "hospital_id", nullable = false)
    private String hospitalId;

    @Column(name = "enc_group_key", columnDefinition = "TEXT")
    private String encGroupKey;

    @CreationTimestamp
    @Column(name = "granted_at", nullable = false, updatable = false)
    private OffsetDateTime grantedAt;

    @Column(name = "revoked_at")
    private OffsetDateTime revokedAt;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @ColumnDefault("'ACTIVE'")
    @Column(length = 20)
    private String status;

    @UpdateTimestamp
    @Column(name = "last_modified_at")
    private OffsetDateTime lastModifiedAt;

    @Column(name = "last_modified_by", length = 150)
    private String lastModifiedBy;
}
