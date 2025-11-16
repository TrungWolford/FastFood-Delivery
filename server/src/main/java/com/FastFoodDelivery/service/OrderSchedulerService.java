package com.FastFoodDelivery.service;

import com.FastFoodDelivery.entity.Order;
import com.FastFoodDelivery.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * Scheduled service to automatically cancel expired orders
 * Runs every 3 minutes to check for orders that have exceeded their payment deadline
 */
@Service
public class OrderSchedulerService {

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Automatically cancel orders that are still PENDING after payment expiration time
     * Runs every 3 minutes (180000 milliseconds)
     */
    @Scheduled(fixedRate = 180000)
    public void cancelExpiredOrders() {
        Date now = new Date();
        
        // Find all PENDING orders where payment has expired
        List<Order> expiredOrders = orderRepository.findByStatusAndPaymentExpiresAtBefore("PENDING", now);
        
        if (!expiredOrders.isEmpty()) {
            for (Order order : expiredOrders) {
                order.setStatus("CANCELLED");
                order.setUpdatedAt(new Date());
                orderRepository.save(order);
            }
            
            System.out.println("[Scheduler] Auto-cancelled " + expiredOrders.size() + " expired orders at " + now);
        }
    }
}
