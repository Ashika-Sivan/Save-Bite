import { createSlice } from "@reduxjs/toolkit";
//user:-how a logged in user looks like
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAuthenticated: boolean;
  role:"user"|"vendor"|"admin"
}
//token:-redux authetication statte
interface AuthState {
  user: User | null;
  accessToken: string | null;
}

const initialState: AuthState = {//initially we set it as user and token are null
  user: null,
  accessToken: null,
};
//create slice for each page
const authSlice = createSlice({//evrything related to authentication comes here
  name: "auth",
  initialState,
  reducers: {//change the redux state
    //caled a sucessfull login and store the usr and acccesstoken information 
    setCredentials: (state, action) => {
      state.user = action.payload.user;//save user detail 
      state.accessToken = action.payload.accessToken;//save access details
    },
    //called afett the succesfull refresh tokne req
    //we only recieve a new access token from backend
    //existing user info unchanged
    setAccessToken:(state,action)=>{
        state.accessToken=action.payload//replace old access to new 
    },
    updateUser:(state,action)=>{
      if(state.user){
        state.user={...state.user,...action.payload}
      }
    },
    clearCredentials: (state) => {//closed during the logout
      state.user = null;
      state.accessToken = null;
    },
    
  },
});

export const { setCredentials,clearCredentials,setAccessToken,updateUser } = authSlice.actions;
export default authSlice.reducer;

//it define the struture of the authenticatin statte  stored in the redux