import React, { useState } from 'react';
import {
  Database,
  X,
  Copy,
  Check,
  Link2,
  Key,
  Server,
  ShieldCheck,
  Code
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, SUPABASE_SQL_SCHEMA, SupabaseConfig } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isConnected = !!(config.url && config.anonKey);
    const newConfig = { ...config, isConnected };
    saveSupabaseConfig(newConfig);
    setSavedMsg('บันทึกการตั้งค่า Supabase เรียบร้อยแล้ว!');
    setTimeout(() => {
      setSavedMsg('');
      onClose();
    }, 800);
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 border-b pb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Database size={26} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              การเชื่อมต่อ Supabase Backend Database
            </h3>
            <p className="text-xs text-slate-500">
              กำหนดค่า Supabase URL และ Anon Key หรือใช้ระบบ Local Sync Store
            </p>
          </div>
        </div>

        {savedMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
            {savedMsg}
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
              Supabase Project URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Link2 size={16} />
              </div>
              <input
                type="text"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
              Supabase Anon API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Key size={16} />
              </div>
              <input
                type="password"
                value={config.anonKey}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
          >
            บันทึกและเชื่อมต่อ Supabase
          </button>
        </form>

        {/* SQL Schema Generator Section */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Code size={18} className="text-emerald-500" />
              <span>คำสั่ง SQL DDL สำหรับสร้างตารางใน Supabase Editor</span>
            </h4>
            <button
              onClick={copySqlToClipboard}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              {copiedSql ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedSql ? 'คัดลอก SQL แล้ว!' : 'คัดลอกคำสั่ง SQL'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>

      </div>
    </div>
  );
};
