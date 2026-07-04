import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMe, refreshAccessToken } from "../services/auth.service";
import { setAccessToken, setCredentials } from "../redux/authSlice";

interface Props{
    children:React.ReactNode;//here we are wrap inside the component
}


export default function AuthInitializer({children}:Props) {
    console.log("AuthInitializer running");
    const dispatch=useDispatch();//to getting the redux dispatchh funtion

    //which run only once when the app star
    useEffect(()=>{
        const initialAuth=async()=>{
            try {
                const refreshResponse=await refreshAccessToken()
                const accessToken=await refreshResponse.accessToken//save accesstokn new
                dispatch(setAccessToken(accessToken));
                const meResponse=await getMe()//get logged in users details
                dispatch(
                    setCredentials({//redux restore
                        user:meResponse.user,
                        accessToken,
                    })
                )
                
            } catch (error) {
                console.log('no active session')
                
            }

        }
        initialAuth();

    },[dispatch])
    return <>{children}</>
}

//purpoe when the browser refresh ,the ddata can be lost,token ,user info,so here we are doing is when browser refresh it the send refresh token /refresh to get new acccess token then auth/me get user detail,redux store,portected route see user,home open 