import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Send, Sprout, User, CheckCircle2 } from 'lucide-react';
import { fetchCommunityPosts, submitCommunityPost } from '../services/api';

export default function CommunityPage({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [authorName, setAuthorName] = useState(currentUser?.email ? currentUser.email.split('@')[0] : '');
  const [plantName, setPlantName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCommunityPosts().then(setPosts).catch(() => {});
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    setLoading(true);
    try {
      const newPost = await submitCommunityPost(
        authorName.trim() || 'Botanical Explorer',
        plantName.trim() || 'Balcony Herb',
        note.trim()
      );
      setPosts((prev) => [newPost, ...prev]);
      setNote('');
      setPlantName('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
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
          Share your experiences propagating household medicinal plants, preparing herbal teas, or cultivating balcony herbs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Share Story Form */}
        <div className="lg:col-span-5 bg-[#FAF8F2] border border-[#E2DDD0] rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#174B2B] flex items-center gap-2">
            <Sprout className="w-5 h-5 text-[#8DA56B]" />
            <span>Share Your Note</span>
          </h2>

          {success && (
            <div className="p-3 rounded-xl bg-[#F0F7F2] border border-[#BBDDC3] text-xs text-[#285D36] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Your story has been posted to the community!</span>
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
                className="w-full text-sm h-11 px-3.5 rounded-xl bg-white border border-[#E2DDD0] text-[#174B2B] outline-none focus:border-[#285D36]"
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
                placeholder="e.g. Tulsi, Aloe Vera, Mint"
                className="w-full text-sm h-11 px-3.5 rounded-xl bg-white border border-[#E2DDD0] text-[#174B2B] outline-none focus:border-[#285D36]"
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
                className="w-full text-sm p-3.5 rounded-xl bg-white border border-[#E2DDD0] text-[#174B2B] outline-none focus:border-[#285D36] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !note.trim()}
              className="w-full herbora-btn-primary py-3 justify-center text-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Posting...' : 'Share with Community'}</span>
            </button>
          </form>
        </div>

        {/* Right: Posts Feed */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#174B2B] mb-2">
            Recent Community Notes
          </h2>

          <div className="space-y-3.5">
            {posts.map((post) => (
              <div
                key={post.id}
                className="herbora-card p-5 bg-[#FAF8F2] border border-[#E2DDD0] rounded-2xl space-y-2.5"
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
