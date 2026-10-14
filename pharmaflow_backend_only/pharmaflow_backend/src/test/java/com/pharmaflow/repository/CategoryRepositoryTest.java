package com.pharmaflow.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.pharmaflow.entities.Category;

// DAO layer test - @DataJpaTest scans only the Repository + Entity layer and runs against
// an in-memory H2 DB (auto-replaces the MySQL datasource for tests, see pom.xml).
// Each test method runs in its own transaction that's rolled back afterwards, so tests never interfere with each other.
@DataJpaTest
class CategoryRepositoryTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void testExistsByCategoryName_whenCategorySaved_returnsTrue() {
        Category category = new Category();
        category.setCategoryName("Pain Relief");
        categoryRepository.save(category);

        assertTrue(categoryRepository.existsByCategoryName("Pain Relief"));
    }

    @Test
    void testExistsByCategoryName_whenNotSaved_returnsFalse() {
        assertFalse(categoryRepository.existsByCategoryName("Nonexistent Category"));
    }

    @Test
    void testFindByCategoryName_returnsSavedCategory() {
        Category category = new Category();
        category.setCategoryName("Antibiotics");
        category.setImage("antibiotics.png");
        categoryRepository.save(category);

        Category found = categoryRepository.findByCategoryName("Antibiotics").orElseThrow();
        assertEquals("antibiotics.png", found.getImage());
    }
}
