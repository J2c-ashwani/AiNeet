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

val releaseKeystorePath = requiredForRelease(
    "NEET_UPLOAD_KEYSTORE",
    "Set it to the absolute path of the Play upload keystore."
)
val releaseKeystorePassword = requiredForRelease(
    "NEET_UPLOAD_KEYSTORE_PASSWORD",
    "Set it to the upload keystore password."
)
val releaseKeyAlias = requiredForRelease(
    "NEET_UPLOAD_KEY_ALIAS",
    "Set it to the upload key alias."
)
val releaseKeyPassword = requiredForRelease(
    "NEET_UPLOAD_KEY_PASSWORD",
    "Set it to the upload key password."
)
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
