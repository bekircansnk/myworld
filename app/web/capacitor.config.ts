import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pikselai.pikselis',
  appName: 'Planla',
  webDir: 'out',
  server: {
    allowNavigation: [
      '*.googleusercontent.com',
      'drive.google.com',
      '*.google.com',
      'script.google.com',
      'script.googleusercontent.com'
    ],
    androidScheme: 'https'
  }
};

export default config;
