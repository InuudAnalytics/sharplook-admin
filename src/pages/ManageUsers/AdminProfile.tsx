import { useState, useEffect } from "react";
import { FiSearch, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";
import { Formik, Form } from "formik";
import type { FormikHelpers } from "formik";
import { BiEditAlt } from "react-icons/bi";
import { HttpClient } from "../../../api/HttpClient";
import * as Yup from "yup";
import { useToast } from "../../components/useToast";
import { ScaleLoader } from "react-spinners";
import { DateConverter } from "../../components/DateConverter";
import UserAvatar from "../../components/UserAvatar";
import { AxiosError } from "axios";

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  adminRole: string | null;
  createdAt: string;
  phone?: string;
}

interface AdminFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: string;
}

interface EditAdminFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

const AdminProfile = () => {
  const [tab, setTab] = useState("user");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rowsPerPage = 10;
  const { showToast } = useToast();

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await HttpClient.get("/admin/getAllAdmins");
      if (response.data.success) {
        setAdmins(response.data.data);
      } else {
        setError("Failed to fetch admins");
        showToast("Failed to fetch admins", { type: "error" });
      }
    } catch (error) {
      setError("Failed to fetch admins");
      // Don't show toast for 403 status code
      if (error instanceof AxiosError && error.response?.status === 403) {
        // Skip showing toast for 403
      } else {
        showToast("Failed to fetch admins", { type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };
  // Validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    phone: Yup.string().required("Phone number is required"),
    role: Yup.string().required("Role is required"),
  });

  const roleOptions = [
    { value: "SUPERADMIN", label: "Super Admin" },
    { value: "ADMIN", label: "Admin" },
    { value: "ANALYST", label: "Analyst" },
    { value: "CONTENT_MANAGER", label: "Content Manager" },
    { value: "SUPPORT", label: "Support" },
  ];

  const handleCreateAdmin = async (
    values: AdminFormValues,
    { resetForm }: FormikHelpers<AdminFormValues>
  ) => {
    setIsSubmitting(true);
    try {
      const adminData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: values.role,
      };

      await HttpClient.post("/admin/createAdmin", adminData);
      setShowAddAdminModal(false);
      resetForm();
      showToast("Admin created successfully", { type: "success" });
      // Refresh the admin list
      fetchAdmins();
    } catch (error) {
      // Don't show toast for 403 status code
      if (error instanceof AxiosError && error.response?.status === 403) {
        // Skip showing toast for 403
      } else {
        showToast("Failed to create admin", { type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete admin function
  const handleDeleteAdmin = async (admin: Admin) => {
    setIsDeleting(true);
    try {
      await HttpClient.delete(`/admin/deleteAdmin/${admin.id}`);
      showToast("Admin deleted successfully", { type: "success" });
      setShowDeleteConfirm(false);
      setAdminToDelete(null);
      // Refresh the admin list
      fetchAdmins();
    } catch (error) {
      // Don't show toast for 403 status code
      if (error instanceof AxiosError && error.response?.status === 403) {
        // Skip showing toast for 403
      } else {
        showToast("Failed to delete admin", { type: "error" });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit admin function
  const handleEditAdmin = async (
    values: EditAdminFormValues,
    { resetForm }: FormikHelpers<EditAdminFormValues>
  ) => {
    if (!selectedAdmin) return;

    setIsSubmitting(true);
    try {
      const adminData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        role: values.role,
        isBanned: false,
        powerGiven: true,
      };

      await HttpClient.patch(
        `/admin/deleteAdmin/${selectedAdmin.id}`,
        adminData
      );
      setShowEditAdminModal(false);
      setSelectedAdmin(null);
      resetForm();
      showToast("Admin updated successfully", { type: "success" });
      // Refresh the admin list
      fetchAdmins();
    } catch (error) {
      // Don't show toast for 403 status code
      if (error instanceof AxiosError && error.response?.status === 403) {
        // Skip showing toast for 403
      } else {
        showToast("Failed to update admin", { type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowEditAdminModal(true);
  };

  // Open delete confirmation
  const openDeleteConfirm = (admin: Admin) => {
    setAdminToDelete(admin);
    setShowDeleteConfirm(true);
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      `${admin.firstName} ${admin.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase()) ||
      admin.role.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedAdmins = filteredAdmins.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const formatRole = (role: string) => {
    // Handle common role formats
    const roleMap: { [key: string]: string } = {
      SUPERADMIN: "Super Admin",
      SUPER_ADMIN: "Super Admin",
      "SUPER ADMIN": "Super Admin",
      ADMIN: "Admin",
      ANALYST: "Analyst",
      CONTENT_MANAGER: "Content Manager",
      CONTENTMANAGER: "Content Manager",
      SUPPORT: "Support",
    };

    // Check if we have a direct mapping
    if (roleMap[role.toUpperCase()]) {
      return roleMap[role.toUpperCase()];
    }

    // Handle general formatting for unknown roles
    return role
      .split(/[_\s]+/) // Split by underscore or space
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (loading) {
    return (
      <div className="p-8 bg-lightgray pt-[80px] min-h-screen flex items-center justify-center">
        <ScaleLoader color="#E91E63" height={30} width={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-lightgray pt-[80px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={fetchAdmins}
            className="bg-pink text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-lightgray pt-[80px] min-h-screen">
      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl shadow-lg relative">
            <button
              className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-pink-600 text-2xl"
              onClick={() => setShowAddAdminModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="text-[16px] font-poppins-medium mb-6">
                Fill in the details below
              </div>
              <Formik
                initialValues={{
                  firstName: "",
                  lastName: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  phone: "",
                  role: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleCreateAdmin}
              >
                {({ errors, touched, values, handleChange, handleBlur }) => (
                  <Form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={values.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter first name"
                          className={`w-full px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0] ${
                            errors.firstName && touched.firstName
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {errors.firstName && touched.firstName && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.firstName}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={values.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter last name"
                          className={`w-full px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0] ${
                            errors.lastName && touched.lastName
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {errors.lastName && touched.lastName && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.lastName}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter email address"
                          className={`w-full px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0] ${
                            errors.email && touched.email
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {errors.email && touched.email && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.email}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={values.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter phone number"
                          className={`w-full px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0] ${
                            errors.phone && touched.phone
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {errors.phone && touched.phone && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.phone}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <select
                          name="role"
                          value={values.role}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0] ${
                            errors.role && touched.role ? "border-red-500" : ""
                          }`}
                        >
                          <option value="">Select a role</option>
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.role && touched.role && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.role}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter password"
                            className={`w-full px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0] pr-10 ${
                              errors.password && touched.password
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          <span
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </span>
                        </div>
                        {errors.password && touched.password && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.password}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Confirm password"
                            className={`w-full px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0] pr-10 ${
                              errors.confirmPassword && touched.confirmPassword
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          <span
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            aria-label="Toggle password visibility"
                          >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          </span>
                        </div>
                        {errors.confirmPassword && touched.confirmPassword && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.confirmPassword}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-pink cursor-pointer text-white px-8 py-3 mt-7 rounded font-poppins-regular text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <ScaleLoader color="#fff" height={15} width={2} />
                        ) : (
                          "Create Admin"
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
      {/* Edit Admin Modal */}
      {showEditAdminModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl shadow-lg relative">
            <button
              className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-pink-600 text-2xl"
              onClick={() => {
                setShowEditAdminModal(false);
                setSelectedAdmin(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="text-[16px] font-poppins-medium mb-6">
                Edit Admin Details
              </div>
              <Formik
                initialValues={{
                  firstName: selectedAdmin.firstName,
                  lastName: selectedAdmin.lastName,
                  email: selectedAdmin.email,
                  phone: selectedAdmin.phone || "",
                  role: selectedAdmin.role,
                }}
                validationSchema={Yup.object({
                  firstName: Yup.string().required("First name is required"),
                  lastName: Yup.string().required("Last name is required"),
                  email: Yup.string()
                    .email("Invalid email format")
                    .required("Email is required"),
                  phone: Yup.string().required("Phone number is required"),
                  role: Yup.string().required("Role is required"),
                })}
                onSubmit={handleEditAdmin}
              >
                {({ errors, touched, values, handleChange, handleBlur }) => (
                  <Form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={values.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter first name"
                          className={`w-full px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0] ${
                            errors.firstName && touched.firstName
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {errors.firstName && touched.firstName && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.firstName}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={values.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter last name"
                          className={`w-full px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0] ${
                            errors.lastName && touched.lastName
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {errors.lastName && touched.lastName && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.lastName}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter email address"
                          className={`w-full px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0] ${
                            errors.email && touched.email
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                        {errors.email && touched.email && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.email}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <select
                          name="role"
                          value={values.role}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 border-[0.5px] rounded-lg focus:outline-none focus:ring focus:ring-pink focus:border-pink transition-colors text-gray-800 bg-white border-[#DCDEE0] ${
                            errors.role && touched.role ? "border-red-500" : ""
                          }`}
                        >
                          <option value="">Select a role</option>
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.role && touched.role && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.role}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-pink cursor-pointer text-white px-8 py-3 mt-7 rounded font-poppins-regular text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <ScaleLoader color="#fff" height={15} width={2} />
                        ) : (
                          "Update Admin"
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative">
            <div className="text-center">
              <div className="text-[18px] font-poppins-medium mb-4">
                Delete Admin
              </div>
              <div className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-medium">
                  {adminToDelete.firstName} {adminToDelete.lastName}
                </span>
                ? This action cannot be undone.
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setAdminToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAdmin(adminToDelete)}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <ScaleLoader color="#fff" height={12} width={2} />
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[14px] text-[#909090] font-poppins-regular">
          Admin/Admin Profile
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
        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-6 border-b border-[#D1D2D3] pb-6">
          <div className="relative bg-[#EFF2F6] w-full max-w-[500px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email and role"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 rounded bg-[#EFF2F6] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-100 text-[15px]"
            />
          </div>
          <button
            className="bg-pink cursor-pointer text-white px-6 py-2 rounded font-medium ml-auto"
            onClick={() => setShowAddAdminModal(true)}
          >
            + Add New Admin
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#E4E4EF] pb-4 mb-4">
          <button
            className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${
              tab === "user" ? "bg-[#EFF2F6] text-black " : "text-[#C5C5C5]"
            }`}
            onClick={() => setTab("user")}
          >
            User Management
          </button>
          <button
            className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${
              tab === "roles" ? "bg-[#EFF2F6] text-black " : "text-[#C5C5C5]"
            }`}
            onClick={() => setTab("roles")}
            disabled
          >
            Roles/Permissions
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-100 w-full bg-white">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-[#F5F5F5] text-[13px] font-poppins-regular">
                <th className="p-3 text-left">Admin Detail</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Date Added</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdmins.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    {search
                      ? "No admins found matching your search."
                      : "No admins found."}
                  </td>
                </tr>
              )}
              {paginatedAdmins.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-b border-[#E4E4EF] last:border-b-0 hover:bg-[#F9F9F9]"
                >
                  <td className="p-3 flex text-[14px] items-center gap-3 min-w-[220px] font-poppins-medium">
                    <UserAvatar
                      user={{
                        firstName: admin.firstName,
                        lastName: admin.lastName,
                        role: admin.role,
                        avatar: undefined,
                      }}
                      size="md"
                    />
                    <div>
                      <div className="font-poppins-medium text-gray-800 text-[14px]">
                        {admin.firstName} {admin.lastName}
                      </div>
                      <div className="text-[12px] font-poppins-regular text-[#80808099]">
                        {admin.email}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-[14px] font-poppins-medium">
                    {formatRole(admin.role)}
                  </td>
                  <td className="p-3 text-[14px] font-poppins-medium">
                    {DateConverter(admin.createdAt)}
                  </td>
                  <td className="p-3">
                    <span className="text-green-600 font-medium">Active</span>
                  </td>
                  <td className="p-3 flex gap-8">
                    <button
                      className="text-gray-400 cursor-pointer hover:text-red"
                      onClick={() => openEditModal(admin)}
                    >
                      <BiEditAlt className="w-5 h-5" />
                    </button>
                    <button
                      className="text-gray-400 cursor-pointer hover:text-red"
                      onClick={() => openDeleteConfirm(admin)}
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination and controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-3">
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded border border-gray-200 text-gray-400 bg-white"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              <button className="px-3 py-1 rounded border border-pink-600 bg-pink-600 text-white">
                {page}
              </button>
              {Math.ceil(filteredAdmins.length / rowsPerPage) > 1 && (
                <button
                  className="px-3 py-1 rounded border border-gray-200 bg-white"
                  onClick={() => setPage(page + 1)}
                >
                  {page + 1}
                </button>
              )}
              <button
                className="px-3 py-1 rounded border border-gray-200 bg-white"
                disabled={
                  page >= Math.ceil(filteredAdmins.length / rowsPerPage)
                }
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
            <div className="text-sm text-gray-500 font-poppins-regular">
              Showing {(page - 1) * rowsPerPage + 1} to{" "}
              {Math.min(page * rowsPerPage, filteredAdmins.length)} of{" "}
              {filteredAdmins.length}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-poppins-regular">
                Rows per page
              </span>
              <select className="border border-gray-200 rounded px-2 py-1 text-sm">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
