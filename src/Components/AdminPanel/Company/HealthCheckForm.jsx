import React, { useEffect, useState } from "react";

const HealthCheckForm = () => {
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
      const ppmCheckFrequency = data?.healthCheck?.frequency;

      // Set the frequency and any already uploaded files
      setPpmCheckPdf(data?.healthCheck?.pdf || []);
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

    // Add quarter, month, and year to the form data
    formData.append("quarter", index + 1); // For quarterly
    formData.append("month", index + 1); // For monthly
    formData.append("year", new Date().getFullYear()); // For yearly

    Array.from(files).forEach((file) => formData.append("file", file));

    // Helper function to convert numeric month to month name
    const getMonthName = (monthNumber) => {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return months[monthNumber - 1];
    };

    try {
      const endpoint = `/upload/healthcheck/${companyId}`;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseBody = await response.text(); // Handle response as text to capture HTML errors

      if (!response.ok) {
        throw new Error(`Error: ${responseBody}`);
      }

      const data = JSON.parse(responseBody); // Parse the response as JSON

      // Ensure data.filePaths is always an array (even if empty)
      const filePaths = Array.isArray(data.filePaths) ? data.filePaths : [];

      // Update the ppmCheckPdf state correctly
      setPpmCheckPdf((prevState) => {
        const updatedPpmCheckPdf = [...prevState];

        if (frequency === "yearly") {
          updatedPpmCheckPdf.push({
            year: new Date().getFullYear(),
            filePath: filePaths,
          });
        } else if (frequency === "quarterly") {
          const quarterIndex = updatedPpmCheckPdf.findIndex(
            (item) => item.quarter === index + 1
          );

          if (quarterIndex !== -1) {
            // If the quarter already exists, update its file paths
            updatedPpmCheckPdf[quarterIndex].filePath = [
              ...updatedPpmCheckPdf[quarterIndex].filePath,
              ...filePaths,
            ];
          } else {
            // If the quarter doesn't exist, create a new entry for it
            updatedPpmCheckPdf.push({
              quarter: index + 1,
              filePath: filePaths,
            });
          }
        } else if (frequency === "monthly") {
          const monthIndex = updatedPpmCheckPdf.findIndex(
            (item) => item.month === index + 1
          );

          if (monthIndex !== -1) {
            // Update the file path for the specific month
            updatedPpmCheckPdf[monthIndex].filePath = [
              ...updatedPpmCheckPdf[monthIndex].filePath,
              ...filePaths,
            ];
          } else {
            // Add a new entry for the specific month
            updatedPpmCheckPdf.push({
              month: index + 1,
              filePath: filePaths,
            });
          }
        }

        return updatedPpmCheckPdf; // Return updated state
      });

      // Prepare time period based on frequency
      let timePeriod = "";
      if (frequency === "yearly") {
        timePeriod = `Year ${new Date().getFullYear()}`;
      } else if (frequency === "quarterly") {
        timePeriod = `Quarter ${index + 1}`;
      } else if (frequency === "monthly") {
        timePeriod = `${getMonthName(index + 1)}`;
      }

      // Send email to all operators
      if (operatorDetails.length > 0) {
        // Send personalized emails to each operator
        const emailPromises = operatorDetails.map(async (operator) => {
          // Send email notification for each operator
          const emailResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/send-healthcheck-report-mail`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                recipientEmails: [operator.email],
                timePeriod,
                firstName: operator.operatorName, // Use the specific operator's name
              }),
            }
          );

          if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            console.error(
              `Email sending failed for ${operator.email}:`,
              errorData.message
            );
            return false;
          }
          return true;
        });

        // Wait for all email sending attempts
        const emailResults = await Promise.all(emailPromises);

        // Check if all emails were sent successfully
        if (emailResults.every((result) => result)) {
          console.log("Email notifications sent successfully to all operators");
        } else {
          console.warn("Some email notifications failed to send");
        }
      }
	  // Send notification to operators
    const notificationMessage = frequency === "monthly" 
      ? `Your HealthCheck report has been uploaded for month of ${getMonthName(index + 1)}`
      : frequency === "quarterly" 
        ? `Your HealthCheck report has been uploaded for Quarter ${index + 1}`
        : `Your HealthCheck report has been uploaded for Year ${new Date().getFullYear()}`;

    // Send notification to all operators for this company
    const notificationResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/notification/company/${companyName}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: notificationMessage
        }),
      }
    );

    if (!notificationResponse.ok) {
      const errorData = await notificationResponse.json();
      console.warn("Failed to send notifications:", errorData.message);
    }

      alert("Health Check PDF uploaded successfully!");
    } catch (error) {
      alert("Error uploading file: " + error.message);
    }
  };

  //Delete file
  const deleteFile = async (fileId, checkType, index) => {
    try {
      // Send DELETE request to backend to delete the file
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/deleteFile/${companyId}/${checkType}/${fileId}`,
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

        if (checkType === "healthcheck") {
          // Handle the deletion for healthcheck files
          const updatedFiles = updatedPpmCheckPdf.filter(
            (item) => item._id !== fileId
          );
          return updatedFiles;
        } else if (checkType === "ppmcheck") {
          // Handle the deletion for ppmcheck files
          const updatedFiles = updatedPpmCheckPdf.filter(
            (item) => item._id !== fileId
          );
          return updatedFiles;
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

    const downloadUrl = `${import.meta.env.VITE_API_URL}/${filePath.replace(
      /\\/g,
      "/"
    )}`;
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
      <h1>Health Check Form</h1>
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

      <div className="w-1/2">
        <label htmlFor="company-name">
          Company Name<span className="required-star">*</span>
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
                    System Healthcheck
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
                          onClick={() =>
                            deleteFile(fileUploaded._id, "healthcheck", index)
                          } // Pass fileId, checkType, and index
                          className="text-red-500 hover:text-red-700"
                          title="Delete File"
                        >
                          <i className="fa fa-trash"></i>{" "}
                          {/* Using Font Awesome trash icon */}
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
                        onClick={() =>
                          handleDownloadPdf(fileUploaded.filePath[0])
                        }
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
                    ppmCheckPdf.some(
                      (item) => item.year === new Date().getFullYear()
                    )
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
                <p className="font-bold text-center">
                  Year: {new Date().getFullYear()}
                </p>
                <p className="font-bold text-center hidden">
                  Date: <span className="font-normal">2024-01-01</span>
                </p>
                <p className="font-bold text-center">
                  Status:{" "}
                  <span className="font-normal">
                    {ppmCheckPdf.some(
                      (item) => item.year === new Date().getFullYear()
                    )
                      ? "Uploaded"
                      : "Not Uploaded"}
                  </span>
                </p>

                {/* Show delete icon when file is uploaded */}
                {ppmCheckPdf.some(
                  (item) => item.year === new Date().getFullYear()
                ) && (
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
                {!ppmCheckPdf.some(
                  (item) => item.year === new Date().getFullYear()
                ) && (
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
                {ppmCheckPdf.some(
                  (item) => item.year === new Date().getFullYear()
                ) && (
                  <button
                    onClick={() =>
                      handleDownloadPdf(
                        ppmCheckPdf.find(
                          (item) => item.year === new Date().getFullYear()
                        ).filePath[0]
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

export default HealthCheckForm;
