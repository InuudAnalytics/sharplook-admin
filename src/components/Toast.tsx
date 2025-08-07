import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number; // ms
  onClose: () => void;
}

const typeColors = {
  success: {
    indicator: "#0b902d",
    bg: "bg-white",
    icon: "text-green",
  },
  error: {
    indicator: "#f21c1c",
    bg: "bg-white",
    icon: "text-red",
  },
  info: {
    indicator: "#2563eb",
    bg: "bg-white",
    icon: "text-blue",
  },
  warning: {
    indicator: "#f8bd00",
    bg: "bg-white",
    icon: "text-yellow",
  },
};

const iconMap = {
  success: (
    <svg
      className="w-5 h-5 mr-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg
      className="w-5 h-5 mr-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-5 h-5 mr-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-5 h-5 mr-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
};

const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const color = typeColors[type];

  return (
    <div
      className={`relative flex items-center px-4 py-3 rounded-lg shadow-lg ${color.bg} animate-toast-in font-poppins-regular min-w-[260px] max-w-xs`}
      role="alert"
    >
      {/* Indicator Bar */}
      <span
        className="absolute left-0 top-0 h-full w-1.5 rounded-l-lg"
        style={{ background: color.indicator }}
      />
      {/* Icon */}
      <span className={`ml-3 ${color.icon}`}>{iconMap[type]}</span>
      {/* Message */}
      <span className="flex-1 ml-1 text-gray-900 font-normal text-[12px] leading-tight">
        {message}
      </span>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="ml-4 text-xl cursor-pointer leading-none text-gray-400 hover:text-gray-700 focus:outline-none"
        aria-label="Close"
        style={{ background: "none", border: "none" }}
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;
