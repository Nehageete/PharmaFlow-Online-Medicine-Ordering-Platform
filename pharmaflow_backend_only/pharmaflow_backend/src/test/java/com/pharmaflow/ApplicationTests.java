package com.pharmaflow;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Sanity check - does the whole Spring context (all beans: repos, services, security, controllers) wire up correctly?
// This alone catches a lot of silly mistakes (missing bean, circular dependency, bad @Value property) before you even write a feature test.
@SpringBootTest
class ApplicationTests {

    @Test
    void contextLoads() {
    }
}
