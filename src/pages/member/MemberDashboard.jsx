import { useAuth } from "../../context/AuthContext";

export default function MemberDashboard() {
    const { user, profile, customer } = useAuth();

    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Dashboard Member</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Selamat datang di area member Sedap. Berikut ringkasan akun Anda.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-xs text-green-600 font-semibold uppercase">Membership</p>
                        <p className="text-lg font-bold text-green-800 mt-1">
                            {customer?.membership_type || "Basic"}
                        </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs text-blue-600 font-semibold uppercase">No. Member</p>
                        <p className="text-lg font-bold text-blue-800 mt-1">
                            {customer?.membership_number || "-"}
                        </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                        <p className="text-xs text-purple-600 font-semibold uppercase">Status</p>
                        <p className="text-lg font-bold text-purple-800 mt-1">
                            {customer?.status || "Active"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-bold text-gray-800 mb-3">Informasi Akun</h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-36 text-sm">Nama Lengkap</span>
                        <span className="text-gray-800 font-medium">{profile?.full_name || "-"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-36 text-sm">Email</span>
                        <span className="text-gray-800 font-medium">{user?.email || "-"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-500 w-36 text-sm">Role</span>
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                            {profile?.role || "member"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}