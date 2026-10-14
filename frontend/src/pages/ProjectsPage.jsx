import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Plus, 
  Layers, 
  Award, 
  Users, 
  Grid,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';

const ProjectsPage = () => {
  const { user, API_URL } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Search and Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [branch, setBranch] = useState('');
  const [aiSearch, setAiSearch] = useState(false);

  // Create Project State
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    requiredTeamSize: 3,
    category: 'Web Development',
    difficulty: 'Intermediate'
  });
  const [createLoading, setCreateLoading] = useState(false);

  // AI Project Generation / Suggestion State
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);

  const handleAiSuggest = async () => {
    if (aiSuggestLoading) return;
    setAiSuggestLoading(true);
    try {
      const res = await axios.get(`${API_URL}/ai/suggest`, {
        params: { query: search || 'creative team projects' }
      });
      setAiSuggestions(res.data);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      alert("Failed to generate AI suggestions.");
    } finally {
      setAiSuggestLoading(false);
    }
  };

  const handleImportAiProject = async (projectData) => {
    try {
      await axios.post(`${API_URL}/projects`, {
        title: projectData.title,
        description: projectData.description,
        technologies: projectData.technologies,
        requiredTeamSize: projectData.teamSize || 3,
        category: projectData.category || 'Web Development',
        difficulty: projectData.difficulty || 'Intermediate'
      });
      alert(`Successfully launched "${projectData.title}" in DevConnect!`);
      setAiSuggestions([]);
      fetchProjects();
    } catch (error) {
      console.error("Error importing AI project:", error);
      alert(error.response?.data?.message || 'Error launching AI project.');
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = aiSearch ? {
        aiSearchBySkills: 'true',
        skills: user?.skills?.join(',') || ''
      } : {
        search,
        category,
        difficulty,
        status,
        branch
      };
      const res = await axios.get(`${API_URL}/projects`, { params });
      setProjects(res.data);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, category, difficulty, status, branch, aiSearch]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await axios.post(`${API_URL}/projects`, newProject);
      setShowCreateModal(false);
      setNewProject({
        title: '',
        description: '',
        technologies: '',
        requiredTeamSize: 3,
        category: 'Web Development',
        difficulty: 'Intermediate'
      });
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
      alert(error.response?.data?.message || 'Error creating project.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Collaborations & Teams</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Discover projects, join student teams, and build together.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-bold text-white shadow-md hover:opacity-95 transition-all self-start sm:self-center"
        >
          <Plus className="h-5 w-5" />
          Create Project
        </button>
      </div>

      {/* Search & Filters Glass panel */}
      <section className="glass rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search projects, technologies, or keywords..."
            value={search}
            disabled={aiSearch}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-900/50 disabled:opacity-50"
          />
        </div>

        {/* AI Skill Search and Suggestion Toggles */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setAiSearch(!aiSearch)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border shadow-sm ${aiSearch ? 'bg-gradient-to-r from-primary to-secondary text-white border-transparent' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'}`}
          >
            <Sparkles className={`h-4.5 w-4.5 ${aiSearch ? 'animate-pulse text-yellow-300' : ''}`} />
            {aiSearch ? 'AI Skill Match Active' : '💡 AI Search by My Skills'}
          </button>

          <button
            type="button"
            onClick={handleAiSuggest}
            disabled={aiSuggestLoading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 transition-all text-white px-4 py-2.5 text-xs font-bold border border-transparent shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`h-4.5 w-4.5 ${aiSuggestLoading ? 'animate-spin' : ''}`} />
            {aiSuggestLoading ? 'Generating AI Projects...' : '🤖 Generate AI Suggestions'}
          </button>
          
          {aiSearch && (
            <span className="text-xs font-semibold text-primary dark:text-primary-light animate-pulse ml-auto">
              Found matching project(s) based on your profile skills: <span className="underline italic">{user?.skills?.join(', ') || 'No skills set'}</span>
            </span>
          )}
        </div>


        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Category */}
          <div>
            <select
              value={category}
              disabled={aiSearch}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900/50 disabled:opacity-50"
            >
              <option value="">All Categories</option>
              <option>Web Development</option>
              <option>Mobile Apps</option>
              <option>AI / Machine Learning</option>
              <option>Data Science</option>
              <option>Blockchain</option>
              <option>IoT / Hardware</option>
              <option>Software Systems</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <select
              value={difficulty}
              disabled={aiSearch}
              onChange={(e) => setDifficulty(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900/50 disabled:opacity-50"
            >
              <option value="">All Difficulties</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              disabled={aiSearch}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900/50 disabled:opacity-50"
            >
              <option value="">All Statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>

          {/* Branch filter */}
          <div>
            <input
              type="text"
              placeholder="Branch (e.g. Computer Science)"
              value={branch}
              disabled={aiSearch}
              onChange={(e) => setBranch(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white/50 px-3 py-2.5 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900/50 disabled:opacity-50"
            />
          </div>

        </div>

      </section>

      {/* AI Suggested Projects Section */}
      {aiSuggestions.length > 0 && (
        <section className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                AI Suggested Projects Matching "{search || 'Your Profile'}"
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                These are generative design concepts. Click "Launch Project" to initialize them inside DevConnect.
              </p>
            </div>
            <button 
              onClick={() => setAiSuggestions([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Clear Suggestions
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {aiSuggestions.map((idea, idx) => (
              <div 
                key={idx} 
                className="glass flex flex-col justify-between rounded-3xl p-6 shadow-md border border-teal-500/20 dark:border-teal-500/30 relative overflow-hidden bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5"
              >
                <div className="absolute top-0 right-0 bg-teal-500/10 text-teal-600 dark:bg-teal-500/25 dark:text-teal-400 px-3 py-1 rounded-bl-2xl text-[9px] font-extrabold uppercase">
                  AI Concept
                </div>
                
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-teal-500/5 px-2.5 py-1 text-[10px] font-bold text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                      {idea.category}
                    </span>
                    <span className="rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide bg-amber-500/10 text-amber-500">
                      {idea.difficulty}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                      {idea.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {idea.description}
                    </p>
                  </div>
                </div>

                <div className="my-5 flex flex-wrap gap-1.5">
                  {idea.technologies?.slice(0, 4).map((tech, i) => (
                    <span key={i} className="rounded-md bg-teal-500/5 px-2 py-0.5 text-[10px] text-teal-600 font-semibold border border-teal-500/10">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="border-t border-slate-50 dark:border-slate-800/60 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>Team: {idea.teamSize}</span>
                  </div>
                  <button 
                    onClick={() => handleImportAiProject(idea)}
                    className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    <span>Launch Project</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects List grid */}

      {/* Projects List grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Retrieving platform collaborations...</div>
      ) : projects.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">No project workspaces match your search filters.</p>
          <button 
            onClick={() => { setSearch(''); setCategory(''); setDifficulty(''); setStatus(''); setBranch(''); setAiSearch(false); }}
            className="mt-4 text-sm font-bold text-primary hover:underline dark:text-primary-light"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Link 
              key={project._id}
              to={`/projects/${project._id}`}
              className="glass hover-scale flex flex-col justify-between rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-primary/20 dark:border-slate-800"
            >
              {/* Header */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary dark:bg-primary/25 dark:text-primary-light">
                    {project.category}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${project.difficulty === 'Advanced' ? 'bg-red-500/10 text-red-500' : project.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                    {project.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 hover:text-primary dark:text-white transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Technologies BADGES */}
              <div className="my-5 flex flex-wrap gap-1.5">
                {project.technologies?.slice(0, 4).map((tech, idx) => (
                  <span key={idx} className="rounded-md bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-500 font-semibold border border-slate-100 dark:border-slate-700/50">
                    {tech}
                  </span>
                ))}
                {project.technologies?.length > 4 && (
                  <span className="text-[10px] text-slate-400 self-center">+{project.technologies.length - 4} more</span>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-50 dark:border-slate-800/60 pt-4 flex items-center justify-between">
                
                {/* Team counter status */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {project.members?.length} / {project.requiredTeamSize}
                  </span>
                  <span className="text-[10px] text-slate-400">Members</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-primary dark:text-primary-light group">
                  <span>Enter Board</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

            </Link>
          ))}
        </section>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary animate-pulse" />
                Launch New Project
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Student Performance Prediction System"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Summarize your project goals, timelines and stack..."
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Required Team Size</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newProject.requiredTeamSize}
                    onChange={(e) => setNewProject({ ...newProject, requiredTeamSize: parseInt(e.target.value) })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option>Web Development</option>
                    <option>Mobile Apps</option>
                    <option>AI / Machine Learning</option>
                    <option>Data Science</option>
                    <option>Blockchain</option>
                    <option>IoT / Hardware</option>
                    <option>Software Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Difficulty Level</label>
                  <select
                    value={newProject.difficulty}
                    onChange={(e) => setNewProject({ ...newProject, difficulty: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Technologies (Comma-separated)</label>
                <input
                  type="text"
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                  placeholder="React, Node.js, Express, Chart.js"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50"
                >
                  {createLoading ? 'Publishing...' : 'Launch Project'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectsPage;
