package com.pharmaflow.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmaflow.dto.request.CategoryRequest;
import com.pharmaflow.dto.response.CategoryResponse;
import com.pharmaflow.entities.Category;
import com.pharmaflow.exception.DuplicateResourceException;
import com.pharmaflow.exception.InvalidOperationException;
import com.pharmaflow.exception.ResourceNotFoundException;
import com.pharmaflow.repository.CategoryRepository;
import com.pharmaflow.repository.MedicineRepository;
import com.pharmaflow.service.CategoryService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new DuplicateResourceException("A category with this name already exists");
        }
        Category category = new Category();
        category.setCategoryName(request.getCategoryName());
        category.setImage(request.getImage());

        return toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse updateCategory(Long categoryId, CategoryRequest request) {
        Category category = findCategoryOrThrow(categoryId);

        // only re-check the unique name constraint if the name is actually changing
        if (!category.getCategoryName().equalsIgnoreCase(request.getCategoryName())
                && categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new DuplicateResourceException("A category with this name already exists");
        }

        category.setCategoryName(request.getCategoryName());
        category.setImage(request.getImage());
        return toResponse(category);
    }

    @Override
    public void deleteCategory(Long categoryId) {
        Category category = findCategoryOrThrow(categoryId);
        if (!medicineRepository.findByCategory_CategoryId(categoryId).isEmpty()) {
            throw new InvalidOperationException("Cannot delete a category that still has medicines under it");
        }
        categoryRepository.delete(category);
    }

    @Override
    public CategoryResponse getCategoryById(Long categoryId) {
        return toResponse(findCategoryOrThrow(categoryId));
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private Category findCategoryOrThrow(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setCategoryId(category.getCategoryId());
        response.setCategoryName(category.getCategoryName());
        response.setImage(category.getImage());
        return response;
    }
}
