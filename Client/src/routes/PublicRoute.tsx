import { useAppSelector } from "../hooks/reduxHooks";
import { Navigate } from "react-router-dom";

interface PublicRouteProps{
    children:React.ReactNode;
}

export default function PublicRoute({children}:PublicRouteProps){
    const user=useAppSelector((state)=>state.auth.user)

    if(user){
        return <Navigate to="/home" replace/>
    }
    return children
}