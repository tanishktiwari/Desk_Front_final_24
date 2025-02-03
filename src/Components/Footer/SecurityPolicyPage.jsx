import React from "react";
import "./SecurityPolicyPage.css"; // You can add a CSS file for styling (optional)

const SecurityPolicyPage = () => {
  return (
      <div>
    <img src="/security_policy.gif" alt="" srcset="" className="w-full h-auto object-cover mt-14 ml-6"/>
    <div className="security-policy-page mt-[5%] ml-[10%] font-poppins text-2xl">
      {/* <h1 className="font-bold text-center text-2xl">Security Policy</h1> */}
      <p className="font-bold mt-5">Your Data, Our Priority</p>
      <p className="mt-5">
        At Deskassure, we are committed to protecting the security and privacy
        of your data. We understand that trust is the foundation of any strong
        relationship, and we strive to maintain the highest standards of security
        to safeguard your information.
      </p>

      <section>
        <h2 className="font-bold mt-5">Our Security Measures</h2>
        <ul className="security-list">
          <li className="mt-5">
            <b>Robust Encryption:</b> We use industry-standard encryption
            techniques to safeguard your sensitive information, both in transit
            and at rest.
          </li>
          <li className="mt-5">
            <b>Secure Data Centers:</b> Our data is stored in highly secure AWS
            Data Centers with advanced physical and digital security measures.
          </li>
          <li className="mt-5">
            <b>Regular Security Audits:</b> We conduct regular security audits
            and vulnerability assessments to identify and address potential
            security risks.
          </li>
          <li className="mt-5">
            <b>Firewall Protection:</b> Our systems are protected by robust
            firewalls to prevent unauthorized access.
          </li>
          <li className="mt-5">
            <b>Intrusion Detection Systems:</b> We have implemented advanced
            intrusion detection systems to monitor network traffic and detect
            any suspicious activity.
          </li>
          <li className="mt-5">
            <b>Regular Security Training:</b> Our team undergoes regular
            security training to stay updated on the latest threats and best
            practices.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold mt-5">Data Privacy and Compliance</h2>
        <p className="mt-5">
          We adhere to strict data privacy regulations, including <b>HIPAA.</b>
        </p>
        <p className="mt-5">
          We are committed to processing your data lawfully, fairly, and
          transparently.
        </p>
      </section>

      <section>
        <h2 className="font-bold mt-5">How We Protect Your Data</h2>
        <ul className="security-list">
          <li className="mt-5">
            <b>Access Controls:</b> We limit access to your data to authorized
            personnel on a need-to-know basis.
          </li>
          <li className="mt-5">
            <b>Data Minimization:</b> We only collect and process the minimum amount of
            personal data necessary to provide our services.
          </li>
          <li className="mt-5">
            <b>Data Retention:</b> We retain your data for as long as necessary to
            fulfill the purposes for which it was collected.
          </li>
          <li className="mt-5">
            <b>Data Breach Response Plan:</b> We have a comprehensive data breach
            response plan in place to mitigate the impact of any potential
            security incidents.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mt-5 font-bold">Your Role in Security</h2>
        <p className="mt-5">
          While we take every precaution to protect your data, your cooperation
          is essential. Please follow these security best practices:
        </p>
        <ul className="security-list">
          <li className="mt-5">
            <b>Strong Passwords:</b> Create strong, unique passwords for your
            Deskassure account.
          </li>
          <li className="mt-5">
            <b>Beware of Phishing Attacks:</b> Be cautious of suspicious emails
            and links.
          </li>
          <li className="mt-5">
            <b>Report Security Issues:</b> If you suspect any security issues,
            please report them to our support team immediately.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold mt-5">Stay Informed</h2>
        <p className="mt-5">
          We will keep you informed of any significant changes to our security
          practices. Please review our Privacy Policy for more details on how we
          collect, use, and protect your personal information.
        </p>

        <p className="mt-5">
          By using Deskassure, you trust us with your valuable data. We are
          committed to upholding that trust and ensuring the security of your
          information.
        </p>
      </section>

      <footer className="mt-5 mb-48">
        <p>
          Deskassure India |{" "}
          <a href="mailto:care@deskassure.com" className="text-blue-500">
            care@deskassure.com
          </a>
        </p>
      </footer>
    </div>
    </div>
  );
};

export default SecurityPolicyPage;
