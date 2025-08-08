import mongoose, { Schema, Document } from 'mongoose';

// User interface and schema
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  fullName?: string;
  dateOfBirth?: Date;
  mobileNumber?: string;
  countryCode: string;
  address?: string;
  passwordHash?: string;
  isActive: boolean;
  wellBeingFrequency: string;
  lastWellBeingCheck?: Date;
  wellBeingCounter: number;
  maxWellBeingLimit: number;
  alertFrequency: string;
  customDays?: number;
  alertTime: string;
  enableSMS: boolean;
  enableEmail: boolean;
  escalationEnabled: boolean;
  isAdmin: boolean;
  accountStatus: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  profileImageUrl: String,
  fullName: String,
  dateOfBirth: Date,
  mobileNumber: String,
  countryCode: { type: String, default: '+91' },
  address: String,
  passwordHash: String,
  isActive: { type: Boolean, default: true },
  wellBeingFrequency: { type: String, default: 'daily' },
  lastWellBeingCheck: Date,
  wellBeingCounter: { type: Number, default: 0 },
  maxWellBeingLimit: { type: Number, default: 15 },
  alertFrequency: { type: String, default: 'daily' },
  customDays: Number,
  alertTime: { type: String, default: '09:00' },
  enableSMS: { type: Boolean, default: true },
  enableEmail: { type: Boolean, default: true },
  escalationEnabled: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  accountStatus: { type: String, default: 'active' },
  lastLoginAt: Date,
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

// Session interface and schema (for Replit Auth)
export interface ISession extends Document {
  sid: string;
  sess: any;
  expire: Date;
}

const sessionSchema = new Schema<ISession>({
  sid: { type: String, primary: true, unique: true },
  sess: { type: Schema.Types.Mixed, required: true },
  expire: { type: Date, required: true, index: true },
});

export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', sessionSchema);

// Mood Entry interface and schema
export interface IMoodEntry extends Document {
  userId: mongoose.Types.ObjectId;
  mood: string;
  emoji: string;
  notes?: string;
  createdAt: Date;
}

const moodEntrySchema = new Schema<IMoodEntry>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, required: true },
  emoji: { type: String, required: true },
  notes: String,
}, {
  timestamps: true,
});

export const MoodEntry = mongoose.models.MoodEntry || mongoose.model<IMoodEntry>('MoodEntry', moodEntrySchema);

// Nominee interface and schema
export interface INominee extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  relationship: string;
  mobileNumber: string;
  email?: string;
  isVerified: boolean;
  createdAt: Date;
}

const nomineeSchema = new Schema<INominee>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  relationship: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: String,
  isVerified: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export const Nominee = mongoose.models.Nominee || mongoose.model<INominee>('Nominee', nomineeSchema);

// Asset interface and schema
export interface IAsset extends Document {
  userId: mongoose.Types.ObjectId;
  assetType: string;
  title: string;
  description?: string;
  value?: string;
  currency: string;
  contactInfo?: string;
  storageLocation: string;
  accessInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assetType: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  value: String,
  currency: { type: String, default: 'USD' },
  contactInfo: String,
  storageLocation: { type: String, default: 'local' },
  accessInstructions: String,
}, {
  timestamps: true,
});

export const Asset = mongoose.models.Asset || mongoose.model<IAsset>('Asset', assetSchema);

// Well-being Alert interface and schema
export interface IWellBeingAlert extends Document {
  userId: mongoose.Types.ObjectId;
  alertType: string;
  message: string;
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
}

const wellBeingAlertSchema = new Schema<IWellBeingAlert>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  alertType: { type: String, required: true },
  message: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  resolvedAt: Date,
}, {
  timestamps: true,
});

export const WellBeingAlert = mongoose.models.WellBeingAlert || mongoose.model<IWellBeingAlert>('WellBeingAlert', wellBeingAlertSchema);

// Admin Action interface and schema
export interface IAdminAction extends Document {
  adminUserId: mongoose.Types.ObjectId;
  targetUserId?: mongoose.Types.ObjectId;
  actionType: string;
  description: string;
  status: string;
  completedAt?: Date;
  createdAt: Date;
}

const adminActionSchema = new Schema<IAdminAction>({
  adminUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  actionType: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'pending' },
  completedAt: Date,
}, {
  timestamps: true,
});

export const AdminAction = mongoose.models.AdminAction || mongoose.model<IAdminAction>('AdminAction', adminActionSchema);

// Activity Log interface and schema
export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId;
  action: string;
  category: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  severity: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  adminId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  metadata: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  severity: { type: String, default: 'info' },
}, {
  timestamps: true,
});

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

// User Risk Assessment interface and schema
export interface IUserRiskAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  riskLevel: string;
  riskFactors: string[];
  assessmentReason: string;
  assessedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userRiskAssessmentSchema = new Schema<IUserRiskAssessment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  riskLevel: { type: String, required: true },
  riskFactors: [String],
  assessmentReason: { type: String, required: true },
  assessedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

export const UserRiskAssessment = mongoose.models.UserRiskAssessment || mongoose.model<IUserRiskAssessment>('UserRiskAssessment', userRiskAssessmentSchema);

// Admin Log interface and schema
export interface IAdminLog extends Document {
  adminUserId: mongoose.Types.ObjectId;
  action: string;
  targetUserId?: mongoose.Types.ObjectId;
  details?: string;
  createdAt: Date;
}

const adminLogSchema = new Schema<IAdminLog>({
  adminUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  details: String,
}, {
  timestamps: true,
});

export const AdminLog = mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', adminLogSchema);

// Type definitions for compatibility with existing code
export type User = IUser;
export type UpsertUser = Partial<IUser>;
export type InsertUser = Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>;
export type MoodEntry = IMoodEntry;
export type InsertMoodEntry = Omit<IMoodEntry, '_id' | 'createdAt'>;
export type Nominee = INominee;
export type InsertNominee = Omit<INominee, '_id' | 'createdAt'>;
export type Asset = IAsset;
export type InsertAsset = Omit<IAsset, '_id' | 'createdAt' | 'updatedAt'>;
export type WellBeingAlert = IWellBeingAlert;
export type InsertWellBeingAlert = Omit<IWellBeingAlert, '_id' | 'createdAt'>;
export type AdminAction = IAdminAction;
export type InsertAdminAction = Omit<IAdminAction, '_id' | 'createdAt' | 'completedAt'>;
export type ActivityLog = IActivityLog;
export type InsertActivityLog = Omit<IActivityLog, '_id' | 'createdAt'>;
export type UserRiskAssessment = IUserRiskAssessment;
export type InsertUserRiskAssessment = Omit<IUserRiskAssessment, '_id' | 'createdAt' | 'updatedAt'>;
export type AdminLog = IAdminLog;
export type InsertAdminLog = Omit<IAdminLog, '_id' | 'createdAt'>;