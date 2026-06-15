import React, { useState } from "react";
import { SUPPORTED_LANGUAGES } from "./constants";
import { Language } from "./types";
import { Search, Check, ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  selectedCode: string;
  onSelect: (code: string) => void;
  label: string;
  excludeCode?: string;
}

export function LanguageSelector({ selectedCode, onSelect, label, excludeCode }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedLanguage = SUPPORTED_LANGUAGES.find(l => l.code === selectedCode) || SUPPORTED_LANGUAGES[0];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => {
    if (excludeCode && lang.code === excludeCode) return false;
    return lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           lang.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="relative flex-1">
      <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-wider">
        {label}
      </span>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left shadow-sm"
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className="text-xl shrink-0">{selectedLanguage.flag}</span>
          <span className="text-sm font-bold text-slate-800 dark:text-white truncate">
            {selectedLanguage.name}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close click-outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown Menu */}
          <div className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden max-h-80 flex flex-col scale-100 origin-top animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Search Input */}
            <div className="p-2 border-b border-slate-100 dark:border-white/5 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/40">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Dil ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-1 divide-y divide-slate-50 dark:divide-white/5">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelect(lang.code);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                      selectedCode === lang.code ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span className={`text-sm ${selectedCode === lang.code ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {lang.name}
                      </span>
                    </div>
                    {selectedCode === lang.code && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-xs text-center text-slate-400 italic">
                  Dil bulunamadı.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
