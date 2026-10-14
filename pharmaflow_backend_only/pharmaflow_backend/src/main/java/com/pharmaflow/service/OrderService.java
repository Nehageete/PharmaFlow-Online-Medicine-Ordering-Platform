package com.pharmaflow.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.pharmaflow.dto.request.OrderStatusUpdateRequest;
import com.pharmaflow.dto.request.PlaceOrderRequest;
import com.pharmaflow.dto.response.OrderResponse;
import com.pharmaflow.dto.response.PrescriptionFileResponse;
import com.pharmaflow.enums.OrderStatus;

public interface OrderService {

    // prescriptionFile is optional here - the service checks whether it's actually required
    // (i.e. at least one cart medicine has prescriptionRequired = true) before enforcing it
    OrderResponse placeOrder(Long userId, PlaceOrderRequest request, MultipartFile prescriptionFile);

    List<OrderResponse> getOrderHistory(Long userId);

    OrderResponse trackOrder(Long userId, Long orderId);

    // Pharmacist queue - e.g. all PLACED orders awaiting prescription review
    List<OrderResponse> getOrdersByStatus(OrderStatus status);

    // Pharmacist - covers status transitions AND prescription approve/reject
    // (approve -> CONFIRMED, reject -> CANCELLED, plus PACKED / OUT_FOR_DELIVERY / DELIVERED)
    OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request);

    // Streams the uploaded prescription file for an order. Allowed for PHARMACIST/ADMIN
    // (review queue) or the CUSTOMER who owns the order (ownership checked here, not just
    // via a URL rule, since one endpoint must serve both "my own" and "any as staff").
    PrescriptionFileResponse getPrescriptionFile(Long requestingUserId, Long orderId);
}
