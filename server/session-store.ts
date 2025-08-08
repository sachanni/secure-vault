import session from 'express-session';
import { Session } from '@shared/mongodb-schema';

// Custom MongoDB session store for express-session
export class MongoDBSessionStore extends session.Store {
  constructor() {
    super();
  }

  async get(sid: string, callback: (err?: any, session?: session.SessionData | null) => void) {
    try {
      const sessionDoc = await Session.findOne({ sid }).lean();
      if (sessionDoc && sessionDoc.expire > new Date()) {
        callback(null, sessionDoc.sess);
      } else {
        callback(null, null);
      }
    } catch (error) {
      callback(error);
    }
  }

  async set(sid: string, session: session.SessionData, callback?: (err?: any) => void) {
    try {
      const expire = new Date(Date.now() + (session.cookie?.maxAge || 1000 * 60 * 60 * 24));
      
      await Session.findOneAndUpdate(
        { sid },
        { sid, sess: session, expire },
        { upsert: true, new: true }
      );
      
      if (callback) callback();
    } catch (error) {
      if (callback) callback(error);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await Session.findOneAndDelete({ sid });
      if (callback) callback();
    } catch (error) {
      if (callback) callback(error);
    }
  }

  async touch(sid: string, session: session.SessionData, callback?: (err?: any) => void) {
    try {
      const expire = new Date(Date.now() + (session.cookie?.maxAge || 1000 * 60 * 60 * 24));
      await Session.findOneAndUpdate({ sid }, { expire });
      if (callback) callback();
    } catch (error) {
      if (callback) callback(error);
    }
  }
}