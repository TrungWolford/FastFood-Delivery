package com.FastFoodDelivery.service;

import com.FastFoodDelivery.dto.request.MenuItem.CreateMenuItemRequest;
import com.FastFoodDelivery.dto.request.MenuItem.UpdateMenuItemRequest;
import com.FastFoodDelivery.dto.response.MenuItem.MenuItemResponse;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MenuItemService {

    Page<MenuItemResponse> getAllMenuItem(Pageable pageable);
    MenuItemResponse getByMenuItemId(ObjectId menuItemId);

    // CRUD operation for Owner Restaurant
    List<MenuItemResponse> getAllMenuItemByRestaurantId(ObjectId restaurantId);
    MenuItemResponse createMenuItem(CreateMenuItemRequest request);
    MenuItemResponse updateMenuItem(UpdateMenuItemRequest request, ObjectId menuItemId);
    void changeStatus(ObjectId menuItemId);

}
