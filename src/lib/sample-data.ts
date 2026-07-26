import type { ChartData } from "./schema";

// Default demo data — works for most chart types
export const DEFAULT_SAMPLE: ChartData = {
  title: "Monthly Revenue vs Expenses",
  description: "Company financial overview for Q1–Q4",
  xKey: "month",
  series: [
    { key: "revenue",  label: "Revenue",  color: "#6366f1" },
    { key: "expenses", label: "Expenses", color: "#f43f5e" },
    { key: "profit",   label: "Profit",   color: "#22c55e" },
  ],
  data: [
    { month: "Jan", revenue: 42000, expenses: 28000, profit: 14000 },
    { month: "Feb", revenue: 53000, expenses: 31000, profit: 22000 },
    { month: "Mar", revenue: 61000, expenses: 35000, profit: 26000 },
    { month: "Apr", revenue: 47000, expenses: 29000, profit: 18000 },
    { month: "May", revenue: 68000, expenses: 38000, profit: 30000 },
    { month: "Jun", revenue: 74000, expenses: 40000, profit: 34000 },
    { month: "Jul", revenue: 82000, expenses: 44000, profit: 38000 },
    { month: "Aug", revenue: 79000, expenses: 42000, profit: 37000 },
    { month: "Sep", revenue: 91000, expenses: 48000, profit: 43000 },
    { month: "Oct", revenue: 88000, expenses: 46000, profit: 42000 },
    { month: "Nov", revenue: 95000, expenses: 51000, profit: 44000 },
    { month: "Dec", revenue: 112000, expenses: 58000, profit: 54000 },
  ],
};

// Pie/Donut — single series, name+value style (xKey = name, series[0].key = value)
export const PIE_SAMPLE: ChartData = {
  title: "Market Share by Product",
  description: "Q4 product revenue distribution",
  xKey: "product",
  series: [{ key: "share", label: "Market Share" }],
  data: [
    { product: "Pro Plan",      share: 38 },
    { product: "Starter Plan",  share: 24 },
    { product: "Enterprise",    share: 19 },
    { product: "Add-ons",       share: 12 },
    { product: "Consulting",    share: 7  },
  ],
};

// Radar — scores per category
export const RADAR_SAMPLE: ChartData = {
  title: "Team Performance Radar",
  description: "Quarterly skill assessment scores",
  xKey: "skill",
  series: [
    { key: "teamA", label: "Team A", color: "#6366f1" },
    { key: "teamB", label: "Team B", color: "#f43f5e" },
  ],
  data: [
    { skill: "Communication", teamA: 85, teamB: 72 },
    { skill: "Technical",     teamA: 90, teamB: 88 },
    { skill: "Leadership",    teamA: 70, teamB: 80 },
    { skill: "Creativity",    teamA: 78, teamB: 65 },
    { skill: "Delivery",      teamA: 92, teamB: 85 },
    { skill: "Collaboration", teamA: 88, teamB: 90 },
  ],
};

// Scatter — x/y numeric data
export const SCATTER_SAMPLE: ChartData = {
  title: "Ad Spend vs Conversions",
  description: "Campaign performance scatter",
  xKey: "spend",
  series: [
    { key: "conversions", label: "Conversions", color: "#06b6d4" },
  ],
  data: [
    { spend: 1200, conversions: 45 },
    { spend: 2400, conversions: 82 },
    { spend: 800,  conversions: 28 },
    { spend: 3600, conversions: 120 },
    { spend: 1800, conversions: 61 },
    { spend: 4200, conversions: 155 },
    { spend: 600,  conversions: 18 },
    { spend: 2900, conversions: 99 },
    { spend: 5100, conversions: 180 },
    { spend: 1500, conversions: 52 },
  ],
};

// Treemap / Funnel — name + value pairs
export const TREEMAP_SAMPLE: ChartData = {
  title: "Department Budget Allocation",
  description: "Annual budget by department",
  xKey: "dept",
  series: [{ key: "budget", label: "Budget ($K)" }],
  data: [
    { dept: "Engineering",  budget: 850 },
    { dept: "Marketing",    budget: 320 },
    { dept: "Sales",        budget: 410 },
    { dept: "HR",           budget: 180 },
    { dept: "Operations",   budget: 260 },
    { dept: "Finance",      budget: 140 },
    { dept: "Legal",        budget: 90  },
    { dept: "Design",       budget: 150 },
  ],
};

export const FUNNEL_SAMPLE: ChartData = {
  title: "Sales Conversion Funnel",
  description: "Lead to close conversion rates",
  xKey: "stage",
  series: [{ key: "count", label: "Users" }],
  data: [
    { stage: "Visitors",    count: 12000 },
    { stage: "Leads",       count: 4800  },
    { stage: "Qualified",   count: 2100  },
    { stage: "Proposal",    count: 980   },
    { stage: "Negotiation", count: 420   },
    { stage: "Closed",      count: 180   },
  ],
};

// Map from chart family to best demo data
export function getSampleForFamily(family: string): ChartData {
  switch (family) {
    case "pie":     return PIE_SAMPLE;
    case "radar":   return RADAR_SAMPLE;
    case "scatter": return SCATTER_SAMPLE;
    case "treemap": return TREEMAP_SAMPLE;
    case "funnel":  return FUNNEL_SAMPLE;
    default:        return DEFAULT_SAMPLE;
  }
}
