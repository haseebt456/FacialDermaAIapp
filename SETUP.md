# FacialDermaAI - Setup Instructions

## Prerequisites
- Node.js (v20+)
- React Native development environment set up
- Android Studio (for Android) or Xcode (for iOS)
- Backend server running on port 5000

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Required Packages (if not already installed)

```bash
npm install axios react-native-image-picker @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/stack react-native-screens react-native-gesture-handler
```

### 3. Android Setup

#### a. Update AndroidManifest.xml
Add the following permissions and configuration to `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    
    <application
        android:usesCleartextTraffic="true"
        ...>
    </application>
</manifest>
```

#### b. Link Native Dependencies
```bash
cd android
./gradlew clean
cd ..
```

### 4. iOS Setup (if using Mac)

#### a. Install Pods
```bash
cd ios
pod install
cd ..
```

#### b. Update Info.plist
Add the following to `ios/FacialDermaAI/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to analyze skin conditions</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to analyze skin conditions</string>
```

### 5. Start the Backend Server

Make sure your backend is running on port 5000:
```bash
# In your backend directory
npm start
```

### 6. Run the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

## Configuration

### API Base URL
Update the BASE_URL in `src/services/api.ts`:

```typescript
const BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:5000'  // Android emulator
  // ? 'http://localhost:5000'  // iOS simulator
  : 'https://your-production-url.com';
```

## Features Implemented

✅ User Authentication (Signup/Login) - Patient role only
✅ Modern UI/UX with custom components
✅ Home Screen with dashboard
✅ Skin Analysis Screen with image upload
✅ History Screen showing past predictions
✅ Profile Screen with user information
✅ Comprehensive error handling
✅ Loading states and user feedback
✅ Token-based authentication with AsyncStorage

## Troubleshooting

### Network Errors
- Ensure backend is running on port 5000
- For Android emulator, use `http://10.0.2.2:5000`
- For physical devices, use your computer's IP address

### Build Errors
- Clear Metro cache: `npm start -- --reset-cache`
- Clean Android: `cd android && ./gradlew clean && cd ..`
- Reinstall node_modules: `rm -rf node_modules && npm install`

### Image Picker Issues
- Make sure react-native-image-picker is properly linked
- Check that camera/photo permissions are granted
- Rebuild the app after adding permissions

## API Endpoints Used

- `POST /api/auth/signup` - Create new patient account
- `POST /api/auth/login` - Login with patient role
- `GET /api/users/me` - Get current user info
- `GET /api/predictions` - Get user's prediction history
- `POST /api/predictions/predict` - Upload image for analysis

## Testing

### Test Account
Create a test patient account:
- Username: testpatient
- Email: patient@test.com
- Password: Test123!

## Project Structure

```
src/
├── api/
│   └── api.ts                 # Old API (deprecated)
├── services/
│   ├── api.ts                 # Axios instance with interceptors
│   ├── authService.ts         # Authentication service
│   └── predictionService.ts   # Prediction service
├── components/
│   ├── Button.tsx             # Custom button component
│   ├── Input.tsx              # Custom input component
│   ├── Card.tsx               # Custom card component
│   └── Loading.tsx            # Loading indicator
├── screens/
│   ├── Auth/
│   │   ├── LoginScreen.tsx    # Login screen
│   │   └── SignupScreen.tsx   # Signup screen
│   ├── HomeScreen.tsx         # Main dashboard
│   ├── PredictionScreen.tsx   # Image upload & analysis
│   ├── HistoryScreen.tsx      # Past predictions
│   └── ProfileScreen.tsx      # User profile
├── navigation/
│   ├── AppNavigator.tsx       # Root navigator
│   ├── AuthStack.tsx          # Auth screens navigator
│   └── MainStack.tsx          # Main app navigator
└── styles/
    └── theme.ts               # Global theme & colors
```

## Notes

- The app automatically sets `role: 'patient'` for all auth requests
- Images must contain a clear face for analysis
- Prediction confidence scores range from 0-1 (0-100%)
- All dates are displayed in local timezone
- Token expires after 24 hours

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs
3. Test endpoints using Postman
4. Check React Native debugger for errors
