import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import {
  Users,
  FileText,
  MessageSquare,
  Activity,
  Trash2,
  Eye,
  Search,
  AlertTriangle,
  UserX,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  const [usersList, setUsersList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [commentsList, setCommentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search filter inputs
  const [searchUser, setSearchUser] = useState('');
  const [searchPost, setSearchPost] = useState('');
  const [searchComment, setSearchComment] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    fetchAdminDashboardData();
  }, [activeTab]);

  const fetchAdminDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.stats);
        setChartData(data.analyticsData);
      } else if (activeTab === 'users') {
        const { data } = await api.get('/admin/users');
        setUsersList(data);
      } else if (activeTab === 'posts') {
        const { data } = await api.get('/admin/posts');
        setPostsList(data);
      } else if (activeTab === 'comments') {
        const { data } = await api.get('/admin/comments');
        setCommentsList(data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading administrative data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (id === user._id) {
      showToast('You cannot delete yourself!', 'error');
      return;
    }
    if (!window.confirm(`Are you absolutely sure you want to delete user "${name}"? This will delete all of their written articles and comments as well.`)) return;

    try {
      await api.delete(`/admin/user/${id}`);
      showToast(`User "${name}" deleted successfully`, 'success');
      setUsersList((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      showToast('Failed to delete user', 'error');
    }
  };

  const handleDeletePost = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete article "${title}"?`)) return;

    try {
      await api.delete(`/admin/post/${id}`);
      showToast(`Article "${title}" deleted`, 'success');
      setPostsList((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      showToast('Failed to delete article', 'error');
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/admin/comment/${id}`);
      showToast('Comment deleted', 'success');
      setCommentsList((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      showToast('Failed to delete comment', 'error');
    }
  };

  // Local table filters
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredPosts = postsList.filter(
    (p) =>
      p.title.toLowerCase().includes(searchPost.toLowerCase()) ||
      p.category.toLowerCase().includes(searchPost.toLowerCase()) ||
      p.author?.name?.toLowerCase().includes(searchPost.toLowerCase())
  );

  const filteredComments = commentsList.filter(
    (c) =>
      c.content.toLowerCase().includes(searchComment.toLowerCase()) ||
      c.author?.name?.toLowerCase().includes(searchComment.toLowerCase()) ||
      c.post?.title?.toLowerCase().includes(searchComment.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-red-500 text-white p-2 rounded-xl shadow-md">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Admin Moderation</h1>
          <p className="text-sm text-slate-700 dark:text-slate-355">
            Monitor platform metrics, manage registered users, posts, and comments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar Panel */}
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === 'overview'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/15'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4.5 h-4.5" /> Analytics Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === 'users'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/15'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4.5 h-4.5" /> Manage Users
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === 'posts'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/15'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4.5 h-4.5" /> Moderated Posts
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === 'comments'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/15'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5" /> Manage Comments
            </button>
          </div>
        </div>

        {/* Tab Sub-Panes */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="glass-card rounded-2xl p-12 text-center animate-pulse">
              <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-800 rounded mx-auto mb-4"></div>
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Tab 1: Overview & Analytics */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-5 rounded-2xl border border-slate-200/40 text-center">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Total Users</p>
                      <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.totalUsers}</h4>
                    </div>
                    <div className="glass-card p-5 rounded-2xl border border-slate-200/40 text-center">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Total Posts</p>
                      <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.totalPosts}</h4>
                    </div>
                    <div className="glass-card p-5 rounded-2xl border border-slate-200/40 text-center">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Total Comments</p>
                      <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.totalComments}</h4>
                    </div>
                    <div className="glass-card p-5 rounded-2xl border border-slate-200/40 text-center">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Active Authors</p>
                      <h4 className="text-3xl font-black text-red-500 mt-1">{stats.totalActiveUsers}</h4>
                    </div>
                  </div>

                  {/* Recharts Analytics Graph */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Growth Statistics (Last 6 Months)</h3>
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                          <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', background: 'rgba(255,255,255,0.9)', color: '#1E293B', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                          <Area type="monotone" dataKey="Users" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                          <Area type="monotone" dataKey="Posts" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPosts)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Manage Users */}
              {activeTab === 'users' && (
                <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Manage Registered Users</h3>
                    
                    {/* Search filter */}
                    <div className="relative w-full sm:w-64">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="search"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        placeholder="Search name or email..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-150 dark:border-slate-800/80">
                          <tr>
                            <th className="px-6 py-3.5">User</th>
                            <th className="px-6 py-3.5">Email</th>
                            <th className="px-6 py-3.5">Role</th>
                            <th className="px-6 py-3.5">Registered Date</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {filteredUsers.map((u) => (
                            <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                <img
                                  src={getImageUrl(u.avatar, 'avatar')}
                                  alt={u.name}
                                  className="w-7 h-7 rounded-full object-cover"
                                  onError={(e) => handleImageError(e, 'avatar')}
                                />
                                <span className="truncate max-w-[150px]">{u.name}</span>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{u.email}</td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                                  u.role === 'admin'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {u._id !== user._id ? (
                                  <button
                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-450 transition-colors"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-600 font-semibold px-2">Self</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-450 dark:text-slate-500 italic text-sm">
                      No users found.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Moderated Posts */}
              {activeTab === 'posts' && (
                <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Moderatabe Blog Posts</h3>
                    
                    {/* Search filter */}
                    <div className="relative w-full sm:w-64">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="search"
                        value={searchPost}
                        onChange={(e) => setSearchPost(e.target.value)}
                        placeholder="Search title, category, author..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {filteredPosts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-150 dark:border-slate-800/80">
                          <tr>
                            <th className="px-6 py-3.5">Title</th>
                            <th className="px-6 py-3.5">Author</th>
                            <th className="px-6 py-3.5">Category</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {filteredPosts.map((post) => (
                            <tr key={post._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                                <Link to={`/blog/${post.slug}`} className="hover:text-red-500">
                                  {post.title}
                                </Link>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                {post.author ? post.author.name : 'Unknown'}
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{post.category}</td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                                  post.status === 'Published'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                                }`}>
                                  {post.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="inline-flex gap-1.5">
                                  <Link
                                    to={`/blog/${post.slug}`}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-450 transition-colors"
                                    title="View Post"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    onClick={() => handleDeletePost(post._id, post.title)}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-450 transition-colors"
                                    title="Delete Post"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-600 dark:text-slate-400 italic text-sm">
                      No blog posts found.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Manage Comments */}
              {activeTab === 'comments' && (
                <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Manage Comments</h3>
                    
                    {/* Search filter */}
                    <div className="relative w-full sm:w-64">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="search"
                        value={searchComment}
                        onChange={(e) => setSearchComment(e.target.value)}
                        placeholder="Search content or author..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {filteredComments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-150 dark:border-slate-800/80">
                          <tr>
                            <th className="px-6 py-3.5">Comment</th>
                            <th className="px-6 py-3.5">Author</th>
                            <th className="px-6 py-3.5">On Article</th>
                            <th className="px-6 py-3.5">Posted Date</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {filteredComments.map((comment) => (
                            <tr key={comment._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                              <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                                {comment.content}
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                                {comment.author ? comment.author.name : 'Unknown'}
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400 max-w-[120px] truncate">
                                {comment.post ? (
                                  <Link to={`/blog/${comment.post.slug}`} className="hover:underline text-red-500">
                                    {comment.post.title}
                                  </Link>
                                ) : (
                                  'Deleted Post'
                                )}
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-450 transition-colors"
                                  title="Delete Comment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-600 dark:text-slate-400 italic text-sm">
                      No comments found.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
