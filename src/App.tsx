import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { ScaleLoader } from "react-spinners";
import "./App.css";
import { AppProvider } from "./context/AppContext";
import useAppContext from "./context/useAppContext";
import Unauthorized from "./components/Unauthorized";
// import TawkTo from "./components/TawkTo";

const Login = lazy(() => import("./pages/Auth/Login"));
const Overview = lazy(() => import("./pages/Dashboard/Overview"));
const ManageUsers = lazy(() => import("./pages/ManageUsers/ManageUsers"));
const Analytics = lazy(() => import("./pages/Analytics/Analytics"));
const Product = lazy(() => import("./pages/Product/Product"));
const Bookings = lazy(() => import("./pages/Bookings/Bookings"));
const BookingsDetail = lazy(() => import("./pages/Bookings/BookingsDetail"));
const Services = lazy(() => import("./pages/Services/Services"));
const ServiceDetail = lazy(() => import("./pages/Services/ServiceDetail"));
const Disputes = lazy(() => import("./pages/Disputes/Disputes"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const ProductDetail = lazy(() => import("./pages/Product/ProductDetail"));
const EditProduct = lazy(() => import("./pages/Product/EditProduct"));
const DisputeDetail = lazy(() => import("./pages/Disputes/DisputeDetail"));
const AdminProfile = lazy(() => import("./pages/ManageUsers/AdminProfile"));
const Notification = lazy(() => import("./pages/Notification/Notification"));
// const ChatInbox = lazy(() => import("./pages/ChatInbox"));
const TransactionHistory = lazy(
  () => import("./pages/TransactionHistory/TransactionHistory")
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Unauthorized Route Component
const UnauthorizedRoute = () => {
  const { unauthorizedError } = useAppContext();

  if (unauthorizedError.show) {
    return <Unauthorized message={unauthorizedError.message} />;
  }

  return <Navigate to="/dashboard" replace />;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <ScaleLoader color="#EB278D" />
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Overview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="product" element={<Product />} />
          <Route path="product/detail" element={<ProductDetail />} />
          <Route path="product/edit" element={<EditProduct />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/detail" element={<BookingsDetail />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="services" element={<Services />} />
          <Route path="services/detail" element={<ServiceDetail />} />
          <Route path="disputes" element={<Disputes />} />
          <Route path="disputes/:id" element={<DisputeDetail />} />
          <Route path="adminprofile" element={<AdminProfile />} />
          <Route path="notification" element={<Notification />} />
          {/* <Route path="chat-inbox" element={<ChatInbox />} /> */}
          <Route path="transaction-history" element={<TransactionHistory />} />
          <Route path="unauthorized" element={<UnauthorizedRoute />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <>
      {/* <TawkTo /> */}
      <Router>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </Router>
    </>
  );
}

export default App;
