import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/tailwind.css";
import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Orders = React.lazy(() => import("./pages/Orders"));
const Customers = React.lazy(() => import("./pages/Customers"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const Forgot = React.lazy(() => import("./pages/auth/Forgot"));
const MainLayout = React.lazy(() => import("./layouts/MainLayout"));
const AuthLayout = React.lazy(() => import("./layouts/AuthLayout"));
const Products = React.lazy(() => import("./pages/Products"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail.jsx"));
const Components = React.lazy(() => import("./pages/Components"));
const FiturXyz = React.lazy(() => import("./pages/fiturxyz"));
const Note = React.lazy(() => import("./pages/Note.jsx"));
const MemberLayout = React.lazy(() => import("./layouts/MemberLayout"));
const MemberDashboard = React.lazy(() => import("./pages/member/MemberDashboard"));
const MemberProfile = React.lazy(() => import("./pages/member/MemberProfile"));
const MemberTransactions = React.lazy(() => import("./pages/member/MemberTransactions"));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Admin Routes (role: admin) */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="components" element={<Components />} />
          <Route path="fitur-xyz" element={<FiturXyz />} />
          <Route path="notes" element={<Note />} />
        </Route>

        {/* Member Routes (role: member & guest) */}
        <Route
          path="/member"
          element={
            <ProtectedRoute allowedRoles={["member", "guest"]}>
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="transactions" element={<MemberTransactions />} />
        </Route>

        {/* Public Products (tanpa login) */}
        <Route path="/products" element={
          <ProtectedRoute allowedRoles={["member"]}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Products />} />
          <Route path=":id" element={<ProductDetail />} />
        </Route>

        {/* Auth Routes (public) */}
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