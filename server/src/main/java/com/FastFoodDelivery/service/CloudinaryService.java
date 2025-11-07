package com.FastFoodDelivery.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    public Map<String, Object> uploadFile(MultipartFile file, String folder) throws IOException;
    public Map<String, Object> uploadImage(MultipartFile file, String folder, Integer width, Integer height) throws IOException;
    public Map<String, Object> deleteFile(String publicId) throws IOException;
    public String generateOptimizedUrl(String publicId, Integer width, Integer height, String quality) throws IOException;
    public Map<String, Object> getFileInfo(String publicId) throws IOException;

}
