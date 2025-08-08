# Posthumous Notification System

## Overview
This is a full-stack web application designed for managing digital assets and providing posthumous notifications. The system allows users to securely store asset information and configure well-being alerts. These alerts trigger administrative review if users fail to respond within a defined timeframe, ensuring digital assets are managed according to user wishes after their passing. The project aims to provide peace of mind regarding digital legacy and asset distribution.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **Mobile App**: React Native for Android and iOS, with JWT token-based authentication, AsyncStorage for secure token management, automatic token refresh, and native navigation integration.
- **UI/UX Decisions**: Professional soft color scheme with subtle slate and gray gradients, clean design language across all screens (Welcome, Login, Registration, Dashboard, Assets, MoodTracking, Nominees, Profile). Enhanced icons, micro-interactions, and professional spacing with a focus on accessibility and readability.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: JWT token-based authentication system with multi-modal support (Email/password, mobile OTP, Google OAuth, Apple ID)
- **Token Management**: Comprehensive JWT access and refresh tokens with automatic token refresh for both web and mobile applications
- **Database ODM**: Mongoose ODM with TypeScript models
- **Password Hashing**: bcrypt

### Data Storage Solutions
- **Primary Database**: MongoDB (MongoDB Atlas)
- **Asset Storage**: Configurable (Google Drive, DigiLocker, or local server)
- **Schema Management**: Mongoose schemas with TypeScript definitions

### Core Features
- **User Management**: Multi-step registration, profile management, nominee management, well-being alert configuration.
- **Wellness Mood Tracking System**: Emoji-based mood selection, quick logging, trend analysis, and database persistence.
- **Asset Management System**: Support for various asset types (bank accounts, real estate, cryptocurrency), encrypted storage, and configurable locations.
- **Well-being Alert System**: Configurable frequencies, counter-based tracking, administrative review for non-responsive users, and automated escalation.
- **Admin Dashboard**: User status monitoring, death validation workflow, notification trigger controls, system analytics, comprehensive audit trail, user risk assessment, and detailed user profile management.
- **Authentication System**: Complete JWT token-based authentication with multi-modal support (OTP/Password/OAuth), tab-based switching, social media login (Google/Apple), automatic token refresh, secure token storage (localStorage for web, AsyncStorage for mobile), and secure admin-only access.

### Security Considerations
- HTTPS enforcement, CORS configuration, rate limiting, input validation, SQL injection prevention (via ORM), XSS protection.

## External Dependencies

### Core Dependencies
- **mongoose**: MongoDB ODM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: UI component primitives
- **bcrypt**: Password hashing
- **mongodb**: MongoDB database system
- **express**: Web server framework
- **react-hook-form**: Form state management
- **wouter**: Lightweight routing
- **zod**: Runtime type validation

### Third-party Integrations
- **Replit Auth**: Authentication provider
- **Google Drive API**: Asset storage option
- **DigiLocker API**: Government document storage
- **SMS Gateway**: OTP delivery
- **Email Service**: Notification delivery

## Recent Updates (January 2025)
- **Professional Color Theme Implementation**: Updated color scheme from purple-pink gradient to soft, professional slate and gray tones (#64748b, #475569, #f1f5f9) for better readability and professional appearance
- **JWT Token Authentication Implementation**: Successfully migrated from session-based to JWT token-based authentication for both web and mobile applications
- **Mobile Authentication Enhancement**: Implemented comprehensive JWT token management in React Native with automatic refresh, secure AsyncStorage, and multi-modal authentication support
- **Token Security**: Added bearer token authentication middleware, automatic token refresh on API calls, and secure token storage across platforms
- **Mobile Demo Enhancement**: Updated mobile demo to showcase JWT authentication features and token-based security
- **Biometric Login Animations**: Implemented sophisticated biometric authentication animations including fingerprint scanner, Face ID, and wave animations with progress tracking, success/error states, and vibration feedback
- **Comprehensive Authentication Flow Fixes**: Fixed authentication handling across all web and mobile screens with proper error handling, loading states, and authentication-required prompts for mood tracking, dashboard, and wellness settings
- **Mobile App AbortSignal Fix**: Fixed React Native compatibility error by replacing AbortSignal.timeout with compatible AbortController and setTimeout implementation for API request timeouts