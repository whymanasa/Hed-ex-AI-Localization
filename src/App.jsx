import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';
import UserProfileForm from './components/UserProfileForm';
import LanguageSelectorLanding from './components/LanguageSelectorLanding';

function Home({ localizedContent, setLocalizedContent, recommendations, setRecommendations, userProfile, preferredLanguage }) {
  if (!preferredLanguage) {
    return <Navigate to="/language" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Hex Ed: SEA Course Localizer</h1>
      <InputForm 
        setLocalizedContent={setLocalizedContent} 
        setRecommendations={setRecommendations}
        userProfile={userProfile}
        preferredLanguage={preferredLanguage}
      />
      <OutputDisplay 
        localizedContent={localizedContent} 
        recommendations={recommendations}
        preferredLanguage={preferredLanguage}
      />
    </div>
  );
}

function App() {
  const [localizedContent, setLocalizedContent] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [userProfile, setUserProfile] = useState(() => {
    const saved = sessionStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [preferredLanguage, setPreferredLanguage] = useState(() => {
    return sessionStorage.getItem('preferredLanguage') || '';
  });

  const handleLanguageSelect = (langCode) => {
    setPreferredLanguage(langCode);
    sessionStorage.setItem('preferredLanguage', langCode);
  };

  const handleProfileSubmit = (profileData) => {
    setUserProfile(profileData);
  };

  return (
    <Router>
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between">
        <span className="font-bold text-xl">Hex Ed</span>
        <div className="space-x-4">
          {preferredLanguage && <Link to="/home" className="hover:text-blue-200">Home</Link>}
          <Link to="/language" className="hover:text-blue-200">Language</Link>
          {preferredLanguage && <Link to="/profile" className="hover:text-blue-200">Profile</Link>}
        </div>
      </nav>

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
            recommendations={recommendations}
            setRecommendations={setRecommendations}
            userProfile={userProfile}
            preferredLanguage={preferredLanguage}
          />
        } />
      </Routes>
    </Router>
  );
}

export default App;






