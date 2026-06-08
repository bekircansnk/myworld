package com.planla.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.WindowCompat;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Splash ekranını resmi API ile kur — bu çağrı super.onCreate'dan ÖNCE olmalı.
        // Bu olmadan Theme.SplashScreen teması düzgün kapanmaz ve arkasında
        // uygulama simgesi/başlığı kalıntısı bırakır.
        SplashScreen.installSplashScreen(this);

        // Android native WebView, sistem status/navigation bar alanlarının arkasına çizilmesin.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        // ApkInstaller plugin'ini kaydet
        registerPlugin(ApkInstallerPlugin.class);

        super.onCreate(savedInstanceState);
    }
}
