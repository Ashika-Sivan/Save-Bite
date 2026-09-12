import { useEffect, useState, type FormEvent } from "react";
import {
  getNotificationSchedules,
  createNotificationSchedule,
  toggleNotificationSchedule,
  deleteNotificationSchedule,
  triggerScheduleNow,
  sendBroadcastNotification,
  type NotificationSchedule,
} from "../../services/adminNotification.service";
import toast from "react-hot-toast";

type TabType = "schedules" | "broadcast";

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState<TabType>("schedules");
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Schedule Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleBody, setScheduleBody] = useState("");
  const [scheduleTime, setScheduleTime] = useState("08:30");
  const [scheduleTarget, setScheduleTarget] = useState<"all" | "customer" | "vendor">("customer");
  const [scheduleLink, setScheduleLink] = useState("/home");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<"all" | "customer" | "vendor">("all");
  const [broadcastLink, setBroadcastLink] = useState("/home");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const res = await getNotificationSchedules();
      setSchedules(res.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load automated schedules");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleToggleSchedule = async (id: string) => {
    try {
      const res = await toggleNotificationSchedule(id);
      toast.success(res.message || "Schedule status updated");
      setSchedules((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: !s.isActive } : s))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update schedule");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this automated schedule?")) return;
    try {
      await deleteNotificationSchedule(id);
      toast.success("Schedule deleted successfully");
      setSchedules((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete schedule");
    }
  };

  const handleTriggerNow = async (id: string) => {
    try {
      await triggerScheduleNow(id);
      toast.success("Test notification sent successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to trigger test notification");
    }
  };

  const handleCreateSchedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!scheduleName || !scheduleTitle || !scheduleBody || !scheduleTime) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createNotificationSchedule({
        name: scheduleName,
        title: scheduleTitle,
        body: scheduleBody,
        time24: scheduleTime,
        targetRole: scheduleTarget,
        link: scheduleLink,
      });

      toast.success("Automated schedule created successfully");
      setIsModalOpen(false);
      setScheduleName("");
      setScheduleTitle("");
      setScheduleBody("");
      setScheduleTime("08:30");
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendBroadcast = async (e: FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) {
      toast.error("Please enter a title and message body.");
      return;
    }

    try {
      setIsBroadcasting(true);
      await sendBroadcastNotification({
        title: broadcastTitle,
        body: broadcastBody,
        targetRole: broadcastTarget,
        link: broadcastLink,
      });

      toast.success("Broadcast notification sent successfully");
      setBroadcastTitle("");
      setBroadcastBody("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send broadcast");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const format12Hour = (time24: string) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m < 10 ? "0" + m : m} ${period} IST`;
  };

  return (
    <div className="min-h-screen bg-[#f6faf5] p-6 md:p-10 font-sans text-gray-800">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Clean Standard Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Notifications & Reminders
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure automated daily meal alerts or send instant notifications to users.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 shadow-sm"
          >
            + Add Schedule
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex w-fit flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setActiveTab("schedules")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              activeTab === "schedules"
                ? "bg-green-700 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Automated Schedules ({schedules.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("broadcast")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              activeTab === "broadcast"
                ? "bg-green-700 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Instant Broadcast
          </button>
        </div>

        {/* TAB 1: AUTOMATED SCHEDULES */}
        {activeTab === "schedules" && (
          <div>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <p className="text-sm font-medium text-gray-500">No automated schedules configured yet.</p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
                >
                  Create Schedule
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {schedules.map((s) => (
                  <div
                    key={s._id}
                    className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
                  >
                    <div>
                      {/* Top Bar: Time & Active Toggle */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 border border-green-200">
                          <span>⏰</span> {format12Hour(s.time24)}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${s.isActive ? "text-green-600" : "text-gray-400"}`}>
                            {s.isActive ? "Active" : "Paused"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleSchedule(s._id)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              s.isActive ? "bg-green-600" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                s.isActive ? "translate-x-4" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">{s.name}</h3>
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 uppercase">
                            {s.targetRole}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-green-700">{s.title}</p>
                        <p className="mt-2 text-xs text-gray-600 line-clamp-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          {s.body}
                        </p>
                      </div>

                      {s.lastTriggeredDate && (
                        <p className="mt-3 text-[11px] text-gray-400">
                          Last sent: {s.lastTriggeredDate}
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() => handleTriggerNow(s._id)}
                        className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                      >
                        ⚡ Test Run Now
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(s._id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INSTANT BROADCAST */}
        {activeTab === "broadcast" && (
          <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Send Instant Broadcast Notification</h2>
            <p className="mt-1 text-xs text-gray-500">
              Sends an immediate live notification to all online users.
            </p>

            <form onSubmit={handleSendBroadcast} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Notification Title *</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Special Surplus Sale Live!"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Message Body *</label>
                <textarea
                  rows={3}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="e.g. Top restaurants near you uploaded fresh evening surplus bags at up to 60% OFF!"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Target Audience</label>
                  <select
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  >
                    <option value="all">All Users</option>
                    <option value="customer">Customers Only</option>
                    <option value="vendor">Vendors Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Target Link URL</label>
                  <input
                    type="text"
                    value={broadcastLink}
                    onChange={(e) => setBroadcastLink(e.target.value)}
                    placeholder="/home"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isBroadcasting}
                className="mt-4 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-800 disabled:opacity-50"
              >
                {isBroadcasting ? "Sending Broadcast..." : "Send Broadcast Now"}
              </button>
            </form>
          </div>
        )}

        {/* MODAL: CREATE SCHEDULE */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-semibold text-gray-900">Create Automated Daily Schedule</h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSchedule} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Schedule Name *</label>
                  <input
                    type="text"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    placeholder="e.g. Daily Breakfast Reminder"
                    className="mt-1 w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Daily Execution Time (24h) *</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      required
                    />
                    <p className="mt-1 text-[11px] text-gray-500">Formats: {format12Hour(scheduleTime)}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Target Audience</label>
                    <select
                      value={scheduleTarget}
                      onChange={(e) => setScheduleTarget(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 bg-white"
                    >
                      <option value="customer">Customers</option>
                      <option value="all">All Users</option>
                      <option value="vendor">Vendors</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Notification Title *</label>
                  <input
                    type="text"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    placeholder="e.g. Breakfast is First Priority! 🍳"
                    className="mt-1 w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Message Body *</label>
                  <textarea
                    rows={3}
                    value={scheduleBody}
                    onChange={(e) => setScheduleBody(e.target.value)}
                    placeholder="e.g. Fuel up your morning with fresh surplus breakfast deals!"
                    className="mt-1 w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Target Link URL</label>
                  <input
                    type="text"
                    value={scheduleLink}
                    onChange={(e) => setScheduleLink(e.target.value)}
                    placeholder="/home"
                    className="mt-1 w-full rounded-lg border border-gray-200 p-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Schedule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
