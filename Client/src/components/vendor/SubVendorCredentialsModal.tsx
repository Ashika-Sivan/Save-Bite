import { useState } from "react";
import { X, Save, Key, Shield, User } from "lucide-react";
import toast from "react-hot-toast";
import { createSubVendorCredentials, updateSubVendorPermissions, updateSubVendorPassword } from "../../services/vendor.service";
import { AxiosError } from "axios";

interface SubVendorCredentialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    hotelId: string;
    hotelName: string;
    existingSubVendor: any | null;
    onSuccess: () => void;
}

const AVAILABLE_PERMISSIONS = [
    { id: "CREATE_MENU", label: "Create Menu" },
    { id: "VIEW_ORDERS", label: "View Orders" },
    { id: "ACCEPT_ORDERS", label: "Accept Orders" },
    { id: "VIEW_ANALYTICS", label: "View Analytics" },
];

export const SubVendorCredentialsModal = ({
    isOpen,
    onClose,
    hotelId,
    hotelName,
    existingSubVendor,
    onSuccess
}: SubVendorCredentialsModalProps) => {
    const isEditing = !!existingSubVendor;
    const [password, setPassword] = useState("");
    const [permissions, setPermissions] = useState<string[]>(existingSubVendor?.permissions || []);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleTogglePermission = (permissionId: string) => {
        setPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(p => p !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isEditing && password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        try {
            setIsLoading(true);
            if (isEditing) {
                const promises = [updateSubVendorPermissions(hotelId, { permissions })];
                
                if (password) {
                    if (password.length < 6) {
                        toast.error("New password must be at least 6 characters long");
                        setIsLoading(false);
                        return;
                    }
                    promises.push(updateSubVendorPassword(hotelId, { password }));
                }
                
                await Promise.all(promises);
                toast.success("Credentials updated successfully!");
            } else {
                await createSubVendorCredentials(hotelId, { password, permissions });
                toast.success("Credentials created successfully!");
            }
            onSuccess();
            onClose();
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error(axiosError.response?.data?.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isEditing ? "Manage Access" : "Create Credentials"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">For {hotelName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-start gap-3">
                                <div className="p-2 bg-green-100 rounded-lg text-green-700">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-900">Credentials Active</p>
                                    <p className="text-xs text-green-700 mt-1">Username: <span className="font-mono font-bold bg-green-100/50 px-1 py-0.5 rounded">{existingSubVendor.username}</span></p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Update Password (Optional)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Key size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow bg-gray-50/50"
                                        placeholder="Leave blank to keep current password"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Set Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Key size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow bg-gray-50/50"
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    A unique username will be automatically generated.
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Shield size={18} className="text-gray-700" />
                            <h3 className="text-sm font-semibold text-gray-900">Assign Permissions</h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                            {AVAILABLE_PERMISSIONS.map(permission => (
                                <label key={permission.id} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-500/20 checked:border-green-600 checked:bg-green-600 transition-all cursor-pointer"
                                            checked={permissions.includes(permission.id)}
                                            onChange={() => handleTogglePermission(permission.id)}
                                        />
                                        <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                                        {permission.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-70"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {isEditing ? "Save Permissions" : "Create Credentials"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
