package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.request.MenuItem.CreateMenuItemRequest;
import com.FastFoodDelivery.dto.request.MenuItem.UpdateMenuItemRequest;
import com.FastFoodDelivery.dto.response.MenuItem.MenuItemResponse;
import com.FastFoodDelivery.service.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.bson.types.ObjectId;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<Page<MenuItemResponse>> getAllMenuItem(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size){
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(menuItemService.getAllMenuItem(pageable));
    }

    @GetMapping("/{menuItemId}")
    public ResponseEntity<MenuItemResponse> getMenuItemById(@PathVariable String menuItemId) {
        ObjectId objectId = new ObjectId(menuItemId);
        MenuItemResponse menuItem = menuItemService.getByMenuItemId(objectId);
        return ResponseEntity.ok(menuItem);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuItemResponse>> getMenuItemsByRestaurantId(@PathVariable String restaurantId) {
        ObjectId objectId = new ObjectId(restaurantId);
        List<MenuItemResponse> menuItems = menuItemService.getAllMenuItemByRestaurantId(objectId);
        return ResponseEntity.ok(menuItems);
    }

    @PostMapping
    public ResponseEntity<MenuItemResponse> createMenuItem(@RequestBody @Valid CreateMenuItemRequest request) {
        MenuItemResponse createdMenuItem = menuItemService.createMenuItem(request);
        return ResponseEntity.ok(createdMenuItem);
    }

    @PutMapping("/{menuItemId}")
    public ResponseEntity<MenuItemResponse> updateMenuItem(@RequestBody @Valid UpdateMenuItemRequest request,
                                                          @PathVariable String menuItemId) {
        ObjectId objectId = new ObjectId(menuItemId);
        MenuItemResponse updatedMenuItem = menuItemService.updateMenuItem(request, objectId);
        return ResponseEntity.ok(updatedMenuItem);
    }

    @PatchMapping("/{menuItemId}/status")
    public ResponseEntity<String> changeMenuItemStatus(@PathVariable String menuItemId) {
        ObjectId objectId = new ObjectId(menuItemId);
        menuItemService.changeStatus(objectId);
        return ResponseEntity.ok("Menu item status changed successfully");
    }
}
