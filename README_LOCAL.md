# Local Development Setup

Your app is now ready to run locally without any Replit dependencies!

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   npm install cross-env
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your MongoDB connection string (already included).

3. **Start the app:**
   
   **For Windows users:**
   ```bash
   npx cross-env NODE_ENV=development tsx server/index.ts
   ```
   
   **For Mac/Linux users:**
   ```bash
   npm run dev
   ```
   
   (Or update package.json scripts to use cross-env for cross-platform compatibility)

The app will run on `http://localhost:5000`

## What was changed:

✅ **Removed Replit Auth** - Replaced with simple session-based authentication  
✅ **Removed PostgreSQL dependencies** - Uses only your MongoDB Atlas database  
✅ **Created local auth system** - Simple session management  
✅ **Environment setup** - Uses standard .env file  
✅ **Removed Replit packages** - openid-client, passport, memoizee removed  

## Files you can delete (Replit-specific):
- `drizzle.config.ts` (PostgreSQL config, not needed)  
- Any remaining `.replit` or `replit.nix` files  

Your app now works completely independently of Replit!

## Technology Stack

### Frontend Technologies
- **React 18** - Modern JavaScript framework with TypeScript
- **Wouter** - Lightweight client-side routing
- **TanStack Query** - Server state management and data fetching
- **Shadcn/ui + Radix UI** - Component library with accessibility primitives
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form + Zod** - Form handling with validation
- **Vite** - Fast build tool and development server

### Backend Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript development
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Mongoose** - MongoDB object modeling for Node.js
- **bcrypt** - Password hashing and security

### Authentication & Security
- **Session-based authentication** - Express sessions with MongoDB storage
- **bcrypt** - Secure password hashing
- **HTTP-only cookies** - Session security

### Development & Deployment
- **tsx** - TypeScript execution for development
- **cross-env** - Cross-platform environment variables
- **MongoDB Atlas** - Cloud database hosting
- **Local development ready** - Windows/Mac/Linux compatible

### Key Features Built
- User registration and authentication system
- Admin panel with comprehensive management tools
- Mood tracking with emotional analytics
- Asset and nominee management
- Well-being alert system
- Activity logging and monitoring

The app uses a modern full-stack JavaScript architecture with MongoDB as the sole database, making it completely platform-independent.