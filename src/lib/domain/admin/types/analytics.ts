// 📊 System-wide metrics for admin dashboard
export interface SystemMetrics {
  // User Metrics
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;

  // Content Metrics
  totalCardsGenerated: number;
  cardsGeneratedToday: number;
  cardsGeneratedThisWeek: number;
  cardsGeneratedThisMonth: number;
  avgProcessingTime: number;

  // Revenue Metrics
  mrr: number;
  arr: number;
  totalRevenue: number;
  revenueToday: number;
  revenueThisMonth: number;

  // Conversion Metrics
  freeUsers: number;
  proUsers: number;
  teamUsers: number;
  conversionRate: number;
  churnRate: number;
}

export interface DashboardMetrics extends SystemMetrics {
  realtimeData: RealtimeMetric[];
  systemAlerts: SystemAlert[];
}

export interface RealtimeMetric {
  timestamp: Date;
  activeUsers: number;
  cardsGenerated: number;
  revenue: number;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

// 📌 UI types
export interface UISystemMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalCardsGenerated: number;
  cardsGeneratedToday: number;
  cardsGeneratedThisWeek: number;
  cardsGeneratedThisMonth: number;
  avgProcessingTime: number;
  mrr: number;
  arr: number;
  totalRevenue: number;
  revenueToday: number;
  revenueThisMonth: number;
  freeUsers: number;
  proUsers: number;
  teamUsers: number;
  conversionRate: number;
  churnRate: number;
}

export interface UIRealtimeMetric {
  timestamp: string | number;
  activeUsers: number;
  cardsGenerated: number;
  revenue: number;
}

export interface UISystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string | number;
  dismissed: boolean;
}

export interface UIDashboardMetrics extends UISystemMetrics {
  realtimeData: UIRealtimeMetric[];
  systemAlerts: UISystemAlert[];
}

// 📌 Transform functions
export function transformRealtimeMetricToUI(metric: RealtimeMetric): UIRealtimeMetric {
  return {
    timestamp: metric.timestamp.getTime(),
    activeUsers: metric.activeUsers,
    cardsGenerated: metric.cardsGenerated,
    revenue: metric.revenue,
  };
}

export function transformSystemAlertToUI(alert: SystemAlert): UISystemAlert {
  return {
    id: alert.id,
    type: alert.type,
    title: alert.title,
    message: alert.message,
    timestamp: alert.timestamp.getTime(),
    dismissed: alert.dismissed,
  };
}

export function transformDashboardMetricsToUI(metrics: DashboardMetrics): UIDashboardMetrics {
  return {
    totalUsers: metrics.totalUsers,
    activeUsers: metrics.activeUsers,
    newUsersToday: metrics.newUsersToday,
    newUsersThisWeek: metrics.newUsersThisWeek,
    newUsersThisMonth: metrics.newUsersThisMonth,
    totalCardsGenerated: metrics.totalCardsGenerated,
    cardsGeneratedToday: metrics.cardsGeneratedToday,
    cardsGeneratedThisWeek: metrics.cardsGeneratedThisWeek,
    cardsGeneratedThisMonth: metrics.cardsGeneratedThisMonth,
    avgProcessingTime: metrics.avgProcessingTime,
    mrr: metrics.mrr,
    arr: metrics.arr,
    totalRevenue: metrics.totalRevenue,
    revenueToday: metrics.revenueToday,
    revenueThisMonth: metrics.revenueThisMonth,
    freeUsers: metrics.freeUsers,
    proUsers: metrics.proUsers,
    teamUsers: metrics.teamUsers,
    conversionRate: metrics.conversionRate,
    churnRate: metrics.churnRate,
    realtimeData: metrics.realtimeData.map(transformRealtimeMetricToUI),
    systemAlerts: metrics.systemAlerts.map(transformSystemAlertToUI),
  };
}

