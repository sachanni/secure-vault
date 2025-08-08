# Windows Setup Instructions

## Quick Fix for NODE_ENV Error

If you get `'NODE_ENV' is not recognized` or `'cross-env' is not recognized`, follow these steps:

### Option 1: Install cross-env (Recommended)
```bash
npm install cross-env
```

Then update your package.json scripts:
```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "start": "cross-env NODE_ENV=production node dist/index.js"
  }
}
```

Now run: `npm run dev`

### Option 2: Direct Command (No package.json changes needed)
```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

### Option 3: PowerShell Alternative
If you're using PowerShell, you can also use:
```powershell
$env:NODE_ENV="development"; tsx server/index.ts
```

### Option 4: Windows CMD Alternative
```cmd
set NODE_ENV=development && tsx server/index.ts
```

## Complete Windows Setup

1. **Clone/copy project files**
2. **Install dependencies:**
   ```bash
   npm install
   npm install cross-env
   ```
3. **Create .env file:**
   ```bash
   copy .env.example .env
   ```
4. **Update package.json scripts** (see Option 1 above)
5. **Start the app:**
   ```bash
   npm run dev
   ```

Your app will run on `http://localhost:5000`

## Common Windows Issues Fixed:

✅ **NODE_ENV command not recognized** - Use cross-env  
✅ **ENOTSUP listen error** - Server now uses localhost instead of 0.0.0.0 in development  
✅ **Port binding issues** - Disabled reusePort on Windows  

The app is now fully Windows-compatible!