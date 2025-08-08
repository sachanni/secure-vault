# React Native Mobile App Setup Guide

## Why the React Native App Doesn't Run in Replit

The mobile app in the `mobile/` folder is a React Native application that cannot run directly in Replit's web environment because:

1. **Platform Dependencies**: React Native requires native iOS/Android runtimes
2. **Emulator Requirements**: Mobile emulators need specific system configurations
3. **Build Tools**: React Native requires Xcode (iOS) or Android Studio (Android)
4. **Environment Constraints**: Replit runs in a web browser, not native mobile environment

## How to Run the React Native App Locally

### Prerequisites
- Node.js 16+ installed
- Expo CLI or React Native CLI
- iOS Simulator (macOS) or Android Emulator

### Setup Steps

1. **Download the Mobile Folder**
   ```bash
   # Copy the entire mobile/ folder to your local machine
   ```

2. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

3. **Install Expo CLI (Recommended)**
   ```bash
   npm install -g @expo/cli
   ```

4. **Run the App**
   ```bash
   # For Expo
   expo start

   # For React Native CLI
   npm run android  # For Android
   npm run ios      # For iOS
   ```

### Converting to Expo (Easier Setup)

To make development easier, you can convert the React Native app to use Expo:

1. **Install Expo in the mobile folder**
   ```bash
   npm install expo
   npx expo install --fix
   ```

2. **Update package.json scripts**
   ```json
   {
     "scripts": {
       "start": "expo start",
       "android": "expo start --android",
       "ios": "expo start --ios",
       "web": "expo start --web"
     }
   }
   ```

3. **Create app.json** (already provided in the mobile folder)

## Features Included in the Mobile App

- ✅ **Multi-modal Authentication**: OTP, Password, Google OAuth, Apple ID
- ✅ **Premium UI Design**: Purple-to-pink gradient with glassmorphism effects
- ✅ **Tab-based Login**: Seamless switching between OTP and Password login
- ✅ **Social Media Login**: Google and Apple authentication integration
- ✅ **Enhanced Security**: Biometric authentication support
- ✅ **Error Handling**: Comprehensive error states and validation
- ✅ **Loading States**: Smooth loading animations and feedback
- ✅ **Responsive Design**: Optimized for various mobile screen sizes

## Web Demo Alternative

Since the React Native app cannot run in Replit, we've created a comprehensive web-based demo at `/mobile-demo` that showcases:

- Authentic mobile app UI/UX
- Interactive authentication flows
- Social media login simulation
- Loading states and error handling
- Mobile-responsive design in a phone frame

## Architecture

The mobile app uses:
- **React Native 0.72**: Core framework
- **React Navigation 6**: Navigation system
- **React Hook Form**: Form management
- **AsyncStorage**: Local data persistence
- **Custom Authentication Context**: State management
- **TypeScript**: Type safety throughout

## Backend Integration

The mobile app is designed to connect to the same MongoDB backend as the web application, providing:
- Unified user authentication
- Shared data models
- Consistent API endpoints
- Cross-platform synchronization

## Next Steps

1. Download the `mobile/` folder
2. Follow the local setup guide above
3. Configure your development environment
4. Test on iOS Simulator or Android Emulator
5. Deploy to app stores when ready

The web application at `/mobile-demo` provides a complete preview of how the mobile app will look and behave once running on actual devices.