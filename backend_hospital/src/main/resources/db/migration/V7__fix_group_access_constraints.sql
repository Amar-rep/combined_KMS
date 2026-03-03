
ALTER TABLE group_access
    ALTER COLUMN hospital_id SET NOT NULL;

ALTER TABLE departments
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE patients
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE doctors
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE appointments
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE groups
    ALTER COLUMN created_at SET NOT NULL;
