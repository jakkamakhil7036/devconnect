import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getAssetUrl } from '../utils/api';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { 
  FolderGit, 
  Users, 
  CheckSquare, 
  FolderOpen, 
  MessageSquare, 
  Plus, 
  Upload, 
  Download, 
  Award,
  Send,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  Clock,
  Sparkles,
  FileCheck,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Heart
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ProjectDetails = () => {
  const { id } = useParams();
  const { user, API_URL, syncProfile } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, tasks, repo, discussions, team

  // Smart Join State
  const [joinRole, setJoinRole] = useState('Frontend Developer');
  const [joining, setJoining] = useState(false);

  // Status Change State
  const [statusLoading, setStatusLoading] = useState(false);

  // Task Board States
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
  const [taskLoading, setTaskLoading] = useState(false);

  // Repository States
  const [files, setFiles] = useState([]);
  const [repoFile, setRepoFile] = useState(null);
  const [repoVersion, setRepoVersion] = useState('1.0.0');
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Repository Editor States
  const [editingFile, setEditingFile] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorVersion, setEditorVersion] = useState('');
  const [editorLoading, setEditorLoading] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);

  // Download file helper with authorization
  const handleDownload = async (fileId, originalname) => {
    try {
      const token = user?.token;
      const res = await axios.get(`${API_URL}/repository/download/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalname);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error downloading file: ' + (error.response?.data?.message || error.message));
    }
  };

  // Load code editor helper
  const handleOpenFileEditor = async (fileId) => {
    try {
      const token = user?.token;
      const res = await axios.get(`${API_URL}/repository/files/${fileId}/content`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEditingFile(res.data);
      setEditorContent(res.data.content);
      setEditorVersion(res.data.version);
      setShowEditorModal(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Error loading file content.');
    }
  };

  // Save changes handler
  const handleSaveFileChanges = async (e) => {
    e.preventDefault();
    if (!editingFile) return;
    setEditorLoading(true);
    try {
      const token = user?.token;
      await axios.put(`${API_URL}/repository/files/${editingFile._id}/content`, {
        content: editorContent,
        version: editorVersion
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowEditorModal(false);
      setEditingFile(null);
      setEditorContent('');
      await loadElements();
      await syncProfile();
      alert('Code modifications saved successfully! +5 Contribution points awarded.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving file changes.');
    } finally {
      setEditorLoading(false);
    }
  };

  // Forum States
  const [discussions, setDiscussions] = useState([]);
  const [searchDisc, setSearchDisc] = useState('');
  const [newDisc, setNewDisc] = useState({ title: '', content: '' });
  const [discLoading, setDiscLoading] = useState(false);
  const [activeDisc, setActiveDisc] = useState(null); // Detailed view
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [activeCommentIdForReply, setActiveCommentIdForReply] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Showcase Publish States
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showcaseData, setShowcaseData] = useState({
    title: '',
    description: '',
    videoLink: '',
    githubLink: '',
    technologies: ''
  });
  const [publishLoading, setPublishLoading] = useState(false);
  const [showcaseScreenshots, setShowcaseScreenshots] = useState(null);

  // Leader Invite by Email State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Frontend Developer');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Invite by email handler
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail) {
      alert('Please provide student email address.');
      return;
    }
    setInviteLoading(true);
    try {
      await axios.post(`${API_URL}/invitations`, {
        projectId: id,
        email: inviteEmail.trim(),
        role: inviteRole
      });
      setInviteEmail('');
      alert('Invitation sent! Student will receive a notification and can accept or decline.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error sending invitation.');
    } finally {
      setInviteLoading(false);
    }
  };

  // Fetch Project main details
  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/projects/${id}`);
      setProject(res.data);
      // Prefill showcase defaults
      setShowcaseData({
        title: res.data.title,
        description: res.data.description,
        videoLink: '',
        githubLink: '',
        technologies: res.data.technologies.join(', ')
      });
    } catch (error) {
      console.error(error);
      navigate('/');
    }
  };

  // Load project elements
  const loadElements = async () => {
    if (!project) return;
    try {
      // 1. Fetch Tasks
      const tasksRes = await axios.get(`${API_URL}/tasks/project/${id}`);
      setTasks(tasksRes.data);

      // 2. Fetch Repository Files
      const filesRes = await axios.get(`${API_URL}/repository/project/${id}`);
      setFiles(filesRes.data);

      // 3. Fetch Discussions
      const discRes = await axios.get(`${API_URL}/discussions/project/${id}`, {
        params: { search: searchDisc }
      });
      setDiscussions(discRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchProjectDetails();
      setLoading(false);
    };
    init();
  }, [id]);

  // Periodic background refresh so tasks and progress update regularly
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      fetchProjectDetails();
      loadElements();
    }, 8000);
    return () => clearInterval(interval);
  }, [id, activeTab]);

  // Periodic background refresh so tasks and progress update regularly
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      fetchProjectDetails();
      loadElements();
    }, 8000);
    return () => clearInterval(interval);
  }, [id, activeTab]);

  useEffect(() => {
    if (project) {
      loadElements();
    }
  }, [project?._id, activeTab, searchDisc]);

  // Check membership
  const isMember = project?.members?.some(m => m.user && (m.user._id || m.user).toString() === user?._id.toString());
  const myRole = project?.members?.find(m => m.user && (m.user._id || m.user).toString() === user?._id.toString())?.role;
  const isCreator = project?.creator && (project.creator._id || project.creator).toString() === user?._id.toString();

  const handleJoinProject = async () => {
    setJoining(true);
    try {
      const res = await axios.post(`${API_URL}/projects/${id}/join`, { role: joinRole });
      setProject(res.data);
      await syncProfile();
      alert(`Successfully joined project team as ${joinRole}!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error joining project.');
    } finally {
      setJoining(false);
    }
  };

  // Toggle Project Status (Open -> In Progress -> Completed)
  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      const res = await axios.put(`${API_URL}/projects/${id}`, { status: newStatus });
      setProject(res.data);
      await syncProfile();
    } catch (error) {
      alert(error.response?.data?.message || 'Error modifying status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Task Board Handlers
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setTaskLoading(true);
    try {
      await axios.post(`${API_URL}/tasks`, {
        ...newTask,
        projectId: id
      });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', assignedTo: '', dueDate: '' });
      // Reload details and tasks
      await fetchProjectDetails();
      await loadElements();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating task');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      await fetchProjectDetails();
      await loadElements();
      await syncProfile();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleTaskStatusToggle = async (taskId, currentStatus) => {
    let nextStatus = 'To Do';
    if (currentStatus === 'To Do') nextStatus = 'In Progress';
    else if (currentStatus === 'In Progress') nextStatus = 'Completed';
    else if (currentStatus === 'Completed') nextStatus = 'To Do';

    try {
      await axios.put(`${API_URL}/tasks/${taskId}/status`, { status: nextStatus });
      await fetchProjectDetails();
      await loadElements();
      await syncProfile();
    } catch (error) {
      alert(error.message);
    }
  };

  // Repository Handlers
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!repoFile) return;

    const data = new FormData();
    data.append('file', repoFile);
    data.append('projectId', id);
    data.append('version', repoVersion);

    setUploadLoading(true);
    try {
      await axios.post(`${API_URL}/repository/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRepoFile(null);
      setRepoVersion('1.0.0');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadElements();
      await syncProfile();
      alert('Code file uploaded successfully! +10 Contribution points awarded.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error uploading file.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Forum Handlers
  const handleDiscussionSubmit = async (e) => {
    e.preventDefault();
    setDiscLoading(true);
    try {
      const res = await axios.post(`${API_URL}/discussions`, {
        ...newDisc,
        projectId: id
      });
      setNewDisc({ title: '', content: '' });
      await loadElements();
      await syncProfile();
      alert('Discussion posted! +2 Contribution points awarded.');
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    } finally {
      setDiscLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await axios.post(`${API_URL}/discussions/${activeDisc._id}/comments`, {
        content: newComment
      });
      setActiveDisc(res.data);
      setNewComment('');
      await loadElements();
      await syncProfile();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    setReplyLoading(true);
    try {
      const res = await axios.post(`${API_URL}/discussions/${activeDisc._id}/comments/${commentId}/replies`, {
        content: newReply
      });
      setActiveDisc(res.data);
      setNewReply('');
      setActiveCommentIdForReply(null);
      await loadElements();
      await syncProfile();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    } finally {
      setReplyLoading(false);
    }
  };

  // Showcase Portal Publish Handler
  const handleShowcasePublish = async (e) => {
    e.preventDefault();
    setPublishLoading(true);

    const data = new FormData();
    data.append('projectId', id);
    data.append('title', showcaseData.title);
    data.append('description', showcaseData.description);
    data.append('videoLink', showcaseData.videoLink);
    data.append('githubLink', showcaseData.githubLink);
    data.append('technologies', showcaseData.technologies);

    if (showcaseScreenshots) {
      for (let i = 0; i < showcaseScreenshots.length; i++) {
        data.append('screenshots', showcaseScreenshots[i]);
      }
    }

    try {
      await axios.post(`${API_URL}/showcases`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowPublishModal(false);
      alert('Congratulations! Your project is now featured on the Showcase Portal!');
      navigate('/showcase');
    } catch (error) {
      alert(error.response?.data?.message || 'Error publishing showcase.');
    } finally {
      setPublishLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading project details...</div>;
  }

  if (!project) return null;

  // Safe members list filtering out null/deleted users
  const activeMembers = project?.members?.filter(m => m.user) || [];

  // Chart configurations
  // 1. Progress Chart (Doughnut)
  const progressChartData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [project.progress, 100 - project.progress],
      backgroundColor: ['#14B8A6', '#E2E8F0'],
      borderWidth: 0
    }]
  };

  // 2. Task Completion Chart (Pie)
  const todoCount = tasks.filter(t => t.status === 'To Do').length;
  const progressCount = tasks.filter(t => t.status === 'In Progress').length;
  const doneCount = tasks.filter(t => t.status === 'Completed').length;

  const taskChartData = {
    labels: ['To Do', 'In Progress', 'Completed'],
    datasets: [{
      data: [todoCount, progressCount, doneCount],
      backgroundColor: ['#F59E0B', '#3B82F6', '#10B981'],
      borderWidth: 0
    }]
  };

  // 3. Contribution Chart (Bar)
  const contributionChartData = {
    labels: activeMembers.map(m => m.user.name),
    datasets: [{
      label: 'Contribution Points',
      data: activeMembers.map(m => m.user.contributionScore || 0),
      backgroundColor: '#3B82F6',
      borderRadius: 8
    }]
  };

  return (
    <div className="space-y-8">
      
      {/* Project Workspace Banner */}
      <section className="glass rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary dark:bg-primary/20 dark:text-primary-light">
              {project.category}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
              {project.difficulty}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${project.status === 'Completed' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
              {project.status}
            </span>
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">{project.title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">{project.description}</p>
          
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.technologies?.map((t, idx) => (
              <span key={idx} className="rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500 font-semibold border border-slate-100 dark:border-slate-700/60">
                {t}
              </span>
            ))}
          </div>
        </div>


        {/* Project controls & joins */}
        <div className="shrink-0 space-y-4">
          {!isMember ? (
            <div className="rounded-2xl bg-gradient-to-tr from-primary/5 to-secondary/5 p-4 border border-primary/10 dark:from-primary/10 dark:to-secondary/10 w-full sm:w-64 space-y-3">
              <p className="text-xs font-bold text-slate-700 dark:text-white">Apply to join this project team:</p>
              
              <select
                value={joinRole}
                onChange={(e) => setJoinRole(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Database Engineer</option>
                <option>AI Engineer</option>
                <option>Tester</option>
              </select>

              <button
                onClick={handleJoinProject}
                disabled={joining}
                className="w-full flex justify-center items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
              >
                {joining ? 'Applying...' : 'Join Project Team'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* If creator, allow toggling status */}
              {isCreator && (
                <div className="flex gap-2">
                  {project.status !== 'In Progress' && (
                    <button
                      onClick={() => handleStatusChange('In Progress')}
                      disabled={statusLoading}
                      className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
                    >
                      Set In Progress
                    </button>
                  )}
                  {project.status !== 'Completed' && (
                    <button
                      onClick={() => handleStatusChange('Completed')}
                      disabled={statusLoading}
                      className="rounded-xl bg-green-500 hover:bg-green-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all"
                    >
                      Complete Project (+50 pts)
                    </button>
                  )}
                  {project.status === 'Completed' && (
                    <button
                      onClick={() => setShowPublishModal(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-secondary to-accent px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all animate-pulse"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Publish to Showcase
                    </button>
                  )}
                </div>
              )}

              <div className="rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary dark:bg-primary/20 dark:text-primary-light self-center">
                My Role: {myRole}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      {isMember && (
        <section className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto pb-px">
          {[
            { id: 'dashboard', name: 'Dashboard & Analytics', icon: FolderGit },
            { id: 'tasks', name: 'Task Board', icon: CheckSquare },
            { id: 'repo', name: 'Code Repository', icon: FolderOpen },
            { id: 'discussions', name: 'Discussion Forum', icon: MessageSquare },
            { id: 'team', name: 'Team Members', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setActiveDisc(null); }}
                className={`flex items-center gap-2 border-b-2 px-5 py-4 text-xs font-bold whitespace-nowrap transition-all outline-none ${activeTab === tab.id ? 'border-primary text-primary dark:text-primary-light' : 'border-transparent text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white'}`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </section>
      )}

      {/* Main Tab Render blocks */}
      {!isMember ? (
        <div className="glass rounded-3xl p-12 text-center text-slate-500">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-4" />
          <p className="font-semibold">This is a private student workspace.</p>
          <p className="text-xs text-slate-400 mt-1">Please join the project team to collaborate, view codes, or assign tasks.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: Dashboard Analytics & Charts */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Doughnut Progress */}
              <div className="glass rounded-3xl p-6 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completion Progress</h3>
                <div className="h-48 w-48 relative">
                  <Doughnut data={progressChartData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{project.progress}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Progress</span>
                  </div>
                </div>
              </div>

              {/* Pie Task Status */}
              <div className="glass rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center space-y-4">
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Task Allocations</h3>
                {tasks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12">No tasks created yet</p>
                ) : (
                  <div className="h-48 w-48">
                    <Pie data={taskChartData} options={{ plugins: { legend: { display: false } } }} />
                  </div>
                )}
              </div>

              {/* Bar Contribution Chart */}
              <div className="glass rounded-3xl p-6 shadow-sm flex flex-col justify-center space-y-4 col-span-1">
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">Team Contributions</h3>
                <div className="h-48">
                  <Bar 
                    data={contributionChartData} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } }
                    }} 
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Task Board (Kanban style columns) */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Milestones & Tasks</h2>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-1 bg-primary text-white rounded-xl px-3.5 py-2 text-xs font-bold shadow-md hover:bg-primary-dark transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Task
                </button>
              </div>

              {/* Three Columns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column: To Do */}
                {['To Do', 'In Progress', 'Completed'].map(colName => {
                  const filteredTasks = tasks.filter(t => t.status === colName);
                  let colBg = 'border-amber-500/20 bg-amber-500/5';
                  let colDot = 'bg-amber-500';
                  if (colName === 'In Progress') {
                    colBg = 'border-primary/20 bg-primary/5';
                    colDot = 'bg-primary';
                  } else if (colName === 'Completed') {
                    colBg = 'border-accent/20 bg-accent/5';
                    colDot = 'bg-accent';
                  }

                  return (
                    <div key={colName} className={`rounded-3xl border p-4 space-y-4 min-h-[350px] ${colBg}`}>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800/40">
                        <span className="flex items-center gap-2 text-xs font-black uppercase text-slate-600 dark:text-slate-300">
                          <span className={`h-2.5 w-2.5 rounded-full ${colDot}`}></span>
                          {colName}
                        </span>
                        <span className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-bold shadow-sm dark:bg-slate-900 dark:text-white">
                          {filteredTasks.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {filteredTasks.length === 0 ? (
                          <p className="text-[10px] text-center text-slate-400 py-10">No tasks in this stage</p>
                        ) : (
                          filteredTasks.map(task => (
                            <div 
                              key={task._id}
                              className="rounded-2xl bg-white p-4 shadow-sm border border-slate-50 hover:shadow-md transition-all dark:bg-slate-950 dark:border-slate-900"
                            >
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{task.title}</h4>
                              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{task.description}</p>
                              
                              {/* Task Assignee avatar badge */}
                              <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-900">
                                {task.assignedTo ? (
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <img 
                                      src={getAssetUrl(task.assignedTo.profilePicture)}
                                      className="h-5 w-5 rounded-full object-cover"
                                      onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32";
                                      }}
                                    />
                                    <span className="truncate max-w-[100px]">{task.assignedTo.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-amber-500 font-semibold italic">Unassigned</span>
                                )}

                                {/* Action Toggle status click */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleTaskStatusToggle(task._id, task.status)}
                                    className="text-[9px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                                  >
                                    {task.status === 'Completed' ? 'Reopen' : 'Advance'}
                                  </button>
                                  {(isCreator || isMember) && (
                                    <button
                                      onClick={() => handleDeleteTask(task._id)}
                                      title="Delete task"
                                      className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          )}

          {/* TAB 3: Code Repository uploads & downloads */}
          {activeTab === 'repo' && (
            <div className="space-y-6">
              
              {/* Upload panel */}
              <div className="glass rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4">Upload Code File / Document</h3>
                
                <form onSubmit={handleFileUpload} className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      required
                      onChange={(e) => setRepoFile(e.target.files[0])}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-primary/20 dark:file:text-primary-light"
                    />
                  </div>

                  <div className="w-full sm:w-28">
                    <input
                      type="text"
                      required
                      placeholder="Version (e.g. 1.0.1)"
                      value={repoVersion}
                      onChange={(e) => setRepoVersion(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition-all disabled:opacity-50"
                  >
                    {uploadLoading ? 'Uploading...' : (
                      <>
                        <Upload className="h-4 w-4" /> Upload File
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Version History Logs */}
              <div className="glass rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-white">Repository Files History</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                    <thead className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">File Name</th>
                        <th className="py-3 px-4">Version</th>
                        <th className="py-3 px-4">Uploaded By</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                      {files.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400">No files uploaded yet in repository</td>
                        </tr>
                      ) : (
                        files.map(file => (
                          <tr key={file._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                              {file.originalname}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-primary dark:text-primary-light">
                              v{file.version}
                            </td>
                            <td className="py-3.5 px-4 flex items-center gap-2">
                              <img
                                src={getAssetUrl(file.uploadedBy.profilePicture)}
                                className="h-5 w-5 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32";
                                }}
                              />
                              <span>{file.uploadedBy.name}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              {new Date(file.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleDownload(file._id, file.originalname)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 hover:border-primary/20 hover:text-primary px-3 py-1.5 font-bold transition-all dark:border-slate-800 dark:hover:border-primary-light"
                              >
                                <Download className="h-3.5 w-3.5" /> Download
                              </button>
                              {(() => {
                                const ext = file.originalname.split('.').pop().toLowerCase();
                                const isTxt = ['txt', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'md', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'sh', 'sql', 'xml', 'yml', 'yaml'].includes(ext);
                                return isTxt && (
                                  <button
                                    onClick={() => handleOpenFileEditor(file._id)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 hover:border-secondary/20 hover:text-secondary px-3 py-1.5 font-bold transition-all dark:border-slate-800 dark:hover:border-secondary-light"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" /> View & Edit
                                  </button>
                                );
                              })()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: Discussion Forum */}
          {activeTab === 'discussions' && (
            <div className="space-y-6">
              
              {!activeDisc ? (
                // Discussions list
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Create Discussion Form */}
                  <div className="glass rounded-3xl p-6 shadow-sm space-y-4 self-start">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-white">Create New Post</h3>
                    <form onSubmit={handleDiscussionSubmit} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Post Title"
                          value={newDisc.title}
                          onChange={(e) => setNewDisc({ ...newDisc, title: e.target.value })}
                          className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <textarea
                          required
                          rows="4"
                          placeholder="What is on your mind?"
                          value={newDisc.content}
                          onChange={(e) => setNewDisc({ ...newDisc, content: e.target.value })}
                          className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={discLoading}
                        className="w-full flex items-center justify-center gap-1 bg-secondary text-white rounded-xl py-2.5 text-xs font-bold shadow-md hover:bg-secondary-dark transition-all disabled:opacity-50"
                      >
                        Publish Post (+2 pts)
                      </button>
                    </form>
                  </div>

                  {/* Discussions list column */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Search className="h-4.5 w-4.5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search discussion threads..."
                          value={searchDisc}
                          onChange={(e) => setSearchDisc(e.target.value)}
                          className="block w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-9 pr-4 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {discussions.length === 0 ? (
                        <p className="text-xs text-center text-slate-400 py-10">No discussions posted yet.</p>
                      ) : (
                        discussions.map(disc => (
                          <div 
                            key={disc._id}
                            onClick={() => setActiveDisc(disc)}
                            className="glass cursor-pointer rounded-2xl p-5 hover:border-primary/20 hover:scale-[1.002] transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={disc.user?.profilePicture ? getAssetUrl(disc.user.profilePicture) : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32"}
                                  className="h-6 w-6 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32";
                                  }}
                                />
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{disc.user?.name || 'Former Member'}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{new Date(disc.createdAt).toLocaleDateString()}</span>
                            </div>

                            <h4 className="mt-3 font-bold text-sm text-slate-900 dark:text-white hover:text-primary transition-colors">
                              {disc.title}
                            </h4>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{disc.content}</p>

                            <div className="mt-4 border-t border-slate-50 dark:border-slate-800 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5 text-slate-400" />
                                {disc.comments?.length || 0} Comments
                              </span>
                              <span>Open Discussion <ChevronRight className="h-3 w-3 inline" /></span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                // Detailed Discussion View with Comment Section
                <div className="space-y-6">
                  <button
                    onClick={() => setActiveDisc(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    ← Back to all posts
                  </button>

                  <div className="glass rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <img
                          src={activeDisc.user?.profilePicture ? getAssetUrl(activeDisc.user.profilePicture) : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32"}
                          className="h-8 w-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32";
                          }}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{activeDisc.user?.name || 'Former Member'}</p>
                          <p className="text-[10px] text-slate-400">{new Date(activeDisc.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{activeDisc.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">{activeDisc.content}</p>
                  </div>

                  {/* Comments lists */}
                  <div className="space-y-4 pl-4 border-l border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comments ({activeDisc.comments?.length || 0})</h4>
                    
                    {activeDisc.comments?.map(comment => (
                      <div key={comment._id} className="glass rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={comment.user?.profilePicture ? getAssetUrl(comment.user.profilePicture) : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32"}
                              className="h-5 w-5 rounded-full object-cover"
                              onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32";
                              }}
                            />
                            <span className="text-[10px] font-bold text-slate-850 dark:text-slate-200">{comment.user?.name || 'Former Member'}</span>
                          </div>
                          <span className="text-[9px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{comment.content}</p>

                        {/* Reply Action Form toggles */}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => {
                              setActiveCommentIdForReply(comment._id === activeCommentIdForReply ? null : comment._id);
                              setNewReply('');
                            }}
                            className="text-[9px] font-bold text-primary hover:underline dark:text-primary-light"
                          >
                            Reply
                          </button>
                        </div>

                        {/* Replies nested displays */}
                        <div className="pl-4 space-y-3 border-l border-slate-50 dark:border-slate-800/80">
                          {comment.replies?.map(rep => (
                            <div key={rep._id} className="bg-slate-50/50 p-2.5 rounded-xl text-xs dark:bg-slate-900/30 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[9px] text-slate-700 dark:text-slate-300">{rep.user?.name || 'Former Member'}</span>
                                <span className="text-[8px] text-slate-400">{new Date(rep.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{rep.content}</p>
                            </div>
                          ))}
                        </div>

                        {/* Reply input trigger form */}
                        {activeCommentIdForReply === comment._id && (
                          <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="flex items-center gap-2 pt-2">
                            <input
                              type="text"
                              required
                              placeholder="Write a reply..."
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value)}
                              className="flex-1 rounded-xl border border-slate-200 bg-white/50 px-3 py-1.5 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                            />
                            <button
                              type="submit"
                              disabled={replyLoading}
                              className="rounded-xl bg-primary text-white p-2 hover:opacity-90 disabled:opacity-50"
                            >
                              <Send className="h-3 w-3" />
                            </button>
                          </form>
                        )}

                      </div>
                    ))}

                    {/* Add Comment Input Form */}
                    <form onSubmit={handleCommentSubmit} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-primary px-4 py-2 text-white text-xs font-bold hover:bg-primary-dark transition-all"
                      >
                        Post
                      </button>
                    </form>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 5: Team Members and Roles details */}
          {activeTab === 'team' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Members List Panel */}
              <div className="glass rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-2">
                <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Project Team Members</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100/50 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAssetUrl(member.user.profilePicture)}
                          className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary/10"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=64";
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">{member.user.name}</h4>
                          <p className="text-[10px] text-slate-400 capitalize">{member.user.branch} • {member.user.year}</p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary dark:bg-primary/20 dark:text-primary-light">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite Member form for leader only */}
              {(isCreator || myRole === 'Team Leader') && (
                <div className="glass rounded-3xl p-6 shadow-sm space-y-4 self-start">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-1.5">
                    <Plus className="h-4.5 w-4.5 text-primary" />
                    Invite Student by Email
                  </h3>
                  
                  <form onSubmit={handleInviteSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Student Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="student@devconnect.edu"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assign Role</label>
                      <select

                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900"
                      >
                        <option>Frontend Developer</option>
                        <option>Backend Developer</option>
                        <option>Database Engineer</option>
                        <option>AI Engineer</option>
                        <option>Tester</option>
                        <option>Team Leader</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="w-full flex items-center justify-center gap-1 bg-primary text-white rounded-xl py-2.5 text-xs font-bold shadow-md hover:bg-primary-dark transition-all disabled:opacity-50"
                    >
                      {inviteLoading ? 'Sending Invitation...' : 'Send Invitation Request'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 dark:border-slate-800">
              <h2 className="text-md font-bold text-slate-900 dark:text-white">Create Task Card</h2>
              <button onClick={() => setShowTaskModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Implement login frontend form"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task details and guidelines..."
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assignee</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="">Unassigned</option>
                    {activeMembers.map((m, idx) => (
                      <option key={idx} value={m.user._id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={taskLoading}
                  className="rounded-xl bg-primary text-white px-4 py-2 text-xs font-bold shadow-md hover:bg-primary-dark disabled:opacity-50"
                >
                  Create
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SHOWCASE PUBLISH MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 dark:border-slate-800">
              <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-secondary animate-pulse" />
                Publish completed project to Showcase!
              </h2>
              <button onClick={() => setShowPublishModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleShowcasePublish} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Showcase Title</label>
                <input
                  type="text"
                  required
                  value={showcaseData.title}
                  onChange={(e) => setShowcaseData({ ...showcaseData, title: e.target.value })}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Showcase Description</label>
                <textarea
                  required
                  rows="3"
                  value={showcaseData.description}
                  onChange={(e) => setShowcaseData({ ...showcaseData, description: e.target.value })}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Demo Video Link</label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/..."
                    value={showcaseData.videoLink}
                    onChange={(e) => setShowcaseData({ ...showcaseData, videoLink: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GitHub Link</label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={showcaseData.githubLink}
                    onChange={(e) => setShowcaseData({ ...showcaseData, githubLink: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Technologies Used (Comma-separated)</label>
                  <input
                    type="text"
                    value={showcaseData.technologies}
                    onChange={(e) => setShowcaseData({ ...showcaseData, technologies: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Screenshots (Up to 5)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setShowcaseScreenshots(e.target.files)}
                    className="block w-full text-[10px] text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary dark:file:bg-primary/20 dark:file:text-primary-light"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishLoading}
                  className="rounded-xl bg-gradient-to-r from-secondary to-accent px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50"
                >
                  {publishLoading ? 'Publishing Showcase...' : 'Publish to Showcase'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* CODE EDITOR MODAL */}
      {showEditorModal && editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Edit2 className="h-4.5 w-4.5 text-secondary" />
                  Collaborative Workspace Code Editor
                </h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                  Modifying: <span className="text-primary font-bold">{editingFile.originalname}</span> (Current Version: v{editingFile.version})
                </p>
              </div>
              <button 
                onClick={() => { setShowEditorModal(false); setEditingFile(null); }} 
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFileChanges} className="mt-4 flex-1 flex flex-col min-h-0 space-y-4">
              
              {/* Monospace Code Editor Textarea */}
              <div className="flex-1 min-h-0 flex flex-col border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                <textarea
                  rows="15"
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder="// Type code here..."
                  className="w-full flex-1 p-4 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed outline-none overflow-y-auto resize-none"
                  style={{ whiteSpace: 'pre', tabSize: 2 }}
                />
              </div>

              {/* Version Config and Action buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-50 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Bump Version:</label>
                  <input
                    type="text"
                    required
                    value={editorVersion}
                    onChange={(e) => setEditorVersion(e.target.value)}
                    placeholder="e.g. 1.0.1"
                    className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowEditorModal(false); setEditingFile(null); }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editorLoading}
                    className="rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50"
                  >
                    {editorLoading ? 'Saving changes...' : 'Save & Bump Version (+5 pts)'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDetails;
