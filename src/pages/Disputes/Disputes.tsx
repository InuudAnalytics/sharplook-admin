import { useState, useEffect } from "react";
import sharplookLogo from "../../assets/img/sharplooklogo.svg";
import { useNavigate } from "react-router-dom";
import { HttpClient } from "../../../api/HttpClient";
import { ScaleLoader } from "react-spinners";
import { DateConverter } from "../../components/DateConverter";

// Define types based on API response
interface DisputeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface DisputeBooking {
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
  serviceLocation: string;
  fullAddress: string;
  landmark: string;
  referencePhoto: string;
  specialInstruction: string;
  reference: string;
  clientId: string;
  vendorId: string;
  clientCompleted: boolean;
  vendorCompleted: boolean;
  createdAt: string;
}

interface Dispute {
  id: string;
  reason: string;
  status: "PENDING" | "RESOLVED" | "UNRESOLVED";
  imageUrl: string | null;
  createdAt: string;
  raisedBy: DisputeUser;
  booking: DisputeBooking;
}

// Add ProductDispute types
interface ProductDisputeUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

interface ProductVendorOrder {
  id: string;
  total: number;
  status: string;
}

interface ProductDispute {
  id: string;
  vendorOrderId: string;
  raisedById: string;
  reason: string;
  disputeImage: string;
  status: "PENDING" | "RESOLVED" | "UNRESOLVED";
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  raisedBy: ProductDisputeUser;
  vendorOrder: ProductVendorOrder;
}

const statusColors: Record<string, string> = {
  RESOLVED: "text-green",
  PENDING: "text-yellow",
  UNRESOLVED: "text-red",
};

const Disputes = () => {
  const [activeTab, setActiveTab] = useState<"service" | "product">("service");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [productDisputes, setProductDisputes] = useState<ProductDispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch disputes from API
  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === "service") {
          const response = await HttpClient.get("/disputes/getAllDisputes");

          // console.log(response);
          
        setDisputes(response.data.disputes);
          } else {
          const response = await HttpClient.get("/disputes/getOrderDisputes");
          setProductDisputes(response.data);
        }
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to fetch disputes");
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, [activeTab]);

  // Filter disputes by search
  const filteredService = disputes.filter((dispute) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      dispute.raisedBy.firstName?.toLowerCase().includes(searchLower) ||
      dispute.raisedBy.lastName?.toLowerCase().includes(searchLower) ||
      dispute.reason.toLowerCase().includes(searchLower) ||
      dispute.booking.serviceName.toLowerCase().includes(searchLower);
    return matchesSearch;
  });

  const filteredProduct = productDisputes.filter((dispute) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      dispute.raisedBy.firstName?.toLowerCase().includes(searchLower) ||
      dispute.raisedBy.lastName?.toLowerCase().includes(searchLower) ||
      dispute.reason.toLowerCase().includes(searchLower) ||
      dispute.vendorOrderId.toLowerCase().includes(searchLower);
    return matchesSearch;
  });

  // Pagination
  const filtered = activeTab === "service" ? filteredService : filteredProduct;
  const start = (page - 1) * rowsPerPage;
  const paginated = filtered.slice(start, start + rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  // Reset to first page when search or tab changes
  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  if (loading) {
    return (
      <div className="p-8 bg-lightgray pt-[80px] min-h-screen">
        <div className="flex items-center justify-center h-64">
          <ScaleLoader color="#eb278d" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-lightgray pt-[80px] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[14px] text-[#909090] font-poppins-regular">
          Admin/Dispute
        </span>
        <span className="text-[14px] text-[#909090] font-poppins-regular">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        {/* Tabs */}

        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative bg-[#EFF2F6] w-full max-w-[500px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-5 h-5"
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
            </span>
            <input
              type="text"
              placeholder={
                activeTab === "service"
                  ? "Search by name, complaint, or service"
                  : "Search by name, complaint, or order ID"
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 rounded bg-[#EFF2F6] border border-gray-200 focus:outline-none text-[15px]"
            />
          </div>
        </div>
        <div className="flex gap-2 border-b border-[#E4E4EF] pb-4 mb-4">
          <button
            className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${
              activeTab === "service"
                ? "bg-[#EFF2F6] text-black"
                : "text-[#C5C5C5]"
            }`}
            onClick={() => setActiveTab("service")}
          >
            Service Disputes
          </button>
          <button
            className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${
              activeTab === "product"
                ? "bg-[#EFF2F6] text-black"
                : "text-[#C5C5C5]"
            }`}
            onClick={() => setActiveTab("product")}
          >
            Product Disputes
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-100 w-full bg-white">
          <table className="min-w-full bg-white text-sm">
            <thead>
              {activeTab === "service" ? (
                <tr className="bg-[#F5F5F5] text-[13px] font-poppins-regular">
                  <th className="p-3 text-left">User's Detail</th>
                  <th className="p-3 text-left">Date of complaints</th>
                  <th className="p-3 text-left">Complaints</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left"></th>
                </tr>
              ) : (
                <tr className="bg-[#F5F5F5] text-[13px] font-poppins-regular">
                  <th className="p-3 text-left">User's Detail</th>
                  <th className="p-3 text-left">Date of complaints</th>
                  <th className="p-3 text-left">Complaints</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left"></th>
                </tr>
              )}
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td
                    colSpan={activeTab === "service" ? 5 : 6}
                    className="text-center py-8 text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "service" ? 5 : 6}
                    className="text-center py-8 text-gray-400"
                  >
                    No disputes found.
                  </td>
                </tr>
              ) : activeTab === "service" ? (
                (paginated as Dispute[]).map((dispute) => (
                  <tr
                    key={dispute.id}
                    className="border-b border-[#E4E4EF] last:border-b-0 text-[14px] font-poppins-medium hover:bg-[#F9F9F9]"
                  >
                    <td className="p-3 flex items-center gap-3 min-w-[220px]">
                      <img
                        src={sharplookLogo}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover bg-gray-200"
                      />
                      <div>
                        <div className="font-poppins-medium text-gray-800 text-[15px]">
                          {dispute.raisedBy.firstName}{" "}
                          {dispute.raisedBy.lastName}
                        </div>
                        <div className="text-[12px] text-[#80808099] font-poppins-medium">
                          {dispute.raisedBy.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{DateConverter(dispute.createdAt)}</td>
                    <td className="p-3 max-w-[250px] truncate">
                      {dispute.reason}
                    </td>
                    <td className="p-3">
                      <span
                        className={`${
                          statusColors[dispute.status]
                        } font-semibold text-[12px]`}
                      >
                        {dispute.status === "PENDING"
                          ? "Pending"
                          : dispute.status === "RESOLVED"
                          ? "Resolved"
                          : "Unresolved"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        className="bg-lightpink text-pink px-4 py-2 rounded-[8px] cursor-pointer text-[12px] font-poppins-regular"
                        onClick={() => {
                          navigate(`/disputes/${dispute.id}`, {
                            state: { dispute },
                          });
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                (paginated as ProductDispute[]).map((dispute) => (
                  <tr
                    key={dispute.id}
                    className="border-b border-[#E4E4EF] last:border-b-0 text-[14px] font-poppins-medium hover:bg-[#F9F9F9]"
                  >
                    <td className="p-3 flex items-center gap-3 min-w-[220px]">
                      <img
                        src={sharplookLogo}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover bg-gray-200"
                      />
                      <div>
                        <div className="font-poppins-medium text-gray-800 text-[15px]">
                          {dispute.raisedBy.firstName}{" "}
                          {dispute.raisedBy.lastName}
                        </div>
                        <div className="text-[12px] text-[#80808099] font-poppins-medium">
                          {dispute.raisedBy.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{DateConverter(dispute.createdAt)}</td>
                    <td className="p-3 max-w-[250px] truncate">
                      {dispute.reason}
                    </td>
                    <td className="p-3">
                      <span
                        className={`${
                          statusColors[dispute.status]
                        } font-semibold text-[12px]`}
                      >
                        {dispute.status === "PENDING"
                          ? "Pending"
                          : dispute.status === "RESOLVED"
                          ? "Resolved"
                          : "Unresolved"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        className="bg-lightpink text-pink px-4 py-2 rounded-[8px] cursor-pointer text-[12px] font-poppins-regular"
                        onClick={() => {
                          navigate(`/disputes/${dispute.id}`, {
                            state: { dispute },
                          });
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination and controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-3">
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded border text-sm ${
                page === 1
                  ? "border-gray-200 text-gray-400 bg-white cursor-not-allowed"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              }`}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            {(() => {
              const pages = [];
              const maxVisiblePages = 5;
              if (totalPages <= maxVisiblePages) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                if (page <= 3) {
                  for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                  }
                  pages.push("...");
                  pages.push(totalPages);
                } else if (page >= totalPages - 2) {
                  pages.push(1);
                  pages.push("...");
                  for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  pages.push(1);
                  pages.push("...");
                  for (let i = page - 1; i <= page + 1; i++) {
                    pages.push(i);
                  }
                  pages.push("...");
                  pages.push(totalPages);
                }
              }
              return pages.map((pageNum, index) => (
                <button
                  key={index}
                  className={`px-3 py-1 rounded cursor-pointer border text-sm ${
                    pageNum === page
                      ? "border-pink-600 bg-pink-600 text-white"
                      : pageNum === "..."
                      ? "border-gray-200 bg-white text-gray-500 cursor-default"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    typeof pageNum === "number" && setPage(pageNum as number)
                  }
                  disabled={pageNum === "..."}
                >
                  {pageNum}
                </button>
              ));
            })()}
            <button
              className={`px-3 py-1 rounded border text-sm ${
                page === totalPages
                  ? "border-gray-200 text-gray-400 bg-white cursor-not-allowed"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              }`}
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500 font-poppins-regular">
            Showing {start + 1} to{" "}
            {Math.min(start + rowsPerPage, filtered.length)} of{" "}
            {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-poppins-regular">
              Rows per page
            </span>
            <select
              className="border border-gray-200 rounded px-2 py-1 text-sm cursor-pointer"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disputes;
