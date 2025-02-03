import React from "react";
import "./PrivacyPolicyPage.css"; // You can add a CSS file for styling (optional)

const PrivacyPolicyPage = () => {
  return (
    <div className="">
      <img 
        src="/Privacy_Policy.gif" 
        alt="Privacy Policy" 
        className="w-full h-auto object-cover mt-12 ml-6"
      />
      <div className="privacy-policy-page mt-[5%] ml-[10%] text-2xl">
      {/* <h1 className="font-bold text-center text-2xl  font-poppins">Privacy Policy</h1> */}
      <p className="font-bold mt-5">Effective Date: 1st September 2023</p>

      <p className="mt-5">
        At Deskassure, we are committed to protecting your privacy and the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and protect your data when you interact with our website or use our services, which include the sale and rental of security systems. By accessing or using our website or services, you consent to the practices described in this Privacy Policy.
      </p>

      <section>
        <h2 className="font-bold mt-5">1. Information We Collect</h2>
        <p className="mt-5"><b>We may collect the following types of information:</b></p>

        <h3 className="font-bold mt-5">1.1 Personal Information</h3>
        <ul className="privacy-list">
          <li>Name, address, email, and phone number when you make a purchase or request services.</li>
          <li>Billing information, including credit card details, for payment processing.</li>
          <li>Identification information as required for security system services, such as access codes and device-specific details.</li>
        </ul>

        <h3 className="font-bold mt-5">1.2 Usage Information</h3>
        <ul className="privacy-list">
          <li>Information about your interactions with our website, including your IP address, browser type, and pages visited.</li>
          <li>Information about how you use our security systems and services, such as device status and activity logs.</li>
        </ul>

        <h3 className="font-bold mt-5">1.3 Cookies and Similar Technologies</h3>
        <p className="mt-5">
          We use cookies and similar technologies to collect data about your browsing and usage patterns. You can manage your cookie preferences through your browser settings.
        </p>
      </section>

      <section>
        <h2 className="font-bold mt-5">2. How We Use Your Information</h2>
        <p className="mt-5"><b>We may use your information for the following purposes:</b></p>

        <h3 className="font-bold mt-5">2.1 Providing Services</h3>
        <ul className="privacy-list">
          <li>To fulfill your orders for security systems and services.</li>
          <li>To set up and maintain your security systems.</li>
          <li>To provide customer support and respond to your inquiries.</li>
        </ul>

        <h3 className="font-bold mt-5">2.2 Improving Services</h3>
        <ul className="privacy-list">
          <li>To enhance and personalize your experience with our website and services.</li>
          <li>To analyze usage data to improve our products and services.</li>
        </ul>

        <h3 className="font-bold mt-5">2.3 Marketing and Communications</h3>
        <ul className="privacy-list">
          <li>To send you promotional materials and updates about our products and services.</li>
          <li>To send you service-related notifications.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold mt-5">3. Disclosure of Your Information</h2>
        <p className="mt-5"><b>We may share your information with the following parties:</b></p>

        <h3 className="font-bold mt-5">3.1 Service Providers</h3>
        <ul className="privacy-list">
          <li>We may disclose your information to third-party service providers who assist us in delivering our services and products.</li>
        </ul>

        <h3 className="font-bold mt-5">3.2 Legal Compliance</h3>
        <ul className="privacy-list">
          <li>We may share your information as required by law or to protect our legal rights, privacy, safety, or property.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold mt-5">4. Data Security</h2>
        <p className="mt-5">
          We take measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of data transmission or storage is 100% secure. We cannot guarantee the security of your data.
        </p>
      </section>

      <section>
        <h2 className="font-bold mt-5">5. Your Choices</h2>
        <p className="mt-5"><b>You can:</b></p>

        <h3 className="font-bold mt-5">5.1 Access and Update Your Information</h3>
        <ul className="privacy-list">
          <li>You can access and update your personal information by logging into your account on our website.</li>
        </ul>

        <h3 className="font-bold mt-5">5.2 Marketing Preferences</h3>
        <ul className="privacy-list">
          <li>You can manage your marketing preferences by following the instructions in the promotional emails we send.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold mt-5">6. Children's Privacy</h2>
        <p className="mt-5">
          Our website and services are not directed at children under the age of 13. We do not knowingly collect information from children.
        </p>
      </section>

      <section>
        <h2 className="font-bold mt-5">7. Changes to this Privacy Policy</h2>
        <p className="mt-5">
          Deskassure may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.
        </p>
      </section>

      <section>
        <h2 className="font-bold mt-5">8. Contact Us</h2>
        <p className="mt-5">
          If you have any questions or concerns about this Privacy Policy, please contact us at:
        </p>
        <p className="mt-5">
          Phone: 011- 79632071<br />
          Email: <a href="mailto:care@deskassure.com" className="text-blue-500">care@deskassure.com</a>
        </p>
      </section>

      <footer className="mt-5 mb-48">
        <p>Thank you for entrusting Deskassure with your security needs. Your privacy is important to us, and we are dedicated to safeguarding your personal information.</p>
      </footer>
    </div>
    </div>

  );
};

export default PrivacyPolicyPage;
