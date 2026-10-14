package com.pharmaflow.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;

import com.pharmaflow.dto.request.OrderStatusUpdateRequest;
import com.pharmaflow.dto.request.PlaceOrderRequest;
import com.pharmaflow.dto.response.OrderItemResponse;
import com.pharmaflow.dto.response.OrderResponse;
import com.pharmaflow.dto.response.PaymentResponse;
import com.pharmaflow.dto.response.PrescriptionFileResponse;
import com.pharmaflow.entities.CartItem;
import com.pharmaflow.entities.Medicine;
import com.pharmaflow.entities.Order;
import com.pharmaflow.entities.OrderItem;
import com.pharmaflow.entities.Payment;
import com.pharmaflow.entities.User;
import com.pharmaflow.enums.OrderStatus;
import com.pharmaflow.enums.PaymentStatus;
import com.pharmaflow.exception.InvalidOperationException;
import com.pharmaflow.exception.ResourceNotFoundException;
import com.pharmaflow.repository.CartItemRepository;
import com.pharmaflow.repository.OrderRepository;
import com.pharmaflow.repository.UserRepository;
import com.pharmaflow.service.OrderService;
import com.pharmaflow.util.FileStorageUtil;
import com.pharmaflow.util.SecurityUtil;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final FileStorageUtil fileStorageUtil;

    @Override
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request, MultipartFile prescriptionFile) {
        List<CartItem> cartItems = cartItemRepository.findByUser_UserId(userId);
        if (cartItems.isEmpty()) {
            throw new InvalidOperationException("Your cart is empty");
        }

        // 1. validate stock for every item before touching anything
        for (CartItem cartItem : cartItems) {
            Medicine medicine = cartItem.getMedicine();
            if (medicine.getStock() < cartItem.getQuantity()) {
                throw new InvalidOperationException("Only " + medicine.getStock() + " units of " + medicine.getName() + " are in stock");
            }
        }

        // 2. if ANY medicine in the cart requires a prescription, the upload is mandatory
        boolean prescriptionNeeded = cartItems.stream().anyMatch(ci -> ci.getMedicine().isPrescriptionRequired());
        String prescriptionPath = null;
        if (prescriptionNeeded) {
            prescriptionPath = fileStorageUtil.storePrescriptionFile(prescriptionFile);
        }

        // 3. build the Order + its OrderItems, snapshotting price at the time of order
        // (so a later price change on the Medicine doesn't rewrite past invoices)
        User user = userRepository.getReferenceById(userId);

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PLACED);
        order.setShippingAddress(request.getShippingAddress());
        order.setPrescriptionPath(prescriptionPath);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Medicine medicine = cartItem.getMedicine();

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMedicine(medicine);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(medicine.getPrice());
            orderItems.add(orderItem);

            totalAmount = totalAmount.add(medicine.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));

            // deduct stock immediately - reserved the moment the order is placed
            medicine.setStock(medicine.getStock() - cartItem.getQuantity());
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        // 4. build the Payment record (no gateway integration yet - COD/ONLINE both start PENDING,
        // ready for a Razorpay webhook to flip ONLINE payments to SUCCESS later)
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(totalAmount);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.PENDING);
        order.setPayment(payment);

        // Order's cascade (PERSIST, MERGE) on orderItems and payment saves everything in one call
        Order savedOrder = orderRepository.save(order);

        // 5. checkout succeeded - empty the cart
        cartItemRepository.deleteByUser_UserId(userId);

        return toResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getOrderHistory(Long userId) {
        return orderRepository.findByUser_UserId(userId).stream()
                .sorted(Comparator.comparing(Order::getOrderDate).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Override
    public OrderResponse trackOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByOrderIdAndUser_UserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return toResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus currentStatus = order.getStatus();
        if (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.CANCELLED) {
            throw new InvalidOperationException("Order is already " + currentStatus + " and cannot be updated further");
        }

        // rejecting an order (moving it to CANCELLED) releases the stock that was reserved at checkout
        if (request.getStatus() == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getOrderItems()) {
                Medicine medicine = item.getMedicine();
                medicine.setStock(medicine.getStock() + item.getQuantity());
            }
        }

        order.setStatus(request.getStatus());
        return toResponse(order);
    }

    @Override
    public PrescriptionFileResponse getPrescriptionFile(Long requestingUserId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        boolean isOwner = order.getUser().getUserId().equals(requestingUserId);
        boolean isStaff = SecurityUtil.hasAnyRole("PHARMACIST", "ADMIN");
        if (!isOwner && !isStaff) {
            throw new AccessDeniedException("You are not authorized to view this prescription");
        }

        if (order.getPrescriptionPath() == null) {
            throw new ResourceNotFoundException("No prescription was uploaded for this order");
        }

        Resource resource = fileStorageUtil.loadFileAsResource(order.getPrescriptionPath());
        String contentType = fileStorageUtil.probeContentType(resource);
        return new PrescriptionFileResponse(resource, contentType, resource.getFilename());
    }

    private OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setPrescriptionPath(order.getPrescriptionPath());
        response.setShippingAddress(order.getShippingAddress());

        response.setOrderItems(order.getOrderItems().stream()
                .map(this::toItemResponse)
                .toList());

        if (order.getPayment() != null) {
            response.setPayment(toPaymentResponse(order.getPayment()));
        }
        return response;
    }

    private OrderItemResponse toItemResponse(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setOrderItemId(orderItem.getOrderItemId());
        response.setMedicineId(orderItem.getMedicine().getMedicineId());
        response.setMedicineName(orderItem.getMedicine().getName());
        response.setQuantity(orderItem.getQuantity());
        response.setPrice(orderItem.getPrice());
        return response;
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(payment.getPaymentId());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentDate(payment.getPaymentDate());
        response.setGatewayName(payment.getGatewayName());
        return response;
    }
}
