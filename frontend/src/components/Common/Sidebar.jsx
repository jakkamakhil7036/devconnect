import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  Sparkles, 
  FolderHeart, 
  FileText, 
  ShieldAlert, 
  UserCircle,
  X 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects & Teams', path: '/projects', icon: Briefcase },
    { name: 'AI Projects Recs', path: '/recommendations', icon: Sparkles },
    { name: 'Showcase Portal', path: '/showcase', icon: FolderHeart },
    { name: 'ATS Resume Builder', path: '/resume', icon: FileText },
    { name: 'Student Profile', path: '/profile', icon: UserCircle },
  ];

  if (user && user.role === 'admin') {
    links.push({ name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert });
  }

  const activeStyle = "flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-3 text-sm font-semibold text-primary shadow-sm border-l-4 border-primary dark:from-primary/20 dark:to-secondary/20 dark:text-primary-light";
  const inactiveStyle = "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white";

  return (
    <>
      {/* Mobile Sidebar backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Drawer container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-100 bg-white/95 transition-transform duration-300 md:static md:translate-x-0 md:bg-white dark:border-slate-800 dark:bg-darkcard/95 dark:md:bg-darkcard ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Mobile close button */}
        <div className="flex h-16 items-center justify-between px-6 md:hidden">
          <span className="font-bold text-slate-800 dark:text-white">Navigation</span>
          <button 
            type="button" 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links block */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {links.map(link => {
            const Icon = link.icon;
            return (
              <NavLink 
                key={link.path} 
                to={link.path}
                onClick={onClose}
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom profile overview card */}
        {user && (
          <div className="border-t border-slate-100 p-4 dark:border-slate-800">
            <div className="rounded-2xl bg-gradient-to-tr from-primary/5 to-secondary/5 p-4 dark:from-primary/10 dark:to-secondary/10">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Contribution Score</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {user.contributionScore || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Points</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                Rank: student contributor
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
