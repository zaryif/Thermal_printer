import React from 'react';
import { Layers, X, Check, ArrowRight } from 'lucide-react';
import { PRESET_TEMPLATES } from '../services/templates';
import { TemplateDefinition, PaperWidth } from '../types/printer';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateDefinition) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
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
              <h2 className="text-base font-bold text-white">Professional Thermal Templates</h2>
              <p className="text-xs text-slate-400">Pre-built layouts formatted for 58mm & 80mm thermal paper</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <span className="text-[10px] font-mono text-amber-400">
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
