import React from "react";

interface UserAvatarProps {
  user: {
    firstName: string;
    lastName: string;
    role?: string;
    avatar?: string;
  } | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
  className = "",
  onClick,
}) => {
  if (!user) {
    return (
      <div
        className={`bg-gray-300 rounded-full flex items-center justify-center ${getSizeClasses(
          size
        )} ${className}`}
        onClick={onClick}
      >
        <span className="text-gray-600 font-medium">?</span>
      </div>
    );
  }

  // If user has a custom avatar, use it
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={`${user.firstName} ${user.lastName}`}
        className={`rounded-full object-cover cursor-pointer ${getSizeClasses(
          size
        )} ${className}`}
        onClick={onClick}
      />
    );
  }

  // Generate initials
  const initials = `${user.firstName?.charAt(0) || ""}${
    user.lastName?.charAt(0) || ""
  }`.toUpperCase();

  // Get role-specific colors
  const { bgColor, textColor } = getRoleColors(user.role);

  return (
    <div
      className={`${bgColor} ${textColor} rounded-full flex items-center justify-center font-semibold cursor-pointer ${getSizeClasses(
        size
      )} ${className}`}
      onClick={onClick}
      title={`${user.firstName} ${user.lastName} (${formatRole(user.role)})`}
    >
      {initials || "U"}
    </div>
  );
};

const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return "w-8 h-8 text-xs";
    case "md":
      return "w-10 h-10 text-sm";
    case "lg":
      return "w-12 h-12 text-base";
    default:
      return "w-10 h-10 text-sm";
  }
};

const getRoleColors = (role?: string) => {
  if (!role) {
    return {
      bgColor: "bg-gray-500",
      textColor: "text-white",
    };
  }
  const roleUpper = role.toUpperCase();

  switch (roleUpper) {
    case "SUPERADMIN":
    case "SUPER_ADMIN":
    case "SUPER ADMIN":
      return {
        bgColor: "bg-purple-600",
        textColor: "text-white",
      };
    case "ADMIN":
      return {
        bgColor: "bg-blue-600",
        textColor: "text-white",
      };

      return {
        bgColor: "bg-green-600",
        textColor: "text-white",
      };
    case "ANALYST":
      return {
        bgColor: "bg-indigo-600",
        textColor: "text-white",
      };
    case "CONTENT_MANAGER":
    case "CONTENTMANAGER":
      return {
        bgColor: "bg-orange-600",
        textColor: "text-white",
      };
    case "SUPPORT":
      return {
        bgColor: "bg-teal-600",
        textColor: "text-white",
      };

    default:
      return {
        bgColor: "bg-gray-500",
        textColor: "text-white",
      };
  }
};

const formatRole = (role?: string) => {
  if (!role) return "";

  const roleMap: { [key: string]: string } = {
    SUPER_ADMIN: "Super Admin",
    "SUPER ADMIN": "Super Admin",
    ADMIN: "Admin",
    ANALYST: "Analyst",
    CONTENT_MANAGER: "Content Manager",
    CONTENTMANAGER: "Content Manager",
    SUPPORT: "Support",
    VENDOR: "Vendor",
    CLIENT: "Client",
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

export default UserAvatar;
