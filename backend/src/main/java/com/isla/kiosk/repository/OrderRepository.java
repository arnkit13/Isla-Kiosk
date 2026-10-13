package com.isla.kiosk.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.isla.kiosk.model.Order;
import com.isla.kiosk.model.OrderItem;
import com.isla.kiosk.model.OrderStatus;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Repository
public class OrderRepository {

    private final Map<String, Order> orders = new ConcurrentHashMap<>();
    private final AtomicInteger sequenceCounter = new AtomicInteger(100);
    private final ObjectMapper objectMapper;
    private final File storageFile = new File("orders_data.json");

    public OrderRepository() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        loadFromFileOrSeed();
    }

    private synchronized void loadFromFileOrSeed() {
        if (storageFile.exists()) {
            try {
                List<Order> savedOrders = objectMapper.readValue(storageFile, new TypeReference<List<Order>>() {});
                for (Order o : savedOrders) {
                    orders.put(o.getId(), o);
                    // Adjust sequenceCounter if needed
                    try {
                        String numStr = o.getOrderNumber().replaceAll("[^0-9]", "");
                        if (!numStr.isEmpty()) {
                            int n = Integer.parseInt(numStr);
                            sequenceCounter.updateAndGet(curr -> Math.max(curr, n));
                        }
                    } catch (Exception ignored) {}
                }
                if (!orders.isEmpty()) {
                    return;
                }
            } catch (Exception e) {
                System.err.println("Failed to read from orders_data.json, seeding sample data: " + e.getMessage());
            }
        }
        seedSampleData();
        saveToFile();
    }

    public synchronized void saveToFile() {
        try {
            List<Order> list = new ArrayList<>(orders.values());
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(storageFile, list);
        } catch (IOException e) {
            System.err.println("Could not persist orders to file: " + e.getMessage());
        }
    }

    public synchronized void resetWithSeedData() {
        orders.clear();
        sequenceCounter.set(100);
        seedSampleData();
        saveToFile();
    }

    public Order save(Order order) {
        if (order.getId() == null || order.getId().isEmpty()) {
            order.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (order.getOrderNumber() == null || order.getOrderNumber().isEmpty()) {
            int seq = sequenceCounter.incrementAndGet();
            order.setOrderNumber("#" + seq);
        }
        order.recalculateTotal();
        orders.put(order.getId(), order);
        saveToFile();
        return order;
    }

    public Optional<Order> findById(String id) {
        return Optional.ofNullable(orders.get(id));
    }

    public List<Order> findAll() {
        return orders.values().stream()
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public List<Order> findWaitingList() {
        return orders.values().stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING ||
                             o.getStatus() == OrderStatus.PREPARING ||
                             o.getStatus() == OrderStatus.READY)
                .sorted(Comparator.comparing(Order::getCreatedAt))
                .collect(Collectors.toList());
    }

    public boolean delete(String id) {
        boolean removed = orders.remove(id) != null;
        if (removed) {
            saveToFile();
        }
        return removed;
    }

    private void seedSampleData() {
        LocalDate today = LocalDate.now();

        // 1. Orders for previous days of this month (to show nice monthly sales!)
        for (int day = 1; day < today.getDayOfMonth(); day++) {
            LocalDate pastDate = today.withDayOfMonth(day);
            int ordersPerDay = 8 + (day * 3) % 15; // 8 to 22 orders per day
            for (int k = 1; k <= ordersPerDay; k++) {
                int seq = sequenceCounter.incrementAndGet();
                LocalDateTime orderTime = pastDate.atTime(LocalTime.of(8 + (k % 12), (k * 7) % 60));
                
                List<OrderItem> items = new ArrayList<>();
                if (k % 4 == 0) {
                    items.add(new OrderItem("esp-2", "Spanish Latte", "Espresso-Based", 2, 59.0, List.of("Cream Cloud"), "Less sweet"));
                } else if (k % 3 == 0) {
                    items.add(new OrderItem("mat-4", "Merry Matcha", "Matcha Series", 1, 59.0, List.of("Coffee Jelly"), ""));
                    items.add(new OrderItem("juc-2", "Purple Lemonade", "Juice Series", 1, 49.0, Collections.emptyList(), ""));
                } else if (k % 2 == 0) {
                    items.add(new OrderItem("bld-1", "Matcha Cloud", "Blended Series", 1, 75.0, Collections.emptyList(), ""));
                    items.add(new OrderItem("mlk-2", "Strawberry", "Milk-Based", 1, 59.0, List.of("Syrup"), ""));
                } else {
                    items.add(new OrderItem("esp-7", "Java Chips", "Espresso-Based", 1, 59.0, Collections.emptyList(), "Extra ice"));
                }

                Order pastOrder = new Order();
                pastOrder.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                pastOrder.setOrderNumber("#" + seq);
                pastOrder.setCustomerName(sampleNames[k % sampleNames.length]);
                pastOrder.setItems(items);
                pastOrder.setPaymentMethod(k % 3 == 0 ? "GCash" : (k % 5 == 0 ? "Maya" : "Cash"));
                pastOrder.recalculateTotal();
                pastOrder.setAmountPaid(pastOrder.getTotalAmount() >= 100 ? 200.0 : 100.0);
                pastOrder.setCreatedAt(orderTime);
                pastOrder.setUpdatedAt(orderTime.plusMinutes(7));
                pastOrder.setCompletedAt(orderTime.plusMinutes(7));
                pastOrder.setStatus(OrderStatus.COMPLETED);

                orders.put(pastOrder.getId(), pastOrder);
            }
        }

        // 2. Orders for TODAY (Completed earlier today)
        for (int i = 1; i <= 6; i++) {
            int seq = sequenceCounter.incrementAndGet();
            LocalDateTime orderTime = today.atTime(LocalTime.of(8 + (i * 2), (i * 11) % 60));

            List<OrderItem> items = new ArrayList<>();
            if (i % 2 == 0) {
                items.add(new OrderItem("esp-2", "Spanish Latte", "Espresso-Based", 1, 59.0, List.of("Cream Cloud"), ""));
                items.add(new OrderItem("bld-2", "Strawberry Dream", "Blended Series", 1, 75.0, Collections.emptyList(), ""));
            } else {
                items.add(new OrderItem("juc-2", "Purple Lemonade", "Juice Series", 2, 49.0, Collections.emptyList(), ""));
            }

            Order todayDone = new Order();
            todayDone.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            todayDone.setOrderNumber("#" + seq);
            todayDone.setCustomerName(sampleNames[(i + 5) % sampleNames.length]);
            todayDone.setItems(items);
            todayDone.setPaymentMethod(i % 2 == 0 ? "GCash" : "Cash");
            todayDone.recalculateTotal();
            todayDone.setAmountPaid(todayDone.getTotalAmount() >= 100 ? 200.0 : 100.0);
            todayDone.setCreatedAt(orderTime);
            todayDone.setUpdatedAt(orderTime.plusMinutes(6));
            todayDone.setCompletedAt(orderTime.plusMinutes(6));
            todayDone.setStatus(OrderStatus.COMPLETED);

            orders.put(todayDone.getId(), todayDone);
        }

        // 3. Active orders for TODAY in Waiting List (Pending, Preparing, Ready)
        // Ready order
        int seq1 = sequenceCounter.incrementAndGet();
        Order readyOrder = new Order();
        readyOrder.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        readyOrder.setOrderNumber("#" + seq1);
        readyOrder.setCustomerName("Maria Santos");
        readyOrder.setItems(List.of(
                new OrderItem("esp-2", "Spanish Latte", "Espresso-Based", 1, 59.0, List.of("Cream Cloud"), "25% sugar"),
                new OrderItem("hot-1", "Creamy Cocoa", "Hot Series", 1, 39.0, Collections.emptyList(), "Extra hot")
        ));
        readyOrder.setPaymentMethod("GCash");
        readyOrder.recalculateTotal();
        readyOrder.setAmountPaid(readyOrder.getTotalAmount());
        readyOrder.setCreatedAt(LocalDateTime.now().minusMinutes(12));
        readyOrder.setStatus(OrderStatus.READY);
        orders.put(readyOrder.getId(), readyOrder);

        // Preparing order
        int seq2 = sequenceCounter.incrementAndGet();
        Order prepOrder = new Order();
        prepOrder.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        prepOrder.setOrderNumber("#" + seq2);
        prepOrder.setCustomerName("Carlos Diaz");
        prepOrder.setItems(List.of(
                new OrderItem("mat-4", "Merry Matcha", "Matcha Series", 2, 59.0, List.of("Coffee Jelly"), "Cold")
        ));
        prepOrder.setPaymentMethod("Cash");
        prepOrder.recalculateTotal();
        prepOrder.setAmountPaid(200.0);
        prepOrder.setCreatedAt(LocalDateTime.now().minusMinutes(6));
        prepOrder.setStatus(OrderStatus.PREPARING);
        orders.put(prepOrder.getId(), prepOrder);

        // Pending order
        int seq3 = sequenceCounter.incrementAndGet();
        Order pendOrder = new Order();
        pendOrder.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        pendOrder.setOrderNumber("#" + seq3);
        pendOrder.setCustomerName("Bea Alonzo");
        pendOrder.setItems(List.of(
                new OrderItem("bld-1", "Matcha Cloud", "Blended Series", 1, 75.0, Collections.emptyList(), "Extra whip"),
                new OrderItem("esp-7", "Java Chips", "Espresso-Based", 1, 59.0, List.of("Espresso Shot"), "Strong")
        ));
        pendOrder.setPaymentMethod("Maya");
        pendOrder.recalculateTotal();
        pendOrder.setAmountPaid(pendOrder.getTotalAmount());
        pendOrder.setCreatedAt(LocalDateTime.now().minusMinutes(2));
        pendOrder.setStatus(OrderStatus.PENDING);
        orders.put(pendOrder.getId(), pendOrder);
    }

    private static final String[] sampleNames = {
            "Angelo Ramos", "Katrina Cruz", "Joshua Lee", "Patricia Reyes", "Daniel Padilla",
            "Nadine Lustre", "James Reid", "Liza Soberano", "Enrique Gil", "Kathryn Bernardo",
            "Alden Richards", "Maine Mendoza", "Christian Bautista", "Sarah Geronimo", "Matteo Guidicelli"
    };
}
