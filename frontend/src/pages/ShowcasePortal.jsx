import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Heart, 
  MessageSquare, 
  ExternalLink, 
  Github, 
  Search, 
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Flame
} from 'lucide-react';

const ShowcasePortal = () => {
  const { user, API_URL } = useAuth();
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [trending, setTrending] = useState(false);

  // Comments toggler state
  const [activeCommentsShowcaseId, setActiveCommentsShowcaseId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Active Screenshot indices per showcase
  const [screenshotIndices, setScreenshotIndices] = useState({});

  const fetchShowcases = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/showcases`, {
        params: { search, trending }
      });
      setShowcases(res.data);
      
      // Initialize image indices to 0
      const indices = {};
      res.data.forEach(s => {
        indices[s._id] = 0;
      });
      setScreenshotIndices(indices);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcases();
  }, [search, trending]);

  const handleLike = async (showcaseId) => {
    try {
      const res = await axios.put(`${API_URL}/showcases/${showcaseId}/like`);
      setShowcases(showcases.map(s => s._id === showcaseId ? res.data : s));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (e, showcaseId) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await axios.post(`${API_URL}/showcases/${showcaseId}/comments`, {
        content: newComment
      });
      setShowcases(showcases.map(s => s._id === showcaseId ? res.data : s));
      setNewComment('');
    } catch (error) {
      alert(error.message);
    } finally {
      setCommentLoading(false);
    }
  };

  // Image slider navigation
  const nextSlide = (showcaseId, total) => {
    const current = screenshotIndices[showcaseId] || 0;
    const next = current === total - 1 ? 0 : current + 1;
    setScreenshotIndices({ ...screenshotIndices, [showcaseId]: next });
  };

  const prevSlide = (showcaseId, total) => {
    const current = screenshotIndices[showcaseId] || 0;
    const prev = current === 0 ? total - 1 : current - 1;
    setScreenshotIndices({ ...screenshotIndices, [showcaseId]: prev });
  };

  return (
    <div className="space-y-8">
      
      {/* Page Title & Search filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-8 w-8 text-secondary animate-pulse" />
            Project Showcase Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Featured completed student projects, ready for evaluation and review.</p>
        </div>
        
        {/* Toggle Trending filter */}
        <button
          onClick={() => setTrending(!trending)}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${trending ? 'bg-secondary text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-350'}`}
        >
          <Flame className="h-4 w-4" />
          Trending Projects
        </button>
      </div>

      {/* Global Search */}
      <section className="glass rounded-3xl p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search showcases by name, technology, or creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pl-10 pr-4 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900/50"
          />
        </div>
      </section>

      {/* Showcases layout */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading showcase portal featured boards...</div>
      ) : showcases.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400">
          <Award className="h-10 w-10 text-slate-300 mx-auto mb-4" />
          <p className="font-semibold">No featured projects found in showcase.</p>
          <p className="text-xs text-slate-400 mt-1">Complete your team projects and publish them to get showcased!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {showcases.map(showcase => {
            const currentImgIndex = screenshotIndices[showcase._id] || 0;
            const imagesCount = showcase.screenshots?.length || 0;
            const hasImages = imagesCount > 0;
            const isLiked = showcase.likes?.some(id => id.toString() === user?._id.toString());

            return (
              <div 
                key={showcase._id} 
                className="glass flex flex-col justify-between rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800"
              >
                <div className="space-y-4">
                  
                  {/* Screenshots Slider Carousel */}
                  {hasImages ? (
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950">
                      <img 
                        src={showcase.screenshots[currentImgIndex].startsWith('http') ? showcase.screenshots[currentImgIndex] : `http://localhost:5000${showcase.screenshots[currentImgIndex]}`}
                        alt={showcase.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600";
                        }}
                      />
                      
                      {imagesCount > 1 && (
                        <>
                          <button 
                            onClick={() => prevSlide(showcase._id, imagesCount)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 p-1.5 text-white"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => nextSlide(showcase._id, imagesCount)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 p-1.5 text-white"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 w-full rounded-2xl bg-gradient-to-tr from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 flex flex-col items-center justify-center text-slate-400">
                      <TrendingUp className="h-10 w-10 text-primary animate-pulse" />
                      <span className="text-[10px] uppercase font-bold mt-2 tracking-wider text-primary dark:text-primary-light">Featured Project</span>
                    </div>
                  )}

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{showcase.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-3">{showcase.description}</p>
                  </div>

                  {/* Badges tech */}
                  <div className="flex flex-wrap gap-1.5">
                    {showcase.technologies?.map((tech, i) => (
                      <span key={i} className="rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-500 border border-slate-100 dark:border-slate-700/50">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Creators */}
                  <div className="pt-2 border-t border-slate-50 dark:border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide block mb-1">Development Team</span>
                    <div className="flex flex-wrap gap-2">
                      {showcase.teamMembers?.map(member => (
                        <div key={member._id} className="flex items-center gap-1 bg-slate-50/50 rounded-lg py-1 px-2 text-[10px] dark:bg-slate-900/35 border border-slate-100 dark:border-slate-800">
                          <img 
                            src={`http://localhost:5000${member.profilePicture}`}
                            className="h-4 w-4 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=24";
                            }}
                          />
                          <span className="font-semibold text-slate-700 dark:text-slate-350">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer and Interactive panel */}
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 mt-5 space-y-4">
                  
                  {/* Actions buttons and Links */}
                  <div className="flex items-center justify-between text-xs">
                    
                    {/* Likes & Comments clickers */}
                    <div className="flex items-center gap-4 text-slate-500">
                      <button 
                        onClick={() => handleLike(showcase._id)}
                        className={`flex items-center gap-1 font-semibold hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}
                      >
                        <Heart className={`h-4.5 w-4.5 ${isLiked ? 'fill-red-500' : ''}`} />
                        {showcase.likes?.length || 0}
                      </button>

                      <button 
                        onClick={() => setActiveCommentsShowcaseId(activeCommentsShowcaseId === showcase._id ? null : showcase._id)}
                        className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
                      >
                        <MessageSquare className="h-4.5 w-4.5" />
                        {showcase.comments?.length || 0}
                      </button>
                    </div>

                    {/* External links */}
                    <div className="flex items-center gap-3">
                      {showcase.githubLink && (
                        <a 
                          href={showcase.githubLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 border border-slate-200 hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:hover:border-white transition-all"
                          title="View GitHub repository"
                        >
                          <Github className="h-4.5 w-4.5" />
                        </a>
                      )}
                      {showcase.videoLink && (
                        <a 
                          href={showcase.videoLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-lg border border-slate-200 hover:border-primary px-2.5 py-1.5 dark:border-slate-800 text-[10px] font-bold text-slate-650 hover:text-primary dark:text-slate-350 dark:hover:text-primary-light transition-all"
                        >
                          Demo Video <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                  </div>

                  {/* Expand Comments box */}
                  {activeCommentsShowcaseId === showcase._id && (
                    <div className="border-t border-slate-50 dark:border-slate-800 pt-3 space-y-3">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400">Comments</h4>

                      <div className="max-h-36 overflow-y-auto space-y-2.5 pr-1">
                        {showcase.comments?.length === 0 ? (
                          <p className="text-[10px] text-slate-450 italic text-center">No evaluation comments yet.</p>
                        ) : (
                          showcase.comments?.map(comment => (
                            <div key={comment._id} className="bg-slate-50/50 p-2.5 rounded-2xl dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-800">
                              <div className="flex items-center justify-between text-[9px] font-bold text-slate-550 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <img 
                                    src={`http://localhost:5000${comment.user.profilePicture}`}
                                    className="h-4 w-4 rounded-full object-cover"
                                    onError={(e) => {
                                      e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=24";
                                    }}
                                  />
                                  {comment.user.name}
                                </span>
                                <span className="font-normal text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-350">{comment.content}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add comment form */}
                      <form onSubmit={(e) => handleCommentSubmit(e, showcase._id)} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Provide feedback..."
                          className="flex-1 rounded-xl border border-slate-200 bg-white/50 px-3 py-2 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-950"
                        />
                        <button
                          type="submit"
                          disabled={commentLoading}
                          className="rounded-xl bg-primary text-white px-3 py-2 text-xs font-bold shadow-md hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                          Submit
                        </button>
                      </form>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default ShowcasePortal;
