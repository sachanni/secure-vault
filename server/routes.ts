import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AuthService, authenticateToken, requireAdmin, optionalAuthentication } from "./auth";
import { z } from "zod";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectToDatabase } from "./database";

// Additional validation schemas
const registrationStep1Schema = z.object({
  fullName: z.string().min(2),
  dateOfBirth: z.string(),
  mobileNumber: z.string().min(10),
  countryCode: z.string().default('+91'),
  address: z.string().min(10),
});

const registrationStep2Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Temporary storage for registration flow (can be replaced with Redis in production)
const registrationTempData = new Map<string, {
  step1Data?: {
    fullName: string;
    dateOfBirth: string;
    mobileNumber: string;
    countryCode: string;
    address: string;
  };
  otp?: string;
  otpExpiry?: number;
}>();

const loginSchema = z.object({
  identifier: z.string(), // mobile or email
  password: z.string().optional(),
  otp: z.string().optional(),
});

const assetSchema = z.object({
  assetType: z.string(),
  title: z.string(),
  description: z.string(),
  value: z.string(),
  currency: z.string().default('USD'),
  contactInfo: z.string(),
  storageLocation: z.string(),
  accessInstructions: z.string(),
});

const nomineeSchema = z.object({
  fullName: z.string(),
  relationship: z.string(),
  mobileNumber: z.string(),
  email: z.string().optional(),
});

const moodEntrySchema = z.object({
  mood: z.string(),
  intensity: z.number().min(1).max(10),
  notes: z.string().optional(),
  context: z.string().optional(),
});

const insertMoodEntrySchema = z.object({
  userId: z.string(),
  mood: z.string(),
  intensity: z.number().min(1).max(10),
  notes: z.string().optional(),
  context: z.string().optional(),
});

const wellBeingSettingsSchema = z.object({
  alertFrequency: z.enum(["daily", "weekly", "custom"]),
  customDays: z.number().min(1).max(30).optional(),
  alertTime: z.string(),
  enableSMS: z.boolean(),
  enableEmail: z.boolean(),
  maxMissedAlerts: z.number().min(1).max(50),
  escalationEnabled: z.boolean(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB connection
  await connectToDatabase();

  // Auth routes with token-based authentication
  app.get('/api/auth/user', authenticateToken, async (req: Request, res: Response) => {
    try {
      // Check if this is an admin user first
      if (req.userId === "admin") {
        return res.json({
          success: true,
          user: {
            _id: "admin",
            fullName: "System Administrator",
            email: "admin@aulnovatechsoft.com",
            mobileNumber: "",
            dateOfBirth: "",
            address: "",
            provider: "local",
            isVerified: true,
            isAdmin: true,
            alertFrequency: "daily",
            enableSMS: false,
            enableEmail: true,
            createdAt: new Date().toISOString()
          }
        });
      }

      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
      
      res.json({
        success: true,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          provider: user.provider,
          isVerified: user.isVerified,
          alertFrequency: user.alertFrequency,
          enableSMS: user.enableSMS,
          enableEmail: user.enableEmail,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch user" 
      });
    }
  });

  // Token refresh endpoint
  app.post('/api/auth/refresh', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const decoded = AuthService.verifyRefreshToken(refreshToken);
      const user = await storage.getUser(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const tokens = AuthService.generateTokens(user);

      res.json({
        success: true,
        ...tokens
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  });

  // Debug endpoint for token testing
  app.get('/api/debug/token', optionalAuthentication, (req: Request, res: Response) => {
    res.json({
      authenticated: !!req.userId,
      userId: req.userId,
      headers: {
        authorization: req.headers.authorization
      }
    });
  });

  // Debug endpoint to create test user
  app.post('/api/debug/create-test-user', async (req: Request, res: Response) => {
    try {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const userData = {
        fullName: 'Test User',
        email: 'user@gmail.com',
        mobileNumber: '9876543210',
        countryCode: '+91',
        address: 'Test Address 123',
        dateOfBirth: new Date('1990-01-01'),
        password: hashedPassword,
        provider: 'local',
        isVerified: true
      };

      const existingUser = await storage.getUserByEmail('user@gmail.com');
      if (existingUser) {
        return res.json({ success: true, message: 'Test user already exists', user: existingUser });
      }

      const user = await storage.createUser(userData);
      res.json({ success: true, message: 'Test user created successfully', user: { _id: user._id, email: user.email, fullName: user.fullName } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create test user', error: error.message });
    }
  });

  // Registration endpoints
  app.post('/api/register/step1', async (req: Request, res: Response) => {
    try {
      console.log('Step 1 request received:', req.body);
      const validatedData = registrationStep1Schema.parse(req.body);
      
      // Check if mobile number already exists
      const existingUser = await storage.getUserByMobile(validatedData.mobileNumber);
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Mobile number already registered" 
        });
      }
      
      // Generate a temporary token for registration flow
      const tempId = validatedData.mobileNumber + '_' + Date.now();
      registrationTempData.set(tempId, { step1Data: validatedData });
      
      console.log('Generated tempId:', tempId);
      console.log('TempData stored:', registrationTempData.has(tempId));
      
      const responseData = { 
        success: true, 
        message: "Step 1 completed successfully",
        tempId
      };
      
      console.log('About to send response:', responseData);
      return res.status(200).json(responseData);
    } catch (error: any) {
      console.error('Step 1 error:', error);
      return res.status(400).json({ 
        success: false,
        message: "Invalid data", 
        error: error.message 
      });
    }
  });

  app.post('/api/register/step2', async (req: Request, res: Response) => {
    try {
      const { tempId, ...validatedData } = registrationStep2Schema.extend({
        tempId: z.string()
      }).parse(req.body);
      
      const tempData = registrationTempData.get(tempId);
      if (!tempData || !tempData.step1Data) {
        return res.status(400).json({ 
          success: false,
          message: "Please complete step 1 first or session expired" 
        });
      }

      const step1Data = tempData.step1Data;
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user
      const passwordHash = await bcrypt.hash(validatedData.password, 10);
      const userData = {
        ...step1Data,
        email: validatedData.email,
        password: passwordHash,
        dateOfBirth: new Date(step1Data.dateOfBirth),
        provider: 'local',
        isVerified: false
      };

      const user = await storage.createUser(userData);
      
      // Generate tokens for the new user
      const tokens = AuthService.generateTokens(user);
      
      // Clear temporary data
      registrationTempData.delete(tempId);
      
      res.json({ 
        success: true, 
        message: "Registration successful",
        user: { 
          _id: user._id, 
          email: user.email, 
          fullName: user.fullName 
        },
        ...tokens
      });
    } catch (error: any) {
      res.status(400).json({ message: "Registration failed", error: error.message });
    }
  });

  // Login endpoints
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { identifier, password, otp } = loginSchema.parse(req.body);
      
      console.log("Login attempt - identifier:", identifier, "password provided:", !!password);
      
      // Check for admin credentials first
      if (identifier === "admin@aulnovatechsoft.com" && password === "Admin@123") {
        console.log("Admin login successful!");
        
        // Create a virtual admin user for token generation
        const adminUser = {
          _id: "admin",
          email: "admin@aulnovatechsoft.com",
          fullName: "System Administrator",
          provider: "local"
        } as any;
        
        const tokens = AuthService.generateTokens(adminUser);
        
        return res.json({
          success: true,
          user: { 
            _id: "admin", 
            email: "admin@aulnovatechsoft.com", 
            fullName: "System Administrator",
            isAdmin: true
          },
          ...tokens,
          redirectTo: "/admin-panel"
        });
      }
      
      // Find user by email or mobile
      let user = await storage.getUserByEmail(identifier);
      if (!user) {
        user = await storage.getUserByMobile(identifier);
      }
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials" 
        });
      }

      // For OTP login (priority)
      if (otp) {
        // Get OTP from temporary storage (replace with Redis in production)
        const tempKey = `otp_${identifier}`;
        const tempOtpData = registrationTempData.get(tempKey);
        
        if (!tempOtpData || !tempOtpData.otp || tempOtpData.otp !== otp) {
          return res.status(401).json({ 
            success: false,
            message: "Invalid or expired OTP" 
          });
        }

        // Check OTP expiry
        if (tempOtpData.otpExpiry && Date.now() > tempOtpData.otpExpiry) {
          registrationTempData.delete(tempKey);
          return res.status(401).json({ 
            success: false,
            message: "OTP expired" 
          });
        }
        
        // Clear OTP from storage
        registrationTempData.delete(tempKey);
        
        // Generate tokens
        const tokens = AuthService.generateTokens(user);
        
        res.json({ 
          success: true, 
          user: { 
            _id: user._id, 
            email: user.email, 
            fullName: user.fullName 
          },
          ...tokens
        });
      } else if (password) {
        // Password login
        if (!user.password) {
          return res.status(401).json({ 
            success: false,
            message: "Password not set for this account" 
          });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ 
            success: false,
            message: "Invalid credentials" 
          });
        }
        
        // Generate tokens
        const tokens = AuthService.generateTokens(user);
        
        res.json({ 
          success: true, 
          user: { 
            _id: user._id, 
            email: user.email, 
            fullName: user.fullName 
          },
          ...tokens
        });
      } else {
        res.status(400).json({ 
          success: false,
          message: "Password or OTP required" 
        });
      }
    } catch (error: any) {
      res.status(400).json({ message: "Login failed", error: error.message });
    }
  });

  // Google OAuth login route
  app.post('/api/auth/google', async (req: Request, res: Response) => {
    try {
      const { provider, email, name, providerId } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is required' 
        });
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user for Google OAuth
        const userData = {
          fullName: name || 'Google User',
          email,
          mobileNumber: '', // Will be updated later
          countryCode: '+1',
          address: 'OAuth User',
          dateOfBirth: new Date('1990-01-01'),
          password: '', // No password for OAuth users
          provider: 'google',
          providerId: providerId || email,
          isVerified: true
        };
        
        user = await storage.createUser(userData);
      } else {
        // Update provider info if user exists but was created with different method
        if (!user.provider || user.provider === 'local') {
          user.provider = 'google';
          user.providerId = providerId || email;
          await storage.updateUser(user._id, user);
        }
      }

      // Generate tokens
      const tokens = AuthService.generateTokens(user);

      res.json({
        success: true,
        message: 'Google login successful',
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          provider: 'google'
        },
        ...tokens
      });
    } catch (error: any) {
      console.error('Google login error:', error);
      res.status(500).json({ message: 'Google login failed', error: error.message });
    }
  });

  // Apple ID login route
  app.post('/api/auth/apple', async (req: Request, res: Response) => {
    try {
      const { provider, email, name, providerId } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is required' 
        });
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user for Apple ID
        const userData = {
          fullName: name || 'Apple User',
          email,
          mobileNumber: '', // Will be updated later
          countryCode: '+1',
          address: 'OAuth User',
          dateOfBirth: new Date('1990-01-01'),
          password: '', // No password for OAuth users
          provider: 'apple',
          providerId: providerId || email,
          isVerified: true
        };
        
        user = await storage.createUser(userData);
      } else {
        // Update provider info if user exists but was created with different method
        if (!user.provider || user.provider === 'local') {
          user.provider = 'apple';
          user.providerId = providerId || email;
          await storage.updateUser(user._id, user);
        }
      }

      // Generate tokens
      const tokens = AuthService.generateTokens(user);

      res.json({
        success: true,
        message: 'Apple login successful',
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          provider: 'apple'
        },
        ...tokens
      });
    } catch (error: any) {
      console.error('Apple login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Apple login failed', 
        error: error.message 
      });
    }
  });

  app.post('/api/send-otp', async (req: Request, res: Response) => {
    try {
      const { identifier } = req.body;
      
      // Find user
      let user = await storage.getUserByEmail(identifier);
      if (!user) {
        user = await storage.getUserByMobile(identifier);
      }
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      // Generate OTP (6 digits)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in temporary storage (replace with Redis in production)
      const tempKey = `otp_${identifier}`;
      registrationTempData.set(tempKey, { 
        otp, 
        otpExpiry: Date.now() + 5 * 60 * 1000 // 5 minutes
      });
      
      // TODO: Send OTP via SMS/Email service
      console.log(`OTP for ${identifier}: ${otp}`);
      
      // Temporarily include OTP in response for testing (remove in production)
      res.json({ 
        success: true, 
        message: "OTP sent successfully", 
        otp: otp // Remove this in production
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: "Failed to send OTP", 
        error: error.message 
      });
    }
  });

  // Logout route
  app.post('/api/logout', authenticateToken, async (req: Request, res: Response) => {
    try {
      // For JWT tokens, we don't need to do server-side invalidation
      // Token will naturally expire or client can remove it
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: "Logout failed", 
        error: error.message 
      });
    }
  });

  // Protected routes
  app.get('/api/dashboard/stats', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      
      const [assets, nominees, alerts] = await Promise.all([
        storage.getAssets(userId),
        storage.getNominees(userId),
        storage.getWellBeingAlerts(userId),
      ]);
      
      const user = await storage.getUser(userId);
      
      res.json({
        totalAssets: assets.length,
        totalNominees: nominees.length,
        lastCheckin: user?.lastWellBeingCheck,
        wellBeingCounter: user?.wellBeingCounter || 0,
        recentAssets: assets.slice(0, 3),
        nominees: nominees.slice(0, 3),
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch dashboard data", error: error.message });
    }
  });

  // Nominee management
  app.get('/api/nominees', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const nominees = await storage.getNominees(userId);
      res.json({ success: true, nominees });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch nominees", 
        error: error.message 
      });
    }
  });

  app.post('/api/nominees', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      // Validate request body without userId
      const validatedData = nomineeSchema.parse(req.body);

      // Add userId after validation
      const nomineeWithUserId = {
        ...validatedData,
        userId
      };

      const nominee = await storage.createNominee(nomineeWithUserId);
      res.json({ success: true, nominee });
    } catch (error: any) {
      console.error("Error creating nominee:", error);
      res.status(400).json({ 
        success: false,
        message: "Failed to create nominee", 
        error: error.message 
      });
    }
  });

  // Asset management
  app.get('/api/assets', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const assets = await storage.getAssets(userId);
      res.json({ success: true, assets });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch assets", 
        error: error.message 
      });
    }
  });

  app.post('/api/assets', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const assetData = assetSchema.parse(req.body);
      
      const asset = await storage.createAsset({
        ...assetData,
        userId,
      });
      
      res.json({ success: true, asset });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to create asset", error: error.message });
    }
  });

  // Well-being check
  app.post('/api/wellbeing/confirm', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      
      await storage.updateUserWellBeing(userId, {
        lastWellBeingCheck: new Date(),
        wellBeingCounter: 0
      });
      
      res.json({ success: true, message: "Well-being confirmed" });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: "Failed to confirm well-being", 
        error: error.message 
      });
    }
  });

  // Well-being settings
  app.get('/api/wellbeing/settings', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      // Return current user settings
      const settings = {
        alertFrequency: user.alertFrequency || 'daily',
        customDays: user.customDays || 1,
        alertTime: user.alertTime || '09:00',
        enableSMS: user.enableSMS !== false,
        enableEmail: user.enableEmail !== false,
        maxMissedAlerts: user.maxWellBeingLimit || 15,
        escalationEnabled: user.escalationEnabled !== false,
      };
      
      res.json({ success: true, settings });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch settings", 
        error: error.message 
      });
    }
  });

  app.put('/api/wellbeing/settings', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const settingsData = wellBeingSettingsSchema.parse(req.body);
      
      await storage.updateUserWellBeingSettings(userId, {
        alertFrequency: settingsData.alertFrequency,
        customDays: settingsData.customDays,
        alertTime: settingsData.alertTime,
        enableSMS: settingsData.enableSMS,
        enableEmail: settingsData.enableEmail,
        maxWellBeingLimit: settingsData.maxMissedAlerts,
        escalationEnabled: settingsData.escalationEnabled,
      });
      
      res.json({ success: true, message: "Settings updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: "Failed to update settings", error: error.message });
    }
  });

  app.post('/api/wellbeing/test-alert', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // TODO: Implement actual SMS/Email sending
      // For now, just log the test alert
      console.log(`Test alert sent to user ${userId} (${user.email}, ${user.mobileNumber})`);
      
      res.json({ success: true, message: "Test alert sent successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to send test alert", error: error.message });
    }
  });

  // Mood tracking endpoints
  app.get('/api/mood/entries', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 30;
      
      const moods = await storage.getUserMoodEntries(userId);
      res.json(moods);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch mood entries", error: error.message });
    }
  });

  // Simple mood endpoint (used by frontend)
  app.post('/api/mood', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      console.log('Mood tracking request:', { body: req.body, userId });
      
      const moodData = insertMoodEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      console.log('Parsed mood data:', moodData);
      const mood = await storage.createMoodEntry(moodData);
      res.json({ success: true, mood });
    } catch (error: any) {
      console.error('Mood tracking error:', error);
      res.status(400).json({ message: "Failed to create mood entry", error: error.message });
    }
  });

  app.post('/api/mood/entries', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      console.log('Mood entry request:', { body: req.body, userId });
      
      const moodData = insertMoodEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      console.log('Parsed mood data:', moodData);
      const mood = await storage.createMoodEntry(moodData);
      res.json({ success: true, mood });
    } catch (error: any) {
      console.error('Mood entry error:', error);
      res.status(400).json({ message: "Failed to create mood entry", error: error.message });
    }
  });

  app.get('/api/mood/latest', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const mood = await storage.getUserLatestMood(userId);
      res.json(mood || null);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch latest mood", error: error.message });
    }
  });


  // Admin routes (require admin authentication)
  app.get('/api/admin/stats', requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const pendingActions = await storage.getPendingAdminActions();
      
      // Count all users as active since they are registered and not explicitly suspended
      const activeUsers = users.length;
      const usersWithExceededLimits = await storage.getUsersWithExceededLimits();
      
      // Get additional stats for mobile compatibility
      const allAssets = await storage.getAllAssets();
      const allNominees = await storage.getAllNominees();
      
      res.json({
        success: true,
        stats: {
          totalUsers: users.length,
          activeUsers,
          totalAssets: allAssets.length,
          totalNominees: allNominees.length,
          usersAtRisk: usersWithExceededLimits.length,
          pendingAlerts: usersWithExceededLimits.length,
          pendingValidations: pendingActions.filter((a: any) => a.actionType === 'death_validation').length,
          recentActivities: []
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch admin stats", 
        error: error.message 
      });
    }
  });

  // Get all users endpoint for admin
  app.get('/api/admin/users', requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      console.log('Sample user data for status check:', users[0] ? {
        isActive: users[0].isActive,
        accountStatus: users[0].accountStatus,
        email: users[0].email
      } : 'No users found');
      
      const formattedUsers = users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        // Most users should be active unless explicitly deactivated
        accountStatus: 'active', // Default to active since these are registered users
        wellBeingCounter: user.wellBeingCounter || 0,
        maxWellBeingLimit: user.maxWellBeingLimit || 30,
        lastActivity: user.lastActivity || user.createdAt,
        createdAt: user.createdAt,
        isVerified: user.isVerified || false
      }));
      
      res.json({
        success: true,
        users: formattedUsers
      });
    } catch (error: any) {
      console.error('Failed to fetch admin users:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch users", 
        error: error.message 
      });
    }
  });

  // Get users at risk endpoint for admin
  app.get('/api/admin/users-at-risk', requireAdmin, async (req: Request, res: Response) => {
    try {
      const usersWithExceededLimits = await storage.getUsersWithExceededLimits();
      const formattedUsers = usersWithExceededLimits.map((user: any) => ({
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        accountStatus: user.isActive ? 'active' : 'deactivated',
        wellBeingCounter: user.wellBeingCounter || 0,
        maxWellBeingLimit: user.maxWellBeingLimit || 30,
        lastActivity: user.lastActivity || user.createdAt,
        createdAt: user.createdAt,
        isVerified: user.isVerified
      }));
      
      res.json({
        success: true,
        users: formattedUsers
      });
    } catch (error: any) {
      console.error('Failed to fetch users at risk:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch users at risk", 
        error: error.message 
      });
    }
  });

  // Get activity logs endpoint for admin
  app.get('/api/admin/activity-logs', requireAdmin, async (req: Request, res: Response) => {
    try {
      // For now, return sample activity logs since we haven't implemented activity logging yet
      const logs = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          action: 'User Login',
          userId: 'user123',
          userEmail: 'user@example.com',
          severity: 'info',
          details: 'User successfully logged in'
        }
      ];
      
      res.json({
        success: true,
        logs
      });
    } catch (error: any) {
      console.error('Failed to fetch activity logs:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch activity logs", 
        error: error.message 
      });
    }
  });

  app.get('/api/admin/pending-validations', requireAdmin, async (req: Request, res: Response) => {
    try {
      const usersWithExceededLimits = await storage.getUsersWithExceededLimits();
      const usersWithNominees = await Promise.all(
        usersWithExceededLimits.map(async (user: any) => ({
          ...user,
          nominees: await storage.getNominees(user.id),
        }))
      );
      
      res.json({
        success: true,
        validations: usersWithNominees
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch pending validations", 
        error: error.message 
      });
    }
  });

  app.post('/api/admin/approve-death-validation', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, notes } = req.body;
      
      const action = await storage.createAdminAction({
        userId,
        actionType: 'death_validation',
        status: 'approved',
        notes,
      });
      
      // TODO: Send notifications to nominees
      
      res.json({ success: true, action });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to approve validation", error: error.message });
    }
  });

  // Logout endpoint
  app.post('/api/logout', async (req: Request, res: Response) => {
    try {
      // For token-based auth, logout is handled client-side by clearing tokens
      // Optional: Implement token blacklisting here if needed
      res.json({ 
        success: true, 
        message: "Logged out successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: "Logout failed", 
        error: error.message 
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
      success: true,
      message: "Server is running",
      timestamp: new Date().toISOString()
    });
  });


  // Get activity logs
  app.get("/api/admin/activity-logs", requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      console.error('Error getting activity logs:', error);
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  // Get users at risk
  app.get("/api/admin/users-at-risk", requireAdmin, async (req, res) => {
    try {
      const usersAtRisk = await storage.getUsersAtRisk();
      res.json(usersAtRisk);
    } catch (error) {
      console.error('Error getting users at risk:', error);
      res.status(500).json({ error: "Failed to fetch users at risk" });
    }
  });

  // Update user account status
  app.patch("/api/admin/users/:userId/status", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { accountStatus, reason } = req.body;
      
      if (!['active', 'suspended', 'deactivated'].includes(accountStatus)) {
        return res.status(400).json({ error: "Invalid account status" });
      }

      await storage.updateUserStatus(userId, accountStatus);
      
      // Log admin action
      if (req.user && (req.user as any).id) {
        await storage.createAdminLog({
          adminUserId: (req.user as any).id,
          action: `user_${accountStatus}`,
          targetUserId: userId,
          details: reason || `User account ${accountStatus}`
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  // Get user details for admin
  app.get("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUserById(userId);
      const userAssets = await storage.getAssetsByUserId(userId);
      const userNominees = await storage.getNomineesByUserId(userId);
      const moodEntries = await storage.getMoodEntriesByUserId(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user details without sensitive asset information
      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          accountStatus: user.accountStatus,
          wellBeingCounter: user.wellBeingCounter,
          maxWellBeingLimit: user.maxWellBeingLimit,
          lastWellBeingCheck: user.lastWellBeingCheck,
          alertFrequency: user.alertFrequency,
          createdAt: user.createdAt
        },
        assetCount: userAssets.length,
        nomineeCount: userNominees.length,
        moodEntryCount: moodEntries.length,
        nominees: userNominees.map((n: any) => ({
          id: n.id,
          fullName: n.fullName,
          relationship: n.relationship,
          isVerified: n.isVerified
        }))
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  });

  // Get admin logs
  app.get("/api/admin/logs", requireAdmin, async (req, res) => {
    try {
      const logs = await storage.getRecentAdminLogs(50);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin logs" });
    }
  });

  // Trigger well-being alert for user (admin action)
  app.post("/api/admin/users/:userId/alert", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { message } = req.body;
      
      // Create well-being alert
      await storage.createWellBeingAlert({
        userId,
        alertType: 'admin_escalation',
        status: 'pending'
      });
      
      // Log admin action
      if (req.user && (req.user as any).id) {
        await storage.createAdminLog({
          adminUserId: (req.user as any).id,
          action: 'alert_triggered',
          targetUserId: userId,
          details: message || 'Admin triggered well-being alert'
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
