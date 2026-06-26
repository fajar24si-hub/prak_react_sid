import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AiFillAppstore } from "react-icons/ai";
import { FaUser, FaCreditCard, FaChevronRight, FaSignOutAlt } from "react-icons/fa";

export default function MemberLayout() {
    const { user, profile, customer, logout } = useAuth();
    const navigate = useNavigate();

    const menuList = [
        { id: "dashboard", name: "Dashboard", icon: <AiFillAppstore size={22} />, to: "/member/dashboard", end: true },
        { id: "profile", name: "Profil Saya", icon: <FaUser size={18} />, to: "/member/profile", end: false },
        { id: "transactions", name: "Riwayat Transaksi", icon: <FaCreditCard size={18} />, to: "/member/transactions", end: false },
    ];

    const menuClass = ({ isActive }) =>
        `flex cursor-pointer items-center rounded-xl p-4 space-x-2
        ${isActive
            ? "text-hijau bg-green-200 font-extrabold"
            : "text-gray-600 hover:text-hijau hover:bg-green-200 hover:font-extrabold"
        }`;

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div id="app-container" className="bg-gray-100 min-h-screen flex">
            <div id="layout-wrapper" className="flex flex-row flex-1">
                {/* Member Sidebar */}
                <div className="w-72 bg-[#F8F9FA] min-h-screen flex flex-col justify-between border-r border-gray-200/60 p-4 sticky top-0 h-screen">
                    <div>
                        {/* Logo Section */}
                        <div className="px-4 py-8 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                                    <span className="text-white font-black text-xl">S</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800 leading-none">
                                        Sedap<span className="text-green-500">.</span>
                                    </h1>
                                    <p className="text-[10px] text-gray-400 font-medium mt-1">MEMBER AREA</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 ml-4 mb-4 uppercase tracking-[2px]">Menu</p>
                            <ul className="space-y-2">
                                {menuList.map((item) => (
                                    <li key={item.id}>
                                        <NavLink to={item.to} end={item.end} className={menuClass}>
                                            {({ isActive }) => (
                                                <>
                                                    <div className="flex items-center gap-4 z-10">
                                                        <span className={`${isActive ? "text-green-500" : "text-gray-400"} transition-colors duration-300`}>
                                                            {item.icon}
                                                        </span>
                                                        <span className={`font-semibold text-sm ${isActive ? "opacity-100" : "opacity-80"}`}>
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    {isActive && (
                                                        <>
                                                            <FaChevronRight size={10} className="text-green-500" />
                                                            <div className="absolute left-0 w-1.5 h-6 bg-green-500 rounded-r-full"></div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Footer: Profile Card */}
                    <div className="relative mt-auto pt-6">
                        <div className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-xl shadow-gray-200/50 text-center relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                <div className="relative">
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/4140/4140037.png"
                                        className="w-16 h-16 rounded-2xl border-4 border-white shadow-2xl object-cover"
                                        alt="avatar"
                                    />
                                    <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="font-bold text-gray-800 text-sm">
                                    {profile?.full_name || user?.email || "Member"}
                                </h4>
                                <p className="text-[11px] text-gray-400 mt-1 mb-4">
                                    {customer?.membership_type || "Basic"} Member
                                    {customer?.membership_number && (
                                        <><br />#{customer.membership_number}</>
                                    )}
                                </p>

                                <button
                                    onClick={handleLogout}
                                    className="group w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold py-2.5 rounded-2xl transition-all duration-300 active:scale-95"
                                >
                                    <FaSignOutAlt className="group-hover:translate-x-1 transition-transform" />
                                    LOGOUT
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 px-2 flex justify-between items-center opacity-40 grayscale">
                            <span className="text-[9px] font-bold text-gray-500">SEDAP MEMBER</span>
                            <div className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4">
                    {/* Member Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Selamat Datang, {profile?.full_name || "Member"}! 👋
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Kelola akun member Anda di sini</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                {customer?.membership_type || "Basic"} Member
                            </span>
                        </div>
                    </div>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}