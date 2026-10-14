package com.pharmaflow.repository;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.pharmaflow.entities.User;
import com.pharmaflow.enums.Role;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindByEmail_whenUserSaved_returnsUser() {
        User user = new User();
        user.setFirstName("Asha");
        user.setLastName("Patil");
        user.setEmail("asha.patil@example.com");
        user.setPassword("encodedPassword123");
        user.setRole(Role.CUSTOMER);
        userRepository.save(user);

        User found = userRepository.findByEmail("asha.patil@example.com").orElseThrow();
        assertTrue(found.getFirstName().equals("Asha"));
    }

    @Test
    void testExistsByEmail_whenNotSaved_returnsFalse() {
        assertFalse(userRepository.existsByEmail("nobody@example.com"));
    }
}
