package com.pharmaflow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pharmaflow.entities.Medicine;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    // used by "browse medicines by category" screen
    List<Medicine> findByCategory_CategoryId(Long categoryId);

    // used by the search bar - case-insensitive partial name match
    List<Medicine> findByNameContainingIgnoreCase(String name);

    // used by Pharmacist/Admin to find medicines running low on stock
    List<Medicine> findByStockLessThan(Integer stock);
}
