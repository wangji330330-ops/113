# Copy the web app into the Android WebView assets folder for local Android Studio builds.
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$dest = Join-Path $root "android\app\src\main\assets\www"

if (Test-Path $dest) {
    Get-ChildItem $dest -Force | Remove-Item -Recurse -Force
} else {
    New-Item -ItemType Directory -Force $dest | Out-Null
}

Copy-Item (Join-Path $root "index.html") $dest
Copy-Item (Join-Path $root "manifest.webmanifest") $dest
Copy-Item (Join-Path $root "sw.js") $dest
Copy-Item (Join-Path $root "assets") $dest -Recurse

Write-Host "Synced web assets to android/app/src/main/assets/www" -ForegroundColor Green
Write-Host "Now open the android/ folder in Android Studio and run the app."
