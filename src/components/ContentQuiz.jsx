import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
                throw new Error(errorData.details || t('quiz.error.generateFailed'));
            }

            const data = await response.json();
            if (!data.questions || !Array.isArray(data.questions)) {
                throw new Error(t('quiz.error.invalidData'));
            }
            
            setQuestions(data.questions);
            setIsLoading(false);
        } catch (error) {
            console.error('Error generating quiz:', error);
            setError(error.message || t('quiz.error.tryAgain'));
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

    const handleSubmit = async () => {
        const finalScore = calculateScore();
        setScore(finalScore);
        
        try {
            const response = await fetch('http://localhost:3000/generate-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    score: finalScore,
                    language: language // Use the passed language prop
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to generate feedback');
            }

            const data = await response.json();
            setFeedback(data.feedback);
        } catch (feedbackError) {
            console.error('Error fetching personalized feedback:', feedbackError);
            setFeedback('Could not generate personalized feedback.'); // Fallback feedback
        }
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

    const handleDownload = async () => {
        try {
            // Create a temporary div to render the content
            const contentDiv = document.createElement('div');
            contentDiv.style.width = '210mm'; // A4 width
            contentDiv.style.padding = '20mm';
            contentDiv.style.fontFamily = 'Arial, sans-serif';
            contentDiv.style.fontSize = '12pt';
            contentDiv.style.lineHeight = '1.5';
            contentDiv.style.whiteSpace = 'pre-wrap';
            contentDiv.style.position = 'absolute';
            contentDiv.style.left = '-9999px';
            contentDiv.style.top = '-9999px';
            
            // Add the content to the temporary div
            contentDiv.innerHTML = content.split('\n').map(p => 
                `<p style="margin-bottom: 1em;">${p}</p>`
            ).join('');
            
            // Add to document
            document.body.appendChild(contentDiv);
            
            // Convert to canvas
            const canvas = await html2canvas(contentDiv, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            // Remove the temporary div
            document.body.removeChild(contentDiv);
            
            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('quiz-content.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('processing')}</p>
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
                            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                        >
                            {t('try_again')}
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            {t('close_quiz')}
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
                    <p className="text-gray-600">{t('no_quiz_attempts')}</p>
                    <button
                        onClick={onClose}
                        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        {t('close_quiz')}
                    </button>
                </div>
            </div>
        );
    }

    if (score !== null) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">{t('quiz_results')}</h2>
                <p className="text-xl mb-2">{t('your_score')}: {score.toFixed(1)}%</p>
                <p className="text-lg mb-4">{feedback}</p>
                <div className="flex justify-between">
                    <button
                        onClick={resetQuiz}
                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                    >
                        {t('try_again')}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                    >
                        {t('download_pdf')}
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        {t('close_quiz')}
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    return (
        <div className="p-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">{t('question')} {currentQuestion + 1} {t('or')} {questions.length}</h2>
                <p className="text-lg">{currentQ.question}</p>
            </div>
            <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        className={`w-full text-left p-3 rounded-lg border ${
                            userAnswers[currentQuestion] === option
                                ? 'bg-gray-100 border-gray-800'
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
                            : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                >
                    {t('previous_question')}
                </button>
                {currentQuestion === questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                    >
                        {t('submit_quiz')}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
                    >
                        {t('next_question')}
                    </button>
                )}
            </div>
        </div>
    );
}

export default ContentQuiz; 