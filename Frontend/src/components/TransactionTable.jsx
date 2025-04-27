import { useEffect, useState } from "react";
import API from "../services/api";

function TransactionTable() {
  const [allTransactions, setAllTransactions] = useState([]); // Store ALL transactions
  const [filteredTransactions, setFilteredTransactions] = useState([]); // Store filtered transactions
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
    fetchAllTransactions();
  }, [page]); // Only fetch when page changes

  useEffect(() => {
    // Apply filter whenever statusFilter or allTransactions changes
    if (statusFilter === "") {
      setFilteredTransactions(allTransactions);
    } else {
      const filtered = allTransactions.filter(tx => 
        tx.status.toLowerCase() === statusFilter.toLowerCase()
      );
      setFilteredTransactions(filtered);
    }
    // Reset to page 1 when filter changes
    setPage(1);
  }, [statusFilter, allTransactions]);

  const fetchAllTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/transactions?limit=10&page=${page}`);
      setAllTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status.toLowerCase();
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";

    if (statusLower === "success") {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
    } else if (statusLower === "failed") {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
    } else if (statusLower === "pending") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">School Payment Dashboard</h2>
          <div className="flex items-center space-x-4">
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
                  School ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gateway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Custom Order ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.collect_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tx.collect_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.school_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.gateway}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.order_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.transaction_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.custom_order_id}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredTransactions.length} of {pagination.totalTransactions} transactions
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || loading}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                page > 1
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={filteredTransactions.length < 10 || loading}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filteredTransactions.length === 10
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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