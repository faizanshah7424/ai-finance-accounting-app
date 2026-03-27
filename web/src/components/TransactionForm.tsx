"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { getApiUrl } from "@/lib/api";

interface TransactionFormData {
  description: string;
  amount: string;
  date: string;
  type: "income" | "expense";
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    description: string;
    amount: number;
    date: string;
    type: string;
    category: string;
    createdAt: string;
    updatedAt: string;
  };
  analysis?: {
    predictedCategory: string;
    confidence: number;
    isAnomaly: boolean;
    anomalySeverity: "low" | "medium" | "high";
  };
}

interface TransactionFormProps {
  onTransactionAdded?: () => void;
}

export default function TransactionForm({ onTransactionAdded }: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "expense",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const requestData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: formData.type,
      };

      if (isNaN(requestData.amount) || requestData.amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      const response = await axios.post<ApiResponse>(
        getApiUrl("/api/transactions"),
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      setResult(response.data);
      setFormData({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        type: "expense",
      });

      // Notify parent component to refresh data
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || err.response?.data?.error || "Failed to add transaction";
        setError(message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setFormData({
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      type: "expense",
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return "from-emerald-500 to-green-500";
    if (confidence >= 0.4) return "from-amber-500 to-yellow-500";
    return "from-red-500 to-rose-500";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type - Segmented Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl border border-gray-200 shadow-inner">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "expense" })}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ease-out ${
                formData.type === "expense"
                  ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/40 scale-[1.02]"
                  : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "income" })}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ease-out ${
                formData.type === "income"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/40 scale-[1.02]"
                  : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              Income
            </button>
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={formData.type === "income" ? "💼 Salary, Freelance, Bonus..." : "🛒 Shopping, Food, Transport..."}
              required
              disabled={loading}
              className="group w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 text-sm text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
            />
          </div>
        </div>

        {/* Amount and Date Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Amount Field */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400 transition-colors group-focus-within:text-blue-500">
                $
              </span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
                min="0.01"
                step="0.01"
                disabled={loading}
                className="group w-full pl-9 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 text-base font-semibold text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
              />
            </div>
          </div>

          {/* Date Field */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                disabled={loading}
                className="group w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300 ease-out">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 mb-1">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Result */}
        {result && result.analysis && (
          <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xl animate-in slide-in-from-bottom-4 duration-500 ease-out">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Analysis Result</h3>
                  <p className="text-xs text-white/90 font-medium">Powered by Machine Learning</p>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 space-y-5">
              {/* Category Badge */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-100 rounded-xl">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Predicted Category</p>
                    <p className="text-sm text-blue-900 font-medium">Based on transaction description</p>
                  </div>
                </div>
                <span className="text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                  {result.analysis.predictedCategory}
                </span>
              </div>

              {/* Confidence Progress Bar */}
              <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-purple-100 rounded-xl">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">AI Confidence</p>
                      <p className="text-sm text-gray-600 font-medium">How certain is the AI</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
                    {(result.analysis.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getConfidenceColor(result.analysis.confidence)} transition-all duration-700 ease-out shadow-lg`}
                    style={{ width: `${result.analysis.confidence * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between mt-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>

              {/* Anomaly Detection */}
              {result.analysis.isAnomaly ? (
                /* Anomaly Alert - Red */
                <div className="p-5 bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border-2 border-red-200 rounded-xl hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-2">
                        <p className="text-base font-bold text-red-800">⚠️ Anomaly Detected</p>
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg border-2 ${
                          result.analysis.anomalySeverity === "high" ? "bg-red-500 text-white border-red-600" :
                          result.analysis.anomalySeverity === "medium" ? "bg-amber-500 text-white border-amber-600" :
                          "bg-blue-500 text-white border-blue-600"
                        }`}>
                          {result.analysis.anomalySeverity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-red-700 font-medium leading-relaxed mb-3">
                        This transaction appears unusual and may require your attention before proceeding.
                      </p>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Severity Level:</span>
                        <div className="flex-1 h-3 bg-red-100 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full bg-gradient-to-r ${
                            result.analysis.anomalySeverity === "high" ? "from-red-500 to-rose-500" :
                            result.analysis.anomalySeverity === "medium" ? "from-amber-500 to-orange-500" :
                            "from-blue-500 to-indigo-500"
                          }`} style={{ width: result.analysis.anomalySeverity === "high" ? "100%" : result.analysis.anomalySeverity === "medium" ? "66%" : "33%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal - Green Badge */
                <div className="p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-xl hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-xl flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-green-800">✓ Transaction Normal</p>
                      <p className="text-sm text-green-700 font-medium">This transaction follows expected patterns.</p>
                    </div>
                    <span className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/30">
                      Normal
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-white transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed ${
            formData.type === "expense"
              ? "bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 hover:from-red-600 hover:via-rose-600 hover:to-pink-700 shadow-red-500/40"
              : "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 shadow-green-500/40"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add {formData.type === "income" ? "Income" : "Expense"}
            </span>
          )}
        </button>

        {/* Reset Button */}
        {result && (
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl font-semibold text-gray-700 transition-all duration-300 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Another Transaction
          </button>
        )}
      </form>
    </div>
  );
}
