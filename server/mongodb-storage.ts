import { nanoid } from 'nanoid';
import bcrypt from "bcrypt";
import { connectMongoDB } from './mongodb';
import {
  User as UserModel,
  MoodEntry as MoodEntryModel,
  Nominee as NomineeModel,
  Asset as AssetModel,
  WellBeingAlert as WellBeingAlertModel,
  AdminAction as AdminActionModel,
  ActivityLog as ActivityLogModel,
  UserRiskAssessment as UserRiskAssessmentModel,
  AdminLog as AdminLogModel,
  type User,
  type UpsertUser,
  type InsertUser,
  type MoodEntry,
  type InsertMoodEntry,
  type Nominee,
  type InsertNominee,
  type Asset,
  type InsertAsset,
  type WellBeingAlert,
  type InsertWellBeingAlert,
  type AdminAction,
  type InsertAdminAction,
  type ActivityLog,
  type InsertActivityLog,
  type UserRiskAssessment,
  type InsertUserRiskAssessment,
  type AdminLog,
  type InsertAdminLog,
} from "@shared/mongodb-schema";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // App-specific user operations
  getUserByMobile(mobileNumber: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(userId: string): Promise<User | undefined>;
  createUser(userData: {
    fullName: string;
    dateOfBirth: Date;
    mobileNumber: string;
    countryCode: string;
    address: string;
    email: string;
    password: string;
  }): Promise<User>;
  updateUserWellBeing(userId: string): Promise<void>;
  updateUserWellBeingSettings(userId: string, settings: any): Promise<void>;
  incrementWellBeingCounter(userId: string): Promise<void>;
  getUsersWithExceededLimits(): Promise<User[]>;
  
  // Admin operations
  getAllUsersWithFilters(filters: any): Promise<{ users: User[], total: number }>;
  updateUserStatus(userId: string, status: string, reason?: string): Promise<void>;
  createAdminLog(logData: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(limit?: number): Promise<AdminLog[]>;
  
  // Mood operations
  createMoodEntry(moodData: InsertMoodEntry): Promise<MoodEntry>;
  getUserMoodEntries(userId: string): Promise<MoodEntry[]>;
  getLatestMoodEntry(userId: string): Promise<MoodEntry | undefined>;
  getMoodStats(userId: string): Promise<any>;
  
  // Nominee operations  
  createNominee(nomineeData: InsertNominee): Promise<Nominee>;
  getUserNominees(userId: string): Promise<Nominee[]>;
  updateNominee(nomineeId: string, nomineeData: Partial<Nominee>): Promise<Nominee | undefined>;
  deleteNominee(nomineeId: string): Promise<void>;
  
  // Asset operations
  createAsset(assetData: InsertAsset): Promise<Asset>;
  getUserAssets(userId: string): Promise<Asset[]>;
  updateAsset(assetId: string, assetData: Partial<Asset>): Promise<Asset | undefined>;
  deleteAsset(assetId: string): Promise<void>;
  
  // Well-being alert operations
  createWellBeingAlert(alertData: InsertWellBeingAlert): Promise<WellBeingAlert>;
  getUserWellBeingAlerts(userId: string): Promise<WellBeingAlert[]>;
  resolveWellBeingAlert(alertId: string): Promise<void>;
  
  // Admin action operations
  createAdminAction(actionData: InsertAdminAction): Promise<AdminAction>;
  getAdminActions(): Promise<AdminAction[]>;
  updateAdminAction(actionId: string, actionData: Partial<AdminAction>): Promise<AdminAction | undefined>;
  
  // Activity log operations
  createActivityLog(logData: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(filters?: any): Promise<ActivityLog[]>;
  
  // Risk assessment operations
  createUserRiskAssessment(assessmentData: InsertUserRiskAssessment): Promise<UserRiskAssessment>;
  getUserRiskAssessments(userId: string): Promise<UserRiskAssessment[]>;
  updateUserRiskAssessment(assessmentId: string, assessmentData: Partial<UserRiskAssessment>): Promise<UserRiskAssessment | undefined>;
}

export class MongoDBStorage implements IStorage {
  constructor() {
    // Ensure MongoDB connection is established
    connectMongoDB().catch(console.error);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ id }).lean();
    return user ? this.transformUser(user) : undefined;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existingUser = await UserModel.findOne({ id: user.id });
    
    if (existingUser) {
      Object.assign(existingUser, user);
      await existingUser.save();
      return this.transformUser(existingUser);
    } else {
      const newUser = new UserModel({
        ...user,
        id: user.id || nanoid(),
      });
      await newUser.save();
      return this.transformUser(newUser);
    }
  }

  async getUserByMobile(mobileNumber: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ mobileNumber }).lean();
    return user ? this.transformUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email }).lean();
    return user ? this.transformUser(user) : undefined;
  }

  async getUserById(userId: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ id: userId }).lean();
    return user ? this.transformUser(user) : undefined;
  }

  async createUser(userData: {
    fullName: string;
    dateOfBirth: Date;
    mobileNumber: string;
    countryCode: string;
    address: string;
    email: string;
    password: string;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    const user = new UserModel({
      id: nanoid(),
      fullName: userData.fullName,
      dateOfBirth: userData.dateOfBirth,
      mobileNumber: userData.mobileNumber,
      countryCode: userData.countryCode,
      address: userData.address,
      email: userData.email,
      passwordHash,
    });
    
    await user.save();
    return this.transformUser(user);
  }

  async updateUserWellBeing(userId: string): Promise<void> {
    await UserModel.updateOne(
      { id: userId },
      { 
        lastWellBeingCheck: new Date(),
        wellBeingCounter: 0
      }
    );
  }

  async updateUserWellBeingSettings(userId: string, settings: any): Promise<void> {
    await UserModel.updateOne({ id: userId }, settings);
  }

  async incrementWellBeingCounter(userId: string): Promise<void> {
    await UserModel.updateOne(
      { id: userId },
      { $inc: { wellBeingCounter: 1 } }
    );
  }

  async getUsersWithExceededLimits(): Promise<User[]> {
    const users = await UserModel.find({
      $expr: { $gte: ['$wellBeingCounter', '$maxWellBeingLimit'] }
    }).lean();
    return users.map(user => this.transformUser(user));
  }

  // Admin operations
  async getAllUsersWithFilters(filters: any): Promise<{ users: User[], total: number }> {
    const query: any = {};
    
    if (filters.search) {
      query.$or = [
        { fullName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { mobileNumber: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    if (filters.status) {
      query.accountStatus = filters.status;
    }
    
    if (filters.riskLevel) {
      // This would require joining with risk assessments - simplified for now
      query.riskLevel = filters.riskLevel;
    }

    const total = await UserModel.countDocuments(query);
    const users = await UserModel.find(query)
      .limit(filters.limit || 50)
      .skip(filters.offset || 0)
      .sort({ createdAt: -1 })
      .lean();

    return {
      users: users.map(user => this.transformUser(user)),
      total
    };
  }

  async updateUserStatus(userId: string, status: string, reason?: string): Promise<void> {
    await UserModel.updateOne(
      { id: userId },
      { accountStatus: status }
    );
  }

  async createAdminLog(logData: InsertAdminLog): Promise<AdminLog> {
    const adminLog = new AdminLogModel(logData);
    await adminLog.save();
    return adminLog.toObject();
  }

  async getAdminLogs(limit = 50): Promise<AdminLog[]> {
    const logs = await AdminLogModel.find()
      .populate('adminUserId', 'fullName email')
      .populate('targetUserId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return logs;
  }

  // Mood operations
  async createMoodEntry(moodData: InsertMoodEntry): Promise<MoodEntry> {
    const user = await UserModel.findOne({ id: moodData.userId });
    if (!user) throw new Error('User not found');
    
    const moodEntry = new MoodEntryModel({
      ...moodData,
      userId: user._id
    });
    await moodEntry.save();
    return moodEntry.toObject();
  }

  async getUserMoodEntries(userId: string): Promise<MoodEntry[]> {
    const user = await UserModel.findOne({ id: userId });
    if (!user) return [];
    
    const entries = await MoodEntryModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();
    return entries;
  }

  async getLatestMoodEntry(userId: string): Promise<MoodEntry | undefined> {
    const user = await UserModel.findOne({ id: userId });
    if (!user) return undefined;
    
    const entry = await MoodEntryModel.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();
    return entry || undefined;
  }

  async getMoodStats(userId: string): Promise<any> {
    const user = await UserModel.findOne({ id: userId });
    if (!user) return null;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const stats = await MoodEntryModel.aggregate([
      { $match: { userId: user._id, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const totalEntries = await MoodEntryModel.countDocuments({
      userId: user._id,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    return { stats, totalEntries };
  }

  // Nominee operations
  async createNominee(nomineeData: InsertNominee): Promise<Nominee> {
    const user = await UserModel.findOne({ id: nomineeData.userId });
    if (!user) throw new Error('User not found');
    
    const nominee = new NomineeModel({
      ...nomineeData,
      userId: user._id
    });
    await nominee.save();
    return nominee.toObject();
  }

  async getUserNominees(userId: string): Promise<Nominee[]> {
    const user = await UserModel.findOne({ id: userId });
    if (!user) return [];
    
    const nominees = await NomineeModel.find({ userId: user._id }).lean();
    return nominees.map(nominee => ({
      ...nominee,
      id: nominee._id.toString()
    }));
  }

  async updateNominee(nomineeId: string, nomineeData: Partial<Nominee>): Promise<Nominee | undefined> {
    const nominee = await NomineeModel.findByIdAndUpdate(
      nomineeId,
      nomineeData,
      { new: true }
    ).lean();
    return nominee ? { ...nominee, id: nominee._id.toString() } : undefined;
  }

  async deleteNominee(nomineeId: string): Promise<void> {
    await NomineeModel.findByIdAndDelete(nomineeId);
  }

  // Asset operations
  async createAsset(assetData: InsertAsset): Promise<Asset> {
    const user = await UserModel.findOne({ id: assetData.userId });
    if (!user) throw new Error('User not found');
    
    const asset = new AssetModel({
      ...assetData,
      userId: user._id
    });
    await asset.save();
    return asset.toObject();
  }

  async getUserAssets(userId: string): Promise<Asset[]> {
    const user = await UserModel.findOne({ id: userId });
    if (!user) return [];
    
    const assets = await AssetModel.find({ userId: user._id }).lean();
    return assets.map(asset => ({
      ...asset,
      id: asset._id.toString()
    }));
  }

  async updateAsset(assetId: string, assetData: Partial<Asset>): Promise<Asset | undefined> {
    const asset = await AssetModel.findByIdAndUpdate(
      assetId,
      assetData,
      { new: true }
    ).lean();
    return asset ? { ...asset, id: asset._id.toString() } : undefined;
  }

  async deleteAsset(assetId: string): Promise<void> {
    await AssetModel.findByIdAndDelete(assetId);
  }

  // Well-being alert operations
  async createWellBeingAlert(alertData: InsertWellBeingAlert): Promise<WellBeingAlert> {
    const user = await UserModel.findOne({ id: alertData.userId });
    if (!user) throw new Error('User not found');
    
    const alert = new WellBeingAlertModel({
      ...alertData,
      userId: user._id
    });
    await alert.save();
    return alert.toObject();
  }

  async getUserWellBeingAlerts(userId: string): Promise<WellBeingAlert[]> {
    const user = await UserModel.findOne({ id: userId });
    if (!user) return [];
    
    const alerts = await WellBeingAlertModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();
    return alerts;
  }

  async resolveWellBeingAlert(alertId: string): Promise<void> {
    await WellBeingAlertModel.findByIdAndUpdate(alertId, {
      isResolved: true,
      resolvedAt: new Date()
    });
  }

  // Admin action operations
  async createAdminAction(actionData: InsertAdminAction): Promise<AdminAction> {
    const adminAction = new AdminActionModel(actionData);
    await adminAction.save();
    return adminAction.toObject();
  }

  async getAdminActions(): Promise<AdminAction[]> {
    const actions = await AdminActionModel.find()
      .populate('adminUserId', 'fullName email')
      .populate('targetUserId', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();
    return actions;
  }

  async updateAdminAction(actionId: string, actionData: Partial<AdminAction>): Promise<AdminAction | undefined> {
    const action = await AdminActionModel.findByIdAndUpdate(
      actionId,
      actionData,
      { new: true }
    ).lean();
    return action || undefined;
  }

  // Activity log operations
  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLog> {
    const activityLog = new ActivityLogModel(logData);
    await activityLog.save();
    return activityLog.toObject();
  }

  async getActivityLogs(filters = {}): Promise<ActivityLog[]> {
    const logs = await ActivityLogModel.find(filters)
      .populate('userId', 'fullName email')
      .populate('adminId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return logs;
  }

  // Risk assessment operations
  async createUserRiskAssessment(assessmentData: InsertUserRiskAssessment): Promise<UserRiskAssessment> {
    const user = await UserModel.findOne({ id: assessmentData.userId });
    if (!user) throw new Error('User not found');
    
    const assessment = new UserRiskAssessmentModel({
      ...assessmentData,
      userId: user._id
    });
    await assessment.save();
    return assessment.toObject();
  }

  async getUserRiskAssessments(userId: string): Promise<UserRiskAssessment[]> {
    const user = await UserModel.findOne({ id: userId });
    if (!user) return [];
    
    const assessments = await UserRiskAssessmentModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();
    return assessments;
  }

  async updateUserRiskAssessment(assessmentId: string, assessmentData: Partial<UserRiskAssessment>): Promise<UserRiskAssessment | undefined> {
    const assessment = await UserRiskAssessmentModel.findByIdAndUpdate(
      assessmentId,
      assessmentData,
      { new: true }
    ).lean();
    return assessment || undefined;
  }

  // Helper method to transform MongoDB user to match expected interface
  private transformUser(user: any): User {
    return {
      ...user,
      id: user.id || user._id.toString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const storage = new MongoDBStorage();