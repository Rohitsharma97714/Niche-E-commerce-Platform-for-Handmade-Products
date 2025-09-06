import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const TermsConditionsPage = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('terms');
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const content = {
    terms: {
      title: 'Terms of Service',
      sections: [
        {
          title: 'Account Responsibility',
          content: 'You are responsible for maintaining the confidentiality of your account credentials.'
        },
        {
          title: 'User Conduct',
          content: 'You agree not to engage in unlawful activities or violate intellectual property rights.'
        },
        {
          title: 'Termination',
          content: 'We reserve the right to terminate accounts violating these terms.'
        }
      ]
    },
    conditions: {
      title: 'Conditions of Use',
      sections: [
        {
          title: 'Eligibility',
          content: 'You must be at least 18 years old to use our services.'
        },
        {
          title: 'Payments',
          content: 'All sales are final. Refunds are processed according to our refund policy.'
        },
        {
          title: 'Disputes',
          content: 'Any disputes will be resolved through arbitration in our jurisdiction.'
        }
      ]
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-4xl mx-auto rounded-xl shadow-md overflow-hidden relative ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {/* Back Button */} 
        <button
          onClick={() => navigate('/')}
          className={`absolute top-4 left-4 flex items-center ${
            darkMode ? 'text-orange-400' : 'text-orange-600'
          } hover:underline focus:outline-none`}
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="p-8">
          <h1
            className={`text-3xl font-bold text-center ${
              darkMode ? 'text-orange-400' : 'text-orange-600'
            } mb-8`}
          >
            Terms and Conditions
          </h1>

          {/* Tab Navigation */}
          <div className="flex border-b mb-6">
            {Object.keys(content).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab
                    ? `border-b-2 ${
                        darkMode ? 'border-orange-400' : 'border-orange-500'
                      } ${
                        darkMode ? 'text-orange-400' : 'text-orange-600'
                      }`
                    : `${
                        darkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-500 hover:text-gray-700'
                      }`
                }`}
              >
                {content[tab].title}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={`prose prose-orange max-w-none`}>
            <h2
              className={`text-2xl font-semibold ${
                darkMode ? 'text-orange-400' : 'text-orange-600'
              } mb-4`}
            >
              {content[activeTab].title}
            </h2>

            {content[activeTab].sections.map((section, index) => (
              <div key={index} className="mb-6">
                <h3
                  className={`text-lg font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-2`}
                >
                  {section.title}
                </h3>
                <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {section.content}
                </p>
              </div>
            ))}

            {/* Interactive Acceptance (for registration flows) */}
            <div
              className={`mt-8 p-4 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="accept-terms"
                    name="accept-terms"
                    type="checkbox"
                    checked={accepted}
                    onChange={() => setAccepted(!accepted)}
                    className={`focus:ring-orange-500 h-4 w-4 rounded border-gray-300 ${
                      darkMode
                        ? 'dark:focus:ring-orange-400 dark:text-orange-400 dark:border-gray-600'
                        : 'text-orange-600'
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="accept-terms"
                    className={`font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    I agree to these Terms and Conditions
                  </label>
                  <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    You must accept to continue using our services
                  </p>
                </div>
              </div>
            </div>

            <div className={`mt-8 border-t pt-6`}>
              <h3
                className={`font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-800'
                } mb-2`}
              >
                Contact Us
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                For questions about these terms, email{' '}
                <a
                  href="mailto:legal@desi-etsy.com"
                  className={`${
                    darkMode
                      ? 'text-orange-400 hover:underline'
                      : 'text-orange-600 hover:underline'
                  }`}
                >
                  legal@desi-etsy.com
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/privacy"
              className={`inline-flex items-center ${
                darkMode ? 'text-orange-400' : 'text-orange-600'
              } hover:underline`}
            >
              View our Privacy Policy
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;
