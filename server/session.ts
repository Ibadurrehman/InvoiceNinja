import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { type AuthUser, type AdminAuthUser } from './auth';

declare module 'express-session' {
  interface SessionData {
    user?: AuthUser;
    admin?: AdminAuthUser;
  }
}

export function createSessionStore() {
  const PgSession = connectPg(session);
  return new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: 'session',
  });
}

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  store: createSessionStore(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

export function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

export function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.admin) {
    return res.status(401).json({ message: 'Admin authentication required' });
  }
  next();
}

export function requireCompanyAccess(req: any, res: any, next: any) {
  if (!req.session?.user?.companyId) {
    return res.status(403).json({ message: 'Company access required' });
  }
  req.companyId = req.session.user.companyId;
  next();
}