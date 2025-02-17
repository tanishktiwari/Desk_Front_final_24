import React, { useState, useEffect } from "react";
import axios from "axios";
import downloadIcon from "/download.svg";

const PPMStatus = () => {
  const [status, setStatus] = useState("Ok");
  const [operatorData, setOperatorData] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [ppmFrequency, setPpmFrequency] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const mobileNumber = localStorage.getItem("loggedInUserMobileNumber");

  const getStatusDetails = (currentStatus) => {
    return currentStatus === "Ok"
      ? { color: "#00bf63", image: "/2.png" }
      : { color: "red", image: "/1.png" };
  };

  const fetchOperatorData = async () => {
    try {
      console.log("Fetching operator data for mobile:", mobileNumber);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/operators/mobile/${mobileNumber}`
      );

      if (response.data) {
        console.log("Operator API Response:", response.data);
        const company = response.data.companyName || "";
        setCompanyName(company);
        console.log("Found Company Name:", company);
        if (company) {
          await fetchCompanyDetails(company);
        }
      }
    } catch (error) {
      console.error("Error fetching operator data:", error);
    }
  };

  const fetchCompanyDetails = async (companyName) => {
    try {
      console.log("Fetching company details for:", companyName);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/companies`
      );

      const companyDetails = response.data.find(
        (company) => company.name === companyName
      );

      if (companyDetails) {
        console.log("Found company details:", companyDetails);
        console.log("PPM Check data:", companyDetails.ppmCheck);
        
        // Set PPM frequency
        setPpmFrequency(companyDetails.ppmCheck?.frequency);
        console.log("Setting PPM Frequency:", companyDetails.ppmCheck?.frequency);

        // Process and normalize PDF files
        const pdfFiles = companyDetails.ppmCheck?.pdf || [];
        console.log("Raw PDF files:", pdfFiles);

        const normalizedFiles = pdfFiles.map(file => ({
          ...file,
          filePath: Array.isArray(file.filePath) ? file.filePath : [file.filePath].filter(Boolean)
        }));

        console.log("Normalized files:", normalizedFiles);
        setUploadedFiles(normalizedFiles);
      } else {
        console.log("Company not found in the companies list.");
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };

  useEffect(() => {
    fetchOperatorData();
  }, []);

  const getBoxCount = (frequency) => {
    switch (frequency) {
      case "monthly":
        return 12;
      case "quarterly":
        return 4;
      case "yearly":
        return 1;
      default:
        return 0;
    }
  };

  const isFileUploaded = (period) => {
    console.log("Checking file for period:", period);
    console.log("Current ppmFrequency:", ppmFrequency);
    console.log("Current uploadedFiles:", uploadedFiles);

    const fileExists = uploadedFiles.some(file => {
      const matches = (
        (ppmFrequency === "monthly" && file.month === period) ||
        (ppmFrequency === "quarterly" && file.quarter === period) ||
        (ppmFrequency === "yearly" && file.year === period)
      );
      console.log(`File ${JSON.stringify(file)} matches period ${period}:`, matches);
      return matches;
    });

    console.log("File exists for period?", fileExists);
    return fileExists;
  };

  const getDownloadUrl = (filePath) => {
    if (!filePath) {
      console.error("File path is missing:", filePath);
      return "";
    }

    // Handle array of file paths
    if (Array.isArray(filePath)) {
      if (filePath.length === 0) {
        console.error("File path array is empty");
        return "";
      }
      filePath = filePath[0];
    }

    console.log("Processing file path:", filePath);
    return `${import.meta.env.VITE_API_URL}/${filePath.replace(/\\/g, "/")}`;
  };

  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };

  const getFileForPeriod = (period) => {
    const files = uploadedFiles.filter(file => 
      (ppmFrequency === "monthly" && file.month === period) ||
      (ppmFrequency === "quarterly" && file.quarter === period) ||
      (ppmFrequency === "yearly" && file.year === period)
    );
    console.log(`Files for period ${period}:`, files);
    return files;
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-screen-7xl mx-auto pl-0 sm:pl-4 md:pl-6 lg:pl-60">
        {/* Heading Section */}
        <div className="text-center mt-16 sm:mt-20 lg:mt-24 mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 font-poppins mb-4">
            PPM Check
          </h1>

          {companyName && (
            <h2 className="text-xl sm:text-2xl text-gray-600 font-poppins mb-2 hidden">
              Company: {companyName}
            </h2>
          )}

          {ppmFrequency && (
            <div className="flex flex-col items-center">
              <h3 className="text-lg sm:text-xl text-gray-600 font-poppins">
                PPM Frequency: {capitalizeFirstLetter(ppmFrequency)}
              </h3>
              <div className="w-40 h-0.5 bg-gray-300 mt-2"></div>
            </div>
          )}
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-2 gap-y-8 gap-x-8 lg:gap-x-12">
          {Array.from({ length: getBoxCount(ppmFrequency) }).map((_, index) => {
            const currentPeriod =
              ppmFrequency === "monthly"
                ? index + 1
                : ppmFrequency === "quarterly"
                ? index + 1
                : new Date().getFullYear();
                
            const periodFiles = getFileForPeriod(currentPeriod);
            const currentStatus = periodFiles.length > 0 ? "Ok" : "Not Ok";
            const { color, image } = getStatusDetails(currentStatus);

            return (
              <div
                key={index}
                className="flex flex-col border-2 border-black shadow-[4px_4px_1px_rgba(211,211,211,0.7)] sm:shadow-[8px_8px_1px_rgba(211,211,211,0.7)] w-full max-w-sm mx-auto font-poppins"
                style={{ minHeight: "300px" }}
              >
                {/* Header */}
                <div className="bg-gray-900 text-white py-3 sm:py-4 flex items-center justify-center">
                  <img
                    src={image}
                    alt="Health Status"
                    className="w-8 sm:w-12 mr-2"
                  />
                  <span className="text-base sm:text-lg font-bold">
                    System PPMcheck
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col items-center justify-center">
                  <p className="font-bold text-center text-sm sm:text-base">
                    {ppmFrequency === "monthly"
                      ? `Month: ${currentPeriod}`
                      : ppmFrequency === "quarterly"
                      ? `Quarter: ${currentPeriod}`
                      : `Year: ${currentPeriod}`}
                  </p>
                  <p className="font-bold text-center text-sm sm:text-base">
                    Status:{" "}
                    <span style={{ color }} className="font-normal">
                      {currentStatus}
                    </span>
                  </p>
                </div>

                {/* Footer */}
                <div className="bg-[#f3effe] py-3 mt-auto">
                  {periodFiles.map((file, fileIndex) => (
                    <a
                      key={fileIndex}
                      href={getDownloadUrl(file.filePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="block text-center"
                    >
                      <button className="text-blue-600 font-bold hover:underline text-sm sm:text-base">
                        <span className="mr-2">Download Report</span>
                      </button>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PPMStatus;