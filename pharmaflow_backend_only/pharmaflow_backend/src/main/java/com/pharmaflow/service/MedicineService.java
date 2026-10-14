package com.pharmaflow.service;

import java.util.List;

import com.pharmaflow.dto.request.MedicineRequest;
import com.pharmaflow.dto.response.MedicineResponse;

public interface MedicineService {

    MedicineResponse createMedicine(MedicineRequest request);

    MedicineResponse updateMedicine(Long medicineId, MedicineRequest request);

    void deleteMedicine(Long medicineId);

    MedicineResponse getMedicineById(Long medicineId);

    List<MedicineResponse> getAllMedicines();

    List<MedicineResponse> getMedicinesByCategory(Long categoryId);

    List<MedicineResponse> searchMedicines(String name);

    // Pharmacist-only - restock an existing medicine
    MedicineResponse updateStock(Long medicineId, Integer newStock);
}
