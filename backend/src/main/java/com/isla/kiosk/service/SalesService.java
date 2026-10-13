package com.isla.kiosk.service;

import com.isla.kiosk.model.Order;
import com.isla.kiosk.model.OrderItem;
import com.isla.kiosk.model.OrderStatus;
import com.isla.kiosk.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SalesService {

    private final OrderRepository orderRepository;

    public SalesService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Map<String, Object> getDailySales(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        final LocalDate queryDate = date;
        List<Order> validOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().isEqual(queryDate))
                .collect(Collectors.toList());

        double totalRevenue = 0.0;
        int totalDrinks = 0;
        Map<String, Double> paymentMethodBreakdown = new HashMap<>();
        Map<String, Double> categoryRevenue = new HashMap<>();
        Map<String, Integer> itemQuantityMap = new HashMap<>();
        Map<String, Double> itemRevenueMap = new HashMap<>();
        Map<Integer, Double> hourlySales = new TreeMap<>();
        Map<Integer, Integer> hourlyOrders = new TreeMap<>();

        // Initialize hourly slots (7 AM to 22 PM)
        for (int h = 7; h <= 22; h++) {
            hourlySales.put(h, 0.0);
            hourlyOrders.put(h, 0);
        }

        for (Order o : validOrders) {
            totalRevenue += o.getTotalAmount();
            String method = o.getPaymentMethod() != null ? o.getPaymentMethod() : "Cash";
            paymentMethodBreakdown.put(method, paymentMethodBreakdown.getOrDefault(method, 0.0) + o.getTotalAmount());

            int hour = o.getCreatedAt().getHour();
            if (hourlySales.containsKey(hour)) {
                hourlySales.put(hour, hourlySales.get(hour) + o.getTotalAmount());
                hourlyOrders.put(hour, hourlyOrders.get(hour) + 1);
            }

            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    totalDrinks += item.getQuantity();
                    String cat = item.getCategory() != null ? item.getCategory() : "Other";
                    categoryRevenue.put(cat, categoryRevenue.getOrDefault(cat, 0.0) + item.getItemTotal());

                    String name = item.getName();
                    itemQuantityMap.put(name, itemQuantityMap.getOrDefault(name, 0) + item.getQuantity());
                    itemRevenueMap.put(name, itemRevenueMap.getOrDefault(name, 0.0) + item.getItemTotal());
                }
            }
        }

        // Top selling items
        List<Map<String, Object>> topSellingItems = itemQuantityMap.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", e.getKey());
                    map.put("quantity", e.getValue());
                    map.put("revenue", itemRevenueMap.getOrDefault(e.getKey(), 0.0));
                    return map;
                })
                .collect(Collectors.toList());

        // Format hourly data for chart
        List<Map<String, Object>> hourlyChartData = new ArrayList<>();
        for (Map.Entry<Integer, Double> entry : hourlySales.entrySet()) {
            Map<String, Object> hMap = new HashMap<>();
            int h = entry.getKey();
            String label = (h > 12 ? (h - 12) + " PM" : (h == 12 ? "12 PM" : h + " AM"));
            hMap.put("hour", h);
            hMap.put("label", label);
            hMap.put("sales", entry.getValue());
            hMap.put("orders", hourlyOrders.get(h));
            hourlyChartData.add(hMap);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("date", queryDate.toString());
        result.put("totalRevenue", totalRevenue);
        result.put("totalOrders", validOrders.size());
        result.put("totalDrinks", totalDrinks);
        result.put("averageOrderValue", validOrders.isEmpty() ? 0.0 : totalRevenue / validOrders.size());
        result.put("paymentBreakdown", paymentMethodBreakdown);
        result.put("categoryBreakdown", categoryRevenue);
        result.put("topSellingItems", topSellingItems);
        result.put("hourlySales", hourlyChartData);
        result.put("orders", validOrders);

        return result;
    }

    public Map<String, Object> getMonthlySales(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        int daysInMonth = ym.lengthOfMonth();

        List<Order> validOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .filter(o -> o.getCreatedAt() != null &&
                             o.getCreatedAt().getYear() == year &&
                             o.getCreatedAt().getMonthValue() == month)
                .collect(Collectors.toList());

        double totalRevenue = 0.0;
        int totalDrinks = 0;
        Map<Integer, Double> dailyRevenue = new TreeMap<>();
        Map<Integer, Integer> dailyOrders = new TreeMap<>();
        Map<String, Double> categoryRevenue = new HashMap<>();
        Map<String, Integer> itemQuantityMap = new HashMap<>();
        Map<String, Double> itemRevenueMap = new HashMap<>();

        for (int d = 1; d <= daysInMonth; d++) {
            dailyRevenue.put(d, 0.0);
            dailyOrders.put(d, 0);
        }

        for (Order o : validOrders) {
            totalRevenue += o.getTotalAmount();
            int d = o.getCreatedAt().getDayOfMonth();
            dailyRevenue.put(d, dailyRevenue.getOrDefault(d, 0.0) + o.getTotalAmount());
            dailyOrders.put(d, dailyOrders.getOrDefault(d, 0) + 1);

            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    totalDrinks += item.getQuantity();
                    String cat = item.getCategory() != null ? item.getCategory() : "Other";
                    categoryRevenue.put(cat, categoryRevenue.getOrDefault(cat, 0.0) + item.getItemTotal());

                    String name = item.getName();
                    itemQuantityMap.put(name, itemQuantityMap.getOrDefault(name, 0) + item.getQuantity());
                    itemRevenueMap.put(name, itemRevenueMap.getOrDefault(name, 0.0) + item.getItemTotal());
                }
            }
        }

        List<Map<String, Object>> dailyChart = new ArrayList<>();
        for (int d = 1; d <= daysInMonth; d++) {
            Map<String, Object> dMap = new HashMap<>();
            dMap.put("day", d);
            dMap.put("date", String.format("%04d-%02d-%02d", year, month, d));
            dMap.put("sales", dailyRevenue.get(d));
            dMap.put("orders", dailyOrders.get(d));
            dailyChart.add(dMap);
        }

        List<Map<String, Object>> topSellingItems = itemQuantityMap.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", e.getKey());
                    map.put("quantity", e.getValue());
                    map.put("revenue", itemRevenueMap.getOrDefault(e.getKey(), 0.0));
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("month", month);
        result.put("monthName", ym.getMonth().name());
        result.put("totalRevenue", totalRevenue);
        result.put("totalOrders", validOrders.size());
        result.put("totalDrinks", totalDrinks);
        result.put("averageDailyRevenue", daysInMonth > 0 ? totalRevenue / daysInMonth : 0.0);
        result.put("categoryBreakdown", categoryRevenue);
        result.put("topSellingItems", topSellingItems);
        result.put("dailySales", dailyChart);

        return result;
    }

    public Map<String, Object> getOverallSummary() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        Map<String, Object> todaySales = getDailySales(today);
        Map<String, Object> yesterdaySales = getDailySales(yesterday);
        Map<String, Object> monthSales = getMonthlySales(today.getYear(), today.getMonthValue());

        Map<String, Object> summary = new HashMap<>();
        summary.put("todayRevenue", todaySales.get("totalRevenue"));
        summary.put("todayOrders", todaySales.get("totalOrders"));
        summary.put("yesterdayRevenue", yesterdaySales.get("totalRevenue"));
        summary.put("yesterdayOrders", yesterdaySales.get("totalOrders"));
        summary.put("monthRevenue", monthSales.get("totalRevenue"));
        summary.put("monthOrders", monthSales.get("totalOrders"));
        summary.put("monthName", monthSales.get("monthName"));

        return summary;
    }
}
