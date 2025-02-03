import React from "react";
import "./TermsOfService.css"; // Import the CSS file for custom styling

const TermsOfService = () => {
  return (
    <div className="terms-of-service">
      <img src="/terms_of_service.gif" alt="" srcset="" className="w-full h-auto object-cover mt-14 ml-6"/>
    <div className="terms-of-service-page mt-[5%] ml-[10%] font-poppins text-2xl">
      {/* <h1 className="font-bold text-center text-2xl">Terms of Service</h1> */}
      <p className="font-bold mt-5">
        Please read these Terms of Service carefully before using our services.
      </p>

      <section>
        <h2 className="font-bold mt-5">1. Acceptance of Terms</h2>
        <p>
          By accessing or using Deskassure, you agree to be bound by these Terms of Service. If you disagree with any part of these Terms, please do not use our services.
        </p>
      </section>

      <section>
        <h2 className="font-bold mt-5">2. Description of Service</h2>
        <p>
          Deskassure is an e-helpdesk platform that provides a range of services, including but not limited to:
        </p>
        <ul className="terms-list">
          <li>Ticket creation and management</li>
          <li>Knowledge base management</li>
          <li>Customer support</li>
          <li>IT asset management</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold mt-5">3. User Obligations</h2>
        <ul className="terms-list">
          <li><b>Account Information:</b> You agree to provide accurate and complete information during registration and to keep it updated.</li>
          <li><b>Password Security:</b> You are responsible for maintaining the confidentiality of your password and account information.</li>
          <li><b>Acceptable Use:</b> You agree not to use Deskassure for any illegal, harmful, or unauthorized purposes.</li>
          <li><b>Respect for Others:</b> You agree to use Deskassure in a respectful and appropriate manner, avoiding any abusive or offensive language.</li>
          <li><b>Intellectual Property:</b> You acknowledge that all intellectual property rights, including copyrights, trademarks, and patents, associated with Deskassure and its content belong to Deskassure or its licensors.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold mt-5">4. Service Fees</h2>
        <ul className="terms-list">
          <li><b>Fee Structure:</b> Deskassure may charge fees for certain services. The specific fee structure will be communicated to you separately.</li>
          <li><b>Payment:</b> You agree to pay all fees on time.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold mt-5">5. Termination</h2>
        <p>
          Deskassure reserves the right to terminate your access to the service, with or without notice, for any reason, including but not limited to:
        </p>
        <ul className="terms-list">
          <li>Violation of these Terms of Service</li>
          <li>Non-payment of fees</li>
          <li>Suspicious activity</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold mt-5">6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Deskassure shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the service.
        </p>
      </section>

      <section>
        <h2 className="font-bold mt-5">7. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Deskassure and its affiliates, officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, losses, costs, and expenses, including reasonable attorneys' fees, arising out of or in connection with your use of the service.
        </p>
      </section>

      <section>
        <h2 className="font-bold mt-5">8. Modifications to Terms of Service</h2>
        <p>
          Deskassure reserves the right to modify these Terms of Service at any time. Any changes will be effective immediately upon posting on our website.
        </p>
      </section>

      <section>
        <h2 className="font-bold mt-5">9. Governing Law</h2>
        <p>
          These Terms of Service shall be governed by and construed in accordance with the laws of [Jurisdiction].
        </p>
      </section>

      <section className="mb-48">
        <h2 className="font-bold mt-5 font-">10. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at <a href="mailto:care@deskassure.com" className="text-blue-500">care@deskassure.com</a> or +91 90948 94948.
        </p>
      </section>
    </div>
    </div>
  );
};

export default TermsOfService;
