import React, { useState, useEffect } from "react";
import EmailListModal from "./EmailListModal";
import axios from "axios";
import "./AddEmailsModal.css";

const Addmail = ({ onClose, mobile, onEmailAdded, contactToEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    designation: "",
  });
  const [emailList, setEmailList] = useState([]);
  const [showEmailList, setShowEmailList] = useState(false);
  const [initials, setInitials] = useState("");
  const [operatorData, setOperatorData] = useState(null); // Added this line to define the state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveAndAddMore = async () => {
    try {
      console.log("Saving:", formData);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/operators/mobile/${mobile}/managers`,
        {
          name: formData.name,
          email: formData.email,
          designation: formData.designation,
          contactNumber: formData.number,
        }
      );

      // Reset form data
      setFormData({
        name: "",
        number: "",
        email: "",
        designation: "",
      });

      // Call the function to refresh the contact list
      onEmailAdded();
    } catch (error) {
      console.error(
        "Error saving manager:",
        error.response?.data || error.message
      );
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting:", formData);

      // Check if we are editing an existing contact or adding a new one
      const url = contactToEdit
        ? `${
            import.meta.env.VITE_API_URL
          }/operators/mobile/${mobile}/managers/${contactToEdit.contactNumber}` // Edit API URL
        : `${import.meta.env.VITE_API_URL}/operators/mobile/${mobile}/managers`; // Add API URL

      const method = contactToEdit ? "put" : "post"; // PUT for edit, POST for add

      // Submit the data
      await axios[method](url, {
        name: formData.name,
        email: formData.email,
        designation: formData.designation,
        contactNumber: formData.number,
      });

      // Call the function to refresh the contact list
      onEmailAdded();
      setShowEmailList(true); // Show the email list modal
      onClose(); // Close the AddEmailsModal

      // Reset form data
      setFormData({
        name: "",
        number: "",
        email: "",
        designation: "",
      });
    } catch (error) {
      console.error(
        "Error submitting manager:",
        error.response?.data || error.message
      );
    }
  };

  const handleCloseEmailList = () => {
    setShowEmailList(false);
  };

  useEffect(() => {
    const mobileNumber = localStorage.getItem("loggedInUserMobileNumber");
    if (mobileNumber) {
      const fetchOperatorData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/operators/mobile/${mobileNumber}`
          );
          setOperatorData(response.data); // This now works because operatorData is defined

          if (response.data) {
            // No need to set the formData with operator info
            // if you don't want the input fields pre-filled.

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
  }, []); // Empty dependency array ensures this runs only once when component mounts

  // If editing, pre-fill the form with contact data
  useEffect(() => {
    if (contactToEdit) {
      setFormData({
        name: contactToEdit.name || "",
        number: contactToEdit.contactNumber || "",
        email: contactToEdit.email || "",
        designation: contactToEdit.designation || "",
      });
    }
  }, [contactToEdit]); // Re-run when contactToEdit changes

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex justify-center items-center z-50">
      {/* Full screen backdrop */}
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="flex items-center justify-center w-fit min-h-auto">
          <div className="relative px-4 py-8 bg-gray-100 shadow rounded-3xl sm:p-8 w-fit h-auto">
            {/* Cancel Button */}
            <button
              className="absolute top-0 right-6 text-gray-700 hover:text-red-600 focus:outline-none"
              aria-label="Cancel"
              onClick={onClose}
            >
              <span className="text-5xl">&times;</span> {/* "X" icon */}
            </button>
            <div className="max-w-md mx-6">
              <div className="flex items-center space-x-5">
                {/* Display initials here */}
                <div className="h-6464 w-6464 bg-yellow-200 rounded-full flex justify-center items-center text-yellow-500 text-4xl font-poppins">
                  {initials || "i"}
                </div>
                <h2 className="leading-relaxed whitespace-nowrap block pl-0.5 font-bold text-2xl text-gray-700 font-poppins">
                  {contactToEdit ? "Edit Email Details" : "Add Email Details"}
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="py-6 text-base leading-6 space-y-8 text-gray-900 sm:text-sm sm:leading-7">
                  {/* Form Fields (Name, Email, etc.) */}
                  <div className="flex flex-col pt-0 h-[60px] mb-6">
                    <label className="leading-loose text-fontcolor mb-2 text-lg font-poppins">
                      Name
                    </label>
                    <input
                      type="text"
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[60px] sm:text-sm border-gray-300 focus:outline-none text-black bg-white font-poppins"
                      name="name"
                      value={formData.name} // Still allowing for form data input
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex flex-col pt-0 h-[60px] mb-6">
                    <label className="leading-loose text-fontcolor mb-2 text-lg font-poppins">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="number"
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[60px] sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-white font-poppins"
                      value={formData.number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex flex-col pt-0 h-[60px] mb-6">
                    <label className="leading-loose text-fontcolor mb-2 text-lg font-poppins">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[60px] sm:text-sm border-gray-300 rounded-md focus:outline-none text-black bg-white font-poppins"
                    />
                  </div>

                  <div className="flex flex-col pt-0 h-[60px] mb-6">
                    <label className="leading-loose text-fontcolor mb-2 text-lg font-poppins">
                      Designation
                    </label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full h-[60px] sm:text-sm border-gray-300 focus:outline-none text-black bg-white font-poppins"
                    >
                      {/* Add all the corporate designations here */}
                      <option value="">Select Designation</option>
                      {/* Executive and Senior Management Titles */}
                      <option value="Chief Executive Officer (CEO)">
                        Chief Executive Officer (CEO)
                      </option>
                      <option value="Chief Operating Officer (COO)">
                        Chief Operating Officer (COO)
                      </option>
                      <option value="Chief Financial Officer (CFO)">
                        Chief Financial Officer (CFO)
                      </option>
                      <option value="Chief Marketing Officer (CMO)">
                        Chief Marketing Officer (CMO)
                      </option>
                      <option value="Chief Technology Officer (CTO)">
                        Chief Technology Officer (CTO)
                      </option>
                      <option value="Chief Information Officer (CIO)">
                        Chief Information Officer (CIO)
                      </option>
                      <option value="Chief Product Officer (CPO)">
                        Chief Product Officer (CPO)
                      </option>
                      <option value="Chief Human Resources Officer (CHRO)">
                        Chief Human Resources Officer (CHRO)
                      </option>
                      <option value="Chief Legal Officer (CLO)">
                        Chief Legal Officer (CLO)
                      </option>
                      <option value="Chief Strategy Officer (CSO)">
                        Chief Strategy Officer (CSO)
                      </option>
                      <option value="Chief Innovation Officer (CIO)">
                        Chief Innovation Officer (CIO)
                      </option>
                      <option value="Chief Compliance Officer (CCO)">
                        Chief Compliance Officer (CCO)
                      </option>
                      <option value="Managing Director (MD)">
                        Managing Director (MD)
                      </option>
                      <option value="Executive Director">
                        Executive Director
                      </option>
                      <option value="President">President</option>
                      <option value="Executive Vice President (EVP)">
                        Executive Vice President (EVP)
                      </option>
                      <option value="Senior Vice President (SVP)">
                        Senior Vice President (SVP)
                      </option>
                      <option value="Vice President (VP)">
                        Vice President (VP)
                      </option>

                      {/* Middle Management Titles */}
                      <option value="General Manager (GM)">
                        General Manager (GM)
                      </option>
                      <option value="Regional Manager">Regional Manager</option>
                      <option value="Division Manager">Division Manager</option>
                      <option value="Department Head">Department Head</option>
                      <option value="Business Unit Head">
                        Business Unit Head
                      </option>
                      <option value="Branch Manager">Branch Manager</option>
                      <option value="Area Manager">Area Manager</option>
                      <option value="Director">Director</option>
                      <option value="Associate Director">
                        Associate Director
                      </option>
                      <option value="Assistant Vice President (AVP)">
                        Assistant Vice President (AVP)
                      </option>
                      <option value="Manager">Manager</option>
                      <option value="Senior Manager">Senior Manager</option>
                      <option value="Deputy Manager">Deputy Manager</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Product Manager">Product Manager</option>

                      {/* Functional and Department-Specific Titles */}
                      <option value="HR Manager">HR Manager</option>
                      <option value="HR Director">HR Director</option>
                      <option value="Talent Acquisition Specialist">
                        Talent Acquisition Specialist
                      </option>
                      <option value="HR Business Partner">
                        HR Business Partner
                      </option>
                      <option value="Recruitment Manager">
                        Recruitment Manager
                      </option>
                      <option value="HR Assistant">HR Assistant</option>
                      <option value="Learning and Development Manager">
                        Learning and Development Manager
                      </option>
                      <option value="Employee Relations Manager">
                        Employee Relations Manager
                      </option>
                      <option value="Compensation and Benefits Manager">
                        Compensation and Benefits Manager
                      </option>
                      <option value="HR Coordinator">HR Coordinator</option>
                      <option value="Training and Development Specialist">
                        Training and Development Specialist
                      </option>

                      {/* Finance & Accounting */}
                      <option value="Financial Analyst">
                        Financial Analyst
                      </option>
                      <option value="Accountant">Accountant</option>
                      <option value="Finance Manager">Finance Manager</option>
                      <option value="Controller">Controller</option>
                      <option value="Audit Manager">Audit Manager</option>
                      <option value="Tax Manager">Tax Manager</option>
                      <option value="Investment Analyst">
                        Investment Analyst
                      </option>
                      <option value="Treasury Manager">Treasury Manager</option>
                      <option value="Accounts Payable/Receivable Specialist">
                        Accounts Payable/Receivable Specialist
                      </option>
                      <option value="Chief Accountant">Chief Accountant</option>
                      <option value="Internal Auditor">Internal Auditor</option>
                      <option value="Financial Controller">
                        Financial Controller
                      </option>

                      {/* Sales & Marketing */}
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="Marketing Manager">
                        Marketing Manager
                      </option>
                      <option value="Sales Executive">Sales Executive</option>
                      <option value="Marketing Executive">
                        Marketing Executive
                      </option>
                      <option value="Brand Manager">Brand Manager</option>
                      <option value="Product Marketing Manager">
                        Product Marketing Manager
                      </option>
                      <option value="Sales Director">Sales Director</option>
                      <option value="Business Development Manager">
                        Business Development Manager
                      </option>
                      <option value="Account Manager">Account Manager</option>
                      <option value="Digital Marketing Manager">
                        Digital Marketing Manager
                      </option>
                      <option value="Content Manager">Content Manager</option>
                      <option value="Public Relations (PR) Manager">
                        Public Relations (PR) Manager
                      </option>
                      <option value="Customer Success Manager">
                        Customer Success Manager
                      </option>
                      <option value="Sales Representative">
                        Sales Representative
                      </option>
                      <option value="SEO Specialist">SEO Specialist</option>

                      {/* Operations */}
                      <option value="Operations Manager">
                        Operations Manager
                      </option>
                      <option value="Supply Chain Manager">
                        Supply Chain Manager
                      </option>
                      <option value="Logistics Manager">
                        Logistics Manager
                      </option>
                      <option value="Procurement Manager">
                        Procurement Manager
                      </option>
                      <option value="Inventory Manager">
                        Inventory Manager
                      </option>
                      <option value="Operations Director">
                        Operations Director
                      </option>
                      <option value="Business Operations Manager">
                        Business Operations Manager
                      </option>
                      <option value="Process Improvement Manager">
                        Process Improvement Manager
                      </option>
                      <option value="Production Manager">
                        Production Manager
                      </option>
                      <option value="Quality Assurance (QA) Manager">
                        Quality Assurance (QA) Manager
                      </option>
                      <option value="Operations Coordinator">
                        Operations Coordinator
                      </option>
                      <option value="Facility Manager">Facility Manager</option>

                      {/* Technology & IT */}
                      <option value="Software Engineer">
                        Software Engineer
                      </option>
                      <option value="Systems Analyst">Systems Analyst</option>
                      <option value="IT Manager">IT Manager</option>
                      <option value="Network Administrator">
                        Network Administrator
                      </option>
                      <option value="Web Developer">Web Developer</option>
                      <option value="Technical Support Specialist">
                        Technical Support Specialist
                      </option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="Business Intelligence Analyst">
                        Business Intelligence Analyst
                      </option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                      <option value="Solutions Architect">
                        Solutions Architect
                      </option>
                      <option value="Cloud Architect">Cloud Architect</option>
                      <option value="IT Project Manager">
                        IT Project Manager
                      </option>
                      <option value="Cybersecurity Specialist">
                        Cybersecurity Specialist
                      </option>
                      <option value="Chief Technology Officer (CTO)">
                        Chief Technology Officer (CTO)
                      </option>
                      <option value="Database Administrator (DBA)">
                        Database Administrator (DBA)
                      </option>
                      <option value="Software Architect">
                        Software Architect
                      </option>

                      {/* Legal */}
                      <option value="Legal Counsel">Legal Counsel</option>
                      <option value="General Counsel">General Counsel</option>
                      <option value="Corporate Lawyer">Corporate Lawyer</option>
                      <option value="Legal Assistant">Legal Assistant</option>
                      <option value="Paralegal">Paralegal</option>
                      <option value="Contract Manager">Contract Manager</option>
                      <option value="Compliance Officer">
                        Compliance Officer
                      </option>
                      <option value="Intellectual Property (IP) Manager">
                        Intellectual Property (IP) Manager
                      </option>
                      <option value="Legal Secretary">Legal Secretary</option>

                      {/* Customer Service */}
                      <option value="Customer Service Manager">
                        Customer Service Manager
                      </option>
                      <option value="Customer Support Representative">
                        Customer Support Representative
                      </option>
                      <option value="Client Services Manager">
                        Client Services Manager
                      </option>
                      <option value="Help Desk Specialist">
                        Help Desk Specialist
                      </option>
                      <option value="Call Center Representative">
                        Call Center Representative
                      </option>
                      <option value="Customer Support Specialist">
                        Customer Support Specialist
                      </option>
                      <option value="Customer Experience Manager">
                        Customer Experience Manager
                      </option>
                      <option value="Technical Support Specialist">
                        Technical Support Specialist
                      </option>
                      <option value="Client Relations Manager">
                        Client Relations Manager
                      </option>
                      <option value="Customer Success Manager">
                        Customer Success Manager
                      </option>

                      {/* Entry-Level and Junior Titles */}
                      <option value="Assistant">Assistant</option>
                      <option value="Associate">Associate</option>
                      <option value="Junior Analyst">Junior Analyst</option>
                      <option value="Intern">Intern</option>
                      <option value="Trainee">Trainee</option>
                      <option value="Junior Developer">Junior Developer</option>
                      <option value="Clerk">Clerk</option>
                      <option value="Coordinator">Coordinator</option>
                      <option value="Executive Assistant">
                        Executive Assistant
                      </option>
                      <option value="Office Administrator">
                        Office Administrator
                      </option>
                      <option value="Data Entry Clerk">Data Entry Clerk</option>
                      <option value="Research Assistant">
                        Research Assistant
                      </option>
                      <option value="Customer Support Representative">
                        Customer Support Representative
                      </option>
                      <option value="Sales Assistant">Sales Assistant</option>

                      {/* Specialized Titles */}
                      <option value="Project Coordinator">
                        Project Coordinator
                      </option>
                      <option value="Project Director">Project Director</option>
                      <option value="Scrum Master">Scrum Master</option>
                      <option value="Program Manager">Program Manager</option>
                      <option value="Project Analyst">Project Analyst</option>

                      {/* Product Management */}
                      <option value="Product Owner">Product Owner</option>
                      <option value="Product Designer">Product Designer</option>
                      <option value="UX/UI Designer">UX/UI Designer</option>
                      <option value="Product Development Manager">
                        Product Development Manager
                      </option>

                      {/* Creative & Design */}
                      <option value="Graphic Designer">Graphic Designer</option>
                      <option value="Art Director">Art Director</option>
                      <option value="Visual Designer">Visual Designer</option>
                      <option value="Web Designer">Web Designer</option>
                      <option value="Multimedia Designer">
                        Multimedia Designer
                      </option>
                      <option value="Copywriter">Copywriter</option>
                      <option value="Content Creator">Content Creator</option>
                      <option value="Video Editor">Video Editor</option>

                      {/* R&D (Research & Development) */}
                      <option value="Research Scientist">
                        Research Scientist
                      </option>
                      <option value="R&D Manager">R&D Manager</option>
                      <option value="Product Development Engineer">
                        Product Development Engineer
                      </option>
                      <option value="Clinical Research Associate">
                        Clinical Research Associate
                      </option>
                      <option value="Lab Technician">Lab Technician</option>
                      <option value="Innovation Manager">
                        Innovation Manager
                      </option>

                      {/* Miscellaneous Titles */}
                      <option value="Office Manager">Office Manager</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Office Coordinator">
                        Office Coordinator
                      </option>

                      {/* Business Strategy & Consulting */}
                      <option value="Business Analyst">Business Analyst</option>
                      <option value="Management Consultant">
                        Management Consultant
                      </option>
                      <option value="Strategy Consultant">
                        Strategy Consultant
                      </option>
                      <option value="Business Development Executive">
                        Business Development Executive
                      </option>
                      <option value="Growth Manager">Growth Manager</option>

                      {/* Education and Training */}
                      <option value="Corporate Trainer">
                        Corporate Trainer
                      </option>
                      <option value="Learning & Development Specialist">
                        Learning & Development Specialist
                      </option>
                      <option value="Instructional Designer">
                        Instructional Designer
                      </option>
                      <option value="Training Manager">Training Manager</option>

                      {/* Other Titles Based on Industry */}
                      <option value="Hotel Manager">Hotel Manager</option>
                      <option value="Event Planner">Event Planner</option>
                      <option value="Concierge">Concierge</option>
                      <option value="Healthcare Administrator">
                        Healthcare Administrator
                      </option>
                      <option value="Medical Director">Medical Director</option>
                      <option value="Clinical Research Coordinator">
                        Clinical Research Coordinator
                      </option>
                      <option value="Nurse Manager">Nurse Manager</option>
                      <option value="Physician">Physician</option>
                      <option value="Surgeon">Surgeon</option>
                      <option value="Health & Safety Officer">
                        Health & Safety Officer
                      </option>
                      <option value="Retail Associate">Retail Associate</option>
                      <option value="Store Manager">Store Manager</option>

                      {/* Emerging Roles */}
                      <option value="Data Analyst">Data Analyst</option>
                      <option value="Blockchain Developer">
                        Blockchain Developer
                      </option>
                      <option value="AI/Machine Learning Engineer">
                        AI/Machine Learning Engineer
                      </option>
                      <option value="Sustainability Manager">
                        Sustainability Manager
                      </option>
                      <option value="Chief Diversity Officer (CDO)">
                        Chief Diversity Officer (CDO)
                      </option>
                    </select>
                  </div>

                  {/* Button to submit */}
                  <div className="pt-4 mt-6 flex justify-center gap-6">
                    {/* "Save and Add More" button is hidden when editing */}
                    {!contactToEdit && (
                      <button
                        type="button"
                        className="bg-buttoncolor flex justify-center items-center w-[180px] text-white px-4 py-3 rounded-2xl focus:outline-none text-[16px] hover:bg-blue-900 font-poppins"
                        onClick={handleSaveAndAddMore}
                      >
                        Save and Add More
                      </button>
                    )}
                    <button
                      type="button"
                      className="bg-buttoncolor flex justify-center items-center w-[140px] text-white px-4 py-3 rounded-2xl focus:outline-none text-[16px] hover:bg-blue-900 font-poppins"
                      onClick={handleSubmit}
                    >
                      {contactToEdit ? "Update" : "Submit"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showEmailList && (
        <EmailListModal emailList={emailList} onClose={handleCloseEmailList} />
      )}
    </div>
  );
};

export default Addmail;
