package com.pharmaflow.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmaflow.dto.request.ReviewRequest;
import com.pharmaflow.dto.response.ReviewResponse;
import com.pharmaflow.entities.Medicine;
import com.pharmaflow.entities.Review;
import com.pharmaflow.entities.User;
import com.pharmaflow.exception.DuplicateResourceException;
import com.pharmaflow.exception.ResourceNotFoundException;
import com.pharmaflow.repository.MedicineRepository;
import com.pharmaflow.repository.ReviewRepository;
import com.pharmaflow.repository.UserRepository;
import com.pharmaflow.service.ReviewService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse addReview(Long userId, ReviewRequest request) {
        if (reviewRepository.existsByUser_UserIdAndMedicine_MedicineId(userId, request.getMedicineId())) {
            throw new DuplicateResourceException("You have already reviewed this medicine");
        }

        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + request.getMedicineId()));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Review review = new Review();
        review.setUser(user);
        review.setMedicine(medicine);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return toResponse(reviewRepository.save(review));
    }

    @Override
    public List<ReviewResponse> getReviewsForMedicine(Long medicineId) {
        return reviewRepository.findByMedicine_MedicineId(medicineId).stream()
                .map(this::toResponse)
                .toList();
    }

    private ReviewResponse toResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setReviewId(review.getReviewId());
        response.setUserId(review.getUser().getUserId());
        response.setUserName(review.getUser().getFirstName() + " " + review.getUser().getLastName());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setReviewDate(review.getReviewDate());
        return response;
    }
}
