package com.pharmaflow.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.pharmaflow.enums.Unit;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicineRequest {

    @NotBlank(message = "Medicine name is required")
    @Size(max = 150, message = "Medicine name cannot exceed 150 characters")
    private String name;

    @NotBlank(message = "Brand is required")
    @Size(max = 100, message = "Brand cannot exceed 100 characters")
    private String brand;

    @NotBlank(message = "Manufacturer is required")
    @Size(max = 100, message = "Manufacturer cannot exceed 100 characters")
    private String manufacturer;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;

    @NotNull(message = "Unit is required")
    private Unit unit;

    private LocalDate expiryDate;

    @Size(max = 255, message = "Image path cannot exceed 255 characters")
    private String image;

    private boolean prescriptionRequired;

    @NotNull(message = "Category is required")
    private Long categoryId;
}
