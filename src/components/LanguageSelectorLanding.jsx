import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

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
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "en";
  });

  useEffect(() => {
    if (selectedLanguage) {
      localStorage.setItem("preferredLanguage", selectedLanguage);
      i18n.changeLanguage(selectedLanguage);
      onLanguageSelect(selectedLanguage);
    }
  }, [selectedLanguage]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-200">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        🌏 {t("choose_language")}
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelectedLanguage(lang.code)}
            className={`py-2 px-6 rounded-xl text-white font-semibold shadow-md transition duration-200 ${
              selectedLanguage === lang.code
                ? "bg-indigo-600"
                : "bg-indigo-400 hover:bg-indigo-500"
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelectorLanding;
