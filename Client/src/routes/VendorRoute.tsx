
import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../redux/store";

const VendorRoute=()=>{

    const {user,accessToken}=useSelector(
        (state:RootState)=>state.auth
    );

    if(!accessToken||!user){
        return <Navigate to='/login' replace/>
    }
    if(user.role!=="vendor"){
        return <Navigate to="/" replace/>
    }
    return <Outlet/>
}
export default VendorRoute;