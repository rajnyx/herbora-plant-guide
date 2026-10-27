import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, Trash2, CheckCircle, AlertTriangle, ArrowRight, Sprout, Sparkles } from 'lucide-react';
import { identifyPlantImage } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import tulsiSample from '../assets/tulsi.jpg';
import neemSample from '../assets/neem.jpg';
import turmericSample from '../assets/turmeric.jpg';
import ashwagandhaSample from '../assets/ashwagandha.jpg';

export default function IdentifyPlantPage({ currentUser, onSelectPlant }) {
  const { t, localizePlant, isHindi } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeHint, setActiveHint] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Sample quick test botanical photos
  const sampleHerbs = [
    { name: isHindi ? 'तुलसी की पत्तियां' : 'Tulsi Leaves', hint: 'tulsi', img: tulsiSample },
    { name: isHindi ? 'नीम की टहनी' : 'Neem Branch', hint: 'neem', img: neemSample },
    { name: isHindi ? 'हल्दी की जड़' : 'Turmeric Roots', hint: 'turmeric', img: turmericSample },
    { name: isHindi ? 'अश्वगंधा की जड़' : 'Ashwagandha Roots', hint: 'ashwagandha', img: ashwagandhaSample }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    setErrorMsg('');
    setResult(null);
    setSelectedFile(file);
    setActiveHint('');
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSampleSelect = async (sample) => {
    setErrorMsg('');
    setResult(null);
    setPreviewUrl(sample.img);
    setActiveHint(sample.hint || '');
    // Fetch blob for sample
    try {
      const resp = await fetch(sample.img);
      const blob = await resp.blob();
      const file = new File([blob], `${sample.hint}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
    } catch {
      setSelectedFile(null);
    }
  };

  const handleIdentify = async () => {
    if (!selectedFile && !previewUrl) {
      setErrorMsg('Please select or upload a plant image first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setResult(null);

    try {
      const data = await identifyPlantImage(selectedFile, activeHint, currentUser?.id, 'auto');
      if (data && data.status === 'error') {
        throw new Error(data.message || data.error || 'No plant detected in this image.');
      }
      setResult(data);
    } catch (err) {
      setResult(null);
      setErrorMsg(err.message || 'We could not detect a valid plant specimen in this image. Please upload a clear photo of a leaf or flower.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setActiveHint('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="max-w-2xl mb-8 herbora-rise">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8DA56B] mb-2">
          <Sparkles className="w-4 h-4" />
          <span>{t('identify.badge', 'AI Botanical Vision')}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#174B2B] leading-tight">
          {t('identify.title', 'AI Plant Identifier')}
        </h1>
        <p className="text-sm sm:text-base text-[#556B5D] mt-2 leading-relaxed">
          {t('identify.subtitle', 'Upload an image of an unfamiliar medicinal leaf, flower, or herb. Herbora analyzes botanical features and cross-references them with our Ayurvedic Plantopedia database.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Upload Area */}
        <div className="lg:col-span-7 space-y-6">
          {!previewUrl ? (
            /* Drag and Drop Box */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#E2DDD0] hover:border-[#8DA56B] bg-[#FAF8F2] rounded-3xl p-8 sm:p-12 text-center transition-all flex flex-col items-center justify-center min-h-[300px] shadow-xs"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#DDE5C9] text-[#174B2B] flex items-center justify-center mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#174B2B]">
                {t('identify.uploadCardTitle', 'Upload or Drop Plant Photo')}
              </h3>
              <p className="text-xs sm:text-sm text-[#637869] mt-1.5 max-w-xs mb-6">
                {t('identify.uploadCardDesc', 'Upload a clear photo of the leaf, flower, or stem for the most accurate Ayurvedic botanical identification.')}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="herbora-btn-primary text-xs sm:text-sm py-3 px-6 cursor-pointer shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('identify.chooseFile', 'Browse Photos to Identify')}</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            /* Image Preview Card */
            <div className="bg-[#FAF8F2] border border-[#E2DDD0] rounded-3xl p-5 shadow-xs space-y-4">
              <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-[#E2DDD0] bg-white flex items-center justify-center">
                <img 
                  src={previewUrl} 
                  alt="Plant preview" 
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.target.onerror = null;
                    if (activeHint) {
                      e.target.src = `/assets/${activeHint}.jpg`;
                    }
                  }}
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-[#174B2B]/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-3">
                    <Sprout className="w-10 h-10 animate-spin text-[#DDE5C9]" />
                    <p className="font-serif text-lg font-medium">Analyzing botanical markers...</p>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E2DDD0] bg-white text-[#174B2B] hover:bg-[#EDE6D5] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#F5C2BC] bg-[#FDF2F0] text-[#9E2B25] hover:bg-[#FBE7E5] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleIdentify}
                  disabled={isProcessing}
                  className="herbora-btn-primary text-xs sm:text-sm py-2.5 px-6 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isProcessing ? 'Analyzing...' : 'Identify Plant'}</span>
                </button>
              </div>

              {/* Hidden file inputs for replace */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Sample Herb Quick Selector */}
          <div className="bg-[#FAF8F2] border border-[#E2DDD0] rounded-2xl p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8DA56B] block mb-2.5">
              Quick Test Botanical Samples
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {sampleHerbs.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSampleSelect(sample)}
                  className="p-2.5 rounded-xl bg-white border border-[#E2DDD0] hover:border-[#4E8738] hover:shadow-xs text-left transition-all group flex flex-col items-center text-center cursor-pointer active:scale-95"
                  title={`Test botanical identification for ${sample.name}`}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden mb-2 border border-[#DDD6C3] bg-[#FAF6EE] shadow-3xs flex items-center justify-center">
                    <img 
                      src={sample.img} 
                      alt={sample.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="eager"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/assets/${sample.hint}.jpg`;
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#113E21] leading-tight group-hover:text-[#4E8738] transition-colors">
                    {sample.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-[#FDF2F0] border border-[#F5C2BC] text-[#9E2B25] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Side: Identification Results */}
        <div className="lg:col-span-5">
          {result ? (
            <div className="bg-[#FAF8F2] border border-[#E2DDD0] rounded-3xl p-6 sm:p-7 shadow-md herbora-rise space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-[#285D36] flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#8DA56B]" />
                  {result.source === 'plantnet_api' 
                    ? 'Pl@ntNet AI Verified' 
                    : result.source === 'sample_preset' 
                    ? 'Botanical Sample Match' 
                    : 'AI Botanical Vision Match'}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#DDE5C9] text-[#174B2B] font-bold">
                  {result.confidence_score}% Match
                </span>
              </div>

              {result.is_heuristic_estimation && (
                <div className="p-3 rounded-xl bg-[#FEF9E7] border border-[#FAD7A0] text-[#7D6608] text-xs leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#B7950B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[#7D6608] mb-0.5">Ayurvedic Botanical Estimation</span>
                    <span>Herbora analyzed color density and leaf markers. For 90%+ taxonomic verification, you can also upload a close-up of a single leaf or flower.</span>
                  </div>
                </div>
              )}

              <div>
                <h2 className="font-serif text-3xl font-bold text-[#174B2B]">
                  {result.predicted_name}
                </h2>
                <p className="italic text-sm font-serif text-[#556B5D] mt-0.5">
                  {result.scientific_name}
                </p>
                {result.ayurvedic_name && (
                  <p className="text-xs font-semibold text-[#285D36] mt-1.5">
                    Ayurvedic Name: <span className="underline">{result.ayurvedic_name}</span>
                  </p>
                )}
              </div>

              {/* Botanical Traits Found */}
              {result.botanical_traits && result.botanical_traits.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8DA56B] block mb-2">
                    Observed Botanical Markers
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#2D3E33]">
                    {result.botanical_traits.map((t, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8DA56B]" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Database Match Status */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD0] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#637869]">Herbora Database:</span>
                  <span className="font-bold text-[#174B2B]">
                    {result.matched_plant ? 'Indexed in Plantopedia' : 'Pending Entry'}
                  </span>
                </div>
                {result.secondary_prediction && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EAE6DC]">
                    <span className="text-[#637869]">Secondary match:</span>
                    <span className="text-[#556B5D]">{result.secondary_prediction.common_name} ({result.secondary_prediction.confidence_score}%)</span>
                  </div>
                )}
              </div>

              {/* View in Plantopedia Button */}
              {result.matched_plant && (
                <button
                  onClick={() => onSelectPlant(result.matched_plant)}
                  className="w-full herbora-btn-primary py-3 px-4 justify-center text-sm"
                >
                  <span>Open in Plantopedia</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Disclaimer */}
              <p className="text-[11px] text-[#637869] italic leading-tight">
                {result.disclaimer}
              </p>
            </div>
          ) : errorMsg ? (
            /* No Plant Detected Error Card */
            <div className="bg-[#FFF8F7] border border-[#F5C2BC] rounded-3xl p-7 text-center text-[#842029] space-y-4 shadow-sm herbora-rise">
              <div className="w-16 h-16 rounded-2xl bg-[#FDE8E6] text-[#C0392B] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-[#C0392B]" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#C0392B] block mb-1">
                  {isHindi ? 'पहचान विफल' : 'Identification Failed'}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#842029]">
                  {isHindi ? 'कोई पौधा नहीं पहचाना गया' : 'No Plant Detected'}
                </h3>
              </div>
              <p className="text-xs leading-relaxed max-w-sm mx-auto text-[#721C24]">
                {errorMsg}
              </p>
              <div className="p-4 rounded-2xl bg-white border border-[#F5C2BC] text-left text-xs space-y-2 shadow-3xs">
                <p className="font-bold text-[#113E21] text-[11px] uppercase tracking-wider">
                  {isHindi ? 'सटीक परिणाम के लिए सुझाव:' : 'Tips for Accurate Botanical Identification:'}
                </p>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-[#334D3D] leading-relaxed">
                  <li>{isHindi ? 'पत्ती, फूल, फल या तने की स्पष्ट और केंद्रित तस्वीर लें' : 'Upload a real leaf, flower, fruit, or stem in clear natural lighting'}</li>
                  <li>{isHindi ? 'लोगो, टेक्स्ट, पोस्टर, ग्राफ़िक्स या असंबंधित तस्वीरों से बचें' : 'Avoid graphics, logos, posters, text art, or non-botanical images'}</li>
                  <li>{isHindi ? 'कैमरे को पौधे के करीब रखकर बारीक बनावट दिखाएं' : 'Capture close-up details showing leaf venation, color, and margins'}</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#113E21] hover:bg-[#1C542E] text-white text-xs font-semibold cursor-pointer transition-all shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isHindi ? 'नई तस्वीर चुनें' : 'Upload Different Photo'}</span>
              </button>
            </div>
          ) : (
            /* Standby Card */
            <div className="bg-[#FAF8F2] border border-[#E2DDD0] rounded-3xl p-8 text-center text-[#556B5D] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#DDE5C9] text-[#174B2B] flex items-center justify-center mx-auto">
                <Sprout className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#174B2B]">
                Botanical Identification Engine
              </h3>
              <p className="text-xs leading-relaxed max-w-xs mx-auto">
                Once an image is processed, you will see Ayurvedic classification, Sanskrit designations, confidence rating, and direct links to Plantopedia here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
