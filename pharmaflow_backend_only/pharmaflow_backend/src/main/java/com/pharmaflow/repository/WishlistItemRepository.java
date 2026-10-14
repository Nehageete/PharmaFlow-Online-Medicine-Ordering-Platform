package com.pharmaflow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pharmaflow.entities.WishlistItem;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    // used to fetch the logged-in customer's full wishlist
    List<WishlistItem> findByUser_UserId(Long userId);

    // used to prevent adding the same medicine twice (mirrors the DB unique constraint on user_id + medicine_id)
    boolean existsByUser_UserIdAndMedicine_MedicineId(Long userId, Long medicineId);

    // used when the customer removes an item from the wishlist
    void deleteByUser_UserIdAndMedicine_MedicineId(Long userId, Long medicineId);
}
