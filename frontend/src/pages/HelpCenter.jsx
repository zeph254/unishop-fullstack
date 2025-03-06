import React from "react";
import { Link } from "react-router-dom";

function HelpCenter() {
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold">Help Center</h1>
        <p className="mt-2 text-lg">Find answers to your questions and get the support you need.</p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { question: "How do I reset my password?", answer: "You can reset your password via email or SMS by visiting the Reset Password page.", link: "/reset-password" },
            { question: "How can I track my order?", answer: "Visit your Order History to view tracking details.", link: "/orders" },
            { question: "What payment methods are available?", answer: "We currently accept credit/debit cards, mobile payments, and simulated payments for testing purposes." }
          ].map((faq, index) => (
            <details key={index} className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              <summary className="font-semibold text-lg text-blue-600">{faq.question}</summary>
              <p className="text-gray-600 mt-2">
                {faq.answer} {faq.link && (<Link to={faq.link} className="text-blue-500 underline">Learn more</Link>)}
              </p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Need More Help?</h2>
        <p className="text-gray-700">If you need further assistance, feel free to contact our support team.</p>
        <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
          <li>Email: <a href="mailto:support@unishop.com" className="text-blue-500 underline">support@unishop.com</a></li>
          <li>Phone: +254 700 123 456</li>
          <li>Live Chat: Available during business hours</li>
        </ul>
      </div>

      <div className="text-center mt-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800 text-lg font-semibold">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default HelpCenter;
