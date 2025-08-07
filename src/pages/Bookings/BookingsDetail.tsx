import React, { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
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
  bio: string;
  location: string;
  serviceType: string;
  specialties: string[];
  serviceRadiusKm: number;
  profileImage: string | null;
  pricing: unknown | null;
  latitude: number;
  longitude: number;
  createdAt: string;
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
  vendorOnboarding?: VendorOnboarding;
}

interface BookingDetail {
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

const statusColor: Record<string, string> = {
  REJECTED: "bg-[#F99D9766] text-red",
  ACCEPTED: "bg-[#EBF6EB] text-[#06402B]",
  PENDING: "bg-[#f8bd0044] text-yellow",
  COMPLETED: "bg-[#EBF6EB] text-[#06402B]",
  DISPUTED: "bg-[#F99D9766] text-red",
};
const trackingColor: Record<string, string> = {
  COMPLETED: "bg-[#EBF6EB] text-[#06402B]",
  LOCKED: "bg-[#00000033] text-gray",
  PENDING: "bg-[#f8bd0044] text-yellow",
};

const BookingsDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get booking data from location state
  const bookingData = location.state?.booking;

  useEffect(() => {
    if (bookingData) {
      setBooking(bookingData);
    } else {
      setError("No booking data provided");
    }
  }, [bookingData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };
  if (error || !booking) {
    return (
      <div className="p-8 pt-[75px] bg-lightgray min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Booking not found"}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-pink text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  console.log({ booking });
  return (
    <div className="p-8 pt-[75px] bg-lightgray min-h-screen">
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
      <div className="mx-auto">
        <div className="bg-white py-2 pl-5 mb-3 rounded-[5px]">
          <button
            onClick={() => navigate(-1)}
            className=" text-gray-500 cursor-pointer hover:text-pink-600 flex items-center gap-2"
          >
            <IoIosArrowBack size={24} />
          </button>
        </div>
        {/* Booking Details */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="">
            <div className="text-[18px] font-poppins-regular text-gray-800">
              Booking Details
            </div>
            <div className="flex pt-3 text-[14px] font-poppins-regular items-center gap-2 text-sm text-[#C5C5C5]">
              <span>
                Booking ID:{" "}
                <span className="text-black font-medium">
                  {HexConverter(booking?.id)}
                </span>
              </span>
              <span className="hidden md:inline">|</span>
              <span>
                Date booked:{" "}
                <span className="text-black font-medium">
                  {formatDate(booking.createdAt)}
                </span>
              </span>
              <span className="hidden md:inline">|</span>
              <span>
                Status:{" "}
                <span
                  className={`px-3 py-1 rounded-[5px] text-xs font-semibold ml-1 ${
                    statusColor[booking.status] || ""
                  }`}
                >
                  {booking.status}
                </span>
              </span>
              <span className="hidden md:inline">|</span>
              <span>
                Tracking:{" "}
                <span
                  className={`px-3 py-1 rounded-[5px] text-xs font-semibold ml-1 ${
                    trackingColor[booking.paymentStatus] || ""
                  }`}
                >
                  {booking.paymentStatus}
                </span>
              </span>
            </div>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="font-poppins-regular text-[14px] border-[#EFF2F6] border-t">
                  <th className="py-2 text-left">Service Booked</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="font-poppins-regular text-[14px] text-[#00000066]">
                <tr>
                  <td className="py-2 text-left">1. {booking.serviceName}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(booking.price)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Payment Summary */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="text-[18px] font-poppins-regular text-gray-800 mb-4">
            Payment Summary
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between pb-2 text-sm">
              <span className="text-[14px] font-poppins-regular">
                Total Payment
              </span>
              <span className="font-poppins-medium text-[14px]">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-[14px] text-[#00000066]">
              <span>Payment Method</span>
              <span>{booking.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-[14px] text-[#00000066]">
              <span>Payment Status</span>
              <span>{booking.paymentStatus}</span>
            </div>
          </div>
        </div>
        {/* Customer's Details */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="text-[18px] font-poppins-regular text-gray-800 mb-4">
            Customer's Details
          </div>
          <div className="flex flex-col text-[14px] gap-2 text-sm">
            <div className="flex justify-between pb-2">
              <span className="font-poppins-regular">Name</span>
              <span className="font-poppins-medium">
                {`${booking.client.firstName} ${booking.client.lastName}`}
              </span>
            </div>
            <div className="flex justify-between text-[#00000066] pb-2">
              <span className="font-poppins-regular">Phone Number</span>
              <span className="font-poppins-medium">
                {booking.client.phone}
              </span>
            </div>
            <div className="flex justify-between text-[#00000066]">
              <span className="font-poppins-regular">Address</span>
              <span className="font-poppins-medium text-right max-w-[400px] w-full">
                {booking?.fullAddress || "Not provided"}
              </span>
            </div>
          </div>
        </div>
        {/* Vendor's Details */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="text-[18px] font-poppins-regular text-gray-800 mb-4">
            Vendor's Details
          </div>
          <div className="flex text-[14px] flex-col gap-2 text-sm">
            <div className="flex justify-between pb-2">
              <span className="font-poppins-regular">Name</span>
              <span className="font-poppins-medium">{`${booking.vendor.vendorOnboarding?.businessName}`}</span>
            </div>

            <div className="flex justify-between text-[#00000066] pb-2">
              <span className="font-poppins-regular">Phone Number</span>
              <span className="font-poppins-medium">
                {booking?.vendor?.phone || "Not provided"}
              </span>
            </div>
            <div className="flex justify-between text-[#00000066]">
              <span className="font-poppins-regular">Address</span>
              <span className="font-poppins-medium text-right max-w-[400px] w-full">
                {booking.vendor.vendorOnboarding?.location || "Not provided"}
              </span>
            </div>
          </div>
        </div>
        {/* Service Details */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="text-[18px] font-poppins-regular text-gray-800 mb-4">
            Service Details
          </div>
          <div className="flex flex-col text-[14px] gap-2 text-sm">
            <div className="flex justify-between pb-2">
              <span className="font-poppins-regular">Service Name</span>
              <span className="font-poppins-medium">{booking.serviceName}</span>
            </div>
            <div className="flex justify-between text-[#00000066] pb-2">
              <span className="font-poppins-regular">Date</span>
              <span className="font-poppins-medium">
                {formatDate(booking.date)}
              </span>
            </div>
            <div className="flex justify-between text-[#00000066] pb-2">
              <span className="font-poppins-regular">Time</span>
              <span className="font-poppins-medium">{booking.time}</span>
            </div>
            <div className="flex justify-between text-[#00000066] pb-2">
              <span className="font-poppins-regular">Location</span>
              <span className="font-poppins-medium">
                {booking.serviceLocation || "Not provided"}
              </span>
            </div>
            <div className="flex justify-between text-[#00000066] pb-2">
              <span className="font-poppins-regular">Landmark</span>
              <span className="font-poppins-medium">
                {booking.landmark || "Not provided"}
              </span>
            </div>
            <div className="flex justify-between text-[#00000066] pb-2">
              <span className="font-poppins-regular">Special Instructions</span>
              <span className="font-poppins-medium">
                {booking.specialInstruction || "None"}
              </span>
            </div>
          </div>
        </div>
        {/* Refund Button (only for rejected/pending) */}
        {booking.status === "REJECTED" && (
          <div className="flex justify-end mt-8">
            <button className="bg-pink text-white cursor-pointer px-8 py-3 rounded-[4px] font-poppins-regular text-[16px] hover:bg-pink-700">
              Refund Client
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsDetail;
