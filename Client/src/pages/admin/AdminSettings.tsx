import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../redux/store';
import { updateUser } from '../../redux/authSlice';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, ShieldCheck, Lock, KeyRound, Save } from 'lucide-react';
import { updatePassword } from '../../services/auth.service';
import api from '../../services/api';

const AdminSettings = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [name, setName] = useState(user?.name || '');
  
  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter.";
    if (!/[a-z]/.test(password)) return "Must contain a lowercase letter.";
    if (!/[0-9]/.test(password)) return "Must contain a number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Must contain a special character.";
    return null;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    setIsUpdatingProfile(true);
    try {
      // Assuming a generic update profile endpoint exists or will be created
      const response = await api.patch('/auth/update-profile', { name });
      dispatch(updateUser({ name: response.data?.data?.name || name }));
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Required";
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Required";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (currentPassword && newPassword === currentPassword) {
      newErrors.newPassword = "New password cannot be the same as current password.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updatePassword({
        currentPassword,
        newPassword
      });
      setErrors({});
      toast.success("Password updated successfully!");
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    }
  };

  if (!user) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Profile</h1>
        <p className="text-gray-500">Manage your personal information and security preferences.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 bg-white/20 backdrop-blur-md text-3xl font-bold shadow-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="mt-2 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 w-fit border border-white/10 shadow-sm">
                <ShieldCheck size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="mb-6 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <User size={18} className="text-green-700" /> Account Details
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-colors"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email (Read-only)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-10 px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile || name === user.name}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security / Password Edit Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lock size={18} className="text-green-700" /> Security
          </h3>
          <button
            onClick={() => setIsEditingPassword(!isEditingPassword)}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            {isEditingPassword ? "Cancel" : "Change Password"}
          </button>
        </div>

        {isEditingPassword && (
          <form onSubmit={handlePasswordSubmit} className="max-w-2xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <KeyRound size={16} />
                </div>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errors.currentPassword) setErrors({ ...errors, currentPassword: undefined });
                  }}
                  className={`w-full pl-10 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-colors ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.currentPassword && <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={16} />
                </div>
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
                  }}
                  className={`w-full pl-10 pr-10 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-colors ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={16} />
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  className={`w-full pl-10 pr-10 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                className="px-6 py-2.5 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors shadow-sm"
              >
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
