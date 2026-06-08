package com.planla.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import androidx.core.view.WindowCompat;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Android native WebView, sistem status/navigation bar alanlarının arkasına çizilmesin.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        // ApkInstaller plugin'ini kaydet
        registerPlugin(ApkInstallerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
