import { Navigate, Outlet } from 'react-router-dom';
import type { RootState } from '../redux/store'
import { useSelector } from "react-redux"

 const AdminRoute=()=>{
    const {user,accessToken}=useSelector(
        (state:RootState)=>state.auth
    );

    if(!accessToken||!user){
        return <Navigate to='/admin/login' replace/>   
    }

    if(user.role!=='admin'){
        return <Navigate to='/' replace/>

    }
    return <Outlet/>
}


export default AdminRoute;