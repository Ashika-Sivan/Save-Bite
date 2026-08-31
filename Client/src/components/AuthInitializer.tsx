import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getMe, refreshAccessToken } from "../services/auth.service";
import { setAccessToken, setCredentials } from "../redux/authSlice";

interface Props {
    children: React.ReactNode;//here we are wrap inside the component
}

export default function AuthInitializer({ children }: Props) {
    console.log("AuthInitializer running");
    const dispatch = useDispatch();//to getting the redux dispatchh funtion
    const [isInitializing, setIsInitializing] = useState(true);

    //which run only once when the app star
    useEffect(() => {
        const initialAuth = async () => {
            try {
                const refreshResponse = await refreshAccessToken()
                const accessToken = await refreshResponse.data.accessToken//save accesstokn new
                dispatch(setAccessToken(accessToken));
                const meResponse = await getMe()//get logged in users details
                dispatch(
                    setCredentials({//redux restore
                        user: meResponse.data.user,
                        accessToken,
                    })
                )
            } catch (_error) {
                console.log('no active session')
            } finally {
                setIsInitializing(false);
            }
        }
        initialAuth();

    }, [dispatch])

    if (isInitializing) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f8f3]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-700 border-t-transparent"></div>
            </div>
        );
    }

    return <>{children}</>
}

//purpoe when the browser refresh ,the ddata can be lost,token ,user info,so here we are doing is when browser refresh it the send refresh token /refresh to get new acccess token then auth/me get user detail,redux store,portected route see user,home open 