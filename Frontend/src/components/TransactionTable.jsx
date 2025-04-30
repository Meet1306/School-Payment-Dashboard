import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../services/api";

const TRANSACTIONS_PER_PAGE = 5;
const SOCKET_URL = "http://localhost:5000/";

function TransactionTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const statusFilter = searchParams.get("status") || "";

  const [transactionsMap, setTransactionsMap] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [newTransactionsCount, setNewTransactionsCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Convert Map to array for rendering (newest first)
  const allTransactions = useMemo(() => 
    Array.from(transactionsMap.values()).sort((a, b) => 
      new Date(b.payment_time) - new Date(a.payment_time)), 
    [transactionsMap]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return statusFilter 
      ? allTransactions.filter(tx => 
          tx.status.toLowerCase() === statusFilter.toLowerCase())
      : allTransactions;
  }, [allTransactions, statusFilter]);

  // Enhanced pagination logic
  const paginationData = useMemo(() => {
    const total = filteredTransactions.length;
    const totalPages = Math.max(1, Math.ceil(total / TRANSACTIONS_PER_PAGE));
    
    let currentPage = Math.max(1, Math.min(page, totalPages));
    if (currentPage !== page) {
      const params = new URLSearchParams(searchParams);
      params.set("page", currentPage.toString());
      window.history.replaceState(null, "", `?${params.toString()}`);
    }

    const start = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
    const end = start + TRANSACTIONS_PER_PAGE;
    
    return {
      paginatedTransactions: filteredTransactions.slice(start, end),
      totalPages,
      currentPage,
      totalTransactions: total,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      showingStart: total > 0 ? start + 1 : 0,
      showingEnd: Math.min(end, total)
    };
  }, [filteredTransactions, page, searchParams]);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/transactions`);
      const newMap = new Map();
      res.data.transactions
        .sort((a, b) => new Date(b.payment_time) - new Date(a.payment_time))
        .forEach(tx => newMap.set(tx.collect_id, tx));
      setTransactionsMap(newMap);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle new transactions from WebSocket
  const handleNewTransaction = useCallback((newTx) => {
    console.log("New transaction received:", newTx);
    if (transactionsMap.has(newTx.collect_id)) {
      console.log("Transaction already exists:", newTx.collect_id);
      return;
    }

    setTransactionsMap(prev => {
      if (prev.has(newTx.collect_id)) return prev;
      const newMap = new Map([[newTx.collect_id, newTx], ...prev]);
      return newMap;
    });

    if (page !== 1) {
      setNewTransactionsCount(prev => prev + 1);
    }
  }, [page]);

  // Update URL and reset new transactions count
  const updatePage = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    setNewTransactionsCount(0);
  };

  // Initialize
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("No auth token found for WebSocket connection");
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token: authToken },
      transports: ["websocket"], // Force WebSocket transport
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connected");
    });


    newSocket.on("transaction", handleNewTransaction);

    setSocket(newSocket);
    fetchTransactions();

    return () => {
      newSocket.off("transaction", handleNewTransaction);
      newSocket.disconnect();
    };
  }, [fetchTransactions, handleNewTransaction]);

  // Reset to page 1 when status filter changes
  useEffect(() => {
    if (statusFilter && page !== 1) {
      updatePage(1);
    }
  }, [statusFilter, page]);

  const handleStatusFilterChange = (value) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (value) params.set("status", value);
    setSearchParams(params);
    setNewTransactionsCount(0);
  };


  const formatPaymentTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} border ${borderColor}`}
      >
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
    {/* Header and filter controls (same as before) */}
    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
        <p className="text-xs text-gray-500 mt-1">View and manage payment transactions</p>
      </div>
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <select
          className="w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 shadow-sm"
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gateway
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Time
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
            ) : paginationData.paginatedTransactions.length > 0 ? (
              paginationData.paginatedTransactions.map((tx) => (
                <tr key={tx.collect_id} className={getRowClasses(tx.status)}>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                    <span className="font-mono">{tx.collect_id}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    #{tx.school_id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 capitalize">
                    {tx.gateway}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-medium">₹{tx.order_amount}</span>
                      {tx.transaction_amount !== tx.order_amount && (
                        <span className="text-xs text-gray-400">
                          ₹{tx.transaction_amount} settled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                    {tx.custom_order_id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {formatPaymentTime(tx.payment_time)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center">
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
                    {statusFilter && (
                      <button
                        onClick={() => handleStatusFilterChange("")}
                        className="text-xs text-blue-600 hover:text-blue-800"
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

      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-gray-600">
          Showing <span className="font-medium">{paginationData.showingStart}-{paginationData.showingEnd}</span> of{" "}
          <span className="font-medium">{paginationData.totalTransactions}</span>
          {paginationData.currentPage !== 1 && newTransactionsCount > 0 && (
            <button
              onClick={() => updatePage(1)}
              className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {newTransactionsCount} new
            </button>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => updatePage(paginationData.currentPage - 1)}
            disabled={!paginationData.hasPreviousPage || loading}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              paginationData.hasPreviousPage
                ? "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Previous
          </button>

          {paginationData.totalPages <= 10 ? (
            <div className="flex space-x-1">
              {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => updatePage(pageNum)}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    paginationData.currentPage === pageNum
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-2.5 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700">
              Page {paginationData.currentPage} of {paginationData.totalPages}
            </div>
          )}

          <button
            onClick={() => updatePage(paginationData.currentPage + 1)}
            disabled={!paginationData.hasNextPage || loading}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              paginationData.hasNextPage
                ? "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
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