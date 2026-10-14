package com.pharmaflow.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaflow.dto.request.MedicineRequest;
import com.pharmaflow.dto.request.UpdateStockRequest;
import com.pharmaflow.service.MedicineService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/medicines")
@RequiredArgsConstructor
@Validated
public class MedicineController {

    private final MedicineService medicineService;

    // Desc - browse all medicines (public)
    // URI - GET /medicines
    @GetMapping
    public ResponseEntity<?> getAllMedicines() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    // Desc - medicine detail page (public)
    // URI - GET /medicines/{medicineId}
    @GetMapping("/{medicineId}")
    public ResponseEntity<?> getMedicineById(@PathVariable Long medicineId) {
        return ResponseEntity.ok(medicineService.getMedicineById(medicineId));
    }

    // Desc - filter by category (public)
    // URI - GET /medicines/category/{categoryId}
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getMedicinesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(medicineService.getMedicinesByCategory(categoryId));
    }

    // Desc - search bar (public)
    // URI - GET /medicines/search?name=...
    @GetMapping("/search")
    public ResponseEntity<?> searchMedicines(@RequestParam String name) {
        return ResponseEntity.ok(medicineService.searchMedicines(name));
    }

    // Desc - Admin adds a new medicine
    // URI - POST /medicines | ADMIN only
    @PostMapping
    public ResponseEntity<?> createMedicine(@Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicineService.createMedicine(request));
    }

    // Desc - Admin edits a medicine
    // URI - PUT /medicines/{medicineId} | ADMIN only
    @PutMapping("/{medicineId}")
    public ResponseEntity<?> updateMedicine(@PathVariable Long medicineId, @Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(medicineService.updateMedicine(medicineId, request));
    }

    // Desc - Admin removes a medicine
    // URI - DELETE /medicines/{medicineId} | ADMIN only
    @DeleteMapping("/{medicineId}")
    public ResponseEntity<?> deleteMedicine(@PathVariable Long medicineId) {
        medicineService.deleteMedicine(medicineId);
        return ResponseEntity.noContent().build();
    }

    // Desc - Pharmacist restocks a medicine
    // URI - PATCH /medicines/{medicineId}/stock | PHARMACIST only
    @PatchMapping("/{medicineId}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long medicineId, @Valid @RequestBody UpdateStockRequest request) {
        return ResponseEntity.ok(medicineService.updateStock(medicineId, request.getStock()));
    }
}
