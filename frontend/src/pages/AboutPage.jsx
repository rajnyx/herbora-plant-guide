import React, { useState } from 'react';
import { ShieldAlert, Star, Send, Heart, BookOpen, CheckCircle2 } from 'lucide-react';
import { submitUserFeedback } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { t, isHindi } = useLanguage();
  const [rating, setRating] = useState(5);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;

    setLoading(true);
    try {
      await submitUserFeedback(rating, feedbackMsg);
      setSubmitted(true);
      setFeedbackMsg('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12">
      {/* Brand Identity & Logo Showcase */}
      <div className="text-center max-w-2xl mx-auto space-y-4 herbora-rise">
        <div className="w-28 h-28 mx-auto rounded-3xl overflow-hidden border border-[#DDD6C3] shadow-sm bg-white p-2">
          <img 
            src="/assets/herbora-logo.png" 
            alt="Official Herbora Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#113E21]">
          {t('about.title', 'About Herbora')}
        </h1>
        {/* Leaf divider */}
        <div className="flex items-center justify-center gap-2 mt-2 mb-1 text-[#6C9352]">
          <span className="w-8 h-[1.5px] bg-[#6C9352]/70" />
          <svg width="14" height="12" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12C10 12 8 7 3 6C3 6 8 4 10 0C10 0 12 4 17 6C17 6 12 7 10 12Z" fill="#6C9352"/>
          </svg>
          <span className="w-8 h-[1.5px] bg-[#6C9352]/70" />
        </div>
        <p className="text-xs sm:text-sm font-bold tracking-widest text-[#4E8738] uppercase">
          {t('brand.tagline', 'Ancient Wisdom • Modern Discovery')}
        </p>
        <p className="text-sm sm:text-base text-[#43634E] leading-relaxed pt-2">
          {t('about.subtitle', 'Herbora is an Ayurveda-focused digital learning and botanical identification platform. Our objective is to bridge classical botanical knowledge with modern image processing and accessible digital education.')}
        </p>
      </div>

      {/* Pillars Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="herbora-card p-7 bg-[#FFFDF8] border border-[#DDD6C3] rounded-3xl hover:border-[#6C9352] transition-all">
          <span className="text-3xl mb-3 block">📜</span>
          <h3 className="font-serif text-xl font-bold text-[#113E21]">
            {isHindi ? 'शास्त्रीय प्रामाणिकता' : 'Classical Authenticity'}
          </h3>
          <p className="text-xs sm:text-sm text-[#1F3D29] leading-relaxed mt-2">
            {isHindi 
              ? 'पादप वर्गीकरण, त्रिदोष गुणधर्म और पारंपरिक उपयोगों को चरक संहिता तथा भारतीय आयुर्वेदिक फार्माकोपिया जैसे शास्त्रीय संहिताओं से सत्यापित किया गया है।'
              : 'Plant classifications, doshic attributes, and traditional uses are reviewed against classical texts such as the Charaka Samhita and the Ayurvedic Pharmacopoeia of India.'}
          </p>
        </div>

        <div className="herbora-card p-7 bg-[#FFFDF8] border border-[#DDD6C3] rounded-3xl hover:border-[#6C9352] transition-all">
          <span className="text-3xl mb-3 block">🔬</span>
          <h3 className="font-serif text-xl font-bold text-[#113E21]">
            {isHindi ? 'आधुनिक अन्वेषण' : 'Modern Discovery'}
          </h3>
          <p className="text-xs sm:text-sm text-[#1F3D29] leading-relaxed mt-2">
            {isHindi
              ? 'एआई विज़न तकनीकों से सशक्त, हर्बोरा विद्यार्थियों और प्रकृति प्रेमियों को अपने आस-पास और बालकनी में औषधीय पौधों को पहचानने में सहायता करता है।'
              : 'Empowered by AI vision heuristics, Herbora helps students and plant enthusiasts recognize medicinal flora in their neighborhood gardens and homes.'}
          </p>
        </div>

        <div className="herbora-card p-7 bg-[#FFFDF8] border border-[#DDD6C3] rounded-3xl hover:border-[#6C9352] transition-all">
          <span className="text-3xl mb-3 block">🌱</span>
          <h3 className="font-serif text-xl font-bold text-[#113E21]">
            {isHindi ? 'घरेलू वाटिका' : 'Home Cultivation'}
          </h3>
          <p className="text-xs sm:text-sm text-[#1F3D29] leading-relaxed mt-2">
            {isHindi
              ? 'घरेलू औषधीय पौधों की देखभाल मार्गदर्शिका, कार्य-सूची और दैनिक दिनचर्या के माध्यम से प्रकृति के साथ आत्मीय जुड़ाव को बढ़ावा देना।'
              : 'Encouraging mindful connection with nature through household botanical care guides, plant care routines and checklists, and daily circadian rituals.'}
          </p>
        </div>
      </div>

      {/* Mandatory Educational & Health Disclaimer */}
      <div className="p-7 rounded-3xl bg-[#FFF9F5] border border-[#F2D7C9] text-[#7A3B22] space-y-3 shadow-xs">
        <div className="flex items-center gap-2 font-serif text-xl font-bold text-[#8F3A2B]">
          <ShieldAlert className="w-5 h-5 text-[#D96B43]" />
          <span>{t('about.disclaimerTitle', 'Educational & Health Disclaimer')}</span>
        </div>
        <div className="text-xs sm:text-sm leading-relaxed space-y-2 text-[#7A3B22]/90">
          <p>
            {t('about.disclaimerDesc', 'Herbora is strictly an educational and academic digital project. The botanical information, traditional uses, and Ayurvedic references presented on this platform are for informational and historical inquiry only.')}
          </p>
        </div>
      </div>

      {/* Student Project Feedback Form */}
      <div className="bg-[#FFFDF8] border border-[#DDD6C3] rounded-3xl p-7 sm:p-8 max-w-xl mx-auto space-y-4 shadow-xs">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-[#113E21]">
            {isHindi ? 'मंच पर अपनी प्रतिक्रिया दें' : 'Platform Feedback'}
          </h2>
          <p className="text-xs text-[#43634E] mt-1">
            {isHindi ? 'हर्बोरा वानस्पतिक सीखने के अनुभव को बेहतर बनाने में हमारी सहायता करें' : 'Help us improve the Herbora botanical learning experience'}
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-[#F0F7F2] border border-[#BBDDC3] text-center text-xs text-[#285D36] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isHindi ? 'हर्बोरा पर अपने विचार व प्रतिक्रिया साझा करने के लिए धन्यवाद!' : 'Thank you for sharing your feedback on Herbora!'}</span>
          </div>
        ) : (
          <form onSubmit={handleFeedback} className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`w-7 h-7 ${star <= rating ? 'fill-[#E29D32] text-[#E29D32]' : 'text-[#E2DDD0]'}`} 
                  />
                </button>
              ))}
            </div>

            <div>
              <textarea
                required
                rows={3}
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder={isHindi ? 'वेबसाइट के स्वरूप, पादप सटीकता, नुस्खों या नई सुविधाओं पर अपने विचार साझा करें...' : 'Share your thoughts on the design, plant accuracy, or features...'}
                className="w-full text-sm p-3.5 rounded-xl bg-white border border-[#E2DDD0] text-[#174B2B] outline-none focus:border-[#285D36] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !feedbackMsg.trim()}
              className="w-full herbora-btn-primary py-3 justify-center text-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? (isHindi ? 'भेजा जा रहा है...' : 'Submitting...') : (isHindi ? 'प्रतिक्रिया भेजें' : 'Send Feedback')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
