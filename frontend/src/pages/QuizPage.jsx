import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, RotateCw, Award, ArrowRight, Sparkles } from 'lucide-react';
import { fetchQuiz, FALLBACK_QUIZ } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

function sampleRandomQuestions(pool, count = 5, excludeIds = []) {
  if (!Array.isArray(pool) || pool.length === 0) return [];
  // Prioritize questions not in excludeIds so refreshed sets are completely fresh
  const nonExcluded = pool.filter((q) => !excludeIds.includes(q.id));
  if (nonExcluded.length >= count) {
    const shuffled = [...nonExcluded].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  // If not enough questions outside excludeIds, shuffle the whole pool
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, pool.length));
}

export default function QuizPage() {
  const { t, localizeQuiz, isHindi } = useLanguage();
  const [fullPool, setFullPool] = useState(FALLBACK_QUIZ);
  const [questions, setQuestions] = useState(() => sampleRandomQuestions(FALLBACK_QUIZ, 5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchQuiz().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setFullPool(data);
        setQuestions(sampleRandomQuestions(data, 5));
      }
    }).catch(() => {});
  }, []);

  const rawQ = questions[currentIndex];
  const currentQ = rawQ ? localizeQuiz(rawQ) : null;

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

  const handleRefreshQuestions = () => {
    setIsRefreshing(true);
    const currentIds = questions.map((q) => q.id);
    const newSample = sampleRandomQuestions(fullPool, 5, currentIds);
    setQuestions(newSample);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  if (!currentQ && !quizFinished) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-20 text-center text-[#556B5D]">
        <Sparkles className="w-8 h-8 animate-spin mx-auto text-[#8DA56B] mb-2" />
        <p className="font-serif text-xl">{t('common.loading', 'Loading Ayurvedic Quiz...')}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 herbora-rise">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#4E8738] mb-2">
          <HelpCircle className="w-4 h-4 text-[#4E8738]" />
          <span>{t('quiz.badge', 'Ayurvedic Wisdom Test')}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#113E21] leading-tight">
          {t('quiz.title', 'Botanical Knowledge Quiz')}
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
          {t('quiz.subtitle', 'Test your familiarity with classical Rasayanas, Ayurvedic terminology, and medicinal plant applications.')}
        </p>
      </div>

      {!quizFinished ? (
        /* Question Card */
        <div className="bg-[#FFFDF8] border border-[#DDD6C3] rounded-3xl p-6 sm:p-8 shadow-sm herbora-rise space-y-6">
          {/* Progress Bar & Refresh Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#43634E] font-medium mb-1">
            <span className="font-semibold text-[#113E21]">
              {t('quiz.questionPrefix', 'Question')} {currentIndex + 1} {t('quiz.of', 'of')} {questions.length}
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleRefreshQuestions}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E6B3B] hover:text-[#113E21] bg-[#F4EFE3] hover:bg-[#EAE2D0] active:scale-95 px-3 py-1.5 rounded-lg border border-[#D5CDBC] transition-all cursor-pointer shadow-2xs"
                title={t('quiz.refreshQuestions', 'Refresh Questions')}
              >
                <RotateCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isRefreshing ? 'rotate-180 text-[#113E21]' : ''}`} />
                <span>{t('quiz.refreshQuestions', 'Refresh Questions')}</span>
              </button>
              <span className="font-semibold text-[#113E21] bg-[#E2ECD5] px-2.5 py-1.5 rounded-lg border border-[#CAD9B5]">
                {isHindi ? 'अंक' : 'Score'}: {score}
              </span>
            </div>
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
              <strong className="block mb-1 text-[#113E21] font-bold">
                {t('quiz.explanation', 'Classical Wisdom Explanation:')}
              </strong>
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
                <span>{currentIndex + 1 < questions.length ? t('quiz.nextQuestion', 'Next Question') : t('quiz.seeResults', 'See Results')}</span>
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
            <h2 className="font-serif text-3xl font-bold text-[#113E21]">{t('quiz.scoreTitle', 'Quiz Completed!')}</h2>
            <p className="text-sm text-[#43634E] mt-1">
              {isHindi ? (
                <>आपने {questions.length} में से <span className="font-bold text-xl text-[#113E21]">{score}</span> अंक प्राप्त किए</>
              ) : (
                <>You scored <span className="font-bold text-xl text-[#113E21]">{score}</span> out of {questions.length}</>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#DDD6C3] text-xs text-[#1F3D29] leading-relaxed">
            {score === questions.length ? (
              <span>🌿 {t('quiz.scoreRemarkGreat', 'Outstanding! You possess deep familiarity with traditional Ayurvedic botanical wisdom!')}</span>
            ) : score >= 3 ? (
              <span>🌱 {t('quiz.scoreRemarkGood', 'Well done! You have a solid grasp of core Ayurvedic plants and practices.')}</span>
            ) : (
              <span>🍃 {t('quiz.scoreRemarkLearn', "A great beginning! Explore Herbora's Plantopedia to discover more about Ayurvedic herbs.")}</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-[#DDD6C3] bg-white hover:bg-[#F2EAD9] text-[#113E21] font-medium text-sm transition-all cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4 text-[#4E8738]" />
              <span>{t('quiz.retakeQuiz', 'Retake Quiz')}</span>
            </button>
            <button
              onClick={handleRefreshQuestions}
              className="w-full sm:w-auto herbora-btn-primary py-3 px-6 cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t('quiz.newQuestions', 'New Questions')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
