package com.pharmaflow.service;

import java.util.List;

import com.pharmaflow.dto.request.CategoryRequest;
import com.pharmaflow.dto.response.CategoryResponse;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long categoryId, CategoryRequest request);

    void deleteCategory(Long categoryId);

    CategoryResponse getCategoryById(Long categoryId);

    List<CategoryResponse> getAllCategories();
}
