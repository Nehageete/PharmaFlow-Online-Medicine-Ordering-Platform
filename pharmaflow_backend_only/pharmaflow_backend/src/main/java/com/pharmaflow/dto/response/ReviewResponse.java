package com.pharmaflow.dto.response;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewResponse {

    private Long reviewId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime reviewDate;
}
