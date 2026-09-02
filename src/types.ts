export type UserRole = 'admin' | 'reseller' | 'public';

export interface RolesConfig {
  adminEmails: string[];
  resellerEmails: string[];
  resellerDiscountPercentage: number; // e.g. 50
  updatedAt?: number;
}

export interface ToolItem {
  id: string;
  categoryId: number;
  number: number;
  title: string;
  domain: string;
  url: string;
  description?: string;
  badge?: string;
  priceRp: number;
  mayarPaymentUrl?: string;
}

export interface ToolCategory {
  id: number;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  packagePriceRp: number;
  tools: ToolItem[];
  mayarPaymentUrl?: string;
}

export interface UserFavorite {
  toolId: string;
  addedAt: number;
}

export interface UserPurchase {
  id: string;
  userId?: string;
  userEmail?: string;
  itemId: string; // e.g. 'tool:art-1', 'category:1'
  itemType: 'tool' | 'category' | 'all_access';
  itemTitle: string;
  amountPaid: number;
  orderId?: string;
  purchasedAt: number;
  quotaGranted?: number; // default 1 for single generation
  quotaRemaining?: number;
  paymentType?: 'qris' | 'bank_transfer' | 'gopay' | 'shopeepay' | 'echannel' | 'credit_card' | 'loyalty_reward' | 'mayar' | 'demo';
  method: 'midtrans_snap' | 'midtrans_qris' | 'midtrans_va' | 'midtrans_webhook' | 'loyalty_reward_3x' | 'mayar' | 'demo';
  vaNumber?: string;
  bank?: string;
  status?: string;
}

export interface UserQuotas {
  [itemId: string]: number; // itemId -> remaining generations count (e.g. 'tool:art-1': 1)
}

export const RESELLER_MAX_FREE_TRIALS = 3;

export interface ResellerTrials {
  [toolId: string]: number; // count of used trials for each tool (0, 1, 2, 3)
}

export interface UserLoyalty {
  purchaseCount: number; // Current stamp count towards next reward (0, 1, 2)
  totalPurchases?: number; // Total all-time paid purchases
  freeRewardsAvailable: number; // Number of free 1x item claim rewards available to redeem
  totalFreeEarned: number; // Total all-time free rewards earned
  totalFreeClaimed: number; // Total all-time free rewards redeemed
  lastRewardedAt?: number;
}

export const defaultLoyalty: UserLoyalty = {
  purchaseCount: 0,
  totalPurchases: 0,
  freeRewardsAvailable: 0,
  totalFreeEarned: 0,
  totalFreeClaimed: 0
};

export interface CustomPricesConfig {
  itemPrices: { [toolId: string]: number }; // toolId -> priceRp
  categoryPrices: { [categoryId: number]: number }; // categoryId -> priceRp
  allAccessPriceRp: number;
  resellerDiscountPercentage: number;
  updatedAt?: number;
  updatedBy?: string;
}

export interface UserDocumentItem {
  id: string;
  userId: string;
  userEmail?: string;
  toolId: string;
  toolTitle: string;
  categoryTitle: string;
  title: string;
  abstractSnippet?: string;
  content: string;
  wordCount?: number;
  fileType: 'docx' | 'pdf' | 'txt' | 'latex';
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface PaymentConfig {
  merchantName: string;
  midtransClientKey: string;
  midtransServerKey?: string;
  isProduction: boolean;
  allAccessPriceRp: number;
}
