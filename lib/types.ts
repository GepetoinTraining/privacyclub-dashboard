import { 
  Client, 
  Environment, 
  Host, 
  HostShift, 
  Partner, 
  PartnerPayout, 
  Product, 
  PromotionBulletin, 
  Sale, 
  Staff, 
  StaffCommission, 
  Visit ,
  StaffShift,
  Prisma
} from "@prisma/client";

// ---
// 1. SESSION & AUTH TYPES
// ---
export type StaffSession = {
  id: number;
  name: string;
  role: string;
  isLoggedIn: true;
};

// ---
// 2. API RESPONSE TYPES
// ---
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string; // This is the fix for the build error
};

// ---
// 3. STAFF TAB
// ---
export type StaffWithShifts = Staff & {
  shifts: StaffShift[];
};

// ---
// 4. CLIENTS TAB
// ---
export type ClientWithVisits = Client & {
  visits: Visit[];
  _count: {
    visits: number;
  };
};

export type ClientDetails = Client & {
  visits: (Visit & {
    sales: (Sale & { product: Product })[];
  })[];
  _count: {
    visits: number;
  };
};

// ---
// 5. HOSTESSES TAB
// ---
export type HostessWithShifts = Host & {
  shifts: HostShift[];
};

// ---
// 6. PROMOTIONS TAB
// ---
export type PromotionWithProduct = PromotionBulletin & {
  product: Product | null;
};

// ---
// 7. INVENTORY (BAR) TAB
// ---
export type AggregatedStock = {
  inventoryItemId: number;
  name: string;
  smallestUnit: string;
  totalStock: number;
  reorderThreshold: number | null;
};

// Live Data (for POS & Live Map)
// ---

// FIX 1: This is the new, correct definition for LiveClient
// It matches the object you are creating in app/api/live/route.ts
export type LiveClient = {
  visitId: number;
  clientId: number;
  name: string;
  consumableCreditRemaining: string | number; // Expect string or number for JSON
};

export type LiveHostess = {
  shiftId: number;
  hostId: number;
  stageName: string;
};

export type LiveData = {
  clients: LiveClient[];
  hostesses: LiveHostess[];
  products: Product[];
};

// ---
// 9. FINANCIALS TAB
// ---
export type StaffPayout = StaffCommission & {
  staff: { name: string };
  relatedSale: { id: number } | null;
  relatedClient: { name: string | null } | null;
};

export type PartnerPayoutItem = PartnerPayout & {
  partner: { companyName: string };
  sale: { id: number; priceAtSale: number };
};

export type HostessPayout = {
  hostId: number;
  stageName: string;
  totalUnpaidCommissions: number | String;
};

export type FinancialsData = {
  staffPayouts: StaffPayout[];
  staffCommissions: StaffPayout[];
  partnerPayouts: PartnerPayoutItem[];
  hostessPayouts: HostessPayout[];
};

// ---
// Reports
// ---
export type ReportData = {
  kpis: {
    totalRevenue: number;
    totalSales: number;
    avgSaleValue: number;
    newClients: number;
  };
  salesOverTime: {
    date: string;
    Revenue: number;
  }[];
  hostessLeaderboard: {
    name: string;
    Sales: number;
  }[];
  productLeaderboard: {
    name: string;
    Sales: number;
  }[];
};



// ---
// QR / Client Token
// ---
export type QrTokenPayload = {
  token: string;
  qrCodeUrl: string;
};