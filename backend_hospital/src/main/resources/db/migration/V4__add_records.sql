-- V4: Add records table

CREATE TABLE records (
    record_id VARCHAR(255) PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    cid VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_records_group ON records(group_id);
CREATE INDEX idx_records_cid ON records(cid);
