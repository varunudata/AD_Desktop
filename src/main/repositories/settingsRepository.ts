import { getPrisma } from '../database/prisma';
import { DEFAULT_SETTINGS } from '../../shared/constants/defaults';

export const settingsRepository = {
  async getAll(): Promise<Record<string, string>> {
    const prisma = getPrisma();
    const rows = await prisma.setting.findMany();
    const map: Record<string, string> = { ...DEFAULT_SETTINGS };

    for (const r of rows) {
      map[r.key] = r.value;
    }

    return map;
  },

  async get(key: string): Promise<string | null> {
    const prisma = getPrisma();
    const row = await prisma.setting.findUnique({ where: { key } });
    if (row) return row.value;
    return DEFAULT_SETTINGS[key] ?? null;
  },

  async set(key: string, value: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  },

  async setMany(settings: Record<string, string>): Promise<Record<string, string>> {
    const prisma = getPrisma();
    await prisma.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(settings)) {
        await tx.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    });

    return this.getAll();
  },
};
