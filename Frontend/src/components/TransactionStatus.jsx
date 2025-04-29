import { useState } from "react";
import API from "../services/api";

function TransactionStatus() {
  const [transactionId, setTransactionId] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkStatus = async () => {
    if (!transactionId.trim()) {
      setError("Please enter a transaction ID");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/transactions/transaction-status/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setTransaction(res.data);
    } catch (err) {
      console.error(err);
      setError("Transaction not found or invalid ID");
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      checkStatus();
    }
  };

  const StatusPill = ({ status }) => (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium tracking-wide ${
      status === 'success' ? 'bg-emerald-50 text-emerald-700' :
      status === 'failed' ? 'bg-rose-50 text-rose-700' :
      'bg-amber-50 text-amber-700'
    }`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-8 mb-10">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-light text-gray-900">Payment Status Verification</h1>
            <p className="text-gray-500">Check the status of any transaction using its unique ID</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="transaction-id" className="block text-sm font-medium text-gray-700 mb-1.5">
                Order ID
              </label>
              <div className="relative">
                <input
                  id="transaction-id"
                  type="text"
                  className="block w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-400 placeholder-gray-400"
                  placeholder="Enter transaction ID (e.g. 680fa547a016a40af15fc14c)"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
            
            <button
              onClick={checkStatus}
              disabled={!transactionId.trim() || loading}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-base font-normal disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-150"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Check Status'
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start gap-2.5">
              <svg className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details */}
      {transaction && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="p-8 border-b border-gray-100 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-light text-gray-900">
                  Transaction Details
                </h2>
                <p className="text-gray-500 text-sm">
                  {new Date(transaction.payment_time).toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <StatusPill status={transaction.status} />
            </div>
            
            <div className="pt-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-light text-gray-900">
                  ₹{transaction.transaction_amount}
                </span>
                {transaction.order_amount !== transaction.transaction_amount && (
                  <span className="text-base text-gray-400 line-through">
                    ₹{transaction.order_amount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Amount paid</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Payment Column */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-medium text-gray-900">Payment Information</h3>
                <div className="h-px w-12 bg-gray-200"></div>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</span>
                  <p className="text-gray-900">{transaction.payment_mode || 'Not specified'}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</span>
                  <p className="text-gray-900">{transaction.gateway || 'Not specified'}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</span>
                  <p className="text-gray-900 break-all">{transaction.payment_details || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Transaction Column */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-medium text-gray-900">Transaction Details</h3>
                <div className="h-px w-12 bg-gray-200"></div>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</span>
                  <p className="text-gray-900 break-all">{transaction.collect_id || transaction._id}</p>
                </div>
                
                {/* <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">School ID</span>
                  <p className="text-gray-900">#{transaction.school_id}</p>
                </div> */}
                
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Processed On</span>
                  <p className="text-gray-900">
                    {new Date(transaction.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {transaction.error_message && transaction.error_message !== "NA" && (
          <div className="bg-rose-50 p-6 border-t border-rose-100">
            <div className="flex items-start gap-3 max-w-3xl mx-auto">
              <svg className="flex-shrink-0 h-5 w-5 text-rose-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="space-y-1">
                <p className="text-sm font-medium text-rose-800">Payment Notice</p>
                <p className="text-sm text-rose-700">{transaction.error_message}</p>
              </div>
            </div>
          </div>
        )}

          {transaction.payment_message && (
            <div className="bg-emerald-50 p-6 border-t border-emerald-100">
              <div className="flex items-start gap-3 max-w-3xl mx-auto">
                <svg className="flex-shrink-0 h-5 w-5 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                </svg>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-emerald-800">Payment Confirmation</p>
                  <p className="text-sm text-emerald-700">{transaction.payment_message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TransactionStatus;