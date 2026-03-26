plugins {
    id("com.android.application")
    id("kotlin-android")
    id("dev.flutter.flutter-gradle-plugin")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.aineetcoach.app"
    compileSdk = 36
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    defaultConfig {
        applicationId = "com.aineetcoach.app"
        minSdk = 24        // Android 7.0+ (covers 99%+ of active devices)
        targetSdk = 36     // Android 16
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        create("release") {
            // NOTE: For CI/CD, set these via environment variables.
            // Locally, the defaults below point to the generated neet-coach.jks keystore.
            storeFile = file(System.getenv("KEYSTORE_PATH") ?: "neet-coach.jks")
            storePassword = System.getenv("KEYSTORE_PASSWORD") ?: "neetcoach123"
            keyAlias = System.getenv("KEY_ALIAS") ?: "neetcoach"
            keyPassword = System.getenv("KEY_PASSWORD") ?: "neetcoach123"
        }
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
            isDebuggable = true
        }
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true       // Enable R8 code shrinking and obfuscation
            isShrinkResources = true     // Remove unused resources
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

flutter {
    source = "../.."
}
