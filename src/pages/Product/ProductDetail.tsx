import { useState } from "react";
import { BiEditAlt } from "react-icons/bi";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { HttpClient } from "../../../api/HttpClient";
import Modal from "../../components/Modal";
import { ScaleLoader } from "react-spinners";
import { useToast } from "../../components/useToast";

interface Product {
  id: string;
  vendorId: string;
  productName: string;
  description: string;
  price: number;
  qtyAvailable: number;
  unitsSold: number;
  status: string;
  picture: string;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
}

const ProductDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product as Product;

  // Modal states
  const [isApprovedModal, setIsApprovedModal] = useState(false);
  const [isRejectedModal, setIsRejectedModal] = useState(false);
  const [isApproveLoading, setIsApproveLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [rejectSuccess, setRejectSuccess] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { showToast } = useToast();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  const handleApprove = async () => {
    setIsApproveLoading(true);
    try {
      await HttpClient.patch(`/admin/products/${product.id}/approve`);
      setIsApprovedModal(false);
      setApproveSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.log(error);
      // Optionally show error toast
    } finally {
      setIsApproveLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast("Please provide a reason for rejection", { type: "error" });
      return;
    }

    setIsRejectLoading(true);
    try {
      const res = await HttpClient.patch(
        `/admin/products/${product.id}/reject`,
        {
          reason: rejectionReason,
        }
      );
      setIsRejectedModal(false);
      setRejectSuccess(true);
      showToast(res.data.message, { type: "success" });
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.log(error);
      showToast("Failed to reject product", { type: "error" });
    } finally {
      setIsRejectLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="mb-4 text-pink-600">
          &larr; Back
        </button>
        <div className="text-gray-500">No product data found.</div>
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
              Product's Detail
            </h2>
          </div>
          <button
            className="cursor-pointer hover:bg-lightpink rounded-[4px] p-1"
            onClick={() => navigate("/product/edit", { state: { product } })}
          >
            <BiEditAlt size={24} />
          </button>
        </div>
        <div className="flex flex-col gap-2 mb-4 text-sm text-gray-700">
          <div className="flex gap-2 text-[14px] font-poppins-regular items-center flex-wrap">
            <h1 className="text-[#C5C5C5]">
              Date Uploaded:{" "}
              <span className="text-[#000000]">
                {formatDate(product.createdAt)}
              </span>
            </h1>
            |
            <h1 className="text-[#C5C5C5]">
              {" "}
              Quantity:{" "}
              <span className="text-[#000000]">{product.qtyAvailable}</span>
            </h1>
            |
            <h1 className="text-[#C5C5C5]">
              {" "}
              Units Sold:{" "}
              <span className="text-[#000000]">{product.unitsSold}</span>
            </h1>
            |
            <h1 className="text-[#C5C5C5]">
              {" "}
              Vendor: <span className="text-[#000000]">-</span>
            </h1>
          </div>
          <div className="mt-6">
            <h1 className="text-[#C5C5C5] text-[14px] font-poppins-regular">
              Product:{" "}
              <span className="text-[#000000]">{product.productName}</span>
            </h1>
          </div>
          <div className="text-[#C5C5C5] font-poppins-regular text-[14px] mt-2">
            {product.description}
          </div>
          <div className="mt-4">
            <span className="text-[#C5C5C5] text-[14px] font-poppins-regular">
              Status:{" "}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                product.approvalStatus === "PENDING"
                  ? "bg-yellow-100 text-yellow-600"
                  : product.approvalStatus === "APPROVED"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {product.approvalStatus === "PENDING"
                ? "Pending"
                : product.approvalStatus === "APPROVED"
                ? "Approved"
                : product.approvalStatus === "REJECTED"
                ? "Rejected"
                : product.approvalStatus}
            </span>
          </div>
        </div>
        <div className="mb-4 mt-10">
          <h1 className="text-[14px] font-poppins-regular">
            Product's Picture
          </h1>
          <div className="mt-2">
            <img
              src={product.picture || "/src/assets/img/sharplooklogo.svg"}
              alt={product.productName}
              className="w-[220px] h-[220px] rounded object-cover border border-[#0000001A]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/src/assets/img/sharplooklogo.svg";
              }}
            />
          </div>
        </div>
        {product.approvalStatus === "PENDING" && (
          <div className="flex justify-end font-poppins-regular gap-4 text-[14px] mt-8">
            <button
              className="border border-pink cursor-pointer  text-pink px-6 py-2 rounded hover:bg-pink-50"
              onClick={() => setIsRejectedModal(true)}
            >
              Reject
            </button>
            <button
              className="bg-pink cursor-pointer text-white px-6 py-2 rounded hover:bg-pink-700"
              onClick={() => setIsApprovedModal(true)}
            >
              Approve
            </button>
          </div>
        )}
      </div>

      {/* Approval Confirmation Modal */}
      <Modal open={isApprovedModal} onClose={() => setIsApprovedModal(false)}>
        <div className="p-10">
          <h1 className="font-poppins-regular text-center text-[14px]">
            Are you sure you want to approve this product?
          </h1>
          <div className="flex justify-center gap-4 pt-10">
            <button
              className="bg-pink cursor-pointer text-white px-8 py-2 rounded-[4px] flex items-center justify-center min-w-[80px]"
              disabled={isApproveLoading}
              onClick={handleApprove}
            >
              {isApproveLoading ? (
                <ScaleLoader color="#fff" height={15} width={2} />
              ) : (
                "Yes"
              )}
            </button>
            <button
              className="text-pink border cursor-pointer border-pink px-8 py-2 rounded-[4px]"
              disabled={isApproveLoading}
              onClick={() => setIsApprovedModal(false)}
            >
              No
            </button>
          </div>
        </div>
      </Modal>

      {/* Rejection Confirmation Modal */}
      <Modal
        open={isRejectedModal}
        onClose={() => {
          setIsRejectedModal(false);
          setRejectionReason("");
        }}
      >
        <div className="p-10">
          <h1 className="font-poppins-regular text-center text-[14px] mb-4">
            Are you sure you want to reject this product?
          </h1>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
          <div className="flex justify-center gap-4">
            <button
              className="bg-red cursor-pointer text-white px-8 py-2 rounded-[4px] flex items-center justify-center min-w-[80px]"
              disabled={isRejectLoading}
              onClick={handleReject}
            >
              {isRejectLoading ? (
                <ScaleLoader color="#fff" height={15} width={2} />
              ) : (
                "Reject"
              )}
            </button>
            <button
              className="text-red border cursor-pointer border-red px-8 py-2 rounded-[4px]"
              disabled={isRejectLoading}
              onClick={() => {
                setIsRejectedModal(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Approval Success Modal */}
      <Modal open={approveSuccess} onClose={() => setApproveSuccess(false)}>
        <div className="p-10">
          <div className="flex justify-center">
            <div className="w-[150px] h-[150px] rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
          <h1 className="font-poppins-regular text-center text-[14px]">
            Product approved successfully
          </h1>
        </div>
      </Modal>

      {/* Rejection Success Modal */}
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
            Product rejected successfully
          </h1>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetail;
