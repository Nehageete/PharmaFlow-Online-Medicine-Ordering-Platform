package com.pharmaflow.service;

import java.util.List;

import com.pharmaflow.dto.request.ReviewRequest;
import com.pharmaflow.dto.response.ReviewResponse;

public interface ReviewService {

    ReviewResponse addReview(Long userId, ReviewRequest request);

    List<ReviewResponse> getReviewsForMedicine(Long medicineId);
}
