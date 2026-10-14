import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, 
  BrainCircuit, 
  Users, 
  HelpCircle,
  Laptop,
  Plus,
  Tag
} from 'lucide-react';

const AIRecommendations = () => {
  const { user, API_URL, syncProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [launchingIdx, setLaunchingIdx] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All');
  const [inputs, setInputs] = useState({
    skills: user?.skills ? user.skills.join(', ') : '',
    interests: user?.interests ? user.interests.join(', ') : '',
    branch: user?.branch || ''
  });

  const fetchRecommendations = async (customSkills, customInterests, customBranch) => {
    setLoading(true);
    try {
      const skillsArray = (customSkills || inputs.skills).split(',').map(s => s.trim()).filter(Boolean);
      const interestsArray = (customInterests || inputs.interests).split(',').map(i => i.trim()).filter(Boolean);
      const branchVal = customBranch !== undefined ? customBranch : inputs.branch;

      const res = await axios.post(`${API_URL}/ai/recommend`, {
        skills: skillsArray,
        interests: interestsArray,
        branch: branchVal
      });
      setRecommendations(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch on mount using initial profile parameters
    fetchRecommendations();
  }, []);

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSelectedSkillFilter('All');
    fetchRecommendations();
  };

  const handleLaunchProject = async (idea, idx) => {
    setLaunchingIdx(idx);
    try {
      const res = await axios.post(`${API_URL}/projects`, {
        title: idea.title,
        description: idea.description,
        category: idea.category || 'Software Systems',
        difficulty: idea.difficulty || 'Intermediate',
        requiredTeamSize: idea.teamSize || 3,
        technologies: idea.technologies || []
      });

      await syncProfile();
      navigate(`/projects/${res.data._id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error initializing project workspace.');
    } finally {
      setLaunchingIdx(null);
    }
  };

  const currentSkillList = inputs.skills
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const filteredRecommendations = selectedSkillFilter === 'All'
    ? recommendations
    : recommendations.filter(p => {
        const filterLower = selectedSkillFilter.toLowerCase();
        return (p.matchedSkill && p.matchedSkill.toLowerCase() === filterLower) ||
          p.technologies?.some(t => t.toLowerCase().includes(filterLower)) ||
          p.skills?.some(s => s.toLowerCase().includes(filterLower));
      });

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <section className="rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
            <BrainCircuit className="h-3.5 w-3.5" /> Skill-Matching Recommendation Engine
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl text-white tracking-tight">
            AI Recommended Projects
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Explore tailored project ideas mapped directly to your technical skills, interests, and academic branch. Filter by specific skill to see distinct suggestions.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input parameters card */}
        <div className="glass rounded-2xl p-5 shadow-sm self-start space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Recommendation Settings
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Your Skills (Comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                required
                value={inputs.skills}
                onChange={handleInputChange}
                placeholder="Python, React, Flutter, OpenCV, Node.js"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Interests (Comma-separated)
              </label>
              <input
                type="text"
                name="interests"
                value={inputs.interests}
                onChange={handleInputChange}
                placeholder="AI, WebRTC, Security, Mobile"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Academic Branch
              </label>
              <input
                type="text"
                name="branch"
                value={inputs.branch}
                onChange={handleInputChange}
                placeholder="Computer Science & Engineering"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Analyzing Skills...' : 'Generate Recommendations'}
            </button>

          </form>

          <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300 mb-1">
              <HelpCircle className="h-3.5 w-3.5 text-indigo-500" /> How it works
            </span>
            Our matching engine evaluates your exact skill keywords and constructs tailored project scopes. Click any skill tag to filter distinct project ideas.
          </div>
        </div>

        {/* Outputs recommendation cards */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Skill Filter Pills */}
          {currentSkillList.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" /> Filter by Skill:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSkillFilter('All')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  selectedSkillFilter === 'All'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Matches ({recommendations.length})
              </button>
              {currentSkillList.map((sk, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSkillFilter(sk)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    selectedSkillFilter.toLowerCase() === sk.toLowerCase()
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {sk}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="glass rounded-2xl py-16 text-center text-xs text-slate-500 dark:text-slate-400">
              Processing recommendation engine queries for your skills...
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <Laptop className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                No recommendations match "{selectedSkillFilter}".
              </p>
              <button
                onClick={() => setSelectedSkillFilter('All')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Show All Recommendations
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredRecommendations.map((project, idx) => (
                <div key={idx} className="glass rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        project.difficulty === 'Advanced'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : project.difficulty === 'Intermediate'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {project.difficulty}
                      </span>
                      {project.matchedSkill && (
                        <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-semibold border border-indigo-100 dark:border-indigo-900/40">
                          Matched: {project.matchedSkill}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Users className="h-3.5 w-3.5" />
                      Team Size: {project.teamSize}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies?.map((t, index) => (
                        <span key={index} className="rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleLaunchProject(project, idx)}
                      disabled={launchingIdx === idx}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-all shrink-0 ml-2 disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {launchingIdx === idx ? 'Creating...' : 'Launch Project'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AIRecommendations;
