import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, sendOtp } from "../../services/auth.service";
import toast from "react-hot-toast";

const OTP_LENGTH = 6;
const TIMER_SECONDS = 60;

const Otp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleVerify = async () => {
    const otpValue = otp.join("");

    if (otpValue.length < OTP_LENGTH) {
      setStatusMsg({
        text: "Please enter all 6 digits.",
        type: "error",
      });
      return;
    }

    try {
      await verifyOtp(email, otpValue);

      toast.success("OTP verified successfully! Registration completed.");

      navigate("/login");
    } catch {
      toast.error("Invalid OTP. Please try again.");

      setStatusMsg({
        text: "Invalid OTP. Please try again.",
        type: "error",
      });
    }
  };

  const startTimer = () => {
    setSeconds(TIMER_SECONDS);
    setCanResend(false);
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setCanResend(true);
          setStatusMsg({ text: "OTP expired. Please resend.", type: "error" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setCanResend(true);
          setStatusMsg({ text: "OTP expired. Please resend.", type: "error" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const circumference = 188.5;
  const strokeOffset = circumference * (1 - seconds / TIMER_SECONDS);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newOtp = [...otp];
    pasted.split("").forEach((ch, i) => (newOtp[i] = ch));
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleResend = async () => {
    try {
      await sendOtp(email);
      setOtp(Array(OTP_LENGTH).fill(""));
      setStatusMsg({ text: "OTP resent successfully!", type: "success" });
      startTimer();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      setStatusMsg({ text: "Failed to resend OTP.", type: "error" });
    }
  };

  // const handleVerify = async () => {
  //   const otpValue = otp.join("");
  //   if (otpValue.length < OTP_LENGTH) {
  //     setStatusMsg({ text: "Please enter all 6 digits.", type: "error" });
  //     return;
  //   }
  //   try {
  //     await verifyOtp(email, otpValue);
  //     navigate("/login");
  //   } catch {
  //     setStatusMsg({ text: "Invalid OTP. Please try again.", type: "error" });
  //   }
  // };

  return (
    <div className="min-h-screen flex bg-[#f8f4ec]">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-green-800 text-white p-10 flex-col justify-between rounded-r-[28px]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">🌱</div>
          <h1 className="text-2xl font-bold">SaveBite</h1>
        </div>
        <div>
          <h2 className="text-5xl font-bold leading-tight">Verify your<br />identity.</h2>
          <p className="mt-5 max-w-md text-green-100">
            We sent a one-time password to your email. Enter it to complete your
            signup and start rescuing meals.
          </p>
        </div>
        <div className="flex gap-12">
          <div><h3 className="text-3xl font-bold">12k+</h3><p className="text-green-100">meals rescued</p></div>
          <div><h3 className="text-3xl font-bold">340</h3><p className="text-green-100">neighborhoods</p></div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900">Enter OTP</h2>
          <p className="mt-1 text-sm text-gray-600">
            Sent to <span className="font-medium text-gray-900">{email}</span>
          </p>

          {/* Circular timer */}
          <div className="flex justify-center my-6">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#e5e7eb" strokeWidth="5" />
              <circle
                cx="36" cy="36" r="30" fill="none"
                stroke={seconds <= 10 ? "#dc2626" : "#166534"}
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
              />
              <text x="36" y="41" textAnchor="middle" fontSize="16" fontWeight="500" fill={seconds <= 10 ? "#dc2626" : "#1f2937"}>
                {formatTime(seconds)}
              </text>
            </svg>
          </div>

          {/* OTP inputs */}
          <div className="flex gap-2 justify-center mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                value={digit}
                maxLength={1}
                inputMode="numeric"
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 rounded-xl text-center text-xl font-semibold bg-[#fbf8ef] outline-none transition
                  ${digit ? "border-2 border-green-700" : "border border-gray-300 focus:border-green-700"}`}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            className="w-full rounded-xl bg-green-800 py-3 font-semibold text-white hover:bg-green-900 transition"
          >
            Verify OTP
          </button>

          <p className="mt-5 text-center text-sm text-gray-600">
            Didn't receive it?{" "}
            <button
              onClick={handleResend}
              disabled={!canResend}
              className={`font-medium transition ${canResend ? "text-green-800 hover:underline cursor-pointer" : "text-gray-400 cursor-not-allowed"
                }`}
            >
              Resend OTP
            </button>
          </p>

          {statusMsg && (
            <p className={`mt-3 text-center text-sm ${statusMsg.type === "error" ? "text-red-600" : "text-green-700"}`}>
              {statusMsg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Otp;