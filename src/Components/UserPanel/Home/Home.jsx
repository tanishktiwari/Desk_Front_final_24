import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip
);

const Home = () => {
  const [operatorName, setOperatorName] = useState("");
  const [categoryCounts, setCategoryCounts] = useState([
    { category: "CCTV", count: 0 },
    { category: "Access Control", count: 0 },
    { category: "Fire Alarm System", count: 0 },
    { category: "PA System", count: 0 },
    { category: "Other", count: 0 },
  ]);
  const [chartData, setChartData] = useState({ open: [], closed: [] });
  const [chartLabels, setChartLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const fetchChartData = async (mobileNumber) => {
    try {
      const categoryCountResponse = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/tickets/mobile/${mobileNumber}/category-count`
      );
      const fetchedCategoryCounts = categoryCountResponse.data.categoryCount;
      const categoryMap = fetchedCategoryCounts.reduce((acc, item) => {
        acc[item.category] = item.count;
        return acc;
      }, {});
      const updatedCategories = categoryCounts.map((category) => ({
        ...category,
        count: categoryMap[category.category] || category.count,
      }));
      setCategoryCounts(updatedCategories);

      const chartCountResponse = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/tickets/mobile/${mobileNumber}/chart-count`
      );
      const chartCounts = chartCountResponse.data.chartCount;
      const openCounts = [];
      const closedCounts = [];
      const monthLabels = [];

      chartCounts.forEach((count) => {
        openCounts.push(count.openCount);
        closedCounts.push(count.closedCount);
        monthLabels.push(count.month);
      });

      setChartData({ open: openCounts, closed: closedCounts });
      setChartLabels(monthLabels);
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    }
  };

  const pieChartData = {
    labels: categoryCounts.map((category) => category.category),
    datasets: [
      {
        data: categoryCounts.map((category) => category.count),
        backgroundColor: [
          "#f48b00",
          "#ff6f61",
          "#ffcc00",
          "#4caf50",
          "#2196f3",
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
      },
    },
  };

  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Open Tickets",
        data: chartData.open,
        backgroundColor: "rgba(90, 106, 207, 1)",
      },
      {
        label: "Closed Tickets",
        data: chartData.closed,
        backgroundColor: "rgba(230, 232, 236, 1)",
      },
    ],
  };

  useEffect(() => {
    const mobileNumber = localStorage.getItem("loggedInUserMobileNumber");
    if (mobileNumber) {
      const fetchData = async () => {
        try {
          const operatorResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/operators/name/${mobileNumber}`
          );
          setOperatorName(operatorResponse.data.operatorName || "User");

          fetchChartData(mobileNumber);

          const imagesResponse = await axios.get(
             `${import.meta.env.VITE_API_URL}/api/images`
          );
          setImages(imagesResponse.data);

          setLoading(false);
        } catch (error) {
          setError("Failed to fetch data.");
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setLoading(false);
    }
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
  // Sample data for Metrics Cards
  // Update the metricsData to dynamically calculate total open and closed tickets
const metricsData = [
  {
    title: "Monthly ETA",
    value: "24hrs",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    title: "Open Tickets",
    value: chartData.open.reduce((a, b) => a + b, 0).toString(),
    bgColor: "bg-green-100",
    textColor: "text-green-600",
  },
  {
    title: "Closed Tickets",
    value: chartData.closed.reduce((a, b) => a + b, 0).toString(),
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
];
  return (
    <div className="min-h-screen bg-white lg:ml-64">
      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-10 py-8 sm:py-16 lg:py-24 xs:pt-20">
        {/* Welcome Message */}
        <div className="mb-4 sm:mb-6 text-center lg:text-left lg:pl-8 mt-2 sm:mt-4 lg:mt-10">
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-poppins">
            Hello {operatorName} 👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm lg:text-lg font-poppins max-w-3xl">
            Generate Service Tickets, periodic Auditable Performance Reports and
            get instant updates on your opened tickets with Deskassure by
            Foxnet.
          </p>
        </div>
          {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 px-2 sm:px-4 lg:px-8 lg:pl-0">
          {metricsData.map((metric, index) => (
            <div
              key={index}
              className={`${metric.bgColor} rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm transition-transform hover:scale-105`}
            >
              <div className="flex flex-col items-center justify-center">
                <h3
                  className={`${metric.textColor} font-poppins text-base sm:text-lg font-semibold mb-1 sm:mb-2`}
                >
                  {metric.title}
                </h3>
                <p
                  className={`${metric.textColor} font-poppins text-xl sm:text-2xl font-bold`}
                >
                  {metric.value}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Main Content - Upper Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Image Section */}
          <div className="relative flex-1 w-full xs:h-[250px] md:h-[550px] ">
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
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-2 sm:p-4 rounded-lg border-2 border-gray-200">
            <div className="flex justify-end mb-2 sm:mb-4 ">
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
              <div className="w-full sm:w-1/3 pl-0 sm:pl-4 pt-4 sm:pt-14">
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

export default Home;
