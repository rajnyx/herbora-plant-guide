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
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';
import { 
  fetchCommunityPosts, 
  submitCommunityPost, 
  updateCommunityPost, 
  deleteCommunityPost, 
  likeCommunityPost,
  submitPostComment,
  deletePostComment
} from '../services/api';

export default function CommunityPage({ currentUser, onOpenAuth }) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Post composer state
  const [showComposer, setShowComposer] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [plantName, setPlantName] = useState('');
  const [note, setNote] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState('');
  const [loginPrompt, setLoginPrompt] = useState('');

  // Active filter tab: 'all' | 'my-posts'
  const [activeTab, setActiveTab] = useState('all');

  // Post editing & deleting
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPlantName, setEditPlantName] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Single-like enforcement state (persisted in localStorage)
  const [likedPostIds, setLikedPostIds] = useState(() => {
    try {
      const stored = localStorage.getItem('herbora_liked_posts');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Comments state: mapping of postId -> boolean (expanded) and postId -> comment input text
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  useEffect(() => {
    fetchCommunityPosts()
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load community posts:', err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }, []);

  useEffect(() => {
    if (currentUser) {
      const name = currentUser.user_metadata?.full_name || currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : '');
      if (name && !authorName) {
        setAuthorName(name);
      }
      // If user was prompted to login and now logged in, clear prompt
      if (loginPrompt) setLoginPrompt('');
    }
  }, [currentUser]);

  // Persist liked post IDs to localStorage whenever updated
  const markPostAsLiked = (postId) => {
    setLikedPostIds((prev) => {
      const updated = new Set([...prev, postId]);
      try {
        localStorage.setItem('herbora_liked_posts', JSON.stringify([...updated]));
      } catch (e) {
        console.warn('Unable to persist liked posts in localStorage:', e);
      }
      return updated;
    });
  };

  const isPostOwner = (post) => {
    if (!currentUser) return false;
    if (post.user_id && post.user_id === currentUser.id) return true;
    const currentName = currentUser.user_metadata?.full_name || currentUser.name || currentUser.email?.split('@')[0];
    if (!post.user_id && post.author_name === currentName) return true;
    return false;
  };

  // Triggered when user clicks "Share Community Post"
  const handleOpenComposer = () => {
    if (!currentUser) {
      setLoginPrompt('Please log in to share your notes and experiences with the community.');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setLoginPrompt('');
    setShowComposer((prev) => !prev);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setLoginPrompt('Please log in to post your note with the community.');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!note.trim()) return;

    setSubmittingPost(true);
    setPostError('');
    try {
      const newPost = await submitCommunityPost(
        authorName.trim() || currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : 'Botanical Explorer'),
        plantName.trim() || 'Ayurvedic Herb',
        note.trim(),
        currentUser.id
      );
      // Ensure comments array is populated
      const postWithComments = {
        ...newPost,
        comments: newPost.comments || [],
        comments_count: newPost.comments_count || 0
      };
      setPosts((prev) => [postWithComments, ...prev]);
      setNote('');
      setPlantName('');
      setPostSuccess(true);
      setShowComposer(false);
      setTimeout(() => setPostSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setPostError(err.message || 'Failed to submit post');
    } finally {
      setSubmittingPost(false);
    }
  };

  // Like a post only once
  const handleLike = async (postId) => {
    if (likedPostIds.has(postId)) {
      return; // Already liked by this user/browser
    }

    // Optimistically mark as liked and increment count
    markPostAsLiked(postId);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p
      )
    );

    try {
      const res = await likeCommunityPost(postId, currentUser?.id);
      if (res && typeof res.likes_count === 'number') {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likes_count: res.likes_count } : p
          )
        );
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Toggle comments section
  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Submit comment
  const handleCommentSubmit = async (postId) => {
    if (!currentUser) {
      setLoginPrompt('Please log in to leave a comment on community stories.');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const commentText = (commentInputs[postId] || '').trim();
    if (!commentText) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    try {
      const currentAuthor = authorName.trim() || currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : 'Herbalist');
      const res = await submitPostComment(postId, commentText, currentAuthor, currentUser.id);
      
      // Update post in state with new comment
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const updatedComments = [...(p.comments || []), res.comment];
          return {
            ...p,
            comments: updatedComments,
            comments_count: res.comments_count || updatedComments.length
          };
        })
      );

      // Clear input
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Delete own comment
  const handleDeleteComment = async (postId, commentId) => {
    if (!currentUser) return;
    try {
      await deletePostComment(commentId, currentUser.id);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const filtered = (p.comments || []).filter((c) => c.id !== commentId);
          return {
            ...p,
            comments: filtered,
            comments_count: filtered.length
          };
        })
      );
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  // Edit post
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

  // Delete post
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

  // Filter posts
  const myPostsCount = posts.filter(isPostOwner).length;
  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'my-posts' && !isPostOwner(p)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlant = (p.plant_name || '').toLowerCase().includes(q);
      const matchNote = (p.note || '').toLowerCase().includes(q);
      const matchAuthor = (p.author_name || '').toLowerCase().includes(q);
      return matchPlant || matchNote || matchAuthor;
    }
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="max-w-3xl mb-8 herbora-rise">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#4E8738] mb-2">
          <MessageSquare className="w-4 h-4 text-[#4E8738]" />
          <span>Ayurvedic Herbal Community</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#113E21] leading-tight">
          Grower & Learner Stories
        </h1>

        {/* Leaf divider */}
        <div className="flex items-center gap-2 mt-2 mb-3 text-[#6C9352]">
          <span className="w-8 h-[1.5px] bg-[#6C9352]/70" />
          <svg width="14" height="12" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12C10 12 8 7 3 6C3 6 8 4 10 0C10 0 12 4 17 6C17 6 12 7 10 12Z" fill="#6C9352"/>
          </svg>
          <span className="w-8 h-[1.5px] bg-[#6C9352]/70" />
        </div>

        <p className="text-sm sm:text-base text-[#43634E] leading-relaxed">
          Explore botanical wisdom, cultivation tips, and traditional wellness observations from herbalists and balcony gardeners worldwide. Read freely, join the conversation, or share your own observations.
        </p>
      </div>

      {/* Auth notification prompt (shown ONLY when an unauthenticated user clicks to share/comment) */}
      {loginPrompt && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FDF2F0] border border-[#F4C7C3] flex items-center justify-between gap-3 text-xs sm:text-sm text-[#A82C2C] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#C0392B]" />
            <div>
              <span className="font-bold block">Login to Post</span>
              <span>{loginPrompt}</span>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#113E21] hover:bg-[#1C542E] text-[#FAF6EE] text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      )}

      {/* Success Notification after submitting a post */}
      {postSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-[#F0F7F2] border border-[#BBDDC3] text-xs sm:text-sm text-[#1C542E] flex items-center gap-2.5 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#2E7D42] shrink-0" />
          <span className="font-medium">Your herbal story has been published to the Herbora community!</span>
        </div>
      )}

      {/* Action Bar: Share Button, Filter Tabs, and Search */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[#FFFDF8] border border-[#DDD6C3] shadow-xs">
        {/* Left: Filter Tabs & Search */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-[#FAF6EE] p-1 rounded-xl border border-[#DDD6C3]/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#113E21] text-[#FAF6EE] shadow-2xs'
                  : 'text-[#43634E] hover:text-[#113E21]'
              }`}
            >
              All Notes ({posts.length})
            </button>
            {currentUser && (
              <button
                onClick={() => setActiveTab('my-posts')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'my-posts'
                    ? 'bg-[#113E21] text-[#FAF6EE] shadow-2xs'
                    : 'text-[#43634E] hover:text-[#113E21]'
                }`}
              >
                <span>My Notes</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'my-posts' ? 'bg-[#FAF6EE] text-[#113E21]' : 'bg-[#E2ECD5] text-[#113E21]'
                }`}>
                  {myPostsCount}
                </span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6C9352]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search herbs or notes..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#DDD6C3] text-[#113E21] outline-none focus:border-[#113E21] w-40 sm:w-48 transition-all"
            />
          </div>
        </div>

        {/* Right: Main "Share Community Post" Button */}
        <div>
          <button
            onClick={handleOpenComposer}
            className="w-full sm:w-auto herbora-btn-primary py-2.5 px-5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {showComposer && currentUser ? (
              <>
                <X className="w-4 h-4" />
                <span>Close Composer</span>
              </>
            ) : (
              <>
                <Sprout className="w-4 h-4 text-[#8FA77B]" />
                <span>Share Community Post</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Post Composer (Opens when logged in user clicks Share Community Post) */}
      {showComposer && currentUser && (
        <div className="mb-8 p-6 rounded-3xl bg-[#FFFDF8] border-2 border-[#6C9352]/60 shadow-md space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD6C3]/70">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#4E8738]" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#113E21]">
                Share Your Herbal Story
              </h2>
            </div>
            <button
              onClick={() => setShowComposer(false)}
              className="p-1 rounded-lg text-[#43634E] hover:text-[#113E21] hover:bg-[#FAF6EE] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {postError && (
            <div className="p-3 rounded-xl bg-[#FDF2F0] border border-[#F4C7C3] text-xs text-[#A82C2C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{postError}</span>
            </div>
          )}

          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#113E21] uppercase tracking-wider mb-1">
                  Your Name / Contributor Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full text-sm h-11 px-3.5 rounded-xl bg-white border border-[#DDD6C3] text-[#113E21] outline-none focus:border-[#113E21] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#113E21] uppercase tracking-wider mb-1">
                  Plant or Herb Name
                </label>
                <input
                  type="text"
                  required
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  placeholder="e.g. Tulsi, Ashwagandha, Neem, Brahmi"
                  className="w-full text-sm h-11 px-3.5 rounded-xl bg-white border border-[#DDD6C3] text-[#113E21] outline-none focus:border-[#113E21] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#113E21] uppercase tracking-wider mb-1">
                Your Story, Observation, or Traditional Recipe
              </label>
              <textarea
                required
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Share how you grow it, seasonal care tips, soil mix, or how you prepare daily teas and remedies..."
                className="w-full text-sm p-3.5 rounded-xl bg-white border border-[#DDD6C3] text-[#113E21] outline-none focus:border-[#113E21] resize-none transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="px-4 py-2.5 rounded-xl border border-[#DDD6C3] text-xs font-semibold text-[#43634E] hover:bg-[#FAF6EE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPost || !note.trim() || !plantName.trim()}
                className="herbora-btn-primary py-2.5 px-6 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submittingPost ? 'Publishing...' : 'Publish to Community'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed List */}
      <div className="space-y-5">
        {loadingPosts ? (
          <div className="p-12 text-center text-[#43634E] space-y-3">
            <Sprout className="w-8 h-8 text-[#4E8738] mx-auto animate-pulse" />
            <p className="text-sm">Gathering community wisdom & notes...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="herbora-card p-10 bg-[#FFFDF8] border border-[#DDD6C3] rounded-3xl text-center space-y-3">
            <Sprout className="w-10 h-10 text-[#4E8738] mx-auto opacity-70" />
            <h3 className="font-serif text-xl font-bold text-[#113E21]">
              {activeTab === 'my-posts' 
                ? "You haven't posted any notes yet" 
                : searchQuery 
                ? "No community stories matched your search"
                : "No community notes yet"}
            </h3>
            <p className="text-xs sm:text-sm text-[#43634E] max-w-md mx-auto">
              {activeTab === 'my-posts'
                ? 'Click "Share Community Post" above to document your botanical observations!'
                : searchQuery
                ? 'Try searching with a different herb name or clear the search filter.'
                : 'Be the first to share your plant experience and inspire other herbalists!'}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isOwner = isPostOwner(post);
            const isEditing = editingPostId === post.id;
            const isDeleting = deletingPostId === post.id;
            const isLiked = likedPostIds.has(post.id);
            const isCommentsOpen = !!expandedComments[post.id];
            const postComments = post.comments || [];
            const commentsCount = typeof post.comments_count === 'number' ? post.comments_count : postComments.length;

            return (
              <article
                key={post.id}
                className="herbora-card p-5 sm:p-6 bg-[#FFFDF8] border border-[#DDD6C3] rounded-3xl space-y-4 transition-all hover:border-[#6C9352]/70 shadow-xs"
              >
                {/* Post Header: Contributor & Controls */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#113E21] text-[#FAF6EE] flex items-center justify-center font-bold text-sm shadow-2xs">
                      {post.author_name ? post.author_name[0].toUpperCase() : 'B'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-[#113E21]">
                          {post.author_name}
                        </span>
                        {isOwner && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E2ECD5] text-[#113E21]">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#4E8738]">
                        <span className="font-semibold">{post.plant_name}</span>
                        <span className="text-[#DDD6C3]">•</span>
                        <span className="text-[#43634E] text-[11px]">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Post Owner */}
                  {isOwner && !isEditing && !isDeleting && (
                    <div className="flex items-center gap-1 border border-[#DDD6C3]/80 rounded-xl p-1 bg-[#FAF6EE]/50">
                      <button
                        onClick={() => handleStartEdit(post)}
                        title="Edit note"
                        className="p-1.5 rounded-lg text-[#43634E] hover:text-[#113E21] hover:bg-white transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartDelete(post.id)}
                        title="Delete note"
                        className="p-1.5 rounded-lg text-[#A82C2C] hover:bg-[#FDF2F0] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline Delete Confirmation */}
                {isDeleting && (
                  <div className="p-3.5 rounded-2xl bg-[#FDF2F0] border border-[#F4C7C3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#A82C2C] font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Delete this community story permanently?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfirmDelete(post.id)}
                        disabled={deleteLoading}
                        className="px-3.5 py-1.5 rounded-xl bg-[#C0392B] hover:bg-[#A82C2C] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        disabled={deleteLoading}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-[#DDD6C3] text-[#43634E] text-xs font-medium hover:bg-[#FAF6EE] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Post Body (Edit Mode or Normal View) */}
                {isEditing ? (
                  <div className="space-y-3 pt-2 border-t border-[#DDD6C3]">
                    {editError && (
                      <div className="text-xs text-[#A82C2C] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{editError}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4E8738] mb-1">
                        Herb / Plant Name
                      </label>
                      <input
                        type="text"
                        value={editPlantName}
                        onChange={(e) => setEditPlantName(e.target.value)}
                        className="w-full text-xs sm:text-sm h-10 px-3 rounded-xl bg-white border border-[#DDD6C3] text-[#113E21] outline-none focus:border-[#113E21]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4E8738] mb-1">
                        Observation / Story
                      </label>
                      <textarea
                        rows={3}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        className="w-full text-xs sm:text-sm p-3 rounded-xl bg-white border border-[#DDD6C3] text-[#113E21] outline-none focus:border-[#113E21] resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        disabled={editLoading || !editNote.trim()}
                        className="herbora-btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{editLoading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={editLoading}
                        className="py-1.5 px-3.5 rounded-xl bg-white border border-[#DDD6C3] text-[#43634E] hover:bg-[#FAF6EE] text-xs font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-[#1C3625] leading-relaxed whitespace-pre-line pl-1 sm:pl-13">
                    {post.note}
                  </p>
                )}

                {/* Footer Reactions & Comment Toggle Bar */}
                <div className="pl-1 sm:pl-13 pt-3 border-t border-[#DDD6C3]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    {/* Like button (single-like only) */}
                    <button
                      onClick={() => handleLike(post.id)}
                      disabled={isLiked}
                      title={isLiked ? "You've already liked this note" : "Like this note"}
                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-[#FDF2F0] border-[#F4C7C3] text-[#C0392B] font-semibold cursor-default'
                          : 'bg-white border-[#DDD6C3] text-[#43634E] hover:border-[#4E8738] hover:text-[#113E21] hover:bg-[#FAF6EE]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 transition-transform ${isLiked ? 'fill-current text-[#C0392B] scale-110' : ''}`} />
                      <span>{post.likes_count || 0}</span>
                      <span className="hidden sm:inline text-[11px] font-normal">
                        {isLiked ? 'Liked' : (post.likes_count === 1 ? 'like' : 'likes')}
                      </span>
                    </button>

                    {/* Comment section accordion toggle */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border transition-all cursor-pointer ${
                        isCommentsOpen
                          ? 'bg-[#E2ECD5] border-[#BBDDC3] text-[#113E21] font-semibold'
                          : 'bg-white border-[#DDD6C3] text-[#43634E] hover:border-[#4E8738] hover:text-[#113E21] hover:bg-[#FAF6EE]'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#4E8738]" />
                      <span>{commentsCount}</span>
                      <span className="text-[11px] font-normal">
                        {commentsCount === 1 ? 'comment' : 'comments'}
                      </span>
                      {isCommentsOpen ? (
                        <ChevronUp className="w-3 h-3 text-[#113E21]" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-[#43634E]" />
                      )}
                    </button>
                  </div>

                  <span className="text-[11px] text-[#6C9352] italic">
                    Ayurvedic Community Wisdom
                  </span>
                </div>

                {/* Comment Section (Collapsible Drawer) */}
                {isCommentsOpen && (
                  <div className="pl-1 sm:pl-13 pt-4 border-t border-[#DDD6C3]/40 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#113E21]">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#4E8738]" />
                        <span>Discussion & Replies ({postComments.length})</span>
                      </span>
                    </div>

                    {/* Existing Comments List */}
                    <div className="space-y-3">
                      {postComments.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-[#FAF6EE]/80 border border-[#DDD6C3]/70 text-center text-xs text-[#43634E]">
                          No comments yet. Share your experience or questions with this grower!
                        </div>
                      ) : (
                        postComments.map((comment) => {
                          const isCommentOwner = currentUser && (
                            (comment.user_id && comment.user_id === currentUser.id) ||
                            (!comment.user_id && comment.author_name === (currentUser.user_metadata?.full_name || currentUser.name || currentUser.email?.split('@')[0]))
                          );

                          return (
                            <div
                              key={comment.id}
                              className="p-3.5 rounded-2xl bg-[#FAF6EE]/70 border border-[#DDD6C3]/60 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-[#1C542E] text-[#FAF6EE] flex items-center justify-center font-bold text-[10px]">
                                    {comment.author_name ? comment.author_name[0].toUpperCase() : 'H'}
                                  </div>
                                  <span className="text-xs font-bold text-[#113E21]">
                                    {comment.author_name}
                                  </span>
                                  {isCommentOwner && (
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#E2ECD5] text-[#113E21]">
                                      You
                                    </span>
                                  )}
                                  <span className="text-[10px] text-[#43634E]">
                                    {comment.created_at ? new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'}
                                  </span>
                                </div>

                                {isCommentOwner && (
                                  <button
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                    title="Delete comment"
                                    className="text-[#A82C2C] hover:opacity-75 p-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-[#1C3625] leading-relaxed pl-8">
                                {comment.content}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Comment Input Bar */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCommentSubmit(post.id);
                            }
                          }}
                          placeholder={
                            currentUser
                              ? `Add a comment as ${currentUser.user_metadata?.full_name || currentUser.name || currentUser.email?.split('@')[0]}...`
                              : 'Log in to join the conversation...'
                          }
                          className="flex-1 text-xs h-10 px-3.5 rounded-xl bg-white border border-[#DDD6C3] text-[#113E21] outline-none focus:border-[#113E21] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleCommentSubmit(post.id)}
                          disabled={submittingComment[post.id] || (currentUser && !(commentInputs[post.id] || '').trim())}
                          className="herbora-btn-primary h-10 px-3.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {submittingComment[post.id] ? 'Posting...' : 'Post'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
