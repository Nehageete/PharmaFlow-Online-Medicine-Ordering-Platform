package com.pharmaflow.config;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.pharmaflow.entities.Category;
import com.pharmaflow.entities.Medicine;
import com.pharmaflow.enums.Unit;
import com.pharmaflow.repository.CategoryRepository;
import com.pharmaflow.repository.MedicineRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            log.info("Seeding initial categories and medicines with custom images...");

            Category antibiotics = new Category();
            antibiotics.setCategoryName("Antibiotics");
            antibiotics.setImage("/images/cat-antibiotics.jpg");

            Category painRelief = new Category();
            painRelief.setCategoryName("Pain Relief");
            painRelief.setImage("/images/cat-painkillers.jpg");

            Category vitamins = new Category();
            vitamins.setCategoryName("Vitamins & Supplements");
            vitamins.setImage("/images/cat-vitamins.jpg");

            Category firstAid = new Category();
            firstAid.setCategoryName("First Aid");
            firstAid.setImage("/images/cat-firstaid.jpg");

            List<Category> savedCategories = categoryRepository.saveAll(List.of(antibiotics, painRelief, vitamins, firstAid));

            Category catAntibiotics = savedCategories.get(0);
            Category catPain = savedCategories.get(1);
            Category catVitamins = savedCategories.get(2);
            Category catFirstAid = savedCategories.get(3);

            Medicine m1 = new Medicine();
            m1.setName("Amoxicillin 500mg");
            m1.setBrand("Novartis");
            m1.setManufacturer("Novartis Pharma");
            m1.setDescription("Broad-spectrum antibiotic for bacterial infections.");
            m1.setPrice(new BigDecimal("14.99"));
            m1.setStock(150);
            m1.setUnit(Unit.STRIP);
            m1.setPrescriptionRequired(true);
            m1.setImage("/images/medicine-placeholder.jpg");
            m1.setCategory(catAntibiotics);

            Medicine m2 = new Medicine();
            m2.setName("Paracetamol Extra 650mg");
            m2.setBrand("GSK");
            m2.setManufacturer("GlaxoSmithKline");
            m2.setDescription("Fast relief from fever, headache, and body aches.");
            m2.setPrice(new BigDecimal("6.50"));
            m2.setStock(200);
            m2.setUnit(Unit.STRIP);
            m2.setPrescriptionRequired(false);
            m2.setImage("/images/medicine-placeholder.jpg");
            m2.setCategory(catPain);

            Medicine m3 = new Medicine();
            m3.setName("Multivitamin Daily Complex");
            m3.setBrand("Centrum");
            m3.setManufacturer("Pfizer Consumer");
            m3.setDescription("Essential daily vitamins and minerals for immune support.");
            m3.setPrice(new BigDecimal("22.00"));
            m3.setStock(80);
            m3.setUnit(Unit.BOTTLE);
            m3.setPrescriptionRequired(false);
            m3.setImage("/images/medicine-placeholder.jpg");
            m3.setCategory(catVitamins);

            Medicine m4 = new Medicine();
            m4.setName("Antiseptic Healing Cream 50g");
            m4.setBrand("Dettol");
            m4.setManufacturer("Reckitt Benckiser");
            m4.setDescription("First aid cream for minor cuts, burns, and wounds.");
            m4.setPrice(new BigDecimal("8.75"));
            m4.setStock(110);
            m4.setUnit(Unit.TUBE);
            m4.setPrescriptionRequired(false);
            m4.setImage("/images/medicine-placeholder.jpg");
            m4.setCategory(catFirstAid);

            medicineRepository.saveAll(List.of(m1, m2, m3, m4));
            log.info("Database seeding completed successfully!");
        }
    }
}
