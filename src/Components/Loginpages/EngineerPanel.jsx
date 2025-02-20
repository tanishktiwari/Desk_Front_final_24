import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const EngineerPanel = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [otpFieldVisible, setOtpFieldVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const DEFAULT_OTP = "1234";

  const handleSendOtp = (event) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(mobileNumber)) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }

    setSuccessMessage("OTP sent successfully.");
    setErrorMessage("");
    setOtpFieldVisible(true);
    localStorage.setItem("engineerOtp", DEFAULT_OTP);
  };

  const handleSubmitOtp = (event) => {
    event.preventDefault();
    if (enteredOtp === DEFAULT_OTP) {
      const formattedMobileNumber = mobileNumber.replace(/^(\+91|91|0)/, "");
      localStorage.setItem("loggedInEngineerMobileNumber", formattedMobileNumber);
      setSuccessMessage("Login successful!");
      setErrorMessage("");

      const from = location.state?.from?.pathname || "/engineer-dashboard/home";
      navigate(from, { replace: true });
    } else {
      setErrorMessage("Invalid OTP. Please try again.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="w-full md:w-[55%] flex items-center justify-center mt-5 px-4">
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
          <form onSubmit={otpFieldVisible ? handleSubmitOtp : handleSendOtp}>
            <div className="mt-10 font-poppins" style={{ fontSize: "16px", lineHeight: "24px" }}>
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
                    type="text"
                    placeholder="Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full p-3 pl-10 text-black bg-[#F0EDFFCC] rounded-lg font-poppins custom-input custom-placeholder"
                  />
                </div>
              ) : (
                <div className="relative mb-3">
                  <span className="absolute left-3 top-3 text-gray-500">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input
                    type="text"
                    placeholder="OTP"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-full p-3 pl-10 text-black bg-[#F0EDFFCC] rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center mt-6 mb-3">
              <button
                type="submit"
                className="w-36 bg-custom-gradient text-white font-poppins font-light py-3 rounded-xl shadow-md text-sm mb-4"
              >
                {otpFieldVisible ? "Submit OTP" : "Request OTP"}
              </button>
            </div>
          </form>
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
          className="w-[60%] h-auto object-cover absolute login_image"
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
};

export default EngineerPanel;