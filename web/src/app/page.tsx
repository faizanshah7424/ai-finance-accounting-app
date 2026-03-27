import TransactionForm from "@/components/TransactionForm";

export default function AddTransactionPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Add Transaction</h1>
          <p className="text-sm text-gray-500 mt-1">
            Record your income or expenses with AI-powered categorization
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <TransactionForm />
        </div>
      </div>
    </main>
  );
}
