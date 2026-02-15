package org.example.backend_hospital.controller;

import org.example.backend_hospital.dto.CreateAppointmentDTO;
import org.example.backend_hospital.dto.UpdateAppointmentStatusDTO;
import org.example.backend_hospital.entity.Appointment;
import org.example.backend_hospital.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody CreateAppointmentDTO dto) {
        return ResponseEntity.ok(appointmentService.createAppointment(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.findById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.findByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.findByDoctor(doctorId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(appointmentService.findByStatus(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long id, @RequestBody UpdateAppointmentStatusDTO dto) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, dto));
    }
}
