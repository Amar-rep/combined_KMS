package org.example.backend_hospital.service;

import org.example.backend_hospital.dto.CreateDepartmentDTO;
import org.example.backend_hospital.entity.Department;
import org.example.backend_hospital.exception.ResourceNotFoundException;
import org.example.backend_hospital.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public Department createDepartment(CreateDepartmentDTO dto) {
        Department department = new Department();
        department.setName(dto.getName());
        department.setDescription(dto.getDescription());
        return departmentRepository.save(department);
    }

    public Department findById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }
}
