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
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.webkit.WebViewAssetLoader;
import android.webkit.WebViewClient;

/**
 * 日记的 Android 外壳。
 *
 * 网页优先从 GitHub Pages 加载，这样内容更新不用重新装 APK；
 * 网络不通或太慢时，退回安装包里自带的那份 www（离线也能写）。
 */
public class MainActivity extends Activity {
    private static final String REMOTE_URL = "https://wangji330330-ops.github.io/113/";
    private static final String LOCAL_URL =
            "https://appassets.androidplatform.net/assets/www/index.html";
    private static final String REMOTE_HOST = "wangji330330-ops.github.io";
    private static final int BACKGROUND = Color.rgb(253, 248, 243);
    private static final int REQ_FILE = 1001;
    private static final long FALLBACK_DELAY = 7000L;

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private boolean loadedOnce = false;
    private boolean usingLocal = false;

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
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    @NonNull WebView view,
                    @NonNull WebResourceRequest request
            ) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                loadedOnce = true;
            }

            @Override
            public void onReceivedError(
                    WebView view,
                    WebResourceRequest request,
                    WebResourceError error
            ) {
                if (request.isForMainFrame() && !usingLocal && !loadedOnce) {
                    loadLocal();
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(
                    @NonNull WebView view,
                    @NonNull WebResourceRequest request
            ) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                if (REMOTE_HOST.equals(host)) return false;
                if ("appassets.androidplatform.net".equals(host)) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                    // 没有浏览器就什么都不做，页面上的链接还在
                }
                return true;
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
            webView.loadUrl(REMOTE_URL);
            // 网太慢就先给本地那份，别一直白屏
            webView.postDelayed(() -> {
                if (!loadedOnce && !usingLocal) loadLocal();
            }, FALLBACK_DELAY);
        }
    }

    private void loadLocal() {
        if (webView == null || usingLocal) return;
        usingLocal = true;
        webView.loadUrl(LOCAL_URL);
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
        // 先让网页关掉弹窗，再考虑历史记录
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

    /** 留给网页调用的小桥。 */
    private class WebAppBridge {
        @JavascriptInterface
        public void openExternal(String url) {
            if (url == null) return;
            if (!url.startsWith("https://") && !url.startsWith("http://")) return;
            runOnUiThread(() -> {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                } catch (Exception ignored) {
                    // 没有浏览器
                }
            });
        }

        @JavascriptInterface
        public void openDeepSeekWeb() {
            runOnUiThread(() -> {
                try {
                    startActivity(new Intent(MainActivity.this, DeepSeekWebActivity.class));
                } catch (Exception ignored) {
                    // 网页上有普通链接可以兜底
                }
            });
        }
    }
}
