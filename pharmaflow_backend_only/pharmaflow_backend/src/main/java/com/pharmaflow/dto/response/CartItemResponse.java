package com.pharmaflow.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemResponse {

    private Long cartItemId;
    private Long medicineId;
    private String medicineName;
    private String medicineImage;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
    private boolean prescriptionRequired;
    private Integer stock;
}
