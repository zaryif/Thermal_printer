import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  X,
  Check,
  ArrowRight,
  Bookmark,
  Plus,
  Trash2,
  Download,
  Upload,
  Sparkles
} from 'lucide-react';
import { PRESET_TEMPLATES } from '../services/templates';
import { TemplateDefinition, PaperWidth, ReceiptBlock } from '../types/printer';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateDefinition) => void;
  currentBlocks?: ReceiptBlock[];
  currentPaperWidth?: PaperWidth;
}

const STORAGE_KEY_CUSTOM_TEMPLATES = 'tp_custom_templates';

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentBlocks = [],
  currentPaperWidth = '58mm'
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'saved'>('presets');
  const [customTemplates, setCustomTemplates] = useState<TemplateDefinition[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateTagline, setNewTemplateTagline] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadCustomTemplates();
    }
  }, [isOpen]);

  const loadCustomTemplates = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_TEMPLATES);
      if (saved) {
        setCustomTemplates(JSON.parse(saved));
      } else {
        setCustomTemplates([]);
      }
    } catch (e) {
      console.warn('Failed to parse custom templates', e);
      setCustomTemplates([]);
    }
  };

  const handleSaveCurrent = () => {
    if (!newTemplateName.trim()) {
      alert('Please enter a name for your template.');
      return;
    }

    const newTmpl: TemplateDefinition = {
      id: 'custom_' + Date.now(),
      name: newTemplateName.trim(),
      tagline: newTemplateTagline.trim() || 'User custom designed thermal layout',
      category: 'custom' as any,
      paperWidth: currentPaperWidth,
      blocks: currentBlocks
    };

    const updated = [newTmpl, ...customTemplates];
    setCustomTemplates(updated);
    localStorage.setItem(STORAGE_KEY_CUSTOM_TEMPLATES, JSON.stringify(updated));

    setNewTemplateName('');
    setNewTemplateTagline('');
    setIsSaving(false);
    setActiveTab('saved');
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this saved custom template?')) {
      const updated = customTemplates.filter((t) => t.id !== id);
      setCustomTemplates(updated);
      localStorage.setItem(STORAGE_KEY_CUSTOM_TEMPLATES, JSON.stringify(updated));
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(
        {
          name: 'My Thermal Receipt',
          paperWidth: currentPaperWidth,
          blocks: currentBlocks,
          exportedAt: new Date().toISOString()
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `thermal-receipt-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
          const importedTmpl: TemplateDefinition = {
            id: 'imported_' + Date.now(),
            name: parsed.name || 'Imported Template',
            tagline: `Imported from JSON (${parsed.blocks.length} blocks)`,
            category: 'custom' as any,
            paperWidth: parsed.paperWidth || currentPaperWidth,
            blocks: parsed.blocks
          };
          onSelectTemplate(importedTmpl);
          onClose();
        } else {
          alert('Invalid template format: Missing blocks array.');
        }
      } catch (err: any) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Thermal Templates & Layouts</h2>
              <p className="text-xs text-slate-400">Pre-built presets or save & reload your custom receipts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Actions Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/50 px-6 pt-2">
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setActiveTab('presets')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Presets ({PRESET_TEMPLATES.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              My Custom Templates ({customTemplates.length})
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleExportJson}
              title="Export Current Receipt as JSON"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import Receipt from JSON"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import JSON</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Save Current Banner */}
          {!isSaving ? (
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Like your current design?</span>
                <span className="text-[11px] text-slate-400">Save your current canvas as a reusable custom template ({currentBlocks.length} blocks)</span>
              </div>
              <button
                onClick={() => setIsSaving(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Save Current
              </button>
            </div>
          ) : (
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/50 space-y-3">
              <h4 className="text-xs font-bold text-amber-400">Save Current Layout as Custom Template</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Template Name (e.g. My Study Schedule)"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Short Description / Tagline"
                  value={newTemplateTagline}
                  onChange={(e) => setNewTemplateTagline(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsSaving(false)}
                  className="px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCurrent}
                  className="px-4 py-1 text-xs rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Confirm &amp; Save
                </button>
              </div>
            </div>
          )}

          {/* Preset Templates Grid */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/60 p-4 rounded-xl cursor-pointer transition-all hover:shadow-lg group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                        {tmpl.category}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-semibold">
                        {tmpl.paperWidth}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition-colors">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {tmpl.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-300 font-medium">
                    <span>{tmpl.blocks.length} blocks included</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Load Template <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Custom Templates Grid */}
          {activeTab === 'saved' && (
            <div>
              {customTemplates.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                  <Bookmark className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No Custom Templates Yet</p>
                  <p className="text-xs text-slate-500 mt-1">Design any receipt on the canvas and click "Save Current" above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customTemplates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        onSelectTemplate(tmpl);
                        onClose();
                      }}
                      className="bg-slate-950 border border-slate-800 hover:border-amber-500/60 p-4 rounded-xl cursor-pointer transition-all hover:shadow-lg group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                            CUSTOM
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-amber-400">
                              {tmpl.paperWidth}
                            </span>
                            <button
                              onClick={(e) => handleDeleteCustom(tmpl.id, e)}
                              className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800"
                              title="Delete template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition-colors">
                          {tmpl.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {tmpl.tagline}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-300 font-medium">
                        <span>{tmpl.blocks.length} blocks</span>
                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Load Template <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
