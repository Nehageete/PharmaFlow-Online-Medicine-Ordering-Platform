package com.pharmaflow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pharmaflow.entities.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // used to list all reviews shown on a medicine's detail page
    List<Review> findByMedicine_MedicineId(Long medicineId);

    // used to enforce "one review per customer per medicine" at the service layer (mirrors the DB unique constraint)
    boolean existsByUser_UserIdAndMedicine_MedicineId(Long userId, Long medicineId);
}
