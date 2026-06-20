import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { resendOtp, verifyOtp } from "../../services/auth.service"


const Otp = () => {
    const [otp,setOtp]=useState("")
    const location =useLocation()
    const navigate=useNavigate()
    const email=location.state?.email


    const handleVerify=async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()

        if(!email){
            alert("Email not found.please signup again")
            navigate("/auth/register")
            return 
        }

        if(otp.length!==6){
            alert('OTP must be 6 digits')
            return
        }
        try {
            await verifyOtp(email,otp)
            alert("OTP verified Successfully")
            navigate("/")
            
        } catch (error) {
            console.log(error)
            alert("Invalid OTP")
            
        }
    }

    const handleResendOtp=async()=>{
      try {
        await resendOtp(email)
        alert("OTP sent successfully")
        
      } catch (error) {
        console.log(error)
        
      }

    }
  return (
    <div className="min-h-screen bg-[#f7f3eb] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Verify OTP
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Enter the 6-digit code sent to
        </p>

        <p className="mt-1 text-center font-semibold text-green-800">
          {email || "your email"}
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              OTP Code
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="Enter OTP"
              className="w-full rounded-xl border border-gray-300 bg-[#faf7ef] px-4 py-3 text-center text-2xl tracking-[10px] outline-none focus:border-green-700"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-green-800 py-3 font-semibold text-white hover:bg-green-900 transition"
          >
            Verify OTP
          </button>
        </form>

        <button
          type="button"
          className="mt-5 w-full text-sm font-medium text-green-800 hover:underline" onClick={handleResendOtp}
        >
          Resend OTP
        </button>

        <p
          onClick={() => navigate("/signup")}
          className="mt-5 text-center text-sm text-gray-600 cursor-pointer hover:underline"
        >
          Back to signup
        </p>
      </div>
    </div>
  );
}

export default Otp
