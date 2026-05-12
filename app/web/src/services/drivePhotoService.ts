/**
 * Drive Photo Service — Görev fotoğrafları için Google Drive yükleme/silme servisi
 * 
 * PikselAI'deki GAS altyapısını kullanarak görev fotoğraflarını yönetir.
 * - Otomatik sıkıştırma (1MB altına)
 * - Base64 üzerinden GAS proxy'ye gönderim
 * - Thumbnail/full URL üretimi
 */

import { DrivePhoto } from '@/types';

// GAS Proxy URL ve hedef klasör
const GAS_URL = process.env.NEXT_PUBLIC_GAS_UPLOAD_URL || '';
const TASK_PHOTOS_FOLDER_ID = process.env.NEXT_PUBLIC_TASK_PHOTOS_FOLDER_ID || '';

// Sıkıştırma limiti (byte)
const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

/**
 * Fotoğrafı 1MB altına sıkıştırır (Canvas API ile)
 * Eğer zaten küçükse orijinalini döndürür
 */
export async function compressImage(file: File): Promise<File> {
  // Resim dosyası değilse veya zaten küçükse dokunma
  if (!file.type.startsWith('image/') || file.size <= MAX_SIZE_BYTES) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Hedef boyutu hesapla — oranı koruyarak küçült
      let { width, height } = img;
      const maxDimension = 1920;

      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context alınamadı')); return; }

      ctx.drawImage(img, 0, 0, width, height);

      // Kaliteyi düşürerek 1MB altına in
      let quality = 0.85;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Sıkıştırma başarısız')); return; }

            if (blob.size <= MAX_SIZE_BYTES || quality <= 0.3) {
              // Yeterince küçük veya minimum kaliteye ulaşıldı
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // Daha fazla sıkıştır
              quality -= 0.1;
              tryCompress();
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Resim yüklenemedi'));
    };

    img.src = url;
  });
}

/**
 * Dosyayı base64'e çevirir (data: prefix olmadan)
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Part = dataUrl.split(',')[1];
      resolve(base64Part);
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsDataURL(file);
  });
}

/**
 * Fotoğrafı Google Drive'a yükler (GAS Proxy üzerinden)
 * Otomatik sıkıştırma yapar, DrivePhoto döndürür
 */
export async function uploadPhotoToDrive(file: File): Promise<DrivePhoto> {
  if (!GAS_URL) {
    throw new Error('GAS Upload URL tanımlanmamış! .env.local kontrol edin.');
  }
  if (!TASK_PHOTOS_FOLDER_ID) {
    throw new Error('Task Photos Folder ID tanımlanmamış!');
  }

  // Validasyon
  if (!file || file.size === 0) {
    throw new Error('Boş dosya yüklenemez');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Sadece resim dosyaları yüklenebilir');
  }

  // Sıkıştır
  const compressedFile = await compressImage(file);

  // Base64'e çevir
  const base64Data = await fileToBase64(compressedFile);

  // GAS'a gönder
  const payload = {
    action: 'upload',
    filename: compressedFile.name,
    mimetype: compressedFile.type || 'image/jpeg',
    size: compressedFile.size,
    base64data: base64Data,
    folderId: TASK_PHOTOS_FOLDER_ID,
  };

  const response = await fetch(GAS_URL, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Sunucu hatası (${response.status}): ${errText}`);
  }

  const result = await response.json();
  if (!result.success || !result.id) {
    throw new Error(result.error || 'Yükleme başarısız');
  }

  return {
    drive_id: result.id,
    name: result.name || compressedFile.name,
    uploaded_at: new Date().toISOString(),
  };
}

/**
 * Drive fotoğrafını siler (GAS deleteFile action)
 */
export async function deletePhotoFromDrive(driveId: string): Promise<void> {
  if (!GAS_URL) return;

  const payload = {
    action: 'deleteFile',
    fileId: driveId,
  };

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!result.success) {
      console.warn('Drive silme hatası:', result.error);
    }
  } catch (err) {
    console.warn('Drive silme hatası:', err);
  }
}

/**
 * Drive thumbnail URL üretir
 */
export function getPhotoThumbnailUrl(driveId: string, size: number = 400): string {
  // lh3 URL'si auth sorunu olmadan daha stabil çalışır
  return `https://lh3.googleusercontent.com/d/${driveId}=s${size}`;
}

/**
 * Drive tam boyut görüntüleme URL'si
 */
export function getPhotoViewUrl(driveId: string): string {
  // s0 orijinal boyutu getirir
  return `https://lh3.googleusercontent.com/d/${driveId}=s0`;
}
