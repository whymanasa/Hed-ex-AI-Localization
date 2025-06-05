import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';

function ContentQuiz({ content, language, onClose }) {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Static encouragement messages
    const encouragementMessages = {
        high: [
            "Excellent work! You've mastered the content! 🌟",
            "Outstanding performance! Keep it up! 🎯",
            "Perfect score! You're amazing! 🏆"
        ],
        medium: [
            "Good job! You're on the right track! 🌱",
            "Nice work! Keep learning! 🌱",
            "You're making great progress! 💪"
        ],
        low: [
            "Don't worry! Learning takes time. Keep trying! 🌈",
            "Every attempt is a step forward! You can do it! 🚀",
            "Keep practicing! You'll get there! 🌟"
        ]
    };

    const generateQuiz = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('http://localhost:3000/generate-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    language
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to generate quiz');
            }

            const data = await response.json();
            if (!data.questions || !Array.isArray(data.questions)) {
                throw new Error('Invalid quiz data received');
            }
            
            setQuestions(data.questions);
            setIsLoading(false);
        } catch (error) {
            console.error('Error generating quiz:', error);
            setError(error.message || 'Error generating quiz. Please try again.');
            setIsLoading(false);
        }
    };

    const handleAnswer = (answer) => {
        setUserAnswers({
            ...userAnswers,
            [currentQuestion]: answer
        });
    };

    const calculateScore = () => {
        let correctAnswers = 0;
        questions.forEach((question, index) => {
            if (userAnswers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });
        return (correctAnswers / questions.length) * 100;
    };

    const getEncouragement = (score) => {
        const messages = score >= 80 ? encouragementMessages.high :
                        score >= 60 ? encouragementMessages.medium :
                        encouragementMessages.low;
        
        return messages[Math.floor(Math.random() * messages.length)];
    };

    const handleSubmit = () => {
        const finalScore = calculateScore();
        setScore(finalScore);
        setFeedback(getEncouragement(finalScore));
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setUserAnswers({});
        setScore(null);
        setFeedback('');
        setError(null);
        generateQuiz();
    };

    // Generate quiz when component mounts
    useEffect(() => {
        generateQuiz();
    }, []);

    const handleDownload = () => {
        // Create a new PDF document
        const doc = new jsPDF();
        
        // Set font size and line height
        doc.setFontSize(12);
        const lineHeight = 7;
        
        // Split content into paragraphs and add to PDF
        const paragraphs = content.split('\n');
        let y = 20; // Starting y position
        
        paragraphs.forEach((paragraph) => {
            // Split long paragraphs into lines that fit the page width
            const lines = doc.splitTextToSize(paragraph, 180);
            
            // Add each line to the PDF
            lines.forEach((line) => {
                if (y > 280) { // Check if we need a new page
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 20, y);
                y += lineHeight;
            });
            
            // Add space between paragraphs
            y += lineHeight;
        });
        
        // Save the PDF
        doc.save('localized-content.pdf');
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Generating quiz...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <div className="space-x-4">
                        <button
                            onClick={resetQuiz}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!questions || questions.length === 0) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-gray-600">No questions available.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (score !== null) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
                <p className="text-xl mb-2">Your Score: {score.toFixed(1)}%</p>
                <p className="text-lg mb-4">{feedback}</p>
                <div className="flex justify-between">
                    <button
                        onClick={resetQuiz}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    return (
        <div className="p-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Question {currentQuestion + 1} of {questions.length}</h2>
                <p className="text-lg">{currentQ.question}</p>
            </div>
            <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        className={`w-full text-left p-3 rounded-lg border ${
                            userAnswers[currentQuestion] === option
                                ? 'bg-blue-100 border-blue-500'
                                : 'bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <div className="mt-6 flex justify-between">
                <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className={`px-4 py-2 rounded ${
                        currentQuestion === 0
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                    Previous
                </button>
                {currentQuestion === questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Submit
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}

export default ContentQuiz; 