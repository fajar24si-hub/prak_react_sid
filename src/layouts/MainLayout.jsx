import { Outlet } from "react-router-dom";
import Sidebar from "../pertemuan-5/layouts/Sidebar";
import Header from "../pertemuan-5/layouts/Header";

export default function MainLayout() {
    return (
        <div id="app-container" className="bg-gray-100 min-h-screen flex">
      <div id="layout-wrapper" className="flex flex-row flex-1">
        <Sidebar />
        
        <div className="flex-1 p-4">
          <Header />
          <Outlet />
        </div>
      </div>
    </div>
    );
}