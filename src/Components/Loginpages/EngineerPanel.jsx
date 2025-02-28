import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EngineerPanel = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [otpFieldVisible, setOtpFieldVisible] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const mobileInputRef = useRef(null);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (otpFieldVisible && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [otpFieldVisible]);

  const handleMobileNumberChange = (e) => {
    setMobileNumber(e.target.value);
  };

  const handleOtpChange = (e) => {
    setEnteredOtp(e.target.value);
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(mobileNumber)) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/check-send-engineer-whatsapp-message`, {
        to: mobileNumber
      });

      if (response.data.otp) {
        setOtp(String(response.data.otp));
        setSuccessMessage("OTP sent successfully to your WhatsApp.");
        setErrorMessage("");
        setOtpFieldVisible(true);
      } else {
        setErrorMessage(response.data.message || "Failed to send OTP. Please try again.");
        setSuccessMessage("");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send OTP. Please try again.";
      setErrorMessage(errorMessage);
      setSuccessMessage("");
    }
  };

  const handleSubmitOtp = (event) => {
    event.preventDefault();
    if (String(enteredOtp).trim() === String(otp).trim()) {
      const formattedMobileNumber = mobileNumber.replace(/^(\+91|91|0)/, "");
      localStorage.setItem("loggedInEngineerMobileNumber", formattedMobileNumber);
      setSuccessMessage("Login successful!");
      setErrorMessage("");
      navigate("/engineer-dashboard", { replace: true });
    } else {
      setErrorMessage("Invalid OTP. Please try again.");
      setSuccessMessage("");
    }
  };

  const LoginForm = () => (
    <form onSubmit={otpFieldVisible ? handleSubmitOtp : handleSendOtp} className="w-full">
      <div className="mt-4 font-poppins text-sm md:text-base">
        {errorMessage && (
          <p className="text-red-500 text-center">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-500 text-center">{successMessage}</p>
        )}
      </div>
      <div className="mb-4 mt-2">
        {!otpFieldVisible ? (
          <div className="relative mb-4">
            <span className="absolute left-3 top-[24%] text-gray-500">
              <i className="fas fa-phone"></i>
            </span>
            <input
  type="tel"
  maxLength="10"
  placeholder="Mobile Number"
  value={mobileNumber}
  onChange={handleMobileNumberChange}
  className="w-full p-4 pl-10 text-black bg-[#F0EDFFCC] rounded-xl font-poppins text-lg"
  autoFocus={!otpFieldVisible}
  ref={mobileInputRef}
/>
          </div>
        ) : (
          <div className="relative mb-3">
            <span className="absolute left-3 top-[24%] text-gray-500">
              <i className="fas fa-lock"></i>
            </span>
            <input
  type="tel"
  maxLength="6"
  placeholder="Enter OTP"
  value={enteredOtp}
  onChange={handleOtpChange}
  className="w-full p-4 pl-10 text-black bg-[#F0EDFFCC] rounded-xl font-poppins text-lg"
  autoFocus={otpFieldVisible}
  ref={otpInputRef}
/>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-6 mb-3">
        <button
          type="submit"
          className="w-full md:w-36 bg-gradient-to-r from-[#9181F4] to-[#5038ED] text-white font-poppins py-4 md:py-3 rounded-xl shadow-md text-lg md:text-sm mb-4 active:scale-98 transition-transform"
        >
          {otpFieldVisible ? "Submit OTP" : "Request OTP"}
        </button>
      </div>
    </form>
  );

  const MobileLayout = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#9181F4] to-[#5038ED]">
      <div className="pt-8 pb-6 px-4">
        <div className="bg-white rounded-t-3xl shadow-lg p-6">
          <div className="flex flex-col items-center">
            <img
              src="/image_black.png"
              alt="login_text"
              className="h-20 w-auto mb-2"
            />
            <img
              src="./login_subtext.png"
              alt="login_subtext"
              className="h-3 w-auto"
            />
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="bg-white rounded-b-3xl shadow-lg p-6">
          <div className="mb-8 relative h-48">
            <img
              src="./login_page.gif"
              alt="Login animation"
              className="w-full h-full object-contain"
            />
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );

  const DesktopLayout = () => (
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="w-[55%] flex items-center justify-center mt-5 px-4">
        <div className="w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-2">
            <img
              src="/image_black.png"
              alt="login_text"
              className="mb-2 h-28 w-auto"
            />
            <img
              src="./login_subtext.png"
              alt="login_subtext"
              className="mb-2 ml-4 h-4 w-auto"
            />
          </div>
          <LoginForm />
        </div>
      </div>

      <div className="w-[45%] relative bg-gradient-to-r from-[#9181F4] to-[#5038ED] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="./login_image.png"
            alt="Login"
            className="w-full h-full object-cover"
          />
        </div>
        <img
          src="./login_page.gif"
          alt="Tab Image"
          className="w-[60%] h-auto object-cover absolute"
          style={{
            top: "50%",
            left: "55%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden">
        <MobileLayout />
      </div>
      <div className="hidden md:block">
        <DesktopLayout />
      </div>
    </>
  );
};

export default EngineerPanel;
