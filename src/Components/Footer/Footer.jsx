import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const [hovered, setHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedState = localStorage.getItem("isSidebarCollapsed");
    if (storedState) {
      setIsCollapsed(JSON.parse(storedState));
    }
  }, []);

  return (
    <footer
      className={`bg-gray-900 text-gray-400 p-4 font-poppins w-full min-h-[300px] ${
        isCollapsed ? "pl-0" : "lg:pl-60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:justify-center gap-8">
          {/* Left Section - Significantly increased left padding */}
          <div className="flex flex-col items-center lg:items-start space-y-6 lg:w-1/2 lg:pl-[25%] 2xl:pl-[17%] xl:pl-0">
            {/* Logo */}
            <div
              className="relative w-[200px] h-[120px]"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <img
                src={hovered ? "/4.png" : "/3.png"}
                alt="DeskAssure Logo"
                className="w-full h-full object-contain transition-all duration-300"
              />
            </div>

            {/* Description - Added larger max-width */}
            <p className="text-center lg:text-left lg:max-w-3xl">
              The end-to-end analytics service for the site, designed
              to work with enterprises of various levels and business segments.
            </p>

            {/* Social Media Icons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              {[
                { src: "/linkedin.png", alt: "LinkedIn" },
                { src: "/instagram.png", alt: "Instagram" },
                { src: "/facebook-logo.png", alt: "Facebook" },
                { src: "/youtube.png", alt: "YouTube" },
                { src: "/telegram.png", alt: "Telegram" },
              ].map((social) => (
                <a
                  key={social.alt}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                >
                  <img
                    src={social.src}
                    alt={social.alt}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-center lg:items-end space-y-8 lg:w-1/2 pt-10 ">
            {/* Navigation Links */}
            <nav className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              {[
                { text: "Privacy Policy", route: "/dashboard/PrivacyPolicyPage" },
                { text: "Terms of Service", route: "/dashboard/TermsOfService" },
                { text: "Security Policy", route: "/dashboard/security-policy" },
              ].map((link) => (
                <button
                  key={link.text}
                  onClick={() => navigate(link.route)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link.text}
                </button>
              ))}
            </nav>

            {/* Contact Information */}
            <div className="flex flex-col items-center lg:items-end space-y-6">
              <div className="text-center lg:text-right">
                <h4 className="text-white font-bold mb-2">Contact Us</h4>
                <p>+91 90948 94948</p>
                <p>care@deskassure.com</p>
              </div>

              <div className="text-center lg:text-right">
                <h4 className="text-white font-bold mb-2">Location</h4>
                <div className="flex flex-wrap justify-center lg:justify-end gap-4">
                  <p>New Delhi</p>
                  <p>Bangalore</p>
                  <p>Pune</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
