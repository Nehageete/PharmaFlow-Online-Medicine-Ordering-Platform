package com.pharmaflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pharmaflow.entities.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // used to fetch the logged-in customer's full cart
    List<CartItem> findByUser_UserId(Long userId);

    // used to check whether a medicine is already in the customer's cart, so we bump quantity instead of duplicating a row
    Optional<CartItem> findByUser_UserIdAndMedicine_MedicineId(Long userId, Long medicineId);

    // used to empty the cart right after a successful checkout
    void deleteByUser_UserId(Long userId);
}
