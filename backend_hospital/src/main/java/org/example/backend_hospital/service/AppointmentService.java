package org.example.backend_hospital.service;

import org.example.backend_hospital.dto.CreateAppointmentDTO;
import org.example.backend_hospital.dto.UpdateAppointmentStatusDTO;
import org.example.backend_hospital.entity.Appointment;
import org.example.backend_hospital.entity.Doctor;
import org.example.backend_hospital.entity.Patient;
import org.example.backend_hospital.exception.ResourceNotFoundException;
import org.example.backend_hospital.repository.AppointmentRepository;
import org.example.backend_hospital.repository.DoctorRepository;
import org.example.backend_hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public Appointment createAppointment(CreateAppointmentDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setStatus("SCHEDULED");
        appointment.setNotes(dto.getNotes());
        return appointmentRepository.save(appointment);
    }

    public Appointment findById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
    }

    public List<Appointment> findByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> findByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> findByStatus(String status) {
        return appointmentRepository.findByStatus(status);
    }

    @Transactional
    public Appointment updateStatus(Long id, UpdateAppointmentStatusDTO dto) {
        Appointment appointment = findById(id);
        appointment.setStatus(dto.getStatus());
        return appointmentRepository.save(appointment);
    }
}
