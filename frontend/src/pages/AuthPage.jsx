import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, User, BookOpen, Layers, Award, ShieldAlert, LogIn, UserPlus, Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';
import axios from 'axios';

const AuthPage = () => {
  const { login, register, isAuthenticated, authError, API_URL } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    collegeName: '',
    branch: '',
    year: '1st Year',
    skills: ''
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        // Reset password flow
        const res = await axios.post(`${API_URL}/auth/forgot-password`, {
          email: formData.email,
          newPassword: formData.password
        });
        setSuccessMessage(res.data.message || 'Password reset successful!');
        setIsForgotPassword(false);
        setIsLogin(true);
      } else if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/');
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          collegeName: formData.collegeName,
          branch: formData.branch,
          year: formData.year,
          skills: formData.skills
        });
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-50 via-primary/5 to-secondary/5 px-4 py-12 sm:px-6 lg:px-8 dark:from-darkbg dark:via-primary/10 dark:to-secondary/5">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Title Logo Headings */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white font-black text-3xl shadow-lg animate-bounce">
            D
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-primary-light dark:to-secondary-light">
            DEVCONNECT
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isForgotPassword 
              ? 'Enter email and new password to recover account'
              : isLogin 
                ? 'Sign in to access your student workspace' 
                : 'Create an account to join projects and teams'}
          </p>
        </div>

        {/* Auth form Glass Card */}
        <div className="glass rounded-3xl p-8 shadow-xl">
          
          {/* Tabs header */}
          {!isForgotPassword && (
            <div className="mb-8 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${isLogin ? 'bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${!isLogin ? 'bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
              >
                <UserPlus className="h-4 w-4" />
                Register
              </button>
            </div>
          )}

          {isForgotPassword && (
            <div className="mb-8 text-center">
              <h3 className="text-md font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2">
                <KeyRound className="h-5 w-5 text-secondary animate-pulse" />
                Reset Account Password
              </h3>
            </div>
          )}

          {/* Success messages */}
          {successMessage && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-green-50 p-4 text-xs font-semibold text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Errors messages */}
          {(error || authError) && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{error || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {!isLogin && !isForgotPassword && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1 dark:text-slate-400">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Alice Cooper"
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-primary-light"
                    />
                  </div>
                </div>

                {/* College Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1 dark:text-slate-400">College Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      name="collegeName"
                      required={!isLogin}
                      value={formData.collegeName}
                      onChange={handleChange}
                      placeholder="Harvard University"
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-primary-light"
                    />
                  </div>
                </div>

                {/* Branch & Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1 dark:text-slate-400">Branch / Major</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Layers className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        name="branch"
                        required={!isLogin}
                        value={formData.branch}
                        onChange={handleChange}
                        placeholder="Computer Science"
                        className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-primary-light"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1 dark:text-slate-400">Year</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 px-4 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-primary-light"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                      <option>Graduated</option>
                    </select>
                  </div>
                </div>

                {/* Skills input */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1 dark:text-slate-400">Skills (Comma-separated)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Award className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      name="skills"
                      required={!isLogin}
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="React, Node.js, Python, Git"
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-primary-light"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1 dark:text-slate-400">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alice@school.edu"
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-primary-light"
                />
              </div>
            </div>

            {/* Password / New Password */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1 dark:text-slate-400">
                {isForgotPassword ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-10 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-primary-light"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Toggle Link */}
            {isLogin && !isForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMessage(''); }}
                  className="text-xs font-semibold text-primary hover:text-primary-light transition-all outline-none"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {isForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMessage(''); }}
                  className="text-xs font-semibold text-primary hover:text-primary-light transition-all outline-none"
                >
                  Back to Login
                </button>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                isForgotPassword ? 'Reset Password' : isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

          </form>
        </div>
        
        {/* Sample Credentials Helper (Highly user friendly!) */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500">
          <p className="font-semibold">Demo Credentials:</p>
          <p>Student: <span className="text-slate-500 dark:text-slate-300">alice@devconnect.edu</span> / <span className="text-slate-500 dark:text-slate-300">password123</span></p>
          <p>Admin: <span className="text-slate-500 dark:text-slate-300">admin@devconnect.edu</span> / <span className="text-slate-500 dark:text-slate-300">adminpassword</span></p>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
