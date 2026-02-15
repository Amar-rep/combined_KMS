CREATE TABLE hospitals (
                           hospital_id VARCHAR(50) PRIMARY KEY,
                           name VARCHAR(255) NOT NULL,
                           location TEXT,
                           created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE notifications (
                               id BIGSERIAL PRIMARY KEY,


                               sender_id_keccak VARCHAR(64) NOT NULL REFERENCES users(user_id_keccak) ON DELETE CASCADE,
                               receiver_id_keccak VARCHAR(64) NOT NULL REFERENCES users(user_id_keccak) ON DELETE CASCADE,


                               hospital_id VARCHAR(50) NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,


                               group_id VARCHAR(10) NOT NULL REFERENCES group_keys(group_id) ON DELETE CASCADE,


                               status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'reject', 'accept')),

                               enc_doc_group_key TEXT NOT NULL,

                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_notifications_receiver ON notifications(receiver_id_keccak);
CREATE INDEX idx_notifications_hospital ON notifications(hospital_id);