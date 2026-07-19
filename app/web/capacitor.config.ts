import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.planla.app',
  appName: 'Planla',
  webDir: 'out.nosync',
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
