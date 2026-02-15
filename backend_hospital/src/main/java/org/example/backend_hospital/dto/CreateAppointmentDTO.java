package org.example.backend_hospital.dto;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class CreateAppointmentDTO {
    private Long patientId;
    private Long doctorId;
    private OffsetDateTime appointmentDate;
    private String notes;
}
