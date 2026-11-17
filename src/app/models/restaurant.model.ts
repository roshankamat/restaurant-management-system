export type DishCategory = 
  | 'Starters & Kebabs' 
  | 'Main Course (Curries)' 
  | 'Royal Biryani & Rice' 
  | 'Tandoori Breads' 
  | 'Desserts & Mithai' 
  | 'Desi Beverages';

export type SpiceLevel = 'Mild' | 'Medium' | 'Spicy' | 'Desi Teekha';

export interface MenuItem {
  id: string;
  name: string;
  hindiName?: string;
  category: DishCategory;
  price: number;
  description: string;
  isVeg: boolean;
  spiceLevel: SpiceLevel;
  prepTimeMinutes: number;
  available: boolean;
  imageUrl: string;
  isChefSpecial?: boolean;
  isJainFriendly?: boolean;
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLING';
export type TableZone = 'Royal AC Hall' | 'Garden Courtyard' | 'Shahi Cabana';

export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  zone: TableZone;
  status: TableStatus;
  currentOrderId?: string;
  occupiedSince?: string;
  reservation?: {
    customerName: string;
    customerPhone: string;
    guests: number;
    timeSlot: string;
    notes?: string;
  };
}

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID';
export type PaymentMethod = 'UPI' | 'CASH' | 'CARD' | 'NET_BANKING';

export interface OrderItem {
  menuItemId: string;
  name: string;
  hindiName?: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  tableNumber?: number;
  tableId?: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  cgstRate: number; // 2.5%
  cgstAmount: number;
  sgstRate: number; // 2.5%
  sgstAmount: number;
  discountAmount: number;
  discountCode?: string;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  specialInstructions?: string;
}

export type CustomerTier = 'SILVER' | 'GOLD' | 'PLATINUM';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: CustomerTier;
  totalVisits: number;
  totalSpent: number;
  dietaryPreference: 'PURE_VEG' | 'NON_VEG';
  favoriteDish?: string;
  notes?: string;
  lastVisit: string;
  createdAt: string;
}

export interface RestaurantProfile {
  name: string;
  hindiName: string;
  tagline: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  gstin: string;
  fssaiNumber: string;
  currencySymbol: string;
  cgstPercent: number;
  sgstPercent: number;
}

export type AdminRole = 'SUPER_ADMIN' | 'MANAGER' | 'HEAD_CHEF' | 'CASHIER';

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  pin: string;
  fullName: string;
  title: string;
  role: AdminRole;
  avatarInitials: string;
  email: string;
  lastLogin?: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  role: AdminRole | 'SYSTEM';
  action: string;
  timestamp: string;
}


