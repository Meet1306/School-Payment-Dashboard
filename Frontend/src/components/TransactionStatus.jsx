import { useState } from "react";
import API from "../services/api";

function TransactionStatus() {
  const [transactionId, setTransactionId] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/transactions/transaction-status/${transactionId}`);
      setTransaction(res.data);
    } catch (err) {
      console.error(err);
      setError("Transaction not found");
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'success') return 'bg-green-100 text-green-800';
    if (statusLower === 'failed') return 'bg-red-100 text-red-800';
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : 'Not available';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Check Transaction Status</h1>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Transaction ID (e.g. 680e4c80cc88d6c1c9282121)"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <button
              onClick={checkStatus}
              disabled={!transactionId || loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-blue-400 min-w-[140px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </span>
              ) : (
                'Check Status'
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {error && (
          <div className="p-6 bg-red-50 border-b border-red-100">
            <div className="text-red-600 font-medium">{error}</div>
          </div>
        )}

        {transaction && (
          <div className="divide-y divide-gray-200">
            {/* Transaction Overview */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Transaction #{transaction.collect_id}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(transaction.payment_time)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">₹{transaction.transaction_amount}</div>
                  <div className="text-sm text-gray-500">of ₹{transaction.order_amount}</div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Payment Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Payment Mode</p>
                    <p className="font-medium">{transaction.payment_mode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gateway Reference</p>
                    <p className="font-medium">{transaction.payment_details}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Transaction Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">{transaction._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Processed At</p>
                    <p className="font-medium">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            {transaction.error_message && (
              <div className="bg-red-50 p-6">
                <h3 className="text-md font-medium text-red-700 mb-2">Error Details</h3>
                <p className="text-red-600">{transaction.error_message}</p>
              </div>
            )}

            {transaction.payment_message && (
              <div className="bg-green-50 p-6">
                <h3 className="text-md font-medium text-green-700 mb-2">Payment Message</h3>
                <p className="text-green-600">{transaction.payment_message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionStatus;