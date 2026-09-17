import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { User, Mail, Phone, ShieldCheck, MapPin, Lock, KeyRound, Eye, EyeOff, Save } from "lucide-react";
import toast from "react-hot-toast";
import { updatePassword } from "../../services/auth.service";

export default function CustomerProfile() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-light">
        <p className="text-brand-dark/50 font-bold">Loading profile...</p>
      </div>
    );
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
    }

    if (!/(?=.*[a-z])/.test(passwordForm.newPassword)) {
        toast.error("Password must contain at least one lowercase letter.");
        return;
    }

    if (!/(?=.*[A-Z])/.test(passwordForm.newPassword)) {
        toast.error("Password must contain at least one uppercase letter.");
        return;
    }

    if (!/(?=.*\\d)/.test(passwordForm.newPassword)) {
        toast.error("Password must contain at least one number.");
        return;
    }

    if (passwordForm.currentPassword && passwordForm.newPassword === passwordForm.currentPassword) {
        toast.error("New password cannot be the same as current password.");
        return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error("New passwords do not match!");
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        await updatePassword({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        });
        toast.success("Password updated successfully!");
        setIsEditingPassword(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to update password");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark pb-16 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes liquidBlob1 {
            0%   { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg) scale(1); }
            34%  { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(120deg) scale(1.05); }
            67%  { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: rotate(240deg) scale(0.95); }
            100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(360deg) scale(1); }
        }
        @keyframes liquidBlob2 {
            0%   { border-radius: 50% 50% 50% 70% / 50% 50% 70% 50%; transform: rotate(0deg) scale(1.1); }
            34%  { border-radius: 80% 20% 50% 50% / 50% 50% 30% 70%; transform: rotate(-120deg) scale(0.9); }
            67%  { border-radius: 40% 60% 30% 70% / 60% 30% 70% 40%; transform: rotate(-240deg) scale(1.05); }
            100% { border-radius: 50% 50% 50% 70% / 50% 50% 70% 50%; transform: rotate(-360deg) scale(1.1); }
        }
        .blob-1 { animation: liquidBlob1 18s ease-in-out infinite; }
        .blob-2 { animation: liquidBlob2 22s ease-in-out infinite; }
      `}} />
      
      {/* Fluid Wavy Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[45rem] h-[45rem] bg-brand-primary opacity-20 blob-1 pointer-events-none z-0 mix-blend-multiply"></div>
      <div className="absolute top-[20%] left-[-15%] w-[40rem] h-[40rem] bg-[#e8cda1] opacity-40 blob-2 pointer-events-none z-0 mix-blend-multiply"></div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-28 pb-10 md:px-8 md:pt-32">
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-display text-4xl font-black text-brand-dark tracking-tight drop-shadow-sm">My Profile</h1>
          <p className="mt-2 text-sm text-brand-dark/70 font-medium">
            Manage your personal information and security preferences.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/60 backdrop-blur-md shadow-xl transition-all">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-brand-primary/90 to-brand-secondary/90 p-8 text-center sm:text-left relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center relative z-10">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white/20 backdrop-blur-md text-4xl font-black text-white shadow-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-white">
                <h2 className="font-display text-3xl font-black tracking-tight">{user.name}</h2>
                <div className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 w-fit mx-auto sm:mx-0 border border-white/10 shadow-sm">
                  <ShieldCheck size={14} className="text-brand-light" />
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-light">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 md:p-10">
            <h3 className="mb-6 text-lg font-bold text-brand-dark border-b border-brand-primary/10 pb-3 flex items-center gap-2">
              <User size={18} className="text-brand-primary" /> Account Details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-4 rounded-2xl border border-white/40 bg-white/50 p-4 transition-all hover:bg-white/80 hover:shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary shadow-sm">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/40">
                    Full Name
                  </p>
                  <p className="mt-1 font-bold text-brand-dark">{user.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/40 bg-white/50 p-4 transition-all hover:bg-white/80 hover:shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary shadow-sm">
                  <Mail size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/40">
                    Email Address
                  </p>
                  <p className="mt-1 truncate font-bold text-brand-dark">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/40 bg-white/50 p-4 transition-all hover:bg-white/80 hover:shadow-sm sm:col-span-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary shadow-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/40">
                    Phone Number
                  </p>
                  <p className="mt-1 font-bold text-brand-dark">
                    {user.phone || (
                      <span className="text-brand-dark/30 italic">Not provided</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 text-sm font-medium text-blue-900 flex gap-3 backdrop-blur-sm">
               <MapPin className="shrink-0 text-blue-600" size={20} />
               <p>
                 To change your location preference for finding nearby food deals, use the <strong className="font-bold text-blue-700">Use my location</strong> button in the top navigation bar.
               </p>
            </div>

            {/* Security / Password Edit Section */}
            <div className="mt-12">
                <div className="mb-6 flex items-center justify-between border-b border-brand-primary/10 pb-3">
                    <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    <Lock size={18} className="text-brand-primary" /> Security
                    </h3>
                    <button 
                        onClick={() => setIsEditingPassword(!isEditingPassword)}
                        className="rounded-full bg-brand-primary/10 px-4 py-1.5 text-xs font-bold text-brand-primary transition-all hover:bg-brand-primary/20 active:scale-95"
                    >
                        {isEditingPassword ? "Cancel" : "Change Password"}
                    </button>
                </div>

                {isEditingPassword && (
                    <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-white/60 bg-white/40 p-6 shadow-sm backdrop-blur-md transition-all">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-dark/60">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-dark/40">
                                        <KeyRound size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full rounded-2xl border border-white/50 bg-white/50 py-3.5 pl-11 pr-12 text-sm font-bold text-brand-dark outline-none transition-all focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-dark/60">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-dark/40">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={8}
                                        className="w-full rounded-2xl border border-white/50 bg-white/50 py-3.5 pl-11 pr-12 text-sm font-bold text-brand-dark outline-none transition-all focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-dark/40 hover:text-brand-primary"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-dark/60">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-dark/40">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={8}
                                        className="w-full rounded-2xl border border-white/50 bg-white/50 py-3.5 pl-11 pr-12 text-sm font-bold text-brand-dark outline-none transition-all focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="mt-2 md:col-span-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 rounded-full bg-brand-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-primary/30 transition-all hover:scale-105 hover:bg-brand-secondary active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <Save size={16} />
                                    {isSubmitting ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
