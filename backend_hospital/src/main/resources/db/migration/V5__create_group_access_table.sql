CREATE TABLE group_access (
    id BIGSERIAL PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL,
    doctor_keccak VARCHAR(64) NOT NULL,
    hospital_id VARCHAR(255) NOT NULL,
    enc_group_key TEXT,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    last_modified_at TIMESTAMPTZ,
    last_modified_by VARCHAR(150),
    CONSTRAINT fk_group_access_group FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    CONSTRAINT fk_group_access_doctor FOREIGN KEY (doctor_keccak) REFERENCES doctors(doctor_id_keccak) ON DELETE CASCADE,
    CONSTRAINT uq_group_access UNIQUE (group_id, doctor_keccak, hospital_id)
);

CREATE INDEX idx_group_access_group_id ON group_access(group_id);
CREATE INDEX idx_group_access_doctor_keccak ON group_access(doctor_keccak);
CREATE INDEX idx_group_access_hospital_id ON group_access(hospital_id);
