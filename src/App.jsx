import React, { Suspense, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./assets/tailwind.css";
import Loading from "./components/Loading";
import NotFound from "./components/NotFound";


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
const Products = React.lazy(() => import("./pages/Products"))
const ProductDetail = React.lazy(() => import("./pages/ProductDetail.jsx"))
const Components = React.lazy(() => import("./pages/Components"))
const FiturXyz = React.lazy(() => import("./pages/fiturxyz"))
const Note = React.lazy(() => import("./pages/Note.jsx"))

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  // cek apakah route valid
  const validRoutes = ["/", "/orders", "/customers", "/login", "/register", "/forgot", "/products", "/components", "/fitur-xyz", "/notes" ];
  const isProductDetail = /^\/products\/\d+$/.test(location.pathname); // cek route /products/:id
  const isErrorPage = !validRoutes.includes(location.pathname) && !isProductDetail;

  // 👉 kalau error → tampil full screen TANPA sidebar
  if (isErrorPage) {
    return <NotFound />;
  }

  return (
    <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/" element={<Dashboard searchTerm={searchTerm} />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/components" element={<Components />} />
        <Route path="/fitur-xyz" element={<FiturXyz />} />
        <Route path="/notes" element={<Note />} />
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
