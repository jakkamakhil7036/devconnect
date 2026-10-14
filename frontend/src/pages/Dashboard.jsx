import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FolderGit, 
  CheckSquare, 
  Award, 
  Users, 
  FileCheck, 
  Plus, 
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

const Dashboard = () => {
  const { user, syncProfile, API_URL } = useAuth();
  const [currentProjects, setCurrentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAcademicModal, setShowAcademicModal] = useState(false);

  useEffect(() => {
    const fetchCurrentProjects = async () => {
      if (!user) return;
      try {
        // Sync stats & details
        await syncProfile();
        
        // Fetch projects where user is a member
        const res = await axios.get(`${API_URL}/projects`);
        const userProjects = res.data.filter(project => 
          project.members.some(m => m.user && m.user._id.toString() === user._id.toString())
        );
        setCurrentProjects(userProjects);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentProjects();
    const interval = setInterval(() => {
      fetchCurrentProjects();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const stats = user?.stats || {
    projectsJoined: 0,
    projectsCompleted: 0,
    contributionScore: 0,
    teamMembers: 0,
    resumeGenerated: false
  };

  const statCards = [
    {
      title: 'Projects Joined',
      value: stats.projectsJoined,
      icon: FolderGit,
      color: 'text-primary bg-primary/10',
    },
    {
      title: 'Projects Completed',
      value: stats.projectsCompleted,
      icon: CheckSquare,
      color: 'text-accent bg-accent/10',
    },
    {
      title: 'Contribution Score',
      value: stats.contributionScore,
      icon: Award,
      color: 'text-secondary bg-secondary/10',
    },
    {
      title: 'Team Collaborators',
      value: stats.teamMembers,
      icon: Users,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: 'Resume Compiled',
      value: stats.resumeGenerated ? 'Yes' : 'No',
      icon: FileCheck,
      color: stats.resumeGenerated ? 'text-green-500 bg-green-500/10' : 'text-slate-400 bg-slate-100 dark:bg-slate-800',
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-8 text-white shadow-lg sm:p-10">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-1/3 h-28 w-28 translate-y-10 rounded-full bg-accent/20 blur-xl"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            Student Workspace
          </span>
          <h1 className="text-3xl font-black sm:text-4xl">
            Welcome back, {user?.name || 'Developer'}!
          </h1>
          <p className="text-sm font-medium text-white/80">
            {user?.branch} • {user?.year} • {user?.collegeName}
          </p>
          
          {/* Skills badge deck */}
          <div className="flex flex-wrap gap-2 pt-2">
            {user?.skills?.map((skill, index) => (
              <span 
                key={index} 
                className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm border border-white/5"
              >
                {skill}
              </span>
            ))}
            {(!user?.skills || user.skills.length === 0) && (
              <Link to="/profile" className="text-xs font-semibold underline text-white/90 hover:text-white">
                Add skills in your profile
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Grid of stats cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass hover-scale rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`rounded-xl p-2 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
                {card.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* Main Dashboard Splits */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Side: Current Projects */}
        <div className="glass rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderGit className="h-5 w-5 text-primary" />
              Your Active Projects
            </h2>
            <Link 
              to="/projects" 
              className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all dark:bg-primary/20 dark:text-primary-light"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading your project workspaces...</div>
          ) : currentProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">You haven't joined any projects yet.</p>
              <Link 
                to="/projects" 
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline dark:text-primary-light"
              >
                Browse open projects <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {currentProjects.map(project => (
                <Link 
                  key={project._id} 
                  to={`/projects/${project._id}`}
                  className="block rounded-2xl border border-slate-100 hover:border-primary/20 p-5 hover:bg-slate-50/50 hover:scale-[1.005] transition-all dark:border-slate-800 dark:hover:bg-slate-800/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${project.status === 'Completed' ? 'bg-green-150 text-green-700 bg-green-500/10' : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'}`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Project Progress bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-500">Workspace Progress</span>
                      <span className="font-bold text-slate-900 dark:text-white">{project.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4 dark:border-slate-800/50 text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {project.members?.length} / {project.requiredTeamSize} Members
                    </span>
                    <span>Category: {project.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Quick AI Recommendations helper card */}
        <div className="glass rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-secondary" />
            AI Project Ideas
          </h2>

          <div className="rounded-2xl bg-gradient-to-tr from-secondary/5 to-accent/5 p-5 border border-secondary/10 dark:from-secondary/10 dark:to-accent/10">
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Looking for your next project?</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Input your tech skills, interests, and academic branch, and let our AI recommendations engine find the best fit project scope.
            </p>
            <Link 
              to="/recommendations" 
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all"
            >
              Get Recommendations
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-100 p-5 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Trending Platform Stats</h3>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-accent" /> Active Projects</span>
                <span className="font-bold text-slate-900 dark:text-white">14</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1"><Users className="h-3.5 w-3.5 text-primary" /> Active Students</span>
                <span className="font-bold text-slate-900 dark:text-white">124</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1"><Award className="h-3.5 w-3.5 text-secondary" /> Total Repositories</span>
                <span className="font-bold text-slate-900 dark:text-white">56 files</span>
              </div>
            </div>
          </div>

          {/* Academic Mini-Project Submission Document Block */}
          <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-5 dark:border-primary/30">
            <h3 className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider mb-2 flex items-center gap-1.5">
              🎓 Academic Submission Guide
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              This system is authored as a MERN stack mini-project. Click below to view the abstract, module designs, and database specifications for your evaluation.
            </p>
            <button
              onClick={() => setShowAcademicModal(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all"
            >
              View Submission Abstract
            </button>
          </div>
        </div>

      </div>

      {/* Mini-Project Evaluation Modal */}
      {showAcademicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 max-h-[85vh] overflow-y-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  🎓 Academic Mini-Project Abstract & Specification
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Submission Code: CS-MP-2026 • Level: Academic Mini-Project
                </p>
              </div>
              <button 
                onClick={() => setShowAcademicModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Abstract */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">1. Project Abstract</h4>
              <p className="text-xs text-slate-650 dark:text-slate-355 leading-relaxed">
                <strong>DevConnect</strong> is a database-backed web application designed to simplify project team formation and skill alignment in academic environments. In typical institutions, students rely on scattered group chats or manual notice boards to coordinate projects. This application introduces a unified platform where students showcase their profiles, search for peer-led projects via skill matching, assign tasks, track completion statistics via charts, and auto-build resumes.
              </p>
            </div>

            {/* Core Modules */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">2. System Modules</h4>
              <ul className="list-disc pl-4 text-xs text-slate-650 dark:text-slate-355 space-y-1.5">
                <li><strong>User Access Control:</strong> Encrypted JWT-based authentication system with pre-save bcrypt hashing for safe credential storage.</li>
                <li><strong>Project Workspace Dashboard:</strong> Custom workspaces showing completion progress bars, members rosters, and active task lists.</li>
                <li><strong>AI Suggestion Search:</strong> Matches profiles using custom rule-based intersection filters (matching skills like Python, React) to propose project concepts.</li>
                <li><strong>ATS Resume Compiler:</strong> Generates academic resumes from profile entries (name, college, branch, year, tech skills, and platform score).</li>
              </ul>
            </div>

            {/* System Design */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">3. Database Schema Layout</h4>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-550 dark:text-slate-350 space-y-2">
                <div><strong>User Collection:</strong> name, email, password (hashed), collegeName, branch, year, skills[], role, contributionScore</div>
                <div><strong>Project Collection:</strong> title, description, technologies[], requiredTeamSize, members[user, role], status, progress, tasks[]</div>
                <div><strong>Discussion Collection:</strong> project, user, message, comments[user, message]</div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="border-t border-slate-150 dark:border-slate-800 pt-4 flex justify-end">
              <button 
                onClick={() => setShowAcademicModal(false)}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-dark transition-all"
              >
                Acknowledge & Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
