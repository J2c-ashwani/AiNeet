plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
    id("com.google.gms.google-services")
}

val releaseTaskRequested = gradle.startParameter.taskNames.any {
    val name = it.lowercase()
    name.contains("release") || name.contains("bundle")
}

fun configValue(name: String): String? =
    providers.gradleProperty(name).orNull ?: System.getenv(name)

fun requiredForRelease(name: String, description: String): String {
    val value = configValue(name)
    if (releaseTaskRequested && value.isNullOrBlank()) {
        throw GradleException("Missing $name for release build. $description")
    }
    return value.orEmpty()
}

val releaseKeystorePath = configValue("NEET_UPLOAD_KEYSTORE") ?: configValue("KEYSTORE_PATH") ?: (if (releaseTaskRequested) throw GradleException("Missing NEET_UPLOAD_KEYSTORE / KEYSTORE_PATH for release build.") else "")
val releaseKeystorePassword = configValue("NEET_UPLOAD_KEYSTORE_PASSWORD") ?: configValue("KEYSTORE_PASSWORD") ?: (if (releaseTaskRequested) throw GradleException("Missing NEET_UPLOAD_KEYSTORE_PASSWORD / KEYSTORE_PASSWORD for release build.") else "")
val releaseKeyAlias = configValue("NEET_UPLOAD_KEY_ALIAS") ?: configValue("KEY_ALIAS") ?: (if (releaseTaskRequested) throw GradleException("Missing NEET_UPLOAD_KEY_ALIAS / KEY_ALIAS for release build.") else "")
val releaseKeyPassword = configValue("NEET_UPLOAD_KEY_PASSWORD") ?: configValue("KEY_PASSWORD") ?: (if (releaseTaskRequested) throw GradleException("Missing NEET_UPLOAD_KEY_PASSWORD / KEY_PASSWORD for release build.") else "")
val admobApplicationId = configValue("ADMOB_ANDROID_APP_ID")
    ?: if (releaseTaskRequested) {
        throw GradleException("Missing ADMOB_ANDROID_APP_ID for release build. Use the production AdMob app ID, not Google's test ID.")
    } else {
        "ca-app-pub-3940256099942544~3347511713"
    }

android {
    namespace = "com.aineetcoach.app"
    compileSdk = flutter.compileSdkVersion
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
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
        manifestPlaceholders["admobApplicationId"] = admobApplicationId
    }

    signingConfigs {
        create("release") {
            if (releaseKeystorePath.isNotBlank()) {
                storeFile = file(releaseKeystorePath)
                storePassword = releaseKeystorePassword
                keyAlias = releaseKeyAlias
                keyPassword = releaseKeyPassword
            }
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}

flutter {
    source = "../.."
}
