import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getAssetUrl } from '../utils/api';
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Layers, 
  Calendar, 
  Github, 
  Linkedin, 
  Camera, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  FileCheck2,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const ProfilePage = () => {
  const { user, syncProfile, logout, API_URL } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    collegeName: '',
    branch: '',
    year: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    skills: '',
    certifications: '',
    interests: ''
  });

  // Sync form state when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        collegeName: user.collegeName || '',
        branch: user.branch || '',
        year: user.year || '1st Year',
        bio: user.bio || '',
        linkedinUrl: user.linkedinUrl || '',
        githubUrl: user.githubUrl || '',
        skills: user.skills ? user.skills.join(', ') : '',
        certifications: user.certifications ? user.certifications.join(', ') : '',
        interests: user.interests ? user.interests.join(', ') : ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file);

    setUploading(true);
    setSuccess('');
    setError('');

    try {
      await axios.post(`${API_URL}/profile/avatar`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Profile picture updated successfully!');
      await syncProfile();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Avatar upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await axios.put(`${API_URL}/profile`, formData);
      setSuccess('Profile updated successfully!');
      await syncProfile();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/profile`);
      alert('Your DevConnect account has been permanently deleted.');
      logout();
    } catch (err) {
      console.error("Account deletion failed:", err);
      alert(err.response?.data?.message || 'Error deleting account.');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Student Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-all"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-200 p-4 text-xs font-semibold text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50">
          <X className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Card: Avatar & Links summary */}
        <div className="glass rounded-3xl p-6 shadow-sm text-center space-y-6 self-start">
          <div className="relative mx-auto h-32 w-32 group">
            {user?.profilePicture ? (
              <img
                src={getAssetUrl(user.profilePicture)}
                alt={user.name}
                className="h-32 w-32 rounded-3xl object-cover ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
                }}
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-primary/10 text-primary text-5xl font-black dark:bg-primary/20 dark:text-primary-light">
                {user?.name?.charAt(0)}
              </div>
            )}
            
            {/* Avatar upload overlay input */}
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-3xl bg-slate-900/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
                className="hidden"
              />
              <Camera className="h-6 w-6 animate-pulse" />
            </label>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 italic max-w-xs mx-auto">
              "{user?.bio || 'No bio written yet. Click edit to write something about yourself.'}"
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-3.5">
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <Phone className="h-4.5 w-4.5 text-primary shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
            {user?.linkedinUrl && (
              <a 
                href={user.linkedinUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3 text-xs text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-light transition-colors"
              >
                <Linkedin className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                <span className="truncate">LinkedIn Profile</span>
              </a>
            )}
            {user?.githubUrl && (
              <a 
                href={user.githubUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3 text-xs text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary-light transition-colors"
              >
                <Github className="h-4.5 w-4.5 text-slate-800 dark:text-white shrink-0" />
                <span className="truncate">GitHub Profile</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Pane: Profile Details View or Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {!isEditing ? (
            <div className="space-y-6">
              
              {/* Personal details card */}
              <div className="glass rounded-3xl p-6 shadow-sm space-y-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Academic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4">
                    <BookOpen className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">College / University</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.collegeName || 'Not Set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4">
                    <Layers className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Branch / Course</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.branch || 'Not Set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4">
                    <Calendar className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Year of Study</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.year || 'Not Set'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional skills badge lists cards */}
              <div className="glass rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Skills */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.skills?.map((s, idx) => (
                      <span key={idx} className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary dark:bg-primary/20 dark:text-primary-light">
                        {s}
                      </span>
                    )) || <span className="text-xs text-slate-400">None declared</span>}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.certifications?.map((c, idx) => (
                      <span key={idx} className="rounded-lg bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary dark:bg-secondary/20 dark:text-secondary-light">
                        {c}
                      </span>
                    ))}
                    {(!user?.certifications || user.certifications.length === 0) && (
                      <span className="text-xs text-slate-400">None added</span>
                    )}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.interests?.map((i, idx) => (
                      <span key={idx} className="rounded-lg bg-accent/10 px-3 py-1 text-xs font-bold text-accent dark:bg-accent/20 dark:text-accent-light">
                        {i}
                      </span>
                    ))}
                    {(!user?.interests || user.interests.length === 0) && (
                      <span className="text-xs text-slate-400">None added</span>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bio / Status</label>
                <textarea
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell others about yourself..."
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">College Name</label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>Graduated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GitHub URL</label>
                  <input
                    type="text"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Skills (Comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Express, Git"
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Certifications (Comma-separated)</label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    placeholder="AWS Developer, Cisco CCNA"
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Interests (Comma-separated)</label>
                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="IoT, Machine Learning, WebRTC"
                    className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-3 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Save className="h-4.5 w-4.5" />
                    Save Profile Changes
                  </>
                )}
              </button>

            </form>
          )}

          {/* Danger Zone */}
          <div className="glass rounded-3xl border border-red-200/50 dark:border-red-900/30 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5 animate-pulse" />
              Danger Zone
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permanently delete your student profile and all associated data from the DevConnect ecosystem. This action is irreversible.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2.5 text-xs font-bold transition-all dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Delete Account
            </button>
          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-800 border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold">Delete Profile Permanently?</h3>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Are you absolutely sure you want to delete your student account? All contribution points, resumes, and project memberships will be permanently deleted. This action cannot be undone.
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Permanently Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
