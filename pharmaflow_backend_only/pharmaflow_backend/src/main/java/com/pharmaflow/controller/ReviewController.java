package com.pharmaflow.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaflow.dto.request.ReviewRequest;
import com.pharmaflow.service.ReviewService;
import com.pharmaflow.util.SecurityUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Validated
public class ReviewController {

    private final ReviewService reviewService;

    // Desc - reviews shown on a medicine's detail page (public)
    // URI - GET /reviews/medicine/{medicineId}
    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<?> getReviewsForMedicine(@PathVariable Long medicineId) {
        return ResponseEntity.ok(reviewService.getReviewsForMedicine(medicineId));
    }

    // Desc - Customer reviews a medicine (once per medicine) | CUSTOMER only
    // URI - POST /reviews
    @PostMapping
    public ResponseEntity<?> addReview(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.addReview(SecurityUtil.getCurrentUserId(), request));
    }
}
