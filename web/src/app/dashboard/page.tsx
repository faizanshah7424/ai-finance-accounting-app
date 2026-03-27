"use client";

import { useState, useEffect, useMemo } from "react";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
  metadata?: {
    isAnomaly: boolean;
    anomalySeverity: "low" | "medium" | "high";
  };
}

interface ApiResponse {
  success: boolean;
  data: Transaction[];
  total?: number;
  summary?: {
    incomeTotal: number;
    expenseTotal: number;
    netTotal: number;
  };
}

interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  anomalyCount: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

const CATEGORY_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#6366F1", // indigo
];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
    anomalyCount: 0,
  });
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ApiResponse>(
        getApiUrl("/api/transactions"),
        {
          timeout: 15000,
        }
      );

      const data = response.data.data || [];
      setTransactions(data);

      // Use summary from API if available, otherwise calculate
      const incomeTotal = response.data.summary?.incomeTotal || data
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenseTotal = response.data.summary?.expenseTotal || data
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const anomalyCount = data.filter((t) => t.metadata?.isAnomaly).length;

      setStats({
        totalIncome: incomeTotal,
        totalExpense: expenseTotal,
        balance: incomeTotal - expenseTotal,
        transactionCount: data.length,
        anomalyCount,
      });

      // Process category data for pie chart
      const categoryMap = new Map<string, number>();
      data
        .filter((t) => t.type === "expense")
        .forEach((t) => {
          categoryMap.set(
            t.category,
            (categoryMap.get(t.category) || 0) + t.amount
          );
        });

      const categoryChartData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([name, value], index) => ({
          name,
          value: parseFloat(value.toFixed(2)),
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        }))
        .sort((a, b) => b.value - a.value);

      setCategoryData(categoryChartData);

      // Process monthly data for bar chart
      const monthlyMap = new Map<
        string,
        { income: number; expense: number; month: string }
      >();

      data.forEach((t) => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        const monthName = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { income: 0, expense: 0, month: monthName });
        }

        const entry = monthlyMap.get(monthKey)!;
        if (t.type === "income") {
          entry.income += t.amount;
        } else {
          entry.expense += t.amount;
        }
      });

      const monthlyChartData: MonthlyData[] = Array.from(monthlyMap.entries())
        .map(([key, data]) => ({
          month: data.month,
          income: parseFloat(data.income.toFixed(2)),
          expense: parseFloat(data.expense.toFixed(2)),
        }))
        .sort((a, b) => {
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const [aMonth, aYear] = a.month.split(" ");
          const [bMonth, bYear] = b.month.split(" ");
          const aIndex = months.indexOf(aMonth);
          const bIndex = months.indexOf(bMonth);
          if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
          return aIndex - bIndex;
        });

      setMonthlyData(monthlyChartData);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const recentTransactions = transactions.slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {data.name}
          </p>
          <p className="text-sm font-bold text-blue-600">
            {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <svg
              className="animate-spin w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTransactions}
            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-100 to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <p className="text-gray-500 text-sm">
              Overview of your financial activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Transaction
            </Link>
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.058M5.058 17.947A9.004 9.004 0 013.09 12c0-4.97 4.03-9 9-9a8.997 8.997 0 018.063 5.05M19 14a5 5 0 01-5 5 5 5 0 01-4.742-3.343M15 19a9.004 9.004 0 01-7.947-5.05" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance */}
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span
                className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                  stats.balance >= 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {stats.balance >= 0 ? "↑" : "↓"}{" "}
                {((stats.balance / (stats.totalIncome || 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-500 font-semibold mb-1">
              Total Balance
            </p>
            <p
              className={`text-3xl font-bold ${
                stats.balance >= 0 ? "text-gray-900" : "text-red-600"
              }`}
            >
              {formatCurrency(stats.balance)}
            </p>
          </div>

          {/* Total Income */}
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30 group-hover:shadow-xl group-hover:shadow-green-500/40 transition-all duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                +{stats.transactionCount} txns
              </span>
            </div>
            <p className="text-sm text-gray-500 font-semibold mb-1">
              Total Income
            </p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.totalIncome)}
            </p>
          </div>

          {/* Total Expense */}
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-400 to-rose-600 rounded-xl shadow-lg shadow-red-500/30 group-hover:shadow-xl group-hover:shadow-red-500/40 transition-all duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-700">
                -{stats.transactionCount} txns
              </span>
            </div>
            <p className="text-sm text-gray-500 font-semibold mb-1">
              Total Expenses
            </p>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(stats.totalExpense)}
            </p>
          </div>

          {/* Anomalies */}
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl shadow-lg shadow-amber-500/30 group-hover:shadow-xl group-hover:shadow-amber-500/40 transition-all duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <span
                className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                  stats.anomalyCount > 0
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {stats.anomalyCount > 0 ? "!" : "✓"}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-semibold mb-1">
              Anomalies Detected
            </p>
            <p className="text-3xl font-bold text-amber-600">
              {stats.anomalyCount}
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart - Category-wise Expenses */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-gray-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Spending by Category</h3>
                  <p className="text-xs text-gray-500 font-medium">Where your money goes</p>
                </div>
              </div>
              {categoryData.length > 0 && (
                <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                    {categoryData.length} Categories
                  </p>
                </div>
              )}
            </div>

            {categoryData.length === 0 ? (
              <div className="h-72 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-4">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-bold mb-1">No Expense Data Yet</p>
                  <p className="text-sm text-gray-500">Add transactions to see your spending breakdown</p>
                </div>
              </div>
            ) : (
              <div className="h-72 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={3}
                      stroke="#fff"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="transition-all duration-300 hover:opacity-80" />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={50}
                      content={({ payload }) => (
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                          {payload?.map((entry: any, index: number) => (
                            <div
                              key={`legend-${index}`}
                              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                            >
                              <div
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(categoryData.reduce((sum, cat) => sum + cat.value, 0))}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Category Details */}
            {categoryData.length > 0 && (
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">Category Breakdown</h4>
                <div className="space-y-3">
                  {categoryData.map((category, index) => {
                    const percentage = (category.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100;
                    return (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm font-semibold text-gray-700">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(category.value)}</span>
                            <span className="text-xs text-gray-500 font-medium ml-2">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: category.color 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bar Chart - Monthly Overview */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-gray-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/30">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Monthly Overview</h3>
                  <p className="text-xs text-gray-500 font-medium">Income vs Expenses</p>
                </div>
              </div>
              {monthlyData.length > 0 && (
                <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wide">
                    {monthlyData.length} Months
                  </p>
                </div>
              )}
            </div>

            {monthlyData.length === 0 ? (
              <div className="h-72 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-lg mb-4">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-bold mb-1">No Monthly Data Yet</p>
                  <p className="text-sm text-gray-500">Add transactions to see your monthly trends</p>
                </div>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fontWeight: 600 }}
                      angle={-10}
                      textAnchor="end"
                      height={70}
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontWeight: 600 }}
                      tickFormatter={(value) => `$${value}`}
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                      width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={40}
                      iconType="circle"
                      content={({ payload }) => (
                        <div className="flex justify-center gap-6 mb-2">
                          {payload?.map((entry: any, index: number) => (
                            <div
                              key={`legend-${index}`}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl"
                            >
                              <div
                                className="w-4 h-4 rounded-md shadow-sm"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm font-bold text-gray-700">
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="url(#incomeGradient)"
                      radius={[8, 8, 0, 0]}
                      barSize={32}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expense"
                      fill="url(#expenseGradient)"
                      radius={[8, 8, 0, 0]}
                      barSize={32}
                    />
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                        <stop offset="100%" stopColor="#DC2626" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Monthly Summary Stats */}
            {monthlyData.length > 0 && (
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">Performance Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs font-bold text-green-700 uppercase">Best Month</span>
                    </div>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(Math.max(...monthlyData.map(m => m.income)))}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-4 border-2 border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-xs font-bold text-red-700 uppercase">Highest Spend</span>
                    </div>
                    <p className="text-lg font-bold text-red-700">
                      {formatCurrency(Math.max(...monthlyData.map(m => m.expense)))}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-bold text-blue-700 uppercase">Avg. Monthly</span>
                    </div>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(monthlyData.reduce((sum, m) => sum + (m.income - m.expense), 0) / monthlyData.length)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Transactions
              </h2>
              <Link
                href="/transactions"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View All
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-2xl mb-3">
                  <svg
                    className="w-7 h-7 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-1">
                  No transactions yet
                </p>
                <p className="text-sm text-gray-500">
                  Add your first transaction to get started
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          transaction.type === "income"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 11l5-5m0 0l5 5m-5-5v12"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 13l-5 5m0 0l-5-5m5 5V6"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 capitalize">
                            {transaction.category}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {transaction.metadata?.isAnomaly && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions & Summary */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all group"
                >
                  <div className="p-2.5 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Add Transaction
                    </p>
                    <p className="text-xs text-gray-500">Record new entry</p>
                  </div>
                </Link>

                <Link
                  href="/transactions"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all group"
                >
                  <div className="p-2.5 bg-gray-500 rounded-lg group-hover:bg-gray-600 transition-colors">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View All</p>
                    <p className="text-xs text-gray-500">
                      Browse transactions
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-indigo-100">Income</span>
                  <span className="font-semibold">
                    {formatCurrency(stats.totalIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-indigo-100">Expenses</span>
                  <span className="font-semibold">
                    {formatCurrency(stats.totalExpense)}
                  </span>
                </div>
                <div className="pt-3 mt-3 border-t border-white/20 flex items-center justify-between">
                  <span className="text-sm text-indigo-100">Net</span>
                  <span className="font-bold text-xl">
                    {formatCurrency(stats.balance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            AI Finance & Accounting
          </p>
        </div>
      </div>
    </div>
  );
}
