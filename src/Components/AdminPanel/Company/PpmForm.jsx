import React, { useEffect, useState } from "react";

const PpmForm = () => {
  const [companies, setCompanies] = useState([]); // List of companies
  const [companyName, setCompanyName] = useState(""); // Selected company name
  const [companyId, setCompanyId] = useState(null); // Company ID
  const [frequency, setFrequency] = useState(""); // Maintenance frequency
  const [ppmCheckPdf, setPpmCheckPdf] = useState([]); // PPM check PDFs
  const [error, setError] = useState(null); // Error state
  const [viewPpmCheckPdf, setViewPpmCheckPdf] = useState(null); // View PPM Check PDF
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [operatorDetails, setOperatorDetails] = useState([]); // Store operator details
  


  // Fetch the companies list
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/companies`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch companies.");
        }
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError(error.message);
      }
    };

    fetchCompanies();
  }, []);

  // Handle company selection
  const handleInputChange = async (event) => {
    const selectedCompanyName = event.target.value;
    setCompanyName(selectedCompanyName);

    // Find selected company
    const selectedCompany = companies.find(
      (company) => company.name === selectedCompanyName
    );

    if (selectedCompany) {
      setCompanyId(selectedCompany._id); // Update company ID
      fetchCompanyDetails(selectedCompany._id); // Fetch company details
      fetchCompanyDetails(selectedCompany.name); // Fetch details using company name
    }
  };

  // Fetch the selected company's details and already uploaded files
  const fetchCompanyDetails = async (id) => {
    console.log("Fetching company details for company ID:", id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/companies/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch company details.");
      }
      const data = await response.json();
      const ppmCheckFrequency = data?.ppmCheck?.frequency;

      // Set the frequency and any already uploaded files
      setPpmCheckPdf(data?.ppmCheck?.pdf || []);
      setFrequency(ppmCheckFrequency || "");
    } catch (error) {
      console.error("Error fetching company details:", error);
      setError(error.message);
    }
  };

  // Upload file (PPM Check PDF)
  const uploadFile = async (event, index) => {
  const formData = new FormData();
  const files = event.target.files;

  if (files.length === 0) return;

  // Add standardized period identifiers
  const period = {
    quarter: frequency === "quarterly" ? index + 1 : null,
    month: frequency === "monthly" ? index + 1 : null,
    year: new Date().getFullYear()
  };

  // Add period data to form
  Object.entries(period).forEach(([key, value]) => {
    if (value !== null) {
      formData.append(key, value);
    }
  });

  Array.from(files).forEach((file) => formData.append("file", file));

  try {
    const endpoint = `/upload/ppmcheck/${companyId}`;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${await response.text()}`);
    }

    const data = await response.json();
    const filePaths = Array.isArray(data.filePaths) ? data.filePaths : [];

    // Update state with standardized structure
    setPpmCheckPdf((prevState) => {
      const updatedPpmCheckPdf = [...prevState];
      const newEntry = {
        filePath: filePaths,
        ...period
      };

      // Find existing entry index based on period
      const existingIndex = updatedPpmCheckPdf.findIndex(item => 
        (frequency === "yearly" && item.year === period.year) ||
        (frequency === "quarterly" && item.quarter === period.quarter) ||
        (frequency === "monthly" && item.month === period.month)
      );

      if (existingIndex !== -1) {
        // Update existing entry
        updatedPpmCheckPdf[existingIndex] = {
          ...updatedPpmCheckPdf[existingIndex],
          filePath: [...updatedPpmCheckPdf[existingIndex].filePath, ...filePaths]
        };
      } else {
        // Add new entry
        updatedPpmCheckPdf.push(newEntry);
      }

      return updatedPpmCheckPdf;
    });

    // Rest of the notification and email code remains the same
    alert("PPM Check PDF uploaded successfully!");
  } catch (error) {
    alert("Error uploading file: " + error.message);
  }
};

  //Delete file 
  const deleteFile = async (fileId, checkType, index) => {
  try {
    // Format checkType to ensure "healthCheck" is used instead of "healthcheck"
    const formattedCheckType = checkType === "healthcheck" ? "healthCheck" : checkType;

    // Send DELETE request to backend to delete the file
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/deleteFile/${companyId}/${formattedCheckType}/${fileId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || "Error deleting file");
    }

    // If the deletion is successful, update the state to remove the file
    setPpmCheckPdf((prevState) => {
      const updatedPpmCheckPdf = [...prevState];

      // Filter out the deleted file based on checkType (healthCheck or ppmcheck)
      if (formattedCheckType === "healthCheck") {
        // Handle the deletion for healthcheck files
        return updatedPpmCheckPdf.filter((item) => item._id !== fileId);
      } else if (formattedCheckType === "ppmcheck") {
        // Handle the deletion for ppmcheck files
        return updatedPpmCheckPdf.filter((item) => item._id !== fileId);
      }

      return updatedPpmCheckPdf;
    });

    alert("File deleted successfully!");
  } catch (error) {
    alert("Error deleting file: " + error.message);
  }
};




  // Determine the number of boxes based on frequency
  const getBoxCount = () => {
    switch (frequency) {
      case "quarterly":
        return 4; // 4 quarters
      case "monthly":
        return 12; // 12 months
      case "yearly":
        return 1; // 1 year
      default:
        return 0;
    }
  };

  // Get the status details (color and image) based on whether a file is uploaded
  const getStatusDetails = (fileUploaded) => {
    return fileUploaded
      ? { color: "#00bf63", image: "/2.png" } // Green for uploaded file
      : { color: "red", image: "/1.png" }; // Red for no file uploaded
  };

  // Handle download of the PDF file
  const handleDownloadPdf = (filePath) => {
    if (!filePath) {
      alert("File not found");
      return;
    }

    const downloadUrl = `${import.meta.env.VITE_API_URL}/${filePath.replace(/\\/g, "/")}`;
    window.open(downloadUrl, "_blank");
  };

 // Fetch operator details whenever company name changes
  useEffect(() => {
    if (companyName) {
      const fetchOperatorDetails = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/operators/by-company/${companyName}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch operator details.");
          }
          const data = await response.json();
          
          // Log the response to check the fetched data
          console.log("Operator Details:", data);

          // Set the operator details
          setOperatorDetails(data.operatorDetails || []); 
        } catch (error) {
          console.error("Error fetching operator details:", error);
          setError(error.message);
          
          // Clear operator details if fetch fails
          setOperatorDetails([]);
        }
      };

      fetchOperatorDetails();
    } else {
      // Clear operator details if no company is selected
      setOperatorDetails([]);
    }
  }, [companyName]);





  return (
    <div className="ml-[20%] mt-72">
      <h1>PPM Form</h1>
       <div className="hidden">
      {operatorDetails.length > 0 && (
        <>
          <h2>Operator Details</h2>
          {operatorDetails.map((operator, index) => (
            <div key={index}>
              <p>Operator Name: {operator.operatorName}</p>
              <p>Operator Email: {operator.email}</p>
            </div>
          ))}
        </>
      )}
    </div>
    {/* {error && <div className="error-message">{error}</div>} */}

      <div className="w-full">
        <label htmlFor="company-name">
          Company Name<span className="required-star mr-10">*</span>
        </label>
        <select
          id="company-name"
          value={companyName}
          onChange={handleInputChange}
        >
          <option value="">Select a company</option>
          {companies.map((company) => (
            <option key={company._id} value={company.name}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {companyId && <div>Selected Company ID: {companyId}</div>}
      {frequency && <div>Selected Frequency: {frequency}</div>}
      

      {frequency && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {/* Monthly and Quarterly Logic */}
          {frequency !== "yearly" &&
            Array.from({ length: getBoxCount() }).map((_, index) => {
              const fileUploaded = ppmCheckPdf.find(
                (item) =>
                  (frequency === "monthly" && item.month === index + 1) ||
                  (frequency === "quarterly" && item.quarter === index + 1)
              );
              const { color, image } = getStatusDetails(fileUploaded);

              return (
                <div
                  key={index}
                  className="max-w-sm mx-auto rounded-lg shadow-lg overflow-hidden border border-gray-200"
                  style={{
                    width: "100%",
                    height: "300px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Header */}
                  <div className="bg-[#0050cb] text-white text-lg font-bold flex items-center justify-center py-4">
                    <img src={image} alt="Check Icon" className="w-12  mr-2" />
                    System PPMCheck
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 text-gray-800 flex flex-col items-center justify-center">
                    <p className="font-bold text-center">
                      {frequency === "monthly"
                        ? `Month: ${index + 1}`
                        : `Quarter: ${index + 1}`}
                    </p>
                    <p className="font-bold text-center hidden">
                      Date: <span className="font-normal">2024-01-01</span>
                    </p>
                    <p className="font-bold text-center">
                      Status:{" "}
                      <span className="font-normal" style={{ color }}>
                        {fileUploaded ? "Uploaded" : "Not Uploaded"}
                      </span>
                    </p>

                    {/* Show delete icon when file is uploaded */}
                    {fileUploaded && (
  <div className="mt-2 text-center">
    <button
      onClick={() => deleteFile(fileUploaded._id, "healthcheck", index)} // Pass fileId, checkType, and index
      className="text-red-500 hover:text-red-700"
      title="Delete File"
    >
      <i className="fa fa-trash"></i> {/* Using Font Awesome trash icon */}
    </button>
  </div>
)}


                    {/* Upload File (only when file is not uploaded) */}
                    {!fileUploaded && (
                      <div className="mt-4 flex justify-center">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => uploadFile(e, index)} // Handle file upload
                          multiple
                          className="border p-2 rounded-md "
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="bg-[#f3effe] text-blue-600 text-center py-3 flex justify-center mt-auto">
                    {fileUploaded && (
                      <button
                        onClick={() => handleDownloadPdf(fileUploaded.filePath[0])}
                        className="font-bold hover:underline hidden"
                      >
                        Download Report
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Yearly Logic */}
          {frequency === "yearly" && (
            <div
              key={0}
              className="max-w-sm mx-auto rounded-lg shadow-lg overflow-hidden border border-gray-200"
              style={{
                width: "100%",
                height: "300px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="bg-[#0050cb] text-white text-lg font-bold flex items-center justify-center py-4">
                <img
                  src={
                    ppmCheckPdf.some((item) => item.year === new Date().getFullYear())
                      ? "/2.png"
                      : "/1.png"
                  }
                  alt="Check Icon"
                  className="w-12 mr-2"
                />
                System Healthcheck
              </div>

              {/* Content */}
              <div className="flex-1 p-4 text-gray-800 flex flex-col items-center justify-center">
                <p className="font-bold text-center">Year: {new Date().getFullYear()}</p>
                <p className="font-bold text-center hidden">
                  Date: <span className="font-normal">2024-01-01</span>
                </p>
                <p className="font-bold text-center">
                  Status:{" "}
                  <span className="font-normal">
                    {ppmCheckPdf.some((item) => item.year === new Date().getFullYear())
                      ? "Uploaded"
                      : "Not Uploaded"}
                  </span>
                </p>

                {/* Show delete icon when file is uploaded */}
                {ppmCheckPdf.some((item) => item.year === new Date().getFullYear()) && (
                  <div className="mt-2 text-center">
                    <button
                      onClick={() =>
                        deleteFile(ppmCheckPdf[0]._id, "healthcheck")
                      } // Delete the file
                      className="text-red-500 hover:text-red-700"
                      title="Delete File"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                )}

                {/* Upload File (only when file is not uploaded) */}
                {!ppmCheckPdf.some((item) => item.year === new Date().getFullYear()) && (
                  <div className="mt-4 flex justify-center ">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => uploadFile(e, 0)} // Upload file for the year
                      multiple
                      className="border p-2 rounded-md "
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-[#f3effe] text-blue-600 text-center py-3 flex justify-center mt-auto">
                {ppmCheckPdf.some((item) => item.year === new Date().getFullYear()) && (
                  <button
                    onClick={() =>
                      handleDownloadPdf(
                        ppmCheckPdf.find((item) => item.year === new Date().getFullYear()).filePath[0]
                      )
                    } // Access the file path
                    className="font-bold hover:underline"
                  >
                    Download Report
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PpmForm;
