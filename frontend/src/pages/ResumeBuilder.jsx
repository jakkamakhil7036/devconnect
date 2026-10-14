import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  FileText, 
  Save, 
  Printer, 
  Plus, 
  Trash2, 
  Sparkles,
  Award,
  Layers,
  GraduationCap,
  Briefcase
} from 'lucide-react';

const ResumeBuilder = () => {
  const { user, API_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  // Form Editor States (mirrors what the user saves)
  const [objective, setObjective] = useState('');
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState('');
  const [skills, setSkills] = useState('');

  const fetchResumeData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/resume`);
      setResumeData(res.data);
      
      setObjective(res.data.objective || '');
      setEducation(res.data.education || []);
      setCertifications(res.data.certifications ? res.data.certifications.join(', ') : '');
      setSkills(res.data.skills ? res.data.skills.join(', ') : '');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeData();
  }, []);

  const handleAddEducation = () => {
    setEducation([
      ...education,
      { school: '', degree: '', fieldOfStudy: '', startYear: '2022', endYear: '2026', grade: '' }
    ]);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const certsArray = certifications.split(',').map(c => c.trim()).filter(Boolean);
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);

      await axios.post(`${API_URL}/resume`, {
        objective,
        education,
        certifications: certsArray,
        skills: skillsArray
      });

      alert('Resume details saved successfully!');
      fetchResumeData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving resume data.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Compiling resume builder metrics...</div>;
  }

  return (
    <div className="space-y-8">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            AI Resume Builder
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generate a standard, search-optimized ATS friendly resume using your platform project history and profile.</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-all self-start sm:self-center"
        >
          <Printer className="h-5 w-5" />
          Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Editor Column - Left (no-print) */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6 no-print">
          
          <div className="glass rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
              Career Objective
            </h3>
            
            <div>
              <textarea
                rows="4"
                required
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Write a professional objective statement..."
                className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="glass rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-1.5">
                <GraduationCap className="h-4.5 w-4.5 text-primary" />
                Education History
              </h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {education.length === 0 ? (
                <p className="text-[10px] text-slate-450 italic text-center">Add school/college degree logs.</p>
              ) : (
                education.map((edu, idx) => (
                  <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl dark:bg-slate-900/40 border border-slate-100/50 dark:border-slate-800 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase">School / College</label>
                      <input
                        type="text"
                        required
                        value={edu.school}
                        onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                        className="mt-0.5 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">Degree</label>
                        <input
                          type="text"
                          required
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                          className="mt-0.5 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">Field of Study</label>
                        <input
                          type="text"
                          required
                          value={edu.fieldOfStudy}
                          onChange={(e) => handleEducationChange(idx, 'fieldOfStudy', e.target.value)}
                          className="mt-0.5 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">Start Year</label>
                        <input
                          type="text"
                          value={edu.startYear}
                          onChange={(e) => handleEducationChange(idx, 'startYear', e.target.value)}
                          className="mt-0.5 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">End Year</label>
                        <input
                          type="text"
                          value={edu.endYear}
                          onChange={(e) => handleEducationChange(idx, 'endYear', e.target.value)}
                          className="mt-0.5 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">Grade / GPA</label>
                        <input
                          type="text"
                          value={edu.grade}
                          onChange={(e) => handleEducationChange(idx, 'grade', e.target.value)}
                          className="mt-0.5 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-secondary" />
              Certifications & Core Skills
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Certifications (Comma-separated)</label>
                <input
                  type="text"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  placeholder="AWS Developer, Google Cloud Architect"
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Resume Skills (Defaults to profile skills)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/50 px-3.5 py-2.5 text-xs outline-none focus:border-primary dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-3.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving details...' : (
              <>
                <Save className="h-4.5 w-4.5" /> Save Resume Details
              </>
            )}
          </button>

        </form>

        {/* ATS Resume Preview Pane - Right (takes up 3 cols) */}
        <div className="lg:col-span-3 bg-white text-black p-8 sm:p-12 shadow-md border border-slate-100 rounded-3xl print-card print:border-none self-start">
          
          {resumeData && (
            <div className="space-y-6 text-slate-800">
              
              {/* Header: Personal Details */}
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{resumeData.personalDetails?.name}</h2>
                <p className="text-xs text-slate-500">
                  {resumeData.personalDetails?.email} | {resumeData.personalDetails?.phone} | {resumeData.personalDetails?.collegeName}
                </p>
                <div className="flex justify-center gap-3 text-[10px] font-semibold text-primary">
                  {resumeData.personalDetails?.linkedinUrl && <a href={resumeData.personalDetails.linkedinUrl}>LinkedIn</a>}
                  {resumeData.personalDetails?.githubUrl && <a href={resumeData.personalDetails.githubUrl}>GitHub</a>}
                </div>
              </div>

              {/* Career Objective */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5">Career Objective</h3>
                <p className="text-xs text-slate-655 leading-relaxed">{resumeData.objective}</p>
              </div>

              {/* Core Skills */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5">Core Technical Skills</h3>
                <p className="text-xs text-slate-655 leading-relaxed">{resumeData.skills?.join(' • ')}</p>
              </div>

              {/* Education */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5">Education</h3>
                <div className="space-y-2">
                  {resumeData.education?.map((edu, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{edu.school}</p>
                        <p className="text-slate-500">{edu.degree} in {edu.fieldOfStudy}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{edu.startYear} - {edu.endYear || 'Present'}</p>
                        {edu.grade && <p className="text-slate-400 font-medium">Grade: {edu.grade}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5">Collaborations & Projects</h3>
                <div className="space-y-3">
                  {resumeData.projects?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No collaborative project logs found on profile.</p>
                  ) : (
                    resumeData.projects?.map((proj, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{proj.title}</span>
                          <span className="text-slate-500 font-semibold">{proj.role}</span>
                        </div>
                        <p className="text-[11px] text-slate-550 leading-relaxed">{proj.description}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Technologies: {proj.technologies?.join(', ')}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Platform Contributions */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5">Platform Contributions Highlights</h3>
                <div className="space-y-1.5 text-xs">
                  {resumeData.contributions?.length === 0 ? (
                    <p className="text-xs text-slate-450 italic">No logged code uploads or task completed contributions yet.</p>
                  ) : (
                    resumeData.contributions?.map((cont, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-slate-655 leading-relaxed">
                        <span>• {cont.description} ({cont.projectTitle})</span>
                        <span className="font-bold text-primary">+{cont.points} Points</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Certifications if any */}
              {resumeData.certifications?.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 pb-0.5">Certifications</h3>
                  <ul className="list-disc pl-4 text-xs text-slate-655 space-y-0.5">
                    {resumeData.certifications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ResumeBuilder;
