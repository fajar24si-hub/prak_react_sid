import { useState } from "react";
import { BsFillExclamationDiamondFill } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataForm, setDataForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setDataForm({
      ...dataForm,
      [name]: value,
    });
  };

  /* process form */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const result = await login(dataForm.email, dataForm.password);

    if (result.success) {
      // Refresh profile untuk mendapatkan role terbaru
      await refreshProfile();

      // Ambil profile dari Supabase untuk cek role
      const { supabase } = await import("../../lib/supabase");
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", result.user.id)
        .single();

      // Redirect berdasarkan role
      if (profileData?.role === "admin") {
        navigate("/");
      } else if (profileData?.role === "member" || profileData?.role === "guest") {
        navigate("/member/dashboard");
      } else {
        navigate("/member/dashboard");
      }
    } else {
      setError(result.error || "Login gagal");
    }

    setLoading(false);
  };
  /* error & loading status */
  const errorInfo = error ? (
    <div className="bg-red-200 mb-5 p-5 text-sm font-light text-gray-600 rounded flex items-center">
      <BsFillExclamationDiamondFill className="text-red-600 me-2 text-lg" />
      {error}
    </div>
  ) : null;

  const loadingInfo = loading ? (
    <div className="bg-gray-200 mb-5 p-5 text-sm rounded flex items-center">
      <ImSpinner2 className="me-2 animate-spin" />
      Mohon Tunggu...
    </div>
  ) : null;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
        Welcome Back 👋
      </h2>
      {errorInfo}
      {loadingInfo}
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            name="email"
            onChange={handleChange}
            type="text"
            id="email"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm
                            placeholder-gray-400"
            placeholder="you@example.com"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            name="password"
            onChange={handleChange}
            type="password"
            id="password"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm
                            placeholder-gray-400"
            placeholder="********"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4
                        rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Mohon Tunggu..." : "Login"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>
          Belum punya akun?{" "}
          <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">
            Register
          </Link>
        </p>
        <p className="mt-1">
          <Link to="/forgot" className="text-gray-500 hover:text-gray-700 text-xs">
            Lupa password?
          </Link>
        </p>
      </div>
    </div>
  );
}
