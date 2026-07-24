import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { clearCredentials } from "../redux/authSlice";
import { checkVendorStatus } from "../services/vendor.service";
import { logout } from "../services/auth.service";

const categories = [
  "All",
  "Biryani",
  "Meals",
  "Pizza",
  "Chicken",
  "Fried Rice",
  "Burger",
  "Beverages",
  "Snacks",
  "Desserts",
];

const restaurants = [
  {
    name: "Spice Route Kitchen",
    place: "Kochi, Kerala",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500",
  },
  {
    name: "Mandi House",
    place: "Edappally, Kochi",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500",
  },
  {
    name: "Crust & Co.",
    place: "Kaloor, Kochi",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
  },
];

const foods = [
  {
    name: "Chicken Mandi",
    hotel: "Spice Route Kitchen",
    oldPrice: 320,
    price: 180,
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500",
  },
  {
    name: "Hyderabadi Biryani",
    hotel: "Mandi House",
    oldPrice: 260,
    price: 140,
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500",
  },
  {
    name: "Mixed Fried Rice",
    hotel: "Crust & Co.",
    oldPrice: 220,
    price: 120,
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500",
  },
];

export default function Home() {
  const dispatch = useDispatch();

  const user = useSelector(
    (state: RootState) => state.auth.user
  );

  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const handleBecomeVendor = async () => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      const response = await checkVendorStatus();

      console.log("Vendor status response:", response);

      const { hasApplication, status } = response.data;

      if (!hasApplication) {
        navigate("/vendor/vendorRegister");
        return;
      }

      if (status === "pending") {
        navigate("/vendor/pending");
        return;
      }

      if (status === "approved") {
        navigate("/vendor/dashboard");
        return;
      }

      if (status === "rejected") {
        navigate("/vendor/rejected");
      }
    } catch (error) {
      console.error("Failed to check vendor status:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();

      dispatch(clearCredentials());

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7ef] px-3 py-5 text-gray-900 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-gray-200 bg-[#faf7ef] shadow-lg">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-[#faf7ef]/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <h1
              onClick={() => navigate("/")}
              className="cursor-pointer text-xl font-bold text-green-800"
            >
              SaveBite
            </h1>

            <div className="hidden w-96 md:block">
              <input
                type="text"
                placeholder="Search restaurants or food"
                className="w-full rounded-full border border-gray-300 bg-white px-5 py-2 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="flex items-center gap-5 text-sm">
              <button className="transition hover:text-green-700">
                Orders
              </button>

              <button className="transition hover:text-green-700">
                Cart
              </button>

              {!user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="font-medium text-green-700 hover:underline"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => navigate("/signup")}
                    className="rounded-full bg-green-700 px-4 py-2 font-semibold text-white transition hover:bg-green-800"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setOpen((value) => !value)}
                    className="flex items-center gap-1 font-semibold text-green-800"
                  >
                    {user.name}
                    <span>▾</span>
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-3 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm transition hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="mx-auto mt-8 max-w-6xl px-5">
            <div className="grid items-center gap-8 rounded-3xl border border-green-700 bg-green-800 p-8 text-white shadow-lg md:grid-cols-2 md:p-12">
              <div>
                <p className="mb-3 text-sm text-green-100">
                  Fresh leftovers near you
                </p>

                <h2 className="text-4xl font-bold leading-tight md:text-5xl">
                  Hot food. Half the price.
                  <br />
                  Pick it up nearby.
                </h2>

                <p className="mt-4 max-w-md text-green-100">
                  Discover surplus food from restaurants around you and rescue
                  meals at discounted prices.
                </p>

                <div className="mt-6 flex flex-wrap gap-4">
                  <button className="rounded-full border border-orange-400 bg-orange-500 px-5 py-3 text-sm font-semibold transition hover:bg-orange-600">
                    Browse restaurants
                  </button>

                  <button
                    onClick={handleBecomeVendor}
                    className="rounded-full border border-white/30 bg-white/15 px-5 py-3 text-sm font-semibold transition hover:bg-white/25"
                  >
                    Become a Vendor
                  </button>
                </div>
              </div>

              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=700"
                  alt="Fresh food"
                  className="h-72 w-full rounded-2xl border border-white/20 object-cover"
                />

                <div className="absolute -bottom-5 left-5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow">
                  <p className="text-xl font-bold">1,281</p>
                  <p className="text-xs">meals saved</p>
                </div>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="mx-auto mt-10 max-w-6xl px-5">
            <h3 className="mb-4 font-semibold">
              What are you craving?
            </h3>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((item) => (
                <button
                  key={item}
                  className="min-w-fit rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition hover:border-green-700 hover:text-green-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          {/* Restaurants */}
          <section className="mx-auto mt-10 max-w-6xl px-5">
            <h3 className="mb-1 font-semibold">
              Restaurants near you
            </h3>

            <p className="mb-5 text-sm text-gray-500">
              Recommended for pickup
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.name}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="h-40 w-full object-cover"
                  />

                  <div className="p-4">
                    <div className="flex justify-between gap-3">
                      <h4 className="font-semibold">
                        {restaurant.name}
                      </h4>

                      <span className="text-sm text-orange-500">
                        ★ {restaurant.rating}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {restaurant.place}
                    </p>

                    <button className="mt-4 w-full rounded-full border border-gray-300 py-2 text-sm transition hover:border-green-700 hover:text-green-700">
                      View Menu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Menu */}
          <section className="mx-auto mt-10 max-w-6xl px-5 pb-12">
            <h3 className="mb-1 font-semibold">
              Today&apos;s menu
            </h3>

            <p className="mb-5 text-sm text-gray-500">
              Available now at discounted prices
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {foods.map((food) => (
                <div
                  key={food.name}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="h-40 w-full object-cover"
                    />

                    <span className="absolute left-3 top-3 rounded-full border border-red-400 bg-red-500 px-3 py-1 text-xs text-white">
                      Limited
                    </span>
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold">
                      {food.name}
                    </h4>

                    <p className="text-sm text-gray-500">
                      {food.hotel}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-sm text-gray-400 line-through">
                          ₹{food.oldPrice}
                        </span>

                        <span className="ml-2 font-bold text-green-800">
                          ₹{food.price}
                        </span>
                      </div>

                      <button className="rounded-full border border-green-700 bg-green-700 px-4 py-2 text-sm text-white transition hover:bg-green-800">
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-green-50">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-5 py-8 text-sm sm:flex-row">
            <p className="font-bold text-green-800">
              SaveBite
            </p>

            <p className="text-gray-500">
              Rescue food. Save money. Reduce waste.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}