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
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8DA56B] mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>Ayurvedic Wisdom Test</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#174B2B] leading-tight">
          Botanical Knowledge Quiz
        </h1>
        <p className="text-sm text-[#556B5D] mt-2 leading-relaxed">
          Test your familiarity with classical Rasayanas, Ayurvedic terminology, and medicinal plant applications.
        </p>
      </div>

      {!quizFinished ? (
        /* Question Card */
        <div className="bg-[#FAF8F2] border border-[#E2DDD0] rounded-3xl p-6 sm:p-8 shadow-sm herbora-rise space-y-6">
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs text-[#637869] font-medium mb-1">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#EAE6DC] overflow-hidden">
            <div 
              className="h-full bg-[#285D36] transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#174B2B] leading-snug">
            {currentQ.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              let optionStyle = 'bg-white border-[#E2DDD0] hover:bg-[#EDE6D5] text-[#174B2B]';

              if (isAnswered) {
                if (idx === currentQ.answerIndex) {
                  optionStyle = 'bg-[#E7F3E9] border-[#285D36] text-[#174B2B] font-bold shadow-xs';
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
                    <CheckCircle2 className="w-5 h-5 text-[#285D36] shrink-0" />
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
            <div className="p-4 rounded-xl bg-[#DDE5C9]/60 border border-[#8DA56B]/40 text-xs sm:text-sm text-[#174B2B] leading-relaxed herbora-rise">
              <strong className="block mb-1 text-[#285D36] font-bold">Ayurvedic Insight:</strong>
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
        <div className="bg-[#FAF8F2] border border-[#E2DDD0] rounded-3xl p-8 sm:p-12 text-center shadow-md herbora-rise max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#DDE5C9] border-2 border-[#8DA56B] flex items-center justify-center mx-auto text-[#174B2B]">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h2 className="font-serif text-3xl font-bold text-[#174B2B]">Quiz Completed!</h2>
            <p className="text-sm text-[#556B5D] mt-1">
              You scored <span className="font-bold text-xl text-[#174B2B]">{score}</span> out of {questions.length}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2DDD0] text-xs text-[#3B4E41] leading-relaxed">
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
