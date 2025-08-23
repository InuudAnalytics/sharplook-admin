import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { HttpClient } from "../../../api/HttpClient";
import Modal from "../../components/Modal";
import { ScaleLoader } from "react-spinners";
import { useToast } from "../../components/useToast";
import { AxiosError } from "axios";

interface ServiceListing {
  id: string;
  userId: string;
  serviceName: string;
  servicePrice: number;
  serviceImage: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  vendor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const ServiceDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const service = location.state?.service as ServiceListing;

  // Modal states
  //   const [isApprovedModal, setIsApprovedModal] = useState(false);
  const [isRejectedModal, setIsRejectedModal] = useState(false);
  //   const [isApproveLoading, setIsApproveLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);
  //   const [approveSuccess, setApproveSuccess] = useState(false);
  const [rejectSuccess, setRejectSuccess] = useState(false);
  const { showToast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  //   const handleApprove = async () => {
  //     setIsApproveLoading(true);
  //     try {
  //       await HttpClient.patch(`/admin/services/${service.id}/approve`);
  //       setIsApprovedModal(false);
  //       setApproveSuccess(true);
  //       setTimeout(() => {
  //         navigate(-1);
  //       }, 1500);
  //     } catch (error) {
  //       console.log(error);
  //       showToast("Failed to approve service", { type: "error" });
  //     } finally {
  //       setIsApproveLoading(false);
  //     }
  //   };

  const handleReject = async () => {
    setIsRejectLoading(true);
    try {
      const res = await HttpClient.delete(
        `/admin/deleteVendorService/${service.id}`
      );
      setIsRejectedModal(false);
      setRejectSuccess(true);
      showToast(res.data.message || "Service deleted successfully", {
        type: "success",
      });
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      // Don't show toast for 403 status code
      if (error instanceof AxiosError && error.response?.status === 403) {
        // Skip showing toast for 403
      } else {
        showToast("Failed to delete service", { type: "error" });
      }
    } finally {
      setIsRejectLoading(false);
    }
  };

  if (!service) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="mb-4 text-pink-600">
          &larr; Back
        </button>
        <div className="text-gray-500">No service data found.</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-lightgray pt-[80px] min-h-screen">
      <div className="p-8 bg-white rounded-[5px] mx-auto">
        <div className="flex items-center justify-between border-b border-[#EFF2F6] pb-6 mb-8">
          <div className="flex items-center gap-5 ">
            <button onClick={() => navigate(-1)} className="cursor-pointer">
              <IoIosArrowBack size={24} />
            </button>
            <h2 className="text-[22px] font-poppins-medium">
              Service's Detail
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-2 mb-4 text-sm text-gray-700">
          <div className="flex gap-2 text-[14px] font-poppins-regular items-center flex-wrap">
            <h1 className="text-[#C5C5C5]">
              Date Uploaded:{" "}
              <span className="text-[#000000]">
                {formatDate(service.createdAt)}
              </span>
            </h1>
            |
            <h1 className="text-[#C5C5C5]">
              {" "}
              Amount:{" "}
              <span className="text-[#000000]">{service.servicePrice}</span>
            </h1>
            |
            <h1 className="text-[#C5C5C5]">
              {" "}
              Vendor:{" "}
              <span className="text-[#000000]">
                {service.vendor.firstName} {service.vendor.lastName}
              </span>
            </h1>
            |
            <h1 className="text-[#C5C5C5]">
              {" "}
              Service Type: <span className="text-[#000000]">In-shop</span>
            </h1>
          </div>
          <div className="mt-6">
            <h1 className="text-[#C5C5C5] text-[14px] font-poppins-regular">
              Service:{" "}
              <span className="text-[#000000]">{service.serviceName}</span>
            </h1>
          </div>
          <div className="text-[#C5C5C5] font-poppins-regular text-[14px] mt-2">
            {service.description}
          </div>
        </div>
        <div className="mb-4 mt-10">
          <h1 className="text-[14px] font-poppins-regular">
            Service's Picture
          </h1>
          <div className="mt-2">
            <img
              src={service.serviceImage || "/src/assets/img/sharplooklogo.svg"}
              alt={service.serviceName}
              className="w-[220px] h-[220px] rounded object-cover border border-[#0000001A]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/src/assets/img/sharplooklogo.svg";
              }}
            />
          </div>
        </div>
        <div className="flex justify-end font-poppins-regular gap-4 text-[14px] mt-8">
          <button
            className="border border-red cursor-pointer text-red px-6 py-2 rounded hover:bg-red-50"
            onClick={() => setIsRejectedModal(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Rejection Confirmation Modal */}
      <Modal
        open={isRejectedModal}
        onClose={() => {
          setIsRejectedModal(false);
        }}
      >
        <div className="p-10">
          <h1 className="font-poppins-regular text-center text-[14px] mb-6">
            Are you sure you want to delete this service?
          </h1>
          <div className="flex justify-center gap-4">
            <button
              className="bg-red cursor-pointer text-white px-8 py-2 rounded-[4px] flex items-center justify-center min-w-[80px]"
              disabled={isRejectLoading}
              onClick={handleReject}
            >
              {isRejectLoading ? (
                <ScaleLoader color="#fff" height={15} width={2} />
              ) : (
                "Delete"
              )}
            </button>
            <button
              className="text-red border cursor-pointer border-red px-8 py-2 rounded-[4px]"
              disabled={isRejectLoading}
              onClick={() => {
                setIsRejectedModal(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Deletion Success Modal */}
      <Modal open={rejectSuccess} onClose={() => setRejectSuccess(false)}>
        <div className="p-10">
          <div className="flex justify-center">
            <div className="w-[150px] h-[150px] rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
          </div>
          <h1 className="font-poppins-regular text-center text-[14px]">
            Service deleted successfully
          </h1>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceDetail;
