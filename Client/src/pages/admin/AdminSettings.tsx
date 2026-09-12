import { useState } from 'react';

const AdminSettings = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500">Manage platform-wide rules, refunds, and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Commission Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-5">Platform Commission & Fees</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Global Commission Rate (%)
              </label>
              <input 
                type="number" 
                defaultValue={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              />
            </div>
          </div>
          
          <p className="mt-4 text-xs text-gray-500">
            This percentage is deducted from the vendor's total payout upon successful order collection.
          </p>
        </div>

        {/* Auto-Refund Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-5">Auto-Refund & No-Show Policies</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto-Refund Grace Period (Hours)
              </label>
              <input 
                type="number" 
                defaultValue={24}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No-Show Refund Percentage (%)
              </label>
              <input 
                type="number" 
                defaultValue={70}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              />
            </div>
          </div>
          
          <p className="mt-4 text-xs text-gray-500">
            Defines how long to wait before auto-refunding missed pickups, and the percentage returned to the user.
          </p>
        </div>

        {/* Wallet & Payouts Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-5">Vendor Wallet & Payouts</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Withdrawal Amount (₹)
              </label>
              <input 
                type="number" 
                defaultValue={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            The minimum balance required in a vendor's wallet before they can request a bank payout.
          </p>
        </div>

        {/* Admin account Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-5">Admin Security</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <input 
                type="email" 
                defaultValue="admin@savebite.in"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors bg-gray-50 text-gray-500"
                disabled
              />
            </div>
            
            <div className="pt-2">
              <button 
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm w-full md:w-auto"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-6">
        <button className="px-6 py-2.5 bg-[#4FAD5B] text-white font-medium rounded-lg hover:bg-green-600 transition-colors shadow-sm">
          Save Settings
        </button>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input 
                  type="password" 
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-[#4FAD5B] text-white font-medium rounded-lg hover:bg-green-600 transition-colors shadow-sm"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
