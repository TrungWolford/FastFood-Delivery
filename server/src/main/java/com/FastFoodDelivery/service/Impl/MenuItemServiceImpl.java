package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.MenuItem.CreateMenuItemRequest;
import com.FastFoodDelivery.dto.request.MenuItem.UpdateMenuItemRequest;
import com.FastFoodDelivery.dto.response.MenuItem.MenuItemResponse;
import com.FastFoodDelivery.entity.MenuItem;
import com.FastFoodDelivery.entity.User;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.MenuItemRepository;
import com.FastFoodDelivery.service.MenuItemService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuItemServiceImpl implements MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Override
    public Page<MenuItemResponse> getAllMenuItem(Pageable pageable) {
        return menuItemRepository.findAll(pageable)
                .map(MenuItemResponse::fromEntity);
    }

    @Override
    public MenuItemResponse getByMenuItemId(ObjectId menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", menuItemId.toString()));
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
        MenuItem menuItem = new MenuItem();
        menuItem.setRestaurantId(request.getRestaurantId());
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setImageUrl(request.getImageUrl());
        menuItem.setPrice(request.getPrice());

        menuItemRepository.save(menuItem);

        return MenuItemResponse.fromEntity(menuItem);
    }

    @Override
    public MenuItemResponse updateMenuItem(UpdateMenuItemRequest request, ObjectId menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", menuItemId.toString()));

        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setImageUrl(request.getImageUrl());
        menuItem.setPrice(request.getPrice());

        menuItemRepository.save(menuItem);

        return MenuItemResponse.fromEntity(menuItem);
    }

    @Override
    public void changeStatus(ObjectId menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", menuItemId.toString()));
        boolean status = menuItem.isAvailable();
        menuItem.setAvailable(!status);

        menuItemRepository.save(menuItem);
    }
}
