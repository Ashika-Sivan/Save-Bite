import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "../pages/auth/Signup";
import Otp from "../pages/auth/Otp";
import Login from "../pages/auth/Login";
import Home from "../pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute.tsx";
import VendorRegister from "../pages/vendor/VendorRegister.tsx";
import ForgotPassword from "../pages/auth/ForgotPassword.tsx";
import ResetPassword from "../pages/auth/ResetPassword.tsx";
import VendorPending from "../pages/vendor/VendorPending.tsx";
import VendorRejected from "../pages/vendor/VendorRejection.tsx";
import VendorDashboard from "../pages/vendor/VendorDashboard.tsx";
import AdminLogin from "../pages/admin/AdminLogin.tsx";
import AdminDashboard from "../pages/admin/AdminDashboard.tsx";
import UserList from "../pages/admin/UserList.tsx";
import VendorList from "../pages/admin/VendorList.tsx";
import AdminRoute from "./AdminRoutes.tsx";
import AdminPublicRoute from "./AdminPublicRoutes.tsx";
import VendorDetails from "../pages/admin/VendorDetails.tsx";
import VendorRoute from "./VendorRoute.tsx";
import AdminLayout from "../components/admin/AdminLayout.tsx";
import AddHotel from "../pages/vendor/AddHotel.tsx";
import HotelList from "../pages/vendor/HotelList.tsx";
import TodayMenu from "../pages/vendor/TodayMenu.tsx";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

        <Route
          path="/otp"
          element={
            <PublicRoute>
              <Otp />
            </PublicRoute>
          }
        />
         <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
           <Route path="/home" element={
            <ProtectedRoute>
            <Home/>
            </ProtectedRoute>
          }/>

           {/* VENDOR SIDE*/}

        <Route
          path="/vendor/VendorRegister"
          element={
            <ProtectedRoute>
              <VendorRegister />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor/pending"
          element={
            <ProtectedRoute>
              <VendorPending />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor/rejected"
          element={
            <ProtectedRoute>
              <VendorRejected />
            </ProtectedRoute>
          }
        />

        <Route element={<VendorRoute />}>
          <Route
            path="/vendor/dashboard"
            element={<VendorDashboard />}
          />

          <Route
            path="/vendor/hotels"
            element={<HotelList />}
          />

          <Route
            path="/vendor/hotels/add"
            element={<AddHotel />}
          />

          <Route
            path="/vendor/hotels/:hotelId/menu"
            element={<TodayMenu />}
          />
        </Route>

        {/* ADMIN SIDE*/}
        <Route element={<AdminPublicRoute/>}>
        <Route path="/admin/login" element={<AdminLogin/>}/>
        </Route>
        <Route element={<AdminRoute/>}>
        <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
        <Route path="/admin/userList" element={<UserList/>}/>
        <Route path="/admin/vendorList" element={<VendorList/>}/>
        <Route path="/admin/vendors/:vendorId" element={<VendorDetails/>}/> 
        </Route>
        </Route>
        
        




      </Routes>
    </BrowserRouter>
  );
}