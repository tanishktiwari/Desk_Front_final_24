import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileForm = () => {
  const [operatorData, setOperatorData] = useState({
    title: "",
    operatorName: "",
    email: "",
    companyName: "",
    mobile: "",
    contractType: "",
    managerName: "",
  });
  const [initials, setInitials] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const mobileNumber = localStorage.getItem("loggedInUserMobileNumber");
    if (mobileNumber) {
      const fetchOperatorData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/operators/mobile/${mobileNumber}`
          );
          setOperatorData(response.data);

          if (response.data) {
            setOperatorData((prevState) => ({
              ...prevState,
              operatorName: response.data.operatorName,
              mobile: response.data.contactNumber || mobileNumber,
              email: response.data.email,
              companyName: response.data.companyName || "",
            }));

            // Determine which API to call based on operatorName
            const names = response.data.operatorName.split(" ");
            let initialsApiUrl;

            if (names.length > 1) {
              // Both first and last name
              initialsApiUrl = `${
                import.meta.env.VITE_API_URL
              }/operators/initials/${mobileNumber}`;
            } else {
              // Only first name
              initialsApiUrl = `${
                import.meta.env.VITE_API_URL
              }/operators/initials-two/${mobileNumber}`;
            }

            // Fetch initials
            const initialsResponse = await axios.get(initialsApiUrl);
            setInitials(initialsResponse.data.initials); // Store initials in state
          }
        } catch (error) {
          console.error("Error fetching operator data:", error);
        }
      };

      fetchOperatorData();
    } else {
      console.error("No mobile number found in local storage.");
    }
  }, []);
  useEffect(() => {
    const mobileNumber = localStorage.getItem("loggedInUserMobileNumber");
    console.log("Mobile Number:", mobileNumber); // Debugging
    if (mobileNumber) {
      const fetchOperatorData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/operators/details/${mobileNumber}`
          );
          console.log("API Response:", response.data); // Debugging
          setOperatorData(response.data);
        } catch (error) {
          console.error("Error fetching operator data:", error);
        }
      };

      fetchOperatorData();
    } else {
      console.error("No mobile number found in local storage.");
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setOperatorData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };
  const handleCancel = () => {
    navigate("/dashboard/home"); // Redirect to home
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const mobileNumber = localStorage.getItem("loggedInUserMobileNumber");
    console.log("Submitting update for:", mobileNumber, operatorData); // Debugging
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/operators/update/${mobileNumber}`,
        operatorData
      );
      alert("Operator details updated successfully!");
    } catch (error) {
      console.error(
        "Error updating operator details:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to update operator details."); // Notify user about the error
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 py-6 flex flex-col justify-center sm:py-12 font-sans w-full ml-7 h-full">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="flex items-center justify-center min-h-screen w-[750px] -ml-[55px]">
          <div className="relative px-4 py-10 bg-gray-100 shadow rounded-3xl sm:p-10 w-[900px] h-1/2">
            {/* Cancel Button */}
            <button
              className="absolute top-0 right-6 text-gray-700 hover:text-red-600 focus:outline-none"
              aria-label="Cancel"
              onClick={handleCancel}
            >
              <span className="text-5xl">&times;</span> {/* "X" icon */}
            </button>
            <div className="max-w-md mx-6 -ml--16 ml-[17%]">
              <div className="flex items-center space-x-5">
                <div className="h-6464 w-6464 bg-yellow-200 rounded-full flex justify-center items-center text-yellow-500 text-4xl font-poppins">
                  {initials || "i"}
                </div>
                <h2 className="leading-relaxed whitespace-nowrap block pl-0.5  text-3xl text-gray-700 font-poppins">
                 User Profile
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-2 text-gray-900 sm:text-sm sm:leading-7">
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col pt-0 h-[80px] mb-6">
                      <label className="leading-loose text-fontcolor mb-1818 text-lg font-poppins">
                        Title
                      </label>
                      <input
                        type="text"
                        value={operatorData.title}
                        onChange={handleChange}
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[80px] sm:text-sm border-gray-300 focus:outline-none text-black bg-customGray font-poppins"
                        placeholder="Title"
                        readOnly
                      />
                    </div>

                    <div className="flex flex-col pt-0 h-[80px] mb-6">
                      <div className="ml-0">
                        <label className="leading-loose text-fontcolor mb-1818 text-lg font-poppins">
                          Name
                        </label>
                      </div>
                      <input
                        type="text"
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[80px] sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-customGray font-poppins"
                        value={operatorData.operatorName}
                        onChange={handleChange}
                        placeholder="Name"
                        readOnly
                      />
                    </div>

                    <div className="flex flex-col pt-0 h-[80px] mb-6">
                      <div className="ml-0 flex items-center justify-between">
                        <label className="leading-loose text-fontcolor mb-1 text-lg font-poppins">
                          Email
                        </label>
                      </div>
                      <input
                        type="email"
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[80px] sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-customGray font-poppins"
                        value={operatorData.email}
                        onChange={handleChange}
                        placeholder="abc@email.com"
                        readOnly
                      />
                    </div>

                    <div className="flex flex-col pt-0 h-[80px] mb-6">
                      <div className="ml-0">
                        <label className="leading-loose text-fontcolor mb-1818 text-lg font-poppins">
                          Company Name
                        </label>
                      </div>
                      <input
                        type="text"
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[80px] sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-customGray font-poppins"
                        value={operatorData.companyName}
                        id="companyName"
                        onChange={handleChange}
                        readOnly
                        placeholder="Company Name"
                      />
                    </div>

                    <div className="flex flex-col pt-0 h-[80px] mb-6">
                      <div className="ml-0">
                        <label className="leading-loose text-fontcolor mb-1818 text-lg font-poppins">
                          Mobile
                        </label>
                      </div>
                      <input
                        type="text"
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[80px] sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-customGray font-poppins"
                        value={operatorData.mobile}
                        id="mobile"
                        onChange={handleChange}
                        placeholder="Mobile Number"
                        readOnly
                      />
                    </div>
                    <div className="flex flex-col pt-0 h-[80px] mb-6">
                      <div className="ml-0">
                        <label className="leading-loose text-fontcolor mb-1818 text-lg font-poppins">
                          Contract Type
                        </label>
                      </div>
                      <input
                        type="text"
                        className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[80px] sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-customGray font-poppins"
                        value={operatorData.contractType}
                        id="mobile"
                        onChange={handleChange}
                        placeholder="Contract Type"
                        readOnly
                      />
                    </div>

                    <div className="pt-4 mt-6 flex items-center space-x-36">
                      <button
                        type="submit"
                        className="bg-buttoncolor flex justify-center items-center w-[172px] text-white px-4 py-3 rounded-md focus:outline-none text-[18px] hover:bg-blue-900 ml-36 font-poppins"
                      >
                        Update
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
