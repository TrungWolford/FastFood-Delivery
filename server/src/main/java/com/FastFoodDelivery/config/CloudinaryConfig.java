package com.FastFoodDelivery.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cloudinary Configuration
 * Configures Cloudinary service for image upload and management
 */
@Configuration
@Slf4j
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Value("${cloudinary.secure:true}")
    private boolean secure;

    /**
     * Creates and configures Cloudinary bean
     * 
     * @return Configured Cloudinary instance
     */
    @Bean
    public Cloudinary cloudinary() {
        log.info("=== Initializing Cloudinary ===");
        log.info("Cloud Name: {}", cloudName);
        log.info("API Key: {}...", apiKey != null && apiKey.length() > 4 ? apiKey.substring(0, 4) + "***" : "null");
        log.info("Secure: {}", secure);
        
        if (cloudName == null || cloudName.isEmpty() || 
            apiKey == null || apiKey.isEmpty() || 
            apiSecret == null || apiSecret.isEmpty()) {
            log.error("Cloudinary credentials are missing or incomplete!");
            throw new RuntimeException("Cloudinary credentials not properly configured");
        }
        
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", secure
        ));
    }
}
