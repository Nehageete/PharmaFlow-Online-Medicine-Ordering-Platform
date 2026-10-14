package com.pharmaflow.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WishlistItemResponse {

    private Long wishlistItemId;
    private Long medicineId;
    private String medicineName;
    private String medicineImage;
    private BigDecimal price;
}
