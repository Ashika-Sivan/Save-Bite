import React from 'react'
import { useAppSelector } from '../hooks/reduxHooks';
import { Navigate } from 'react-router-dom';


interface ProtectedRouteProps{
    children:React.ReactNode;//page to protect
}

export default function ProtectedRoute({children}:ProtectedRouteProps) {
    const user=useAppSelector((state)=>state.auth.user)//read user from the redux
    if(!user){
        <Navigate to="/login" replace/>
    }
  return children
    
}
