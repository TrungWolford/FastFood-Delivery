package com.FastFoodDelivery.service.Impl;

import com.FastFoodDelivery.dto.request.Cart.CreateCartRequest;
import com.FastFoodDelivery.dto.request.Cart.UpdateCartRequest;
import com.FastFoodDelivery.dto.request.CartItem.CreateCartItemRequest;
import com.FastFoodDelivery.dto.request.CartItem.UpdateCartItemRequest;
import com.FastFoodDelivery.dto.response.Cart.CartResponse;
import com.FastFoodDelivery.dto.response.CartItem.CartItemResponse;
import com.FastFoodDelivery.entity.Cart;
import com.FastFoodDelivery.entity.CartItem;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.CartRepository;
import com.FastFoodDelivery.service.CartService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.List;

public class CartServiceImpl implements CartService {
    @Autowired
    private CartRepository cartRepository;

    @Override
    public CartResponse getCartById(ObjectId cartId) {
        Cart cart = cartRepository.findByCartId(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cartId.toString()));

        return CartResponse.fromEntity(cart);
    }

    @Override
    public Page<CartResponse> getCartsByUserId(ObjectId userId, Pageable pageable) {
        Page<Cart> carts = cartRepository.findByUserId(userId, pageable);

        return carts.map(CartResponse::fromEntity);
    }

    @Override
    public List<CartItemResponse> getCartItemsByCartId(ObjectId cartId) {
        Cart cart = cartRepository.findByCartId(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cartId.toString()));

        List<CartItem> items = cart.getCartItems();
        return items.stream()
                .map(CartItemResponse::fromEntity)
                .toList();
    }


    @Override
    public CartResponse createCart(CreateCartRequest request) {
        Cart cart = new Cart();
        cart.setUserId(request.getUserId());
        cart.setRestaurantId(request.getRestaurantId());

        List<CartItem> cartItems = request.getCartItems().stream().map(itemReq -> {
            CartItem item = new CartItem();
            item.setItemId(itemReq.getItemId());
            item.setQuantity(itemReq.getQuantity());
            item.setNote(itemReq.getNote());
            item.setAddedAt(new Date());
            return item;
        }).toList();
        cart.setCartItems(cartItems);

        cart.setCreatedAt(new Date());
        cart.setUpdatedAt(new Date());

        Cart savedCart = cartRepository.save(cart);

        return CartResponse.fromEntity(savedCart);
    }

    @Override
    public CartResponse updateCart(UpdateCartRequest request, ObjectId cartId) {
        Cart existingCart = cartRepository.findByCartId(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cartId.toString()));

        // Không cho đổi restaurant
        if (request.getRestaurantId() != null
                && !request.getRestaurantId().equals(existingCart.getRestaurantId())) {
            throw new IllegalArgumentException("Không thể đổi restaurant của cart");
        }

        // Update cart items
        if (request.getCartItems() != null) {
            // Thay toàn bộ list
            existingCart.setCartItems(
                    request.getCartItems().stream().map(itemReq -> {
                        CartItem item = new CartItem();
                        item.setItemId(itemReq.getItemId());
                        item.setQuantity(itemReq.getQuantity());
                        item.setNote(itemReq.getNote());
                        item.setAddedAt(new Date());
                        return item;
                    }).toList()
            );
        }

        // Update thời gian
        existingCart.setUpdatedAt(new Date());

        Cart updatedCart = cartRepository.save(existingCart);

        return CartResponse.fromEntity(updatedCart);
    }

    @Override
    public void deleteCart(ObjectId cartId) {
        if (!cartRepository.existsById(cartId)) {
            throw new ResourceNotFoundException("Cart", "id", cartId.toString());
        }
        cartRepository.deleteById(cartId);
    }

    @Override
    public CartResponse addItemToCart(ObjectId cartId, CreateCartItemRequest request) {
        Cart cart = cartRepository.findByCartId(cartId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cart phù hợp"));

        CartItem newItem = new CartItem();
        newItem.setItemId(request.getItemId());
        newItem.setQuantity(request.getQuantity());
        newItem.setNote(request.getNote());
        newItem.setAddedAt(new Date());

        cart.getCartItems().add(newItem);
        cart.setUpdatedAt(new Date());

        cart = cartRepository.save(cart);

        return CartResponse.fromEntity(cart);
    }

    @Override
    public CartResponse updateItemInCart(ObjectId cartId, ObjectId itemId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findByCartId(cartId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cart phù hợp"));

        CartItem item = cart.getCartItems().stream()
                .filter(ci -> ci.getItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm phù hợp trong cart"));

        if (request.getQuantity() != null) {
            item.setQuantity(request.getQuantity());
        }
        if (request.getNote() != null) {
            item.setNote(request.getNote());
        }

        cart.setUpdatedAt(new Date());
        cart = cartRepository.save(cart);

        return CartResponse.fromEntity(cart);
    }

    @Override
    public CartResponse removeItemFromCart(ObjectId cartId, ObjectId itemId) {
        Cart cart = cartRepository.findByCartId(cartId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cart phù hợp"));

        boolean removed = cart.getCartItems().removeIf(ci -> ci.getItemId().equals(itemId));
        if (!removed) {
            throw new RuntimeException("Không tìm thấy sản phẩm phù hợp trong cart");
        }

        cart.setUpdatedAt(new Date());
        cart = cartRepository.save(cart);

        return CartResponse.fromEntity(cart);
    }
}
