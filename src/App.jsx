import React from 'react';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';

function App() {
  const [localizedContent, setLocalizedContent] = React.useState('');
  const [recommendations, setRecommendations] = React.useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Hex Ed: SEA Course Localizer</h1>
      
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

export default App;

