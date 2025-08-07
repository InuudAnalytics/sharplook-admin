import { FiArrowLeft } from "react-icons/fi";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextField from "../../components/TextField";
import { HttpClient } from "../../../api/HttpClient";
import { useToast } from "../../components/useToast";
import { ScaleLoader } from "react-spinners";
import { AxiosError } from "axios";
import { useState } from "react";

const AddServiceSchema = Yup.object().shape({
  name: Yup.string().required("Service name is required"),
});

const AddService = ({ onBack }: { onBack: () => void }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { name: string }) => {
    setLoading(true);
    try {
      const res = await HttpClient.post("/admin/addServiceCategory", {
        name: values.name,
      });
      showToast(res.data.message || "Service added successfully", {
        type: "success",
      });
      onBack();
    } catch (error) {
      if (error instanceof AxiosError) {
        showToast(error.response?.data.message || "Failed to add service", {
          type: "error",
        });
      } else if (error instanceof Error) {
        showToast(error.message, { type: "error" });
      } else {
        showToast("An unknown error occurred", { type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen pt-10 bg-lightgray">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Breadcrumb and Date */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-[14px] text-[#909090] font-poppins-regular">
              Admin/Service
            </div>
            <div className="text-[14px] text-[#909090] font-poppins-regular">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-pink transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-poppins-bold text-gray-800">
                Add New Service
              </h1>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <Formik
              initialValues={{ name: "" }}
              validationSchema={AddServiceSchema}
              onSubmit={handleSubmit}
            >
              {() => (
                <Form className="space-y-6">
                  <TextField
                    label="Name"
                    name="name"
                    placeholder="Enter service name"
                  />

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="bg-pink cursor-pointer text-white px-6 py-2 rounded font-poppins-regular text-[14px] hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? (
                        <ScaleLoader color="#fff" height={15} width={2} />
                      ) : (
                        "Add Service"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onBack}
                      className="text-gray-600 cursor-pointer border border-gray-300 px-6 py-2 rounded font-poppins-regular text-[14px] hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddService;
