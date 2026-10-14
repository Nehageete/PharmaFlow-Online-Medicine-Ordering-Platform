package com.pharmaflow.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.pharmaflow.dto.request.PlaceOrderRequest;
import com.pharmaflow.entities.CartItem;
import com.pharmaflow.entities.Medicine;
import com.pharmaflow.enums.PaymentMethod;
import com.pharmaflow.exception.InvalidOperationException;
import com.pharmaflow.repository.CartItemRepository;
import com.pharmaflow.repository.OrderRepository;
import com.pharmaflow.repository.UserRepository;
import com.pharmaflow.service.impl.OrderServiceImpl;
import com.pharmaflow.util.FileStorageUtil;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageUtil fileStorageUtil;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void testPlaceOrder_whenCartIsEmpty_throwsInvalidOperationException() {
        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setShippingAddress("221B Baker Street");
        request.setPaymentMethod(PaymentMethod.COD);

        when(cartItemRepository.findByUser_UserId(1L)).thenReturn(List.of());

        assertThrows(InvalidOperationException.class, () -> orderService.placeOrder(1L, request, null));
    }

    @Test
    void testPlaceOrder_whenStockInsufficientForCartItem_throwsInvalidOperationException() {
        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setShippingAddress("221B Baker Street");
        request.setPaymentMethod(PaymentMethod.COD);

        Medicine medicine = new Medicine();
        medicine.setMedicineId(1L);
        medicine.setName("Cough Syrup");
        medicine.setPrice(new BigDecimal("50.00"));
        medicine.setStock(1);
        medicine.setPrescriptionRequired(false);

        CartItem cartItem = new CartItem();
        cartItem.setMedicine(medicine);
        cartItem.setQuantity(5); // more than the 1 unit in stock

        when(cartItemRepository.findByUser_UserId(1L)).thenReturn(List.of(cartItem));

        assertThrows(InvalidOperationException.class, () -> orderService.placeOrder(1L, request, null));
    }

    @Test
    void testPlaceOrder_whenPrescriptionRequiredButNoFileProvided_throwsInvalidOperationException() {
        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setShippingAddress("221B Baker Street");
        request.setPaymentMethod(PaymentMethod.COD);

        Medicine medicine = new Medicine();
        medicine.setMedicineId(2L);
        medicine.setName("Amoxicillin");
        medicine.setPrice(new BigDecimal("120.00"));
        medicine.setStock(20);
        medicine.setPrescriptionRequired(true); // this is the key condition being tested

        CartItem cartItem = new CartItem();
        cartItem.setMedicine(medicine);
        cartItem.setQuantity(1);

        when(cartItemRepository.findByUser_UserId(1L)).thenReturn(List.of(cartItem));
        // FileStorageUtil itself rejects a null/empty file - the service must call it when prescriptionNeeded is true
        when(fileStorageUtil.storePrescriptionFile(null))
                .thenThrow(new InvalidOperationException("Prescription file is required for this order"));

        assertThrows(InvalidOperationException.class, () -> orderService.placeOrder(1L, request, null));
    }

    @Test
    void testPlaceOrder_whenPrescriptionNotRequired_neverCallsFileStorage() {
        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setShippingAddress("221B Baker Street");
        request.setPaymentMethod(PaymentMethod.COD);

        Medicine medicine = new Medicine();
        medicine.setMedicineId(3L);
        medicine.setName("Vitamin C");
        medicine.setPrice(new BigDecimal("30.00"));
        medicine.setStock(20);
        medicine.setPrescriptionRequired(false);

        CartItem cartItem = new CartItem();
        cartItem.setMedicine(medicine);
        cartItem.setQuantity(2);

        when(cartItemRepository.findByUser_UserId(1L)).thenReturn(List.of(cartItem));
        when(userRepository.getReferenceById(1L)).thenReturn(new com.pharmaflow.entities.User());
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        orderService.placeOrder(1L, request, new MockMultipartFile("file", new byte[0]));

        org.mockito.Mockito.verifyNoInteractions(fileStorageUtil);
    }
}
