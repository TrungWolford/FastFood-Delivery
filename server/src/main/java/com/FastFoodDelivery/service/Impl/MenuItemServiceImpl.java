package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.MenuItem.CreateMenuItemRequest;
import com.FastFoodDelivery.dto.request.MenuItem.UpdateMenuItemRequest;
import com.FastFoodDelivery.dto.response.MenuItem.MenuItemResponse;
import com.FastFoodDelivery.entity.MenuItem;
import com.FastFoodDelivery.entity.Restaurant;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.MenuItemRepository;
import com.FastFoodDelivery.repository.RestaurantRepository;
import com.FastFoodDelivery.service.MenuItemService;
import com.FastFoodDelivery.util.ValidationUtil;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MenuItemServiceImpl implements MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private ValidationUtil validationUtil;

    @Override
    public Page<MenuItemResponse> getAllMenuItem(Pageable pageable) {
        Page<MenuItem> menuItemPage = menuItemRepository.findAll(pageable);
        
        // Collect all unique restaurant IDs
        Set<ObjectId> restaurantIds = menuItemPage.getContent().stream()
                .map(MenuItem::getRestaurantId)
                .collect(Collectors.toSet());
        
        // Fetch all restaurants in one query
        Map<ObjectId, Restaurant> restaurantMap = restaurantRepository.findAllById(restaurantIds).stream()
                .collect(Collectors.toMap(Restaurant::getRestaurantId, restaurant -> restaurant));
        
        // Map menu items to responses with restaurant lookup
        return menuItemPage.map(menuItem -> {
            Restaurant restaurant = restaurantMap.get(menuItem.getRestaurantId());
            return MenuItemResponse.fromEntity(menuItem, restaurant);
        });
    }

    @Override
    public MenuItemResponse getByMenuItemId(ObjectId menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", menuItemId.toString()));
        Restaurant restaurant = restaurantRepository.findById(menuItem.getRestaurantId()).orElse(null);
        return MenuItemResponse.fromEntity(menuItem, restaurant);
    }

    @Override
    public List<MenuItemResponse> getAllMenuItemByRestaurantId(ObjectId restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
        return menuItemRepository.findByRestaurantId(restaurantId).stream()
                .map(menuItem -> MenuItemResponse.fromEntity(menuItem, restaurant))
                .toList();
    }

    @Override
    public MenuItemResponse createMenuItem(CreateMenuItemRequest request) {
        validationUtil.validateNotEmpty(request.getName(), "MenuItem name");
        validationUtil.validatePositive(request.getPrice(), "MenuItem price");
        validationUtil.validateRestaurant(request.getRestaurantId());

        MenuItem menuItem = new MenuItem();
        menuItem.setRestaurantId(request.getRestaurantId());
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setCategoryName(request.getCategoryName());
        menuItem.setImageUrl(request.getImageUrl());
        menuItem.setPrice(request.getPrice());
        menuItem.setAvailable(request.isAvailable()); // Use value from request (defaults to true)
        menuItem.setCreatedAt(new Date());
        menuItem.setUpdatedAt(new Date());

        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        Restaurant restaurant = restaurantRepository.findById(savedMenuItem.getRestaurantId()).orElse(null);
        return MenuItemResponse.fromEntity(savedMenuItem, restaurant);
    }

    @Override
    public MenuItemResponse updateMenuItem(UpdateMenuItemRequest request, ObjectId menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", menuItemId.toString()));

        if (request.getName() != null) menuItem.setName(request.getName());
        if (request.getDescription() != null) menuItem.setDescription(request.getDescription());
        if (request.getCategoryName() != null) menuItem.setCategoryName(request.getCategoryName());
        if (request.getImageUrl() != null) menuItem.setImageUrl(request.getImageUrl());
        if (request.getPrice() > 0) menuItem.setPrice(request.getPrice());
        if (request.getIsAvailable() != null) menuItem.setAvailable(request.getIsAvailable()); // Add isAvailable update

        menuItem.setUpdatedAt(new Date());
        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        Restaurant restaurant = restaurantRepository.findById(savedMenuItem.getRestaurantId()).orElse(null);
        return MenuItemResponse.fromEntity(savedMenuItem, restaurant);
    }

    @Override
    public MenuItemResponse changeStatus(ObjectId menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", menuItemId.toString()));

        // Toggle the status
        menuItem.setAvailable(!menuItem.isAvailable());
        menuItem.setUpdatedAt(new Date());

        // Save and return the updated menu item
        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        Restaurant restaurant = restaurantRepository.findById(savedMenuItem.getRestaurantId()).orElse(null);
        
        return MenuItemResponse.fromEntity(savedMenuItem, restaurant);
    }
}
