import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Sprout, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  Lock,
  Edit3,
  Trash2,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { 
  fetchCommunityPosts, 
  submitCommunityPost, 
  updateCommunityPost, 
  deleteCommunityPost, 
  likeCommunityPost 
} from '../services/api';

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

  // Post management state
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my-posts'
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPlantName, setEditPlantName] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState(new Set());

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

  const isPostOwner = (post) => {
    if (!currentUser) return false;
    if (post.user_id && post.user_id === currentUser.id) return true;
    const currentName = currentUser.user_metadata?.full_name || currentUser.name || currentUser.email?.split('@')[0];
    if (!post.user_id && post.author_name === currentName) return true;
    return false;
  };

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

  const handleStartEdit = (post) => {
    setEditingPostId(post.id);
    setEditPlantName(post.plant_name || '');
    setEditNote(post.note || '');
    setEditError('');
    setDeletingPostId(null);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditPlantName('');
    setEditNote('');
    setEditError('');
  };

  const handleSaveEdit = async (postId) => {
    if (!editNote.trim()) {
      setEditError('Note content cannot be empty.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      const updated = await updateCommunityPost(
        postId,
        editPlantName.trim() || 'Ayurvedic Herb',
        editNote.trim(),
        currentUser.id
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, plant_name: updated.plant_name, note: updated.note }
            : p
        )
      );
      setEditingPostId(null);
    } catch (err) {
      setEditError(err.message || 'Failed to update post');
    } finally {
      setEditLoading(false);
    }
  };

  const handleStartDelete = (postId) => {
    setDeletingPostId(postId);
    setEditingPostId(null);
  };

  const handleCancelDelete = () => {
    setDeletingPostId(null);
  };

  const handleConfirmDelete = async (postId) => {
    setDeleteLoading(true);
    try {
      await deleteCommunityPost(postId, currentUser.id);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDeletingPostId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await likeCommunityPost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes_count: res.likes_count } : p
        )
      );
      setLikedPostIds((prev) => new Set([...prev, postId]));
    } catch (err) {
      console.error(err);
    }
  };

  const myPostsCount = posts.filter(isPostOwner).length;
  const displayedPosts = activeTab === 'my-posts' ? posts.filter(isPostOwner) : posts;

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
          Explore botanical wisdom from gardeners and herbalists worldwide. Read insights or log in to contribute and manage your observations.
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-bold text-[#174B2B]">
              Recent Community Notes
            </h2>

            {/* Filter Tabs: All Stories vs My Stories */}
            <div className="flex items-center gap-1.5 bg-[#FAF7EE] p-1 rounded-xl border border-[#D2CFBF] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#174B2B] text-[#FAF7EE] shadow-2xs'
                    : 'text-[#556B5D] hover:text-[#174B2B]'
                }`}
              >
                All ({posts.length})
              </button>
              {currentUser && (
                <button
                  onClick={() => setActiveTab('my-posts')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'my-posts'
                      ? 'bg-[#174B2B] text-[#FAF7EE] shadow-2xs'
                      : 'text-[#556B5D] hover:text-[#174B2B]'
                  }`}
                >
                  <span>My Stories</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'my-posts' ? 'bg-[#FAF7EE] text-[#174B2B]' : 'bg-[#EAE6D6] text-[#174B2B]'
                  }`}>
                    {myPostsCount}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3.5">
            {displayedPosts.length === 0 ? (
              <div className="herbora-card p-8 bg-[#FAF7EE] border border-[#D2CFBF] rounded-2xl text-center space-y-2">
                <Sprout className="w-8 h-8 text-[#8DA56B] mx-auto opacity-70" />
                <h3 className="font-serif text-lg font-bold text-[#174B2B]">
                  {activeTab === 'my-posts' ? "You haven't posted any stories yet" : 'No community notes yet'}
                </h3>
                <p className="text-xs text-[#556B5D]">
                  {activeTab === 'my-posts'
                    ? 'Share your first plant experience using the form on the left!'
                    : currentUser
                    ? 'Be the first to share your herbal journey above!'
                    : 'Log in to be the first grower to share a story.'}
                </p>
              </div>
            ) : (
              displayedPosts.map((post) => {
                const isOwner = isPostOwner(post);
                const isEditing = editingPostId === post.id;
                const isDeleting = deletingPostId === post.id;
                const isLiked = likedPostIds.has(post.id);

                return (
                  <div
                    key={post.id}
                    className="herbora-card p-5 bg-[#FAF7EE] border border-[#D2CFBF] rounded-2xl space-y-3 transition-all hover:border-[#8DA56B]"
                  >
                    {/* Header: Author & Controls */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#174B2B] text-[#FAF7EE] flex items-center justify-center font-bold text-xs shadow-2xs">
                          {post.author_name ? post.author_name[0].toUpperCase() : 'B'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#174B2B]">{post.author_name}</span>
                            {isOwner && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D8E1C3] text-[#174B2B]">
                                You
                              </span>
                            )}
                          </div>
                          <span className="block text-[11px] text-[#8DA56B] font-medium">Herb: {post.plant_name}</span>
                        </div>
                      </div>

                      {/* Right: Date & Actions (Edit / Delete if owner) */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#637869]">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}
                        </span>

                        {isOwner && !isEditing && !isDeleting && (
                          <div className="flex items-center gap-1 border-l border-[#D2CFBF] pl-2 ml-1">
                            <button
                              onClick={() => handleStartEdit(post)}
                              title="Edit post"
                              className="p-1.5 rounded-lg text-[#556B5D] hover:text-[#174B2B] hover:bg-[#EAE6D6] transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStartDelete(post.id)}
                              title="Delete post"
                              className="p-1.5 rounded-lg text-[#A82C2C] hover:bg-[#FDF2F0] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline Delete Confirmation */}
                    {isDeleting && (
                      <div className="p-3 rounded-xl bg-[#FDF2F0] border border-[#F4C7C3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 text-xs text-[#A82C2C] font-semibold">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Delete this community story permanently?</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleConfirmDelete(post.id)}
                            disabled={deleteLoading}
                            className="px-3 py-1 rounded-lg bg-[#C0392B] hover:bg-[#A82C2C] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                          </button>
                          <button
                            onClick={handleCancelDelete}
                            disabled={deleteLoading}
                            className="px-3 py-1 rounded-lg bg-white border border-[#D2CFBF] text-[#556B5D] text-xs font-medium hover:bg-[#FAF7EE] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Content: Edit Mode or Normal View */}
                    {isEditing ? (
                      <div className="space-y-3 pt-2 border-t border-[#D2CFBF]">
                        {editError && (
                          <div className="text-xs text-[#A82C2C] flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{editError}</span>
                          </div>
                        )}
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8DA56B] mb-1">
                            Plant / Herb Name
                          </label>
                          <input
                            type="text"
                            value={editPlantName}
                            onChange={(e) => setEditPlantName(e.target.value)}
                            className="w-full text-xs sm:text-sm h-9 px-3 rounded-xl bg-white border border-[#D2CFBF] text-[#174B2B] outline-none focus:border-[#285D36]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8DA56B] mb-1">
                            Story / Observation
                          </label>
                          <textarea
                            rows={3}
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            className="w-full text-xs sm:text-sm p-3 rounded-xl bg-white border border-[#D2CFBF] text-[#174B2B] outline-none focus:border-[#285D36] resize-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(post.id)}
                            disabled={editLoading || !editNote.trim()}
                            className="herbora-btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{editLoading ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={editLoading}
                            className="py-1.5 px-3 rounded-xl bg-white border border-[#D2CFBF] text-[#556B5D] hover:bg-[#FAF7EE] text-xs font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm text-[#3B4E41] leading-relaxed pl-11">
                          {post.note}
                        </p>

                        {/* Card Footer: Like Reaction Button */}
                        <div className="pl-11 pt-2 border-t border-[#EAE6DC] flex items-center justify-between text-xs text-[#637869]">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
                              isLiked
                                ? 'bg-[#FDF2F0] border-[#F4C7C3] text-[#C0392B] font-semibold'
                                : 'bg-white border-[#D2CFBF] text-[#556B5D] hover:border-[#8DA56B] hover:text-[#174B2B]'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-[#C0392B]' : ''}`} />
                            <span>{post.likes_count || 0}</span>
                            <span className="hidden sm:inline text-[11px] font-normal">
                              {post.likes_count === 1 ? 'like' : 'likes'}
                            </span>
                          </button>

                          <span className="text-[11px] text-[#8DA56B] italic">
                            Herbora Community Story
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
