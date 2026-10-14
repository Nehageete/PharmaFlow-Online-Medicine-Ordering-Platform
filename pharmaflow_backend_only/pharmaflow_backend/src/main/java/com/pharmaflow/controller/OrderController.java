package com.pharmaflow.controller;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pharmaflow.dto.request.OrderStatusUpdateRequest;
import com.pharmaflow.dto.request.PlaceOrderRequest;
import com.pharmaflow.dto.response.PrescriptionFileResponse;
import com.pharmaflow.enums.OrderStatus;
import com.pharmaflow.service.OrderService;
import com.pharmaflow.util.SecurityUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Validated
public class OrderController {

    private final OrderService orderService;

    // Desc - checkout the cart. multipart/form-data: a JSON "request" part (shippingAddress,
    // paymentMethod) + an optional "prescriptionFile" part - the service decides whether the
    // file is actually mandatory, based on whether any cart medicine requires a prescription.
    // URI - POST /orders | CUSTOMER only
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> placeOrder(
            @Valid @RequestPart("request") PlaceOrderRequest request,
            @RequestPart(value = "prescriptionFile", required = false) MultipartFile prescriptionFile) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(SecurityUtil.getCurrentUserId(), request, prescriptionFile));
    }

    // Desc - Customer's order history ("My Orders") | any logged-in user (scoped to their own orders)
    // URI - GET /orders/my
    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders() {
        return ResponseEntity.ok(orderService.getOrderHistory(SecurityUtil.getCurrentUserId()));
    }

    // Desc - track a specific order - only the owning customer can see it (enforced in the service)
    // URI - GET /orders/{orderId}
    @GetMapping("/{orderId}")
    public ResponseEntity<?> trackOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.trackOrder(SecurityUtil.getCurrentUserId(), orderId));
    }

    // Desc - Pharmacist's review queue, e.g. GET /orders/status/PLACED for orders awaiting prescription review
    // URI - GET /orders/status/{status} | PHARMACIST or ADMIN only
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    // Desc - Pharmacist moves an order forward. Same endpoint covers prescription approve/reject
    // (status=CONFIRMED to approve, status=CANCELLED to reject) as well as PACKED / OUT_FOR_DELIVERY / DELIVERED.
    // URI - PATCH /orders/{orderId}/status | PHARMACIST only
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request));
    }

    // Desc - stream the prescription file uploaded at checkout, so it can be previewed
    // (image) or downloaded (PDF). Ownership/role check happens in the service layer:
    // PHARMACIST/ADMIN can view any order's prescription, a CUSTOMER only their own.
    // URI - GET /orders/{orderId}/prescription | any logged-in user (scoped in service)
    @GetMapping("/{orderId}/prescription")
    public ResponseEntity<?> getPrescription(@PathVariable Long orderId) {
        PrescriptionFileResponse file = orderService.getPrescriptionFile(SecurityUtil.getCurrentUserId(), orderId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(file.filename() != null ? file.filename() : "prescription").build().toString())
                .body(file.resource());
    }
}
