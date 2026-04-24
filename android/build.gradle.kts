plugins {
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
}

val isOneDriveProject = rootDir.absolutePath.contains("OneDrive", ignoreCase = true)
if (isOneDriveProject) {
    val localBuildBase = System.getenv("LOCALAPPDATA") ?: System.getProperty("java.io.tmpdir")
    layout.buildDirectory.set(file("$localBuildBase/WiragroBuild/root"))
}
