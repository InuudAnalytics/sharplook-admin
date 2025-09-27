import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { HttpClient } from "../../../api/HttpClient";
import { isAxiosError } from "axios";
import { useToast } from "../../components/useToast";
import { ScaleLoader } from "react-spinners";
import { DateTimeConverter } from "../../components/DateTimeConverter";

// Types omitted for brevity

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
    firstName: string;
    vendor: Vendor;
    clientCompleted: boolean;
    vendorCompleted: boolean;
    createdAt: string;
  }

  interface Vendor{
    firstName: string;
    lastName : string;
    vendorOnboarding : VendorOnboarding;
  }

  interface VendorOnboarding{
    businessName : string;
  }

  interface Dispute {
    id: string;
    reason: string;
    status: "PENDING" | "RESOLVED" | "UNRESOLVED";
    imageUrl: string | null;
    createdAt: string;
    raisedBy: DisputeUser;
    booking: DisputeBooking;
    disputeImage?: string;
  }


const DisputeDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [marking, setMarking] = useState(false);

  const dispute: Dispute | null = location.state?.dispute || null;

  const handleDispute = async () => {
    if (!dispute) return;
    setMarking(true);
    try {
      let res;
      if ("vendorOrderId" in dispute || dispute.disputeImage) {
        res = await HttpClient.patch("/disputes/updateDispute", {
          status: "RESOLVED",
          disputeId: dispute.id,
        });
      } else {
        res = await HttpClient.patch(`admin/disputes/${dispute.id}/resolve`, {
          resolution: `Resolved in favor of ${dispute.raisedBy.firstName} ${dispute.raisedBy.lastName}`,
        });
      }
      showToast(res.data.message, { type: "success" });
      navigate(-1);
    } catch (error) {
      if (isAxiosError(error)) {
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
      <main className="min-h-screen bg-gray-100 pt-24 px-6 flex justify-center items-center">
           <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="absolute top-8 left-8 p-2 rounded hover:bg-gray-200 transition"
          >
            <IoIosArrowBack size={26} />
          </button>
        <section className="bg-white rounded-lg shadow-md p-10 max-w-4xl w-full text-center">
       
          <p className="text-gray-500 text-lg font-medium">Dispute not found.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 pt-24 px-6 flex justify-center">
      <article className="bg-white rounded-lg shadow-lg max-w-5xl w-full relative p-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="absolute top-6 left-6 p-2 rounded hover:bg-gray-200 transition"
        >
          <IoIosArrowBack size={26} />
        </button>

        {/* Header Info */}
        <header className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium mb-8 mt-10">
          <p>
            <span className="font-semibold text-gray-900">Date of complaint:</span>{" "}
            {DateTimeConverter(dispute.createdAt)}
          </p>
          <span className="inline-block border-l border-gray-300 h-5" aria-hidden="true" />
          <p>
            <span className="font-semibold text-gray-900">Made by:</span>{" "}
            {dispute.raisedBy.firstName} {dispute.raisedBy.lastName}
          </p>
          <span className="inline-block border-l border-gray-300 h-5" aria-hidden="true" />
          <p className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                dispute.status === "RESOLVED"
                  ? "bg-green-100 text-green-800"
                  : dispute.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {dispute.status === "PENDING"
                ? "Pending"
                : dispute.status === "RESOLVED"
                ? "Resolved"
                : "Unresolved"}
            </span>
          </p>
        </header>

        {/* Complaint */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Complaint</h2>
          <p className="text-gray-700 leading-relaxed">{dispute.reason}</p>
        </section>

        {/* Dispute Images */}
        {(dispute.booking?.referencePhoto || dispute.disputeImage || dispute.imageUrl) && (
          <section className="mb-8">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Picture Added</h3>
            <div className="flex flex-wrap gap-6">
              {dispute.booking?.referencePhoto && (
                <img
                  src={dispute.booking.referencePhoto}
                  alt="Dispute evidence"
                  className="w-56 h-40 object-contain rounded border border-gray-300 bg-white shadow-sm"
                />
              )}
              {dispute.disputeImage && (
                <img
                  src={dispute.disputeImage}
                  alt="Dispute evidence"
                  className="w-56 h-40 object-contain rounded border border-gray-300 bg-white shadow-sm"
                />
              )}
              {dispute.imageUrl && (
                <img
                  src={dispute.imageUrl}
                  alt="Dispute evidence"
                  className="w-56 h-40 object-contain rounded border border-gray-300 bg-white shadow-sm"
                />
              )}
            </div>
          </section>
        )}

        {/* Vendor and Booking Details */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Details</h3>
            <dl className="space-y-3 text-gray-700">
              <div>
                <dt className="font-semibold text-gray-900">Vendor ID:</dt>
                <dd>{dispute.booking.vendorId}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Business Name:</dt>
                <dd>{dispute.booking.vendor.vendorOnboarding.businessName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Vendor Name:</dt>
                <dd>
                  {dispute.booking.vendor.firstName} {dispute.booking.vendor.lastName}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
            <dl className="space-y-3 text-gray-700">
              <div>
                <dt className="font-semibold text-gray-900">Service Booked:</dt>
                <dd>{dispute.booking.serviceName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Booking Address:</dt>
                <dd>{dispute.booking.fullAddress || "N/A"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Booking Status:</dt>
                <dd>{dispute.booking.status}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Payment Status:</dt>
                <dd>{dispute.booking.paymentStatus}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Total Amount:</dt>
                <dd>₦{dispute.booking.totalAmount.toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={handleDispute}
          disabled={dispute.status === "RESOLVED" || marking}
          className={`flex items-center justify-center gap-3 absolute bottom-8 right-8 rounded-lg px-12 py-3 text-white font-semibold text-sm shadow-lg transition ${
            dispute.status === "RESOLVED" || marking
              ? "bg-pink-300 cursor-not-allowed"
              : "bg-pink hover:bg-pink-dark cursor-pointer"
          }`}
        >
          {marking ? <ScaleLoader color="#fff" height={15} width={2} /> : "Mark as Resolved"}
        </button>
      </article>
    </main>
  );
};

export default DisputeDetail;
