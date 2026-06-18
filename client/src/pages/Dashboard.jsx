import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import {
  FileText,
  User as UserIcon,
  Bookmark,
  Users,
  Settings,
  Plus,
  Edit,
  Trash,
  CheckCircle,
  Eye,
  Key,
  Shield,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const { user, updateProfile, logout, toggleBookmark, toggleFollowing } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [myPosts, setMyPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user profile (which populates bookmarks and following)
      const profileRes = await api.get('/users/profile');
      setBookmarkedPosts(profileRes.data.bookmarks || []);
      setFollowedAuthors(profileRes.data.following || []);

      // Fetch posts written by current user (both Published and Draft)
      const postsRes = await api.get('/posts', {
        params: {
          author: user._id,
          status: 'All', // Fetch all statuses
        },
      });
      // Filter out posts that belong to user (or backend will return them)
      setMyPosts(postsRes.data.posts);
    } catch (err) {
      console.error(err);
      showToast('Error fetching dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileName,
        bio: profileBio,
        avatar: profileAvatar,
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error updating profile settings', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error changing password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;

    try {
      await api.delete(`/posts/${id}`);
      showToast('Article deleted successfully!', 'success');
      setMyPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      showToast('Failed to delete article', 'error');
    }
  };

  const handleTogglePostStatus = async (post) => {
    const nextStatus = post.status === 'Draft' ? 'Published' : 'Draft';
    try {
      const { data } = await api.put(`/posts/${post._id}`, { status: nextStatus });
      showToast(`Article status updated to ${nextStatus}!`, 'success');
      setMyPosts((prev) => prev.map((p) => (p._id === post._id ? { ...p, status: data.status } : p)));
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle article status', 'error');
    }
  };

  const handleRemoveBookmark = async (id) => {
    try {
      await api.post(`/users/bookmark/${id}`);
      toggleBookmark(id);
      setBookmarkedPosts((prev) => prev.filter((p) => p._id !== id));
      showToast('Removed from bookmarks', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfollowAuthor = async (id) => {
    try {
      await api.post(`/users/follow/${id}`);
      toggleFollowing(id);
      setFollowedAuthors((prev) => prev.filter((a) => a._id !== id));
      showToast('Author unfollowed', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics calculations
  const totalPostsCount = myPosts.length;
  const publishedCount = myPosts.filter((p) => p.status === 'Published').length;
  const draftCount = myPosts.filter((p) => p.status === 'Draft').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">My Dashboard</h1>
          <p className="text-sm text-slate-700 dark:text-slate-350">
            Manage your articles, read history, bookmarks, and account setup.
          </p>
        </div>
        
        <Link
          to="/create-post"
          className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-1.5 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" /> Create Article
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar Panel */}
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === 'overview'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4.5 h-4.5" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === 'posts'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4.5 h-4.5" /> My Articles ({totalPostsCount})
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === 'bookmarks'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Bookmark className="w-4.5 h-4.5" /> Saved Bookmarks ({bookmarkedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === 'following'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4.5 h-4.5" /> Following Authors ({followedAuthors.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === 'settings'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4.5 h-4.5" /> Account Settings
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
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Metrics Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card p-5 rounded-2xl border border-slate-200/40 text-center">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Total Posts</p>
                      <h4 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalPostsCount}</h4>
                    </div>
                    <div className="glass-card p-5 rounded-2xl border border-slate-200/40 text-center">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-semibold">Published</p>
                      <h4 className="text-3xl font-black text-emerald-500 mt-1">{publishedCount}</h4>
                    </div>
                    <div className="glass-card p-5 rounded-2xl border border-slate-200/40 text-center">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-semibold">Drafts</p>
                      <h4 className="text-3xl font-black text-slate-500 mt-1">{draftCount}</h4>
                    </div>
                    <div className="glass-card p-5 rounded-2xl border border-slate-200/40 text-center">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest font-semibold font-semibold">Bookmarks</p>
                      <h4 className="text-3xl font-black text-brand-500 mt-1">{bookmarkedPosts.length}</h4>
                    </div>
                  </div>

                  {/* Profile Summary */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <img
                      src={getImageUrl(user.avatar, 'avatar')}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover border border-brand-500/20"
                      onError={(e) => handleImageError(e, 'avatar')}
                    />
                    <div className="space-y-2 text-center sm:text-left flex-grow">
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{user.name}</h3>
                        <span className="bg-brand-500/10 text-brand-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-500/20 capitalize">
                          {user.role} role
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-350">
                        {user.bio || 'You have not set a biography yet. Go to Settings to update your profile!'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: My Articles */}
              {activeTab === 'posts' && (
                <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Manage My Articles</h3>
                  </div>

                  {myPosts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-150 dark:border-slate-800/80">
                          <tr>
                            <th className="px-6 py-3.5">Title</th>
                            <th className="px-6 py-3.5">Category</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5">Created Date</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {myPosts.map((post) => (
                            <tr key={post._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                                <Link to={`/blog/${post.slug}`} className="hover:text-brand-500">
                                  {post.title}
                                </Link>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{post.category}</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleTogglePostStatus(post)}
                                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                                    post.status === 'Published'
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                  }`}
                                  title="Click to toggle status"
                                >
                                  {post.status}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="inline-flex gap-2">
                                  <Link
                                    to={`/edit-post/${post._id}`}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:text-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all"
                                    title="Edit article"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    onClick={() => handleDeletePost(post._id)}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all"
                                    title="Delete article"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
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
                      You haven't written any articles yet.{' '}
                      <Link to="/create-post" className="text-brand-500 font-bold hover:underline">
                        Write your first article now!
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Saved Bookmarks */}
              {activeTab === 'bookmarks' && (
                <div className="space-y-4">
                  <div className="px-1 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Bookmarked Stories</h3>
                  </div>

                  {bookmarkedPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookmarkedPosts.map((post) => (
                        <div key={post._id} className="glass-card rounded-xl p-4 border border-slate-200/50 dark:border-slate-850 flex items-start gap-3 justify-between">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">
                              {post.category}
                            </span>
                            <h4 className="font-bold text-slate-950 dark:text-white hover:text-brand-500 leading-tight">
                              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Added {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveBookmark(post._id)}
                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                            title="Remove Bookmark"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-8 italic">
                      You have not saved any bookmarks yet. Explore published articles and save them for reading later!
                    </p>
                  )}
                </div>
              )}

              {/* Tab 4: Following Authors */}
              {activeTab === 'following' && (
                <div className="space-y-4">
                  <div className="px-1 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Followed Authors</h3>
                  </div>

                  {followedAuthors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {followedAuthors.map((author) => (
                        <div key={author._id} className="glass-card rounded-xl p-4 border border-slate-200/50 dark:border-slate-850 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={getImageUrl(author.avatar, 'avatar')}
                              alt={author.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => handleImageError(e, 'avatar')}
                            />
                            <div>
                              <h4 className="font-bold text-slate-950 dark:text-white text-sm">{author.name}</h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{author.bio || 'Author has no bio'}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleUnfollowAuthor(author._id)}
                            className="border border-slate-200 dark:border-slate-800 hover:border-red-500 hover:text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Unfollow
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-8 italic">
                      You are not following any authors yet. Keep reading to discover authors you love!
                    </p>
                  )}
                </div>
              )}

              {/* Tab 5: Account Settings */}
              {activeTab === 'settings' && (
                <div className="space-y-8">
                  {/* Profile Information Edit Form */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-brand-500" /> Edit Profile Settings
                    </h3>

                    <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-850 dark:text-slate-200"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Avatar URL
                          </label>
                          <input
                            type="text"
                            value={profileAvatar}
                            onChange={(e) => setProfileAvatar(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                            className="w-full text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-850 dark:text-slate-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Short Biography
                        </label>
                        <textarea
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          placeholder="Tell us a little bit about yourself, your background, or topics you like writing about..."
                          className="w-full text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-850 dark:text-slate-200"
                          rows={3}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors"
                      >
                        {savingProfile ? 'Updating Profile...' : 'Save Profile Details'}
                      </button>
                    </form>
                  </div>

                  {/* Change Password Form */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Key className="w-5 h-5 text-brand-500" /> Change Account Password
                    </h3>

                    <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-850 dark:text-slate-200"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-850 dark:text-slate-200"
                            placeholder="Min 6 characters"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-850 dark:text-slate-200"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors"
                      >
                        {savingPassword ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
