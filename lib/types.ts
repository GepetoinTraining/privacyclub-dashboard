// ... (existing FinancialsData types) ...

// ---
// New Types for Reports Page
// ---

export type ReportStat = {
  title: string;
  value: string;
  diff: number;
};

export type SalesDataPoint = {
  date: string;
  sales: number;
};

export type HostessLeaderboardItem = {
  hostId: number;
  stageName: string;
  totalSales: number;
};

export type ProductLeaderboardItem = {
  productId: number;
  name: string;
  totalSold: number;
};

export type ReportData = {
  stats: ReportStat[];
  salesByDay: SalesDataPoint[];
  topHostesses: HostessLeaderboardItem[];
  topProducts: ProductLeaderboardItem[];
};

