import React, { useState, useEffect } from "react";
import axios from "axios";
import downloadIcon from "/download.svg"; // Adjust the path to your image

const MonthlyHealthCheck = () => {
  const [status, setStatus] = useState("Ok"); // Default status as 'Ok'
  const [operatorData, setOperatorData] = useState(null); // Stores operator data
  const [companyName, setCompanyName] = useState(""); // Stores company name
  const [ppmFrequency, setPpmFrequency] = useState(""); // Stores PPM frequency
  const [uploadedFiles, setUploadedFiles] = useState([]); // Stores uploaded file data
  const mobileNumber = localStorage.getItem("loggedInUserMobileNumber"); // Mobile number for testing

  // Function to determine left side background color and image based on status
  const getStatusDetails = (currentStatus) => {
    return currentStatus === "Ok"
      ? { color: "#00bf63", image: "/2.png" }
      : { color: "red", image: "/1.png" };
  };

  // Function to fetch operator data from the API
  const fetchOperatorData = async () => {
    try {
      // Request to the API using the mobile number
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/operators/mobile/${mobileNumber}`
      );

      // Check if the response is successful
      if (response.data) {
        console.log("API Response:", response.data); // Log the entire response to check

        // Extract the company name from the response
        const company = response.data.companyName || "";
        setCompanyName(company); // Store the company name in state

        // Log the company name to the console
        console.log("Company Name:", company);

        // Now, fetch the company details from the /companies API
        fetchCompanyDetails(company);
      }
    } catch (error) {
      console.error("Error fetching operator data:", error);
    }
  };

  // Function to fetch company details and match the company name
  const fetchCompanyDetails = async (companyName) => {
    try {
      // Fetch all companies from the /companies API
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/companies`
      );

      // Find the company matching the operator's company name
      const companyDetails = response.data.find(
        (company) => company.name === companyName
      );

      // If the company is found, extract the PPM frequency and uploaded files
      if (companyDetails) {
        setPpmFrequency(companyDetails.healthCheck?.frequency); // Extract ppmFrequency from the company data
        console.log("PPM Frequency:", companyDetails.healthCheck?.frequency); // Log the frequency to check

        // Check for uploaded files per period (month, quarter, or year)
        setUploadedFiles(companyDetails.healthCheck?.pdf || []); // Extract uploaded files info
      } else {
        console.log("Company not found in the companies list.");
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };

  // Fetch operator data when the component mounts
  useEffect(() => {
    fetchOperatorData();
  }, []);

  // Function to get the number of boxes based on frequency (monthly, quarterly, yearly)
  const getBoxCount = (frequency) => {
    switch (frequency) {
      case "monthly":
        return 12; // 12 months in a year
      case "quarterly":
        return 4; // 4 quarters in a year
      case "yearly":
        return 1; // 1 year
      default:
        return 0;
    }
  };

  // Function to check if a file is uploaded for a particular period (month, quarter, year)
  const isFileUploaded = (period) => {
    console.log("Checking file for period:", period); // Debugging log
    return uploadedFiles.some(
      (file) =>
        (ppmFrequency === "monthly" && file.month === period) ||
        (ppmFrequency === "quarterly" && file.quarter === period) ||
        (ppmFrequency === "yearly" && file.year === period)
    );
  };

  // Function to generate the correct download URL based on the file path
  const getDownloadUrl = (filePath) => {
    if (!filePath) {
      console.error("File path is missing:", filePath); // Debugging log
      return ""; // Handle case when file path is missing
    }
    return `${import.meta.env.VITE_API_URL}/${filePath.replace(/\\/g, "/")}`; // Replaces backslashes with forward slashes for the URL
  };

  return (
    <div className="flex flex-col items-center h-full ml-20 mb-10">
      {/* Heading */}
      <h1
        className="text-gray-800 mt-24"
        style={{
          fontFamily: "Poppins",
          fontSize: "30px",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        HealthCheck
      </h1>

      {/* Display Company Name */}
      {companyName && (
        <h2
          className="text-gray-600 hidden"
          style={{
            fontFamily: "Poppins",
            fontSize: "24px",
            fontWeight: "normal",
            marginBottom: "20px",
          }}
        >
          Company: {companyName}
        </h2>
      )}

      {/* Display PPM Frequency */}
      {ppmFrequency && (
        <h3
          className="text-gray-600"
          style={{
            fontFamily: "Poppins",
            fontSize: "20px",
            fontWeight: "normal",
            marginBottom: "50px",
          }}
        >
          HealthCheck Frequency: {ppmFrequency}
        </h3>
      )}

      {/* Display the status boxes based on the frequency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {Array.from({ length: getBoxCount(ppmFrequency) }).map((_, index) => {
          const currentPeriod =
            ppmFrequency === "monthly"
              ? index + 1
              : ppmFrequency === "quarterly"
              ? index + 1
              : new Date().getFullYear(); // For quarterly and yearly, calculate based on the period
          const currentStatus = isFileUploaded(currentPeriod) ? "Ok" : "Not Ok"; // If file is uploaded, set 'Ok', otherwise 'Not Ok'
          const { color, image } = getStatusDetails(currentStatus);

          return (
            <div
              key={index}
              className="max-w-sm mx-auto  shadow-[8px_8px_1px_rgba(211,211,211,0.7)] border-black border-[2px] font-poppins"
              style={{
                width: "400px",
                height: "300px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div className="bg-gray-900 text-white text-lg font-bold flex items-center justify-center py-4 font-poppins">
                <img
                  src={image}
                  alt="Health Status"
                  className="w-12 mr-2 font-poppins"
                />
                System PPMcheck
              </div>

              {/* Content */}
              <div className="flex-1 p-4 text-gray-800 flex flex-col items-center justify-center">
                <p className="font-bold text-center font-poppins">
                  {ppmFrequency === "monthly"
                    ? `Month: ${currentPeriod}`
                    : ppmFrequency === "quarterly"
                    ? `Quarter: ${currentPeriod}`
                    : `Year: ${currentPeriod}`}
                </p>
                <p className="font-bold text-center font-poppins hidden">
                  Date: <span className="font-normal">2024-01-01</span>
                </p>
                <p className="font-bold text-center font-poppins">
                  Status:{" "}
                  <span className="font-normal" style={{ color }}>
                    {currentStatus}
                  </span>
                </p>

                {/* Show delete icon when file is uploaded */}

                {/* Upload File (only when file is not uploaded) */}
              </div>

              {/* Footer */}
              <div className="bg-[#f3effe] text-blue-600 text-center py-3 flex justify-center mt-auto font-poppins">
                {isFileUploaded(currentPeriod) &&
                  uploadedFiles
                    .filter(
                      (file) =>
                        (ppmFrequency === "monthly" &&
                          file.month === currentPeriod) ||
                        (ppmFrequency === "quarterly" &&
                          file.quarter === currentPeriod) ||
                        (ppmFrequency === "yearly" &&
                          file.year === currentPeriod)
                    ) // Filter files for this period
                    .map((file, index) => (
                      <a
                        key={index}
                        href={getDownloadUrl(file.filePath)}
                        target="_blank"
                        download
                        className="mt-4"
                      >
                        <button className="font-bold hover:underline">
                          <span className="mr-2 font-poppins">
                            Download Report
                          </span>
                        </button>
                      </a>
                    ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyHealthCheck;
