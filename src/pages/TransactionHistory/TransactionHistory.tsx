import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { ScaleLoader } from "react-spinners";
import Delete from "../../assets/img/delete-icon.png";
import { DateConverter } from "../../components/DateConverter";
import { HttpClient } from "../../../api/HttpClient";

// Define User type
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  location: string | null;
  role: string;
  powerGiven: boolean;
  isEmailVerified: boolean;
  isOtpVerified: boolean;
  otp: string | null;
  otpExpires: string | null;
  acceptedPersonalData: boolean;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  resetToken: string | null;
  resetTokenExp: string | null;
  notes: string | null;
  adminRole: string | null;
  referredById: string | null;
  referralCode: string;
  walletId: string;
  preferredLatitude: number;
  preferredLongitude: number;
  preferredRadiusKm: number;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define Wallet type
interface Wallet {
  id: string;
  balance: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  user: User | null;
}

// Define Transaction type based on API response
interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: "CREDIT" | "DEBIT";
  reference: string;
  status: "PENDING" | "SUCCESSFUL" | "FAILED" | "DISPUTED";
  metadata: Record<string, unknown> | null;
  paymentFor: string | null;
  createdAt: string;
  walletId: string;
  wallet: Wallet;
}

const TransactionHistory = () => {
  const [transactionType, setTransactionType] = useState<"CREDIT" | "DEBIT">(
    "CREDIT"
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (deleteSuccess) {
      const timer = setTimeout(() => setDeleteSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await HttpClient.get("/admin/payments");
        setTransactions(response.data.data);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Filter transactions by type and search term
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by transaction type
    const matchesType = transaction.type === transactionType;

    // Filter by search term
    const searchLower = searchTerm.toLowerCase();
    const user = transaction.wallet.user;
    const matchesSearch =
      !searchTerm ||
      user?.firstName?.toLowerCase().includes(searchLower) ||
      false ||
      user?.lastName?.toLowerCase().includes(searchLower) ||
      false ||
      user?.email?.toLowerCase().includes(searchLower) ||
      false ||
      transaction.reference.toLowerCase().includes(searchLower) ||
      transaction.status.toLowerCase().includes(searchLower) ||
      DateConverter(transaction.createdAt).toLowerCase().includes(searchLower);

    return matchesType && matchesSearch;
  });

  // Pagination logic
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, transactionType]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green";
      case "FAILED":
        return "text-[#FF0000]";
      case "PENDING":
        return "text-yellow";
      case "DISPUTED":
        return "text-red";
      default:
        return "text-gray-600";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen pt-10 bg-lightgray">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <ScaleLoader color="#eb278d" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen pt-10 bg-lightgray">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[14px] text-[#909090] font-poppins-regular">
              Admin/Transaction History
            </div>
            <div className="text-[14px] text-[#909090] font-poppins-regular">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex-1 flex items-center bg-[#EFF2F6] rounded-lg px-4">
                <svg
                  className="w-5 h-5 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0Z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by user, credit, withdrawal, date, reference number, status"
                  className="bg-transparent outline-none w-full py-[14px] text-[12px] font-poppins-regular"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Transaction Type Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${
                  transactionType === "CREDIT"
                    ? "bg-[#EFF2F6] text-black "
                    : "text-[#C5C5C5]"
                }`}
                onClick={() => setTransactionType("CREDIT")}
              >
                Credit
              </button>
              <button
                className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${
                  transactionType === "DEBIT"
                    ? "bg-[#EFF2F6] text-black "
                    : "text-[#C5C5C5]"
                }`}
                onClick={() => setTransactionType("DEBIT")}
              >
                Debit
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100 w-full">
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr className="bg-[#F5F5F5] font-poppins-regular">
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        className="accent-pink-600 w-4 h-4"
                      />
                    </th>
                    <th className="p-3 text-left text-[13px]">
                      Creditor's Detail
                    </th>
                    <th className="p-3 text-left text-[13px]">
                      User's Balance
                    </th>
                    <th className="p-3 text-left text-[13px]">Amount</th>
                    <th className="p-3 text-left text-[13px]">
                      Reference Number
                    </th>
                    <th className="p-3 text-left text-[13px]">Date</th>
                    <th className="p-3 text-left text-[13px]">
                      Transaction Status
                    </th>
                    <th className="p-3 text-left text-[13px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-8 text-gray-400"
                      >
                        Loading transactions...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : currentTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-8 text-gray-400"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    currentTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-[#E4E4EF] last:border-b-0 hover:bg-[#F9F9F9]"
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            className="accent-pink-600 w-4 h-4"
                          />
                        </td>
                        <td className="p-3 flex items-center gap-3 min-w-[220px]">
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                            {transaction.wallet.user
                              ? `${transaction.wallet.user.firstName} ${transaction.wallet.user.lastName}`
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : "N/A"}
                          </div>
                          <div>
                            <div className="font-poppins-medium text-[14px]">
                              {transaction.wallet.user
                                ? `${transaction.wallet.user.firstName} ${transaction.wallet.user.lastName}`
                                : "User Not Available"}
                            </div>
                            <div className="text-[12px] text-[#80808099]">
                              {transaction.wallet.user?.email ||
                                "No email available"}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-[14px] font-poppins-medium">
                          {formatCurrency(transaction.wallet.balance)}
                        </td>
                        <td className="p-3 text-[14px] font-poppins-medium">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="p-3 text-[14px] font-poppins-medium">
                          {transaction.reference}
                        </td>
                        <td className="p-3 text-[14px] font-poppins-medium">
                          {DateConverter(transaction.createdAt)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[14px] font-poppins-medium ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-3">
              <div className="flex items-center gap-2">
                <button
                  className={`px-3 py-1 rounded border text-sm ${
                    currentPage === 1
                      ? "border-gray-200 text-gray-400 bg-white cursor-not-allowed"
                      : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1 rounded cursor-pointer border text-sm ${
                      page === currentPage
                        ? "border-pink-600 bg-pink-600 text-white"
                        : page === "..."
                        ? "border-gray-200 bg-white text-gray-500 cursor-default"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      typeof page === "number" && handlePageChange(page)
                    }
                    disabled={page === "..."}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className={`px-3 py-1 rounded border text-sm ${
                    currentPage === totalPages
                      ? "border-gray-200 text-gray-400 bg-white cursor-not-allowed"
                      : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
              <div className="text-sm text-gray-500 font-poppins-regular">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
                {totalItems}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-poppins-regular">
                  Rows per page
                </span>
                <select
                  className="border cursor-pointer border-gray-200 rounded px-2 py-1 text-sm"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                  <option className="cursor-pointer" value={10}>
                    10
                  </option>
                  <option className="cursor-pointer" value={20}>
                    20
                  </option>
                  <option className="cursor-pointer" value={50}>
                    50
                  </option>
                </select>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Modal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setDeletingTransactionId(null);
        }}
      >
        <div className="p-10">
          <h1 className="font-poppins-regular text-center text-[14px]">
            Are you sure you want to delete this transaction?
          </h1>
          <div className="flex justify-center gap-4 pt-10">
            <button
              className="bg-red cursor-pointer text-white px-8 py-2 rounded-[4px] flex items-center justify-center min-w-[80px]"
              disabled={deleteLoading}
              onClick={async () => {
                if (!deletingTransactionId) return;
                setDeleteLoading(true);
                try {
                  // Replace with actual API call
                  // await HttpClient.delete(`/admin/transactions/${deletingTransactionId}`);
                  setTransactions((prev) =>
                    prev.filter((t) => t.id !== deletingTransactionId)
                  );
                  setDeleteModal(false);
                  setDeletingTransactionId(null);
                  setDeleteSuccess(true);
                } catch {
                  // Optionally show error toast
                } finally {
                  setDeleteLoading(false);
                }
              }}
            >
              {deleteLoading ? (
                <ScaleLoader color="#fff" height={15} width={2} />
              ) : (
                "Yes"
              )}
            </button>
            <button
              className="text-red border cursor-pointer border-red px-8 py-2 rounded-[4px]"
              disabled={deleteLoading}
              onClick={() => {
                setDeleteModal(false);
                setDeletingTransactionId(null);
              }}
            >
              No
            </button>
          </div>
        </div>
      </Modal>
      <Modal open={deleteSuccess} onClose={() => setDeleteSuccess(false)}>
        <div className="p-10">
          <div className="flex justify-center">
            <img src={Delete} className="w-[150px] h-[150px]" alt="delete" />
          </div>
          <h1 className="font-poppins-regular text-center text-[14px]">
            Transaction deleted successfully
          </h1>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionHistory;
