package com.FastFoodDelivery.service.Impl;

import java.util.Date;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import com.FastFoodDelivery.entity.RestaurantDetail;
import com.FastFoodDelivery.repository.RestaurantDetailRepository;
import com.FastFoodDelivery.service.RestaurantDetailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RestaurantDetailServiceImpl implements RestaurantDetailService {
    
    private final RestaurantDetailRepository repository;
    
    @Override
    public RestaurantDetail createRestaurantDetail(ObjectId restaurantId, RestaurantDetail detail) {
        detail.setRestaurantId(restaurantId);
        detail.setCreatedAt(new Date());
        detail.setUpdatedAt(new Date());
        return repository.save(detail);
    }
    
    @Override
    public Optional<RestaurantDetail> getById(ObjectId restaurantDetailId) {
        return repository.findById(restaurantDetailId);
    }
    
    @Override
    public Optional<RestaurantDetail> getByRestaurantId(ObjectId restaurantId) {
        return repository.findByRestaurantId(restaurantId);
    }
    
    @Override
    public RestaurantDetail updateRestaurantDetail(RestaurantDetail detail) {
        detail.setUpdatedAt(new Date());
        return repository.save(detail);
    }
    
    @Override
    public void deleteByRestaurantId(ObjectId restaurantId) {
        Optional<RestaurantDetail> detail = repository.findByRestaurantId(restaurantId);
        detail.ifPresent(repository::delete);
    }
    
    @Override
    public void deleteById(ObjectId restaurantDetailId) {
        repository.deleteById(restaurantDetailId);
    }
    
    @Override
    public boolean existsByRestaurantId(ObjectId restaurantId) {
        return repository.existsByRestaurantId(restaurantId);
    }
}
