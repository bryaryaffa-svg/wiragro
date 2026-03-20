plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.kapt")
}

import java.util.Properties

fun quoteBuildConfig(value: String): String = "\"${value.replace("\\", "\\\\").replace("\"", "\\\"")}\""

val localProperties = Properties().apply {
    val file = rootProject.file("local.properties")
    if (file.exists()) {
        file.inputStream().use(::load)
    }
}

val isOneDriveProject = project.projectDir.absolutePath.contains("OneDrive", ignoreCase = true)
if (isOneDriveProject) {
    layout.buildDirectory.set(
        file("${System.getenv("LOCALAPPDATA") ?: System.getProperty("java.io.tmpdir")}/KiosSidomakmurBuild/app")
    )
}

val apiBaseUrlRaw = (findProperty("KIOS_API_BASE_URL") as String?)
    ?: System.getenv("KIOS_API_BASE_URL")
    ?: "http://10.0.2.2:8000/api/v1/"
val apiBaseUrl = if (apiBaseUrlRaw.endsWith("/")) apiBaseUrlRaw else "$apiBaseUrlRaw/"
val storeCode = (findProperty("KIOS_STORE_CODE") as String?)
    ?: System.getenv("KIOS_STORE_CODE")
    ?: "SIDO-JATIM-ONLINE"
val googleServerClientId = (findProperty("KIOS_GOOGLE_SERVER_CLIENT_ID") as String?)
    ?: localProperties.getProperty("KIOS_GOOGLE_SERVER_CLIENT_ID")
    ?: System.getenv("KIOS_GOOGLE_SERVER_CLIENT_ID")
    ?: ""

android {
    namespace = "com.sidomakmur.kios"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.sidomakmur.kios"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "0.1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables.useSupportLibrary = true
        buildConfigField("String", "KIOS_API_BASE_URL", quoteBuildConfig(apiBaseUrl))
        buildConfigField("String", "KIOS_STORE_CODE", quoteBuildConfig(storeCode))
        buildConfigField("String", "KIOS_GOOGLE_SERVER_CLIENT_ID", quoteBuildConfig(googleServerClientId))
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.02.02")

    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.navigation:navigation-compose:2.8.9")
    implementation("androidx.credentials:credentials:1.3.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    implementation("androidx.work:work-runtime-ktx:2.9.1")

    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.1")
    implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")
    implementation("io.coil-kt:coil-compose:2.7.0")

    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("com.google.android.material:material:1.12.0")

    testImplementation("junit:junit:4.13.2")
    kapt("androidx.room:room-compiler:2.6.1")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
