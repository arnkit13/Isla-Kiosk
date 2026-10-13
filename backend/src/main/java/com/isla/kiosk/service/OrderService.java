package com.isla.kiosk.service;

import com.isla.kiosk.model.Order;
import com.isla.kiosk.model.OrderStatus;
import com.isla.kiosk.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order createOrder(Order order) {
        if (order.getCustomerName() == null || order.getCustomerName().trim().isEmpty()) {
            order.setCustomerName("Guest Customer");
        }
        order.setStatus(OrderStatus.PENDING);
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getWaitingList() {
        return orderRepository.findWaitingList();
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> updateStatus(String id, OrderStatus newStatus) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(newStatus);
            orderRepository.save(order);
            return Optional.of(order);
        }
        return Optional.empty();
    }

    public boolean cancelOrder(String id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            return true;
        }
        return false;
    }

    public void resetDemoData() {
        orderRepository.resetWithSeedData();
    }
}
