// Service để lấy danh sách tỉnh thành Việt Nam từ API v2 (sau sáp nhập 07/2025)
// API Documentation: https://provinces.open-api.vn/api/v2/redoc
// Sau sáp nhập hành chính 2025: Chỉ còn Thành phố -> Phường (không còn Quận/Huyện)
const PROVINCES_API = 'https://provinces.open-api.vn/api/v2';

export interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  wards?: Ward[]; // Phường trực thuộc thành phố
  short_codename?: string; // v2 có thêm field này
}

export interface Ward {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  short_codename?: string; // v2 có thêm field này
}

// Giữ lại District interface cho backward compatibility (v1)
export interface District {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
  wards?: Ward[];
}

export const vietnamProvinceService = {
  // Lấy tất cả tỉnh/thành phố (v2)
  getAllProvinces: async (): Promise<Province[]> => {
    try {
      const response = await fetch(`${PROVINCES_API}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching provinces:', error);
      return [];
    }
  },

  // Lấy chi tiết tỉnh/thành phố kèm danh sách phường (depth=2)
  // v2: Dùng query parameter trên root endpoint với filter
  getProvinceWithWards: async (provinceCode: number): Promise<Province | null> => {
    try {
      // v2: Lấy tất cả provinces với depth=2, sau đó filter
      const response = await fetch(`${PROVINCES_API}/?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch province details');
      }
      const provinces: Province[] = await response.json();
      const province = provinces.find(p => p.code === provinceCode);
      return province || null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching province with wards:', error);
      return null;
    }
  },

  // Backward compatibility: getProvinceWithDistricts -> getProvinceWithWards
  getProvinceWithDistricts: async (provinceCode: number): Promise<Province | null> => {
    return vietnamProvinceService.getProvinceWithWards(provinceCode);
  },

  // Lấy chi tiết phường (nếu cần) - v2
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getWardDetails: async (wardCode: number): Promise<Ward | null> => {
    try {
      // v2: Không có endpoint riêng cho ward, phải lấy qua province
      // Tạm thời return null, nếu cần có thể implement bằng cách search
      // eslint-disable-next-line no-console
      console.warn('getWardDetails not fully implemented in v2');
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching ward details:', error);
      return null;
    }
  },

  // Deprecated: getDistrictWithWards (giữ lại cho compatibility với v1)
  // v2 không còn district nên method này không hoạt động
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDistrictWithWards: async (districtCode: number): Promise<District | null> => {
    // eslint-disable-next-line no-console
    console.warn('getDistrictWithWards is deprecated - v2 API does not have districts');
    return null;
  },

  // Lấy tên địa điểm từ code (để hiển thị) - v2
  getLocationName: async (type: 'p' | 'd' | 'w', code: number): Promise<string> => {
    try {
      if (type === 'd') {
        // eslint-disable-next-line no-console
        console.warn('District type not supported in v2');
        return '';
      }
      
      // v2: Phải lấy từ danh sách vì không có endpoint riêng
      if (type === 'p') {
        const provinces = await vietnamProvinceService.getAllProvinces();
        const province = provinces.find(p => p.code === code);
        return province?.name || '';
      }
      
      // Ward: cần lấy toàn bộ data với depth=2
      return '';
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting location name:', error);
      return '';
    }
  },
};
