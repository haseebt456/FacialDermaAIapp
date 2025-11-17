#!/bin/bash

echo "🚀 Setting up FacialDermaAI React Native App..."
echo ""

# Install npm packages
echo "📦 Installing npm packages..."
npm install axios react-native-image-picker

# For Android
echo ""
echo "🤖 Android Setup Instructions:"
echo "1. Make sure android/app/src/main/AndroidManifest.xml has these permissions:"
echo "   <uses-permission android:name=\"android.permission.CAMERA\" />"
echo "   <uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>"
echo "   <uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\"/>"
echo ""
echo "2. Make sure <application> tag has:"
echo "   android:usesCleartextTraffic=\"true\""
echo ""

# For iOS
echo "🍎 iOS Setup Instructions:"
echo "1. Run: cd ios && pod install && cd .."
echo "2. Add to ios/FacialDermaAI/Info.plist:"
echo "   <key>NSCameraUsageDescription</key>"
echo "   <string>We need camera access to analyze skin conditions</string>"
echo "   <key>NSPhotoLibraryUsageDescription</key>"
echo "   <string>We need photo library access to analyze skin conditions</string>"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your backend is running on port 5000"
echo "2. Run: npm run android (or npm run ios)"
echo ""
