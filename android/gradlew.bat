@ECHO OFF
SETLOCAL

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
set APP_BASE_NAME=%~n0
for %%i in ("%DIRNAME%") do set APP_HOME=%%~fi

if not defined GRADLE_USER_HOME set GRADLE_USER_HOME=%APP_HOME%\.gradle-user
if not defined ANDROID_USER_HOME set "ANDROID_USER_HOME=%APP_HOME%\.android"
if not exist "%ANDROID_USER_HOME%" mkdir "%ANDROID_USER_HOME%" >NUL 2>&1

set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"
set CLASSPATH=%APP_HOME%\gradle\wrapper\gradle-wrapper.jar

REM Fallback to bundled JDK 17 when JAVA_HOME is not set.
if not defined JAVA_HOME (
  if exist "%APP_HOME%\.tools\jdk17\jdk-17.0.18+8\bin\java.exe" (
    set "JAVA_HOME=%APP_HOME%\.tools\jdk17\jdk-17.0.18+8"
  )
)

if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if %ERRORLEVEL% neq 0 goto noJava

goto execute

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%\bin\java.exe
if exist "%JAVA_EXE%" goto execute

goto noJava

:noJava
echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.
echo.
exit /b 1

:execute
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
exit /b %ERRORLEVEL%
