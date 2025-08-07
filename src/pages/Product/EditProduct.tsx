import React, { useState, useRef } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { HttpClient } from "../../../api/HttpClient";
import { useToast } from "../../components/useToast";
import { ScaleLoader } from "react-spinners";

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

const EditProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product as Product;
  const { showToast } = useToast();

  // Form state
  const [productName, setProductName] = useState(product?.productName || "");
  const [price, setPrice] = useState(product?.price || 0);
  const [qtyAvailable, setQtyAvailable] = useState(product?.qtyAvailable || 0);
  const [description, setDescription] = useState(product?.description || "");
  const [approvalStatus, setApprovalStatus] = useState(
    product?.approvalStatus || "PENDING"
  );
  const [serviceImage, setServiceImage] = useState(product?.picture || "");
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setServiceImage(imageUrl);
      // Reset input value so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!productName.trim() || price <= 0 || qtyAvailable < 0) {
      showToast("Please fill in all required fields correctly", {
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        productName,
        price,
        qtyAvailable,
        description,
        approvalStatus,
        serviceImage,
      };

      await HttpClient.put(`/admin/products/${product.id}`, updateData);
      showToast("Product updated successfully", { type: "success" });
      navigate(-1);
    } catch (error) {
      console.error("Error updating product:", error);
      showToast("Failed to update product", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  return (
    <div className="p-8 bg-lightgray pt-[80px] min-h-screen">
      <div className="p-8 bg-white rounded-[5px] mx-auto">
        <div className="flex items-center gap-5 border-b border-[#EFF2F6] pb-6 mb-8">
          <button onClick={() => navigate(-1)} className="cursor-pointer">
            <IoIosArrowBack size={24} />
          </button>
          <h2 className="text-[22px] font-poppins-medium">Edit Product</h2>
        </div>
        <div className="flex gap-2 text-[14px] font-poppins-regular items-center mb-6 text-[#C5C5C5]">
          <span>
            Date Uploaded:{" "}
            <span className="text-black">{formatDate(product.createdAt)}</span>
          </span>
          <span>|</span>
          <span>
            Quantity: <span className="text-black">{product.qtyAvailable}</span>
          </span>
          <span>|</span>
          <span>
            Units Sold: <span className="text-black">{product.unitsSold}</span>
          </span>
        </div>
        <div className="flex flex-row gap-12">
          <div className="flex-1">
            <div className="mb-4">
              <label className="block text-[14px] font-poppins-regular mb-2">
                Product Name *
              </label>
              <input
                type="text"
                className="w-full border border-[#DCDEE0] outline-none rounded-lg px-3 py-2 text-[14px] font-poppins-regular"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-[14px] font-poppins-regular mb-2">
                Price *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-[#DCDEE0] outline-none rounded-lg px-3 py-2 text-[14px] font-poppins-regular"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-[14px] font-poppins-regular mb-2">
                Quantity Available *
              </label>
              <input
                type="number"
                min="0"
                className="w-full border border-[#DCDEE0] outline-none rounded-lg px-3 py-2 text-[14px] font-poppins-regular"
                placeholder="Enter quantity"
                value={qtyAvailable}
                onChange={(e) => setQtyAvailable(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-[14px] font-poppins-regular mb-2">
                Product Description
              </label>
              <textarea
                className="w-full border border-[#DCDEE0] outline-none rounded-lg px-3 py-2 text-[14px] font-poppins-regular"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="mb-4">
              <label className="block text-[14px] font-poppins-regular mb-2">
                Approval Status
              </label>
              <select
                className="w-full border border-[#DCDEE0] outline-none rounded-lg px-3 py-2 text-[14px] font-poppins-regular"
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value)}
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-2 text-[14px] font-poppins-regular">
              Product's Picture
            </div>
            <div className="relative w-32 h-32">
              {serviceImage && (
                <img
                  src={serviceImage}
                  alt="Product"
                  className="w-32 h-32 rounded object-cover mb-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/src/assets/img/sharplooklogo.svg";
                  }}
                />
              )}
              <button
                type="button"
                className="absolute top-0 right-0 cursor-pointer bg-white rounded-full p-1 shadow hover:bg-pink-100"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                aria-label="Add Image"
              >
                <FiPlus size={20} />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageAdd}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-12">
          <button
            className="bg-pink cursor-pointer text-white px-10 py-3 rounded text-[16px] font-poppins-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <ScaleLoader color="#fff" height={15} width={2} />
                <span>Saving...</span>
              </div>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
