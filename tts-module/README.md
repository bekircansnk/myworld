# Metin Seslendirici (TTS) Modülü

Bu klasör, Google Gemini AI kullanarak metinleri parçalara bölüp, API sınırlarına takılmadan (rate-limit, exponential backoff) kesintisiz bir şekilde sese dönüştüren ve birleştiren tam donanımlı bir modüldür.

Dashboard gibi projelerinize kolayca entegre edebilmeniz için "Tak-Çalıştır" mantığıyla tasarlanmıştır.

## Gereksinimler

Projenizde aşağıdaki paketlerin yüklü olması gerekir:

```bash
npm install @google/genai lucide-react
```

## Kurulum

1. Bu `tts-module` klasörünü projenizin `src/components/` veya `src/hooks/` dizinine kopyalayın.
2. Projenizin ana dizinindeki `.env` veya `.env.local` dosyanıza Gemini API anahtarınızı ekleyin:

```env
VITE_GEMINI_API_KEY=sizin_api_anahtariniz
# veya
GEMINI_API_KEY=sizin_api_anahtariniz
```

## Kullanım

### Seçenek 1: Hazır UI Bileşenini Kullanmak (Önerilen)

Görseldeki dashboard tasarımınıza uygun olarak hazırlanmış `TTSPlayer` bileşenini doğrudan kullanabilirsiniz.

```tsx
import { TTSPlayer } from './tts-module';

function NoteCard({ noteContent }) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl text-slate-200">
      <h3 className="text-xl font-bold mb-4">Not Detayı</h3>
      <p className="mb-6">{noteContent}</p>
      
      {/* Sadece metni vermeniz yeterli */}
      <TTSPlayer text={noteContent} />
    </div>
  );
}
```

### Seçenek 2: Sadece Mantığı (Hook) Kullanmak

Kendi özel tasarımınızı yapmak isterseniz, sadece `useTTS` hook'unu kullanarak tüm karmaşık işlemleri arka plana atabilirsiniz.

```tsx
import { useTTS } from './tts-module';

function CustomPlayer({ text }) {
  const { 
    generateAndPlay, 
    isPlaying, 
    isGenerating, 
    progress, 
    togglePlayPause 
  } = useTTS();

  return (
    <div>
      <button onClick={() => generateAndPlay(text)}>
        Sese Dönüştür
      </button>
      
      {isGenerating && (
        <p>İşleniyor: {progress.current} / {progress.total}</p>
      )}
    </div>
  );
}
```

## Özellikler

- **Akıllı Parçalama:** Uzun metinleri cümle bütünlüğünü bozmadan 400 karakterlik parçalara böler.
- **Kesintisiz Birleştirme:** Gelen WAV dosyalarının başlıklarını ayrıştırarak (PCM extraction) pürüzsüz birleştirme yapar.
- **Hata Toleransı:** API sınırlarına takıldığında bekler (Exponential Backoff) ve tekrar dener.
- **Önizleme:** Sesi oluşturmadan önce kısa bir cümle ile ses tonunu test etme imkanı sunar.
- **Koyu Tema Uyumu:** Tailwind CSS ile modern dashboard tasarımlarına tam uyumludur.
