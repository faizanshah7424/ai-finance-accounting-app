"use client";

import { useState } from "react";
import TransactionForm from "@/components/TransactionForm";
import Link from "next/link";

export default function AddTransactionPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Add Transaction</h1>
              <p className="text-sm text-gray-500 mt-1">
                Record your income or expenses with AI-powered categorization
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-gray-200 shadow-xl p-8">
          <TransactionForm key={refreshKey} onTransactionAdded={handleTransactionAdded} />
        </div>
      </div>
    </main>
  );
}
