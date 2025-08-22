import React, { useState, useEffect } from "react";
import { MdEvent } from "react-icons/md";
import { TiArrowSortedUp } from "react-icons/ti";
import { FaUsers, FaStore, FaUserPlus } from "react-icons/fa";
import {
  GiCardboardBox,
  GiShoppingCart,
  GiArchiveRegister,
  GiCancel,
} from "react-icons/gi";
import { HttpClient } from "../../../api/HttpClient";
import { useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";

// Define types based on API response
interface Analytics {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  totalDisputes: number;
  totalTransactions: number;
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  totalUnitsSold: number;
  newProductsThisWeek: number;
  totalEmailVerified: number;
  totalPhoneVerified: number;
  totalAcceptedPersonalData: number;
}

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

const iconMap: Record<string, React.ReactNode> = {
  clients: <FaUsers className="text-[24px] text-white" />,
  vendors: <FaStore className="text-[24px] text-white" />,
  new_users: <FaUserPlus className="text-[24px] text-white" />,
  new_products: <GiCardboardBox className="text-[24px] text-white" />,
  sold_products: <GiShoppingCart className="text-[24px] text-white" />,
  all_products: <GiArchiveRegister className="text-[24px] text-white" />,
  disputed: <GiCancel className="text-[24px] text-white" />,
};

type ProductIconKey =
  | "new_products"
  | "sold_products"
  | "all_products"
  | "disputed";

const iconComponents = {
  new_products: GiCardboardBox,
  sold_products: GiShoppingCart,
  all_products: GiArchiveRegister,
  disputed: GiCancel,
} as const;

const Overview = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOverview = async () => {
    setBookingsLoading(true);
    try {
      const [analyticsRes, bookingsRes] = await Promise.all([
        HttpClient.get("/admin/stats"),
        HttpClient.get("/admin/bookings"),
      ]);
      setAnalytics(analyticsRes.data.data);
      if (bookingsRes.data.success) {
        const sortedBookings = bookingsRes.data.data
          .sort(
            (a: Booking, b: Booking) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);
        setBookings(sortedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleViewAll = () => {
    navigate("/bookings");
  };

  const handleViewBooking = (booking: Booking) => {
    navigate("/bookings/detail", {
      state: {
        booking: booking,
      },
    });
  };

  return (
    <div className="flex h-screen pt-10 bg-lightgray">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Breadcrumb and Date */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-poppins-regular text-[#909090]">
              Admin/Dashboard
            </span>
            <span className="text-[14px] font-poppins-regular text-[#909090]">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                label: "Total Clients",
                value: analytics?.totalUsers || "-",
                icon: "clients",
                change: "+10%",
                time: "vs. Yesterday",
              },
              {
                label: "Total Vendors",
                value: analytics?.totalVendors || "-",
                icon: "vendors",
                change: "+10%",
                time: "vs. Yesterday",
              },
              {
                label: "New Users this month",
                value: analytics?.totalUsers || "-",
                icon: "new_users",
                change: "+10%",
                time: "vs. last month",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl p-6 flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-center gap-2 text-pink-600">
                  <div className="h-10 w-10 bg-pink flex items-center justify-center rounded-full">
                    {iconMap[card.icon]}
                  </div>
                  <span className="font-poppins-regular text-[14px] text-[#555555]">
                    {card.label}
                  </span>
                </div>
                <div className="text-3xl text-center font-poppins-semi-bold">
                  {card.value}
                </div>
                <div className="flex items-center justify-center gap-1 text-[#2AC670] text-[14px] font-poppins-light">
                  <TiArrowSortedUp className="text-base" />
                  <h1>{card.change}</h1>
                  <span className="text-[12px] font-poppins-regular text-[#909090]">
                    {card.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Products Overview */}
          <div className="mb-8">
            <h2 className="text-[20px] font-poppins-medium mb-3">
              Products Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(
                [
                  {
                    label: "New Products",
                    value: analytics?.newProductsThisWeek || "-",
                    icon: "new_products",
                    active: true,
                  },
                  {
                    label: "Sold Products",
                    value: analytics?.totalUnitsSold || "-",
                    icon: "sold_products",
                    active: false,
                  },
                  {
                    label: "All Products",
                    value: analytics?.totalProducts || "-",
                    icon: "all_products",
                    active: true,
                  },
                  {
                    label: "Disputed",
                    value: analytics?.totalDisputes || "-",
                    icon: "disputed",
                    active: false,
                  },
                ] as {
                  label: string;
                  value: number;
                  icon: ProductIconKey;
                  active: boolean;
                }[]
              ).map((item) => {
                const iconColor = item.active ? "white" : "#eb278d";
                const iconSize = 40;
                const Icon = iconComponents[item.icon];
                return (
                  <div
                    key={item.label}
                    className={`rounded-xl h-[130px] shadow-sm p-6 flex flex-col   gap-2 ${
                      item.active ? "bg-pink  text-white" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 justify-between">
                      {Icon ? <Icon size={iconSize} color={iconColor} /> : null}
                      <div>
                        <div className="text-[38px] text-right font-poppins-medium">
                          {item.value}
                        </div>
                        <div className="text-[14px] font-poppins-regular">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Booking History */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#D1D2D3] pb-4 mb-4">
              <h3 className="text-[16px] font-poppins-regular text-gray-800">
                Booking History
              </h3>
              <button
                className="text-white cursor-pointer font-poppins-regular text-[14px] px-[10px] py-[10px] rounded-lg bg-pink"
                onClick={handleViewAll}
              >
                View all
              </button>
            </div>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <ScaleLoader color="#eb278d" height={15} width={2} />
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <li
                      key={booking.id}
                      className="flex items-center justify-between py-4"
                    >
                      <div className="flex items-center gap-4">
                        <span className="bg-lightpink text-pink-600 rounded-full p-2">
                          <MdEvent className="text-2xl" />
                        </span>
                        <div>
                          <div className="font-poppins-regular text-[14px] text-pink">
                            New booking request by{" "}
                            {booking.client
                              ? `${booking.client.firstName} ${booking.client.lastName}`
                              : "Unknown Client"}
                          </div>
                          <div className="text-[12px] text-[#C5C5C5] font-poppins-regular">
                            {booking.status === "PENDING"
                              ? "Awaiting vendor response"
                              : booking.status === "ACCEPTED"
                              ? "Vendor accepted booking"
                              : booking.status === "COMPLETED"
                              ? "Booking completed"
                              : booking.status === "REJECTED"
                              ? "Booking rejected"
                              : booking.status === "DISPUTED"
                              ? "Booking disputed"
                              : "Status: " + booking.status}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="font-poppins-regular text-[14px] text-pink">
                          {formatTime(booking.createdAt)},{" "}
                          {formatDate(booking.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <button
                          className="font-poppins-light cursor-pointer text-[12px] py-[10px] px-[20px] rounded-[4px] bg-lightpink text-pink"
                          onClick={() => handleViewBooking(booking)}
                        >
                          View
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="flex items-center justify-center py-8">
                    <div className="text-center text-gray-500">
                      <p>No bookings found</p>
                    </div>
                  </li>
                )}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Overview;
