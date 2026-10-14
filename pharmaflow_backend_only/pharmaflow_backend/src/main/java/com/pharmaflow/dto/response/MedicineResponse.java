package com.pharmaflow.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.pharmaflow.enums.Unit;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicineResponse {

    private Long medicineId;
    private String name;
    private String brand;
    private String manufacturer;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Unit unit;
    private LocalDate expiryDate;
    private String image;
    private boolean prescriptionRequired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long categoryId;
    private String categoryName;
}
