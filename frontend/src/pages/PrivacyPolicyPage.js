import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const PrivacyPolicyPage = ({ darkMode }) => {
  const [activeSection, setActiveSection] = useState('data-collection');
  const navigate = useNavigate();

  const sections = {
    'data-collection': {
      title: 'Data Collection',
      content: 'We collect information you provide directly, including name, email, and usage data through cookies.'
    },
    'data-use': {
      title: 'Data Usage',
      content: 'Your data helps personalize your experience and improve our services. We never sell your information.'
    },
    'cookies': {
      title: 'Cookies',
      content: 'We use cookies for authentication and analytics. You can manage them in your browser settings.'
    },
    'rights': {
      title: 'Your Rights',
      content: 'You may request access, correction, or deletion of your personal data by contacting us.'
    }
  };

  return (
    <div
      className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
        darkMode
          ? 'bg-gray-900 text-gray-100'
          : 'bg-gradient-to-br from-orange-50 to-pink-50'
      }`}
    >
      <div
        className={`max-w-4xl mx-auto rounded-xl shadow-md overflow-hidden relative ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
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
            Privacy Policy
          </h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Navigation */}
            <div className="md:w-1/4">
              <nav className="space-y-2 sticky top-8">
                {Object.keys(sections).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition ${
                      activeSection === key
                        ? `${
                            darkMode
                              ? 'bg-orange-700 text-orange-200'
                              : 'bg-orange-100 text-orange-700'
                          } font-medium`
                        : `${
                            darkMode
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`
                    }`}
                  >
                    {sections[key].title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="md:w-3/4">
              <div className={`prose prose-orange max-w-none`}>
                <h2
                  className={`text-2xl font-semibold ${
                    darkMode ? 'text-orange-400' : 'text-orange-600'
                  } mb-4`}
                >
                  {sections[activeSection].title}
                </h2>
                <p
                  className={`mb-6 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  {sections[activeSection].content}
                </p>

                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <h3
                    className={`font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    } mb-2`}
                  >
                    Effective Date: January 1, 2023
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className={`mt-8 border-t pt-6`}>
                  <h3
                    className={`font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-800'
                    } mb-2`}
                  >
                    Contact Us
                  </h3>
                  <p
                    className={`${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    For privacy concerns, email us at{' '}
                    <a
                      href="mailto:privacy@desi-etsy.com"
                      className={`${
                        darkMode
                          ? 'text-orange-400 hover:underline'
                          : 'text-orange-600 hover:underline'
                      }`}
                    >
                      privacy@desi-etsy.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/terms"
              className={`inline-flex items-center ${
                darkMode ? 'text-orange-400' : 'text-orange-600'
              } hover:underline`}
            >
              View our Terms and Conditions
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
  );
};
export default PrivacyPolicyPage;
