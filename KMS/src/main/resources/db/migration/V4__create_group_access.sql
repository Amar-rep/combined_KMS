CREATE TABLE group_access (
    id                BIGSERIAL PRIMARY KEY,
    
    group_id          VARCHAR(10) NOT NULL REFERENCES group_keys(group_id) ON DELETE CASCADE,
    doctor_keccak     VARCHAR(64) NOT NULL REFERENCES users(user_id_keccak) ON DELETE CASCADE,
    
    hospital_id       VARCHAR(50) REFERENCES hospitals(hospital_id) ON DELETE SET NULL,
    
    enc_group_key     TEXT,                         
    
    granted_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at        TIMESTAMP WITH TIME ZONE,
    expires_at        TIMESTAMP WITH TIME ZONE,
    
    status            VARCHAR(20) DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED', 'PENDING')),
    
    last_modified_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified_by  VARCHAR(150),
    
    UNIQUE (group_id, doctor_keccak, hospital_id)
);

CREATE INDEX idx_group_access_doctor ON group_access(doctor_keccak);
CREATE INDEX idx_group_access_group ON group_access(group_id);
