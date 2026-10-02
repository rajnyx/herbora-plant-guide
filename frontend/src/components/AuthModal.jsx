import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialSignUp = false }) {
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset form whenever modal opens or initialSignUp changes
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setErrorMsg('');
      setSuccessMsg('');
      setIsSignUp(initialSignUp);
    }
  }, [isOpen, initialSignUp]);

  // Lock background scroll when auth modal is open
  useEffect(() => {
    if (!isOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  const switchMode = (signUp) => {
    setIsSignUp(signUp);
    setPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const data = await signUpWithEmail(email, password, fullName);
        setSuccessMsg('Account created successfully! You are now signed in.');
        if (data?.user && onAuthSuccess) {
          onAuthSuccess(data.user);
          setTimeout(() => {
            handleClose();
          }, 800);
        } else {
          switchMode(false);
        }
      } else {
        const data = await signInWithEmail(email, password);
        if (data?.user && onAuthSuccess) {
          onAuthSuccess(data.user);
        }
        handleClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={handleClose} 
        className="fixed inset-0 bg-[#174B2B]/40 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#FAF7EE] border border-[#D2CFBF] rounded-3xl shadow-2xl p-6 sm:p-8 herbora-rise z-10">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-[#556B5D] hover:bg-[#E8E0CF] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#D8E1C3] border border-[#8DA56B] flex items-center justify-center mx-auto mb-3 text-[#174B2B]">
            {isSignUp ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#174B2B]">
            {isSignUp ? 'Join Herbora' : 'Welcome Back'}
          </h2>
          <p className="text-xs sm:text-sm text-[#637869] mt-1">
            {isSignUp 
              ? 'Create an account to save plants & access your botanical library' 
              : 'Sign in to access your personal My Plant DB'}
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#FDF2F0] border border-[#F5C2BC] text-[#9E2B25] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#F0F7F2] border border-[#BBDDC3] text-[#285D36] text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-[#174B2B] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-[#8DA56B]" />
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-[#D2CFBF] text-sm text-[#174B2B] outline-none focus:border-[#285D36]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#174B2B] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-[#8DA56B]" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-[#D2CFBF] text-sm text-[#174B2B] outline-none focus:border-[#285D36]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#174B2B] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[#8DA56B]" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-[#D2CFBF] text-sm text-[#174B2B] outline-none focus:border-[#285D36]"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-[#174B2B] uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#8DA56B]" />
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-[#D2CFBF] text-sm text-[#174B2B] outline-none focus:border-[#285D36]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#174B2B] hover:bg-[#285D36] text-[#FAF7EE] font-semibold text-sm transition-all shadow-xs disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-[#637869]">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => switchMode(false)}
                className="font-bold text-[#174B2B] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button 
                type="button" 
                onClick={() => switchMode(true)}
                className="font-bold text-[#174B2B] hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
