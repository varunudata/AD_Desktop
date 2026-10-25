import { getPrisma, checkDatabaseHealth } from '../database/prisma';
import { seedDatabase } from '../../../prisma/seed';
import { DatabaseHealthStatus } from '../../shared/types/models';
import { AppError } from '../utils/errors';

export const databaseService = {
  async checkHealth(): Promise<DatabaseHealthStatus> {
    return checkDatabaseHealth();
  },

  async seedDemoData(): Promise<{ success: boolean; message: string }> {
    const health = await checkDatabaseHealth();
    if (!health.connected) {
      throw new AppError(
        'DATABASE_UNAVAILABLE',
        health.error || 'Cannot connect to PostgreSQL. Please check your DATABASE_URL in .env.'
      );
    }

    await seedDatabase();
    return {
      success: true,
      message: 'Demo academic dataset seeded successfully into PostgreSQL.',
    };
  },

  async clearWorkspace(): Promise<{ success: boolean; message: string }> {
    const prisma = getPrisma();
    await prisma.$transaction(async (tx) => {
      await tx.schedule.deleteMany({});
      await tx.subject.deleteMany({});
      await tx.faculty.deleteMany({});
      await tx.classroom.deleteMany({});
    });

    return {
      success: true,
      message: 'All classrooms, faculty, subjects, and schedules have been cleared.',
    };
  },
};
