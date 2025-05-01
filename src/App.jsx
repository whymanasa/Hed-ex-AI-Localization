import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';
import UserProfileForm from './components/UserProfileForm';

function Home() {
  const [localizedContent, setLocalizedContent] = React.useState('');
  const [recommendations, setRecommendations] = React.useState('');

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Hex Ed: SEA Course Localizer</h1>
      <InputForm 
        setLocalizedContent={setLocalizedContent} 
        setRecommendations={setRecommendations}
      />
      <OutputDisplay 
        localizedContent={localizedContent} 
        recommendations={recommendations}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between">
        <span className="font-bold text-xl">Hex Ed</span>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/profile" className="hover:underline">Profile</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<UserProfileForm />} />
      </Routes>
    </Router>
  );
}

export default App;


