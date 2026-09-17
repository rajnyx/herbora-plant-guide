import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Sprout } from 'lucide-react';
import { sendBotChat } from '../services/api';

export default function ChatAssistant({ onExplorePlants }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am your Herbora Botanical Guide. Ask me about any Ayurvedic plant, traditional remedies, or how to begin your herbal wellness journey.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'What helps with sleep?',
    'How should I take Tulsi?',
    'Herbs for clear skin',
    'Ginger for digestion'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const data = await sendBotChat(text);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.reply || "I am glad to help with any plant or herbal remedy question." }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { 
          sender: 'bot', 
          text: "Herbs carry specific energies (Virya) and tastes (Rasa). For immunity, Tulsi and Giloy are classical; for evening calm, warm golden milk with turmeric and nutmeg is wonderful!" 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button in bottom-right corner matching reference image */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FAF7EE] border border-[#D2CFBF] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all p-1.5 flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-[#8DA56B]/30 cursor-pointer"
        aria-label="Open Herbora Botanical Assistant"
        title="Herbora Botanical Assistant"
      >
        <img 
          src="/assets/herbora_bot_trans.png" 
          alt="Herbora Assistant Icon" 
          className="w-full h-full object-contain drop-shadow-2xs"
        />
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-22 sm:bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 max-h-[500px] h-[480px] bg-[#FAF7EE] border border-[#D2CFBF] rounded-2xl shadow-2xl flex flex-col overflow-hidden herbora-rise">
          {/* Header */}
          <div className="p-3.5 px-4 bg-[#174B2B] text-[#FAF7EE] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img 
                src="/assets/herbora-bot.png" 
                alt="Bot Avatar" 
                className="w-8 h-8 rounded-full border border-[#8DA56B]/60 bg-white" 
              />
              <div>
                <h3 className="font-serif text-lg font-bold leading-tight">Herbora Assistant</h3>
                <p className="text-[10px] text-[#D8E1C3] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8DA56B] animate-pulse" />
                  Ayurvedic Knowledge Active
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#D8E1C3] hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[82%] p-3 rounded-xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#174B2B] text-[#FAF7EE] rounded-br-xs'
                      : 'bg-[#E8E0CF]/80 text-[#174B2B] border border-[#D2CFBF] rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="p-2.5 rounded-xl bg-[#E8E0CF]/80 border border-[#D2CFBF] text-xs text-[#556B5D] flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 animate-spin text-[#285D36]" />
                  <span>Consulting herbal texts...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 py-1.5 bg-[#E8E0CF]/60 border-t border-[#D2CFBF] flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-[#FAF7EE] border border-[#D2CFBF] text-[#285D36] hover:bg-[#D8E1C3] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-2.5 bg-[#FAF7EE] border-t border-[#D2CFBF] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about herbs or wellness..."
              className="flex-1 text-sm bg-white border border-[#D2CFBF] rounded-xl px-3 py-2 text-[#174B2B] outline-none focus:border-[#285D36]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-[#174B2B] hover:bg-[#285D36] disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
