import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { TiArrowSortedUp } from "react-icons/ti";
import { FaStore, FaUserPlus, FaUsers } from "react-icons/fa";
import { GoMail } from "react-icons/go";
import { BsTelephone } from "react-icons/bs";
import { LuSquarePercent } from "react-icons/lu";
import { GrCompliance } from "react-icons/gr";
import { HttpClient } from "../../../api/HttpClient";
const iconMap: Record<string, React.ReactNode> = {
  clients: <FaUsers className="text-[24px] text-white" />,
  vendors: <FaStore className="text-[24px] text-white" />,
  new_users: <FaUserPlus className="text-[24px] text-white" />,
};

interface Analytics {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  totalDisputes: number;
  totalTransactions: number;
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  totalUnitsSold: number;
  newProductsThisWeek: number;
  totalEmailVerified: number;
  totalPhoneVerified: number;
  totalAcceptedPersonalData: number;
}





const salesData = [
  { day: 1, sales: 12000 },
  { day: 2, sales: 9000 },
  { day: 3, sales: 15000 },
  { day: 4, sales: 8000 },
  { day: 5, sales: 11000 },
  { day: 6, sales: 17000 },
  { day: 7, sales: 14000 },
  { day: 8, sales: 10000 },
  { day: 9, sales: 13000 },
  { day: 10, sales: 16000 },
  { day: 11, sales: 9000 },
  { day: 12, sales: 12000 },
  { day: 13, sales: 15000 },
  { day: 14, sales: 18000 },
  { day: 15, sales: 11000 },
  { day: 16, sales: 17000 },
  { day: 17, sales: 14000 },
  { day: 18, sales: 10000 },
  { day: 19, sales: 13000 },
  { day: 20, sales: 16000 },
  { day: 21, sales: 9000 },
  { day: 22, sales: 12000 },
  { day: 23, sales: 15000 },
  { day: 24, sales: 18000 },
  { day: 25, sales: 11000 },
  { day: 26, sales: 1200 }, // highlighted point
  { day: 27, sales: 17000 },
  { day: 28, sales: 14000 },
  { day: 29, sales: 10000 },
  { day: 30, sales: 13000 },
];

const vendorSalesData = [
  { month: "Jan", vendors: 3000 },
  { month: "Feb", vendors: 4200 },
  { month: "Mar", vendors: 2500 },
  { month: "Apr", vendors: 2100 },
  { month: "May", vendors: 3200 },
  { month: "Jun", vendors: 5000 }, // highlighted
  { month: "Jul", vendors: 4100 },
  { month: "Aug", vendors: 4700 },
  { month: "Sep", vendors: 3800 },
  { month: "Oct", vendors: 2200 },
  { month: "Nov", vendors: 3100 },
  { month: "Dec", vendors: 3600 },
];

const getYears = () => {
  // For demo, just 2023 and 2024
  return [2023, 2024];
};
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Analytics = () => {
  // State for Total Sales chart
  const [salesPeriod, setSalesPeriod] = useState("Today");
  const [salesYear, setSalesYear] = useState(2024);
  const [salesMonth, setSalesMonth] = useState("Jun");

  // State for Sales by Vendor chart
  const [vendorPeriod, setVendorPeriod] = useState("Today");
  const [vendorYear, setVendorYear] = useState(2024);
  const [vendorMonth, setVendorMonth] = useState("Jun");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  // Filtering logic for salesData (demo: only monthly and today supported)
  let filteredSalesData = salesData;
  if (salesPeriod === "Today") {
    filteredSalesData = [salesData[salesData.length - 1]];
  } else if (salesPeriod === "Weekly") {
    filteredSalesData = salesData.slice(-7);
  } else if (salesPeriod === "Monthly") {
    filteredSalesData = salesData;
  }
  // Filtering logic for vendorSalesData (demo: only monthly and today supported)
  let filteredVendorData = vendorSalesData;
  if (vendorPeriod === "Today") {
    filteredVendorData = [vendorSalesData[months.indexOf(vendorMonth)]];
  } else if (vendorPeriod === "Weekly") {
    // Not meaningful for monthly data, so just show current and previous month
    const idx = months.indexOf(vendorMonth);
    filteredVendorData = vendorSalesData.slice(Math.max(0, idx - 1), idx + 1);
  } else if (vendorPeriod === "Monthly") {
    filteredVendorData = vendorSalesData;
  }
  const getAnalytics = async () => {
    try {
      const res = await HttpClient.get("/admin/stats");
      setAnalytics(res.data.data);
    } catch {
      // Siliently handles error
    }
  };
  useEffect(() => {
    getAnalytics();
  }, []);
  return (
    <div
      className="px-8 pb-8 pt-[70px] bg-lightgray"
      style={{ minHeight: "100vh" }}
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-[14px] text-[#909090] font-poppins-regular">
          Admin/Analytics
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: "Total Clients",
            value: analytics?.totalUsers || "-",
            icon: "clients",
            change: "+10%",
            time: "vs. Yesterday",
          },
          {
            label: "Total Vendors",
            value: analytics?.totalVendors || "-",
            icon: "vendors",
            change: "+10%",
            time: "vs. Yesterday",
          },
          {
            label: "New Users this month",
            value: analytics?.totalUsers || "-",
            icon: "new_users",
            change: "+10%",
            time: "vs. last month",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-6 flex flex-col gap-2 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2 text-pink-600">
              <div className="h-10 w-10 bg-pink flex items-center justify-center rounded-full">
                {iconMap[card.icon]}
              </div>
              <span className="font-poppins-regular text-[14px] text-[#555555]">
                {card.label}
              </span>
            </div>
            <div className="text-3xl text-center font-poppins-semi-bold">
              {card.value}
            </div>
            <div className="flex items-center justify-center gap-1 text-[#2AC670] text-[14px] font-poppins-light">
              <TiArrowSortedUp className="text-base" />
              <h1>{card.change}</h1>
              <span className="text-[12px] font-poppins-regular text-[#909090]">
                {card.time}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* User Analytics */}
      <div style={{ display: "flex", gap: 15, marginBottom: 32 }}>
        <div
          className="bg-pink"
          style={{
            flex: 1,
            borderRadius: 12,
            padding: 20,
            width: "100%",
            height: "130px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span className="text-[14px] text-white font-poppins-regular">
            <GoMail size={50} className="text-[#FFFFFF80]" />
          </span>
          <span className="text-[12px] text-white flex items-center gap-1 font-poppins-regular">
            <span className="font-poppins-semi-bold text-2xl">
              {analytics?.totalEmailVerified || "-"}
            </span>{" "}
            E-mail Sign ups
          </span>
        </div>
        <div
          className="bg-white"
          style={{
            flex: 1,
            borderRadius: 12,
            padding: 20,
            display: "flex",
            alignItems: "center",
            gap: 14,
            border: "1px solid #eee",
          }}
        >
          <span style={{ fontSize: 28 }}>
            <BsTelephone size={50} className="text-lightpink" />
          </span>
          <span className="text-[12px] flex items-center gap-1 font-poppins-regular">
            <span className="font-poppins-semi-bold text-2xl">
              {analytics?.totalPhoneVerified || "-"}
            </span>{" "}
            Phone No. Sign ups
          </span>
        </div>
        <div
          className="bg-pink"
          style={{
            flex: 1,
            borderRadius: 12,
            padding: 20,
            display: "flex",
            alignItems: "center",
            gap: 14,
            justifyContent: "center",
            fontWeight: 600,
          }}
        >
          <LuSquarePercent size={50} className="text-[#FFFFFF80]" />
          <span className="text-[12px] text-white font-poppins-regular">
            Sales Report
          </span>
        </div>
        <div
          className="text-[12px] font-poppins-regular"
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            border: "1px solid #eee",
            justifyContent: "center",
            fontWeight: 600,
          }}
        >
          <GrCompliance size={50} className="text-lightpink" /> Vendor's
          Compliance
        </div>
      </div>
      {/* Charts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Total Sales Line Chart */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 2px 8px #0001",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{ fontWeight: 600 }}
              className="flex items-center gap-2"
            >
              <div className="bg-lightpink inline-block rounded-full p-2">
                <LuSquarePercent size={22} className="text-pink" />
              </div>
              <h1 className="text-[14px] font-poppins-regular">Total Sales</h1>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {["Today", "Weekly", "Monthly"].map((p) => (
                <button
                  onClick={() => setSalesPeriod(p)}
                  className="font-poppins-regular text-[13px]"
                  key={p}
                  style={{
                    background: salesPeriod === p ? "#EB278D" : "#F5F6F7",
                    color: salesPeriod === p ? "#fff" : "#EB278D",
                    border: "none",
                    borderRadius: 6,
                    padding: "5px 12px",
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
              <select
                className="bg-[#F9BCDC] text-[13px] font-poppins-regular text-pink outline-none"
                value={salesYear}
                onChange={(e) => setSalesYear(Number(e.target.value))}
                style={{ marginLeft: 8, borderRadius: 6, padding: "4px 8px" }}
              >
                {getYears().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                className="bg-[#F5F6F7] text-[13px] font-poppins-regular text-pink outline-none"
                value={salesMonth}
                onChange={(e) => setSalesMonth(e.target.value)}
                style={{ marginLeft: 8, borderRadius: 6, padding: "4px 8px" }}
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={filteredSalesData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EB278D" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EB278D" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#EB278D"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Sales by Vendor Bar Chart */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 2px 8px #0001",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{ fontWeight: 600 }}
              className="flex items-center gap-2"
            >
              <h1 className="text-[14px] font-poppins-regular">
                {" "}
                <div
                  style={{ fontWeight: 600 }}
                  className="flex items-center gap-2"
                >
                  <div className="bg-pink inline-block rounded-full p-2">
                    <LuSquarePercent size={22} className="text-white" />
                  </div>
                  <h1 className="text-[14px] font-poppins-regular">
                    Total Sales
                  </h1>
                </div>
              </h1>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {["Today", "Weekly", "Monthly"].map((p) => (
                <button
                  onClick={() => setVendorPeriod(p)}
                  className="font-poppins-regular text-[13px]"
                  key={p}
                  style={{
                    background: vendorPeriod === p ? "#EB278D" : "#F5F6F7",
                    color: vendorPeriod === p ? "#fff" : "#EB278D",
                    border: "none",
                    borderRadius: 6,
                    padding: "5px 12px",
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
              <select
                className="bg-[#F5F6F7] text-[13px] font-poppins-regular text-pink outline-none"
                value={vendorYear}
                onChange={(e) => setVendorYear(Number(e.target.value))}
                style={{ marginLeft: 8, borderRadius: 6, padding: "4px 8px" }}
              >
                {getYears().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                className="bg-[#F5F6F7] text-[13px] font-poppins-regular text-pink outline-none"
                value={vendorMonth}
                onChange={(e) => setVendorMonth(e.target.value)}
                style={{ marginLeft: 8, borderRadius: 6, padding: "4px 8px" }}
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={filteredVendorData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="vendors" fill="#EB278D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
