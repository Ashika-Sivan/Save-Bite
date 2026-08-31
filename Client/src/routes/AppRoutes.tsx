import { BrowserRouter, Route, Routes } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";

import Signup from "../pages/auth/Signup";
import Otp from "../pages/auth/Otp";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import VendorRegister from "../pages/vendor/VendorRegister";
import VendorReapply from "../pages/vendor/VendorReapply";
import VendorPending from "../pages/vendor/VendorPending";
import VendorRejected from "../pages/vendor/VendorRejection";
import VendorDashboard from "../pages/vendor/VendorDashboard";
import AddHotel from "../pages/vendor/AddHotel";
import HotelList from "../pages/vendor/HotelList";
import TodayMenu from "../pages/vendor/TodayMenu";
import VendorOrders from "../pages/vendor/VendorOrders";
import VendorWalletPage from "../pages/vendor/VendorWalletPage";
import VendorHotelDetails from "../pages/vendor/VendorHotelDetails";
import VendorRoute from "./VendorRoute";
import VendorLayout from "../components/vendor/VendorLayout";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserList from "../pages/admin/UserList";
import VendorList from "../pages/admin/VendorList";
import VendorDetails from "../pages/admin/VendorDetails";
import AdminRoute from "./AdminRoutes";
import AdminPublicRoute from "./AdminPublicRoutes";
import AdminLayout from "../components/admin/AdminLayout";

import LiveHotelMenuPage from "../pages/customer/LiveHotelMenu";
import CartPage from "../pages/customer/Cart";
import CheckoutPage from "../pages/customer/CheckoutPage";
import PaymentSuccessPage from "../pages/customer/PaymentSuccessPage";
import MyOrdersPage from "../pages/customer/MyOrdersPage";
import CustomerLayout from "../components/layouts/CustomerLayout";

import AdminConcerns from "../pages/admin/AdminConcerns";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* CUSTOMER ROUTES */}
                <Route element={<CustomerLayout />}>
                    <Route path={APP_ROUTES.PUBLIC.HOME} element={<Home />} />

                    <Route
                        path={APP_ROUTES.CUSTOMER.HOME}
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={APP_ROUTES.CUSTOMER.LIVE_MENU(":hotelId")}
                        element={
                            <ProtectedRoute>
                                <LiveHotelMenuPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={APP_ROUTES.CUSTOMER.CART}
                        element={
                            <ProtectedRoute>
                                <CartPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={APP_ROUTES.CUSTOMER.CHECKOUT}
                        element={
                            <ProtectedRoute>
                                <CheckoutPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={APP_ROUTES.CUSTOMER.PAYMENT_SUCCESS}
                        element={
                            <ProtectedRoute>
                                <PaymentSuccessPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={APP_ROUTES.CUSTOMER.MY_ORDERS}
                        element={
                            <ProtectedRoute>
                                <MyOrdersPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* AUTH ROUTES */}
                <Route
                    path={APP_ROUTES.PUBLIC.SIGNUP}
                    element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    }
                />

                <Route
                    path={APP_ROUTES.PUBLIC.OTP}
                    element={
                        <PublicRoute>
                            <Otp />
                        </PublicRoute>
                    }
                />

                <Route
                    path={APP_ROUTES.PUBLIC.LOGIN}
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                <Route
                    path={APP_ROUTES.PUBLIC.FORGOT_PASSWORD}
                    element={
                        <PublicRoute>
                            <ForgotPassword />
                        </PublicRoute>
                    }
                />

                <Route
                    path={APP_ROUTES.PUBLIC.RESET_PASSWORD}
                    element={
                        <PublicRoute>
                            <ResetPassword />
                        </PublicRoute>
                    }
                />

                {/* VENDOR REGISTRATION */}
                <Route
                    path={APP_ROUTES.VENDOR.REGISTER}
                    element={
                        <ProtectedRoute>
                            <VendorRegister />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={APP_ROUTES.VENDOR.REAPPLY}
                    element={
                        <ProtectedRoute>
                            <VendorReapply />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={APP_ROUTES.VENDOR.PENDING}
                    element={
                        <ProtectedRoute>
                            <VendorPending />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={APP_ROUTES.VENDOR.REJECTED}
                    element={
                        <ProtectedRoute>
                            <VendorRejected />
                        </ProtectedRoute>
                    }
                />

                {/* APPROVED VENDOR ROUTES */}
                <Route element={<VendorRoute />}>
                    <Route element={<VendorLayout />}>
                        <Route path={APP_ROUTES.VENDOR.DASHBOARD} element={<VendorDashboard />} />
                        <Route path={APP_ROUTES.VENDOR.HOTELS} element={<HotelList />} />
                        <Route path={APP_ROUTES.VENDOR.ADD_HOTEL} element={<AddHotel />} />
                        <Route path={APP_ROUTES.VENDOR.HOTEL_BY_ID(":hotelId")} element={<VendorHotelDetails />} />
                        <Route path={APP_ROUTES.VENDOR.HOTEL_MENU(":hotelId")} element={<TodayMenu />} />
                        <Route path={APP_ROUTES.VENDOR.ORDERS} element={<VendorOrders />} />
                        <Route path={APP_ROUTES.VENDOR.WALLET} element={<VendorWalletPage />} />
                    </Route>
                </Route>

                {/* ADMIN PUBLIC ROUTES */}
                <Route element={<AdminPublicRoute />}>
                    <Route path={APP_ROUTES.ADMIN.LOGIN} element={<AdminLogin />} />
                </Route>

                {/* ADMIN PROTECTED ROUTES */}
                <Route element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path={APP_ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
                        <Route path={APP_ROUTES.ADMIN.USER_LIST} element={<UserList />} />
                        <Route path={APP_ROUTES.ADMIN.VENDOR_LIST} element={<VendorList />} />
                        <Route path={APP_ROUTES.ADMIN.VENDOR_DETAILS(":vendorId")} element={<VendorDetails />} />
                        <Route path={APP_ROUTES.ADMIN.CONCERNS} element={<AdminConcerns />} />
                    </Route>
                </Route>

                {/* CATCH-ALL 404 ROUTE */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}