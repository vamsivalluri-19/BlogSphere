import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import { Save, FileText, Upload, Image as ImageIcon, Eye, Edit3, Plus, X } from 'lucide-react';

const CATEGORIES = ['Technology', 'Design', 'Development', 'Business', 'Lifestyle'];

const CreateEditPost = () => {
  const { id } = useParams(); // If ID is present, we are in edit mode
  const isEditMode = !!id;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('Draft');
  const [featuredImage, setFeaturedImage] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'

  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditMode) {
      fetchPostDetails();
    }
  }, [id]);

  const fetchPostDetails = async () => {
    try {
      const { data } = await api.get(`/posts/${id}`);
      // Verify ownership
      if (data.author._id !== user._id && user.role !== 'admin') {
        showToast('You are not authorized to edit this post', 'error');
        navigate('/');
        return;
      }
      
      setTitle(data.title);
      setContent(data.content);
      setExcerpt(data.excerpt);
      setCategory(data.category);
      setTags(data.tags.join(', '));
      setStatus(data.status);
      setFeaturedImage(data.featuredImage);
    } catch (err) {
      console.error(err);
      showToast('Error loading post details for editing', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await api.post('/posts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFeaturedImage(data.url);
      showToast('Cover image uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error uploading cover image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFeaturedImage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !excerpt || !category) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title,
        content,
        excerpt,
        category,
        tags,
        status,
        featuredImage,
      };

      if (isEditMode) {
        await api.put(`/posts/${id}`, postData);
        showToast('Blog post updated successfully!', 'success');
      } else {
        await api.post('/posts', postData);
        showToast('Blog post created successfully!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error saving blog post', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Article' : 'Create New Article'}
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Write using markdown format to structure your blog beautifully.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-400 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-brand-500/10 flex items-center gap-1.5 transition-all hover:scale-102"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? 'Update Post' : 'Save Article'}
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Title */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your article a catchy, memorable title..."
              className="w-full text-lg p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Excerpt / Brief Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a brief, engaging 2-3 sentence summary that will display in cards..."
              className="w-full text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
              rows={3}
              maxLength={300}
            />
            <span className="text-[10px] text-slate-600 dark:text-slate-400 flex justify-end mt-1">
              {excerpt.length}/300 characters
            </span>
          </div>

          {/* Markdown Content (Write/Preview Tabs) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Article Content (Markdown) <span className="text-red-500">*</span>
              </label>
              
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    activeTab === 'write'
                      ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
            </div>

            {activeTab === 'write' ? (
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Compose your article body. You can use **bold**, *italics*, # headers, - lists, `code`, and image links..."
                className="w-full text-sm p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-slate-800 dark:text-slate-200 min-h-[400px]"
                rows={15}
              />
            ) : (
              <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 min-h-[400px]">
                {content.trim() ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-12 italic">
                    Nothing to preview. Go ahead and start typing in the Write tab!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Configuration Panel */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-5">
            <h3 className="font-extrabold text-slate-950 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-800">
              Publishing Options
            </h3>

            {/* Status Option */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Save Status
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatus('Draft')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex justify-center items-center gap-1 ${
                    status === 'Draft'
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Published')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex justify-center items-center gap-1 ${
                    status === 'Published'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Publish
                </button>
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200 font-semibold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Comma-separated Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tech, tutorial, coding"
                className="w-full text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Featured Cover Image
              </label>

              {featuredImage ? (
                <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-855 group">
                  <img
                    src={getImageUrl(featuredImage, 'post')}
                    alt="Uploaded cover"
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(e, 'post')}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow shadow-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 transition-colors rounded-xl p-5 text-center cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={uploading}
                  />
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Upload className="w-6 h-6 text-brand-500" />
                    )}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {uploading ? 'Uploading Cover...' : 'Upload cover (JPEG, PNG)'}
                    </span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">Max size 5MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEditPost;
