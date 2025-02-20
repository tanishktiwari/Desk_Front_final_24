// components/layout/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <footer className="bg-gray-900 text-gray-400 p-4 font-poppins w-full min-h-[300px]">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Left Section */}
          <div className="flex flex-col items-center md:items-start space-y-6">
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

            {/* Description */}
            <p className="text-center md:text-left max-w-md !mt-0">
              The end-to-end analytics service for the site, designed
              to work with enterprises of various levels and business segments.
            </p>

            {/* Social Media Icons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
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
          <div className="flex flex-col items-center md:items-end space-y-8 pt-10 md:pt-10">
            {/* Navigation Links */}
            <nav className="flex flex-col sm:flex-row items-center md:items-end gap-4 sm:gap-8">
              {[
                { text: "Privacy Policy", route: "/dashboard/privacy-policy" },
                { text: "Terms of Service", route: "/dashboard/terms-of-service" },
                { text: "Security Policy", route: "/dashboard/security-policy" },
              ].map((link) => (
                <Link
                  key={link.text}
                  to={link.route}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link.text}
                </Link>
              ))}
            </nav>

            {/* Contact Information */}
            <div className="flex flex-col items-center md:items-end space-y-6">
              <div className="text-center md:text-right">
                <h4 className="text-white font-bold mb-2">Contact Us</h4>
                <p>+91 90948 94948</p>
                <p>care@deskassure.com</p>
              </div>

              <div className="text-center md:text-right">
                <h4 className="text-white font-bold mb-2">Location</h4>
                <div className="flex flex-wrap justify-center md:justify-end gap-4">
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
