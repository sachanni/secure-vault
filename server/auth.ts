import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../shared/models';

// JWT Secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}

export class AuthService {
  // Generate access token
  static generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      type: 'access'
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'posthumous-notification-app',
      audience: 'app-users'
    });
  }

  // Generate refresh token
  static generateRefreshToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      type: 'refresh'
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'posthumous-notification-app',
      audience: 'app-users'
    });
  }

  // Generate both tokens
  static generateTokens(user: IUser) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  // Verify access token
  static verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'posthumous-notification-app',
        audience: 'app-users'
      }) as TokenPayload;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'posthumous-notification-app',
        audience: 'app-users'
      }) as TokenPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Extract token from request headers
  static extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return null;
    }

    // Support both "Bearer token" and "token" formats
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    return token;
  }
}

// Middleware to authenticate requests
export const authenticateToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const token = AuthService.extractTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    const decoded = AuthService.verifyAccessToken(token);
    req.userId = decoded.userId;

    // Optional: Fetch user from database and attach to request
    // const user = await getUserById(decoded.userId);
    // req.user = user;

    next();
  } catch (error) {
    console.error('Token authentication error:', error);
    
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware for optional authentication (doesn't fail if no token)
export const optionalAuthentication = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const token = AuthService.extractTokenFromHeader(req);

    if (token) {
      const decoded = AuthService.verifyAccessToken(token);
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

// Admin middleware (requires authentication + admin role)
export const requireAdmin = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const token = AuthService.extractTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    const decoded = AuthService.verifyAccessToken(token);
    
    // Check if user is admin (you can implement admin role logic here)
    if (decoded.email !== 'admin@aulnovatechsoft.com') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};