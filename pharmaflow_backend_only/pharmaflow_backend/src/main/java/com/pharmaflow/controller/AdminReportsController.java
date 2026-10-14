package com.pharmaflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmaflow.service.ReportsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
public class AdminReportsController {

    private final ReportsService reportsService;

    // Desc - revenue, order-status breakdown, low-stock alerts, top sellers (Admin "Reports" screen)
    // URI - GET /admin/reports/summary | ADMIN only (covered by the "/admin/**" security rule)
    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(reportsService.getSummary());
    }
}
