package com.pharmaflow.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaflow.service.WishlistService;
import com.pharmaflow.util.SecurityUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // Desc - view own wishlist | CUSTOMER only
    // URI - GET /wishlist
    @GetMapping
    public ResponseEntity<?> getWishlist() {
        return ResponseEntity.ok(wishlistService.getWishlist(SecurityUtil.getCurrentUserId()));
    }

    // Desc - add a medicine to the wishlist | CUSTOMER only
    // URI - POST /wishlist/{medicineId}
    @PostMapping("/{medicineId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long medicineId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(wishlistService.addToWishlist(SecurityUtil.getCurrentUserId(), medicineId));
    }

    // Desc - remove a medicine from the wishlist | CUSTOMER only
    // URI - DELETE /wishlist/{medicineId}
    @DeleteMapping("/{medicineId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long medicineId) {
        wishlistService.removeFromWishlist(SecurityUtil.getCurrentUserId(), medicineId);
        return ResponseEntity.noContent().build();
    }
}
