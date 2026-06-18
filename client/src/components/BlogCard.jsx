import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Heart, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { getImageUrl, handleImageError } from '../utils/imageHelper';

const BlogCard = ({ post, onBookmarkToggle }) => {
  const { user, toggleBookmark } = useContext(AuthContext);

  const isBookmarked = user && user.bookmarks.includes(post._id);
  const likesCount = post.likes ? post.likes.length : 0;

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      await api.post(`/users/bookmark/${post._id}`);
      toggleBookmark(post._id);
      if (onBookmarkToggle) onBookmarkToggle(post._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate reading time roughly
  const getReadingTime = (text) => {
    const wordsPerMinute = 225;
    const words = text ? text.trim().split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const coverImage = getImageUrl(post.featuredImage, 'post');

  return (
    <article className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
      {/* Featured Image */}
      <Link to={`/blog/${post.slug}`} className="relative block overflow-hidden aspect-video bg-slate-100 dark:bg-slate-900">
        <img
          src={coverImage}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => handleImageError(e, 'post')}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-brand-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md">
            {post.category}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Date & Reading Time */}
        <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200 mb-2.5">
          <span>{formattedDate}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {getReadingTime(post.content)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-brand-500 transition-colors line-clamp-2">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-slate-800 dark:text-slate-200 mb-4 line-clamp-3 flex-grow">
          {post.excerpt}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer info (Author & likes/bookmarks) */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-auto">
          {/* Author */}
          <div className="flex items-center gap-2">
            <img
              src={getImageUrl(post.author.avatar, 'avatar')}
              alt={post.author.name}
              className="w-7 h-7 rounded-full object-cover"
              onError={(e) => handleImageError(e, 'avatar')}
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
              {post.author.name}
            </span>
          </div>

          {/* Likes & Bookmarks */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
              <Heart className="w-4 h-4" />
              <span className="text-xs">{likesCount}</span>
            </div>
            
            {user && (
              <button
                onClick={handleBookmark}
                className={`p-1.5 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'text-brand-500 bg-brand-50 dark:bg-brand-950/40'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                aria-label="Bookmark post"
              >
                <Bookmark className="w-4.5 h-4.5 fill-current" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
