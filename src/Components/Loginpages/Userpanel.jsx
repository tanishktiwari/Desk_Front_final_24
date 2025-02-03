import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../Loginpages/Userpanel.css";

const UserPanel = () => {
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loginWithWhatsapp, setLoginWithWhatsapp] = useState(false);
  const [otpFieldVisible, setOtpFieldVisible] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();  // Hook to access current location

  const generateOtp = () => {
    let otp = "";
    for (let i = 0; i < 4; i++) {
      otp += Math.floor(Math.random() * 9) + 1;
    }
    return otp;
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(mobileNumber)) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }

    const newOtp = generateOtp();
    setOtp(newOtp);

    try {
      console.log("Sending OTP to:", mobileNumber);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/send-otp`,
        { mobile_no: mobileNumber, otp: newOtp }
      );

      if (response.status === 200) {
        setSuccessMessage("OTP sent successfully via Voice OTP.");
        setErrorMessage("");
        setOtpFieldVisible(true);
        setOtpSent(true);
        localStorage.setItem("whatsappOtp", newOtp);
        console.log("OTP sent and stored in local storage:", newOtp);
      } else {
        setErrorMessage("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Failed to send OTP. Please try again.");
      console.error(
        "Error sending OTP:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSubmitOtp = async (event) => {
  event.preventDefault();
  const storedOtp = localStorage.getItem("whatsappOtp");

  if (enteredOtp === storedOtp) {
    const formattedMobileNumber = mobileNumber.replace(/^(\+91|91|0)/, "");
    localStorage.setItem("loggedInUserMobileNumber", formattedMobileNumber);
    setSuccessMessage("Login successful!");
    setErrorMessage("");

    // Get the intended destination from location state
    const from = location.state?.from?.pathname || "/dashboard/home";
    
    // Navigate to the intended destination
    navigate(from, { replace: true });
  } else {
    setErrorMessage("Invalid OTP. Please try again.");
    setSuccessMessage("");
  }
};

  const handleLoginWithWhatsapp = (event) => {
    event.preventDefault(); // Prevent form submission
    setLoginWithWhatsapp(true);
    setOtpFieldVisible(false); // Hide OTP field
    setOtpSent(false); // Reset OTP sent status
    setErrorMessage(""); // Clear any error messages
    setSuccessMessage(""); // Clear any success messages
  };

  const handleRequestOtpWithWhatsapp = async (event) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(mobileNumber)) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/send-auth-whatsapp-message`,
        { to: `${mobileNumber}` }
      );

      if (response.status === 200) {
        setSuccessMessage("OTP sent successfully via WhatsApp.");
        setErrorMessage("");
        setOtpFieldVisible(true);
        setOtpSent(true);
        const { otp: receivedOtp } = response.data;

        localStorage.setItem("whatsappOtp", receivedOtp);
        const formattedMobileNumber = mobileNumber.replace(/^(\+91|91|0)/, "");
        localStorage.setItem("loggedInUserMobileNumber", formattedMobileNumber);
        console.log("OTP received and stored in local storage:", receivedOtp);
        console.log(
          "Mobile number stored in local storage:",
          formattedMobileNumber
        );
      } else {
        setErrorMessage("Failed to send OTP via WhatsApp. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Failed to send OTP via WhatsApp. Please try again.");
      console.error(
        "Error sending OTP via WhatsApp:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleVoiceOtpLoginClick = (event) => {
    event.preventDefault(); // Prevent form submission
    setLoginWithWhatsapp(false);
    setOtpFieldVisible(false); // Hide OTP input field
    setOtpSent(false); // Reset OTP sent status
    setErrorMessage(""); // Clear any error messages
    setSuccessMessage(""); // Clear any success messages
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
          <form onSubmit={enteredOtp ? handleSubmitOtp : handleSendOtp}>
            <div
              className="-ml-[22%] mt-10 font-poppins"
              style={{ fontSize: "16px", lineHeight: "24px" }}
            >
              {errorMessage && !loginWithWhatsapp && (
                <p className="text-red-500 text-center">{errorMessage}</p>
              )}
              {successMessage && (
                <p className="text-green-500 text-center">{successMessage}</p>
              )}
            </div>
            <div className="mb-4 mt-2">
              {!otpFieldVisible && (
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
              )}
              {otpFieldVisible && (
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
              {loginWithWhatsapp ? (
                <button
                  type="submit"
                  onClick={
                    otpSent ? handleSubmitOtp : handleRequestOtpWithWhatsapp
                  }
                  className="w-36 bg-custom-gradient text-white font-poppins font-light py-3 rounded-xl shadow-md text-sm mb-4"
                >
                  <span className="">
                    {otpSent ? "Submit OTP" : "Request OTP"}
                  </span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-36 bg-custom-gradient text-white font-poppins font-light py-3 rounded-xl shadow-md text-sm mb-4 "
                >
                  {enteredOtp ? "Submit OTP" : "Request OTP"}
                </button>
              )}
            </div>

            <p
              className="text-center text-gray-600 mb-4 text-lg font-poppins"
              style={{ fontSize: "16px", lineHeight: "24px" }}
            >
              <strong className="text-black">Login</strong> with Others
            </p>

            <div className="flex flex-col space-y-2">
              {!loginWithWhatsapp ? (
                <button
                  className="flex items-center justify-center w-full py-3 bg-white border border-gray-300 rounded-lg shadow-sm"
                  onClick={handleLoginWithWhatsapp}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/3670/3670051.png"
                    alt="Whatsapp Logo"
                    className="w-10 h-10 mr-2"
                  />
                  <span
                    className="text-black font-poppins"
                    style={{ fontSize: "12px", lineHeight: "18px" }}
                  >
                    Login with WhatsApp
                  </span>
                </button>
              ) : (
                <button
                  className="flex items-center justify-center w-full py-3 bg-white border border-gray-300 rounded-lg shadow-sm"
                  onClick={handleVoiceOtpLoginClick}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/3616/3616215.png"
                    alt="Call Logo"
                    className="w-10 h-10 mr-2"
                  />
                  <span
                    className="text-black font-poppins"
                    style={{ fontSize: "12px", lineHeight: "18px" }}
                  >
                    Login with Voice OTP
                  </span>
                </button>
              )}

              <button className="flex items-center justify-center w-full py-3 bg-white border border-gray-300 rounded-lg shadow-sm mb-2">
                <img
                  src="./google.png"
                  alt="Google Logo"
                  className="w-10 h-10 mr-2"
                />
                <span
                  className="text-black font-poppins"
                  style={{ fontSize: "12px", lineHeight: "18px" }}
                >
                  Login with Google
                </span>
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
            className="w-full h-full object-cover "
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

export default UserPanel;
