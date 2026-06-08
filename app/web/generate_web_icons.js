const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const baseWeb = __dirname;
const sourceIcon = path.join(baseWeb, 'assets/icon.png');

async function generateWebIcons() {
  try {
    console.log('İkon üretimi başlatıldı...');

    // 1. Web Klasik İkonlar (PNG)
    await sharp(sourceIcon)
      .resize(48, 48)
      .png()
      .toFile(path.join(baseWeb, 'public/favicon.ico'));
    console.log('public/favicon.ico üretildi.');

    await sharp(sourceIcon)
      .resize(48, 48)
      .png()
      .toFile(path.join(baseWeb, 'src/app/favicon.ico'));
    console.log('src/app/favicon.ico üretildi.');

    await sharp(sourceIcon)
      .resize(192, 192)
      .png()
      .toFile(path.join(baseWeb, 'public/icons/icon-192x192.png'));
    console.log('public/icons/icon-192x192.png üretildi.');

    await sharp(sourceIcon)
      .resize(512, 512)
      .png()
      .toFile(path.join(baseWeb, 'public/icons/icon-512x512.png'));
    console.log('public/icons/icon-512x512.png üretildi.');

    await sharp(sourceIcon)
      .resize(512, 512)
      .png()
      .toFile(path.join(baseWeb, 'public/icons/icon_cropped.png'));
    console.log('public/icons/icon_cropped.png üretildi.');

    // 2. PWA WebP İkonları
    const pwaSizes = [
      { size: 48, name: 'icon-48.webp' },
      { size: 72, name: 'icon-72.webp' },
      { size: 96, name: 'icon-96.webp' },
      { size: 128, name: 'icon-128.webp' },
      { size: 192, name: 'icon-192.webp' },
      { size: 256, name: 'icon-256.webp' },
      { size: 512, name: 'icon-512.webp' }
    ];

    const iconsDir = path.join(baseWeb, 'icons');
    if (!fs.existsSync(iconsDir)){
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    for (const item of pwaSizes) {
      await sharp(sourceIcon)
        .resize(item.size, item.size)
        .webp()
        .toFile(path.join(iconsDir, item.name));
      console.log(`icons/${item.name} üretildi.`);
    }

    console.log('Tüm web ikonları başarıyla güncellendi!');
  } catch (err) {
    console.error('Hata oluştu:', err);
  }
}

generateWebIcons();
