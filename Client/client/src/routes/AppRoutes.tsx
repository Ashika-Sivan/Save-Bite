import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Signup from "../pages/auth/Signup";
import Otp from "../pages/auth/Otp";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
      </Routes>
    </BrowserRouter>
  );
}