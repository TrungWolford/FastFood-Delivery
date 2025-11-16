package com.FastFoodDelivery.service.Impl;

import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.FastFoodDelivery.dto.request.Cart.CreateCartRequest;
import com.FastFoodDelivery.dto.request.Cart.UpdateCartRequest;
import com.FastFoodDelivery.dto.request.CartItem.CreateCartItemRequest;
import com.FastFoodDelivery.dto.request.CartItem.UpdateCartItemRequest;
import com.FastFoodDelivery.dto.response.Cart.CartDetailResponse;
import com.FastFoodDelivery.dto.response.Cart.CartResponse;
import com.FastFoodDelivery.dto.response.CartItem.CartItemDetailResponse;
import com.FastFoodDelivery.dto.response.CartItem.CartItemResponse;
import com.FastFoodDelivery.entity.Cart;
import com.FastFoodDelivery.entity.CartItem;
import com.FastFoodDelivery.entity.MenuItem;
import com.FastFoodDelivery.exception.ResourceNotFoundException;
import com.FastFoodDelivery.repository.CartRepository;
import com.FastFoodDelivery.repository.MenuItemRepository;
import com.FastFoodDelivery.service.CartService;
import com.FastFoodDelivery.util.ValidationUtil;

@Service
public class CartServiceImpl implements CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ValidationUtil validationUtil;

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
    public List<CartResponse> getAllCartsByUserId(ObjectId userId) {
        List<Cart> carts = cartRepository.findByUserId(userId);
        return carts.stream()
                .map(CartResponse::fromEntity)
                .toList();
    }

    @Override
    public List<CartDetailResponse> getAllCartsDetailByUserId(ObjectId userId) {
        List<Cart> carts = cartRepository.findByUserId(userId);
        
        return carts.stream()
                .map(cart -> {
                    CartDetailResponse detail = new CartDetailResponse();
                    detail.setCartId(cart.getCartId().toString());
                    detail.setUserId(cart.getUserId().toString());
                    detail.setRestaurantId(cart.getRestaurantId().toString());
                    detail.setCreatedAt(cart.getCreatedAt());
                    detail.setUpdatedAt(cart.getUpdatedAt());
                    
                    // Enrich cart items with menu item details
                    List<CartItemDetailResponse> detailedItems = cart.getCartItems().stream()
                            .map(cartItem -> {
                                MenuItem menuItem = menuItemRepository.findById(cartItem.getItemId()).orElse(null);
                                return CartItemDetailResponse.fromEntity(cartItem, menuItem);
                            })
                            .collect(Collectors.toList());
                    
                    detail.setItems(detailedItems);
                    detail.setItemCount(detailedItems.size());
                    
                    // Calculate total amount
                    double totalAmount = detailedItems.stream()
                            .mapToDouble(item -> item.getPrice() * item.getQuantity())
                            .sum();
                    detail.setTotalAmount(totalAmount);
                    
                    return detail;
                })
                .collect(Collectors.toList());
    }

    @Override
    public CartResponse getCartByUserIdAndRestaurantId(ObjectId userId, ObjectId restaurantId) {
        Cart cart = cartRepository.findByUserIdAndRestaurantId(userId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", 
                    "userId=" + userId + " and restaurantId=" + restaurantId, "not found"));
        return CartResponse.fromEntity(cart);
    }

    @Override
    public List<CartItemResponse> getCartItemsByCartId(ObjectId cartId) {
        Cart cart = cartRepository.findByCartId(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cartId.toString()));

        return cart.getCartItems().stream()
                .map(CartItemResponse::fromEntity)
                .toList();
    }


    @Override
    public CartResponse createCart(CreateCartRequest request) {
        // Validate user
        validationUtil.validateUser(request.getUserId());

        // Check user đã có cart cho restaurant này chưa
        if (cartRepository.existsByUserIdAndRestaurantId(request.getUserId(), request.getRestaurantId())) {
            throw new IllegalArgumentException("User đã có cart cho restaurant này, không thể tạo thêm.");
        }

        // Validate restaurant
        validationUtil.validateRestaurant(request.getRestaurantId());

        // Validate item list
        List<CartItem> cartItems = request.getCartItems().stream().map(itemReq -> {
            validationUtil.validateMenuItem(itemReq.getItemId());

            if (itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
            }

            CartItem item = new CartItem();
            item.setCartItemId(new ObjectId());
            item.setItemId(itemReq.getItemId());
            item.setQuantity(itemReq.getQuantity());
            item.setNote(itemReq.getNote());
            item.setAddedAt(new Date());
            return item;
        }).toList();

        Cart cart = new Cart();
        cart.setUserId(request.getUserId());
        cart.setRestaurantId(request.getRestaurantId());
        cart.setCartItems(cartItems);
        cart.setCreatedAt(new Date());
        cart.setUpdatedAt(new Date());

        Cart savedCart = cartRepository.save(cart);

        return CartResponse.fromEntity(savedCart);
    }

    @Override
    public CartResponse getOrCreateCart(ObjectId userId, ObjectId restaurantId) {
        // Validate user and restaurant
        validationUtil.validateUser(userId);
        validationUtil.validateRestaurant(restaurantId);

        // Try to find existing cart
        Optional<Cart> existingCart = cartRepository.findByUserIdAndRestaurantId(userId, restaurantId);
        
        if (existingCart.isPresent()) {
            return CartResponse.fromEntity(existingCart.get());
        }

        // Create new cart if not exists
        Cart newCart = new Cart();
        newCart.setUserId(userId);
        newCart.setRestaurantId(restaurantId);
        newCart.setCartItems(List.of()); // Empty cart initially
        newCart.setCreatedAt(new Date());
        newCart.setUpdatedAt(new Date());

        Cart savedCart = cartRepository.save(newCart);
        return CartResponse.fromEntity(savedCart);
    }

    @Override
    public CartResponse updateCart(UpdateCartRequest request, ObjectId cartId) {
        Cart existingCart = cartRepository.findByCartId(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "id", cartId.toString()));

        // Update cart items
        if (request.getCartItems() != null) {
            // Thay toàn bộ list
            existingCart.setCartItems(
                    request.getCartItems().stream().map(itemReq -> {
                        validationUtil.validateMenuItem(itemReq.getItemId());

                        if (itemReq.getQuantity() <= 0) {
                            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
                        }
                        CartItem item = new CartItem();
                        item.setCartItemId(new ObjectId());
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

        // Tìm cartItem có cùng itemId và note
        Optional<CartItem> existingItemOpt = cart.getCartItems().stream()
                .filter(ci -> ci.getItemId().equals(request.getItemId())
                        && Objects.equals(ci.getNote(), request.getNote()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            // Nếu có thì cộng dồn số lượng
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
        } else {
            validationUtil.validateMenuItem(request.getItemId());
            if (request.getQuantity() <= 0) {
                throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
            }
            // Nếu không thì thêm mới (cần set cartItemId riêng)
            CartItem newItem = new CartItem();
            newItem.setCartItemId(new ObjectId());
            newItem.setItemId(request.getItemId());
            newItem.setQuantity(request.getQuantity());
            newItem.setNote(request.getNote());
            newItem.setAddedAt(new Date());
            cart.getCartItems().add(newItem);
        }

        cart.setUpdatedAt(new Date());

        cart = cartRepository.save(cart);

        return CartResponse.fromEntity(cart);
    }

    @Override
    public CartResponse updateItemInCart(ObjectId cartId, ObjectId cartItemId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findByCartId(cartId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cart phù hợp"));

        CartItem item = cart.getCartItems().stream()
                .filter(ci -> ci.getCartItemId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy CartItem phù hợp"));

        if (request.getQuantity() != null && request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

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
    public CartResponse removeItemFromCart(ObjectId cartId, ObjectId cartItemId) {
        Cart cart = cartRepository.findByCartId(cartId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cart phù hợp"));

        boolean removed = cart.getCartItems().removeIf(ci -> ci.getCartItemId().equals(cartItemId));
        if (!removed) {
            throw new RuntimeException("Không tìm thấy CartItem phù hợp trong cart");
        }

        cart.setUpdatedAt(new Date());
        cart = cartRepository.save(cart);

        return CartResponse.fromEntity(cart);
    }

    @Override
    public CartResponse addItemToRestaurantCart(ObjectId userId, ObjectId restaurantId, CreateCartItemRequest request) {
        // Validate menu item belongs to the restaurant
        validationUtil.validateMenuItem(request.getItemId());
        validationUtil.validateRestaurant(restaurantId);
        
        // TODO: Add validation to check if menuItem belongs to restaurant
        // Can add this later: validateMenuItemBelongsToRestaurant(request.getItemId(), restaurantId);
        
        // Get or create cart for this user and restaurant
        Cart cart = cartRepository.findByUserIdAndRestaurantId(userId, restaurantId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    newCart.setRestaurantId(restaurantId);
                    newCart.setCartItems(new java.util.ArrayList<>());
                    newCart.setCreatedAt(new Date());
                    newCart.setUpdatedAt(new Date());
                    return cartRepository.save(newCart);
                });

        // Check if item already exists in cart with same note
        Optional<CartItem> existingItemOpt = cart.getCartItems().stream()
                .filter(ci -> ci.getItemId().equals(request.getItemId())
                        && Objects.equals(ci.getNote(), request.getNote()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            // Update quantity if item exists
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
        } else {
            // Add new item if not exists
            if (request.getQuantity() <= 0) {
                throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
            }
            
            CartItem newItem = new CartItem();
            newItem.setCartItemId(new ObjectId());
            newItem.setItemId(request.getItemId());
            newItem.setQuantity(request.getQuantity());
            newItem.setNote(request.getNote());
            newItem.setAddedAt(new Date());
            cart.getCartItems().add(newItem);
        }

        cart.setUpdatedAt(new Date());
        cart = cartRepository.save(cart);

        return CartResponse.fromEntity(cart);
    }

    @Override
    public void clearUserCarts(ObjectId userId) {
        // Delete all carts for this user
        List<Cart> userCarts = cartRepository.findByUserId(userId);
        cartRepository.deleteAll(userCarts);
    }
}
