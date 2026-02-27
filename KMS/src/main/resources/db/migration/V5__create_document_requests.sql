CREATE TABLE document_requests (
    id BIGSERIAL PRIMARY KEY,
    sender_id_keccak VARCHAR(255) NOT NULL,
    receiver_id_keccak VARCHAR(255) NOT NULL,
    sender_hospital_id VARCHAR(255) NOT NULL,
    receiver_hospital_id VARCHAR(255) NOT NULL,
    group_id VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_docreq_sender FOREIGN KEY (sender_id_keccak) REFERENCES app_users(user_id_keccak) ON DELETE CASCADE,
    CONSTRAINT fk_docreq_receiver FOREIGN KEY (receiver_id_keccak) REFERENCES app_users(user_id_keccak) ON DELETE CASCADE,
    CONSTRAINT fk_docreq_sender_hosp FOREIGN KEY (sender_hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    CONSTRAINT fk_docreq_receiver_hosp FOREIGN KEY (receiver_hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
    CONSTRAINT fk_docreq_group FOREIGN KEY (group_id) REFERENCES group_keys(group_id) ON DELETE CASCADE
);
