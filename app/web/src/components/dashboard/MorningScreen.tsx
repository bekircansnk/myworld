"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { 
  Sun, Moon, Sunrise, Sunset, Sparkles, 
  CheckCircle2, Clock, Calendar, AlertCircle, 
  ArrowRight, BrainCircuit, RefreshCw 
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useTaskStore } from "@/stores/taskStore"
import { useCalendarStore } from "@/stores/calendarStore"
import { useProjectStore } from "@/stores/projectStore"
import { api } from "@/lib/api"
import { Task } from "@/types"
import { CalendarEvent } from "@/types/calendar"

interface MorningScreenProps {
  onDismiss: () => void;
}

export function MorningScreen({ onDismiss }: MorningScreenProps) {
  const { user } = useAuthStore()
  const { tasks, fetchTasks } = useTaskStore()
  const { events, fetchEvents } = useCalendarStore()
  const { selectedProjectId } = useProjectStore()

  // Durum Yönetimi (State Management)
  const [mounted, setMounted] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const [motivation, setMotivation] = React.useState<string>("")
  const [isAiLoading, setIsAiLoading] = React.useState(false)

  // Saate Göre Karşılama ve Tema Belirleme
  const greetingInfo = React.useMemo(() => {
    if (!mounted) return { text: "Günaydın", icon: <Sunrise className="w-8 h-8 text-amber-500 animate-pulse" />, gradient: "from-amber-500/20 via-orange-500/10 to-transparent" }
    
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return {
        text: "Günaydın",
        icon: <Sunrise className="w-8 h-8 text-amber-500 animate-pulse" />,
        gradient: "from-amber-500/20 via-orange-500/10 to-transparent"
      }
    } else if (hour >= 12 && hour < 17) {
      return {
        text: "Tünaydın",
        icon: <Sun className="w-8 h-8 text-yellow-500 animate-spin-slow" />,
        gradient: "from-yellow-500/20 via-amber-500/10 to-transparent"
      }
    } else if (hour >= 17 && hour < 22) {
      return {
        text: "İyi Akşamlar",
        icon: <Sunset className="w-8 h-8 text-rose-500" />,
        gradient: "from-rose-500/20 via-purple-500/10 to-transparent"
      }
    } else {
      return {
        text: "İyi Geceler",
        icon: <Moon className="w-8 h-8 text-indigo-400" />,
        gradient: "from-indigo-500/25 via-slate-900/40 to-transparent"
      }
    }
  }, [mounted])

const MOTIVATIONAL_QUOTES = [
  "Bugün yapacağın en küçük bir ilerleme, yarınki büyük hedefine giden yolu açar.",
  "Güne en önemli işini tamamlayarak başla. Zor olanı önce halledersen, günün geri kalanı kolaylaşır.",
  "Üretkenlik çok çalışmak değil, odaklanmaktır. Bugün hedeflerini sadeleştir.",
  "Harika işler yapmanın tek yolu, yaptığın işi sevmektir. Bugünün tadını çıkar!",
  "Hatalar, denediğinin ve ilerlediğinin kanıtıdır. Hatalardan öğren ve devam et.",
  "Bugünün planını sabah yaparsan, gün içindeki kararsızlıkları en aza indirirsin.",
  "Zorlu görevleri küçük parçalara böl. Alt görevleri kullanmayı unutma!",
  "Her gün %1 daha iyi olmak, uzun vadede seni bambaşka bir noktaya taşır.",
  "Bugün odaklan, yarın kendine teşekkür edeceksin.",
  "Derin çalışma seansları (Deep Work) yarat. Dikkat dağıtıcıları uzaklaştır ve sadece işine odaklan.",
  "Başarı, hazırlık ve fırsatın karşılaştığı yerdir. Bugün yeni fırsatlara hazır mısın?",
  "Motivasyon başlamanı sağlar, alışkanlıklar ise devam ettirir. Bugün iyi bir alışkanlık edin.",
  "Zorluklar, yeteneklerini geliştirebileceğin en iyi fırsatlardır. Güçlükleri kucakla.",
  "Bugün dünden daha verimli bir gün geçirmek için yepyeni bir sayfa.",
  "Başarı, her gün sabırla yapılan küçük tekrarların toplamıdır.",
  "Zihnini sadeleştir, önceliklerini belirle ve sadece sıradaki göreve odaklan.",
  "Büyük hedeflere ulaşmak, küçük adımları kararlılıkla atmaktan geçer.",
  "Bugün kendinin en iyi versiyonu olmak için yeni bir şansın var.",
  "Yapabileceğinize inanın; yolun yarısını zaten tamamlamış olursunuz.",
  "Günün başarısı, ne kadar meşgul olduğunla değil, ne kadar odaklandığınla ölçülür.",
  "Ertelemek, zaman hırsızıdır. Bugün ertelemek yerine sadece 5 dakika odaklanarak başla.",
  "Yaratıcılık, cesaret gerektirir. Bugün yeni fikirler denemekten çekinme.",
  "Düzenli olmak zihni özgürleştirir. Planını kontrol et ve adım adım ilerle.",
  "Her büyük mimari, küçük bir çizgiyle başlar. Bugünün görevlerini küçümseme.",
  "Bugün zihnini gereksiz yüklerden arındır. Sadece yapabileceğin en iyi işe odaklan.",
  "Umutsuzluğa kapıldığında neden başladığını hatırla. Yolun sonu harika olacak.",
  "Kendi sınırlarını aşmak için konfor alanından çıkmalısın. Bugün biraz daha fazlasını dene.",
  "Başarı sessizce kazanılır, gürültüyle kutlanır. Bugün sessizce üretme günü.",
  "Zaman en değerli sermayendir. Onu seni geliştirmeyen şeylere harcama.",
  "Kendine güven. Bugüne kadar başardığın her şey, gelecekte başarabileceklerinin kanıtıdır.",
  "Disiplin, isteklerinle hedeflerin arasında köprü kurar. Köprüyü bugün inşa et.",
  "Güne bir gülümsemeyle ve net bir planla başla. Pozitif enerji verimliliği artırır.",
  "En iyi kod, yazılmamış kod kadar sade olandır. İşlerinde de sadeliği hedefle.",
  "Bugün yarım kalan işleri tamamlamak için harika bir gün. Eskileri bitir, yenilere yer aç.",
  "Büyük sonuçlar, tutarlı çabaların ürünüdür. Bugünün çabası yarının meyvesidir.",
  "Kararlılık, engelleri basamaklara dönüştürür. Adımını sağlam at.",
  "Kendini başkalarıyla değil, dünkü halinle kıyasla. Her gün biraz daha ileri git.",
  "Bugün hedeflerine ulaşmak için enerjini yüksek tut. Başarı enerjiyi sever.",
  "İyi planlanmış bir gün, sürprizleri en aza indirir. Günlük özetini iyi incele.",
  "Odaklanmak 'evet' demek değil, diğer yüzlerce iyi fikre 'hayır' demektir.",
  "Başarı, başarısızlıktan başarısızlığa coşkuyu kaybetmeden yürümektir.",
  "Gelecek, bugün ne yaptığına bağlı olarak şekillenir. Bugünün hakkını ver.",
  "Yorulunca dinlenmeyi öğren, pes etmeyi değil.",
  "Bugün karşılaştığın her problem, çözülmeyi bekleyen bir bulmacadır. Keyfini çıkar.",
  "Zor işleri sabah saatlerinde hallet. Günün geri kalanında zihnin çok daha hafif olsun.",
  "Küçük adımlar atarak da dağın zirvesine ulaşabilirsin. Sabırlı ol.",
  "Bugün sadece kendi işine odaklan ve dış gürültüleri kapat.",
  "Başarılı olmak için dahi olmaya gerek yok; kararlı olmak yeterlidir.",
  "Her gün yeni bir başlangıçtır. Dünün hatalarını dün bırak, bugün yepyeni bir gün.",
  "Fikirler ucuzdur, asıl olan uygulamaktır. Bugün fikirlerini hayata geçir.",
  "Zorluklar seni durdurmak için değil, güçlendirmek içindir. Devam et.",
  "Bugün iş listeni kontrol et, en kritik 3 görevi seç ve onları bitirmeden uyuma.",
  "Kendine inanmak, başarının ilk sırrıdır. Bugün yapabileceğine inan.",
  "En büyük başarılar, kimse sana inanmadığında çalışmaya devam etmektir.",
  "Verimlilik, daha az zamanda daha akıllıca çalışmaktır. Sistemini optimize et.",
  "Bugün tüm dikkatini tek bir işe ver. Multitasking üretkenliği öldürür.",
  "Yapılacak en iyi şey, başlamaktır. İlk adımı at, devamı kendiliğinden gelecektir.",
  "Başarı bir varış noktası değil, bir yolculuktur. Bugün bu yolculuğun tadını çıkar.",
  "Bugün işlerini bitirip arkana yaslandığında hissedeceğin o huzuru hayal et.",
  "Zamanını planla, planına sadık kal. Disiplin seni özgürleştirecektir.",
  "Bugün hedeflerine giden yolda bir taş daha koy. Yarın o duvar yükselecek.",
  "Zihnindeki şüpheleri sustur. Sen bu işi yapabilecek yeteneğe sahipsin.",
  "Daha akıllı çalış, daha çok değil. Önceliklerini doğru belirle.",
  "Bugün karşılaştığın her zorlukta bir fırsat ara. Bakış açını değiştir.",
  "Küçük başarıları da kutla. Onlar büyük zaferlerin habercisidir.",
  "Başarı, ertelemeyi bıraktığın an başlar. Şimdi harekete geç.",
  "Kendini geliştirmek için her gün en az bir yeni şey öğren.",
  "Bugün iş listendeki en eski görevi tamamla. O yükten kurtulmak seni hafifletecek.",
  "Mükemmellik bir eylem değil, bir alışkanlıktır. İşini bugün de mükemmel yap.",
  "Zor zamanlar geçer, ama güçlü insanlar kalır. Sen güçlüsün.",
  "Bugün enerjini çalan her şeye sınır koy. Kendi alanını koru.",
  "Başarı, hazırlıklı olanlar için kaçınılmazdır. Bugün hazırlığını tamamla.",
  "Zihnini olumlu düşüncelerle besle. Pozitif zihin, pozitif sonuçlar üretir.",
  "Ertelemek, hayatı ıskalamaktır. Bugünün işini yarına bırakma.",
  "Bugün işinde detaylara önem ver. Farkı yaratan detaylardır.",
  "Kararlı bir insan, şartlar ne olursa olsun yolunu bulur.",
  "Bugün planını sadelikte tut. Az ama öz iş üret.",
  "Yol ne kadar uzun olursa olsun, ilk adımla başlar. Adımını at.",
  "Bugün tüm dikkatini toparla ve derin odaklanma moduna geç.",
  "Kendine verdiğin sözleri tut. En önemli güven, kendine olan güvenindir.",
  "Başarı, hayallerine sadık kalma cesaretidir. Hayallerinin peşinden git.",
  "Bugün işlerini tutkuyla yap. Aşkla yapılan iş her zaman parlar.",
  "Zorluklar seni yıldırmasın, hedefine giden yolda sadece birer testtir.",
  "Bugün listenizdeki işleri bitirmek için enerjik bir şarkıyla başlayın.",
  "Verimli bir gün geçirmek için uyku ve dinlenme dengene de özen göster.",
  "Başarı, sabır ve emeğin ortak ürünüdür. Sabırla ekmeye devam et.",
  "Bugün işinde yaratıcı çözümler üret. Alışılmışın dışına çık.",
  "Zor bir görevi tamamlamanın en iyi yolu, onu hemen yapmaya başlamaktır.",
  "Bugün hedefine ulaşmak için odak noktanı kaybetme.",
  "Kendine zaman tanı. Büyük değişimler aniden değil, yavaşça gerçekleşir.",
  "Bugün tüm işlerini düzenli ve temiz bir şekilde yönet. Düzen başarıyı getirir.",
  "Başarısızlık, daha zekice başlama fırsatından başka bir şey değildir.",
  "Bugün iş listeni temizlemek için harika bir gün. Odaklan ve bitir.",
  "Zihnini sakinleştir. Sakin bir zihin, en karmaşık sorunları bile çözer.",
  "Bugün hedeflerine giden yolda kararlı adımlarla ilerle.",
  "Kendine inan ve yeteneklerine güven. Bugün harika şeyler yapacaksın.",
  "Başarı, tutarlılıkta gizlidir. Her gün az da olsa çabalamaya devam et.",
  "Bugün işlerini yaparken keyif almayı unutma. Mutlu çalışmak verimi artırır.",
  "Zorluklar, başarının değerini artıran unsurlardır. Yılma, devam et.",
  "Bugün yepyeni bir gün ve yepyeni başarılar seni bekliyor. Hazır mısın?"
];

  // AI Motivasyon Mesajını Çek (Hafızadan anında)
  const fetchAiMotivation = () => {
    setIsAiLoading(true)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
      setMotivation(MOTIVATIONAL_QUOTES[randomIndex])
      setIsAiLoading(false)
    }, 150)
  }

  // İlk Yükleme ve Veri Senkronizasyonu
  React.useEffect(() => {
    setMounted(true)
    setIsVisible(true)
    
    // Eğer Zustand store'lar boşsa verileri tetikle
    if (selectedProjectId) {
      fetchTasks(selectedProjectId)
      fetchEvents(selectedProjectId)
    }
    
    fetchAiMotivation()
  }, [selectedProjectId])

  // Kapatma Animasyonu Yönetimi
  const handleStart = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(), 400) // Pürüzsüz geçiş için animasyon süresi
  }

  // Veri Analizi ve Filtreleme (Sadece Client-side'da çalışır, Hydration hatasını önler)
  const stats = React.useMemo(() => {
    if (!mounted) return { todayTasks: [], pendingTasks: [], todayEvents: [], completedYesterday: 0, waitingTasks: [], completedTotal: 0 }

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0] // YYYY-MM-DD
    
    // Dünün Tarihini Hesapla
    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // 1. Bugünün Görevleri (due_date bugün olan ve tamamlanmamış)
    const todayTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'done' || t.is_deleted) return false
      const taskDate = t.due_date.split('T')[0]
      return taskDate === todayStr
    })

    // 2. Günden Kalanlar (Tamamlanmamış ve son tarihi geçmiş olan görevler)
    const pendingTasks = tasks.filter(t => {
      if (t.status === 'done' || t.is_deleted) return false
      if (!t.due_date) return false
      const taskDate = t.due_date.split('T')[0]
      return taskDate < todayStr // Tarihi bugünden küçük olanlar
    }).slice(0, 3) // En fazla 3 tanesini göster, ekranı yorma

    // 3. Bugünün Takvim Etkinlikleri
    const todayEvents = events.filter(e => {
      if (e.isCompleted) return false
      return e.date === todayStr
    })

    // 4. Dün Tamamlanan Görevler
    const completedYesterday = tasks.filter(t => {
      if (t.status !== 'done' || t.is_deleted || !t.completed_at) return false
      const compDate = t.completed_at.split('T')[0]
      return compDate === yesterdayStr
    }).length

    // 5. Bekleyen İşler (Gelecek tarihli veya son tarihi olmayan tamamlanmamış aktif görevler)
    const waitingTasks = tasks.filter(t => {
      if (t.status === 'done' || t.is_deleted || t.parent_task_id) return false
      if (!t.due_date) return true // Son tarihi yoksa bekleyen genel iştir
      const taskDate = t.due_date.split('T')[0]
      return taskDate > todayStr // Gelecek tarihli
    })

    // 6. Toplam Tamamlanan Görev Sayısı (Ana görevler)
    const completedTotal = tasks.filter(t => t.status === 'done' && !t.parent_task_id && !t.is_deleted).length

    return { todayTasks, pendingTasks, todayEvents, completedYesterday, waitingTasks, completedTotal }
  }, [mounted, tasks, events])

  // Hydration öncesi Next.js'in tutarsız HTML üretmesini engelle
  if (!mounted) {
    return null
  }

  return (
    <div className={`fixed inset-0 z-50 flex mobile-zoom-flow zoom-compact-flow sm:items-center sm:justify-center bg-background/95 backdrop-blur-md transition-all duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Arka Plandaki Estetik Gradyan Halka */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr ${greetingInfo.gradient} blur-[120px] opacity-75 pointer-events-none transition-all duration-700`} />
      
      <div className={`mobile-zoom-panel relative max-w-5xl w-full sm:mx-4 p-4 sm:p-5 md:p-10 sm:max-h-[92dvh] md:max-h-[85dvh] bg-card/40 border border-border/60 backdrop-blur-xl rounded-[24px] md:rounded-[32px] shadow-2xl flex flex-col transform transition-all duration-700 ease-out sm:overflow-hidden ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}>
        
        {/* Üst Karşılama Bölümü */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 pb-4 md:pb-6 border-b border-border/50 shrink-0">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-2 md:mb-3">
              <div className="p-2 bg-primary/10 rounded-xl md:rounded-2xl">
                {greetingInfo.icon}
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{greetingInfo.text}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Tekrar Hoş Geldin, <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">{user?.username}</span>!
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2 max-w-xl hidden sm:block">
              İşte yeni bir gün ve yeni fırsatlar. Bugünün odağını belirlemeden önce senin için hazırladığım özete bir göz at.
            </p>
          </div>
 
          {/* Dün Neler Yaptık & Genel İlerleme Kartları */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full md:w-auto shrink-0">
            {/* Tamamlanan Görev Sayısı & Unvan (Sade Motivasyon) */}
            <div className="bg-slate-500/5 dark:bg-white/[0.02] border border-border/60 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 w-full sm:w-auto min-w-[200px]">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-base">
                📊
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Genel Durum</h4>
                <p className="text-xs font-bold text-foreground mt-1">{stats.completedTotal} Görev Bitti</p>
                <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                  {
                    stats.completedTotal === 0 ? "Planla Çırağı 🚀" :
                    stats.completedTotal < 5 ? "Geliştirici 💻" :
                    stats.completedTotal < 10 ? "Planla Ustası 🛠️" : "Planla Şampiyonu 🏆"
                  }
                </p>
              </div>
            </div>
 
            {stats.completedYesterday > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 w-full sm:w-auto min-w-[180px] animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/25 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider leading-none">Dünün Başarısı</h4>
                  <p className="text-xs font-bold text-foreground mt-1">{stats.completedYesterday} Görev Bitti!</p>
                </div>
              </div>
            )}
          </div>
        </div>
 
        {/* Orta Bölüm: AI Analiz & Görev Özet Gridi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 my-4 lg:my-8 overflow-visible sm:overflow-y-auto sm:flex-1 sm:min-h-0 sm:pr-1.5 custom-scrollbar">
          
          {/* Sol Kolon (6/12): AI Motivasyon & Bekleyen İşler */}
          <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-indigo-500/10 via-primary/5 to-transparent border border-primary/20 rounded-[24px] p-4 sm:p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="w-24 h-24 text-primary" />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                  <BrainCircuit className="w-5 h-5" />
                  Yapay Zeka Günlük Raporu
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={fetchAiMotivation}
                  disabled={isAiLoading}
                  className="h-8 w-8 rounded-full hover:bg-primary/10 text-muted-foreground"
                >
                  <RefreshCw className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {isAiLoading ? (
                <div className="space-y-3 py-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-5/6"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                </div>
              ) : (
                <p className="text-foreground/90 leading-relaxed font-medium text-sm sm:text-[15px] italic">
                  "{motivation || "Bugün odaklanman gereken tüm hedefler hazır. Harika işler çıkaracağına eminim!"}"
                </p>
              )}

              {/* Akıllı Durum Tavsiyesi */}
              <div className="mt-6 pt-5 border-t border-border/50 flex gap-3 text-xs text-muted-foreground">
                <div className="p-1 bg-amber-500/10 text-amber-500 rounded-lg h-fit">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">Asistan İpucu:</span>
                  {stats.pendingTasks.length > 0 ? (
                    <p className="mt-0.5">Geçmişten sarkan {stats.pendingTasks.length} adet işin bulunuyor. Güne bunları planlayarak başlamak harika bir adım olabilir.</p>
                  ) : stats.todayTasks.length > 0 ? (
                    <p className="mt-0.5">Bugün için öncelikli {stats.todayTasks.length} görevin var. Zamanını verimli yönetmeye odaklan.</p>
                  ) : (
                    <p className="mt-0.5">Bugün listende acil bir görev görünmüyor! Takvim etkinliklerini inceleyip yeni hedefler belirleyebilirsin.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bekleyen İşler (Yatay Kaydırılabilir) */}
            <div className="bg-card/60 border border-border/50 rounded-[24px] p-4 sm:p-6 hover:border-indigo-500/20 transition-colors">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-foreground uppercase">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  Bekleyen İşler ({stats.waitingTasks.length})
                </div>
              </div>

              {stats.waitingTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">Aktif bekleyen bir işiniz bulunmuyor.</p>
              ) : (
                <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-indigo-500/25">
                  {stats.waitingTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="min-w-[210px] max-w-[210px] p-4 bg-background/50 border border-border/40 rounded-2xl hover:border-indigo-500/30 transition-all flex flex-col gap-2 shrink-0 snap-start shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' : task.priority === 'low' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {task.priority === 'urgent' ? 'Acil' : task.priority === 'low' ? 'Düşük' : 'Orta'}
                        </span>
                        {task.project && (
                          <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-semibold truncate max-w-[100px]">
                            {task.project.name}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-foreground line-clamp-2 h-8 leading-tight flex-1" title={task.title}>
                        {task.title}
                      </h4>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon (6/12): Bugünün Görevleri, Takvimi ve Günden Kalanlar */}
          <div className="lg:col-span-6 grid grid-cols-1 gap-4 sm:gap-6">
            
            {/* Bugün Yapılacaklar (Due Today) */}
            <div className="bg-card/60 border border-border/50 rounded-2xl p-4 sm:p-5 hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-foreground uppercase">
                  <Clock className="w-4 h-4 text-primary" />
                  Bugün Yapılacaklar ({stats.todayTasks.length})
                </div>
              </div>

              {stats.todayTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">Bugün için son tarihi olan bir görev görünmüyor.</p>
              ) : (
                <div className="space-y-2.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {stats.todayTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2.5 p-2 bg-background/50 border border-border/30 rounded-xl hover:bg-background/80 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'low' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-semibold text-foreground line-clamp-1 flex-1">{task.title}</span>
                      {task.project && (
                        <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                          {task.project.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bugünün Takvimi */}
            <div className="bg-card/60 border border-border/50 rounded-2xl p-4 sm:p-5 hover:border-indigo-500/20 transition-colors">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-foreground uppercase">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Takvim Etkinlikleri ({stats.todayEvents.length})
                </div>
              </div>

              {stats.todayEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">Bugün için planlanmış bir etkinlik bulunmuyor.</p>
              ) : (
                <div className="space-y-2.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {stats.todayEvents.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-2 bg-background/50 border border-border/30 rounded-xl hover:bg-background/80 transition-colors">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">{event.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-semibold bg-muted px-2 py-0.5 rounded-full shrink-0">
                        <Clock className="w-3 h-3" />
                        {event.startTime || "Tüm Gün"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Günden Sarkanlar (Geçmiş İşler) */}
            {stats.pendingTasks.length > 0 && (
              <div className="bg-card/60 border border-border/50 rounded-2xl p-4 sm:p-5 hover:border-rose-500/20 transition-colors">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-foreground uppercase">
                    <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                    Geçmişten Kalanlar ({stats.pendingTasks.length})
                  </div>
                </div>

                <div className="space-y-2.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {stats.pendingTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2.5 p-2 bg-background/50 border border-border/30 rounded-xl hover:bg-rose-500/5 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-xs font-semibold text-foreground line-clamp-1 flex-1">{task.title}</span>
                      <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full shrink-0">
                        Gecikti
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Alt Aksiyon Buton Paneli */}
        <div className="sticky bottom-0 sm:static z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 sm:pt-6 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] sm:pb-0 border-t border-border/50 sm:mt-auto bg-card/95 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none">
          <div className="text-xs text-muted-foreground font-medium text-center sm:text-left">
            💡 <span className="font-semibold text-foreground">İpucu:</span> Yapay zeka ile gününü anında planlamak için ana sayfadaki AI Sohbet asistanını kullanabilirsin.
          </div>

          <Button 
            onClick={handleStart}
            size="lg" 
            className="w-full sm:w-auto text-sm min-h-12 h-auto px-6 sm:px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-bold gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white whitespace-normal leading-snug"
          >
            <Sparkles className="w-4 h-4" />
            Hazırım, Günü Başlat
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

      </div>
    </div>
  )
}
