import React from 'react';
import { X, ChevronLeft, ChevronRight, Building2, Users, CheckCircle } from 'lucide-react';
import { StoryItem, Laboratory } from '../types';

interface Props {
  story: StoryItem | null;
  labs: Laboratory[];
  onClose: () => void;
  onNavigateLab?: (labId: string) => void;
}

export const StoriesModal: React.FC<Props> = ({ story, labs, onClose, onNavigateLab }) => {
  if (!story) return null;

  const associatedLab = story.lab_id ? labs.find(l => l.id === story.lab_id) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition z-10"
      >
        <X size={24} />
      </button>

      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 text-white">
        {/* Progress bar line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 w-full animate-pulse"></div>
        </div>

        {/* Story Header */}
        <div className="absolute top-4 left-4 right-12 z-20 flex items-center gap-3 bg-gradient-to-b from-black/80 to-transparent p-2 rounded-2xl">
          <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
            <img
              src={story.image_url}
              alt={story.title}
              className="w-full h-full object-cover rounded-full border-2 border-slate-900"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white">{story.title}</span>
              <span className="text-[10px] bg-pink-500/80 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                {story.tag}
              </span>
            </div>
            <p className="text-xs text-white/70">{story.subtitle}</p>
          </div>
        </div>

        {/* Main Image */}
        <div className="relative h-96 sm:h-[420px] w-full">
          <img
            src={story.image_url}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        </div>

        {/* Story Description & Details */}
        <div className="p-6 relative z-20 -mt-16 space-y-4">
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-3">
            <p className="text-sm leading-relaxed text-slate-200">{story.description}</p>

            {associatedLab && (
              <div className="pt-2 border-t border-white/10 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-pink-400" />
                  <span>{associatedLab.building} - {associatedLab.floor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-rose-400" />
                  <span>ความจุรองรับ {associatedLab.capacity} คน</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={14} />
                  <span>{associatedLab.is_ready ? 'สถานะ: พร้อมใช้งาน' : 'ปรับปรุงอุปกรณ์'}</span>
                </div>
              </div>
            )}
          </div>

          {associatedLab && onNavigateLab && (
            <button
              onClick={() => {
                onNavigateLab(associatedLab.id);
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-pink-500/25 hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <span>ดูข้อมูลห้องปฏิบัติการนี้ & จองห้อง</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
