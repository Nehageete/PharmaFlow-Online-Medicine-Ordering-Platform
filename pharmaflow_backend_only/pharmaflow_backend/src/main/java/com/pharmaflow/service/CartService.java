package com.pharmaflow.service;

import java.util.List;

import com.pharmaflow.dto.request.CartItemRequest;
import com.pharmaflow.dto.request.UpdateCartQuantityRequest;
import com.pharmaflow.dto.response.CartItemResponse;

public interface CartService {

    CartItemResponse addToCart(Long userId, CartItemRequest request);

    List<CartItemResponse> getCart(Long userId);

    CartItemResponse updateQuantity(Long userId, Long cartItemId, UpdateCartQuantityRequest request);

    void removeFromCart(Long userId, Long cartItemId);

    void clearCart(Long userId);
}
