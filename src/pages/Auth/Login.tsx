import { HttpClient } from "../../../api/HttpClient";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextField from "../../components/TextField";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/img/sharplooklogo.svg";
import useAppContext from "../../context/useAppContext";
import { useToast } from "../../components/useToast";
import { ScaleLoader } from "react-spinners";
import { AxiosError } from "axios";
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Password too short").required("Required"),
});

const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setUser } = useAppContext();
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const res = await HttpClient.post("/auth/login", values);
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
      showToast(res.data.message, { type: "success" });
    } catch (error) {
      if (error instanceof AxiosError) {
        showToast(error.response?.data.message, { type: "error" });
      } else if (error instanceof Error) {
        showToast(error.message, { type: "error" });
      } else {
        showToast("An unknown error occurred", { type: "error" });
      }
    }
  };
  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="w-1/2 bg-pink flex flex-col items-center justify-center">
        <button className="bg-white text-pink font-bold text-lg px-12 py-3 rounded-full shadow-none tracking-wide text-[22px] font-poppins-medium">
          ADMIN
        </button>
      </div>
      {/* Right Side */}
      <div className="w-1/2 flex flex-col items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center">
          <img src={Logo} alt="SharpLook Logo" className="w-[100px]" />
          <h2 className="text-[38px] font-poppins-semi-bold mb-6 text-[#023047] text-center">
            Login to your account
          </h2>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting }) => (
              <Form className="w-full flex flex-col gap-6">
                <TextField
                  label="E-mail address"
                  name="email"
                  type="email"
                  placeholder="Enter Email address"
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Enter Password"
                />
                <button
                  type="submit"
                  className="w-full mt-2 cursor-pointer bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ScaleLoader color="#fff" height={15} width={2} />
                  ) : (
                    "Login"
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Login;
