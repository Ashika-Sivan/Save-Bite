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

          <Route path="/vendor/VendorRegister" element={<VendorRegister />} />
        <Route path="/vendor/pending" element={<VendorPending/>}/>
        <Route path="/vendor/rejected" element={<VendorRejected/>}/>
        <Route path="/vendor/dashboard" element={<VendorDashboard/>}/>

        {/* ADMIN SIDE*/}
        <Route element={<AdminPublicRoute/>}>
        <Route path="/admin/login" element={<AdminLogin/>}/>
        </Route>
        <Route element={<AdminRoute/>}>
        <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
        <Route path="/admin/userList" element={<UserList/>}/>
        <Route path="/admin/vendorList" element={<VendorList/>}/>
        <Route path="/admin/vendors/:vendorId" element={<VendorDetails/>}/> 
        </Route>
        
        




      </Routes>
    </BrowserRouter>
  );
}