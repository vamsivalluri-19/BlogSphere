import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import BlogCard from '../components/BlogCard';
import { BlogGridSkeleton } from '../components/Skeleton';
import { Search, ChevronLeft, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';

const CATEGORIES = ['All', 'Technology', 'Design', 'Development', 'Business', 'Lifestyle'];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();
  const { user } = useContext(AuthContext);

  // Parse queries from URL search parameters
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || 'All';
  const pageQuery = parseInt(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    // Keep input in sync with URL queries (e.g. if category changes or page changes)
    setSearchInput(searchQuery);
    fetchPosts();
  }, [searchQuery, categoryQuery, pageQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pageQuery,
        limit: 6,
        status: 'Published',
      };

      if (searchQuery) params.search = searchQuery;
      if (categoryQuery && categoryQuery !== 'All') params.category = categoryQuery;

      const { data } = await api.get('/posts', { params });
      setPosts(data.posts);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
      showToast('Error loading blog posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (searchInput) {
        prev.set('search', searchInput);
      } else {
        prev.delete('search');
      }
      prev.set('page', '1'); // Reset to first page
      return prev;
    });
  };

  const handleCategoryClick = (category) => {
    setSearchParams((prev) => {
      if (category === 'All') {
        prev.delete('category');
      } else {
        prev.set('category', category);
      }
      prev.set('page', '1'); // Reset to first page
      return prev;
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Premium Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 text-white py-20 px-8 md:px-12 text-center shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(86,121,149,0.3),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/70 to-slate-900 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-brand-500/30 inline-block">
            Welcome to BlogSphere
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Share Your Stories, <br />
            <span className="text-brand-400 bg-gradient-to-r from-brand-400 to-indigo-300 bg-clip-text text-transparent">Connect with Minds.</span>
          </h1>
          <p className="text-lg text-slate-205 max-w-xl mx-auto font-medium">
            Explore articles on design, technology, development, and lifestyle written by creators around the world.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto pt-4">
            <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-brand-500 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search blogs, tags, authors..."
                className="bg-transparent border-0 focus:outline-none focus:ring-0 text-white w-full px-3 py-2 text-sm placeholder-slate-400"
              />
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Categories Horizontal Tabs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-500" /> Explore Categories
          </h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                categoryQuery === cat
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="space-y-6">
        {loading ? (
          <BlogGridSkeleton count={6} />
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  onClick={() => handlePageChange(pageQuery - 1)}
                  disabled={pageQuery === 1}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-50 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, index) => {
                  const p = index + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        pageQuery === p
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                          : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pageQuery + 1)}
                  disabled={pageQuery === totalPages}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-50 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 flex items-center justify-center rounded-full mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">No Posts Found</h3>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              We couldn't find any published blogs matching your category or search terms. Try searching for something else or browse different categories!
            </p>
            <div className="pt-2">
              <Link
                to={user ? "/create-post" : "/login"}
                className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/15 hover:scale-103"
              >
                Write a Post
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
