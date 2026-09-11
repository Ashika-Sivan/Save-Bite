import { useEffect, useState } from "react";
import {
  getAdminReviews,
  toggleReviewVisibility,
  deleteReview,
  type AdminReviewItem,
} from "../../services/adminReview.service";
import toast from "react-hot-toast";
import Pagination from "../../components/common/Pagination";
import { Search } from "lucide-react";

const AdminReviews = () => {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [visibilityFilter, setVisibilityFilter] = useState<boolean | undefined>(undefined);

  // Pagination & Stats state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<{
    totalPlatformReviews: number;
    platformAvgRating: number;
    breakdown: Record<number, number>;
  }>({
    totalPlatformReviews: 0,
    platformAvgRating: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await getAdminReviews({
        page,
        limit: 10,
        search: debouncedSearch.trim() || undefined,
        rating: ratingFilter,
        visibility: visibilityFilter,
      });

      setReviews(res.items || []);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, debouncedSearch, ratingFilter, visibilityFilter]);

  const handleToggleVisibility = async (id: string) => {
    try {
      const updated = await toggleReviewVisibility(id);
      toast.success(`Review set to ${updated.isVisible ? "Visible" : "Hidden"}`);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isVisible: updated.isVisible } : r))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update review visibility");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this customer review?")) return;
    try {
      await deleteReview(id);
      toast.success("Review deleted successfully");
      setReviews((prev) => prev.filter((r) => r._id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6faf5] p-6 md:p-10 font-sans text-gray-800">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Hotel Reviews & Ratings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor, filter, and moderate customer reviews submitted for hotels across SaveBite.
            </p>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Platform Reviews</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalPlatformReviews}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average Platform Rating</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-600">{stats.platformAvgRating || "0.0"}</span>
              <span className="text-lg text-amber-500">⭐</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">5-Star Reviews</p>
            <p className="mt-2 text-3xl font-bold text-green-700">{stats.breakdown[5] || 0}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filtered Items Count</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{total}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, hotel name, or comment..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={ratingFilter ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setRatingFilter(val ? parseInt(val) : undefined);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-600"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
              <option value="4">4 Stars ⭐⭐⭐⭐</option>
              <option value="3">3 Stars ⭐⭐⭐</option>
              <option value="2">2 Stars ⭐⭐</option>
              <option value="1">1 Star ⭐</option>
            </select>

            <select
              value={visibilityFilter === undefined ? "" : visibilityFilter ? "true" : "false"}
              onChange={(e) => {
                const val = e.target.value;
                setVisibilityFilter(val === "" ? undefined : val === "true");
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-600"
            >
              <option value="">All Visibility</option>
              <option value="true">Visible Only</option>
              <option value="false">Hidden Only</option>
            </select>
          </div>
        </div>

        {/* Reviews Data Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-sm font-medium text-gray-500">
              No customer reviews found matching the search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                  <tr>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Hotel Name</th>
                    <th className="px-5 py-3.5">Rating</th>
                    <th className="px-5 py-3.5">Comment</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map((rev) => (
                    <tr key={rev._id} className="hover:bg-gray-50/60 transition">
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {rev.userName}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900">
                          {rev.hotelId?.hotelName || "Hotel"}
                        </span>
                        {rev.hotelId?.place && (
                          <span className="block text-xs text-gray-400">
                            {rev.hotelId.place}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                          ⭐ {rev.rating}/5
                        </span>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-xs text-gray-700 line-clamp-2" title={rev.comment}>
                          "{rev.comment}"
                        </p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          rev.isVisible
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}>
                          {rev.isVisible ? "Visible" : "Hidden"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(rev._id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                              rev.isVisible
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {rev.isVisible ? "Hide" : "Show"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev._id)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 p-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={10}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
