package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.MenuItem.CreateMenuItemRequest;
import com.FastFoodDelivery.dto.request.MenuItem.UpdateMenuItemRequest;
import com.FastFoodDelivery.dto.response.MenuItem.MenuItemResponse;
import com.FastFoodDelivery.entity.MenuItem;
import com.FastFoodDelivery.entity.User;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.MenuItemRepository;
import com.FastFoodDelivery.service.MenuItemService;
import com.FastFoodDelivery.util.ValidationUtil;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class MenuItemServiceImpl implements MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ValidationUtil validationUtil;

    @Override
    public Page<MenuItemResponse> getAllMenuItem(Pageable pageable) {
        return menuItemRepository.findAll(pageable)
                .map(MenuItemResponse::fromEntity);
    }

    @Override
    public MenuItemResponse getByMenuItemId(ObjectId menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", menuItemId.toString()));
        return MenuItemResponse.fromEntity(menuItem);
    }

    @Override
    public List<MenuItemResponse> getAllMenuItemByRestaurantId(ObjectId restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId).stream()
                .map(MenuItemResponse::fromEntity)
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
        menuItem.setImageUrl(request.getImageUrl());
        menuItem.setPrice(request.getPrice());
        menuItem.setAvailable(true);
        menuItem.setCreatedAt(new Date());
        menuItem.setUpdatedAt(new Date());

        return MenuItemResponse.fromEntity(menuItemRepository.save(menuItem));
    }

    @Override
    public MenuItemResponse updateMenuItem(UpdateMenuItemRequest request, ObjectId menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", menuItemId.toString()));

        if (request.getName() != null) menuItem.setName(request.getName());
        if (request.getDescription() != null) menuItem.setDescription(request.getDescription());
        if (request.getImageUrl() != null) menuItem.setImageUrl(request.getImageUrl());
        if (request.getPrice() > 0) menuItem.setPrice(request.getPrice());

        menuItem.setUpdatedAt(new Date());
        return MenuItemResponse.fromEntity(menuItemRepository.save(menuItem));
    }

    @Override
    public void changeStatus(ObjectId menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", menuItemId.toString()));

        menuItem.setAvailable(!menuItem.isAvailable());
        menuItem.setUpdatedAt(new Date());

        menuItemRepository.save(menuItem);
    }
}
