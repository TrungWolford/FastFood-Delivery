import axiosInstance from '../libs/axios';
import { API } from '../config/constants';

export interface CreateVNPayPaymentRequest {
  orderId: string;
  amount: number;
  method: string; // "VNPay"
}

export interface VNPayPaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    paymentUrl: string;
    paymentId: string;
  };
}

export const vnpayService = {
  /**
   * Tạo payment và lấy VNPay payment URL
   */
  createPayment: async (request: CreateVNPayPaymentRequest): Promise<VNPayPaymentResponse> => {
    try {
      const response = await axiosInstance.post('/payments/create', {
        orderId: request.orderId,
        amount: request.amount,
        method: request.method,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tạo thanh toán VNPay',
      };
    }
  },
};
