import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Users, 
  Briefcase, 
  Trash2, 
  ShieldAlert, 
  TrendingUp, 
  Lock,
  Unlock,
  Sparkles,
  BarChart3,
  PieChart
} from 'lucide-react';

const AdminDashboard = () => {
  const { API_URL } = useAuth();
  
  const [metrics, setMetrics] = useState(null);
  const [popularTechs, setPopularTechs] = useState([]);
  const [branchStats, setBranchStats] = useState([]);
  
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('analytics'); // analytics, users, projects

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Analytics
      const analRes = await axios.get(`${API_URL}/admin/analytics`);
      setMetrics(analRes.data.metrics);
      setPopularTechs(analRes.data.popularTechs);
      setBranchStats(analRes.data.branchStats);

      // 2. Fetch Users
      const usersRes = await axios.get(`${API_URL}/admin/users`);
      setUsersList(usersRes.data);

      // 3. Fetch Projects
      const projRes = await axios.get(`${API_URL}/admin/projects`);
      setProjectsList(projRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleSuspend = async (userId) => {
    try {
      const res = await axios.put(`${API_URL}/admin/users/${userId}/suspend`);
      setUsersList(usersList.map(u => u._id === userId ? { ...u, isSuspended: res.data.user.isSuspended } : u));
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Error toggling user status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this student account?')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`);
      setUsersList(usersList.filter(u => u._id !== userId));
      alert('User deleted.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting user.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to permanently delete this project workspace?')) return;
    try {
      await axios.delete(`${API_URL}/admin/projects/${projectId}`);
      setProjectsList(projectsList.filter(p => p._id !== projectId));
      alert('Project deleted.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting project.');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading admin moderations panels...</div>;
  }

  // Chart configs
  // 1. Tech counts bar chart
  const techChartData = {
    labels: popularTechs.map(t => t.tech),
    datasets: [{
      label: 'Projects Using Tech',
      data: popularTechs.map(t => t.count),
      backgroundColor: '#2563EB',
      borderRadius: 6
    }]
  };

  // 2. Branch distribution pie chart
  const branchChartData = {
    labels: branchStats.map(b => b.branch),
    datasets: [{
      data: branchStats.map(b => b.count),
      backgroundColor: ['#2563EB', '#7C3AED', '#14B8A6', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }]
  };

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-primary" />
          Admin Control Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Moderation of users, projects, contents and analytics statistics.</p>
      </div>

      {/* Sub Tabs */}
      <section className="flex border-b border-slate-100 dark:border-slate-800">
        {[
          { id: 'analytics', name: 'Platform Analytics', icon: BarChart3 },
          { id: 'users', name: 'Manage Users', icon: Users },
          { id: 'projects', name: 'Manage Projects', icon: Briefcase }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-5 py-4 text-xs font-bold transition-all outline-none ${activeSubTab === tab.id ? 'border-primary text-primary dark:text-primary-light' : 'border-transparent text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white'}`}
            >
              <Icon className="h-4.5 w-4.5" />
              {tab.name}
            </button>
          );
        })}
      </section>

      {/* TAB 1: Platform Analytics */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Key metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Student Accounts</span>
              <p className="mt-4 text-4xl font-extrabold text-slate-900 dark:text-white">{metrics?.totalUsers}</p>
            </div>
            <div className="glass rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Project Boards</span>
              <p className="mt-4 text-4xl font-extrabold text-slate-900 dark:text-white">{metrics?.activeProjects}</p>
            </div>
            <div className="glass rounded-3xl p-6 shadow-sm">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completed Projects</span>
              <p className="mt-4 text-4xl font-extrabold text-slate-900 dark:text-white">{metrics?.completedProjects}</p>
            </div>
          </div>

          {/* Analytics charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Horizontal Bar Chart popular technologies */}
            <div className="glass rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="h-4.5 w-4.5 text-primary" /> Popular Technologies Used
              </h3>
              <div className="h-64">
                {popularTechs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">No technologies logged yet</p>
                ) : (
                  <Bar 
                    data={techChartData} 
                    options={{ 
                      indexAxis: 'y', 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } }
                    }} 
                  />
                )}
              </div>
            </div>

            {/* Pie Chart student branches */}
            <div className="glass rounded-3xl p-6 shadow-sm space-y-4 flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider self-start flex items-center gap-1">
                <PieChart className="h-4.5 w-4.5 text-secondary" /> Student Branches distribution
              </h3>
              <div className="h-64 w-64 relative flex items-center justify-center">
                {branchStats.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">No branches details found</p>
                ) : (
                  <Pie data={branchChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: Users Moderation */}
      {activeSubTab === 'users' && (
        <div className="glass rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-white">Active Students Registry</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Branch & Year</th>
                  <th className="py-3 px-4">Contribution Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-450">No users registered yet.</td>
                  </tr>
                ) : (
                  usersList.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="py-3.5 px-4 flex items-center gap-2">
                        <img
                          src={`http://localhost:5000${item.profilePicture}`}
                          className="h-6 w-6 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32";
                          }}
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                          {item.role === 'admin' && <span className="rounded bg-red-100 text-[8px] font-extrabold text-red-600 px-1 py-0.5">Admin</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{item.email}</td>
                      <td className="py-3.5 px-4 font-semibold">{item.branch} • {item.year}</td>
                      <td className="py-3.5 px-4 font-bold text-secondary dark:text-secondary-light">{item.contributionScore || 0} Points</td>
                      
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {item.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleToggleSuspend(item._id)}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-bold transition-all ${item.isSuspended ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800'}`}
                            >
                              {item.isSuspended ? (
                                <>
                                  <Unlock className="h-3.5 w-3.5" /> Unsuspend
                                </>
                              ) : (
                                <>
                                  <Lock className="h-3.5 w-3.5" /> Suspend
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(item._id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 hover:bg-red-50 hover:text-red-500 px-2.5 py-1.5 font-bold text-slate-500 transition-all dark:border-red-950 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Projects Moderation */}
      {activeSubTab === 'projects' && (
        <div className="glass rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-white">Active Projects Index</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4">Category & Difficulty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {projectsList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-450">No projects created yet.</td>
                  </tr>
                ) : (
                  projectsList.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.title}</td>
                      <td className="py-3.5 px-4">{item.creator?.name || 'Unknown'}</td>
                      <td className="py-3.5 px-4 font-semibold">{item.category} • {item.difficulty}</td>
                      <td className="py-3.5 px-4 font-bold text-primary dark:text-primary-light">{item.status}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteProject(item._id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 hover:bg-red-50 hover:text-red-500 px-2.5 py-1.5 font-bold text-slate-500 transition-all dark:border-red-950 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove Project
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
