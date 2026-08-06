//it is a normal typescript file
import toast from "react-hot-toast";

import axios from "axios";//to make the http request
import { store } from "../redux/store";
import { clearCredentials, setAccessToken, setCredentials } from "../redux/authSlice";
///import the redux store so we ca acess the access token
const api=axios.create({
    baseURL:import.meta.env.VITE_BASE_URL,
    withCredentials:true//send refresh token cookie

})
//REQUEST INTERCEPTOR
//creating the request interceptor
//this will run before every request is sent to the backend
api.interceptors.request.use(
    (config)=>{//this contain the req details('url,header,body,etc)
        const token=store.getState().auth.accessToken//read the latest access token from the store

        if(token){//if user is logged in and a token exists
            config.headers.Authorization=`Bearer ${token}`;//we are actually adding the authorisation header to the outgoing request:-so the header will look like:[ Bearer hdedfwifofoi]

        }
        return config//send the request backend
    },


    //if something goes wrong bee error can be hanldes later

    (error)=>{
        return Promise.reject(error)
    }
)


// //RESPONSE INTERCEPTOR
// api.interceptors.response.use(
//     (response)=>{
//         return response
//     },

//     async(error)=>{
//         const originalRequest=error.config//store failed request

//         if(error.response?.status===401 && 
//             !originalRequest._retry//check we have not retried already
//         ){
//             originalRequest._retry=true//mark req retried
//             try {
//                 const response=await api.post("/auth/refresh")
//                 const newAccessToken=response.data.accessToken//get new one
//                 store.dispatch(setAccessToken(newAccessToken))   //save new token in redux
//                 // originalRequest.headers.authorisation=`Bearer ${newAccessToken}`
//                 // return api(originalRequest)   //retry the failed request      
//                 originalRequest.headers={
//                     ...originalRequest.headers,
//                     Authorization:`Bearer ${newAccessToken}`
//                 }
//                    return api(originalRequest);
//             } catch (refreshError) {
//                 store.dispatch(clearCredentials())//clear credential if refresh fail
//                 return Promise.reject(refreshError)
                
//             }
//         }
//         return Promise.reject(error)
//     }


// )


// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },

//   async (error) => {
//     const originalRequest = error.config;
//     const status=error.response?.status
//     const message=error.response?.data?.message

//     // If refresh API itself failed, don't retry again
//     if (originalRequest?.url === "/auth/refresh") {
//       store.dispatch(clearCredentials());
//       return Promise.reject(error);
//     }


//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;

//       try {
//         const response = await api.post("/auth/refresh");//toget the new access token:-if the accesstoken expire

//         const newAccessToken = response.data.data.accessToken;
//         store.dispatch(
//           setAccessToken(newAccessToken)
//         )

//         const meResponse=await api.get("/auth/me")//this is to fetch the latest user from the backedn

//         // store.dispatch(setAccessToken(newAccessToken));
//         store.dispatch(setCredentials({
//           user:meResponse.data.data.user,
//           accessToken:newAccessToken
//         }))

//         //here we are updating failed req with new token

//         originalRequest.headers = {
//           ...originalRequest.headers,
//           Authorization: `Bearer ${newAccessToken}`,
//         };

//         return api(originalRequest);
//       } catch (refreshError) {
//         store.dispatch(clearCredentials());
//         return Promise.reject(refreshError);
//       }
//     }

//     if(status===403){
//       toast.error(message||"you donot have permission to perform this action")
//     }else if(status && status>=500){
//       toast.error(message||"Something went wrong on the server. Please try again later.")
//     }
//           return Promise.reject(error);
//   }
// );



// api.interceptors.response.use(
//     (response) => response,

//     async (error) => {
//         const originalRequest = error.config;
//         const status = error.response?.status;
//         const message = error.response?.data?.message;

//         if (!originalRequest) {
//             return Promise.reject(error);
//         }

//         const isRefreshRequest =
//             originalRequest.url === "/auth/refresh";

//         if (isRefreshRequest) {
//             store.dispatch(clearCredentials());
//             return Promise.reject(error);
//         }

//         const hadAccessToken =
//             Boolean(originalRequest.headers?.Authorization);

//         if (
//             status === 401 &&
//             hadAccessToken &&
//             !originalRequest._retry
//         ) {
//             originalRequest._retry = true;

//             try {
//                 const response = await api.post(
//                     "/auth/refresh"
//                 );

//                 const newAccessToken =
//                     response.data.data.accessToken;

//                 store.dispatch(
//                     setAccessToken(newAccessToken)
//                 );

//                 originalRequest.headers = {
//                     ...originalRequest.headers,
//                     Authorization: `Bearer ${newAccessToken}`,
//                 };

//                 const retryResponse =
//                     await api(originalRequest);

//                 const meResponse =
//                     await api.get("/auth/me");

//                 store.dispatch(
//                     setCredentials({
//                         user: meResponse.data.data.user,
//                         accessToken: newAccessToken,
//                     })
//                 );

//                 return retryResponse;
//             } catch (refreshError) {
//                 store.dispatch(clearCredentials());
//                 return Promise.reject(refreshError);
//             }
//         }

//         if (status === 403) {
//             toast.error(
//                 message ||
//                     "You do not have permission to perform this action"
//             );
//         } else if (status && status >= 500) {
//             toast.error(
//                 message ||
//                     "Something went wrong on the server"
//             );
//         }

//         return Promise.reject(error);
//     }
// );


api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;//contain failed req
        const status = error.response?.status;//401/403/404/500
        const message =
            error.response?.data?.message;//messsage:'access token expired

        if (!originalRequest) {
            return Promise.reject(error);//interceptor couldnt solve problm
        }

        const requestUrl =
            originalRequest.url as string;//get error endpoint that failed

        const publicAuthRoutes = [
            "/auth/login",
            "/auth/register",
            "/auth/verify-otp",
            "/auth/resend-otp",
            "/auth/forgot-password",
            "/auth/reset-password",
        ];

        const isRefreshRequest =
            requestUrl === "/auth/refresh";

        const isPublicAuthRequest =
            publicAuthRoutes.includes(requestUrl);//this check  the failed url is inside the public route arr

        if (isRefreshRequest) {//handle failed req:-if refresh fail the sesiion no lobgr restore
            store.dispatch(clearCredentials());//clear redux
            return Promise.reject(error);
        }

        if (
            status === 401 &&
            !isPublicAuthRequest &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshResponse =
                    await api.post("/auth/refresh");

                const newAccessToken =
                    refreshResponse.data.data.accessToken;

                store.dispatch(
                    setAccessToken(newAccessToken)
                );

                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization:
                        `Bearer ${newAccessToken}`,
                };

                const retryResponse =
                    await api(originalRequest);

                const meResponse =
                    await api.get("/auth/me");

                store.dispatch(
                    setCredentials({
                        user: meResponse.data.data.user,
                        accessToken: newAccessToken,
                    })
                );

                return retryResponse;
            } catch (refreshError) {
                store.dispatch(clearCredentials());
                return Promise.reject(refreshError);
            }
        }

        if (status === 403) {
            toast.error(
                message ||
                    "You do not have permission to perform this action"
            );
        } else if (status && status >= 500) {
            toast.error(
                message ||
                    "Something went wrong on the server"
            );
        }

        return Promise.reject(error);
    }
);

export default api

//mainly get state is :-go whole reduxState=>auth slice=>accesToken