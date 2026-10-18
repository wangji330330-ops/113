package com.glimmernook.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;

/**
 * An in-app browser for the free DeepSeek web chat.
 *
 * This is intentionally just a browser: it does not read the page, inject
 * scripts, or bring messages back into 微光小屋. Use the API chat inside the
 * app if you want saved, integrated conversations.
 */
public class DeepSeekWebActivity extends Activity {
    private static final String START_URL = "https://chat.deepseek.com/";
    private static final int BACKGROUND = Color.rgb(23, 19, 38);
    private static final int LINE = Color.rgb(59, 48, 80);
    private static final int INK = Color.rgb(246, 233, 207);
    private static final int GOLD = Color.rgb(245, 196, 81);

    private WebView webView;
    private ProgressBar progress;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(BACKGROUND);
        getWindow().setNavigationBarColor(BACKGROUND);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BACKGROUND);

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setPadding(dp(14), 0, dp(6), 0);
        bar.setBackgroundColor(BACKGROUND);

        TextView title = new TextView(this);
        title.setText(R.string.deepseek_web_title);
        title.setTextColor(INK);
        title.setTextSize(14);
        title.setTypeface(Typeface.MONOSPACE);
        title.setSingleLine(true);
        title.setEllipsize(TextUtils.TruncateAt.END);
        bar.addView(title, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f));

        TextView browser = actionButton(R.string.deepseek_web_open_browser);
        browser.setOnClickListener(v -> openCurrentInBrowser());
        bar.addView(browser, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.MATCH_PARENT
        ));

        TextView close = actionButton(R.string.deepseek_web_close);
        close.setOnClickListener(v -> finish());
        bar.addView(close, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.MATCH_PARENT
        ));

        root.addView(bar, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dp(52)
        ));

        View divider = new View(this);
        divider.setBackgroundColor(LINE);
        root.addView(divider, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dp(1)
        ));

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setProgress(0);
        progress.setVisibility(View.GONE);
        progress.getProgressDrawable().setColorFilter(GOLD, PorterDuff.Mode.SRC_IN);
        root.addView(progress, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dp(3)
        ));

        webView = new WebView(this);
        webView.setBackgroundColor(BACKGROUND);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        String userAgent = settings.getUserAgentString();
        if (userAgent != null) {
            settings.setUserAgentString(userAgent.replace("; wv", ""));
        }

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                    // Ignore unsupported external schemes.
                }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (progress != null) progress.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (progress != null) progress.setVisibility(View.GONE);
                if (request.isForMainFrame()) {
                    Toast.makeText(
                            DeepSeekWebActivity.this,
                            R.string.deepseek_web_error,
                            Toast.LENGTH_LONG
                    ).show();
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (progress == null) return;
                if (newProgress >= 100) {
                    progress.setVisibility(View.GONE);
                } else {
                    progress.setVisibility(View.VISIBLE);
                    progress.setProgress(newProgress);
                }
            }
        });

        root.addView(webView, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1f
        ));
        setContentView(root);
        webView.loadUrl(START_URL);
    }

    private TextView actionButton(int textRes) {
        TextView button = new TextView(this);
        button.setText(textRes);
        button.setTextColor(GOLD);
        button.setTextSize(12);
        button.setGravity(Gravity.CENTER);
        button.setPadding(dp(10), dp(8), dp(10), dp(8));
        button.setClickable(true);
        button.setFocusable(true);
        return button;
    }

    private void openCurrentInBrowser() {
        String url = webView != null ? webView.getUrl() : null;
        if (url == null || url.isEmpty()) url = START_URL;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        } catch (Exception ignored) {
            Toast.makeText(this, R.string.deepseek_web_no_browser, Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
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
    protected void onDestroy() {
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
