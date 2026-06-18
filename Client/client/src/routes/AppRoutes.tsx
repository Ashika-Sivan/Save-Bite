import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "../pages/Signup";



export default function AppRoutes() {
  return (
    <BrowserRouter>
    <Routes>
        <Route path="/register" element={<Signup/>}/>
    </Routes>
    </BrowserRouter>
  )
}
