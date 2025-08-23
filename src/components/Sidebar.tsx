import { NavLink, useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuBox,
  LuCalendarCheck,
  LuUsers,
  LuLifeBuoy,
  LuGavel,
  LuLogOut,
  LuHistory,
} from "react-icons/lu";
import { IoBarChartOutline } from "react-icons/io5";
import useAppContext from "../context/useAppContext";
import { useToast } from "./useToast";

const Sidebar = () => {
  const navigate = useNavigate();
  const { setUser } = useAppContext();
  const { showToast } = useToast();

  const handleLogout = () => {
    // Clear user data
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Show success message
    showToast("Logged out successfully", { type: "success" });

    // Navigate to login page
    navigate("/login");
  };

  return (
    <aside className="max-w-[280px] w-full flex flex-col h-full">
      <nav className="pt-[50px] flex-1">
        <ul>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-gray w-full gap-3 pl-6 py-4 text-[16px] font-poppins-regular flex items-center ${
                  isActive ? "bg-pink text-white" : ""
                }`
              }
            >
              <LuLayoutDashboard className="text-[20px]" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `text-gray w-full gap-3 pl-6 py-4 text-[16px] font-poppins-regular flex items-center ${
                  isActive ? "bg-pink text-white" : ""
                }`
              }
            >
              <IoBarChartOutline className="text-[20px]" />
              Analytics
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/product"
              className={({ isActive }) =>
                `text-gray w-full gap-3 pl-6 py-4 text-[16px] font-poppins-regular flex items-center ${
                  isActive ? "bg-pink text-white" : ""
                }
              `
              }
            >
              <LuBox className="text-[20px]" />
              Product
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `text-gray w-full gap-3 pl-6 py-4 text-[16px] font-poppins-regular flex items-center ${
                  isActive ? "bg-pink text-white" : ""
                }
              `
              }
            >
              <LuCalendarCheck className="text-[20px]" />
              Bookings
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/manage-users"
              className={({ isActive }) =>
                `text-gray w-full gap-3 pl-6 py-4 text-[16px] font-poppins-regular flex items-center ${
                  isActive ? "bg-pink text-white" : ""
                }
              `
              }
            >
              <LuUsers className="text-[20px]" />
              Manage Users
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/services"
              className={({ isActive }) =>
                `text-gray w-full gap-3 pl-6 py-4 text-[16px] font-poppins-regular flex items-center ${
                  isActive ? "bg-pink text-white" : ""
                }
              `
              }
            >
              <LuLifeBuoy className="text-[20px]" />
              Services
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/disputes"
              className={({ isActive }) =>
                `text-gray w-full gap-3 pl-6 py-4 text-[16px] font-poppins-regular flex items-center ${
                  isActive ? "bg-pink text-white" : ""
                }
              `
              }
            >
              <LuGavel className="text-[20px]" />
              Disputes
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/transaction-history"
              className={({ isActive }) =>
                `text-gray w-full gap-3 pl-6 py-4 text-[16px] font-poppins-regular flex items-center ${
                  isActive ? "bg-pink text-white" : ""
                }
              `
              }
            >
              <LuHistory className="text-[20px]" />
              Transaction History
            </NavLink>
          </li>
        </ul>
      </nav>
      <button
        onClick={handleLogout}
        className="text-red w-full gap-3 pl-6 py-4 text-[16px] font-poppins-regular flex items-center mb-4 hover:bg-red-50 transition-colors"
        style={{ marginTop: "auto" }}
      >
        <LuLogOut className="text-[20px]" />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
