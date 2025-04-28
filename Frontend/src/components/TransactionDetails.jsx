import { useState } from "react";
import API from "../services/api";

const TRANSACTIONS_PER_PAGE = 2;

function SchoolTransactions() {
  const [schoolId, setSchoolId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalTransactions: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const fetchTransactions = async (page = 1) => {
    if (!schoolId.trim()) {
      setError("Please enter a School ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await API.get(`/transactions/school/${schoolId}`, {
        params: {
          page,
          limit: TRANSACTIONS_PER_PAGE
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (res.data.transactions && res.data.transactions.length > 0) {
        setTransactions(res.data.transactions);
        setPagination(res.data.pagination);
      } else {
        setTransactions([]);
        setError("No transactions found for this school");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions. Please try again.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage !== pagination.currentPage) {
      fetchTransactions(newPage);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
        {status || "unknown"}
      </span>
    );
  };

  const getShowingRange = () => {
    const start = (pagination.currentPage - 1) * TRANSACTIONS_PER_PAGE + 1;
    const end = Math.min(start + transactions.length - 1, pagination.totalTransactions);
    return `${start}-${end}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">School Transactions</h2>
            <p className="text-sm text-gray-500 mt-1">View transactions by school ID</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Enter School ID"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchTransactions(1)}
            />
            <button
              onClick={() => fetchTransactions(1)}
              disabled={!schoolId.trim() || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-2 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gateway
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trustee
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-gray-600">Loading transactions...</p>
                  </div>
                </td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {tx.txId || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tx.student_info?.name || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {tx.student_info?.email || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {tx.gateway_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.trustee_id || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-600">No transactions found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {transactions.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{getShowingRange()}</span> of{" "}
            <span className="font-medium">{pagination.totalTransactions}</span> transactions
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage || loading}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                pagination.hasPreviousPage
                  ? "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <div className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                pagination.hasNextPage
                  ? "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolTransactions;