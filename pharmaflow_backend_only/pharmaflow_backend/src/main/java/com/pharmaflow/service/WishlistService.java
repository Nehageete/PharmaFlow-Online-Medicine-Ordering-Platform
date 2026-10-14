package com.pharmaflow.service;

import java.util.List;

import com.pharmaflow.dto.response.WishlistItemResponse;

public interface WishlistService {

    WishlistItemResponse addToWishlist(Long userId, Long medicineId);

    List<WishlistItemResponse> getWishlist(Long userId);

    void removeFromWishlist(Long userId, Long medicineId);
}
