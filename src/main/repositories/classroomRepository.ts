import { getPrisma } from '../database/prisma';
import { Classroom } from '../../shared/types/models';
import { ClassroomFilter } from '../../shared/types/ipc';
import { CreateClassroomInput, UpdateClassroomInput } from '../../shared/types/api';

function formatClassroom(row: any): Classroom {
  let equipment: string[] = [];
  try {
    equipment = JSON.parse(row.equipment || '[]');
  } catch {
    equipment = [];
  }

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    building: row.building,
    capacity: row.capacity,
    roomType: row.roomType,
    equipment,
    isActive: row.isActive,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const classroomRepository = {
  async list(filters?: ClassroomFilter): Promise<Classroom[]> {
    const prisma = getPrisma();
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.building) {
      where.building = { contains: filters.building, mode: 'insensitive' };
    }

    if (filters?.roomType) {
      where.roomType = filters.roomType;
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.trim();
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { building: { contains: q, mode: 'insensitive' } },
      ];
    }

    const rows = await prisma.classroom.findMany({
      where,
      orderBy: [{ building: 'asc' }, { code: 'asc' }],
    });

    return rows.map(formatClassroom);
  },

  async getById(id: string): Promise<Classroom | null> {
    const prisma = getPrisma();
    const row = await prisma.classroom.findUnique({ where: { id } });
    return row ? formatClassroom(row) : null;
  },

  async getByCode(code: string): Promise<Classroom | null> {
    const prisma = getPrisma();
    const row = await prisma.classroom.findUnique({ where: { code } });
    return row ? formatClassroom(row) : null;
  },

  async create(input: CreateClassroomInput): Promise<Classroom> {
    const prisma = getPrisma();
    const row = await prisma.classroom.create({
      data: {
        code: input.code.trim().toUpperCase(),
        name: input.name.trim(),
        building: input.building.trim(),
        capacity: Number(input.capacity),
        roomType: input.roomType,
        equipment: JSON.stringify(input.equipment || []),
        isActive: input.isActive ?? true,
        notes: input.notes?.trim() || null,
      },
    });
    return formatClassroom(row);
  },

  async update(id: string, input: UpdateClassroomInput): Promise<Classroom> {
    const prisma = getPrisma();
    const data: any = {};

    if (input.code !== undefined) data.code = input.code.trim().toUpperCase();
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.building !== undefined) data.building = input.building.trim();
    if (input.capacity !== undefined) data.capacity = Number(input.capacity);
    if (input.roomType !== undefined) data.roomType = input.roomType;
    if (input.equipment !== undefined) data.equipment = JSON.stringify(input.equipment);
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;

    const row = await prisma.classroom.update({
      where: { id },
      data,
    });
    return formatClassroom(row);
  },

  async countSchedules(classroomId: string): Promise<number> {
    const prisma = getPrisma();
    return prisma.schedule.count({
      where: { classroomId },
    });
  },

  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const prisma = getPrisma();
    await prisma.classroom.delete({
      where: { id },
    });
    return { deleted: true, id };
  },
};
