# Secure Patient Document Access Management

This project manages secure document access and registrations for patients, doctors, and hospitals.

## Architecture Overview

The system consists of several components:

- **Backends:**
  - `kms`: Key Management System backend.
  - `backend_hospital`: Hospital backend.
- **Frontends:**
  - `frontend_kms`: Interfaces with the KMS for key registration.
  - `frontend_authority`: Administrative interface to register hospitals and assign people to them.
  - `frontend_user`: The main user interface for patients and doctors.
  - `frontend_raw`: Contains raw frontend files.

## Running the Application

### 1. Start the Backends

First, start the backend services using Docker Compose:

```bash
docker-compose up
```

### 2. Run the Frontends

You will need to open separate terminals to run each of the frontend applications:

**Key Registration:**
Run the KMS frontend to perform initial key registrations:
```bash
npm run frontend_kms
```

**Authority / Hospital Registration:**
Run the Authority frontend to register hospitals and enroll people:
```bash
npm run frontend_authority
```

**User Interface:**
Run the main user frontend to access the patient and doctor dashboards:
```bash
npm run frontend_user
```
