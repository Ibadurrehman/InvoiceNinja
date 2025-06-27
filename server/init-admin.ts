import { authService } from './auth';
import { db } from './db';
import { adminUsers } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function initializeAdmin() {
  try {
    // Check if any admin users exist
    const [existingAdmin] = await db.select().from(adminUsers).limit(1);
    
    if (!existingAdmin) {
      // Create default admin user
      await authService.createAdminUser(
        'admin@billtracker.com',
        'password123',
        'Admin',
        'User'
      );
      console.log('Default admin user created: admin@billtracker.com / password123');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}