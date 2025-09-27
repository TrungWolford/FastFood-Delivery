package com.FastFoodDelivery.controller;

import com.FastFoodDelivery.dto.request.Cart.CreateCartRequest;
import com.FastFoodDelivery.dto.request.Cart.UpdateCartRequest;
import com.FastFoodDelivery.dto.request.CartItem.CreateCartItemRequest;
import com.FastFoodDelivery.dto.request.CartItem.UpdateCartItemRequest;
import com.FastFoodDelivery.dto.response.Cart.CartResponse;
import com.FastFoodDelivery.dto.response.CartItem.CartItemResponse;
import com.FastFoodDelivery.service.CartService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    @Autowired
    private CartService cartService;

    // Lấy cart theo id
    @GetMapping("/{cartId}")
    public ResponseEntity<CartResponse> getCartById(@PathVariable String cartId) {
        return ResponseEntity.ok(cartService.getCartById(new ObjectId(cartId)));
    }

    // Lấy cart theo userId (phân trang)
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<CartResponse>> getCartsByUserId(
            @PathVariable String userId,
            Pageable pageable) {
        return ResponseEntity.ok(cartService.getCartsByUserId(new ObjectId(userId), pageable));
    }

    // Lấy danh sách cart items theo cartId
    @GetMapping("/{cartId}/items")
    public ResponseEntity<List<CartItemResponse>> getCartItems(@PathVariable String cartId) {
        return ResponseEntity.ok(cartService.getCartItemsByCartId(new ObjectId(cartId)));
    }

    // Tạo cart mới
    @PostMapping
    public ResponseEntity<CartResponse> createCart(@RequestBody CreateCartRequest request) {
        return ResponseEntity.ok(cartService.createCart(request));
    }

    // Update cart (cập nhật toàn bộ cart)
    @PutMapping("/{cartId}")
    public ResponseEntity<CartResponse> updateCart(@RequestBody UpdateCartRequest request,
                                                   @PathVariable String cartId) {
        return ResponseEntity.ok(cartService.updateCart(request, new ObjectId(cartId)));
    }

    // Xóa cart
    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> deleteCart(@PathVariable String cartId) {
        cartService.deleteCart(new ObjectId(cartId));
        return ResponseEntity.noContent().build();
    }

    // Thêm item vào cart
    @PostMapping("/{cartId}/items")
    public ResponseEntity<CartResponse> addItem(@PathVariable String cartId,
                                                @RequestBody CreateCartItemRequest request) {
        return ResponseEntity.ok(cartService.addItemToCart(new ObjectId(cartId), request));
    }

    // Update item trong cart
    @PutMapping("/{cartId}/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateItem(@PathVariable String cartId,
                                                   @PathVariable String cartItemId,
                                                   @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItemInCart(new ObjectId(cartId), new ObjectId(cartItemId), request));
    }

    // Xóa item trong cart
    @DeleteMapping("/{cartId}/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable String cartId,
                                                   @PathVariable String cartItemId) {
        return ResponseEntity.ok(cartService.removeItemFromCart(new ObjectId(cartId), new ObjectId(cartItemId)));
    }
}
