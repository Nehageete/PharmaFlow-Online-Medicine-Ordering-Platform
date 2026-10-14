package com.pharmaflow.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmaflow.dto.request.CartItemRequest;
import com.pharmaflow.dto.request.UpdateCartQuantityRequest;
import com.pharmaflow.dto.response.CartItemResponse;
import com.pharmaflow.entities.CartItem;
import com.pharmaflow.entities.Medicine;
import com.pharmaflow.entities.User;
import com.pharmaflow.exception.InvalidOperationException;
import com.pharmaflow.exception.ResourceNotFoundException;
import com.pharmaflow.repository.CartItemRepository;
import com.pharmaflow.repository.MedicineRepository;
import com.pharmaflow.repository.UserRepository;
import com.pharmaflow.service.CartService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    @Override
    public CartItemResponse addToCart(Long userId, CartItemRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + request.getMedicineId()));

        if (medicine.getStock() < request.getQuantity()) {
            throw new InvalidOperationException("Only " + medicine.getStock() + " units of " + medicine.getName() + " are in stock");
        }

        // if this medicine is already in the cart, bump the quantity instead of creating a duplicate row
        CartItem cartItem = cartItemRepository
                .findByUser_UserIdAndMedicine_MedicineId(userId, request.getMedicineId())
                .orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            User user = userRepository.getReferenceById(userId); // proxy - no extra SELECT, user is already authenticated
            cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setMedicine(medicine);
            cartItem.setQuantity(request.getQuantity());
            cartItem = cartItemRepository.save(cartItem);
        }

        return toResponse(cartItem);
    }

    @Override
    public List<CartItemResponse> getCart(Long userId) {
        return cartItemRepository.findByUser_UserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CartItemResponse updateQuantity(Long userId, Long cartItemId, UpdateCartQuantityRequest request) {
        CartItem cartItem = findOwnedCartItemOrThrow(userId, cartItemId);

        if (cartItem.getMedicine().getStock() < request.getQuantity()) {
            throw new InvalidOperationException("Only " + cartItem.getMedicine().getStock() + " units are in stock");
        }

        cartItem.setQuantity(request.getQuantity());
        return toResponse(cartItem);
    }

    @Override
    public void removeFromCart(Long userId, Long cartItemId) {
        CartItem cartItem = findOwnedCartItemOrThrow(userId, cartItemId);
        cartItemRepository.delete(cartItem);
    }

    @Override
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUser_UserId(userId);
    }

    private CartItem findOwnedCartItemOrThrow(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        // make sure a customer can't edit/remove another customer's cart item
        if (!cartItem.getUser().getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Cart item not found with id: " + cartItemId);
        }
        return cartItem;
    }

    private CartItemResponse toResponse(CartItem cartItem) {
        CartItemResponse response = new CartItemResponse();
        response.setCartItemId(cartItem.getCartItemId());
        response.setMedicineId(cartItem.getMedicine().getMedicineId());
        response.setMedicineName(cartItem.getMedicine().getName());
        response.setMedicineImage(cartItem.getMedicine().getImage());
        response.setPrice(cartItem.getMedicine().getPrice());
        response.setQuantity(cartItem.getQuantity());
        response.setSubtotal(cartItem.getMedicine().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        response.setPrescriptionRequired(cartItem.getMedicine().isPrescriptionRequired());
        response.setStock(cartItem.getMedicine().getStock());
        return response;
    }
}
