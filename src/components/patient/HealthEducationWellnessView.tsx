import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Heart,
  Droplets,
  Moon,
  Activity,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Clock,
  Shield,
  Search
} from 'lucide-react';
import { HEALTH_EDUCATION_LIBRARY, HealthEducationTopic } from '../../ai/healthEducation';
import { WellnessAI, WellnessPlan } from '../../ai/wellnessAI';
import { useApp } from '../../services/store';

export const HealthEducationWellnessView: React.FC = () => {
  const { playAudioChime, triggerConfetti } = useApp();

  const [activeTab, setActiveTab] = useState<'EDUCATION' | 'WELLNESS'>('EDUCATION');
  const [selectedTopic, setSelectedTopic] = useState<HealthEducationTopic>(HEALTH_EDUCATION_LIBRARY[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Wellness Plan state
  const [wellnessFocus, setWellnessFocus] = useState<'balanced' | 'energy' | 'sleep' | 'heart'>('balanced');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [wellnessPlan, setWellnessPlan] = useState<WellnessPlan | null>(null);

  const filteredTopics = HEALTH_EDUCATION_LIBRARY.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.simpleExplanation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateWellness = async () => {
    setIsGeneratingPlan(true);
    playAudioChime('click');
    try {
      const plan = await WellnessAI.generateRoutine(wellnessFocus, 'moderate');
      setWellnessPlan(plan);
      setIsGeneratingPlan(false);
      playAudioChime('success');
      triggerConfetti();
    } catch {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Health Education & Wellness Intelligence</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 text-xs font-bold border border-teal-500/30">
              Evidence-Based Guidance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Understand medical concepts simply and generate healthy daily lifestyle routines powered by HealthAI.
          </p>
        </div>

        <div className="flex rounded-2xl bg-slate-950 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab('EDUCATION')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'EDUCATION'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Health Education</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('WELLNESS');
              if (!wellnessPlan) handleGenerateWellness();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'WELLNESS'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wellness Planner</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HEALTH EDUCATION LIBRARY */}
      {/* ========================================================================= */}
      {activeTab === 'EDUCATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Topics List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g. Heart, Sugar, Stress)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              {filteredTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedTopic.id === topic.id
                      ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-950/40'
                      : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                    {topic.category}
                  </span>
                  <div className="text-xs font-bold text-white mt-0.5">{topic.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Detail (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 uppercase">
                  {selectedTopic.category}
                </span>
                <h2 className="text-lg font-bold text-white mt-2">{selectedTopic.title}</h2>
              </div>

              {/* Simple Explanation */}
              <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-1.5">
                <span className="text-xs font-bold text-teal-300">In Plain Language:</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedTopic.simpleExplanation}
                </p>
              </div>

              {/* Key Medical Facts */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Essential Facts</h3>
                <div className="space-y-2">
                  {selectedTopic.keyFacts.map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prevention Tips */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Everyday Prevention Tips</h3>
                <div className="space-y-2">
                  {selectedTopic.preventionTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                      <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* When to see doctor */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>When to Consult a Physician:</span>
                </div>
                <p className="leading-relaxed text-slate-300 text-[11px]">
                  {selectedTopic.whenToSeeDoctor}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WELLNESS AI PLANNER */}
      {/* ========================================================================= */}
      {activeTab === 'WELLNESS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Personalized Daily Healthy Routine</span>
              </h2>
              <p className="text-xs text-slate-400">
                Non-diagnostic lifestyle blueprint balancing activity, nutrition, hydration, and sleep.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={wellnessFocus}
                onChange={e => setWellnessFocus(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="balanced">Balanced Wellness</option>
                <option value="energy">High Energy & Focus</option>
                <option value="sleep">Sleep Rest & Recovery</option>
                <option value="heart">Heart Cardio Support</option>
              </select>

              <button
                onClick={handleGenerateWellness}
                disabled={isGeneratingPlan}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPlan ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {wellnessPlan && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Goals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {wellnessPlan.goals.map((g, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>{g}</span>
                  </div>
                ))}
              </div>

              {/* Schedule Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Wellness Schedule</h3>
                <div className="space-y-2.5">
                  {wellnessPlan.schedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
                          {item.category === 'HYDRATION' && <Droplets className="w-4 h-4 text-cyan-400" />}
                          {item.category === 'ACTIVITY' && <Activity className="w-4 h-4 text-emerald-400" />}
                          {item.category === 'NUTRITION' && <Heart className="w-4 h-4 text-rose-400" />}
                          {item.category === 'MINDFULNESS' && <Sparkles className="w-4 h-4 text-purple-400" />}
                          {item.category === 'SLEEP' && <Moon className="w-4 h-4 text-indigo-400" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{item.title}</div>
                          <div className="text-[11px] text-slate-400">{item.recommendation}</div>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-teal-300 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 shrink-0">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-[11px] text-slate-400 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{wellnessPlan.disclaimer}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
