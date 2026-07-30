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


api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;
    const status=error.response?.status
    const message=error.response?.data?.message

    // If refresh API itself failed, don't retry again
    if (originalRequest?.url === "/auth/refresh") {
      store.dispatch(clearCredentials());
      return Promise.reject(error);
    }


    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await api.post("/auth/refresh");//toget the new access token:-if the accesstoken expire

        const newAccessToken = response.data.data.accessToken;
        store.dispatch(
          setAccessToken(newAccessToken)
        )

        const meResponse=await api.get("/auth/me")//this is to fetch the latest user from the backedn

        // store.dispatch(setAccessToken(newAccessToken));
        store.dispatch(setCredentials({
          user:meResponse.data.data.user,
          accessToken:newAccessToken
        }))

        //here we are updating failed req with new token

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(clearCredentials());
        return Promise.reject(refreshError);
      }
    }

    if(status===403){
      toast.error(message||"you donot have permission to perform this action")
    }else if(status && status>=500){
      toast.error(message||"Something went wrong on the server. Please try again later.")
    }
          return Promise.reject(error);
  }
);


export default api

//mainly get state is :-go whole reduxState=>auth slice=>accesToken