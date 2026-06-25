import { useState } from "react"
import { login } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/authSlice";


export default function Login() {
   const navigate=useNavigate()
   const dispatch=useDispatch()
        const [form,setForm]=useState({
            email:"",
            password:""
        })

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    setForm({
        ...form,
        [e.target.name]: e.target.value
    });
};

    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault()
        // console.log('login data:',form)
        try {
            const data=await login(form)
           dispatch(
            setCredentials({
              user:data.user,
              accessToken:data.accessToken
            })
           )
           navigate("/home")
            
        } catch (error) {
            console.log("login failed:",error)
            
        }

    }
   
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow"
      >
        <h1 className="text-2xl font-bold text-center text-green-700 mb-6">
          Login to SaveBite
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-3 border rounded-lg outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-6 px-4 py-3 border rounded-lg outline-none"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}
