import bcrypt from 'bcryptjs';
import { db } from './db';
import { users, adminUsers, companies, type User, type AdminUser, type Company } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId?: number;
  company?: Company;
}

export interface AdminAuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: true;
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async authenticateUser(email: string, password: string): Promise<AuthUser | null> {
    const [user] = await db
      .select()
      .from(users)
      .leftJoin(companies, eq(users.companyId, companies.id))
      .where(eq(users.email, email));

    if (!user || !user.users.isActive) {
      return null;
    }

    const isValid = await this.verifyPassword(password, user.users.password);
    if (!isValid) {
      return null;
    }

    return {
      id: user.users.id,
      email: user.users.email,
      firstName: user.users.firstName,
      lastName: user.users.lastName,
      role: user.users.role,
      companyId: user.users.companyId,
      company: user.companies || undefined,
    };
  }

  async authenticateAdmin(email: string, password: string): Promise<AdminAuthUser | null> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email));

    if (!admin) {
      return null;
    }

    const isValid = await this.verifyPassword(password, admin.password);
    if (!isValid) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      isAdmin: true,
    };
  }

  async createAdminUser(email: string, password: string, firstName: string, lastName: string): Promise<AdminAuthUser> {
    const hashedPassword = await this.hashPassword(password);
    
    const [admin] = await db
      .insert(adminUsers)
      .values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      })
      .returning();

    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      isAdmin: true,
    };
  }

  async createUser(companyId: number, email: string, password: string, firstName: string, lastName: string, role: string = 'user'): Promise<AuthUser> {
    const hashedPassword = await this.hashPassword(password);
    
    const [user] = await db
      .insert(users)
      .values({
        companyId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      })
      .returning();

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId));

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      company: company || undefined,
    };
  }
}

export const authService = new AuthService();