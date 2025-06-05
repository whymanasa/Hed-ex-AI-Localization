import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Initialize PDF.js worker using CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

function InputForm({ setLocalizedContent, setRecommendations, preferredLanguage }) {
  const { t } = useTranslation();
  const [courseContent, setCourseContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setMessages(prev => [...prev, { type: 'user', content: `Uploading file: ${file.name}...` }]);

    try {
      let content;
      if (file.type === 'application/pdf') {
        content = await extractTextFromPDF(file);
      } else {
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
      }

      setCourseContent(content);
      setMessages(prev => [...prev, { type: 'user', content: `Successfully loaded: ${file.name}` }]);
    } catch (error) {
      console.error('Error reading file:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: `Error reading file: ${error.message}` 
      }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userProfile) {
      alert("Please complete your profile first.");
      return;
    }

    if (!courseContent.trim()) {
      alert("Please enter some content or upload a file.");
      return;
    }

    setLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: courseContent }]);

    try {
      // Attach preferredLanguage to the userProfile for backend use
      const profileToSend = { ...userProfile, preferredLanguage };
      const response = await axios.post('http://localhost:3000/translate', {
        content: courseContent,
        profile: profileToSend,
      });

      setLocalizedContent(response.data.localizedContent);
      setRecommendations(response.data.recommendations);
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: response.data.localizedContent,
        recommendations: response.data.recommendations 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'Something went wrong. Please try again.' 
      }]);
    }

    setLoading(false);
    setCourseContent('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-white shadow-md'
              }`}
            >
              {message.type === 'assistant' ? (
                <>
                  <div className="text-gray-700 whitespace-pre-wrap">{message.content}</div>
                  {message.recommendations && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-blue-600 mb-2">Recommendations:</h3>
                      <div className="text-gray-700">{message.recommendations}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-blue-600 hover:text-blue-800"
              title="Upload file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.md,.doc,.docx,.pdf"
            />
          </div>
          <div className="flex space-x-2">
            <textarea
              className="flex-1 p-3 border border-gray-300 rounded-md resize-none"
              rows="3"
              placeholder={t("paste_course_content")}
              value={courseContent}
              onChange={(e) => setCourseContent(e.target.value)}
            />
            <button
              type="submit"
              className="px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputForm;




