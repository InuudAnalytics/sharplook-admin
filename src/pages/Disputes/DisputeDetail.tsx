import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { HttpClient } from "../../../api/HttpClient";

import { isAxiosError } from "axios";
import { useToast } from "../../components/useToast";
import { ScaleLoader } from "react-spinners";
import { DateTimeConverter } from "../../components/DateTimeConverter";

// Define types based on API response
interface DisputeUser {
  id: string;
  firstName: string;
  lastName: string;
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
  disputeImage?: string; // Added for product disputes
}

const DisputeDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [marking, setMarking] = useState(false);
  const { showToast } = useToast();
  const dispute: Dispute | null = location.state?.dispute || null;
  const handleDispute = async () => {
    setMarking(true);
    try {
      let res;
      // If product dispute (has vendorOrderId or disputeImage), use product endpoint
      if (dispute && ("vendorOrderId" in dispute || dispute.disputeImage)) {
        res = await HttpClient.patch("/disputes/updateDispute", {
          status: "RESOLVED",
          disputeId: dispute.id,
        });
      } else {
        // Service dispute (default logic)
        res = await HttpClient.patch(`admin/disputes/${dispute?.id}/resolve`, {
          resolution: `Resolved in favor of ${dispute?.raisedBy.firstName} ${dispute?.raisedBy.lastName}`,
        });
      }
      showToast(res.data.message, { type: "success" });
      navigate(-1);
    } catch (error) {
      if (isAxiosError(error)) {
        // Don't show toast for 403 status code
        if (error.response?.status !== 403) {
          showToast(error.response?.data.message, { type: "error" });
        }
      } else if (error instanceof Error) {
        showToast(error.message, { type: "error" });
      } else {
        showToast("An unknown error occurred", { type: "error" });
      }
    } finally {
      setMarking(false);
    }
  };
  if (!dispute) {
    return (
      <div className="p-8 bg-lightgray pt-[80px] min-h-screen">
        <div className="bg-white rounded-[5px] mx-auto p-8 min-h-[500px] max-w-5xl relative">
          <div className="flex items-center justify-between border-b border-[#EFF2F6] pb-6 mb-8">
            <button onClick={() => navigate(-1)} className="cursor-pointer">
              <IoIosArrowBack size={24} />
            </button>
          </div>
          <div className="text-center text-gray-500">Dispute not found.</div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-8 bg-lightgray pt-[80px] min-h-screen">
      <div className="bg-white rounded-[5px] mx-auto p-8 min-h-[500px] max-w-5xl relative">
        <div className="flex items-center justify-between border-b border-[#EFF2F6] pb-6 mb-8">
          <button onClick={() => navigate(-1)} className="cursor-pointer">
            <IoIosArrowBack size={24} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-6 mb-8 text-[15px] font-poppins-regular text-[#C5C5C5]">
          <span>
            Date of complaint:{" "}
            <span className="text-black">
              {DateTimeConverter(dispute.createdAt)}
            </span>
          </span>
          <span>|</span>
          <span>
            Made by:{" "}
            <span className="text-black">
              {dispute.raisedBy.firstName} {dispute.raisedBy.lastName}
            </span>
          </span>
          <span>|</span>
          <span className="flex items-center">
            Status:
            <span
              className={`ml-2 px-3 py-1 rounded-[5px] text-xs font-semibold ${
                dispute.status === "RESOLVED"
                  ? "bg-green-50 text-green"
                  : dispute.status === "PENDING"
                  ? "bg-yellow-100 text-yellow"
                  : "bg-red-100 text-red"
              }`}
            >
              {dispute.status === "PENDING"
                ? "Pending"
                : dispute.status === "RESOLVED"
                ? "Resolved"
                : "Unresolved"}
            </span>
          </span>
        </div>

        {/* Complaint */}
        <div className="mb-6">
          <span className="text-black font-semibold block mb-1 text-[16px] font-poppins-medium">
            Complaint:
          </span>
          <div className="text-[#C5C5C5] text-[14px] font-poppins-regular leading-relaxed">
            {dispute.reason}
          </div>
          {/* Show service dispute image if available */}
          {dispute?.booking?.referencePhoto && (
            <div className="my-6">
              <span className="text-black font-semibold block mb-1 text-[16px] font-poppins-medium">
                Picture Added
              </span>
              <img
                src={dispute.booking.referencePhoto}
                alt="Dispute evidence"
                className="border border-gray-400 rounded w-[220px] h-auto object-contain bg-white"
              />
            </div>
          )}
          {/* Show product dispute image if available */}
          {dispute?.disputeImage && (
            <div className="my-6">
              <span className="text-black font-semibold block mb-1 text-[16px] font-poppins-medium">
                Picture Added
              </span>
              <img
                src={dispute.disputeImage}
                alt="Dispute evidence"
                className="border border-gray-400 rounded w-[220px] h-auto object-contain bg-white"
              />
            </div>
          )}
        </div>
        {/* Resolution */}
        {/* {dispute.resolution && (
          <div className="mb-6">
            <span className="text-black font-semibold block mb-1 text-[16px] font-poppins-medium">
              Resolution:
            </span>
            <div className="text-[#C5C5C5] text-[14px] font-poppins-regular leading-relaxed">
              {dispute.resolution}
            </div>
          </div>
        )} */}
        {/* (legacy) Show imageUrl if present (for backward compatibility) */}
        {dispute.imageUrl && (
          <div className="mb-6">
            <span className="text-black font-semibold block mb-1 text-[16px] font-poppins-medium">
              Picture Added
            </span>
            <img
              src={dispute.imageUrl}
              alt="Dispute evidence"
              className="border border-gray-400 rounded w-[220px] h-auto object-contain bg-white"
            />
          </div>
        )}
        {/* Mark as Resolved button */}
        <button
          className={`absolute bottom-8 right-8 cursor-pointer px-10 py-3 rounded bg-pink text-white text-[14px] font-poppins-regular disabled:opacity-40 disabled:cursor-not-allowed shadow`}
          disabled={dispute.status === "RESOLVED"}
          onClick={handleDispute}
        >
          {marking ? (
            <ScaleLoader color="#fff" height={15} width={2} />
          ) : (
            "Mark as Resolved"
          )}
        </button>
      </div>
    </div>
  );
};

export default DisputeDetail;
