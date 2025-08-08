# Running the App Locally

## Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB instance)

## Setup Steps

1. **Clone or download the project files**

2. **Install dependencies:**
   ```bash
   npm install
   npm install cross-env
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory with:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://aulnovatechsoft:oARfjGVHaMQCB6vI@cluster0.n5ex4tz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

   # Session Secret (generate a random string)
   SESSION_SECRET=your-very-long-random-session-secret-here

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Remove Replit-specific dependencies:**
   ```bash
   npm uninstall openid-client passport passport-local memoizee
   ```

5. **Update package.json scripts for Windows compatibility:**
   Update the scripts section in package.json to:
   ```json
   {
     "scripts": {
       "dev": "cross-env NODE_ENV=development tsx server/index.ts",
       "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
       "start": "cross-env NODE_ENV=production node dist/index.js"
     }
   }
   ```

6. **Start the application:**
   
   **Option A - Using npm script (after updating package.json):**
   ```bash
   npm run dev
   ```
   
   **Option B - Direct command (works immediately):**
   ```bash
   npx cross-env NODE_ENV=development tsx server/index.ts
   ```

## Key Changes Made for Local Development

1. **Authentication**: Replaced Replit Auth with simple session-based auth
2. **Database**: Uses your MongoDB Atlas connection
3. **Session Storage**: Uses MongoDB instead of PostgreSQL
4. **Environment**: No Replit-specific environment variables required

## Files to Remove (Replit-specific)
- `server/replitAuth.ts` (replaced with `server/localAuth.ts`)
- `drizzle.config.ts` (not needed for MongoDB)
- `shared/schema.ts` (PostgreSQL schema, not needed)

## Production Deployment
- Set `NODE_ENV=production`
- Set `SESSION_SECRET` to a secure random string
- Enable HTTPS and set `secure: true` in cookie settings
- Consider using a process manager like PM2