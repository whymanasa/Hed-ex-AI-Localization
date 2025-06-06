import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';
import UserProfileForm from './components/UserProfileForm';
import LanguageSelectorLanding from './components/LanguageSelectorLanding';
import Navbar from './components/Navbar';

function Home({ localizedContent, setLocalizedContent, userProfile, preferredLanguage }) {
  if (!preferredLanguage) {
    return <Navigate to="/language" replace />;
  }

  return (
    <div className="flex p-6 gap-6 h-[calc(100vh-80px)]">
      <InputForm 
        setLocalizedContent={setLocalizedContent} 
        userProfile={userProfile}
        preferredLanguage={preferredLanguage}
      />
      <OutputDisplay 
        localizedContent={localizedContent} 
        language={preferredLanguage}
      />
    </div>
  );
}

function App() {
  const [localizedContent, setLocalizedContent] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  
  const [preferredLanguage, setPreferredLanguage] = useState(() => {
    return sessionStorage.getItem('preferredLanguage') || '';
  });

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
  }, []);

  const handleLanguageSelect = (langCode) => {
    setPreferredLanguage(langCode);
    sessionStorage.setItem('preferredLanguage', langCode);
  };

  const handleProfileSubmit = (profileData) => {
    setUserProfile(profileData);
    setPreferredLanguage(profileData.preferredLanguage);
  };

  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={
          <Navigate to="/language" replace />
        } />
        <Route path="/language" element={
          <LanguageSelectorLanding onLanguageSelect={handleLanguageSelect} />
        } />
        <Route path="/profile" element={
          preferredLanguage ? (
            <UserProfileForm onProfileSubmit={handleProfileSubmit} />
          ) : (
            <Navigate to="/language" replace />
          )
        } />
        <Route path="/home" element={
          <Home
            localizedContent={localizedContent}
            setLocalizedContent={setLocalizedContent}
            userProfile={userProfile}
            preferredLanguage={preferredLanguage}
          />
        } />
      </Routes>
    </Router>
  );
}

export default App;












