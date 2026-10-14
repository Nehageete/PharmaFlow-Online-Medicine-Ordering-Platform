package com.pharmaflow.service;

import com.pharmaflow.dto.response.ReportsSummaryResponse;

public interface ReportsService {

    // Admin's "Reports" screen - revenue, order status breakdown, low-stock alerts, best sellers
    ReportsSummaryResponse getSummary();
}
