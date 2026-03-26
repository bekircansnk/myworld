"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { VenusAIAnalysisReport } from '@/types/venus-ads';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Target, MousePointerClick, ShieldCheck, AlertTriangle, Lightbulb, Activity, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { TopNavbar } from '@/components/layout/TopNavbar';

export default function AIDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoDownload = searchParams.get('download') === 'true';
  const { isAuthenticated, checkAuth } = useAuthStore();
  
  const [report, setReport] = useState<VenusAIAnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchReport(params.id as string);
    }
  }, [isAuthenticated, params.id]);

  useEffect(() => {
    if (autoDownload && report && report.analysis_result) {
      const timer = setTimeout(() => {
        downloadPDF();
        router.replace(`/venus-ads/reports/ai/${params.id}`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, report, params.id, router]);

  const fetchReport = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/venus/reports/ai-analysis/${id}`);
      setReport(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = React.useCallback(async () => {
    if (!report || !reportRef.current) return;
    try {
      setIsGeneratingPDF(true);
      
      // Fix for overflow-y scroll issues in html2canvas
      const element = reportRef.current;
      const originalHeight = element.style.height;
      const originalOverflow = element.style.overflow;
      
      // Force element to expand fully for capture
      element.style.height = 'auto';
      element.style.overflow = 'visible';
      
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0a0c10' : '#f8fafc',
        onclone: (clonedDoc) => {
          // Additional cleanup on cloned document if necessary
          const elementsToHide = clonedDoc.querySelectorAll('[data-html2canvas-ignore]');
          elementsToHide.forEach(el => {
             (el as HTMLElement).style.display = 'none';
          });
        }
      });
      
      // Restore original styles
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      // İlk sayfa
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Kalan sayfalar
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`AI_Analiz_${report.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.warn('PDF oluşturulamadı (html2canvas), koruma moduna geçiliyor...', error);
      // Fallback Korumalı Mod: Tarayıcının yerleşik yazdırma aracını çağır (PDF olarak kaydet destekli)
      setTimeout(() => {
        window.print();
      }, 500);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [report, isGeneratingPDF]);

  if (!isAuthenticated || loading) {
    return (
      <div className="flex flex-col h-screen w-full relative bg-slate-50 dark:bg-[#0f1117] items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin dark:border-slate-800 dark:border-t-indigo-400" />
        <p className="mt-4 text-slate-500 font-medium">Dashboard Yükleniyor...</p>
      </div>
    );
  }

  if (!report || !report.analysis_result) {
    return (
      <div className="flex flex-col h-screen w-full relative bg-slate-50 dark:bg-[#0f1117] items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold dark:text-white">Rapor Bulunamadı</h2>
          <button onClick={() => router.back()} className="px-5 py-2.5 bg-brand-dark text-white rounded-xl">Geri Dön</button>
        </div>
      </div>
    );
  }

  const data = report.analysis_result;
  const healthScore = data.SECTION_EXEC_SUMMARY?.overall_health_score || 0;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#0a0c10] print:h-auto print:overflow-visible print:block">
      <TopNavbar />
      
      <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 xl:px-12 print:overflow-visible print:p-0 print:block">
        <div ref={reportRef} className="pb-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} data-html2canvas-ignore className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors print:hidden">
              <ArrowLeft className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="px-2.5 py-1 text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full uppercase">
                  Yapay Zeka Destekli Strateji Özeti
                </div>
                <div className="px-2.5 py-1 text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full uppercase">
                  {data.report_meta?.period || (report.created_at ? report.created_at.split('T')[0] : '')}
                </div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-brand-dark dark:text-white tracking-tight">
                {report.title}
              </h1>
            </div>
          </div>
          <button onClick={downloadPDF} disabled={isGeneratingPDF} data-html2canvas-ignore className="px-5 py-2.5 bg-brand-dark text-white dark:bg-white dark:text-brand-dark rounded-xl font-medium transition-colors flex items-center gap-2 hover:opacity-90 shadow-lg shadow-black/5 dark:shadow-white/5 disabled:opacity-50 print:hidden">
            {isGeneratingPDF ? (
               <div className="w-5 h-5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin dark:border-brand-dark dark:border-t-transparent" />
            ) : (
               <Download className="w-5 h-5" />
            )}
            <span>{isGeneratingPDF ? "Hazırlanıyor..." : "PDF Olarak Al"}</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Executive Summary & KPI Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Executive Note */}
            <div className="xl:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Target className="w-48 h-48 rotate-12" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-4 inline-flex items-center gap-2 bg-black/20 rounded-full px-4 py-1.5 backdrop-blur-sm border border-white/10 w-fit">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Yönetici Özeti</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-6 leading-tight max-w-2xl">
                  {data.SECTION_EXEC_SUMMARY?.headline}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                  <div className="bg-black/10 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-xs font-bold uppercase text-white/70 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" /> Ana Kazanımlar
                    </h3>
                    <ul className="space-y-2">
                      {data.SECTION_EXEC_SUMMARY?.key_wins?.map((win: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-white/50 mt-0.5" />
                          <span>{win}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-black/10 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-xs font-bold uppercase text-white/70 mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" /> Fırsatlar
                    </h3>
                    <ul className="space-y-2">
                      {data.SECTION_EXEC_SUMMARY?.key_opportunities?.map((opp: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 shrink-0 text-white/50 mt-0.5" />
                          <span>{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Score & Primary KPIs */}
            <div className="grid grid-rows-2 gap-6 xl:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Genel Sağlık Skoru</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-6xl font-black tabular-nums tracking-tighter ${
                    healthScore > 80 ? 'text-emerald-500' : healthScore > 60 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {healthScore}
                  </span>
                  <span className="text-xl font-bold text-slate-300 dark:text-slate-600">/100</span>
                </div>
                <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${healthScore > 80 ? 'bg-emerald-500' : healthScore > 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${healthScore}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Toplam Harcama</p>
                    <DollarSign className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-bold text-brand-dark dark:text-white tabular-nums">
                    ₺{data.SECTION_KPI_OVERVIEW?.total_spend?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-emerald-500 mt-1 font-medium flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    Bütçe Verimli
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dönüşüm</p>
                    <MousePointerClick className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-brand-dark dark:text-white tabular-nums">
                    {data.SECTION_KPI_OVERVIEW?.total_conversions?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-emerald-500 mt-1 font-medium flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +{data.SECTION_KPI_OVERVIEW?.conversion_change_pct}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Metrics Cards (3D aesthetic via drop shadows & borders inside) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <MetricCard title="Ortalama ROAS" value={`${data.SECTION_KPI_OVERVIEW?.roas}x`} trend={`${data.SECTION_KPI_OVERVIEW?.roas > 3 ? 'high' : 'low'}`} subtitle="Hedef: 3.5x" />
            <MetricCard title="EBM (CPA)" value={`₺${data.SECTION_KPI_OVERVIEW?.cpa}`} trend="down" subtitle="Önceki: ₺42.5" />
            <MetricCard title="Tıklama Oranı (TO)" value={`%${data.SECTION_KPI_OVERVIEW?.ctr}`} trend="up" subtitle="Sektör Ort. %2.1" />
            <MetricCard title="Satış Geliri" value={`₺${data.SECTION_KPI_OVERVIEW?.total_revenue?.toLocaleString()}`} trend="up" subtitle="Harcama ₺45Bin" isPrimary />
          </div>

          {/* Channel Performance List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-white/5 shadow-sm">
            <h3 className="text-base font-bold text-brand-dark dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Kanal Kırılımı
            </h3>
            <div className="space-y-4">
              {data.SECTION_CHANNEL_BREAKDOWN?.channels?.map((ch: any, i: number) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-start md:items-center gap-6 transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="w-full md:w-48 shrink-0">
                    <h4 className="font-bold text-brand-dark dark:text-white flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${ch.platform?.toLowerCase()?.includes('google') ? 'bg-red-500' : ch.platform?.toLowerCase()?.includes('meta') ? 'bg-blue-500' : 'bg-black dark:bg-white'}`}></div>
                      {ch.platform}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pay: %{ch.spend_share_pct}</p>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Harcama</p>
                      <p className="font-semibold text-brand-dark dark:text-white">₺{ch.spend?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">ROAS</p>
                      <p className={`font-semibold ${ch.roas >= 4 ? 'text-emerald-500' : 'text-brand-dark dark:text-white'}`}>{ch.roas}x</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">EBM</p>
                      <p className="font-semibold text-brand-dark dark:text-white">₺{ch.cpa}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Dönüşüm</p>
                      <p className="font-semibold text-brand-dark dark:text-white">{ch.conversions}</p>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-64 bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-500/10">
                    <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed font-medium">
                      "{ch.ai_insight}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dual Columns: Signal Health & AI Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            
            {/* Recommendations */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-white/5 shadow-sm flex flex-col h-full">
              <h3 className="text-base font-bold text-brand-dark dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" /> Aksiyon Planı (AI Önerileri)
              </h3>
              <div className="space-y-4 flex-1">
                {data.SECTION_RECOMMENDATIONS?.actions?.map((action: any, i: number) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                    <div className={`w-1.5 absolute left-0 top-0 bottom-0 ${action.priority === 'high' ? 'bg-red-500' : action.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                           action.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {action.priority === 'high' ? 'Kritik' : 'Öncelikli'}
                        </span>
                        <h4 className="font-bold text-sm text-brand-dark dark:text-white">{action.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{action.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300">
                          <TrendingUp className="w-3 h-3 text-emerald-500" /> Etki: {action.expected_impact}
                        </span>
                        <span className="text-[10px] flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300">
                          <Activity className="w-3 h-3 text-indigo-500" /> Efor: {action.effort}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signal Health & Forward Planning */}
            <div className="flex flex-col gap-6">
              
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-white/5 shadow-sm">
                <h3 className="text-base font-bold text-brand-dark dark:text-white mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Veri & Sinyal Kalitesi
                </h3>
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-24 h-24 rounded-full border-8 border-slate-100 dark:border-slate-700 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-l-transparent -rotate-45"></div>
                    <div className="text-center">
                      <span className="block text-xl font-bold text-brand-dark dark:text-white">{data.SECTION_SIGNAL_HEALTH?.tracking_coverage_pct}%</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Consent Modu</span>
                      <span className="font-bold text-brand-dark dark:text-white">% {data.SECTION_SIGNAL_HEALTH?.consent_rate_pct} Opt-in</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Piksel Durumu</span>
                      <span className="font-bold text-emerald-500 capitalize">{data.SECTION_SIGNAL_HEALTH?.pixel_health}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-slate-400">CAPI / Server-side</span>
                      <span className="font-bold text-indigo-500 capitalize">{data.SECTION_SIGNAL_HEALTH?.capi_status}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="font-semibold">Sistem Notu:</span> {data.SECTION_SIGNAL_HEALTH?.notes}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-white/5 shadow-sm flex-1">
                <h3 className="text-base font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" /> Gelecek Dönem Hedefleri
                </h3>
                <ul className="space-y-3">
                  {data.SECTION_FORWARD_PLANNING?.next_period_goals?.map((goal: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="leading-snug">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

        </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, trend, isPrimary = false }: { title: string, value: string, subtitle?: string, trend: 'up' | 'down' | 'high' | 'low', isPrimary?: boolean }) {
  const isPositive = trend === 'up' || trend === 'high';
  return (
    <div className={`rounded-3xl p-5 border shadow-sm relative overflow-hidden transition-transform hover:-translate-y-1 ${
      isPrimary 
        ? 'bg-brand-dark dark:bg-indigo-600 border-transparent text-white shadow-xl shadow-brand-dark/20 dark:shadow-indigo-600/20' 
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 text-brand-dark dark:text-white'
    }`}>
      {isPrimary && (
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      )}
      <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 ${isPrimary ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
        {title}
      </p>
      <div className="text-2xl md:text-3xl font-black tabular-nums tracking-tight mb-1">
        {value}
      </div>
      {(subtitle || trend) && (
        <div className="flex items-center gap-1.5 mt-2">
          {isPositive ? (
            <TrendingUp className={`w-3.5 h-3.5 ${isPrimary ? 'text-emerald-300' : 'text-emerald-500'}`} />
          ) : (
            <TrendingDown className={`w-3.5 h-3.5 ${isPrimary ? 'text-red-300' : 'text-red-500'}`} />
          )}
          <span className={`text-[10px] md:text-xs font-medium ${isPrimary ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
