package com.pharmaflow.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmaflow.dto.response.WishlistItemResponse;
import com.pharmaflow.entities.Medicine;
import com.pharmaflow.entities.User;
import com.pharmaflow.entities.WishlistItem;
import com.pharmaflow.exception.DuplicateResourceException;
import com.pharmaflow.exception.ResourceNotFoundException;
import com.pharmaflow.repository.MedicineRepository;
import com.pharmaflow.repository.UserRepository;
import com.pharmaflow.repository.WishlistItemRepository;
import com.pharmaflow.service.WishlistService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    @Override
    public WishlistItemResponse addToWishlist(Long userId, Long medicineId) {
        if (wishlistItemRepository.existsByUser_UserIdAndMedicine_MedicineId(userId, medicineId)) {
            throw new DuplicateResourceException("This medicine is already in your wishlist");
        }

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));
        User user = userRepository.getReferenceById(userId);

        WishlistItem wishlistItem = new WishlistItem();
        wishlistItem.setUser(user);
        wishlistItem.setMedicine(medicine);

        return toResponse(wishlistItemRepository.save(wishlistItem));
    }

    @Override
    public List<WishlistItemResponse> getWishlist(Long userId) {
        return wishlistItemRepository.findByUser_UserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void removeFromWishlist(Long userId, Long medicineId) {
        wishlistItemRepository.deleteByUser_UserIdAndMedicine_MedicineId(userId, medicineId);
    }

    private WishlistItemResponse toResponse(WishlistItem wishlistItem) {
        WishlistItemResponse response = new WishlistItemResponse();
        response.setWishlistItemId(wishlistItem.getWishlistItemId());
        response.setMedicineId(wishlistItem.getMedicine().getMedicineId());
        response.setMedicineName(wishlistItem.getMedicine().getName());
        response.setMedicineImage(wishlistItem.getMedicine().getImage());
        response.setPrice(wishlistItem.getMedicine().getPrice());
        return response;
    }
}
