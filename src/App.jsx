import React, { Suspense, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./assets/tailwind.css";
import Loading from "./components/Loading";

//import Sidebar from "./components/Sidebar";
//import Header from "./components/Header";
//import Dashboard from "./pages/Dashboard";
//import Orders from "./pages/Orders";
//import Customers from "./pages/Customers";
//import NotFound from "./components/NotFound";
//import MainLayout from "./layouts/MainLayout";
//import AuthLayout from "./layouts/AuthLayout";
//import Login from "./pages/auth/Login";
//import Register from "./pages/auth/Register";
//import Forgot from "./pages/auth/Forgot";

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Orders = React.lazy(() => import("./pages/Orders"));
const Customers = React.lazy(() => import("./pages/Customers"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const Forgot = React.lazy(() => import("./pages/auth/Forgot"));
const NotFoundPage = React.lazy(() => import("./components/NotFound"));
const MainLayout = React.lazy(() => import("./layouts/MainLayout"));
const AuthLayout = React.lazy(() => import("./layouts/AuthLayout"));
const Sidebar = React.lazy(() => import("./components/Sidebar"));
const Header = React.lazy(() => import("./components/Header"));

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  // cek apakah route valid
  const validRoutes = ["/", "/orders", "/customers", "/login", "/register", "/forgot"];
  const isErrorPage = !validRoutes.includes(location.pathname);

  // 👉 kalau error → tampil full screen TANPA sidebar
  if (isErrorPage) {
    return <NotFound />;
  }

  return (
    <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="/" element={<Dashboard searchTerm={searchTerm} />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customers" element={<Customers />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
      </Route>
    </Routes>
   </Suspense>
  );
}

export default App;
