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

// ---
// 8. LIVE DATA & POS TAB
// ---
export type LiveClient = Visit & {
  client: Client;
};

export type LiveHostess = HostShift & {
  host: Host;
};

export type LiveData = {
  liveClients: LiveClient[];
  liveHostesses: LiveHostess[];
  products: Product[];
  environments: Environment[];
};

export type CartItem = Product & {
  quantity: number;
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
// 10. REPORTS TAB
// ---
export type KpiData = {
  totalRevenue: number;
  totalSales: number;
  avgRevenuePerClient: number;
  newClients: number;
};

export type SalesChartData = {
  date: string;
  sales: number;
};

export type HostessLeaderboardItem = {
  hostId: number;
  stageName: string;
  totalCommission: number;
  totalSales: number;
};

export type ProductLeaderboardItem = {
  productId: number;
  name: string;
  totalSold: number;
  totalRevenue: number;
};

export type ReportData = {
  kpis: KpiData;
  salesChart: SalesChartData[];
  hostessLeaderboard: HostessLeaderboardItem[];
  productLeaderboard: ProductLeaderboardItem[];
};

