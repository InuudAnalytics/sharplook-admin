import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

interface MainLayoutProps {
  headerTitle?: string;
  children?: React.ReactNode;
}

const MainLayout = ({
  headerTitle = "Overview",
  children,
}: MainLayoutProps) => {
  return (
    <div className="h-screen w-screen">
      <header className="fixed top-0 left-0 w-full z-20">
        <Header title={headerTitle} />
      </header>
      <div className="flex h-full pt-[64px]">
        {/* Sidebar: fixed width, fixed position */}
        <aside className="fixed top-[64px] left-0 w-[280px] h-[calc(100vh-64px)] z-10">
          <Sidebar />
        </aside>
        {/* Main: margin-left to make space for sidebar */}
        <main className="flex-1 ml-[280px] pt-0 h-[calc(100vh-64px)] overflow-y-auto">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
