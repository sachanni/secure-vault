import mongoose, { Schema, Document } from 'mongoose';

// User Document Interface
export interface IUser extends Document {
  fullName: string;
  dateOfBirth: Date;
  mobileNumber: string;
  countryCode: string;
  address: string;
  email: string;
  password: string;
  provider?: string; // 'local', 'google', 'apple'
  providerId?: string; // OAuth provider ID
  isVerified: boolean;
  // Well-being settings
  alertFrequency?: 'daily' | 'weekly' | 'custom';
  customDays?: number;
  alertTime?: string;
  enableSMS?: boolean;
  enableEmail?: boolean;
  maxWellBeingLimit?: number;
  escalationEnabled?: boolean;
  lastWellBeingCheck?: Date;
  wellBeingCounter?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Asset Document Interface
export interface IAsset extends Document {
  userId: mongoose.Types.ObjectId;
  assetType: string;
  title: string;
  description: string;
  value: string;
  currency: string;
  contactInfo: string;
  storageLocation: string;
  accessInstructions: string;
  createdAt: Date;
  updatedAt: Date;
}

// Nominee Document Interface
export interface INominee extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  relationship: string;
  mobileNumber: string;
  email?: string;
  isVerified: boolean;
  verificationCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Well Being Alert Document Interface
export interface IWellBeingAlert extends Document {
  userId: mongoose.Types.ObjectId;
  alertFrequency: 'daily' | 'weekly' | 'custom';
  customDays?: number;
  alertTime: string;
  enableSMS: boolean;
  enableEmail: boolean;
  maxMissedAlerts: number;
  escalationEnabled: boolean;
  currentCount: number;
  lastResponse?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Action Document Interface
export interface IAdminAction extends Document {
  userId: mongoose.Types.ObjectId;
  actionType: 'death_verification' | 'notification_approved' | 'account_suspended';
  adminId: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Mood Entry Document Interface
export interface IMoodEntry extends Document {
  userId: mongoose.Types.ObjectId;
  mood: string;
  intensity: number;
  notes?: string;
  context?: string;
  createdAt: Date;
}

// Activity Log Document Interface
export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId;
  adminId?: string;
  category: 'user' | 'admin' | 'system' | 'security';
  action: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, any>;
  createdAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  mobileNumber: { type: String, required: true, unique: true },
  countryCode: { type: String, required: true, default: '+91' },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for OAuth users
  provider: { type: String, default: 'local' }, // 'local', 'google', 'apple'
  providerId: { type: String }, // OAuth provider ID
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Asset Schema
const AssetSchema = new Schema<IAsset>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assetType: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  value: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  contactInfo: { type: String, required: true },
  storageLocation: { type: String, required: true },
  accessInstructions: { type: String, required: true }
}, {
  timestamps: true
});

// Nominee Schema
const NomineeSchema = new Schema<INominee>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  relationship: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String }
}, {
  timestamps: true
});

// Well Being Alert Schema
const WellBeingAlertSchema = new Schema<IWellBeingAlert>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  alertFrequency: { type: String, enum: ['daily', 'weekly', 'custom'], required: true },
  customDays: { type: Number, min: 1, max: 30 },
  alertTime: { type: String, required: true },
  enableSMS: { type: Boolean, default: true },
  enableEmail: { type: Boolean, default: true },
  maxMissedAlerts: { type: Number, min: 1, max: 50, required: true },
  escalationEnabled: { type: Boolean, default: true },
  currentCount: { type: Number, default: 0 },
  lastResponse: { type: Date },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Admin Action Schema
const AdminActionSchema = new Schema<IAdminAction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { 
    type: String, 
    enum: ['death_verification', 'notification_approved', 'account_suspended'],
    required: true 
  },
  adminId: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
}, {
  timestamps: true
});

// Mood Entry Schema
const MoodEntrySchema = new Schema<IMoodEntry>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, required: true },
  intensity: { type: Number, min: 1, max: 10, required: true },
  notes: { type: String },
  context: { type: String }
}, {
  timestamps: true
});

// Activity Log Schema
const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  adminId: { type: String },
  category: { type: String, enum: ['user', 'admin', 'system', 'security'], required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['info', 'warning', 'error', 'critical'], default: 'info' },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Export Models
export const User = mongoose.model<IUser>('User', UserSchema);
export const Asset = mongoose.model<IAsset>('Asset', AssetSchema);
export const Nominee = mongoose.model<INominee>('Nominee', NomineeSchema);
export const WellBeingAlert = mongoose.model<IWellBeingAlert>('WellBeingAlert', WellBeingAlertSchema);
export const AdminAction = mongoose.model<IAdminAction>('AdminAction', AdminActionSchema);
export const MoodEntry = mongoose.model<IMoodEntry>('MoodEntry', MoodEntrySchema);
export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

// Export Types for use in other files
export type UserType = IUser;
export type AssetType = IAsset;
export type NomineeType = INominee;
export type WellBeingAlertType = IWellBeingAlert;
export type AdminActionType = IAdminAction;
export type MoodEntryType = IMoodEntry;
export type ActivityLogType = IActivityLog;