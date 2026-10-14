package com.pharmaflow.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pharmaflow.entities.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // used by Admin module while creating a category, to prevent duplicate category names
    boolean existsByCategoryName(String categoryName);

    // used to fetch a category by its name (e.g. for filter-by-category-name lookups)
    Optional<Category> findByCategoryName(String categoryName);
}
