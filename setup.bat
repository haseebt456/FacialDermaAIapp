@echo off
echo Starting FacialDermaAI React Native App setup...
echo.

REM Install npm packages
echo Installing npm packages...
call npm install axios react-native-image-picker

echo.
echo Android Setup Instructions:
echo 1. Make sure android/app/src/main/AndroidManifest.xml has these permissions:
echo    ^<uses-permission android:name="android.permission.CAMERA" /^>
echo    ^<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/^>
echo    ^<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/^>
echo.
echo 2. Make sure ^<application^> tag has:
echo    android:usesCleartextTraffic="true"
echo.

echo Setup complete!
echo.
echo Next steps:
echo 1. Make sure your backend is running on port 5000
echo 2. Run: npm run android
echo.
pause
