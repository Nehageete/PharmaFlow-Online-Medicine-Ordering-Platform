package com.pharmaflow.dto.request;

import com.pharmaflow.enums.PaymentMethod;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaceOrderRequest {

    @NotBlank(message = "Shipping address is required")
    @Size(max = 255, message = "Shipping address cannot exceed 255 characters")
    private String shippingAddress;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    // Note: the prescription image itself is NOT part of this DTO.
    // Checkout is a multipart/form-data request - the controller will accept this DTO
    // as a JSON part alongside a separate MultipartFile part for the prescription image.
    // Keeping the file out of the JSON DTO avoids mixing binary data with validated fields.
}
