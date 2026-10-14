package com.pharmaflow.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaflow.dto.request.CartItemRequest;
import com.pharmaflow.dto.request.UpdateCartQuantityRequest;
import com.pharmaflow.service.CartService;
import com.pharmaflow.util.SecurityUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@Validated
public class CartController {

    private final CartService cartService;

    // Desc - view own cart | CUSTOMER only
    // URI - GET /cart
    @GetMapping
    public ResponseEntity<?> getCart() {
        return ResponseEntity.ok(cartService.getCart(SecurityUtil.getCurrentUserId()));
    }

    // Desc - add a medicine to the cart (bumps quantity if it's already there) | CUSTOMER only
    // URI - POST /cart
    @PostMapping
    public ResponseEntity<?> addToCart(@Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cartService.addToCart(SecurityUtil.getCurrentUserId(), request));
    }

    // Desc - change the quantity of one cart line | CUSTOMER only
    // URI - PUT /cart/{cartItemId}
    @PutMapping("/{cartItemId}")
    public ResponseEntity<?> updateQuantity(@PathVariable Long cartItemId, @Valid @RequestBody UpdateCartQuantityRequest request) {
        return ResponseEntity.ok(cartService.updateQuantity(SecurityUtil.getCurrentUserId(), cartItemId, request));
    }

    // Desc - remove one item from the cart | CUSTOMER only
    // URI - DELETE /cart/{cartItemId}
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartItemId) {
        cartService.removeFromCart(SecurityUtil.getCurrentUserId(), cartItemId);
        return ResponseEntity.noContent().build();
    }
}
