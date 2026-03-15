import React, { useEffect, useState } from 'react';
import { VenusExperiment } from '@/types/venus-ads';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { X, CheckCircle2, ChevronRight, Bot, Target, Palette } from 'lucide-react';
import { LinkedItemChip } from '../LinkedItemChip';

interface TestDetailModalProps {
  test: VenusExperiment;
  onClose: () => void;
}

export function TestDetailModal({ test, onClose }: TestDetailModalProps) {
  const { campaigns, creatives, getAIReview } = useVenusAdsStore();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiComment, setAiComment] = useState<string | null>(test.ai_comment || null);

  const linkedCampaign = campaigns.find(c => c.id === test.campaign_id);
  const linkedCreative = creatives.find(c => c.id === test.creative_id);

  useEffect(() => {
    // Otomatik AI Yorumu Üretimi (Eğer yoksa ve test tamamlanmışsa)
    const generateReview = async () => {
      if ((test.status === 'completed' || test.status === 'stopped') && test.learnings && !aiComment && !isAiLoading) {
        setIsAiLoading(true);
        try {
          const comment = await getAIReview(test.id, test.experiment_name, test.hypothesis || '', test.learnings, test.winner);
          setAiComment(comment);
        } catch (e) {
          console.error(e);
        } finally {
          setIsAiLoading(false);
        }
      }
    };

    generateReview();
  }, [test.id, test.status, test.learnings, aiComment]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1a1c23] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="pr-4">
            <h2 className="text-xl font-bold text-brand-dark dark:text-white leading-tight mb-2">
              📝 {test.experiment_name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                test.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/50' :
                test.status === 'running' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50' :
                'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
              }`}>
                {test.status}
              </span>
              {test.winner && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/50 dark:text-amber-400">
                  🏆 Kazanan: {test.winner}
                </span>
              )}
            </div>

            {/* Linked Items */}
            {(linkedCampaign || linkedCreative) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {linkedCampaign && (
                  <LinkedItemChip type="campaign" label={linkedCampaign.campaign_name} />
                )}
                {linkedCreative && (
                  <LinkedItemChip type="creative" label={linkedCreative.creative_name} />
                )}
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors shrink-0 bg-white dark:bg-slate-800 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Hypothesis */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              💡 Hipotez
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-brand-dark dark:text-slate-200 text-base leading-relaxed">
              {test.hypothesis || <span className="text-slate-400 italic">Hipotez girilmemiş.</span>}
            </div>
          </div>

          {/* Learnings */}
          {test.learnings && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                📚 Öğrenim & Çıkarım
              </h3>
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 text-brand-dark dark:text-slate-200 text-base leading-relaxed relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                {test.learnings}
              </div>
            </div>
          )}

          {/* AI Comment */}
          {(aiComment || isAiLoading) && (
             <div>
                <h3 className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  🤖 Yapay Zeka Değerlendirmesi
                </h3>
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 text-brand-dark dark:text-slate-200 text-base leading-relaxed relative">
                  {isAiLoading ? (
                    <div className="flex items-center gap-3 text-indigo-500">
                       <Bot className="w-5 h-5 animate-pulse" />
                       <span className="text-sm font-medium animate-pulse">AI test sonuçlarını analiz ediyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                       <Bot className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
                       <div className="space-y-3 whitespace-pre-wrap">
                          {aiComment}
                       </div>
                    </div>
                  )}
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
