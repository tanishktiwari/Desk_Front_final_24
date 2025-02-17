import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import axios from "axios";
import { Trash2, X } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip
);

const HomeAdmin = () => {
  const [showColorInfo, setShowColorInfo] = useState(false); // State for showing/hiding color info
  const [selectedImage, setSelectedImage] = useState(null); // For image preview
  const [imageUrl, setImageUrl] = useState([]); // For displaying the uploaded image
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImageToDelete, setSelectedImageToDelete] = useState(null);
  // State to hold the Monthly ETA value
  const [monthlyEta, setMonthlyEta] = useState(null);

  // State for ticket counts
  const [openTickets, setOpenTickets] = useState(0);
  const [closedTickets, setClosedTickets] = useState(0);

   // Fetch Monthly ETA on component mount
 useEffect(() => {
  const fetchAdminMonthlyETA = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-monthly-eta`
      );
      // Assuming the response contains totalDays which is the ETA value you want
      const eta = response.data.totalDays; // Accessing totalDays from the response
      setMonthlyEta(eta); // Update the state with the value of totalDays
      console.log("Admin Monthly ETA:", eta); // Logging the received ETA value (totalDays)
    } catch (error) {
      console.error("Error fetching Admin Monthly ETA:", error);
    }
  };

  fetchAdminMonthlyETA();
}, []);

 // Fetch ticket counts on component mount
  useEffect(() => {
    const fetchTicketCounts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tickets/count`
        );
        setOpenTickets(response.data.openTickets);  // Update open tickets count
        setClosedTickets(response.data.closedTickets);  // Update closed tickets count
      } catch (error) {
        console.error("Error fetching ticket counts:", error);
      }
    };

    fetchTicketCounts();
  }, []);

  // Fetch the latest uploaded image URL when the page loads
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/images`
        );
        setImages(response.data);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };
    fetchImages();
  }, []);
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // Set preview image
      uploadImage(file); // Start upload
    }
  };

  // Handle image upload
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Fetch updated images after upload
      const updatedImagesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/images`
      );
      setImages(updatedImagesResponse.data);
      setSelectedImage(null);
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

  const handleDeleteClick = () => {
    if (images.length > 0) {
      setSelectedImageToDelete(images[currentImageIndex]);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteImage = async () => {
    if (selectedImageToDelete) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/images/${
            selectedImageToDelete._id
          }`
        );

        // Remove the deleted image from the state
        const updatedImages = images.filter(
          (img) => img._id !== selectedImageToDelete._id
        );
        setImages(updatedImages);

        // Reset current index if needed
        if (currentImageIndex >= updatedImages.length) {
          setCurrentImageIndex(Math.max(0, updatedImages.length - 1));
        }

        // Close modal
        setShowDeleteModal(false);
        setSelectedImageToDelete(null);

        // Show success alert
        alert("Image deleted successfully!");
      } catch (error) {
        console.error("Error deleting image:", error);
        alert("Failed to delete image. Please try again.");
      }
    }
  };

  // Sample data for Bar Chart (Open vs Closed Tickets)
  const barChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Open Tickets",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: "rgba(90, 106, 207, 1)",
      },
      {
        label: "Closed Tickets",
        data: [7, 11, 5, 8, 3, 6],
        backgroundColor: "rgba(230, 232, 236, 1)",
      },
    ],
  };

  // Sample data for Pie Chart (Category Distribution)
  const pieChartData = {
    labels: ["CCTV", "Access Control", "Fire Alarm", "PA System", "Other"],
    datasets: [
      {
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
          "#f48b00", // Warm orange
          "#ff6f61", // Coral red
          "#ffcc00", // Bright yellow
          "#4caf50", // Fresh green
          "#2196f3", // Vibrant blue
        ],
      },
    ],
  };

  const pieChartOptions = {
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const label = pieChartData.labels[context.dataIndex];
            const value = context.raw;
            return `${label}: ${value}`;
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          family: "Poppins",
          size: 14,
        },
        bodyFont: {
          family: "Poppins",
          size: 13,
        },
      },
    },
  };

  // Toggle the display of the color information
  const toggleColorInfo = () => {
    setShowColorInfo(!showColorInfo);
  };

  // Sample data for Metrics Cards
  const metricsData = [
    {
      title: "Monthly ETA",
       value: monthlyEta ? `${monthlyEta} days` : "0 days",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: " Currently Open Tickets",
      value: openTickets,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      title: "Total Tickets Raised (Monthly)",
      value: closedTickets,  // Total tickets = Open + Closed
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
  ];

  // Sample data for Miscellaneous Cards
  const miscellaneousCards = [
    {
      title: "Support Inventory",
      status: "Maintained",
      icon: "/ppm_2.png",
      bgColor: "bg-[#f6e69b]",
    },
    {
      title: "Healthcheck",
      status: "Ontime",
      icon: "/ppm_3.png",
      bgColor: "bg-[#c3a3cc]",
    },
    {
      title: "Preventive Maintenance",
      status: "Ontime",
      icon: "/ppm_4.png",
      bgColor: "bg-[#e49dbd]",
    },
    {
      title: "CSAT Survey",
      status: "3.5/5",
      icon: "/ppm_5.png",
      bgColor: "bg-[#6dcbef]",
    },
  ];

  return (
    <div className="min-h-screen bg-white lg:ml-64">
      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-10 py-8 sm:py-16 lg:py-24 xs:pt-20">
        {/* Welcome Message */}
        <div className="mb-4 sm:mb-6 text-center lg:text-left lg:pl-8 mt-2 sm:mt-4 lg:mt-10">
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-poppins">
            Hello Admin 👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm lg:text-lg font-poppins max-w-3xl">
            Generate Service Tickets, periodic Auditable Performance Reports and
            get instant updates on your opened tickets with Deskassure by
            Foxnet.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          {metricsData.map((metric, index) => (
            <div
              key={index}
              className={`${metric.bgColor} rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm transition-transform hover:scale-105`}
            >
              <div className="flex flex-col items-center justify-center">
                <h3
                  className={`font-poppins text-base sm:text-lg  mb-1 sm:mb-2`}
                >
                  {metric.title}
                </h3>
                <p className={`font-poppins text-xl sm:text-4xl `}>
                  {metric.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content - Upper Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Image Section */}
          <div className="relative flex-1 w-full xs:h-[250px] md:h-[550px]">
            {/* Upload Icon */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-0 z-10">
              {/* Upload Button */}
              <div className="text-gray-600 cursor-pointer  p-2 rounded-lg justify-center bg-black">
                <label htmlFor="image-upload">
                  <img src="/edit.png" alt="" srcset="" className="w-5" />
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>

              {/* Delete Button */}
              <button
                onClick={handleDeleteClick}
                className="text-white  p-2 rounded-lg hover:bg-red-100"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex].url}
                  alt={`Slide ${currentImageIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-500 lg:object-fill"
                />
                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-white w-4"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No images uploaded
              </div>
            )}
            {/* Delete Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Delete Image</h3>
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {selectedImageToDelete && (
                    <div className="space-y-4">
                      <img
                        src={selectedImageToDelete.url}
                        alt="To be deleted"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <p className="text-center text-gray-600">
                        Are you sure you want to delete this image?
                      </p>
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => setShowDeleteModal(false)}
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteImage}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-2 sm:p-4 rounded-lg border-2 border-gray-200">
            <div className="flex justify-center mb-2 sm:mb-4 mt-7 lg:ml-6 ">
              <button className="w-full sm:w-40 lg:w-40 bg-custom-gradient text-white font-poppins font-light py-2 lg:py-3 rounded-xl shadow-md text-xs sm:text-sm">
                Category Distribution
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mt-2 sm:mt-4">
              {/* Chart with equal spacing */}
              <div className="flex justify-center items-center w-full sm:w-2/3 h-[300px] sm:h-[400px] p-4">
                <div className="w-full max-w-xs">
                  <Pie
                    data={pieChartData}
                    options={{
                      ...pieChartOptions,
                      layout: {
                        padding: {
                          top: 20,
                          bottom: 20,
                          left: 20,
                          right: 20,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="w-full sm:w-1/3 pl-0 sm:pl-4 pt-4 sm:pt-28">
                <div className="space-y-2 sm:space-y-4 text-left font-poppins">
                  {pieChartData.labels.map((label, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 sm:w-4 h-3 sm:h-4 rounded-full"
                        style={{
                          backgroundColor:
                            pieChartData.datasets[0].backgroundColor[index],
                        }}
                      ></div>
                      <span className="text-xs sm:text-sm">
                        {label}: {pieChartData.datasets[0].data[index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Lower Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Miscellaneous Cards */}
          <div className="bg-white p-2 sm:p-4 shadow-sm rounded-lg border-2 border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-4 font-poppins">
              <strong>Miscellaneous</strong>
            </h3>
            <div className="space-y-2 sm:space-y-4">
              {miscellaneousCards.map((card, index) => (
                <div
                  key={index}
                  className={`flex items-center p-2 sm:p-3 ${card.bgColor} rounded-lg`}
                >
                  <div className="bg-white w-10 sm:w-12 lg:w-16 h-10 sm:h-12 rounded-xl flex items-center justify-center">
                    <img
                      src={card.icon}
                      alt=""
                      className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10"
                    />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <span className="font-poppins text-xs sm:text-sm">
                      <b>{card.title}</b>
                    </span>
                    <br />
                    <span className="text-sm sm:text-base lg:text-lg font-poppins">
                      {card.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open vs Close Ticket Chart */}
          <div className="bg-white p-2 sm:p-4 rounded-lg border-2 border-gray-200 font-poppins">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-700 font-poppins mb-2 sm:mb-0">
                <strong>Open vs Close Ticket</strong>
              </h3>
              <button className="w-full sm:w-28 lg:w-36 bg-custom-gradient text-white font-poppins font-light py-2 lg:py-3 rounded-xl shadow-md text-xs sm:text-sm">
                View Report
              </button>
            </div>
            <div className="h-[250px] sm:h-[300px]">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: {
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12,
                        },
                      },
                    },
                    y: {
                      ticks: {
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;
