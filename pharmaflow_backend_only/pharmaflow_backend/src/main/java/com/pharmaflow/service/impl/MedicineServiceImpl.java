package com.pharmaflow.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmaflow.dto.request.MedicineRequest;
import com.pharmaflow.dto.response.MedicineResponse;
import com.pharmaflow.entities.Category;
import com.pharmaflow.entities.Medicine;
import com.pharmaflow.exception.InvalidOperationException;
import com.pharmaflow.exception.ResourceNotFoundException;
import com.pharmaflow.repository.CategoryRepository;
import com.pharmaflow.repository.MedicineRepository;
import com.pharmaflow.service.MedicineService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public MedicineResponse createMedicine(MedicineRequest request) {
        Category category = findCategoryOrThrow(request.getCategoryId());

        Medicine medicine = new Medicine();
        applyRequestToEntity(medicine, request, category);

        return toResponse(medicineRepository.save(medicine));
    }

    @Override
    public MedicineResponse updateMedicine(Long medicineId, MedicineRequest request) {
        Medicine medicine = findMedicineOrThrow(medicineId);
        Category category = findCategoryOrThrow(request.getCategoryId());

        applyRequestToEntity(medicine, request, category);
        return toResponse(medicine); // managed entity, flushed on commit
    }

    @Override
    public void deleteMedicine(Long medicineId) {
        Medicine medicine = findMedicineOrThrow(medicineId);
        medicineRepository.delete(medicine);
    }

    @Override
    public MedicineResponse getMedicineById(Long medicineId) {
        return toResponse(findMedicineOrThrow(medicineId));
    }

    @Override
    public List<MedicineResponse> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<MedicineResponse> getMedicinesByCategory(Long categoryId) {
        return medicineRepository.findByCategory_CategoryId(categoryId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<MedicineResponse> searchMedicines(String name) {
        return medicineRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public MedicineResponse updateStock(Long medicineId, Integer newStock) {
        if (newStock == null || newStock < 0) {
            throw new InvalidOperationException("Stock cannot be negative");
        }
        Medicine medicine = findMedicineOrThrow(medicineId);
        medicine.setStock(newStock);
        return toResponse(medicine);
    }

    private Medicine findMedicineOrThrow(Long medicineId) {
        return medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));
    }

    private Category findCategoryOrThrow(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
    }

    private void applyRequestToEntity(Medicine medicine, MedicineRequest request, Category category) {
        medicine.setName(request.getName());
        medicine.setBrand(request.getBrand());
        medicine.setManufacturer(request.getManufacturer());
        medicine.setDescription(request.getDescription());
        medicine.setPrice(request.getPrice());
        medicine.setStock(request.getStock());
        medicine.setUnit(request.getUnit());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setImage(request.getImage());
        medicine.setPrescriptionRequired(request.isPrescriptionRequired());
        medicine.setCategory(category);
    }

    private MedicineResponse toResponse(Medicine medicine) {
        MedicineResponse response = new MedicineResponse();
        response.setMedicineId(medicine.getMedicineId());
        response.setName(medicine.getName());
        response.setBrand(medicine.getBrand());
        response.setManufacturer(medicine.getManufacturer());
        response.setDescription(medicine.getDescription());
        response.setPrice(medicine.getPrice());
        response.setStock(medicine.getStock());
        response.setUnit(medicine.getUnit());
        response.setExpiryDate(medicine.getExpiryDate());
        response.setImage(medicine.getImage());
        response.setPrescriptionRequired(medicine.isPrescriptionRequired());
        response.setCreatedAt(medicine.getCreatedAt());
        response.setUpdatedAt(medicine.getUpdatedAt());
        response.setCategoryId(medicine.getCategory().getCategoryId());
        response.setCategoryName(medicine.getCategory().getCategoryName());
        return response;
    }
}
