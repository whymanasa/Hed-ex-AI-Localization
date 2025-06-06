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
  { code: "km", name: "Khmer" },
  { code: "my", name: "Burmese" }
  // Add more SEA languages here
];

const LanguageSelectorLanding = ({ onLanguageSelect }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return sessionStorage.getItem("preferredLanguage") || "en";
  });

  useEffect(() => {
    // Set English as default on initial load if no language is stored
    if (!sessionStorage.getItem("preferredLanguage")) {
      sessionStorage.setItem("preferredLanguage", "en");
      i18n.changeLanguage("en");
      onLanguageSelect("en");
    }
  }, []);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    sessionStorage.setItem("preferredLanguage", newLanguage);
    setSelectedLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    onLanguageSelect(newLanguage);
  };

  const handleSubmit = () => {
    navigate("/profile");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-200">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        🌏 {t("choose_language")}
      </h1>
      <div className="flex flex-col items-center gap-4">
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
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
          {t("submit")}
        </button>
      </div>
    </div>
  );
};

export default LanguageSelectorLanding;
