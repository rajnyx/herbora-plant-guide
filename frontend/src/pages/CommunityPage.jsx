import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Send, Sprout, User, CheckCircle2, AlertCircle, LogIn, Lock } from 'lucide-react';
import { fetchCommunityPosts, submitCommunityPost } from '../services/api';

export default function CommunityPage({ currentUser, onOpenAuth }) {
  const [posts, setPosts] = useState([]);
  const [authorName, setAuthorName] = useState(
    currentUser?.user_metadata?.full_name || currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : '')
  );
  const [plantName, setPlantName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCommunityPosts().then(setPosts).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentUser) {
      const name = currentUser.user_metadata?.full_name || currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : '');
      if (name && !authorName) {
        setAuthorName(name);
      }
    }
  }, [currentUser]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Login to post your story with the community.');
      return;
    }
    if (!note.trim()) return;

    setLoading(true);
    setError('');
    try {
      const newPost = await submitCommunityPost(
        authorName.trim() || currentUser.name || currentUser.email.split('@')[0] || 'Botanical Explorer',
        plantName.trim() || 'Balcony Herb',
        note.trim(),
        currentUser.id
      );
      setPosts((prev) => [newPost, ...prev]);
      setNote('');
      setPlantName('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="max-w-2xl mb-10 herbora-rise">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8DA56B] mb-2">
          <MessageSquare className="w-4 h-4" />
          <span>Ayurvedic Herbal Community</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#174B2B] leading-tight">
          Grower & Learner Stories
        </h1>
        <p className="text-sm sm:text-base text-[#556B5D] mt-2 leading-relaxed">
          Explore botanical wisdom from gardeners and herbalists worldwide. Read insights or log in to contribute your own observations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Post Form (if logged in) or Login Requirement Prompt (if not logged in) */}
        <div className="lg:col-span-5 bg-[#FAF7EE] border border-[#D2CFBF] rounded-3xl p-6 shadow-sm space-y-4">
          {currentUser ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-[#174B2B] flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-[#8DA56B]" />
                  <span>Share Your Note</span>
                </h2>
                <div className="text-[11px] font-semibold text-[#8DA56B] bg-[#EAE6D6] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3D7B51] animate-pulse"></span>
                  <span>Logged In</span>
                </div>
              </div>

              {success && (
                <div className="p-3 rounded-xl bg-[#F0F7F2] border border-[#BBDDC3] text-xs text-[#285D36] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Your story has been posted to the community!</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-[#FDF2F0] border border-[#F4C7C3] text-xs text-[#A82C2C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePostSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#174B2B] uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Ananya, Rahul"
                    className="w-full text-sm h-11 px-3.5 rounded-xl bg-white border border-[#D2CFBF] text-[#174B2B] outline-none focus:border-[#285D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#174B2B] uppercase tracking-wider mb-1">
                    Plant or Herb
                  </label>
                  <input
                    type="text"
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    placeholder="e.g. Tulsi, Ashwagandha, Mint"
                    className="w-full text-sm h-11 px-3.5 rounded-xl bg-white border border-[#D2CFBF] text-[#174B2B] outline-none focus:border-[#285D36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#174B2B] uppercase tracking-wider mb-1">
                    Your Story or Observation
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Share how you grow it, your favorite tea preparation, or tips for beginners..."
                    className="w-full text-sm p-3.5 rounded-xl bg-white border border-[#D2CFBF] text-[#174B2B] outline-none focus:border-[#285D36] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !note.trim()}
                  className="w-full herbora-btn-primary py-3 justify-center text-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Posting...' : 'Share with Community'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8DA56B]">
                <Lock className="w-4 h-4" />
                <span>Community Contributor</span>
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#174B2B]">
                Share Your Botanical Journey
              </h2>

              {/* Prominent Login to Post Notice */}
              <div className="p-3.5 rounded-xl bg-[#FDF2F0] border border-[#F4C7C3] text-xs sm:text-sm text-[#A82C2C] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C0392B]" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Login to post</span>
                  <p className="text-[12px] text-[#7A2323] leading-relaxed">
                    You must be logged in to write and share your own posts. You can freely view and read all community blogs on the right.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#556B5D] leading-relaxed">
                Connect with passionate growers, share balcony propagation methods, and post your favorite Ayurvedic home remedies.
              </p>

              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full herbora-btn-primary py-3 justify-center text-sm cursor-pointer shadow-xs flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Post</span>
              </button>

              <div className="text-center pt-1 border-t border-[#E2DDD0]">
                <p className="text-[11px] text-[#728577]">
                  New to Herbora? Create an account in seconds to start sharing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Community Feed (Readable by All) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#174B2B]">
              Recent Community Notes
            </h2>
            <span className="text-xs font-medium text-[#637869] bg-[#FAF7EE] px-3 py-1 rounded-full border border-[#D2CFBF]">
              {posts.length} {posts.length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          <div className="space-y-3.5">
            {posts.length === 0 ? (
              <div className="herbora-card p-8 bg-[#FAF7EE] border border-[#D2CFBF] rounded-2xl text-center space-y-2">
                <Sprout className="w-8 h-8 text-[#8DA56B] mx-auto opacity-70" />
                <h3 className="font-serif text-lg font-bold text-[#174B2B]">No community notes yet</h3>
                <p className="text-xs text-[#556B5D]">
                  {currentUser ? 'Be the first to share your herbal journey above!' : 'Log in to be the first grower to share a story.'}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="herbora-card p-5 bg-[#FAF7EE] border border-[#D2CFBF] rounded-2xl space-y-2.5 transition-all hover:border-[#8DA56B]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#DDE5C9] text-[#174B2B] flex items-center justify-center font-bold text-xs">
                        {post.author_name ? post.author_name[0].toUpperCase() : 'B'}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-[#174B2B]">{post.author_name}</span>
                        <span className="block text-[11px] text-[#8DA56B] font-medium">Herb: {post.plant_name}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#637869]">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#3B4E41] leading-relaxed pl-10">
                    {post.note}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
