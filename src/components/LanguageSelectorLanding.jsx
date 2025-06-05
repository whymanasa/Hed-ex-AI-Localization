import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const languages = [
  { code: "en", name: "English" },
  { code: "fil", name: "Filipino" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  // Add more SEA languages here
];

const LanguageSelectorLanding = ({ onLanguageSelect }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "en";
  });
  const [tempLanguage, setTempLanguage] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "en";
  });

  useEffect(() => {
    // Set English as default on initial load if no language is stored
    if (!localStorage.getItem("preferredLanguage")) {
      localStorage.setItem("preferredLanguage", "en");
      i18n.changeLanguage("en");
      onLanguageSelect("en");
    }
  }, []);

  const handleSubmit = () => {
    // Store the selected language in localStorage
    localStorage.setItem("preferredLanguage", tempLanguage);
    setSelectedLanguage(tempLanguage);
    // Navigate to profile page
    navigate("/profile");
  };

  useEffect(() => {
    if (selectedLanguage) {
      i18n.changeLanguage(selectedLanguage);
      onLanguageSelect(selectedLanguage);
    }
  }, [selectedLanguage]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-200">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        🌏 {t("choose_language")}
      </h1>
      <div className="flex flex-col items-center gap-4">
        <select
          value={tempLanguage}
          onChange={(e) => setTempLanguage(e.target.value)}
          className="py-2 px-6 rounded-xl text-gray-800 font-semibold shadow-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleSubmit}
          className="py-2 px-6 rounded-xl text-white font-semibold shadow-md bg-indigo-600 hover:bg-indigo-700 transition duration-200"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default LanguageSelectorLanding;
