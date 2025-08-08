import session from "express-session";
import type { Express, RequestHandler } from "express";
import { MongoDBSessionStore } from "./session-store";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const sessionStore = new MongoDBSessionStore();
  
  // Generate a secure session secret if not provided
  const sessionSecret = process.env.SESSION_SECRET || 
    'fallback-dev-secret-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    name: 'connect.sid',
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
      sameSite: 'lax',
      path: '/',
      domain: undefined,
    },
  });
}

export async function setupAuth(app: Express): Promise<void> {
  // Setup session middleware
  app.use(getSession());
}

// Simple auth middleware for local development
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session?.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};