package com.pharmaflow.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.pharmaflow.entities.Category;
import com.pharmaflow.entities.Medicine;
import com.pharmaflow.enums.Unit;

@DataJpaTest
class MedicineRepositoryTest {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setCategoryName("Painkillers");
        category = categoryRepository.save(category);

        saveMedicine("Paracetamol 500mg", category);
        saveMedicine("Paracetamol Syrup", category);
        saveMedicine("Ibuprofen 400mg", category);
    }

    private void saveMedicine(String name, Category category) {
        Medicine medicine = new Medicine();
        medicine.setName(name);
        medicine.setBrand("GenericBrand");
        medicine.setManufacturer("GenericPharma");
        medicine.setPrice(new BigDecimal("25.00"));
        medicine.setStock(100);
        medicine.setUnit(Unit.STRIP);
        medicine.setPrescriptionRequired(false);
        medicine.setCategory(category);
        medicineRepository.save(medicine);
    }

    @Test
    void testFindByCategory_CategoryId_returnsAllMedicinesInCategory() {
        List<Medicine> result = medicineRepository.findByCategory_CategoryId(category.getCategoryId());
        assertEquals(3, result.size());
    }

    @Test
    void testFindByNameContainingIgnoreCase_matchesCaseInsensitively() {
        List<Medicine> result = medicineRepository.findByNameContainingIgnoreCase("paracetamol");
        assertEquals(2, result.size());
    }

    @Test
    void testFindByStockLessThan_returnsOnlyLowStockMedicines() {
        Medicine lowStock = new Medicine();
        lowStock.setName("Low Stock Item");
        lowStock.setBrand("GenericBrand");
        lowStock.setManufacturer("GenericPharma");
        lowStock.setPrice(new BigDecimal("10.00"));
        lowStock.setStock(2);
        lowStock.setUnit(Unit.BOTTLE);
        lowStock.setPrescriptionRequired(false);
        lowStock.setCategory(category);
        medicineRepository.save(lowStock);

        List<Medicine> result = medicineRepository.findByStockLessThan(5);
        assertEquals(1, result.size());
        assertEquals("Low Stock Item", result.get(0).getName());
    }
}
