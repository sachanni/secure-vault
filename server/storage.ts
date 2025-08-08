import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { 
  User, Asset, Nominee, WellBeingAlert, AdminAction, MoodEntry, ActivityLog,
  type UserType, type AssetType, type NomineeType, type WellBeingAlertType, 
  type AdminActionType, type MoodEntryType, type ActivityLogType 
} from '../shared/models';

// Define insert types for MongoDB
type InsertUser = {
  fullName: string;
  dateOfBirth: Date;
  mobileNumber: string;
  countryCode: string;
  address: string;
  email: string;
  passwordHash: string;
  provider?: string;
  providerId?: string;
  isVerified: boolean;
};

type InsertAsset = {
  userId: string;
  assetType: string;
  title: string;
  description: string;
  value: string;
  currency: string;
  contactInfo: string;
  storageLocation: string;
  accessInstructions: string;
};

type InsertNominee = {
  userId: string;
  fullName: string;
  relationship: string;
  mobileNumber: string;
  email?: string;
  isVerified?: boolean;
};

type InsertMoodEntry = {
  userId: string;
  mood: string;
  intensity: number;
  notes?: string;
  context?: string;
};

type InsertWellBeingAlert = {
  userId: string;
  alertFrequency: 'daily' | 'weekly' | 'custom';
  customDays?: number;
  alertTime: string;
  enableSMS: boolean;
  enableEmail: boolean;
  maxMissedAlerts: number;
  escalationEnabled: boolean;
  currentCount?: number;
  isActive?: boolean;
};

type InsertAdminAction = {
  userId: string;
  actionType: 'death_verification' | 'notification_approved' | 'account_suspended';
  adminId: string;
  description: string;
  status?: 'pending' | 'completed' | 'cancelled';
};

type InsertActivityLog = {
  userId?: string;
  adminId?: string;
  category: 'user' | 'admin' | 'system' | 'security';
  action: string;
  description: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, any>;
};

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<UserType>;
  getUser(id: string): Promise<UserType | null>;
  getUserById(id: string): Promise<UserType | null>;
  getUserByEmail(email: string): Promise<UserType | null>;
  getUserByMobile(mobileNumber: string): Promise<UserType | null>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<UserType>;
  deleteUser(id: string): Promise<void>;
  listUsers(): Promise<UserType[]>;

  // Nominee operations
  createNominee(nominee: InsertNominee): Promise<NomineeType>;
  getNomineeById(id: string): Promise<NomineeType | null>;
  getNomineesByUserId(userId: string): Promise<NomineeType[]>;
  updateNominee(id: string, nominee: Partial<InsertNominee>): Promise<NomineeType>;
  deleteNominee(id: string): Promise<void>;

  // Asset operations
  createAsset(asset: InsertAsset): Promise<AssetType>;
  getAssetById(id: string): Promise<AssetType | null>;
  getAssetsByUserId(userId: string): Promise<AssetType[]>;
  updateAsset(id: string, asset: Partial<InsertAsset>): Promise<AssetType>;
  deleteAsset(id: string): Promise<void>;

  // Mood operations
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntryType>;
  getMoodEntriesByUserId(userId: string): Promise<MoodEntryType[]>;
  getRecentMoodEntries(userId: string, limit?: number): Promise<MoodEntryType[]>;
  getUserMoodEntries(userId: string): Promise<MoodEntryType[]>;
  getUserLatestMood(userId: string): Promise<MoodEntryType | null>;

  // Activity Log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLogType>;
  getActivityLogs(options?: { category?: string; severity?: string; limit?: number }): Promise<ActivityLogType[]>;

  // Well Being Alert operations
  getWellBeingAlerts(userId?: string): Promise<WellBeingAlertType[]>;
  createWellBeingAlert(alert: InsertWellBeingAlert): Promise<WellBeingAlertType>;
  updateWellBeingAlert(userId: string, alert: Partial<InsertWellBeingAlert>): Promise<WellBeingAlertType>;
  getUsersWithExceededLimits(): Promise<UserType[]>;

  // Admin operations
  getPendingAdminActions(): Promise<AdminActionType[]>;
  createAdminAction(action: InsertAdminAction): Promise<AdminActionType>;
  updateAdminAction(id: string, action: Partial<InsertAdminAction>): Promise<AdminActionType>;
}

export class MongoStorage implements IStorage {
  
  // User operations
  async createUser(userData: any): Promise<any> {
    const user = new User(userData);
    return await user.save();
  }

  async getUser(id: string): Promise<any> {
    return await User.findById(id);
  }

  async getUserById(id: string): Promise<any> {
    return await User.findById(id);
  }

  async getUserByEmail(email: string): Promise<any> {
    return await User.findOne({ email });
  }

  async getUserByMobile(mobileNumber: string): Promise<any> {
    return await User.findOne({ mobileNumber });
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<any> {
    const user = await User.findByIdAndUpdate(id, userData, { new: true });
    if (!user) throw new Error('User not found');
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
  }

  async listUsers(): Promise<any[]> {
    return await User.find({}).sort({ createdAt: -1 });
  }

  // Nominee operations
  async createNominee(nomineeData: InsertNominee): Promise<NomineeType> {
    const nominee = new Nominee(nomineeData);
    return await nominee.save();
  }

  async getNomineeById(id: string): Promise<NomineeType | null> {
    return await Nominee.findById(id);
  }

  async getNomineesByUserId(userId: string): Promise<NomineeType[]> {
    // Admin user has no nominees
    if (userId === "admin") {
      return [];
    }
    return await Nominee.find({ userId });
  }

  async updateNominee(id: string, nomineeData: Partial<InsertNominee>): Promise<NomineeType> {
    const nominee = await Nominee.findByIdAndUpdate(id, nomineeData, { new: true });
    if (!nominee) throw new Error('Nominee not found');
    return nominee;
  }

  async deleteNominee(id: string): Promise<void> {
    await Nominee.findByIdAndDelete(id);
  }

  // Asset operations
  async createAsset(assetData: InsertAsset): Promise<AssetType> {
    const asset = new Asset(assetData);
    return await asset.save();
  }

  async getAssetById(id: string): Promise<AssetType | null> {
    return await Asset.findById(id);
  }

  async getAssetsByUserId(userId: string): Promise<AssetType[]> {
    // Admin user has no assets
    if (userId === "admin") {
      return [];
    }
    return await Asset.find({ userId });
  }

  async updateAsset(id: string, assetData: Partial<InsertAsset>): Promise<AssetType> {
    const asset = await Asset.findByIdAndUpdate(id, assetData, { new: true });
    if (!asset) throw new Error('Asset not found');
    return asset;
  }

  async deleteAsset(id: string): Promise<void> {
    await Asset.findByIdAndDelete(id);
  }

  // Mood operations
  async createMoodEntry(entryData: InsertMoodEntry): Promise<MoodEntryType> {
    const entry = new MoodEntry(entryData);
    return await entry.save();
  }

  async getMoodEntriesByUserId(userId: string): Promise<MoodEntryType[]> {
    // Admin user has no mood entries
    if (userId === "admin") {
      return [];
    }
    return await MoodEntry.find({ userId }).sort({ createdAt: -1 });
  }

  async getRecentMoodEntries(userId: string, limit: number = 10): Promise<MoodEntryType[]> {
    // Admin user has no mood entries
    if (userId === "admin") {
      return [];
    }
    return await MoodEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getUserMoodEntries(userId: string): Promise<MoodEntryType[]> {
    // Admin user has no mood entries
    if (userId === "admin") {
      return [];
    }
    return await MoodEntry.find({ userId }).sort({ createdAt: -1 });
  }

  async getUserLatestMood(userId: string): Promise<MoodEntryType | null> {
    // Admin user has no mood entries
    if (userId === "admin") {
      return null;
    }
    return await MoodEntry.findOne({ userId }).sort({ createdAt: -1 });
  }

  // Activity Log operations
  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLogType> {
    const log = new ActivityLog(logData);
    return await log.save();
  }

  async getActivityLogs(options: { category?: string; severity?: string; limit?: number } = {}): Promise<ActivityLogType[]> {
    const query: any = {};
    if (options.category) query.category = options.category;
    if (options.severity) query.severity = options.severity;
    
    return await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(options.limit || 100);
  }

  // Well Being Alert operations
  async getWellBeingAlerts(userId?: string): Promise<WellBeingAlertType[]> {
    // Admin user has no wellbeing alerts
    if (userId === "admin") {
      return [];
    }
    const query = userId ? { userId } : {};
    return await WellBeingAlert.find(query);
  }

  async createWellBeingAlert(alertData: InsertWellBeingAlert): Promise<WellBeingAlertType> {
    const alert = new WellBeingAlert(alertData);
    return await alert.save();
  }

  async updateWellBeingAlert(userId: string, alertData: Partial<InsertWellBeingAlert>): Promise<WellBeingAlertType> {
    const alert = await WellBeingAlert.findOneAndUpdate({ userId }, alertData, { new: true });
    if (!alert) throw new Error('Well-being alert not found');
    return alert;
  }

  async getUsersWithExceededLimits(): Promise<UserType[]> {
    // Find alerts where currentCount >= maxMissedAlerts
    const exceededAlerts = await WellBeingAlert.find({
      $expr: { $gte: ['$currentCount', '$maxMissedAlerts'] }
    });
    
    // Get user IDs and fetch users separately
    const userIds = exceededAlerts.map(alert => alert.userId);
    const users = await User.find({ _id: { $in: userIds } });
    
    return users;
  }

  // Admin operations
  async getPendingAdminActions(): Promise<AdminActionType[]> {
    return await AdminAction.find({ status: 'pending' }).sort({ createdAt: -1 });
  }

  async createAdminAction(actionData: InsertAdminAction): Promise<AdminActionType> {
    const action = new AdminAction(actionData);
    return await action.save();
  }

  async updateAdminAction(id: string, actionData: Partial<InsertAdminAction>): Promise<AdminActionType> {
    const action = await AdminAction.findByIdAndUpdate(id, actionData, { new: true });
    if (!action) throw new Error('Admin action not found');
    return action;
  }

  // Admin-specific operations
  async getAllUsers(): Promise<UserType[]> {
    return await User.find({}).sort({ createdAt: -1 });
  }

  async getAdminStats() {
    try {
      // Get all users
      const allUsers = await this.getAllUsers();
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter(u => u.accountStatus === 'active').length;
      const suspendedUsers = allUsers.filter(u => u.accountStatus === 'suspended').length;
      const deactivatedUsers = allUsers.filter(u => u.accountStatus === 'inactive').length;

      // Get other stats
      const totalAssets = await Asset.countDocuments();
      const totalNominees = await Nominee.countDocuments();
      const usersAtRisk = await this.getUsersWithExceededLimits();
      const recentActivities = await this.getActivityLogs({ limit: 10 });

      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        deactivatedUsers,
        totalAssets,
        totalNominees,
        usersAtRisk: usersAtRisk.length,
        recentActivities
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw error;
    }
  }

  // Additional helper functions needed by routes
  async updateUserWellBeing(userId: string, data: { lastWellBeingCheck?: Date; wellBeingCounter?: number }): Promise<void> {
    await User.findByIdAndUpdate(userId, data);
  }

  async updateUserWellBeingSettings(userId: string, settings: any): Promise<void> {
    await User.findByIdAndUpdate(userId, settings);
  }

  // Alias functions for different naming conventions
  async getAssets(userId: string): Promise<AssetType[]> {
    return this.getAssetsByUserId(userId);
  }

  async getNominees(userId: string): Promise<NomineeType[]> {
    return this.getNomineesByUserId(userId);
  }
}

// Create singleton instance
export const storage = new MongoStorage();