package com.glimmernook.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

/**
 * A small, offline-only WebView shell for 日记.
 * The web app lives in app/src/main/assets/www and is served through
 * WebViewAssetLoader so localStorage gets a stable https origin.
 */
public class MainActivity extends Activity {
    private static final String START_URL =
            "https://appassets.androidplatform.net/assets/www/index.html";
    private static final int BACKGROUND = Color.rgb(253, 248, 243);
    private static final int REQ_FILE = 1001;

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(BACKGROUND);
        getWindow().setNavigationBarColor(BACKGROUND);
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView = new WebView(this);
        webView.setBackgroundColor(BACKGROUND);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);

        webView.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    @NonNull WebView view,
                    @NonNull WebResourceRequest request
            ) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(
                    WebView view,
                    ValueCallback<Uri[]> callback,
                    FileChooserParams params
            ) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), REQ_FILE);
                    return true;
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
            }
        });
        webView.addJavascriptInterface(new WebAppBridge(), "GlimmerAndroid");

        setContentView(webView);
        boolean restored = savedInstanceState != null && webView.restoreState(savedInstanceState) != null;
        if (!restored) {
            webView.loadUrl(START_URL);
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        if (requestCode == REQ_FILE) {
            if (filePathCallback != null) {
                filePathCallback.onReceiveValue(
                        WebChromeClient.FileChooserParams.parseResult(resultCode, data));
                filePathCallback = null;
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        // Let the web app close a dialog before WebView history or the Activity reacts.
        webView.evaluateJavascript(
                "(function(){var r=document.getElementById('modal-root');" +
                        "if(r&&!r.hidden){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return '1';}" +
                        "return '0';})()",
                value -> {
                    if ("\"1\"".equals(value)) return;
                    if (webView != null && webView.canGoBack()) {
                        webView.goBack();
                    } else {
                        finish();
                    }
                }
        );
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    /** Small, local-only bridge used for the APK download page and web chat. */
    private class WebAppBridge {
        @JavascriptInterface
        public void openExternal(String url) {
            if (url == null) return;
            if (!url.startsWith("https://") && !url.startsWith("http://")) return;
            runOnUiThread(() -> {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                } catch (Exception ignored) {
                    // No browser installed; the web UI shows a fallback link.
                }
            });
        }

        @JavascriptInterface
        public void openDeepSeekWeb() {
            runOnUiThread(() -> {
                try {
                    startActivity(new Intent(MainActivity.this, DeepSeekWebActivity.class));
                } catch (Exception ignored) {
                    // The web UI still offers the normal external link as a fallback.
                }
            });
        }
    }
}
