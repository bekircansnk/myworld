import React, { useState, useMemo } from 'react';
import { usePhotoTrackingStore } from '@/stores/photoTrackingStore';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Camera } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';

interface PhotoCalendarProps {
  projectId: number | null;
}

export function PhotoCalendar({ projectId }: PhotoCalendarProps) {
  const { models } = usePhotoTrackingStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const startDay = getDay(startOfMonth(currentDate));
  // adjust for monday start
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Map events
  const getDayEvents = (date: Date) => {
    const events: any[] = [];
    const dateStr = format(date, 'yyyy-MM-dd');
    
    models.forEach(m => {
       // Check if delivery date matches
       if (m.delivery_date && format(new Date(m.delivery_date), 'yyyy-MM-dd') === dateStr) {
          events.push({ type: 'delivery', name: m.model_name });
       }
       
       // Check colors completed
       m.colors.forEach(c => {
          if (c.ig_completed_at && format(new Date(c.ig_completed_at), 'yyyy-MM-dd') === dateStr) {
             events.push({ type: 'ig', name: `${m.model_name} - ${c.color_name} (IG)` });
          }
          if (c.banner_completed_at && format(new Date(c.banner_completed_at), 'yyyy-MM-dd') === dateStr) {
             events.push({ type: 'banner', name: `${m.model_name} - ${c.color_name} (Banner)` });
          }
       });
    });
    
    return events;
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
             <CalendarIcon className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            Aylık Takvim
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Tamamlanan fotoğrafları ve teslimatları takvim üzerinde görün.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-brand-dark dark:text-white min-w-[120px] text-center capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: tr })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex-1 flex flex-col">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {Array.from({ length: adjustedStartDay }).map((_, i) => (
            <div key={`empty-${i}`} className="border-b border-r border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-slate-900/20" />
          ))}
          
          {daysInMonth.map((date, i) => {
            const events = getDayEvents(date);
            const deliveryCount = events.filter(e => e.type === 'delivery').length;
            const photoCount = events.filter(e => e.type !== 'delivery').length;
            
            return (
              <div 
                key={date.toString()} 
                className={`border-b border-r border-slate-100 dark:border-white/5 p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer flex flex-col gap-1
                  ${isToday(date) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}
                `}
              >
                <div className="flex justify-end">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-semibold
                    ${isToday(date) ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}
                  `}>
                    {format(date, 'd')}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 flex-1 overflow-y-auto mt-1 scrollbar-hide">
                   {deliveryCount > 0 && (
                      <div className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded truncate flex items-center gap-1">
                         <CheckCircle2 className="w-3 h-3" /> {deliveryCount} Teslim
                      </div>
                   )}
                   {photoCount > 0 && (
                      <div className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded truncate flex items-center gap-1">
                         <Camera className="w-3 h-3" /> {photoCount} Fotoğraf
                      </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
