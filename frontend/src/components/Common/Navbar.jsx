import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, LogOut, User as UserIcon, Menu } from 'lucide-react';
import axios from 'axios';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, notifications, unreadCount, theme, toggleTheme, markNotificationRead, fetchNotifications } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleInvitationResponse = async (e, invitationId, action) => {
    e.stopPropagation();
    try {
      const token = user?.token;
      const res = await axios.put(`http://localhost:5000/api/invitations/${invitationId}`, { action }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert(res.data.message);
      fetchNotifications();
    } catch (error) {
      alert(error.response?.data?.message || 'Error responding to invitation.');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left section: Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white font-extrabold text-xl shadow-md">
              D
            </div>
            <span className="hidden text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent sm:block dark:from-primary-light dark:to-secondary-light">
              DEVCONNECT
            </span>
          </Link>
        </div>

        {/* Right section: Actions */}
        <div className="flex items-center gap-4">
          
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications Center */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-950/50">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="font-semibold text-slate-900 dark:text-white">Notifications</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">All caught up!</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => {
                            if (n.type !== 'invite') {
                              if (!n.read) markNotificationRead(n._id);
                              setShowNotifications(false);
                              if (n.project) navigate(`/projects/${n.project._id || n.project}`);
                            }
                          }}
                          className={`rounded-lg p-2 text-left text-xs transition-colors duration-150 ${n.type === 'invite' ? 'cursor-default' : 'cursor-pointer'} ${n.read ? 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-primary/5 hover:bg-primary/10 text-slate-900 dark:bg-primary/10 dark:hover:bg-primary/20 dark:text-white font-medium'}`}
                        >
                          <p>{n.content}</p>
                          {n.type === 'invite' && !n.read && n.invitation && (
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={(e) => handleInvitationResponse(e, n.invitation._id || n.invitation, 'Accept')}
                                className="rounded bg-primary px-2.5 py-1 text-[9px] font-bold text-white hover:bg-primary-dark shadow-sm"
                              >
                                Accept Invite
                              </button>
                              <button
                                onClick={(e) => handleInvitationResponse(e, n.invitation._id || n.invitation, 'Decline')}
                                className="rounded bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[9px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          <span className="mt-1 block text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Info & Logout */}
          {user && (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-800">
              <Link to="/profile" className="flex items-center gap-2 group">
                {user.profilePicture ? (
                  <img
                    src={`http://localhost:5000${user.profilePicture}`}
                    alt={user.name}
                    className="h-8 w-8 rounded-xl object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all duration-200"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80";
                    }}
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <div className="hidden text-left md:block">
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-primary transition-colors dark:text-white dark:group-hover:text-primary-light">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
};

export default Navbar;
