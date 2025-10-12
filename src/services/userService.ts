import prisma from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import { User } from '@/types';

export interface CreateUserRequest {
  email: string;
  password: string;
  username: string;
  characterName: string;
}

export class UserService {
  async createUser(data: CreateUserRequest): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    return await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        username: data.username,
        characterName: data.characterName,
        stats: {
          strength: 5,
          wisdom: 5,
          agility: 5,
          endurance: 5,
          luck: 5,
        },
        preferences: {
          storyGenre: 'fantasy',
          difficulty: 'medium',
          notifications: true,
          theme: 'light',
        },
      },
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        tasks: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        inventory: {
          orderBy: { obtainedAt: 'desc' },
        },
        storyProgressions: {
          orderBy: { lastUpdated: 'desc' },
        },
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { username },
    });
  }

  async updateUserStats(userId: string, stats: Record<string, number>): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { stats },
    });
  }

  async updateUserLevel(userId: string, level: number, xp: number): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { level, xp },
    });
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async getAllUsers(): Promise<Partial<User>[]> {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        characterName: true,
        level: true,
        xp: true,
        createdAt: true,
        // Exclude password field for security
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    averageLevel: number;
    totalXP: number;
  }> {
    const users = await prisma.user.findMany({
      select: { level: true, xp: true },
    });

    const totalUsers = users.length;
    const averageLevel = totalUsers > 0 
      ? users.reduce((sum, user) => sum + user.level, 0) / totalUsers 
      : 0;
    const totalXP = users.reduce((sum, user) => sum + user.xp, 0);

    return {
      totalUsers,
      averageLevel: Math.round(averageLevel * 100) / 100,
      totalXP,
    };
  }
}