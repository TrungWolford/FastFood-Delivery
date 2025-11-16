import axiosInstance from '../libs/axios';
import { API, CONFIG } from '../config/constants';

export interface UploadImageResponse {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export const uploadService = {
  /**
   * Upload an image file to Cloudinary
   * @param file The image file to upload
   * @param folder Optional folder name in Cloudinary (e.g., "cccd", "restaurant", "menu")
   * @returns Promise with upload result
   */
  uploadImage: async (
    file: File,
    folder?: string
  ): Promise<{ success: boolean; data?: UploadImageResponse; message?: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await axiosInstance.post(`${CONFIG.API_GATEWAY}${API.UPLOAD_IMAGE}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Backend response structure:
      // { success: true, message: "...", data: { url, publicId, format, ... } }
      console.log('📤 Upload response:', response.data);

      // Extract nested data from backend response
      const backendData = response.data.data || response.data;
      
      return {
        success: response.data.success !== false,
        data: backendData, // ✅ Now data directly contains { url, publicId, ... }
        message: response.data.message || 'Upload ảnh thành công'
      };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể upload ảnh'
      };
    }
  },

  /**
   * Upload multiple images
   * @param files Array of image files to upload
   * @param folder Optional folder name in Cloudinary
   * @returns Promise with array of upload results
   */
  uploadMultipleImages: async (
    files: File[],
    folder?: string
  ): Promise<{
    success: boolean;
    data?: UploadImageResponse[];
    failedCount?: number;
    message?: string;
  }> => {
    try {
      const uploadPromises = files.map(file => uploadService.uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);

      const successResults = results.filter(r => r.success && r.data);
      const failedCount = results.length - successResults.length;

      if (successResults.length === 0) {
        return {
          success: false,
          message: 'Không thể upload bất kỳ ảnh nào'
        };
      }

      return {
        success: true,
        data: successResults.map(r => r.data!),
        failedCount,
        message:
          failedCount > 0
            ? `Upload thành công ${successResults.length}/${results.length} ảnh`
            : 'Upload tất cả ảnh thành công'
      };
    } catch (error: any) {
      console.error('Error uploading multiple images:', error);
      return {
        success: false,
        message: 'Không thể upload ảnh'
      };
    }
  },

  /**
   * Convert base64 data URL to File object
   * @param dataUrl Base64 data URL string
   * @param filename Filename for the file
   * @returns File object
   */
  dataUrlToFile: (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  },

  /**
   * Get file information from Cloudinary
   * @param publicId Public ID of the file in Cloudinary
   */
  getFileInfo: async (
    publicId: string
  ): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await axiosInstance.get(API.GET_FILE_INFO, {
        params: { publicId }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error getting file info:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy thông tin file'
      };
    }
  },

  /**
   * Delete a file from Cloudinary
   * @param publicId Public ID of the file to delete
   */
  deleteFile: async (
    publicId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await axiosInstance.delete(`${API.DELETE_FILE}/${publicId}`);
      return {
        success: true,
        message: 'Xóa file thành công'
      };
    } catch (error: any) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể xóa file'
      };
    }
  }
};
