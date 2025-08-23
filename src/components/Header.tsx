import Logo from "../assets/img/sharplooklogo.svg";
import { MdChatBubbleOutline, MdNotificationsNone } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import useAppContext from "../context/useAppContext";
import UserAvatar from "./UserAvatar";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAppContext();

  return (
    <header className="bg-white px-8 py-2 flex items-center justify-between border-[#0000004D] border-b">
      <div className="flex items-center gap-[200px]">
        <img src={Logo} className="w-[80px]" alt="logo" />
        <h1 className="text-[25px] font-poppins-regular text-gray-800">
          {currentPath === "/dashboard"
            ? "OverView"
            : currentPath === "/analytics"
            ? "Analytics"
            : currentPath === "/product"
            ? "Product Management"
            : currentPath === "/bookings"
            ? "Bookings"
            : currentPath === "/manage-users"
            ? "Manage Users"
            : currentPath === "/services"
            ? "Services"
            : currentPath === "/disputes"
            ? "Disputes"
            : currentPath === "/adminprofile"
            ? "Admin Profile"
            : currentPath === "/notification"
            ? "Notification"
            : currentPath === "/transaction-history"
            ? "Transaction History"
            : currentPath === "/chat-inbox"
            ? "Chat Inbox"
            : ""}
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-8">
          <button
            className="relative cursor-pointer"
            onClick={() =>
              window.open("https://dashboard.tawk.to/#/dashboard", "_blank")
            }
          >
            <MdChatBubbleOutline className="text-gray-500 text-2xl" />
          </button>
          <button
            className="relative cursor-pointer"
            onClick={() => navigate("/notification")}
          >
            <MdNotificationsNone className="text-gray-500 text-2xl" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <UserAvatar
            user={user}
            size="md"
            onClick={() => navigate("/adminprofile")}
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 text-sm">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-gray-500">
              {user?.role
                ? user.role.charAt(0).toUpperCase() +
                  user.role.slice(1).toLowerCase()
                : ""}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
