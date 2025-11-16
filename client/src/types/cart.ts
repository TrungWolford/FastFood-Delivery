export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  productPrice: number;
  totalPrice: number;
  quantity: number;
  images?: string[]; // List of image URLs from backend
  discount?: number;
}

export interface Cart {
  cartId: string;
  accountId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  accountId: string;
}

export interface UpdateCartItemRequest {
  cartId: string;
  cartItemId: string;
  quantity: number;
}

// Multi-cart request for menu items
export interface AddMenuItemToCartRequest {
  itemId: string;
  quantity: number;
  note?: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data?: Cart | CartItem[] | CartItem;
  error?: string;
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
  data?: {
    cartItemId: string;
    productId: string;
    quantity: number;
  };
  error?: string;
}
