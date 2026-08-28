import { db } from '../../db/connection.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function login(email: string, password: string) {
  const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (userList.length === 0) throw new Error('Invalid credentials');
  
  const user = userList[0];
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');
  
  return user;
}

export async function getCurrentUser(userId: string) {
  const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userList.length === 0) throw new Error('User not found');
  return userList[0];
}
