package com.isla.kiosk.controller;

import com.isla.kiosk.service.OrderService;
import com.isla.kiosk.service.SalesService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*")
public class SalesController {

    private final SalesService salesService;
    private final OrderService orderService;

    public SalesController(SalesService salesService, OrderService orderService) {
        this.salesService = salesService;
        this.orderService = orderService;
    }

    @GetMapping("/daily")
    public ResponseEntity<Map<String, Object>> getDailySales(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        return ResponseEntity.ok(salesService.getDailySales(date));
    }

    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlySales(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        LocalDate today = LocalDate.now();
        int y = (year != null) ? year : today.getYear();
        int m = (month != null) ? month : today.getMonthValue();
        return ResponseEntity.ok(salesService.getMonthlySales(y, m));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getOverallSummary() {
        return ResponseEntity.ok(salesService.getOverallSummary());
    }

    @PostMapping("/reset-demo")
    public ResponseEntity<Map<String, String>> resetDemo() {
        orderService.resetDemoData();
        return ResponseEntity.ok(Map.of("message", "Demo data reset successfully"));
    }
}
