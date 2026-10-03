import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Award, ArrowRight, Sparkles } from 'lucide-react';
import { fetchQuiz } from '../services/api';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    fetchQuiz().then(setQuestions).catch(() => {});
  }, []);

  const currentQ = questions[currentIndex];

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.answerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (!currentQ && !quizFinished) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-20 text-center text-[#556B5D]">
        <Sparkles className="w-8 h-8 animate-spin mx-auto text-[#8DA56B] mb-2" />
        <p className="font-serif text-xl">Loading Ayurvedic Quiz...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 herbora-rise">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#4E8738] mb-2">
          <HelpCircle className="w-4 h-4 text-[#4E8738]" />
          <span>Ayurvedic Wisdom Test</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#113E21] leading-tight">
          Botanical Knowledge Quiz
        </h1>
        {/* Leaf divider */}
        <div className="flex items-center justify-center gap-2 mt-2 mb-3 text-[#6C9352]">
          <span className="w-8 h-[1.5px] bg-[#6C9352]/70" />
          <svg width="14" height="12" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12C10 12 8 7 3 6C3 6 8 4 10 0C10 0 12 4 17 6C17 6 12 7 10 12Z" fill="#6C9352"/>
          </svg>
          <span className="w-8 h-[1.5px] bg-[#6C9352]/70" />
        </div>
        <p className="text-sm text-[#43634E] leading-relaxed">
          Test your familiarity with classical Rasayanas, Ayurvedic terminology, and medicinal plant applications.
        </p>
      </div>

      {!quizFinished ? (
        /* Question Card */
        <div className="bg-[#FFFDF8] border border-[#DDD6C3] rounded-3xl p-6 sm:p-8 shadow-sm herbora-rise space-y-6">
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs text-[#43634E] font-medium mb-1">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="font-semibold text-[#113E21]">Score: {score}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#EAE6DC] overflow-hidden">
            <div 
              className="h-full bg-[#113E21] transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#113E21] leading-snug">
            {currentQ.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              let optionStyle = 'bg-white border-[#DDD6C3] hover:bg-[#F2EAD9] text-[#113E21]';

              if (isAnswered) {
                if (idx === currentQ.answerIndex) {
                  optionStyle = 'bg-[#E2ECD5] border-[#4E8738] text-[#113E21] font-bold shadow-xs';
                } else if (idx === selectedOption) {
                  optionStyle = 'bg-[#FDF2F0] border-[#D96B43] text-[#8F3A2B] font-semibold';
                } else {
                  optionStyle = 'bg-white/60 border-[#EAE6DC] opacity-60 text-[#637869]';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border text-left text-sm sm:text-base flex items-center justify-between transition-all cursor-pointer ${optionStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && idx === currentQ.answerIndex && (
                    <CheckCircle2 className="w-5 h-5 text-[#113E21] shrink-0" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== currentQ.answerIndex && (
                    <XCircle className="w-5 h-5 text-[#D96B43] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-[#E2ECD5]/60 border border-[#6C9352]/40 text-xs sm:text-sm text-[#113E21] leading-relaxed herbora-rise">
              <strong className="block mb-1 text-[#113E21] font-bold">Ayurvedic Insight:</strong>
              {currentQ.explanation}
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="herbora-btn-primary py-2.5 px-6 text-sm cursor-pointer"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Quiz'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Finished Screen */
        <div className="bg-[#FFFDF8] border border-[#DDD6C3] rounded-3xl p-8 sm:p-12 text-center shadow-md herbora-rise max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#E2ECD5] border-2 border-[#4E8738] flex items-center justify-center mx-auto text-[#113E21]">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h2 className="font-serif text-3xl font-bold text-[#113E21]">Quiz Completed!</h2>
            <p className="text-sm text-[#43634E] mt-1">
              You scored <span className="font-bold text-xl text-[#113E21]">{score}</span> out of {questions.length}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#DDD6C3] text-xs text-[#1F3D29] leading-relaxed">
            {score === questions.length ? (
              <span>🌿 Outstanding! You possess deep familiarity with traditional Ayurvedic botanical wisdom!</span>
            ) : score >= 3 ? (
              <span>🌱 Well done! You have a solid grasp of core Ayurvedic plants and practices.</span>
            ) : (
              <span>🍃 A great beginning! Explore Herbora's Plantopedia to discover more about Ayurvedic herbs.</span>
            )}
          </div>

          <button
            onClick={handleRestart}
            className="herbora-btn-primary py-3 px-6 mx-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
        </div>
      )}
    </div>
  );
}
