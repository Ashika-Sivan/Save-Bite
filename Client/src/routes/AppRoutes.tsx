import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Signup from "../pages/auth/Signup";
import Otp from "../pages/auth/Otp";
import Login from "../pages/auth/Login";
import Home from "../pages/Home";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/home" element={
          <ProtectedRoute>
          <Home/>
          </ProtectedRoute>
          }/>
      </Routes>
    </BrowserRouter>
  );
}