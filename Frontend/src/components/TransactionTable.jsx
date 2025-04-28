import { useEffect, useState } from "react";
import API from "../services/api";

const TRANSACTIONS_PER_PAGE =  2;

function TransactionTable() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalTransactions: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter 
        ? `/transactions?limit=${TRANSACTIONS_PER_PAGE}&page=${page}&status=${statusFilter}`
        : `/transactions?limit=${TRANSACTIONS_PER_PAGE}&page=${page}`;
      
      const res = await API.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      
      setAllTransactions(res.data.transactions);
      setFilteredTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const getStatusBadge = (status) => {
    const statusLower = status.toLowerCase();
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    let borderColor = "border-gray-200";

    if (statusLower === "success") {
      bgColor = "bg-green-50";
      textColor = "text-green-700";
      borderColor = "border-green-100";
    } else if (statusLower === "failed") {
      bgColor = "bg-red-50";
      textColor = "text-red-700";
      borderColor = "border-red-100";
    } else if (statusLower === "pending") {
      bgColor = "bg-yellow-50";
      textColor = "text-yellow-700";
      borderColor = "border-yellow-100";
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} border ${borderColor}`}>
        {status}
      </span>
    );
  };

  const getRowClasses = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "failed") {
      return "bg-red-50 hover:bg-red-100";
    }
    return "hover:bg-gray-50";
  };

  const getShowingRange = () => {
    if (filteredTransactions.length === 0) return "0-0";
    const start = (page - 1) * TRANSACTIONS_PER_PAGE + 1;
    const end = start + filteredTransactions.length - 1;
    return `${start}-${end}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">School Payment Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage all transactions</p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            className="w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm text-gray-700 shadow-sm"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Collect ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gateway
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TXN Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-gray-600">Loading transactions...</p>
                  </div>
                </td>
              </tr>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <tr key={tx.collect_id} className={getRowClasses(tx.status)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="font-mono">{tx.collect_id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{tx.school_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {tx.gateway}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    ₹{tx.order_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    ₹{tx.transaction_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {tx.custom_order_id}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600">No transactions found</p>
                    {statusFilter && (
                      <button 
                        onClick={() => handleStatusFilterChange("")}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{getShowingRange()}</span> of <span className="font-medium">{pagination.totalTransactions}</span> transactions
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              page > 1
                ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          
          {pagination.totalPages <= 10 && (
            <div className="flex space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    page === pageNum
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          )}
          
          {pagination.totalPages > 10 && (
            <div className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700">
              Page {page} of {pagination.totalPages}
            </div>
          )}
          
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages || loading}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              page < pagination.totalPages
                ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionTable;