package com.pharmaflow.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pharmaflow.dto.request.CategoryRequest;
import com.pharmaflow.dto.response.CategoryResponse;
import com.pharmaflow.entities.Category;
import com.pharmaflow.exception.DuplicateResourceException;
import com.pharmaflow.exception.InvalidOperationException;
import com.pharmaflow.exception.ResourceNotFoundException;
import com.pharmaflow.repository.CategoryRepository;
import com.pharmaflow.repository.MedicineRepository;
import com.pharmaflow.service.impl.CategoryServiceImpl;

// Pure unit test - repositories are mocked, so this runs in milliseconds with no Spring context and no DB at all.
// Good for exercising business-rule branches (duplicate checks, not-found paths) in isolation.
@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Test
    void testCreateCategory_whenNameAlreadyExists_throwsDuplicateResourceException() {
        CategoryRequest request = new CategoryRequest();
        request.setCategoryName("Painkillers");

        when(categoryRepository.existsByCategoryName("Painkillers")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> categoryService.createCategory(request));
    }

    @Test
    void testCreateCategory_whenNameIsNew_savesAndReturnsResponse() {
        CategoryRequest request = new CategoryRequest();
        request.setCategoryName("Vitamins");
        request.setImage("vitamins.png");

        Category saved = new Category();
        saved.setCategoryId(1L);
        saved.setCategoryName("Vitamins");
        saved.setImage("vitamins.png");

        when(categoryRepository.existsByCategoryName("Vitamins")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(saved);

        CategoryResponse response = categoryService.createCategory(request);

        assertEquals(1L, response.getCategoryId());
        assertEquals("Vitamins", response.getCategoryName());
    }

    @Test
    void testGetCategoryById_whenNotFound_throwsResourceNotFoundException() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.getCategoryById(99L));
    }

    @Test
    void testDeleteCategory_whenMedicinesStillReferenceIt_throwsInvalidOperationException() {
        Category category = new Category();
        category.setCategoryId(5L);
        category.setCategoryName("Antibiotics");

        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));
        when(medicineRepository.findByCategory_CategoryId(5L))
                .thenReturn(List.of(new com.pharmaflow.entities.Medicine()));

        assertThrows(InvalidOperationException.class, () -> categoryService.deleteCategory(5L));
    }
}
