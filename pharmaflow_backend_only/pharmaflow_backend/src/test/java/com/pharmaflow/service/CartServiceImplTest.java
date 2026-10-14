package com.pharmaflow.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pharmaflow.dto.request.CartItemRequest;
import com.pharmaflow.dto.response.CartItemResponse;
import com.pharmaflow.entities.CartItem;
import com.pharmaflow.entities.Medicine;
import com.pharmaflow.exception.InvalidOperationException;
import com.pharmaflow.exception.ResourceNotFoundException;
import com.pharmaflow.repository.CartItemRepository;
import com.pharmaflow.repository.MedicineRepository;
import com.pharmaflow.repository.UserRepository;
import com.pharmaflow.service.impl.CartServiceImpl;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartServiceImpl cartService;

    @Test
    void testAddToCart_whenMedicineNotFound_throwsResourceNotFoundException() {
        CartItemRequest request = new CartItemRequest();
        request.setMedicineId(1L);
        request.setQuantity(2);

        when(medicineRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cartService.addToCart(100L, request));
    }

    @Test
    void testAddToCart_whenRequestedQuantityExceedsStock_throwsInvalidOperationException() {
        CartItemRequest request = new CartItemRequest();
        request.setMedicineId(1L);
        request.setQuantity(10);

        Medicine medicine = new Medicine();
        medicine.setMedicineId(1L);
        medicine.setName("Paracetamol");
        medicine.setStock(3); // less than the requested quantity

        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));

        InvalidOperationException exception = assertThrows(InvalidOperationException.class,
                () -> cartService.addToCart(100L, request));
        assertEquals(true, exception.getMessage().contains("Only 3 units"));

        // stock check must fail BEFORE anything is persisted
        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    @Test
    void testAddToCart_whenSameMedicineAlreadyInCart_bumpsQuantityInsteadOfDuplicating() {
        CartItemRequest request = new CartItemRequest();
        request.setMedicineId(1L);
        request.setQuantity(2);

        Medicine medicine = new Medicine();
        medicine.setMedicineId(1L);
        medicine.setName("Paracetamol");
        medicine.setPrice(new BigDecimal("20.00"));
        medicine.setStock(50);

        CartItem existingItem = new CartItem();
        existingItem.setCartItemId(7L);
        existingItem.setMedicine(medicine);
        existingItem.setQuantity(1);

        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(cartItemRepository.findByUser_UserIdAndMedicine_MedicineId(100L, 1L))
                .thenReturn(Optional.of(existingItem));

        CartItemResponse response = cartService.addToCart(100L, request);

        assertEquals(3, response.getQuantity()); // 1 (existing) + 2 (new request)
        // an existing row was updated - a brand new CartItem should never have been saved
        verify(cartItemRepository, never()).save(any(CartItem.class));
    }
}
