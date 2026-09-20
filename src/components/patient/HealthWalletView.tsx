import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  Search,
  ShieldCheck,
  Plus,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useApp } from '../../services/store';
import { MedicalRecordDocument } from '../../types';

export const HealthWalletView: React.FC = () => {
  const { documents, activePatient, uploadDocument, deleteDocument, playAudioChime, triggerConfetti } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MedicalRecordDocument['recordType']>('CLINICAL_NOTE');
  const [newProvider, setNewProvider] = useState('Dr. Ananya Sharma');
  const [newFacility, setNewFacility] = useState('District Health Centre (DHC)');
  const [fileName, setFileName] = useState<string | null>(null);

  const myDocuments = documents.filter(d => d.patientId === activePatient.id);

  const filteredDocs = myDocuments.filter(d => {
    const matchesCat = activeCategory === 'ALL' || d.recordType === activeCategory;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsUploading(true);
    playAudioChime('click');

    try {
      await uploadDocument({
        patientId: activePatient.id,
        title: newTitle,
        recordType: newType,
        date: new Date().toISOString().split('T')[0],
        provider: newProvider,
        facility: newFacility,
        fileName: fileName || `${newTitle.replace(/\s+/g, '_')}.pdf`,
        fileSize: '410 KB',
        tags: ['Self-Uploaded', newType, 'ABDM-Linked']
      });

      setIsUploading(false);
      setNewTitle('');
      setFileName(null);
      playAudioChime('success');
      triggerConfetti();
    } catch (err) {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold font-display text-white">Digital Health Wallet & Records</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold border border-cyan-500/30">
              Document AI Enabled
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Unified personal health record (PHR) repository for prescriptions, radiology scans, lab PDFs, and discharge summaries.
          </p>
        </div>
      </div>

      {/* Upload and Search Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Document AI Uploader (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Upload className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Upload & Classify Medical Record</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Chest X-Ray Report, Discharge Summary"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Document Category</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="CLINICAL_NOTE">Clinical Consultation Note</option>
                  <option value="LAB_REPORT">Pathology / Lab Report</option>
                  <option value="PRESCRIPTION">Doctor Prescription</option>
                  <option value="RADIOLOGY">Radiology / X-Ray / CT Scan</option>
                  <option value="VACCINATION">Vaccination Certificate</option>
                  <option value="DISCHARGE_SUMMARY">Hospital Discharge Summary</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Doctor / Provider</label>
                  <input
                    type="text"
                    value={newProvider}
                    onChange={e => setNewProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hospital / Lab</label>
                  <input
                    type="text"
                    value={newFacility}
                    onChange={e => setNewFacility(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Drag Drop Simulator */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-700 text-center space-y-2">
                <FileText className="w-8 h-8 text-cyan-400 mx-auto" />
                <div className="text-xs text-slate-300 font-semibold">
                  {fileName ? fileName : 'Choose PDF, PNG or DICOM file'}
                </div>
                <label className="inline-block cursor-pointer px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold">
                  <span>Browse File</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setFileName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading || !newTitle.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Document AI Extracting Metadata...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save to Encrypted Health Wallet</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right List: Wallet Files (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            {/* Search & Category Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search records by title or tags..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'CLINICAL_NOTE', 'LAB_REPORT', 'RADIOLOGY', 'VACCINATION'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      activeCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-850'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Records' : cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Cards */}
            <div className="space-y-3">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-850 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <h3 className="font-bold text-white text-sm">{doc.title}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {doc.recordType}
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs">
                      {doc.facility} • {doc.provider} ({doc.date})
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {doc.tags?.map((t, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => alert(`Opening ${doc.fileName}...`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{doc.fileSize || 'PDF'}</span>
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
