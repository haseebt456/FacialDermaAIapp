# 🔬 FacialDermaAI Mobile App - Project README

## 📋 Project Overview

A comprehensive React Native mobile application for AI-powered skin condition analysis, integrated with the FacialDermaAI backend API. This patient-focused app provides real-time skin condition detection using machine learning.

---

## ✅ Implementation Complete

All features have been fully implemented and are ready for testing:

### 🎯 Core Features
- ✅ User Authentication (Signup/Login) - Patient role only
- ✅ Skin Analysis with image upload
- ✅ Prediction History with detailed results
- ✅ User Profile management
- ✅ Modern UI/UX with custom components
- ✅ Comprehensive error handling
- ✅ Loading states and user feedback

### 🔌 Backend Integration
- ✅ All API endpoints integrated
- ✅ JWT token authentication
- ✅ Automatic role assignment (patient)
- ✅ Token persistence with AsyncStorage
- ✅ Request/response interceptors

---

## 🚀 Quick Start

### Option 1: Automatic Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   npm install axios react-native-image-picker
   ```

2. **Start the app:**
   ```bash
   # Android
   npm run android

   # iOS (Mac only)
   npm run ios
   ```

---

## 📚 Documentation

### Primary Documents
- **[SETUP.md](./SETUP.md)** - Complete setup and configuration guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Detailed implementation documentation
- **Backend API Guide** - See backend repository

### Quick Links
- [Installation Steps](#installation-steps)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## 📦 Installation Steps

### Prerequisites
✅ Node.js v20+  
✅ React Native development environment  
✅ Android Studio (for Android) OR Xcode (for iOS)  
✅ Backend server running on port 5000

### 1. Install npm packages
```bash
npm install
npm install axios react-native-image-picker
```

### 2. Android Configuration

**Add permissions** to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>

<application
    android:usesCleartextTraffic="true"
    ...>
</application>
```

**Clean build:**
```bash
cd android
./gradlew clean
cd ..
```

### 3. iOS Configuration (Mac only)

**Install pods:**
```bash
cd ios
pod install
cd ..
```

**Add permissions** to `ios/FacialDermaAI/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to analyze skin conditions</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to analyze skin conditions</string>
```

### 4. Start Backend Server
Ensure your backend is running:
```bash
# In your backend directory
npm start
# Should be running on http://localhost:5000
```

### 5. Run the App
```bash
# Android
npm run android

# iOS (Mac only)
npm run ios
```

---

## ⚙️ Configuration

### API Base URL
Edit `src/services/api.ts` to configure your backend URL:

```typescript
const BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:5000'  // Android emulator
  // ? 'http://localhost:5000'  // iOS simulator
  : 'https://your-production-url.com';
```

**Network Configuration:**
- **Android Emulator**: `http://10.0.2.2:5000`
- **iOS Simulator**: `http://localhost:5000`
- **Physical Device**: Use your computer's IP (e.g., `http://192.168.1.100:5000`)

---

## 📱 Project Structure

```
FacialDermaAI/
├── src/
│   ├── services/              # API integration layer
│   │   ├── api.ts            # Axios instance & interceptors
│   │   ├── authService.ts    # Authentication methods
│   │   └── predictionService.ts # Prediction methods
│   │
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx        # Custom button
│   │   ├── Input.tsx         # Form input with validation
│   │   ├── Card.tsx          # Container component
│   │   └── Loading.tsx       # Loading indicator
│   │
│   ├── screens/              # App screens
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── PredictionScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── ProfileScreen.tsx
│   │
│   ├── navigation/           # Navigation configuration
│   │   ├── AppNavigator.tsx  # Root navigator
│   │   ├── AuthStack.tsx     # Auth flow
│   │   └── MainStack.tsx     # Main app flow
│   │
│   └── styles/
│       └── theme.ts          # Global theme & design system
│
├── android/                  # Android native code
├── ios/                      # iOS native code
├── SETUP.md                  # Detailed setup guide
├── IMPLEMENTATION_SUMMARY.md # Complete implementation docs
├── setup.sh                  # Linux/Mac setup script
└── setup.bat                 # Windows setup script
```

---

## 🎯 Features & Screens

### 1. Authentication Flow
**LoginScreen**
- Email/Username + Password login
- Automatic role assignment (patient)
- Field validation with real-time feedback
- Secure token storage

**SignupScreen**
- Username, Email, Password, Confirm Password
- Comprehensive validation
- Account creation with success feedback

### 2. Main App Flow
**HomeScreen**
- Welcome dashboard
- Quick access to all features
- Logout functionality
- User information display

**PredictionScreen**
- Image selection (camera/gallery)
- Image preview
- AI-powered analysis
- Detailed results with confidence score
- Tips for best results

**HistoryScreen**
- List of past predictions
- Thumbnail previews
- Date/time stamps
- Pull-to-refresh
- Empty state handling

**ProfileScreen**
- User account information
- Settings menu
- Logout option
- Version display

---

## 🔐 Authentication System

### How It Works
1. User signs up (auto-assigned as "patient")
2. JWT token received on login
3. Token stored in AsyncStorage
4. Token automatically added to all API requests
5. Token expiration handled gracefully
6. Logout clears all stored data

### No Role Selection Required
The app automatically sends `role: 'patient'` for all auth requests. Users don't see or select their role.

---

## 📸 Image Analysis

### Supported Conditions
- **Acne** - Color: #FF6B6B
- **Melanoma** - Color: #4ECDC4
- **Normal** - Color: #95E1D3
- **Perioral Dermatitis** - Color: #FFD93D
- **Rosacea** - Color: #FCB6D0
- **Warts** - Color: #C7B8EA

### Image Requirements
✅ Clear face visible  
✅ Good lighting  
✅ Not blurry  
✅ Supported formats: JPG, PNG

---

## 🐛 Troubleshooting

### Network Connection Errors

**Problem**: "Cannot connect to server"

**Solutions**:
1. Verify backend is running on port 5000
2. Check API base URL in `src/services/api.ts`
3. For Android emulator, use `http://10.0.2.2:5000`
4. For physical device, use computer's IP address
5. Disable firewall temporarily to test

### Build Errors

**Problem**: Gradle build fails or Metro bundler errors

**Solutions**:
```bash
# Clear Metro cache
npm start -- --reset-cache

# Clean Android build
cd android
./gradlew clean
cd ..

# Reinstall dependencies
rm -rf node_modules
npm install

# Reset React Native cache
npm start -- --reset-cache
```

### Image Picker Not Working

**Problem**: Camera/Gallery not opening

**Solutions**:
1. Verify permissions added to AndroidManifest.xml (Android) or Info.plist (iOS)
2. Rebuild the app after adding permissions
3. Grant permissions when app prompts
4. Check that react-native-image-picker is installed: `npm list react-native-image-picker`

### Token Expiration

**Problem**: "Session expired" or automatic logout

**Solutions**:
- Token expires after 24 hours (backend setting)
- User must login again
- This is expected behavior for security

---

## 🧪 Testing Guide

### 1. Create Test Account
```
Username: testpatient
Email: patient@test.com
Password: Test123!
```

### 2. Test Checklist
- [ ] Signup with new account
- [ ] Login with credentials
- [ ] Navigate to Home screen
- [ ] Upload image for analysis
- [ ] View prediction results
- [ ] Check history screen
- [ ] View profile
- [ ] Logout and login again

### 3. Test Different Scenarios
- [ ] Invalid login credentials
- [ ] Duplicate email signup
- [ ] Weak password validation
- [ ] Blurry image upload
- [ ] No face detected error
- [ ] Network disconnection
- [ ] Token expiration

---

## 🔑 Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.4 | Mobile framework |
| TypeScript | 5.8.3 | Type safety |
| React Navigation | latest | App navigation |
| Axios | latest | HTTP requests |
| AsyncStorage | 2.2.0 | Local storage |
| React Native Image Picker | latest | Image selection |

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create patient account
- `POST /api/auth/login` - Authenticate user
- `GET /api/users/me` - Get current user info

### Predictions
- `GET /api/predictions` - Get user's prediction history
- `POST /api/predictions/predict` - Upload image for analysis

### Request Headers
All authenticated requests include:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json (or multipart/form-data for images)
```

---

## ⚠️ Important Notes

1. **Patient Only**: This app is designed for patients only (not dermatologists)
2. **Medical Disclaimer**: AI predictions are not medical diagnoses - always consult a dermatologist
3. **Face Required**: Images must contain a visible face for analysis
4. **Network Required**: App requires internet connection to function
5. **Token Expiry**: Sessions expire after 24 hours
6. **Image Quality**: Best results with clear, well-lit photos

---

## 🎨 Design System

### Colors
- **Primary**: #2A6EF1 (Blue)
- **Success**: #4CAF50 (Green)
- **Error**: #F44336 (Red)
- **Warning**: #FF9800 (Orange)

### Typography
- **H1**: 32px, Bold
- **H2**: 24px, Bold
- **H3**: 20px, Semibold
- **Body**: 16px, Regular
- **Caption**: 12px, Regular

### Spacing Scale
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px

---

## 📱 Device Compatibility

### Minimum Requirements
- **Android**: API Level 21+ (Android 5.0+)
- **iOS**: iOS 13.0+
- **RAM**: 2GB+
- **Storage**: 100MB+

### Tested On
- Android Emulator (API 33)
- Physical Android devices
- iOS Simulator (iOS 16+)

---

## 🔄 Development Workflow

### 1. Start Development
```bash
# Terminal 1: Start Metro
npm start

# Terminal 2: Run app
npm run android  # or npm run ios
```

### 2. Make Changes
- Edit files in `src/`
- Save to see changes (Fast Refresh)
- Press 'R' twice to reload manually

### 3. Debug
- **Android**: Cmd+M (Mac) or Ctrl+M (Windows) for Dev Menu
- **iOS**: Cmd+D for Dev Menu
- Use React Native Debugger or Flipper

### 4. Build for Production
```bash
# Android
cd android
./gradlew assembleRelease

# iOS
cd ios
xcodebuild -scheme FacialDermaAI -configuration Release
```

---

## 📞 Support & Help

### Getting Help
1. Check [SETUP.md](./SETUP.md) for detailed instructions
2. Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
3. Check backend logs for API errors
4. Review React Native debugger for app errors
5. Test endpoints with Postman

### Common Issues
- Network errors → Check backend URL and firewall
- Build errors → Clean build and reinstall dependencies
- Permission errors → Verify AndroidManifest.xml / Info.plist
- Token errors → Check AsyncStorage and backend response

---

## 🚀 Next Steps

### To Complete Setup:
1. ✅ Install dependencies: `npm install`
2. ✅ Configure permissions (see setup.bat/setup.sh)
3. ✅ Start backend server
4. ✅ Run app: `npm run android`
5. ✅ Create test account and test features

### To Deploy:
1. Update API base URL for production
2. Build release APK/IPA
3. Test on physical devices
4. Submit to Play Store / App Store

---

## 📄 License

[Your License Here]

## 👥 Team

[Your Team Information]

---

**Version**: 1.0.0  
**Last Updated**: November 14, 2025  
**Status**: ✅ Ready for Testing  
**React Native**: 0.81.4  
**Backend API**: Fully Integrated
