plugins {
    id("com.android.application")
}

android {
    namespace = "com.glimmernook.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.glimmernook.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "0.2.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.annotation:annotation:1.9.1")
}
