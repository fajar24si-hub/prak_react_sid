import { useState } from "react";
import { BsFillExclamationDiamondFill } from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [dataForm, setDataForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({
            ...dataForm,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        // Validasi
        if (dataForm.password !== dataForm.confirmPassword) {
            setError("Password dan konfirmasi password tidak cocok");
            setLoading(false);
            return;
        }

        if (dataForm.password.length < 6) {
            setError("Password minimal 6 karakter");
            setLoading(false);
            return;
        }

        if (!dataForm.fullName.trim()) {
            setError("Nama lengkap harus diisi");
            setLoading(false);
            return;
        }

        const result = await register(dataForm.email, dataForm.password, dataForm.fullName);

        if (result.success) {
            setSuccess("Registrasi berhasil! Silakan cek email Anda untuk verifikasi, kemudian login.");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } else {
            setError(result.error || "Registrasi gagal");
        }

        setLoading(false);
    };

    const errorInfo = error ? (
        <div className="bg-red-200 mb-5 p-5 text-sm font-light text-gray-600 rounded flex items-center">
            <BsFillExclamationDiamondFill className="text-red-600 me-2 text-lg" />
            {error}
        </div>
    ) : null;

    const successInfo = success ? (
        <div className="bg-green-200 mb-5 p-5 text-sm font-light text-gray-600 rounded">
            {success}
        </div>
    ) : null;

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
                Create Your Account ✨
            </h2>
            {errorInfo}
            {successInfo}
            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap
                    </label>
                    <input
                        name="fullName"
                        value={dataForm.fullName}
                        onChange={handleChange}
                        type="text"
                        id="fullName"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400"
                        placeholder="John Doe"
                    />
                </div>
                <div className="mb-5">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        name="email"
                        value={dataForm.email}
                        onChange={handleChange}
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400"
                        placeholder="you@example.com"
                    />
                </div>
                <div className="mb-5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        name="password"
                        value={dataForm.password}
                        onChange={handleChange}
                        type="password"
                        id="password"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400"
                        placeholder="********"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <input
                        name="confirmPassword"
                        value={dataForm.confirmPassword}
                        onChange={handleChange}
                        type="password"
                        id="confirmPassword"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400"
                        placeholder="********"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4
                        rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Mohon Tunggu..." : "Register"}
                </button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-600">
                <p>
                    Sudah punya akun?{" "}
                    <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}