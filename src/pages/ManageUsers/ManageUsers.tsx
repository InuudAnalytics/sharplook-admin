import { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { HttpClient } from "../../../api/HttpClient";
import Modal from "../../components/Modal";
import { ScaleLoader } from "react-spinners";
import Delete from "../../assets/img/delete-icon.png";
import { DateConverter } from "../../components/DateConverter";
import { FaStar } from "react-icons/fa";

// Define User type based on API response
interface Vendor {
  businessName: string;
  bio: string;
  location: string;
  serviceType: string;
  serviceRadius: number;
  profileImage: string;
  createdAt: string;
}
interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: "CLIENT" | "VENDOR" | "SUPERADMIN";
  isEmailVerified: boolean;
  phone: string;
  createdAt: string;
  averageRating?: number;
  totalReviews?: number;
  vendorOnboarding: Vendor;
}

const ManageUsers = () => {
  const [userType, setUserType] = useState<"all" | "vendor" | "client">("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
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
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all users from the backend
        const res = await HttpClient.get("/admin/users");
        setUsers(res.data.data);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users to show only CLIENT and VENDOR (exclude SUPERADMIN)
  const filteredUsers = users.filter((user) => {
    // Only show CLIENT and VENDOR users - explicitly exclude SUPERADMIN
    if (user.role !== "CLIENT" && user.role !== "VENDOR") return false;

    // Filter by user type
    const matchesUserType =
      userType === "all" ||
      (userType === "vendor" && user.role === "VENDOR") ||
      (userType === "client" && user.role === "CLIENT");

    // Filter by search term
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      DateConverter(user.createdAt).toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower);

    return matchesUserType && matchesSearch;
  });

  // Pagination logic
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, userType]);

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
              Admin/Manage Users
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
                  placeholder="Search by name, email, phone number, and date registered"
                  className="bg-transparent outline-none w-full py-[14px] text-[12px] font-poppins-regular"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  {userType === "all"
                    ? "All"
                    : userType.charAt(0).toUpperCase() + userType.slice(1)}
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
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        userType === "all" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        setUserType("all");
                        setDropdownOpen(false);
                      }}
                    >
                      All
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        userType === "vendor" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        setUserType("vendor");
                        setDropdownOpen(false);
                      }}
                    >
                      Vendors
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        userType === "client" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        setUserType("client");
                        setDropdownOpen(false);
                      }}
                    >
                      Clients
                    </button>
                  </div>
                )}
              </div>
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
                      User{"  "}
                      {userType === "client"
                        ? "(Client)"
                        : userType === "vendor"
                        ? "(Vendor)"
                        : "(Vendor/Client)"}
                    </th>

                    <th className="p-3 text-left text-[13px]">
                      Date registered
                    </th>
                    <th className="p-3 text-left text-[13px]">Phone number</th>

                    <th className="p-3 text-left text-[13px]">Rating</th>
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
                        Loading users...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : currentUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-8 text-gray-400"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[#E4E4EF] last:border-b-0 hover:bg-[#F9F9F9]"
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            className="accent-pink-600 w-4 h-4"
                          />
                        </td>
                        <td className="p-3 flex items-center gap-3 min-w-[220px]">
                          {/* No avatar in API, use initials from email */}
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                            {user?.vendorOnboarding ? (
                              user?.vendorOnboarding?.businessName
                                ?.charAt(0)
                                .toUpperCase()
                            ) : (
                              <>
                                {user.lastName?.charAt(0).toUpperCase()}
                                {user.firstName?.charAt(0).toUpperCase()}
                              </>
                            )}
                          </div>
                          <div>
                            {user?.vendorOnboarding ? (
                              <div className="font-poppins-medium text-[14px]">
                                {user.vendorOnboarding.businessName}
                              </div>
                            ) : (
                              <div className="font-poppins-medium text-[14px]">
                                {user.lastName} {user.firstName}
                              </div>
                            )}
                            <div className="text-[12px] text-[#80808099]">
                              {user.email}
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-[14px] font-poppins-medium">
                          {/* No createdAt in API */}
                          {DateConverter(user?.createdAt)}
                        </td>
                        <td className="p-3 text-[14px] font-poppins-medium">
                          {user?.phone || "-"}
                        </td>

                        <td className="p-3">
                          {user.role === "CLIENT" ? (
                            <span className="text-gray-400">No rating</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                  key={star}
                                  size={14}
                                  className={
                                    user.averageRating &&
                                    user.averageRating >= star
                                      ? "text-pink"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            className="text-gray-400 cursor-pointer hover:text-red-500"
                            onClick={() => {
                              setDeletingUserId(user.id);
                              setDeleteModal(true);
                            }}
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
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
          setDeletingUserId(null);
        }}
      >
        <div className="p-10">
          <h1 className="font-poppins-regular text-center text-[14px]">
            Are you sure you want to delete this user?
          </h1>
          <div className="flex justify-center gap-4 pt-10">
            <button
              className="bg-red cursor-pointer text-white px-8 py-2 rounded-[4px] flex items-center justify-center min-w-[80px]"
              disabled={deleteLoading}
              onClick={async () => {
                if (!deletingUserId) return;
                setDeleteLoading(true);
                try {
                  await HttpClient.delete(`/admin/users/${deletingUserId}`);
                  setUsers((prev) =>
                    prev.filter((u) => u.id !== deletingUserId)
                  );
                  setDeleteModal(false);
                  setDeletingUserId(null);
                  setDeleteSuccess(true); // Show success modal
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
                setDeletingUserId(null);
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
            User deleted successfully
          </h1>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUsers;
