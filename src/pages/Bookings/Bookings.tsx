import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HttpClient } from "../../../api/HttpClient";
import { useToast } from "../../components/useToast";
import { ScaleLoader } from "react-spinners";
import { HexConverter } from "../../components/HexConverter";

// Define types based on API response
interface Client {
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
  preferredLatitude: number | null;
  preferredLongitude: number | null;
  preferredRadiusKm: number | null;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}
interface VendorOnboarding {
  businessName: string;
}
interface Vendor {
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
  preferredLatitude: number | null;
  preferredLongitude: number | null;
  preferredRadiusKm: number | null;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  vendorOnboarding: VendorOnboarding;
}

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  serviceLocation: string | null;
  fullAddress: string | null;
  landmark: string | null;
  referencePhoto: string | null;
  specialInstruction: string | null;
  reference: string | null;
  clientId: string;
  vendorId: string;
  clientCompleted: boolean;
  vendorCompleted: boolean;
  createdAt: string;
  client: Client;
  vendor: Vendor;
  reviews: unknown[];
}

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Pending", value: "PENDING" },
  { label: "Disputed", value: "DISPUTED" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
];

const Bookings = () => {
  const [sortStatus, setSortStatus] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await HttpClient.get("/admin/bookings");
        if (response.data.success) {
          setBookings(response.data.data);
        } else {
          setError("Failed to fetch bookings");
          showToast("Failed to fetch bookings", { type: "error" });
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch bookings";
        setError(errorMessage);
        showToast(errorMessage, { type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [showToast]);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = sortStatus === "all" || b.status === sortStatus;
    const clientName = b.client
      ? `${b.client.firstName} ${b.client.lastName}`
      : "Unknown Client";
    const vendorName = b.vendor
      ? `${b.vendor.firstName} ${b.vendor.lastName}`
      : "Unknown Vendor";
    const clientEmail = b.client?.email || "";

    const matchesSearch =
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      clientEmail.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      vendorName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortStatus]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green";
      case "PENDING":
        return "text-yellow";
      case "DISPUTED":
        return "text-red";
      case "ACCEPTED":
        return "text-[#0D9488]";
      case "REJECTED":
        return "text-red";

      default:
        return "text-gray";
    }
  };

  const getTrackingColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green px-3 py-1 rounded-full text-xs font-semibold";
      case "PENDING":
        return "text-yellow px-3 py-1 rounded-full text-xs font-semibold";
      case "DISPUTED":
        return "text-red px-3 py-1 rounded-full text-xs font-semibold";
      default:
        return "text-gray px-3 py-1 rounded-full text-xs font-semibold";
    }
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

  if (error) {
    return (
      <div className="flex h-screen pt-10 bg-lightgray">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-pink text-white px-4 py-2 rounded-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen pt-10 bg-lightgray">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[14px] text-[#909090] font-poppins-regular">
              Admin/Bookings
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
                  placeholder="Search orders with order ID, buyer, or vendor"
                  className="bg-transparent outline-none w-full py-[14px] text-sm font-poppins-regular"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-poppins-regular text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setDropdownOpen((open) => !open)}
                  type="button"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7h18M3 12h18M3 17h18"
                    />
                  </svg>
                  {statusOptions.find((s) => s.value === sortStatus)?.label ||
                    "Sort by"}
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          sortStatus === option.value ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          setSortStatus(option.value);
                          setDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-100 w-full">
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr className="bg-[#F5F5F5] text-[13px] font-poppins-regular">
                    <th className="p-3 text-left">Client's Detail</th>
                    <th className="p-3 text-left">Booking ID</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Vendor</th>
                    <th className="p-3 text-left">Booking Status</th>
                    <th className="p-3 text-left">Tracking</th>
                    <th className="p-3 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking, idx) => (
                    <tr
                      key={booking.id + idx}
                      className="border-b border-[#E4E4EF] last:border-b-0 text-[14px] font-poppins-medium hover:bg-[#F9F9F9]"
                    >
                      <td className="p-3 flex items-center gap-3 min-w-[220px]">
                        {booking.client?.avatar ? (
                          <img
                            src={booking.client.avatar}
                            alt={
                              booking.client
                                ? `${booking.client.firstName} ${booking.client.lastName}`
                                : "Unknown Client"
                            }
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                            {booking.client
                              ? `${booking.client.firstName} ${booking.client.lastName}`
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : "UC"}
                          </div>
                        )}
                        <div>
                          <div className="font-poppins-medium text-gray-800 text-[15px]">
                            {booking.client
                              ? `${booking.client.firstName} ${booking.client.lastName}`
                              : "Unknown Client"}
                          </div>
                          <div className="text-[12px] text-[#80808099] font-poppins-medium">
                            {booking.client?.email || "No email"}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{HexConverter(booking.id)}</td>
                      <td className="p-3">
                        {formatCurrency(booking.totalAmount)}
                      </td>
                      <td className="p-3">
                        {booking.vendor?.vendorOnboarding?.businessName ||
                          "Unknown Business"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`${getStatusColor(
                            booking.status
                          )} text-[12px]`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`${getTrackingColor(
                            booking.paymentStatus
                          )} text-[12px]`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          className="bg-lightpink text-pink px-4 py-2 rounded-[8px] cursor-pointer text-[12px] font-poppins-regular"
                          onClick={() =>
                            navigate("/bookings/detail", {
                              state: {
                                booking: booking,
                              },
                            })
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
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
    </div>
  );
};

export default Bookings;
