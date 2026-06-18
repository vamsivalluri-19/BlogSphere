import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import CommentsSection from '../components/CommentsSection';
import { PostDetailSkeleton } from '../components/Skeleton';
import {
  Heart,
  Bookmark,
  Share2,
  Calendar,
  Clock,
  ArrowLeft,
  Link2,
  Check,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { getImageUrl, handleImageError } from '../utils/imageHelper';

const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const { user, toggleBookmark, toggleFollowing } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPostAndRelated();
  }, [slug]);

  const fetchPostAndRelated = async () => {
    setLoading(true);
    try {
      // Fetch post by ID or Slug
      const { data } = await api.get(`/posts/${slug}`);
      setPost(data);
      setLikesCount(data.likes.length);
      
      if (user) {
        setIsLiked(data.likes.includes(user._id));
      }

      // Fetch related posts (same category, exclude current post)
      const relatedRes = await api.get('/posts', {
        params: {
          category: data.category,
          limit: 3,
        },
      });
      const filteredRelated = relatedRes.data.posts.filter((p) => p._id !== data._id);
      setRelatedPosts(filteredRelated);
    } catch (err) {
      console.error(err);
      showToast('Error loading blog post details', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      showToast('Please login to like this post', 'info');
      return;
    }

    try {
      const { data } = await api.post(`/posts/like/${post._id}`);
      setIsLiked(data.liked);
      setLikesCount(data.likesCount);
      showToast(data.message, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error liking post', 'error');
    }
  };

  const handleBookmarkClick = async () => {
    if (!user) {
      showToast('Please login to bookmark this post', 'info');
      return;
    }

    try {
      const { data } = await api.post(`/users/bookmark/${post._id}`);
      toggleBookmark(post._id);
      showToast(data.message, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error bookmarking post', 'error');
    }
  };

  const handleFollowClick = async () => {
    if (!user) {
      showToast('Please login to follow authors', 'info');
      return;
    }

    try {
      const { data } = await api.post(`/users/follow/${post.author._id}`);
      toggleFollowing(post.author._id);
      showToast(data.message, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error performing follow action', 'error');
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const isBookmarked = user && user.bookmarks.includes(post?._id);
  const isFollowingAuthor = user && user.following.includes(post?.author._id);

  // Calculate reading time roughly
  const getReadingTime = (text) => {
    const wordsPerMinute = 225;
    const words = text ? text.trim().split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-700 dark:text-slate-300">Post not found.</p>
        <Link to="/" className="text-brand-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const postImage = getImageUrl(post.featuredImage, 'post');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back Button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to explore
        </Link>
      </div>

      {/* Title & Metadata */}
      <div className="space-y-4">
        <span className="bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-brand-500/20">
          {post.category}
        </span>
        
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
          {/* Author info */}
          <div className="flex items-center gap-3">
            <img
              src={getImageUrl(post.author.avatar, 'avatar')}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-brand-500/30"
              onError={(e) => handleImageError(e, 'avatar')}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {post.author.name}
                </span>
                
                {/* Follow Button */}
                {user && user._id !== post.author._id && (
                  <button
                    onClick={handleFollowClick}
                    className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full border transition-colors ${
                      isFollowingAuthor
                        ? 'border-slate-350 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        : 'border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white'
                    }`}
                  >
                    {isFollowingAuthor ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" /> Follow
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formattedDate}</span>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-700"></span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {getReadingTime(post.content)}</span>
              </div>
            </div>
          </div>

          {/* Social share & Bookmarks */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-bold border transition-colors ${
                isLiked
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={handleBookmarkClick}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Bookmark post"
            >
              <Bookmark className={`w-4.5 h-4.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share dropdown */}
            <div className="relative">
              <button
                onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Share post"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>

              {shareDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShareDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-44 rounded-xl glass border border-white/20 dark:border-slate-800 shadow-xl py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this post: ${post.title}`)}&url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      onClick={() => setShareDropdownOpen(false)}
                    >
                      <TwitterIcon className="w-4 h-4 text-sky-400" />
                      Twitter / X
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      onClick={() => setShareDropdownOpen(false)}
                    >
                      <FacebookIcon className="w-4 h-4 text-blue-600" />
                      Facebook
                    </a>
                    <button
                      onClick={() => {
                        handleCopyLink();
                        setShareDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-left"
                    >
                      {linkCopied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Link2 className="w-4 h-4 text-slate-500" />
                      )}
                      Copy URL
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Cover Image */}
      <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-150 dark:bg-slate-900 shadow-lg">
        <img
          src={postImage}
          alt={post.title}
          className="w-full h-full object-cover"
          onError={(e) => handleImageError(e, 'post')}
        />
      </div>

      {/* Article Content */}
      <article className="prose dark:prose-invert max-w-none pt-4">
        <MarkdownRenderer content={post.content} />
      </article>

      {/* Tags section */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-6 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-850"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Box Bio */}
      <div className="p-6 rounded-2xl glass border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left mt-10">
        <img
          src={getImageUrl(post.author.avatar, 'avatar')}
          alt={post.author.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-brand-500/20"
          onError={(e) => handleImageError(e, 'avatar')}
        />
        <div className="space-y-2 flex-grow">
          <h4 className="font-extrabold text-slate-950 dark:text-white">Written by {post.author.name}</h4>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {post.author.bio || 'This author has not written a bio yet. Stay tuned for more articles!'}
          </p>
        </div>
      </div>

      {/* Comments Section */}
      <section className="pt-10">
        <CommentsSection postId={post._id} />
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-slate-200 dark:border-slate-800/80">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <article key={related._id} className="glass-card rounded-xl overflow-hidden hover:shadow-lg transition-all group hover:-translate-y-0.5">
                <Link to={`/blog/${related.slug}`} className="block aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <img
                    src={getImageUrl(related.featuredImage, 'post')}
                    alt={related.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    onError={(e) => handleImageError(e, 'post')}
                  />
                </Link>
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">{related.category}</span>
                  <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-brand-500 transition-colors">
                    <Link to={`/blog/${related.slug}`}>{related.title}</Link>
                  </h4>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetail;
