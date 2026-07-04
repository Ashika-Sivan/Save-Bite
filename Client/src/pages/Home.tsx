import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth.service";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
// import VendorRegister from "./vendor/VendorRegister";

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
  const userI=useSelector((state:RootState)=>state.auth.user)
  const accessToken=useSelector((state:RootState)=>state.auth.accessToken)

  console.log(userI)
  console.log(accessToken)
    const [open,setOpen]=useState(false)

    const storedUser=localStorage.getItem("user")
    const user=storedUser?JSON.parse(storedUser):null;
    const navigate=useNavigate()
    const handleLogout = async () => {
  try {
    await logout();

    navigate("/login", {
      replace: true,
    });
  } catch (error) {
    console.log(error);
  }
};
  return (
    <div className="min-h-screen bg-[#faf7ef] text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#faf7ef]/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-800">SaveBite</h1>

          <div className="hidden md:block w-96">
            <input
              type="text"
              placeholder="Search restaurants or food"
              className="w-full rounded-full border px-5 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-5 text-sm">
  <span>Orders</span>
  <span>Cart</span>

  {!user ? (
    <button
      onClick={() => navigate("/login")}
      className="bg-green-700 text-white px-4 py-2 rounded-full font-semibold"
    >
      Login
    </button>
  ) : (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="font-semibold text-green-800 flex items-center gap-1"
      >
        {user.name}
        <span>▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-40 bg-white border rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100"
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

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 mt-8">
        <div className="bg-green-800 rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center text-white shadow-lg">
          <div>
            <p className="text-sm text-green-100 mb-3">Fresh leftovers near you</p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Hot food. Half the price. <br /> Pick it up nearby.
            </h2>
            <p className="mt-4 text-green-100 max-w-md">
              Discover surplus food from restaurants around you and rescue meals
              at discounted prices.
            </p>

            <div className="mt-6 flex gap-4">
              <button className="bg-orange-500 px-5 py-3 rounded-full text-sm font-semibold">
                Browse restaurants
              </button>
              <button className="bg-white/15 px-5 py-3 rounded-full text-sm font-semibold" onClick={()=>{console.log("Button clicked");navigate('/vendor/VendorRegister')}}>
                become a vendor
              </button>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=700"
              alt="Food"
              className="rounded-2xl h-72 w-full object-cover"
            />
            <div className="absolute -bottom-5 left-5 bg-white text-gray-900 rounded-xl px-4 py-3 shadow">
              <p className="text-xl font-bold">1,281</p>
              <p className="text-xs">meals saved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-5 mt-10">
        <h3 className="font-semibold mb-4">What are you craving?</h3>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              className="min-w-fit bg-white border rounded-xl px-4 py-3 text-sm hover:border-green-700"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Restaurants */}
      <section className="max-w-6xl mx-auto px-5 mt-10">
        <h3 className="font-semibold mb-1">Restaurants near you</h3>
        <p className="text-sm text-gray-500 mb-5">Recommended for pickup</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((restaurant) => (
            <div key={restaurant.name} className="bg-white rounded-2xl border overflow-hidden">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="h-40 w-full object-cover"
              />

              <div className="p-4">
                <div className="flex justify-between">
                  <h4 className="font-semibold">{restaurant.name}</h4>
                  <span className="text-sm text-orange-500">★ {restaurant.rating}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{restaurant.place}</p>

                <button className="mt-4 w-full border rounded-full py-2 text-sm">
                  View Menu
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Menu */}
      <section className="max-w-6xl mx-auto px-5 mt-10 pb-12">
        <h3 className="font-semibold mb-1">Today&apos;s menu</h3>
        <p className="text-sm text-gray-500 mb-5">Available now at discounted prices</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {foods.map((food) => (
            <div key={food.name} className="bg-white rounded-2xl border overflow-hidden">
              <div className="relative">
                <img
                  src={food.image}
                  alt={food.name}
                  className="h-40 w-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                  Limited
                </span>
              </div>

              <div className="p-4">
                <h4 className="font-semibold">{food.name}</h4>
                <p className="text-sm text-gray-500">{food.hotel}</p>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="line-through text-gray-400 text-sm">
                      ₹{food.oldPrice}
                    </span>
                    <span className="ml-2 font-bold text-green-800">
                      ₹{food.price}
                    </span>
                  </div>

                  <button className="bg-green-700 text-white rounded-full px-4 py-2 text-sm">
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-50 border-t">
        <div className="max-w-6xl mx-auto px-5 py-8 flex justify-between text-sm">
          <p className="font-bold text-green-800">SaveBite</p>
          <p className="text-gray-500">Rescue food. Save money. Reduce waste.</p>
        </div>
      </footer>
    </div>
  );
}

