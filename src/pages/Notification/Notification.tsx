import React, { useState, useEffect } from "react";
import { HttpClient } from "../../../api/HttpClient";
import { useToast } from "../../components/useToast";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  audience: string;
  createdById: string;
  createdAt: string;
  sentCount: number;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface BroadcastFormData {
  title: string;
  message: string;
  audience: string;
  channel: string;
}

const Notification = () => {
  const [tab, setTab] = useState("sent");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<
    NotificationItem[]
  >([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const { showToast } = useToast();
  const [broadcastForm, setBroadcastForm] = useState<BroadcastFormData>({
    title: "",
    message: "",
    audience: "",
    channel: "",
  });

  // Fetch sent notifications from API
  const fetchSentNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await HttpClient.get("/admin/getAllBroadcast");
      if (response.data.success) {
        setSentNotifications(response.data.broadcasts);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showToast("Failed to fetch notifications", { type: "error" });
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchSentNotifications();
  }, []);

  // Filtered notifications based on search
  const filterNotifications = (notifications: NotificationItem[]) => {
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase()) ||
        n.audience.toLowerCase().includes(search.toLowerCase()) ||
        n.createdBy.firstName.toLowerCase().includes(search.toLowerCase()) ||
        n.createdBy.lastName.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Pagination logic
  const getPaginatedNotifications = (notifications: NotificationItem[]) => {
    const start = (page - 1) * rowsPerPage;
    return notifications.slice(start, start + rowsPerPage);
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const payload = {
        title: broadcastForm.title,
        message: broadcastForm.message,
        audience: broadcastForm.audience,
        channel: broadcastForm.channel,
      };

      console.log("Broadcast payload:", payload);

      const response = await HttpClient.post("/admin/broadcasts", payload);

      showToast(response.data.message, {
        type: "success",
      });

      // Refresh the notifications list after sending a new broadcast
      await fetchSentNotifications();

      // Reset form
      setBroadcastForm({
        title: "",
        message: "",
        audience: "",
        channel: "",
      });
    } catch (error) {
      console.error("Error sending broadcast:", error);
      showToast("Failed to send broadcast. Please try again.", {
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field: keyof BroadcastFormData, value: string) => {
    setBroadcastForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderSentTable = () => {
    const filtered = filterNotifications(sentNotifications);
    const paginated = getPaginatedNotifications(filtered);

    if (isLoadingNotifications) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading notifications...</div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-gray-100 w-full bg-white">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="bg-[#F5F5F5] text-[13px] font-poppins-regular">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Message Body</th>
              <th className="p-3 text-left">Total Customers Reached</th>
              <th className="p-3 text-left">Audience</th>
              <th className="p-3 text-left">Created By</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No notifications found.
                </td>
              </tr>
            )}
            {paginated.map((n: NotificationItem) => (
              <tr
                key={n.id}
                className="border-b border-[#E4E4EF] last:border-b-0 hover:bg-[#F9F9F9]"
              >
                <td className="p-3 text-[14px] font-poppins-medium">
                  <div className="truncate cursor-pointer" title={n.title}>
                    {n.title}
                  </div>
                </td>
                <td className="p-3 text-[14px] font-poppins-regular max-w-[300px] w-[250px]">
                  <div title={n.message} className="cursor-pointer">
                    {n.message.length > 50
                      ? `${n.message.substring(0, 50)}...`
                      : n.message}
                  </div>
                </td>
                <td className="p-3 text-[14px] font-poppins-medium">
                  {n.sentCount}
                </td>
                <td className="p-3 text-[14px] font-poppins-medium">
                  {n.audience === "CLIENT"
                    ? "Client"
                    : n.audience === "VENDOR"
                    ? "Vendor"
                    : "All Users"}
                </td>
                <td className="p-3 text-[14px] font-poppins-medium">
                  {`${n.createdBy.firstName} ${n.createdBy.lastName}`}
                </td>
                <td className="p-3 text-[14px] font-poppins-medium">
                  {formatDate(n.createdAt)}
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
              disabled
            >
              Prev
            </button>
            <button className="px-3 py-1 rounded border border-pink-600 bg-pink-600 text-white">
              1
            </button>
            <button className="px-3 py-1 rounded border border-gray-200 bg-white">
              2
            </button>
            <button className="px-3 py-1 rounded border border-gray-200 bg-white">
              3
            </button>
            <span className="px-2">...</span>
            <button className="px-3 py-1 rounded border border-gray-200 bg-white">
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500 font-poppins-regular">
            Showing 1 to 10 of {filtered.length}
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
    );
  };

  const renderBroadcastForm = () => (
    <form
      onSubmit={handleBroadcastSubmit}
      className="flex flex-col md:flex-row gap-8 mt-8"
    >
      <div className="flex-1 w-full max-w-[600px]">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title of Message"
            value={broadcastForm.title}
            onChange={(e) => handleFormChange("title", e.target.value)}
            className="w-full px-4 py-3 border border-[#DCDEE0] outline-none focus:border-pink rounded mb-4"
            required
          />
          <textarea
            placeholder="Type message here"
            value={broadcastForm.message}
            onChange={(e) => handleFormChange("message", e.target.value)}
            className="w-full px-4 py-3 border-[#DCDEE0] border outline-none focus:border-pink rounded mb-4 min-h-[120px]"
            required
          />
          <select
            value={broadcastForm.audience}
            onChange={(e) => handleFormChange("audience", e.target.value)}
            className="w-full px-4 py-3 border-[#DCDEE0] border outline-none focus:border-pink rounded mb-4"
            required
          >
            <option value="">Send to</option>
            <option value="CLIENT">Client</option>
            <option value="VENDOR">Vendor</option>
            <option value="BOTH">All Users</option>
          </select>
          <select
            value={broadcastForm.channel}
            onChange={(e) => handleFormChange("channel", e.target.value)}
            className="w-full px-4 py-3 border-[#DCDEE0] border outline-none focus:border-pink rounded mb-4"
            required
          >
            <option value="">Channel</option>
            <option value="EMAIL">Email</option>
            <option value="PUSH_NOTIFICATION">Push Notification</option>
          </select>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-pink text-white text-[14px] font-poppins-regular px-6 py-3 rounded mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Broadcast"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <div className="p-8 bg-lightgray pt-[80px] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[14px] text-[#909090] font-poppins-regular">
          Admin/Notification
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
              🔍
            </span>
            <input
              type="text"
              placeholder={
                tab === "sent"
                  ? "Search notification by title, channel and type"
                  : "Search by date and status"
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 rounded bg-[#EFF2F6] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-100 text-[15px]"
            />
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#E4E4EF] pb-4 mb-4">
          <button
            className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${
              tab === "sent" ? "bg-[#EFF2F6] text-black " : "text-[#C5C5C5]"
            }`}
            onClick={() => setTab("sent")}
          >
            Sent Notifications
          </button>
          <button
            className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${
              tab === "broadcast"
                ? "bg-[#EFF2F6] text-black "
                : "text-[#C5C5C5]"
            }`}
            onClick={() => setTab("broadcast")}
          >
            New Broadcast
          </button>
          <button
            className={`px-5 py-2 font-semibold cursor-pointer rounded-full focus:outline-none transition text-[15px] ${
              tab === "schedule" ? "bg-[#EFF2F6] text-black " : "text-[#C5C5C5]"
            }`}
            onClick={() => setTab("schedule")}
          >
            Schedule Notification
          </button>
        </div>
        {tab === "sent" && renderSentTable()}
        {tab === "broadcast" && renderBroadcastForm()}
        {tab === "schedule" && renderSentTable()}
      </div>
    </div>
  );
};

export default Notification;
